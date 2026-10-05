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

/** Numery budów, w których zespole jest użytkownik (aktywne SiteAssignment jego pracownika). */
export async function loadMemberSiteIds(userId: string, now = new Date()): Promise<string[]> {
  const rows = await db.siteAssignment.findMany({
    where: {
      employee: { userId, deletedAt: null },
      validFrom: { lte: now },
      OR: [{ validTo: null }, { validTo: { gt: now } }],
      site: { deletedAt: null },
    },
    select: { site: { select: { siteNumber: true } } },
  });
  return [...new Set(rows.map((r) => r.site.siteNumber))];
}

/** Budowy, z którymi użytkownik jest związany: rolą na budowie albo członkostwem w zespole. */
export async function loadUserSiteIds(userId: string, now = new Date()): Promise<string[]> {
  const [grants, member] = await Promise.all([
    loadGrants(userId, now),
    loadMemberSiteIds(userId, now),
  ]);
  return [...new Set([...grants.flatMap((g) => (g.siteId ? [g.siteId] : [])), ...member])];
}
