import { randomInt } from "node:crypto";
import { db } from "@/core/db";
import {
  authorize,
  canResetPassword,
  ForbiddenError,
  roles,
  type AuthorizationActor,
  type Role,
} from "@/core/rbac";
import { loadGrants, loadUserSiteIds } from "@/core/rbac/grants";
import { auth, USERNAME_PATTERN } from "./auth";

/**
 * Operacje na kontach wykonywane przez serwer (seed, admin). Nie są endpointami —
 * każda zaczyna się od autoryzacji aktora; ślad w audit logu dojdzie w iteracji 5.
 */

/** Better Auth wymaga e-maila; D2 mówi „bez e-maila” — adres jest syntetyczny i nigdzie nie widoczny. */
export const syntheticEmail = (username: string) => `${username}@konto.3concept.local`;

const TEMP_PASSWORD_ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789"; // bez 0/O, 1/l/i

/** Hasło tymczasowe do przekazania pracownikowi, np. „k7m2-xq9p-3rtw”. */
export function generateTemporaryPassword(): string {
  const block = () =>
    Array.from(
      { length: 4 },
      () => TEMP_PASSWORD_ALPHABET[randomInt(TEMP_PASSWORD_ALPHABET.length)],
    ).join("");
  return `${block()}-${block()}-${block()}`;
}

export interface CreateAccountInput {
  username: string;
  name: string;
  /** Hasło tymczasowe; brak = wygenerowane. */
  temporaryPassword?: string;
  /** Role nadawane od razu; budowa tylko dla ról z zakresem budowy. */
  roles?: Array<{ role: Role; siteId?: string | null }>;
}

/** Zakłada konto z hasłem tymczasowym; użytkownik zmienia je przy pierwszym logowaniu. */
export async function createAccount(actor: AuthorizationActor, input: CreateAccountInput) {
  authorize(actor, "accounts.manage");
  const username = input.username.trim().toLowerCase();
  if (!USERNAME_PATTERN.test(username)) {
    throw new Error(`Nieprawidłowy login: „${input.username}”.`);
  }
  const temporaryPassword = input.temporaryPassword ?? generateTemporaryPassword();
  const ctx = await auth.$context;

  const user = await ctx.internalAdapter.createUser(
    {
      name: input.name,
      email: syntheticEmail(username),
      emailVerified: false,
      username,
      displayUsername: username,
      mustChangePassword: true,
      isActive: true,
    },
    { method: "admin" },
  );
  await ctx.internalAdapter.linkAccount({
    userId: user.id,
    providerId: "credential",
    accountId: user.id,
    password: await ctx.password.hash(temporaryPassword),
  });
  if (input.roles?.length) {
    await db.roleAssignment.createMany({
      data: input.roles.map((r) => ({ userId: user.id, role: r.role, siteId: r.siteId ?? null })),
    });
  }

  return { userId: user.id, username, temporaryPassword };
}

/**
 * Reset hasła przez admina/kierownika (D2): nowe hasło tymczasowe, wymuszona zmiana,
 * wylogowanie ze wszystkich urządzeń. Kierownik tylko w zakresie z przypisu ¹ macierzy.
 */
export async function resetPassword(actor: AuthorizationActor, userId: string) {
  const ctx = await auth.$context;
  const user = await ctx.internalAdapter.findUserById(userId);
  if (!user) throw new Error("Nie ma takiego konta.");

  const targetGrants = await loadGrants(userId);
  const target = {
    userId,
    roles: roles({ userId, grants: targetGrants }),
    siteIds: await loadUserSiteIds(userId),
  };
  if (!canResetPassword(actor, target)) throw new ForbiddenError("accounts.resetPassword");

  const temporaryPassword = generateTemporaryPassword();

  await ctx.internalAdapter.updatePassword(userId, await ctx.password.hash(temporaryPassword));
  await ctx.internalAdapter.updateUser(userId, { mustChangePassword: true });
  await ctx.internalAdapter.deleteUserSessions(userId);

  return { temporaryPassword };
}
