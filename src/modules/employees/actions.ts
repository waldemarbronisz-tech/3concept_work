"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireActor } from "@/core/auth/actor";
import { ForbiddenError, type Role } from "@/core/rbac";
import {
  createEmployeeSchema,
  employeeDataSchema,
  firstIssue,
  formToObject,
  GRANTABLE_ROLES,
  grantRoleSchema,
  reasonSchema,
} from "./schemas";
import * as service from "./service";

/** Stan formularzy (useActionState): błąd do pokazania albo wynik do pokazania raz. */
export interface EmployeeActionState {
  error?: string;
  ok?: string;
  /** Hasło tymczasowe — pokazywane raz, nigdy nie zapisywane w audycie. */
  temporaryPassword?: string;
  username?: string;
}

const PATH = "/admin/pracownicy";

function describe(error: unknown): string {
  if (error instanceof ForbiddenError) return "Brak uprawnień do tej operacji.";
  if (error instanceof Error) return error.message;
  return "Nieznany błąd.";
}

export async function createEmployeeAction(
  _prev: EmployeeActionState,
  formData: FormData,
): Promise<EmployeeActionState> {
  const actor = await requireActor();
  const parsed = createEmployeeSchema.safeParse(formToObject(formData));
  if (!parsed.success) return { error: firstIssue(parsed.error) };

  const roles = formData
    .getAll("roles")
    .filter((r): r is (typeof GRANTABLE_ROLES)[number] =>
      GRANTABLE_ROLES.includes(r as (typeof GRANTABLE_ROLES)[number]),
    );

  try {
    const result = await service.createEmployee(actor, { ...parsed.data, roles });
    revalidatePath(PATH);
    return {
      ok: `Konto ${result.username} założone.`,
      username: result.username,
      temporaryPassword: result.temporaryPassword,
    };
  } catch (error) {
    return { error: describe(error) };
  }
}

export async function updateEmployeeAction(
  id: string,
  _prev: EmployeeActionState,
  formData: FormData,
): Promise<EmployeeActionState> {
  const actor = await requireActor();
  const parsed = employeeDataSchema.safeParse(formToObject(formData));
  if (!parsed.success) return { error: firstIssue(parsed.error) };
  try {
    await service.updateEmployee(actor, id, parsed.data);
    revalidatePath(PATH);
    revalidatePath(`${PATH}/${id}`);
    return { ok: "Zapisano." };
  } catch (error) {
    return { error: describe(error) };
  }
}

export async function grantRoleAction(
  id: string,
  _prev: EmployeeActionState,
  formData: FormData,
): Promise<EmployeeActionState> {
  const actor = await requireActor();
  const parsed = grantRoleSchema.safeParse(formToObject(formData));
  if (!parsed.success) return { error: firstIssue(parsed.error) };
  try {
    await service.grantEmployeeRole(actor, id, parsed.data.role as Role);
    revalidatePath(`${PATH}/${id}`);
    return { ok: `Nadano rolę ${parsed.data.role}.` };
  } catch (error) {
    return { error: describe(error) };
  }
}

export async function revokeRoleAction(id: string, assignmentId: string) {
  const actor = await requireActor();
  await service.revokeEmployeeRole(actor, id, assignmentId);
  revalidatePath(`${PATH}/${id}`);
}

export async function blockEmployeeAction(
  id: string,
  _prev: EmployeeActionState,
  formData: FormData,
): Promise<EmployeeActionState> {
  const actor = await requireActor();
  const { reason } = reasonSchema.parse(formToObject(formData));
  try {
    await service.blockEmployee(actor, id, reason);
    revalidatePath(PATH);
    revalidatePath(`${PATH}/${id}`);
    return { ok: "Konto zablokowane." };
  } catch (error) {
    return { error: describe(error) };
  }
}

export async function unblockEmployeeAction(
  id: string,
  _prev: EmployeeActionState,
  formData: FormData,
): Promise<EmployeeActionState> {
  const actor = await requireActor();
  const { reason } = reasonSchema.parse(formToObject(formData));
  try {
    await service.unblockEmployee(actor, id, reason);
    revalidatePath(PATH);
    revalidatePath(`${PATH}/${id}`);
    return { ok: "Konto odblokowane." };
  } catch (error) {
    return { error: describe(error) };
  }
}

export async function resetPasswordAction(id: string): Promise<EmployeeActionState> {
  const actor = await requireActor();
  try {
    const { temporaryPassword } = await service.resetEmployeePassword(actor, id);
    revalidatePath(`${PATH}/${id}`);
    return { ok: "Hasło zresetowane. Przekaż je pracownikowi.", temporaryPassword };
  } catch (error) {
    return { error: describe(error) };
  }
}

/** Po założeniu konta i pokazaniu hasła: przejście do listy. */
export async function goToEmployees() {
  redirect(PATH);
}
