import { z } from "zod";
import { normalizeSiteNumber, SITE_NUMBER_PATTERN } from "./domain";

const text = (label: string, max = 120) =>
  z
    .string()
    .trim()
    .min(1, `${label}: pole wymagane.`)
    .max(max, `${label}: najwyżej ${max} znaków.`);

const dateOnly = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v ? v : null))
  .refine((v) => v === null || /^\d{4}-\d{2}-\d{2}$/.test(v), {
    message: "Data: format RRRR-MM-DD.",
  });

/** Dane podstawowe budowy — bez budżetu (ten zmienia tylko rola z `costs.manage`). */
export const siteDataSchema = z.object({
  siteNumber: z
    .string()
    .transform(normalizeSiteNumber)
    .refine((v) => SITE_NUMBER_PATTERN.test(v), {
      message: "Numer budowy: 1–30 znaków (litery, cyfry, spacja, . _ / -).",
    }),
  name: text("Nazwa"),
  client: text("Klient"),
  location: text("Lokalizacja"),
  status: z.enum(["PLANNED", "ACTIVE", "CLOSED"]).default("PLANNED"),
  startDate: dateOnly,
  endDate: dateOnly,
  notes: z
    .string()
    .trim()
    .max(2000)
    .optional()
    .transform((v) => (v ? v : null)),
});

/** Budżet robocizny w rbh (obszar kosztów). Puste = brak budżetu. */
export const siteBudgetSchema = z.object({
  laborBudgetHours: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? v.replace(",", ".") : null))
    .refine((v) => v === null || /^\d{1,8}([.]\d{1,2})?$/.test(v), {
      message: "Budżet rbh: liczba, najwyżej 2 miejsca po przecinku.",
    }),
});

export const teamMemberSchema = z.object({
  employeeId: z.string().min(1, "Wybierz pracownika."),
});

export type SiteData = z.infer<typeof siteDataSchema>;
export type SiteBudget = z.infer<typeof siteBudgetSchema>;
