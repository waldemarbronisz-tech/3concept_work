import type { ReactNode } from "react";
import { cn } from "./cn";

export interface TitleBlockCell {
  label: string;
  value: ReactNode;
  /** Kod lub liczba — pismo mono. */
  mono?: boolean;
}

export interface TitleBlockProps {
  cells: TitleBlockCell[];
  /** Kolumny siatki, np. `grid-cols-[auto_1fr_auto]`; domyślnie równe, w jednym rzędzie. */
  className?: string;
  /** Bez własnej ramki, gdy tabelka siedzi w nagłówku arkusza. */
  bare?: boolean;
}

/** Tabelka rysunkowa: niesie dane ekranu (budowa, obiekt, arkusz, aktualizacja). */
export function TitleBlock({ cells, className, bare = false }: TitleBlockProps) {
  return (
    <dl
      className={cn(
        "grid min-w-0 gap-px bg-line",
        !bare && "border-[1.5px] border-ink",
        className ?? "grid-flow-col auto-cols-[minmax(0,1fr)]",
      )}
    >
      {cells.map((cell) => (
        <div key={cell.label} className="min-w-0 bg-surface px-2 py-[5px] md:px-3 md:py-[7px]">
          <dt className="font-mono text-[9.5px] font-medium tracking-[.1em] text-ink-2 uppercase">
            {cell.label}
          </dt>
          <dd className={cn("truncate text-sm font-semibold", cell.mono && "font-mono")}>
            {cell.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
