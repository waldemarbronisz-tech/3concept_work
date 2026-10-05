import { audit } from "@/core/audit";
import { db } from "@/core/db";
import type { Prisma } from "@/generated/prisma/client";
import { authorize, type AuthorizationActor } from "./authorize";
import { assertCanTouchManagementRole, assertNotLastAdmin, assertNotSelf } from "./guards";
import { GLOBAL_ROLES, type Role } from "./roles";

/** Inni aktywni użytkownicy z aktywną rolą ADMIN (do reguły „ostatni admin”), w tej samej transakcji. */
export function countOtherActiveAdmins(
  tx: Pick<Prisma.TransactionClient, "roleAssignment">,
  excludeUserId: string,
  now = new Date(),
) {
  return tx.roleAssignment.count({
    where: {
      role: "ADMIN",
      userId: { not: excludeUserId },
      validFrom: { lte: now },
      OR: [{ validTo: null }, { validTo: { gt: now } }],
      user: { isActive: true },
    },
  });
}

/** Nadanie roli (ADMIN: `accounts.manage`). Zakres pilnuje też CHECK w bazie. */
export async function grantRole(
  actor: AuthorizationActor,
  input: { userId: string; role: Role; siteId?: string | null; reason?: string },
) {
  authorize(actor, "accounts.manage");
  assertNotSelf(actor, input.userId, "zmieniać ról");
  if (input.role === "MANAGEMENT") assertCanTouchManagementRole(actor);
  const siteId = input.siteId ?? null;
  if (GLOBAL_ROLES.has(input.role) && siteId) {
    throw new Error(`Rola ${input.role} jest globalna — bez budowy.`);
  }

  return db.$transaction(async (tx) => {
    const existing = await tx.roleAssignment.findFirst({
      where: { userId: input.userId, role: input.role, siteId, validTo: null },
    });
    if (existing) return existing;

    const assignment = await tx.roleAssignment.create({
      data: { userId: input.userId, role: input.role, siteId },
    });
    await audit.record(tx, actor, {
      action: "role.grant",
      entityType: "user",
      entityId: input.userId,
      siteId,
      after: { role: input.role, siteId, assignmentId: assignment.id },
      reason: input.reason,
    });
    return assignment;
  });
}

/** Odebranie roli: zamyka przypisanie (`validTo = teraz`), historia zostaje (§36.1). */
export async function revokeRole(
  actor: AuthorizationActor,
  input: { assignmentId: string; reason?: string },
) {
  authorize(actor, "accounts.manage");

  return db.$transaction(async (tx) => {
    const assignment = await tx.roleAssignment.findUniqueOrThrow({
      where: { id: input.assignmentId },
    });
    assertNotSelf(actor, assignment.userId, "zmieniać ról");
    if (assignment.role === "MANAGEMENT") assertCanTouchManagementRole(actor);
    if (assignment.validTo && assignment.validTo <= new Date()) return assignment;
    if (assignment.role === "ADMIN") {
      assertNotLastAdmin(await countOtherActiveAdmins(tx, assignment.userId), "odebrać roli ADMIN");
    }

    const closed = await tx.roleAssignment.update({
      where: { id: assignment.id },
      data: { validTo: new Date() },
    });
    await audit.record(tx, actor, {
      action: "role.revoke",
      entityType: "user",
      entityId: assignment.userId,
      siteId: assignment.siteId,
      before: { role: assignment.role, siteId: assignment.siteId, assignmentId: assignment.id },
      after: { validTo: closed.validTo?.toISOString() ?? null },
      reason: input.reason,
    });
    return closed;
  });
}
