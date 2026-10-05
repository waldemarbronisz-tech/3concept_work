import { z } from "zod";
import { USERNAME_PATTERN } from "@/core/auth/username";

/** Jeden schemat dla formularza i akcji (PLAN_MVP §1). Komunikaty po polsku. */

const name = (label: string) =>
  z
    .string()
    .trim()
    .min(2, `${label}: co najmniej 2 znaki.`)
    .max(60, `${label}: najwyżej 60 znaków.`);

export const employeeDataSchema = z.object({
  firstName: name("Imię"),
  lastName: name("Nazwisko"),
  position: z.string().trim().min(2, "Stanowisko: co najmniej 2 znaki.").max(80),
  phone: z
    .string()
    .trim()
    .max(30)
    .optional()
    .transform((v) => (v ? v : null)),
  employmentStatus: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
});

export const createEmployeeSchema = employeeDataSchema.extend({
  /** Pusty = login z nazwiska (domain.suggestUsername). */
  username: z
    .string()
    .trim()
    .toLowerCase()
    .optional()
    .transform((v) => (v ? v : undefined))
    .refine((v) => v === undefined || USERNAME_PATTERN.test(v), {
      message: "Login: 3–30 znaków, małe litery, cyfry, kropka, myślnik lub podkreślenie.",
    }),
});

/** Role nadawane z ekranu admina do iteracji 8: tylko globalne i WORKER (role budowy wymagają budowy). */
export const GRANTABLE_ROLES = ["WORKER", "MANAGEMENT", "ADMIN"] as const;

export const grantRoleSchema = z.object({
  role: z.enum(GRANTABLE_ROLES),
});

export const reasonSchema = z.object({
  reason: z.string().trim().max(200).optional(),
});

export type EmployeeData = z.infer<typeof employeeDataSchema>;
export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;

/** FormData → zwykły obiekt (puste pola jako undefined). */
export function formToObject(formData: FormData): Record<string, string | undefined> {
  const out: Record<string, string | undefined> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string") out[key] = value === "" ? undefined : value;
  }
  return out;
}

/** Pierwszy komunikat błędu walidacji do pokazania w formularzu. */
export function firstIssue(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Nieprawidłowe dane.";
}
