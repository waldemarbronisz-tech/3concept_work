import { db } from "@/core/db";
import type { Prisma } from "@/generated/prisma/client";

const listSelect = {
  id: true,
  siteNumber: true,
  name: true,
  client: true,
  location: true,
  status: true,
  startDate: true,
  endDate: true,
  notes: true,
  laborBudgetHours: true,
  _count: { select: { team: { where: { validTo: null } } } },
  roleAssignments: {
    where: { validTo: null, role: "CONTRACT_MANAGER" as const },
    select: { user: { select: { name: true } } },
  },
} satisfies Prisma.SiteSelect;

export type SiteRow = Prisma.SiteGetPayload<{ select: typeof listSelect }>;

/** Lista budów; `siteNumbers` zawęża do podanych (zakres aktora). */
export function findSites(siteNumbers?: readonly string[]) {
  return db.site.findMany({
    where: { deletedAt: null, ...(siteNumbers ? { siteNumber: { in: [...siteNumbers] } } : {}) },
    select: listSelect,
    orderBy: { siteNumber: "asc" },
  });
}

export function findSiteByNumber(siteNumber: string) {
  return db.site.findFirst({ where: { siteNumber, deletedAt: null }, select: listSelect });
}

const memberSelect = {
  id: true,
  validFrom: true,
  employee: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      position: true,
      user: { select: { username: true, isActive: true } },
    },
  },
} satisfies Prisma.SiteAssignmentSelect;

export type TeamMemberRow = Prisma.SiteAssignmentGetPayload<{ select: typeof memberSelect }>;

/** Aktywny zespół budowy. */
export function findTeam(siteId: string) {
  return db.siteAssignment.findMany({
    where: { siteId, validTo: null },
    select: memberSelect,
    orderBy: [{ employee: { lastName: "asc" } }, { employee: { firstName: "asc" } }],
  });
}

/** Pracownicy do dodania do zespołu (aktywne konto, nie w zespole). */
export function findEmployeesNotInTeam(siteId: string) {
  return db.employee.findMany({
    where: {
      deletedAt: null,
      employmentStatus: "ACTIVE",
      user: { isActive: true },
      siteAssignments: { none: { siteId, validTo: null } },
    },
    select: { id: true, firstName: true, lastName: true, position: true },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
  });
}

/** Numery i nazwy budów (do przypisywania ról: `sites.list`). */
export function findSiteOptions() {
  return db.site.findMany({
    where: { deletedAt: null },
    select: { siteNumber: true, name: true, status: true },
    orderBy: { siteNumber: "asc" },
  });
}
