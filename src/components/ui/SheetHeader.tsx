import { TitleBlock, type TitleBlockCell } from "./TitleBlock";

export interface SheetHeaderProps {
  cells: TitleBlockCell[];
  /** Nazwa obok znaku firmy. */
  brand?: string;
}

/** Nagłówek arkusza na desktopie: znak firmy + tabelka rysunkowa. */
export function SheetHeader({ cells, brand = "Work" }: SheetHeaderProps) {
  return (
    <header className="flex flex-wrap items-stretch border-b-[1.5px] border-ink">
      <div className="flex items-center gap-2.5 border-r border-line px-4 py-2.5 font-bold tracking-[.02em]">
        {/* Znak „3C” do czasu logo firmy (UI_STYLE U-01). */}
        <span
          aria-hidden
          className="grid size-[22px] place-items-center bg-navy font-mono text-[11px] font-bold text-white"
        >
          3C
        </span>
        {brand}
      </div>
      <div className="min-w-0 flex-[1_1_320px]">
        <TitleBlock
          bare
          cells={cells}
          className="h-full grid-cols-[repeat(auto-fit,minmax(140px,1fr))]"
        />
      </div>
    </header>
  );
}
