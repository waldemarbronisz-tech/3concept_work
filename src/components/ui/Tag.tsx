import { cn } from "./cn";

export interface TagProps {
  /** Kod: budowa, pakiet, zamówienie, WZ. */
  children: string;
  className?: string;
}

/** Oznacznik kodu jak oznacznik kablowy: ramka, mono, „oczko” z lewej. */
export function Tag({ children, className }: TagProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center border-[1.5px] border-ink bg-surface py-px pr-[7px] pl-[5px] font-mono text-[13px] font-semibold tracking-[.04em] whitespace-nowrap",
        className,
      )}
    >
      <span
        aria-hidden
        className="mr-1.5 size-[5px] flex-none rounded-full border-[1.5px] border-ink bg-paper"
      />
      {children}
    </span>
  );
}
