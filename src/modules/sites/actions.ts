"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireActor } from "@/core/auth/actor";
import { ForbiddenError } from "@/core/rbac";
import { firstIssue, formToObject } from "@/modules/employees/schemas";
import { siteBudgetSchema, siteDataSchema, teamMemberSchema } from "./schemas";
import * as service from "./service";

export interface SiteActionState {
  error?: string;
  ok?: string;
}

function describe(error: unknown): string {
  if (error instanceof ForbiddenError) return "Brak uprawnień do tej operacji.";
  if (error instanceof Error) return error.message;
  return "Nieznany błąd.";
}

export async function createSiteAction(
  _prev: SiteActionState,
  formData: FormData,
): Promise<SiteActionState> {
  const actor = await requireActor();
  const parsed = siteDataSchema.safeParse(formToObject(formData));
  if (!parsed.success) return { error: firstIssue(parsed.error) };
  let siteNumber: string;
  try {
    siteNumber = (await service.createSite(actor, parsed.data)).siteNumber;
  } catch (error) {
    return { error: describe(error) };
  }
  revalidatePath("/budowy");
  redirect(`/budowy/${encodeURIComponent(siteNumber)}`);
}

export async function updateSiteAction(
  siteNumber: string,
  _prev: SiteActionState,
  formData: FormData,
): Promise<SiteActionState> {
  const actor = await requireActor();
  const parsed = siteDataSchema.safeParse({ ...formToObject(formData), siteNumber });
  if (!parsed.success) return { error: firstIssue(parsed.error) };
  try {
    await service.updateSite(actor, siteNumber, parsed.data);
    revalidatePath("/budowy");
    revalidatePath(`/budowy/${encodeURIComponent(siteNumber)}`);
    return { ok: "Zapisano." };
  } catch (error) {
    return { error: describe(error) };
  }
}

export async function updateSiteBudgetAction(
  siteNumber: string,
  _prev: SiteActionState,
  formData: FormData,
): Promise<SiteActionState> {
  const actor = await requireActor();
  const parsed = siteBudgetSchema.safeParse(formToObject(formData));
  if (!parsed.success) return { error: firstIssue(parsed.error) };
  try {
    await service.updateSiteBudget(actor, siteNumber, parsed.data);
    revalidatePath(`/budowy/${encodeURIComponent(siteNumber)}`);
    return { ok: "Budżet zapisany." };
  } catch (error) {
    return { error: describe(error) };
  }
}

export async function addTeamMemberAction(
  siteNumber: string,
  _prev: SiteActionState,
  formData: FormData,
): Promise<SiteActionState> {
  const actor = await requireActor();
  const parsed = teamMemberSchema.safeParse(formToObject(formData));
  if (!parsed.success) return { error: firstIssue(parsed.error) };
  try {
    await service.addTeamMember(actor, siteNumber, parsed.data.employeeId);
    revalidatePath(`/budowy/${encodeURIComponent(siteNumber)}`);
    return { ok: "Dodano do zespołu." };
  } catch (error) {
    return { error: describe(error) };
  }
}

export async function removeTeamMemberAction(siteNumber: string, assignmentId: string) {
  const actor = await requireActor();
  await service.removeTeamMember(actor, siteNumber, assignmentId);
  revalidatePath(`/budowy/${encodeURIComponent(siteNumber)}`);
}
