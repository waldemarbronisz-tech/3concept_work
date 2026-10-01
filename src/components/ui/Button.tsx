import type { ButtonHTMLAttributes } from "react";
import { cn } from "./cn";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "primary";
  /** `md` — 48 px przy dotyku, 40 px przy myszy; `lg` — główna akcja (56 px). */
  size?: "md" | "lg";
  /** Przycisk przełączany (filtr, wybór dnia) — ustawia `aria-pressed`. */
  pressed?: boolean;
}

/** Przycisk zawsze wygląda jak przycisk: ramka, pogrubiony dół, „siada” po wciśnięciu. */
export function Button({
  variant = "default",
  size = "md",
  pressed,
  type = "button",
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      aria-pressed={pressed}
      className={cn(
        "inline-flex cursor-pointer items-center justify-center gap-2 border-[1.5px] border-b-[3px] px-4 font-medium select-none",
        "enabled:active:translate-y-px enabled:active:border-b-2 motion-reduce:enabled:active:translate-y-0",
        "disabled:cursor-default disabled:border-line disabled:bg-surface disabled:text-line",
        size === "lg" ? "min-h-14 text-[17px]" : "min-h-12 text-[15px] pointer-fine:min-h-10",
        variant === "primary"
          ? "border-primary-dark bg-primary font-semibold text-white"
          : pressed
            ? "border-primary bg-primary-soft font-semibold text-primary"
            : "border-ink bg-surface text-ink",
        className,
      )}
      {...props}
    />
  );
}
