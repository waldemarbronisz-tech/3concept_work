import type { InputHTMLAttributes } from "react";
import { cn } from "./cn";

export interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
}

/** Pole 48 px, tekst 16 px (bez zoomu na iOS), fokus granatowy. */
export function TextField({ id, label, className, ...input }: TextFieldProps) {
  return (
    <div className={cn("min-w-0", className)}>
      <label
        htmlFor={id}
        className="mb-2 block font-mono text-[11px] font-semibold tracking-[.1em] text-ink-2 uppercase"
      >
        {label}
      </label>
      <input
        id={id}
        className="min-h-12 w-full border-[1.5px] border-line bg-surface px-3 py-2.5 text-base text-ink placeholder:text-ink-2 focus:border-navy"
        {...input}
      />
    </div>
  );
}
