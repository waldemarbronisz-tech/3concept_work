import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/core/db";
import { loadGrants, loadMemberSiteIds } from "@/core/rbac/grants";
import { roles, type AuthorizationActor, type Role, type RoleGrant } from "@/core/rbac";
import { auth } from "./auth";

/** Dane konta czytane z bazy przy każdym żądaniu (nie z sesji): blokada działa natychmiast. */
export interface ActorUser {
  id: string;
  name: string;
  username: string | null;
  mustChangePassword: boolean;
}

/** Zalogowany użytkownik z aktywnymi rolami — wejście dla `authorize()`. */
export interface Actor extends AuthorizationActor {
  userId: string;
  user: ActorUser;
  grants: RoleGrant[];
  roles: Role[];
}

export type ActorResolution =
  { kind: "anonymous" } | { kind: "blocked" } | { kind: "ok"; actor: Actor };

/**
 * Aktor dla użytkownika o danym id — stan konta i role zawsze z bazy.
 * Konto nieistniejące → `anonymous`, zablokowane → `blocked`.
 * (Better Auth nie ma włączonego cookie cache sesji, więc nic nie jest tu buforowane.)
 */
export async function resolveActorById(userId: string): Promise<ActorResolution> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, username: true, mustChangePassword: true, isActive: true },
  });
  if (!user) return { kind: "anonymous" };
  if (!user.isActive) return { kind: "blocked" };

  const [grants, memberSiteIds] = await Promise.all([
    loadGrants(user.id),
    loadMemberSiteIds(user.id),
  ]);
  const { id, name, username, mustChangePassword } = user;
  return {
    kind: "ok",
    actor: {
      userId: id,
      user: { id, name, username, mustChangePassword },
      grants,
      memberSiteIds,
      roles: roles({ userId: id, grants }),
    },
  };
}

/** Aktor z bieżącej sesji: anonimowy, zablokowany albo zalogowany. */
export async function resolveActor(): Promise<ActorResolution> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { kind: "anonymous" };
  return resolveActorById(session.user.id);
}

/** Aktor z bieżącej sesji albo `null` (brak sesji lub konto zablokowane). */
export async function getActor(): Promise<Actor | null> {
  const resolved = await resolveActor();
  return resolved.kind === "ok" ? resolved.actor : null;
}

/**
 * Dla ekranów wymagających zalogowania: bez sesji → /login, konto zablokowane →
 * /login z komunikatem, hasło tymczasowe → /zmien-haslo (dopóki go nie zmieni,
 * nic innego nie zobaczy).
 */
export async function requireActor(): Promise<Actor> {
  const resolved = await resolveActor();
  if (resolved.kind === "anonymous") redirect("/login");
  if (resolved.kind === "blocked") redirect("/login?powod=zablokowane");
  if (resolved.actor.user.mustChangePassword) redirect("/zmien-haslo");
  return resolved.actor;
}
