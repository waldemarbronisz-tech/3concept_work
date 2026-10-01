import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { loadGrants } from "@/core/rbac/grants";
import { roles, type AuthorizationActor, type Role, type RoleGrant } from "@/core/rbac";
import { auth, type SessionUser } from "./auth";

/** Zalogowany użytkownik z aktywnymi rolami — wejście dla `authorize()`. */
export interface Actor extends AuthorizationActor {
  userId: string;
  user: SessionUser;
  grants: RoleGrant[];
  roles: Role[];
}

export async function toActor(user: SessionUser): Promise<Actor> {
  const grants = await loadGrants(user.id);
  return { userId: user.id, user, grants, roles: roles({ userId: user.id, grants }) };
}

/** Aktor z bieżącej sesji albo `null`. */
export async function getActor(): Promise<Actor | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  return session ? toActor(session.user) : null;
}

/**
 * Dla ekranów wymagających zalogowania: bez sesji → /login, z hasłem
 * tymczasowym → /zmien-haslo (dopóki go nie zmieni, nic innego nie zobaczy).
 */
export async function requireActor(): Promise<Actor> {
  const actor = await getActor();
  if (!actor) redirect("/login");
  if (actor.user.mustChangePassword) redirect("/zmien-haslo");
  return actor;
}
