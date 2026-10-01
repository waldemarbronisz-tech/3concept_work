import { PERMISSIONS, PRIVILEGED_ROLES, type Permission } from "./permissions";
import type { Role, RoleGrant } from "./roles";

/** Minimalny aktor dla autoryzacji: kto i z jakimi rolami. */
export interface AuthorizationActor {
  userId: string;
  grants: readonly RoleGrant[];
}

/** Na czym ma być wykonana operacja. */
export interface AuthorizationScope {
  /** Budowa, której dotyczy operacja. */
  siteId?: string | null;
  /** Właściciel danych (np. wpisu czasu), gdy uprawnienie jest `own`. */
  ownerUserId?: string | null;
}

export class ForbiddenError extends Error {
  readonly permission: Permission;
  constructor(permission: Permission) {
    super(`Brak uprawnienia: ${permission}`);
    this.name = "ForbiddenError";
    this.permission = permission;
  }
}

/** Czy aktor ma uprawnienie w danym zakresie. Uprawnienia z wielu ról się sumują (D10). */
export function can(
  actor: AuthorizationActor,
  permission: Permission,
  scope: AuthorizationScope = {},
): boolean {
  return actor.grants.some((grant) => {
    const granted = PERMISSIONS[grant.role][permission];
    switch (granted) {
      case "global":
        return true;
      case "site":
        return grant.siteId !== null && scope.siteId != null && grant.siteId === scope.siteId;
      case "own":
        return scope.ownerUserId != null && scope.ownerUserId === actor.userId;
      default:
        return false;
    }
  });
}

/** Początek każdej funkcji serwisu (PLAN_MVP §1): rzuca `ForbiddenError`, gdy brak uprawnienia. */
export function authorize(
  actor: AuthorizationActor,
  permission: Permission,
  scope: AuthorizationScope = {},
): void {
  if (!can(actor, permission, scope)) throw new ForbiddenError(permission);
}

/** Budowy, na których aktor ma daną rolę. */
export function sitesWithRole(actor: AuthorizationActor, role: Role): string[] {
  return actor.grants.flatMap((g) => (g.role === role && g.siteId ? [g.siteId] : []));
}

export const roles = (actor: AuthorizationActor): Role[] => [
  ...new Set(actor.grants.map((g) => g.role)),
];

/** Cel resetu hasła: jego role i budowy, z którymi jest związany (role na budowie + zespół budowy). */
export interface PasswordResetTarget {
  userId: string;
  roles: readonly Role[];
  siteIds: readonly string[];
}

/**
 * Reset hasła (macierz, przypis ¹): ADMIN resetuje każdemu; CONTRACT_MANAGER tylko
 * osobom ze swoich budów, które nie mają żadnej roli uprzywilejowanej.
 */
export function canResetPassword(actor: AuthorizationActor, target: PasswordResetTarget): boolean {
  if (can(actor, "accounts.resetPassword")) return true; // zakres globalny = ADMIN

  const managedSites = sitesWithRole(actor, "CONTRACT_MANAGER");
  if (managedSites.length === 0) return false;
  if (target.roles.some((role) => PRIVILEGED_ROLES.has(role))) return false;
  return target.siteIds.some((siteId) => managedSites.includes(siteId));
}
