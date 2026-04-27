import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { AuthError } from "@auth/core/errors";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, rateLimitKeyFromString, resetRateLimit } from "@/lib/rate-limit";

const signInSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password required"),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  pages: {
    signIn: "/login",
    signOut: "/logout",
  },
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        const parsed = signInSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        const rateLimitKey = rateLimitKeyFromString(`login:${email}`);
        const loginLimit = checkRateLimit(rateLimitKey, {
          limit: 8,
          windowMs: 15 * 60 * 1000,
        });
        if (!loginLimit.allowed) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.passwordHash) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;
        resetRateLimit(rateLimitKey);

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? undefined,
          image: user.image ?? undefined,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session.user && token.id) {
        (session.user as { id?: string }).id = token.id as string;
        (session.user as { role?: string }).role = token.role as string;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  trustHost: true,
  logger: {
    error(error) {
      // Invalid/expired session cookies are handled (cookie cleared); avoid console error overlay.
      if (error instanceof AuthError && error.type === "JWTSessionError") return;
      const red = "\x1b[31m";
      const reset = "\x1b[0m";
      const name = error instanceof AuthError ? error.type : error.name;
      console.error(`${red}[auth][error]${reset} ${name}: ${error.message}`);
      if (
        error.cause &&
        typeof error.cause === "object" &&
        "err" in error.cause &&
        (error.cause as { err?: unknown }).err instanceof Error
      ) {
        const { err, ...data } = error.cause as { err: Error; [k: string]: unknown };
        console.error(`${red}[auth][cause]${reset}:`, err.stack);
        if (Object.keys(data).length) console.error(`${red}[auth][details]${reset}:`, JSON.stringify(data, null, 2));
      } else if (error.stack) {
        console.error(error.stack.replace(/^.*/, "").substring(1));
      }
    },
  },
});
