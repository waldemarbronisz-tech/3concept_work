import { cn } from "./cn";
import type { StatusVariant } from "./package-status";

export interface StatusProps {
  variant?: StatusVariant;
  /** Tekst stanu jest obowiązkowy — stan nigdy nie jest samym kolorem. */
  children: string;
  className?: string;
}

const BOX: Record<StatusVariant, string> = {
  neutral: "text-ink-2",
  run: "font-medium text-navy",
  done: "text-ink-2",
  warn: "bg-warn-soft py-0.5 pr-2 pl-1.5 font-semibold text-warn shadow-[inset_0_0_0_1px_var(--color-warn)]",
  alarm: "bg-alarm py-0.5 pr-2 pl-1.5 font-semibold text-surface",
};

const LAMP: Record<StatusVariant, string> = {
  neutral: "border-ink-2",
  run: "border-navy bg-navy",
  done: "border-ok bg-ok",
  warn: "border-warn bg-warn",
  alarm: "border-surface bg-surface",
};

/** Lampka + tekst. Kolor tylko przy problemie (warn/alarm mają tło). */
export function Status({ variant = "neutral", children, className }: StatusProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-[7px] text-[13px] whitespace-nowrap",
        BOX[variant],
        className,
      )}
    >
      <span
        aria-hidden
        className={cn("size-2.5 flex-none rounded-full border-[1.5px]", LAMP[variant])}
      />
      {children}
    </span>
  );
}
