import { can, ForbiddenError, type AuthorizationActor } from "./authorize";
import type { Role } from "./roles";

/**
 * Reguły przeciw eskalacji uprawnień (PLAN_MVP, przypis ⁵ macierzy). Czyste
 * predykaty — serwisy wołają je obok `authorize`, UI tylko ukrywa nimi przyciski.
 */

export const hasRole = (actor: AuthorizationActor, role: Role) =>
  actor.grants.some((g) => g.role === role);

/** Nikt nie zmienia własnych ról ani nie blokuje własnego konta. */
export function assertNotSelf(actor: AuthorizationActor, targetUserId: string, what: string) {
  if (actor.userId === targetUserId) throw new Error(`Nie można ${what} własnego konta.`);
}

/** Rolę MANAGEMENT nadaje i odbiera tylko ktoś, kto sam ma ADMIN i MANAGEMENT. */
export const canManageManagementRole = (actor: AuthorizationActor) =>
  hasRole(actor, "ADMIN") && hasRole(actor, "MANAGEMENT");

/** Konta z MANAGEMENT blokuje, odblokowuje i resetuje tylko aktor z MANAGEMENT (+ accounts.manage). */
export const canManageManagementAccount = (actor: AuthorizationActor) =>
  can(actor, "accounts.manage") && hasRole(actor, "MANAGEMENT");

export function assertCanTouchManagementRole(actor: AuthorizationActor) {
  if (!canManageManagementRole(actor)) throw new ForbiddenError("accounts.manage");
}

export function assertCanTouchManagementAccount(
  actor: AuthorizationActor,
  targetRoles: readonly Role[],
) {
  if (targetRoles.includes("MANAGEMENT") && !canManageManagementAccount(actor)) {
    throw new ForbiddenError("accounts.manage");
  }
}

/** Ostatniego aktywnego admina nie da się pozbawić roli ani zablokować. */
export function assertNotLastAdmin(otherActiveAdmins: number, what: string) {
  if (otherActiveAdmins === 0) {
    throw new Error(`Nie można ${what}: to ostatni aktywny administrator.`);
  }
}
