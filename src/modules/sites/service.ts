import { audit } from "@/core/audit";
import { db } from "@/core/db";
import { authorize, can, ForbiddenError, type AuthorizationActor } from "@/core/rbac";
import { canTransition, parseDateOnly } from "./domain";
import {
  findEmployeesNotInTeam,
  findSiteByNumber,
  findSiteOptions,
  findSites,
  findTeam,
  type SiteRow,
  type TeamMemberRow,
} from "./repository";
import type { SiteBudget, SiteData } from "./schemas";

export type { SiteRow, TeamMemberRow };

/** Numery budów widoczne dla aktora: globalny odczyt → wszystkie; inaczej rola na budowie lub zespół. */
function visibleSiteNumbers(actor: AuthorizationActor): readonly string[] | undefined {
  if (can(actor, "sites.read")) return undefined;
  return [
    ...new Set([
      ...actor.grants.flatMap((g) => (g.siteId ? [g.siteId] : [])),
      ...(actor.memberSiteIds ?? []),
    ]),
  ];
}

/** Lista budów w zakresie aktora. Bez żadnej budowy i bez uprawnień globalnych — pusta lista. */
export async function listSites(actor: AuthorizationActor) {
  const numbers = visibleSiteNumbers(actor);
  if (numbers && numbers.length === 0) return [];
  return findSites(numbers);
}

/** Budowy do przypisywania ról (admin) i do nawigacji — tylko numer i nazwa. */
export async function listSiteOptions(actor: AuthorizationActor) {
  authorize(actor, "sites.list");
  return findSiteOptions();
}

export async function getSite(actor: AuthorizationActor, siteNumber: string) {
  authorize(actor, "sites.read", { siteId: siteNumber });
  return findSiteByNumber(siteNumber);
}

/** Ukrywa budżet przed rolami bez `costs.read` (pracownik, brygadzista, inżynier). */
export function withCostsVisibility<T extends { laborBudgetHours: unknown; siteNumber: string }>(
  actor: AuthorizationActor,
  site: T,
): T & { costsVisible: boolean } {
  const costsVisible = can(actor, "costs.read", { siteId: site.siteNumber });
  return { ...site, laborBudgetHours: costsVisible ? site.laborBudgetHours : null, costsVisible };
}

/** Założenie budowy: ADMIN (`sites.create`), dane podstawowe, bez budżetu. */
export async function createSite(actor: AuthorizationActor, data: SiteData) {
  authorize(actor, "sites.create");
  if (await db.site.findUnique({ where: { siteNumber: data.siteNumber } })) {
    throw new Error(`Budowa o numerze „${data.siteNumber}” już istnieje.`);
  }
  return db.$transaction(async (tx) => {
    const site = await tx.site.create({
      data: {
        siteNumber: data.siteNumber,
        name: data.name,
        client: data.client,
        location: data.location,
        status: data.status,
        startDate: parseDateOnly(data.startDate),
        endDate: parseDateOnly(data.endDate),
        notes: data.notes,
      },
    });
    await audit.record(tx, actor, {
      action: "site.create",
      entityType: "site",
      entityId: site.id,
      siteId: site.siteNumber,
      after: {
        siteNumber: site.siteNumber,
        name: site.name,
        client: site.client,
        status: site.status,
      },
    });
    return site;
  });
}

const pickSite = (s: {
  name: string;
  client: string;
  location: string;
  status: string;
  startDate: Date | null;
  endDate: Date | null;
  notes: string | null;
}) => ({
  name: s.name,
  client: s.client,
  location: s.location,
  status: s.status,
  startDate: s.startDate?.toISOString().slice(0, 10) ?? null,
  endDate: s.endDate?.toISOString().slice(0, 10) ?? null,
  notes: s.notes,
});

