/**
 * Role systemowe (docs/PLAN_MVP.md, D10). Czysty TS — ten sam zbiór co enum `Role`
 * w prisma/schema.prisma (zgodność pilnuje test).
 */
export const ROLES = [
  "MANAGEMENT",
  "ADMIN",
  "CONTRACT_MANAGER",
  "SITE_ENGINEER",
  "FOREMAN",
  "WORKER",
] as const;

export type Role = (typeof ROLES)[number];

/** Role z zakresem globalnym (bez budowy). */
export const GLOBAL_ROLES: ReadonlySet<Role> = new Set(["MANAGEMENT", "ADMIN"]);

/** Przypisanie roli, tak jak widzi je autoryzacja: rola + budowa (null = globalnie). */
export interface RoleGrant {
  role: Role;
  siteId: string | null;
}
