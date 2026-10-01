import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth, type SessionUser } from "./auth";

/** Zalogowany użytkownik. Role dojdą w iteracji 4 (RBAC). */
export type Actor = SessionUser;

/** Aktor z bieżącej sesji albo `null`. */
export async function getActor(): Promise<Actor | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user ?? null;
}

/**
 * Dla ekranów wymagających zalogowania: bez sesji → /login, z hasłem
 * tymczasowym → /zmien-haslo (dopóki go nie zmieni, nic innego nie zobaczy).
 */
export async function requireActor(): Promise<Actor> {
  const actor = await getActor();
  if (!actor) redirect("/login");
  if (actor.mustChangePassword) redirect("/zmien-haslo");
  return actor;
}
