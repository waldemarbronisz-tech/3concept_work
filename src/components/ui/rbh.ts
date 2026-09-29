/** Pasek pokazuje 0–125 % planu; kreska planu (100 %) stoi na 80 % szerokości. */
export const RBH_SCALE_MAX_PERCENT = 125;
export const RBH_PLAN_MARK = (100 / RBH_SCALE_MAX_PERCENT) * 100;

export interface RbhBarGeometry {
  /** Wykonanie w % planu (zaokrąglone); `null`, gdy planu brak. */
  percent: number | null;
  /** Szerokość części w planie, w % szerokości paska (0–80). */
  fillWidth: number;
  /** Szerokość nadwyżki od kreski planu, w % szerokości paska (0–20). */
  overWidth: number;
  /** Nadwyżka nie mieści się w skali (> 125 % albo praca bez planu). */
  clipped: boolean;
  /** Wykonanie minus plan, w rbh. */
  diff: number;
}

const toBar = (percentOfPlan: number) => (percentOfPlan / RBH_SCALE_MAX_PERCENT) * 100;

export function rbhBarGeometry(actual: number, plan: number): RbhBarGeometry {
  const done = Math.max(0, actual);
  const diff = done - Math.max(0, plan);

  if (plan <= 0) {
    // Bez planu każda przepracowana godzina jest nadwyżką.
    const over = done > 0;
    return {
      percent: null,
      fillWidth: 0,
      overWidth: over ? 100 - RBH_PLAN_MARK : 0,
      clipped: over,
      diff,
    };
  }

  const ratio = (done / plan) * 100;
  return {
    percent: Math.round(ratio),
    fillWidth: toBar(Math.min(ratio, 100)),
    overWidth: ratio > 100 ? toBar(Math.min(ratio, RBH_SCALE_MAX_PERCENT) - 100) : 0,
    clipped: ratio > RBH_SCALE_MAX_PERCENT,
    diff,
  };
}
