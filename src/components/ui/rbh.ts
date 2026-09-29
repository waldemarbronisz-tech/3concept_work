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
  /** Nadwyżka nie mieści się w skali (> 125 %). */
  clipped: boolean;
  /** Wykonanie minus plan, w rbh; 0, gdy planu brak (nie ma nadwyżki). */
  diff: number;
}

const toBar = (percentOfPlan: number) => (percentOfPlan / RBH_SCALE_MAX_PERCENT) * 100;

export function rbhBarGeometry(actual: number, plan: number): RbhBarGeometry {
  const done = Math.max(0, actual);

  if (plan <= 0) {
    // Bez planu nie ma skali ani nadwyżki — pasek pusty, opis neutralny.
    return { percent: null, fillWidth: 0, overWidth: 0, clipped: false, diff: 0 };
  }

  const diff = done - plan;
  const ratio = (done / plan) * 100;
  return {
    percent: Math.round(ratio),
    fillWidth: toBar(Math.min(ratio, 100)),
    overWidth: ratio > 100 ? toBar(Math.min(ratio, RBH_SCALE_MAX_PERCENT) - 100) : 0,
    clipped: ratio > RBH_SCALE_MAX_PERCENT,
    diff,
  };
}
