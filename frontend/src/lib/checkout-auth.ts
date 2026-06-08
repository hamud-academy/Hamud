import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { isStrongPassword, strongPasswordMessage } from "@/lib/password-strength";

export type CheckoutCredentials = {
  userId: string | null;
  passwordHash: string | null;
};

export async function resolveCheckoutCredentials(
  email: string,
  password?: string
): Promise<CheckoutCredentials> {
  const session = await auth();
  const sessionUserId = (session?.user as { id?: string } | undefined)?.id;
  const sessionRole = (session?.user as { role?: string } | undefined)?.role;

  if (sessionUserId && sessionRole === "STUDENT") {
    const user = await prisma.user.findUnique({
      where: { id: sessionUserId },
      select: { id: true },
    });

    if (user) {
      return { userId: user.id, passwordHash: null };
    }
  }

  if (!password || !isStrongPassword(password)) {
    throw new Error(strongPasswordMessage());
  }

  return { userId: null, passwordHash: await bcrypt.hash(password, 12) };
}
