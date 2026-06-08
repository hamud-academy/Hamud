/**
 * Runs once when the Node server starts (not per-request).
 * Warns if production env is misconfigured — fix in your host dashboard.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  // Skip during `next build` (NODE_ENV=production but env may still be local).
  if (process.env.NEXT_PHASE === "phase-production-build") return;

  if (process.env.NODE_ENV === "production") {
    const { assertProductionEnv } = await import("@/lib/env-server");
    assertProductionEnv();
  }

  const { syncAdminAccountFromEnv, getAdminEmail } = await import("@/lib/admin-env");
  const { logPersistentStorageStatus } = await import("@/lib/persistent-storage");
  logPersistentStorageStatus();
  try {
    const result = await syncAdminAccountFromEnv();
    if (
      result.reason === "password updated" ||
      result.reason === "admin created" ||
      result.reason === "admin migrated"
    ) {
      console.log(`[Admin] Account synced from .env for ${getAdminEmail()} (${result.reason}).`);
    } else if (result.reason === "custom password kept") {
      console.log(`[Admin] Using admin password from database (${getAdminEmail()}). Set ADMIN_FORCE_PASSWORD_RESET=true to reset from .env.`);
    } else if (result.reason === "weak password") {
      console.error("[Admin] ADMIN_PASSWORD in .env is too weak. Admin password was not updated.");
    }
  } catch (error) {
    console.error("[Admin] Failed to sync admin account from .env:", error);
  }
}
