import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { TitleBlock, type TitleBlockCell } from "./TitleBlock";

export interface AppBarProps {
  title: string;
  /** Adres „wstecz”; bez niego przycisk wstecz się nie pokazuje. */
  backHref?: string;
  /** Tabelka rysunkowa pod tytułem, np. budowa · obiekt · data. */
  titleBlock?: TitleBlockCell[];
}

/** Pasek ekranu na telefonie: wstecz + tytuł + tabelka rysunkowa. */
export function AppBar({ title, backHref, titleBlock }: AppBarProps) {
  return (
    <header className="bg-surface">
      <div className="flex items-center gap-1.5 py-2 pr-2 pl-1">
        {backHref && (
          <Link
            href={backHref}
            aria-label="Wstecz"
            className="grid size-12 flex-none place-items-center text-ink"
          >
            <ChevronLeft size={24} strokeWidth={1.8} aria-hidden />
          </Link>
        )}
        <h1 className="flex-1 text-[19px] font-semibold">{title}</h1>
      </div>
      {titleBlock && (
        <div className="mx-3">
          <TitleBlock cells={titleBlock} className="grid-cols-[auto_minmax(0,1fr)_auto]" />
        </div>
      )}
    </header>
  );
}
