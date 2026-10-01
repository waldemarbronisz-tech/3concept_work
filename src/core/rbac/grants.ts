import { db } from "@/core/db";
import type { RoleGrant } from "./roles";

/** Aktywne przypisania ról użytkownika (validFrom ≤ teraz < validTo). */
export async function loadGrants(userId: string, now = new Date()): Promise<RoleGrant[]> {
  const rows = await db.roleAssignment.findMany({
    where: { userId, validFrom: { lte: now }, OR: [{ validTo: null }, { validTo: { gt: now } }] },
    select: { role: true, siteId: true },
    orderBy: { validFrom: "asc" },
  });
  return rows.map((r) => ({ role: r.role, siteId: r.siteId }));
}

/** Budowy, z którymi użytkownik jest związany rolą (zespół budowy — SiteAssignment — dojdzie w iteracji 8). */
export async function loadUserSiteIds(userId: string, now = new Date()): Promise<string[]> {
  const grants = await loadGrants(userId, now);
  return [...new Set(grants.flatMap((g) => (g.siteId ? [g.siteId] : [])))];
}