/** Edycja danych budowy: `sites.manage` na tej budowie (kierownik kontraktu). Numeru nie zmienia się. */
export async function updateSite(
  actor: AuthorizationActor,
  siteNumber: string,
  data: Omit<SiteData, "siteNumber">,
) {
  authorize(actor, "sites.manage", { siteId: siteNumber });
  return db.$transaction(async (tx) => {
    const before = await tx.site.findFirstOrThrow({ where: { siteNumber, deletedAt: null } });
    if (!canTransition(before.status, data.status)) {
      throw new Error(`Nie można zmienić statusu z ${before.status} na ${data.status}.`);
    }
    const after = await tx.site.update({
      where: { id: before.id },
      data: {
        name: data.name,
        client: data.client,
        location: data.location,
        status: data.status,
        startDate: parseDateOnly(data.startDate),
        endDate: parseDateOnly(data.endDate),
        notes: data.notes,
      },
    });
    await audit.record(tx, actor, {
      action: "site.update",
      entityType: "site",
      entityId: before.id,
      siteId: siteNumber,
      before: pickSite(before),
      after: pickSite(after),
    });
    return after;
  });
}

/** Budżet robocizny: obszar kosztów (`costs.manage` na budowie), osobny wpis FINANCIAL. */
export async function updateSiteBudget(
  actor: AuthorizationActor,
  siteNumber: string,
  data: SiteBudget,
) {
  authorize(actor, "costs.manage", { siteId: siteNumber });
  return db.$transaction(async (tx) => {
    const before = await tx.site.findFirstOrThrow({ where: { siteNumber, deletedAt: null } });
    const after = await tx.site.update({
      where: { id: before.id },
      data: { laborBudgetHours: data.laborBudgetHours },
    });
    await audit.record(tx, actor, {
      action: "site.updateBudget",
      entityType: "site",
      entityId: before.id,
      siteId: siteNumber,
      before: { laborBudgetHours: before.laborBudgetHours?.toString() ?? null },
      after: { laborBudgetHours: after.laborBudgetHours?.toString() ?? null },
    });
    return after;
  });
}

export async function getTeam(actor: AuthorizationActor, siteNumber: string) {
  authorize(actor, "team.read", { siteId: siteNumber });
  const site = await db.site.findFirstOrThrow({ where: { siteNumber, deletedAt: null } });
  return findTeam(site.id);
}

export async function listTeamCandidates(actor: AuthorizationActor, siteNumber: string) {
  authorize(actor, "team.manage", { siteId: siteNumber });
  const site = await db.site.findFirstOrThrow({ where: { siteNumber, deletedAt: null } });
  return findEmployeesNotInTeam(site.id);
}

/** Dodanie do zespołu (`team.manage`): nowe przypisanie, historia zostaje. */
export async function addTeamMember(
  actor: AuthorizationActor,
  siteNumber: string,
  employeeId: string,
) {
  authorize(actor, "team.manage", { siteId: siteNumber });
  return db.$transaction(async (tx) => {
    const site = await tx.site.findFirstOrThrow({ where: { siteNumber, deletedAt: null } });
    const employee = await tx.employee.findFirstOrThrow({
      where: { id: employeeId, deletedAt: null },
    });
    const existing = await tx.siteAssignment.findFirst({
      where: { siteId: site.id, employeeId, validTo: null },
    });
    if (existing) return existing;
    const member = await tx.siteAssignment.create({ data: { siteId: site.id, employeeId } });
    await audit.record(tx, actor, {
      action: "team.add",
      entityType: "site",
      entityId: site.id,
      siteId: siteNumber,
      after: { employeeId, name: `${employee.firstName} ${employee.lastName}` },
    });
    return member;
  });
}

/** Zdjęcie z zespołu: zamknięcie przypisania (`validTo`), nie kasowanie. */
export async function removeTeamMember(
  actor: AuthorizationActor,
  siteNumber: string,
  assignmentId: string,
) {
  authorize(actor, "team.manage", { siteId: siteNumber });
  return db.$transaction(async (tx) => {
    const member = await tx.siteAssignment.findUniqueOrThrow({
      where: { id: assignmentId },
      include: { site: true, employee: true },
    });
    if (member.site.siteNumber !== siteNumber) throw new ForbiddenError("team.manage");
    if (member.validTo) return member;
    const closed = await tx.siteAssignment.update({
      where: { id: assignmentId },
      data: { validTo: new Date() },
    });
    await audit.record(tx, actor, {
      action: "team.remove",
      entityType: "site",
      entityId: member.siteId,
      siteId: siteNumber,
      before: {
        employeeId: member.employeeId,
        name: `${member.employee.firstName} ${member.employee.lastName}`,
      },
      after: { validTo: closed.validTo?.toISOString() ?? null },
    });
    return closed;
  });
}
