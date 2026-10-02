import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from "react";
import { cn } from "./cn";

export interface OptionCardProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  name: string;
  children: ReactNode;
  /** Druga linia pod treścią. */
  description?: ReactNode;
}

/** Radio jako karta 56 px: wybór pakietu, rodzaju czasu. */
export function OptionCard({ children, description, className, ...input }: OptionCardProps) {
  return (
    <label
      className={cn(
        "group relative flex min-h-14 cursor-pointer items-center gap-3 border-[1.5px] border-line bg-surface px-3 py-2",
        "has-[input:checked]:border-primary has-[input:checked]:bg-primary-soft has-[input:checked]:shadow-[inset_0_0_0_1px_var(--color-primary)]",
        "has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:outline-primary",
        className,
      )}
    >
      <input type="radio" className="pointer-events-none absolute opacity-0" {...input} />
      <span
        aria-hidden
        className="grid size-5 flex-none place-items-center rounded-full border-[1.5px] border-ink-2 group-has-[input:checked]:border-primary"
      >
        <span className="hidden size-2.5 rounded-full bg-primary group-has-[input:checked]:block" />
      </span>
      <span className="flex min-w-0 flex-col gap-[3px]">
        <span>{children}</span>
        {description && <span className="text-[13px] text-ink-2">{description}</span>}
      </span>
    </label>
  );
}

/** Dodatkowa akcja w liście opcji, np. „Wybierz inny pakiet”. */
export function OptionAction({
  className,
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type={type}
      className={cn(
        "flex min-h-12 cursor-pointer items-center justify-center border-[1.5px] border-dashed border-line bg-surface px-3 font-medium text-primary",
        className,
      )}
      {...props}
    />
  );
}
