import { Button } from "./Button";
import { formatHours } from "./format";

export interface StepperProps {
  value: number;
  onChange: (value: number) => void;
  /** Nazwa wartości dla czytników ekranu, np. „Godziny”. */
  label: string;
  step?: number;
  min?: number;
  max?: number;
  /** Szybkie wartości pod licznikiem, np. 4 / 6 / 8 / 10 h. */
  quickValues?: number[];
  format?: (value: number) => string;
}

/** − wartość + (domyślnie godziny co 0,5 h) i szybkie wartości. */
export function Stepper({
  value,
  onChange,
  label,
  step = 0.5,
  min = 0,
  max = 16,
  quickValues = [],
  format = formatHours,
}: StepperProps) {
  const set = (next: number) => onChange(Math.min(max, Math.max(min, next)));

  return (
    <div role="group" aria-label={label}>
      <div className="grid grid-cols-[56px_1fr_56px] gap-2">
        <Button
          size="lg"
          className="px-0 text-2xl"
          aria-label={`Mniej o ${format(step)}`}
          disabled={value <= min}
          onClick={() => set(value - step)}
        >
          −
        </Button>
        <output
          aria-live="polite"
          className="grid place-items-center border-[1.5px] border-ink font-mono text-[26px] font-semibold tabular-nums"
        >
          {format(value)}
        </output>
        <Button
          size="lg"
          className="px-0 text-2xl"
          aria-label={`Więcej o ${format(step)}`}
          disabled={value >= max}
          onClick={() => set(value + step)}
        >
          +
        </Button>
      </div>
      {quickValues.length > 0 && (
        <div
          className="mt-2 grid gap-2"
          style={{ gridTemplateColumns: `repeat(${quickValues.length}, minmax(0, 1fr))` }}
        >
          {quickValues.map((q) => (
            <Button key={q} className="font-mono" onClick={() => set(q)}>
              {String(q)}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
