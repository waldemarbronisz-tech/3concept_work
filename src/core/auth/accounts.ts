import { randomInt } from "node:crypto";
import { auth, USERNAME_PATTERN } from "./auth";

/**
 * Operacje na kontach wykonywane przez serwer (seed, admin). Nie są endpointami —
 * autoryzację (kto może) dołoży `authorize()` z iteracji 4, ślad w audit logu iteracja 5.
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
}

/** Zakłada konto z hasłem tymczasowym; użytkownik zmienia je przy pierwszym logowaniu. */
export async function createAccount(input: CreateAccountInput) {
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

  return { userId: user.id, username, temporaryPassword };
}

/**
 * Reset hasła przez admina/kierownika (D2): nowe hasło tymczasowe, wymuszona zmiana,
 * wylogowanie ze wszystkich urządzeń.
 */
export async function resetPassword(userId: string) {
  const temporaryPassword = generateTemporaryPassword();
  const ctx = await auth.$context;

  const user = await ctx.internalAdapter.findUserById(userId);
  if (!user) throw new Error("Nie ma takiego konta.");

  await ctx.internalAdapter.updatePassword(userId, await ctx.password.hash(temporaryPassword));
  await ctx.internalAdapter.updateUser(userId, { mustChangePassword: true });
  await ctx.internalAdapter.deleteUserSessions(userId);

  return { temporaryPassword };
}
