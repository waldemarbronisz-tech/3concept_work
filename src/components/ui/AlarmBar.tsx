import type { ReactNode } from "react";
import { cn } from "./cn";
import { Status } from "./Status";

export interface AlarmBarProps {
  /** Krótki stan, np. „Blokada”. */
  label: string;
  variant?: "alarm" | "warn";
  /** Opis problemu. */
  children: ReactNode;
  /** Akcja, zwykle przycisk „Szczegóły”. */
  action?: ReactNode;
}

/** Pasek nad treścią: to, co wymaga reakcji, jest pierwsze. */
export function AlarmBar({ label, variant = "alarm", children, action }: AlarmBarProps) {
  return (
    <div
      role="status"
      className={cn(
        "flex flex-wrap items-center gap-3 border-b px-4 py-2.5",
        variant === "alarm" ? "border-alarm bg-alarm-soft" : "border-warn bg-warn-soft",
      )}
    >
      <Status variant={variant} className="flex-none">
        {label}
      </Status>
      <span className="min-w-0 flex-[1_1_200px] text-sm">{children}</span>
      {action}
    </div>
  );
}
