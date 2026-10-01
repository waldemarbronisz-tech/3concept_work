import { betterAuth } from "better-auth";
import { APIError } from "better-auth/api";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { username } from "better-auth/plugins";
import { db } from "@/core/db";

/** Login: 3–30 znaków, małe litery, cyfry, kropka, myślnik, podkreślenie. */
export const USERNAME_PATTERN = /^[a-z0-9][a-z0-9._-]{2,29}$/;

/**
 * Better Auth: logowanie loginem i hasłem (D2), sesje w bazie, bez e-maili.
 * Rejestracja publiczna jest wyłączona — konta zakłada admin (core/auth/accounts.ts).
 */
export const auth = betterAuth({
  database: prismaAdapter(db, { provider: "postgresql" }),
  emailAndPassword: { enabled: true, disableSignUp: true, minPasswordLength: 8 },
  session: {
    expiresIn: 60 * 60 * 24 * 14, // 14 dni — telefon w terenie, bez codziennego logowania
    updateAge: 60 * 60 * 24,
  },
  user: {
    additionalFields: {
      /** Hasło tymczasowe od admina — do zmiany przy pierwszym logowaniu. */
      mustChangePassword: { type: "boolean", required: true, defaultValue: true, input: false },
      /** Zablokowane konto nie może się logować (pracownik zostaje w historii). */
      isActive: { type: "boolean", required: true, defaultValue: true, input: false },
    },
  },
  databaseHooks: {
    session: {
      create: {
        before: async (session) => {
          const user = await db.user.findUnique({
            where: { id: session.userId },
            select: { isActive: true },
          });
          if (!user?.isActive) {
            throw new APIError("FORBIDDEN", { message: "Konto jest zablokowane." });
          }
        },
      },
    },
  },
  plugins: [
    username({ minUsernameLength: 3, usernameValidator: (value) => USERNAME_PATTERN.test(value) }),
    nextCookies(),
  ],
});

export type Session = typeof auth.$Infer.Session;
export type SessionUser = Session["user"];
