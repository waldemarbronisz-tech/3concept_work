import type { Key, ReactNode } from "react";
import { cn } from "./cn";

export interface DataTableColumn<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  /** Liczby: mono, tabular-nums, do prawej. */
  numeric?: boolean;
  /** Szerokość kolumny, np. `190px`. */
  width?: string;
}

/** Wiersz z problemem ma znacznik 4 px z lewej w kolorze stanu. */
export type DataTableRowTone = "alarm" | "warn";

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => Key;
  rowTone?: (row: T) => DataTableRowTone | undefined;
  /** Opis tabeli dla czytników ekranu. */
  caption: string;
}

const TONE_MARK: Record<DataTableRowTone, string> = {
  alarm: "shadow-[inset_4px_0_var(--color-alarm)]",
  warn: "shadow-[inset_4px_0_var(--color-warn)]",
};

/** Tabela na desktopie, lista kart na telefonie. Tabela scrolluje we własnym kontenerze. */
export function DataTable<T>({ columns, rows, rowKey, rowTone, caption }: DataTableProps<T>) {
  const [first, ...rest] = columns;

  return (
    <>
      <div className="hidden overflow-x-auto border-t border-line md:block">
        <table className="w-full min-w-[700px] border-collapse text-sm">
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  style={col.width ? { width: col.width } : undefined}
                  className={cn(
                    "border-b-[1.5px] border-ink px-4 py-2.5 font-mono text-[10.5px] font-semibold tracking-[.1em] whitespace-nowrap text-ink-2 uppercase",
                    col.numeric ? "text-right" : "text-left",
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const tone = rowTone?.(row);
              return (
                <tr key={rowKey(row)}>
                  {columns.map((col, i) => (
                    <td
                      key={col.key}
                      className={cn(
                        "border-b border-line px-4 py-3 align-middle",
                        col.numeric && "text-right font-mono whitespace-nowrap tabular-nums",
                        i === 0 && tone && TONE_MARK[tone],
                      )}
                    >
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ul aria-label={caption} className="border-t border-line md:hidden">
        {rows.map((row) => {
          const tone = rowTone?.(row);
          return (
            <li
              key={rowKey(row)}
              className={cn("border-b border-line px-4 py-3", tone && TONE_MARK[tone])}
            >
              {first && <div className="mb-2">{first.render(row)}</div>}
              <dl className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] items-center gap-x-3 gap-y-1.5 text-sm">
                {rest.map((col) => (
                  <div key={col.key} className="contents">
                    <dt className="font-mono text-[10.5px] font-semibold tracking-[.1em] text-ink-2 uppercase">
                      {col.header}
                    </dt>
                    <dd className={cn("min-w-0", col.numeric && "font-mono tabular-nums")}>
                      {col.render(row)}
                    </dd>
                  </div>
                ))}
              </dl>
            </li>
          );
        })}
      </ul>
    </>
  );
}
