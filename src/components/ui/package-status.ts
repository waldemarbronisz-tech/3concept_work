/** Warianty lampki statusu (docs/UI_STYLE.md §4). */
export type StatusVariant = "neutral" | "run" | "done" | "warn" | "alarm";

/**
 * Stany pakietu wg docs/PLAN_MVP.md (enum WorkPackageStatus). Typ trafi do
 * modułu work-packages, gdy powstanie (iteracja 11).
 */
export type WorkPackageStatus =
  "PLANNED" | "READY" | "IN_PROGRESS" | "BLOCKED" | "TO_ACCEPT" | "ACCEPTED" | "CLOSED" | "REWORK";

const VARIANT: Record<WorkPackageStatus, StatusVariant> = {
  PLANNED: "neutral",
  READY: "neutral",
  IN_PROGRESS: "run",
  BLOCKED: "alarm",
  TO_ACCEPT: "neutral",
  ACCEPTED: "done",
  CLOSED: "neutral",
  REWORK: "warn",
};

const LABEL: Record<WorkPackageStatus, string> = {
  PLANNED: "Planowany",
  READY: "Gotowy",
  IN_PROGRESS: "W toku",
  BLOCKED: "Zablokowany",
  TO_ACCEPT: "Do odbioru",
  ACCEPTED: "Odebrany",
  CLOSED: "Zamknięty",
  REWORK: "Wymaga poprawek",
};

export interface StatusView {
  variant: StatusVariant;
  label: string;
}

/**
 * Stan pakietu → lampka i tekst. „Ponad plan rbh” to nie stan, tylko
 * warunek: podnosi wariant do `warn`, ale nie przykrywa blokady.
 */
export function packageStatusView(
  status: WorkPackageStatus,
  options: { overPlan?: boolean } = {},
): StatusView {
  const variant = VARIANT[status];
  const label = LABEL[status];
  if (options.overPlan && variant !== "alarm") {
    return { variant: "warn", label: `Ponad plan · ${label.toLowerCase()}` };
  }
  return { variant, label };
}
