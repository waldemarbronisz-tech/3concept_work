import { audit } from "@/core/audit";
import {
  activateAccount,
  createAccount,
  deactivateAccount,
  resetPassword,
} from "@/core/auth/accounts";
import { db } from "@/core/db";
import { authorize, grantRole, revokeRole, type AuthorizationActor, type Role } from "@/core/rbac";
import { fullName, nextFreeUsername, suggestUsername } from "./domain";
import {
  findEmployee,
  findEmployees,
  takenUsernames,
  type EmployeeListFilter,
  type EmployeeRow,
} from "./repository";
import type { CreateEmployeeInput, EmployeeData } from "./schemas";

export type { EmployeeListFilter, EmployeeRow };

/**
 * Przypadki użycia modułu pracowników. Każda funkcja zaczyna się od `authorize`
 * (PLAN_MVP §1); konto i hasło idą przez core/auth, ślad przez core/audit.
 */

export async function listEmployees(actor: AuthorizationActor, filter: EmployeeListFilter) {
  authorize(actor, "accounts.manage");
  return findEmployees(filter);
}

export async function getEmployee(actor: AuthorizationActor, id: string) {
  authorize(actor, "accounts.manage");
  return findEmployee(id);
}

/** Zakłada pracownika razem z kontem; hasło tymczasowe zwracane raz, do przekazania osobie. */
export async function createEmployee(
  actor: AuthorizationActor,
  input: CreateEmployeeInput & { roles?: Role[] },
) {
  authorize(actor, "accounts.manage");

  const base = input.username ?? suggestUsername(input.firstName, input.lastName);
  const username = input.username ?? nextFreeUsername(base, await takenUsernames(base));
  if (input.username && (await takenUsernames(username)).has(username)) {
    throw new Error(`Login „${username}” jest już zajęty.`);
  }

  const account = await createAccount(actor, {
    username,
    name: fullName(input),
    roles: (input.roles ?? []).map((role) => ({ role })),
  });

  const employee = await db.$transaction(async (tx) => {
    const created = await tx.employee.create({
      data: {
        userId: account.userId,
        firstName: input.firstName,
        lastName: input.lastName,
        position: input.position,
        phone: input.phone ?? null,
        employmentStatus: input.employmentStatus,
      },
    });
    await audit.record(tx, actor, {
      action: "employee.create",
      entityType: "employee",
      entityId: created.id,
      after: {
        userId: account.userId,
        firstName: created.firstName,
        lastName: created.lastName,
        position: created.position,
        employmentStatus: created.employmentStatus,
      },
    });
    return created;
  });

  return { employeeId: employee.id, username, temporaryPassword: account.temporaryPassword };
}

export async function updateEmployee(actor: AuthorizationActor, id: string, data: EmployeeData) {
  authorize(actor, "accounts.manage");

  return db.$transaction(async (tx) => {
    const before = await tx.employee.findFirstOrThrow({ where: { id, deletedAt: null } });
    const after = await tx.employee.update({
      where: { id },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        position: data.position,
        phone: data.phone ?? null,
        employmentStatus: data.employmentStatus,
        user: { update: { name: fullName(data) } },
      },
    });
    const pick = (e: typeof before) => ({
      firstName: e.firstName,
      lastName: e.lastName,
      position: e.position,
      phone: e.phone,
      employmentStatus: e.employmentStatus,
    });
    await audit.record(tx, actor, {
      action: "employee.update",
      entityType: "employee",
      entityId: id,
      before: pick(before),
      after: pick(after),
    });
    return after;
  });
}

async function userIdOf(id: string) {
  const employee = await db.employee.findFirstOrThrow({
    where: { id, deletedAt: null },
    select: { userId: true },
  });
  return employee.userId;
}

/** Role z ekranu admina; role budowy z numerem budowy (zakres), globalne bez. */
export async function grantEmployeeRole(
  actor: AuthorizationActor,
  id: string,
  role: Role,
  siteId?: string | null,
) {
  return grantRole(actor, { userId: await userIdOf(id), role, siteId: siteId ?? null });
}

export async function revokeEmployeeRole(
  actor: AuthorizationActor,
  id: string,
  assignmentId: string,
) {
  const userId = await userIdOf(id);
  const assignment = await db.roleAssignment.findUniqueOrThrow({ where: { id: assignmentId } });
  if (assignment.userId !== userId) throw new Error("Przypisanie nie należy do tego pracownika.");
  return revokeRole(actor, { assignmentId });
}

export async function blockEmployee(actor: AuthorizationActor, id: string, reason?: string) {
  await deactivateAccount(actor, await userIdOf(id), reason);
}

export async function unblockEmployee(actor: AuthorizationActor, id: string, reason?: string) {
  await activateAccount(actor, await userIdOf(id), reason);
}

/** Nowe hasło tymczasowe — pokazywane raz; kto może, decyduje `canResetPassword` w core/auth. */
export async function resetEmployeePassword(actor: AuthorizationActor, id: string) {
  return resetPassword(actor, await userIdOf(id));
}
