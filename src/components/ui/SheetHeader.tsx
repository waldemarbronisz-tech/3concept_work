import Image from "next/image";
import mark from "../../../public/brand/3concept-mark.png";
import { TitleBlock, type TitleBlockCell } from "./TitleBlock";

export interface SheetHeaderProps {
  cells: TitleBlockCell[];
  /** Nazwa obok znaku firmy. */
  brand?: string;
}

/** Nagłówek arkusza na desktopie: znak 3Concept + tabelka rysunkowa. */
export function SheetHeader({ cells, brand = "Work" }: SheetHeaderProps) {
  return (
    <header className="flex flex-wrap items-stretch border-b-[1.5px] border-ink">
      <div className="flex items-center gap-2.5 border-r border-line px-4 py-2 font-bold tracking-[.02em]">
        {/* Znak marki (U-01). Karmin tylko tutaj — nigdy w elementach UI. */}
        <Image src={mark} alt="3Concept" height={28} className="h-7 w-auto" priority />
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
