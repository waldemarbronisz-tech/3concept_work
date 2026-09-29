import { cn } from "./cn";
import { formatHours } from "./format";
import { RBH_PLAN_MARK, rbhBarGeometry } from "./rbh";

export interface RbhBarProps {
  /** Przepracowane rbh. */
  actual: number;
  /** Planowane rbh. */
  plan: number;
  className?: string;
}

/** Wykonanie rbh na skali 0–125 %, kreska planu na 100 %, nadwyżka osobno. */
export function RbhBar({ actual, plan, className }: RbhBarProps) {
  const g = rbhBarGeometry(actual, plan);
  const percentText = g.percent === null ? "— %" : `${g.percent} %`;
  const diffText = g.diff > 0 ? `+${formatHours(g.diff)} rbh` : "plan";

  return (
    <div className={cn("min-w-0", className)}>
      <div aria-hidden className="relative h-3 w-full border border-line bg-surface">
        <span className="absolute inset-y-0 left-0 bg-navy" style={{ width: `${g.fillWidth}%` }} />
        {g.overWidth > 0 && (
          <span
            className="absolute inset-y-0 bg-alarm"
            style={{ left: `${RBH_PLAN_MARK}%`, width: `${g.overWidth}%` }}
          />
        )}
        <span className="absolute -inset-y-1 w-0.5 bg-ink" style={{ left: `${RBH_PLAN_MARK}%` }} />
      </div>
      <div className="mt-[3px] flex justify-between font-mono text-xs text-ink-2 tabular-nums">
        <span>
          {percentText}
          {g.clipped && <span className="sr-only"> (poza skalą)</span>}
        </span>
        <span>{diffText}</span>
      </div>
    </div>
  );
}
