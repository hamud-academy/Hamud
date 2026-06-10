import crypto from "crypto";
import bcrypt from "bcryptjs";
import { UserRole } from "@prisma/client";
import { getAppConfig, saveAppConfig } from "@/lib/app-config-store";
import { DEFAULT_ADMIN_EMAIL } from "@/lib/default-site";
import { isStrongPassword } from "@/lib/password-strength";
import { prisma } from "@/lib/prisma";

const LEGACY_ADMIN_EMAILS = ["admin@gmail.com"];
const ENV_PASSWORD_FINGERPRINT_KEY = "admin_env_password_fingerprint";

function isLegacyAdminEmail(email: string): boolean {
  return LEGACY_ADMIN_EMAILS.includes(email.trim().toLowerCase());
}

function envPasswordFingerprint(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

function timingSafeStringEqual(a: string, b: string): boolean {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

export function matchesAdminEnvCredentials(email: string, password: string): boolean {
  const envPassword = getAdminPasswordFromEnv();
  if (!envPassword || !isStrongPassword(envPassword)) return false;
  if (email.trim().toLowerCase() !== getAdminEmail()) return false;
  return timingSafeStringEqual(password, envPassword);
}

export function getAdminEmail(): string {
  return (process.env.ADMIN_EMAIL?.trim() || DEFAULT_ADMIN_EMAIL).toLowerCase();
}

export function getAdminPasswordFromEnv(): string | null {
  const password = process.env.ADMIN_PASSWORD?.trim();
  return password || null;
}

export function shouldForcePasswordResetFromEnv(): boolean {
  return process.env.ADMIN_FORCE_PASSWORD_RESET?.trim().toLowerCase() === "true";
}

export type AdminSyncResult = {
  synced: boolean;
  reason:
    | "not configured"
    | "weak password"
    | "already synced"
    | "password updated"
    | "admin created"
    | "admin migrated"
    | "custom password kept";
};

async function findPrimaryAdmin() {
  const targetEmail = getAdminEmail();
  const atTarget = await prisma.user.findUnique({ where: { email: targetEmail } });
  if (atTarget?.role === UserRole.ADMIN) return atTarget;

  for (const legacyEmail of LEGACY_ADMIN_EMAILS) {
    const legacy = await prisma.user.findUnique({ where: { email: legacyEmail } });
    if (legacy?.role === UserRole.ADMIN) return legacy;
  }

  return prisma.user.findFirst({
    where: { role: UserRole.ADMIN },
    orderBy: { createdAt: "asc" },
  });
}

async function migrateLegacyAdminEmail(targetEmail: string) {
  if (LEGACY_ADMIN_EMAILS.includes(targetEmail)) return null;

  const existingTarget = await prisma.user.findUnique({ where: { email: targetEmail } });
  if (existingTarget) return null;

  for (const legacyEmail of LEGACY_ADMIN_EMAILS) {
    const legacy = await prisma.user.findUnique({ where: { email: legacyEmail } });
    if (legacy?.role !== UserRole.ADMIN) continue;

    return prisma.user.update({
      where: { id: legacy.id },
      data: { email: targetEmail, role: UserRole.ADMIN },
    });
  }

  return null;
}

async function demoteDuplicateLegacyAdmins(targetEmail: string, keepUserId: string) {
  for (const legacyEmail of LEGACY_ADMIN_EMAILS) {
    if (legacyEmail === targetEmail) continue;
    const legacy = await prisma.user.findUnique({ where: { email: legacyEmail } });
    if (!legacy || legacy.id === keepUserId || legacy.role !== UserRole.ADMIN) continue;
    await prisma.user.update({
      where: { id: legacy.id },
      data: { role: UserRole.STUDENT },
    });
  }
}

/**
 * Keeps the primary admin aligned with ADMIN_EMAIL (+ optional ADMIN_PASSWORD) from .env / Vercel.
 * - Migrates legacy admin@gmail.com → ADMIN_EMAIL
 * - Updates password from env when ADMIN_PASSWORD is new/changed, on first setup, migration, or ADMIN_FORCE_PASSWORD_RESET=true
 * - Preserves email/password changed from the admin profile panel (except legacy migration)
 */
export async function syncAdminAccountFromEnv(): Promise<AdminSyncResult> {
  const targetEmail = getAdminEmail();
  const password = getAdminPasswordFromEnv();
  const forceReset = shouldForcePasswordResetFromEnv();

  const migrated = await migrateLegacyAdminEmail(targetEmail);
  if (migrated && migrated.email === targetEmail) {
    if (!password) {
      return { synced: true, reason: "admin migrated" };
    }
  }

  let admin =
    (await prisma.user.findUnique({ where: { email: targetEmail } })) ??
    migrated ??
    (await findPrimaryAdmin());

  if (!password) {
    if (
      admin &&
      admin.email !== targetEmail &&
      admin.role === UserRole.ADMIN &&
      isLegacyAdminEmail(admin.email)
    ) {
      admin = await prisma.user.update({
        where: { id: admin.id },
        data: { email: targetEmail, role: UserRole.ADMIN },
      });
      return { synced: true, reason: "admin migrated" };
    }
    return { synced: false, reason: "not configured" };
  }

  if (!isStrongPassword(password)) {
    console.error(
      "[Admin] ADMIN_PASSWORD must be at least 8 characters with uppercase, lowercase, number, and special character."
    );
    return { synced: false, reason: "weak password" };
  }

  if (admin && admin.email !== targetEmail && isLegacyAdminEmail(admin.email)) {
    const taken = await prisma.user.findUnique({ where: { email: targetEmail } });
    if (!taken) {
      admin = await prisma.user.update({
        where: { id: admin.id },
        data: { email: targetEmail, role: UserRole.ADMIN },
      });
    } else {
      admin = taken;
    }
  }

  const existing = admin ?? (await prisma.user.findUnique({ where: { email: targetEmail } }));
  const fingerprint = envPasswordFingerprint(password);
  const storedFingerprint = await getAppConfig<string>(ENV_PASSWORD_FINGERPRINT_KEY);
  const envPasswordChanged = !storedFingerprint || storedFingerprint !== fingerprint;

  if (existing?.passwordHash && (await bcrypt.compare(password, existing.passwordHash))) {
    const updateData: { role?: UserRole; email?: string } = {};
    if (existing.role !== UserRole.ADMIN) updateData.role = UserRole.ADMIN;
    if (existing.email !== targetEmail && isLegacyAdminEmail(existing.email)) {
      updateData.email = targetEmail;
    }
    if (Object.keys(updateData).length > 0) {
      await prisma.user.update({
        where: { id: existing.id },
        data: updateData,
      });
    }
    if (envPasswordChanged) {
      await saveAppConfig(ENV_PASSWORD_FINGERPRINT_KEY, fingerprint);
    }
    await demoteDuplicateLegacyAdmins(targetEmail, existing.id);
    return { synced: true, reason: "already synced" };
  }

  if (existing?.passwordHash && !forceReset && !envPasswordChanged) {
    await demoteDuplicateLegacyAdmins(targetEmail, existing.id);
    return { synced: true, reason: "custom password kept" };
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const saved = existing
    ? await prisma.user.update({
        where: { id: existing.id },
        data: {
          passwordHash,
          role: UserRole.ADMIN,
          name: existing.name ?? "Admin",
        },
      })
    : await prisma.user.create({
        data: {
          email: targetEmail,
          name: "Admin",
          passwordHash,
          role: UserRole.ADMIN,
        },
      });

  await demoteDuplicateLegacyAdmins(targetEmail, saved.id);
  await saveAppConfig(ENV_PASSWORD_FINGERPRINT_KEY, fingerprint);

  if (migrated) {
    return { synced: true, reason: "admin migrated" };
  }

  return { synced: true, reason: existing ? "password updated" : "admin created" };
}

export async function getPrimaryAdminEmail(): Promise<string> {
  const admin = await findPrimaryAdmin();
  return admin?.email ?? getAdminEmail();
}

/**
 * Ensures the env admin account exists and matches ADMIN_PASSWORD.
 * Used for env recovery login and startup sync.
 */
export async function ensureAdminAccountForEnvLogin() {
  const targetEmail = getAdminEmail();
  const password = getAdminPasswordFromEnv();
  if (!password || !isStrongPassword(password)) {
    throw new Error("ADMIN_EMAIL/ADMIN_PASSWORD are not configured correctly in environment variables.");
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const fingerprint = envPasswordFingerprint(password);
  const primaryAdmin = await findPrimaryAdmin();

  const saved = primaryAdmin
    ? await prisma.user.update({
        where: { id: primaryAdmin.id },
        data: { passwordHash, role: UserRole.ADMIN },
      })
    : await prisma.user.upsert({
        where: { email: targetEmail },
        create: {
          email: targetEmail,
          name: "Admin",
          passwordHash,
          role: UserRole.ADMIN,
        },
        update: {
          passwordHash,
          role: UserRole.ADMIN,
        },
      });

  await saveAppConfig(ENV_PASSWORD_FINGERPRINT_KEY, fingerprint);
  await demoteDuplicateLegacyAdmins(saved.email, saved.id);
  return saved;
}
