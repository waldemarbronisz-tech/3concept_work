import Image from "next/image";
import logo from "../../../public/brand/3concept-logo.png";
import mark from "../../../public/brand/3concept-mark.png";

/** Ekrany logowania: arkusz na środku papieru, pełne logo nad formularzem, znak marki jako znak wodny. */
export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <main className="relative flex flex-1 flex-col items-center justify-center overflow-hidden p-4">
      {/* Znak wodny: logo w tle, nie element UI (karmin tylko w marce). */}
      <Image
        src={mark}
        alt=""
        aria-hidden
        priority={false}
        className="pointer-events-none absolute right-[-6%] bottom-[-8%] h-[70vh] w-auto opacity-[0.06] select-none"
      />
      <div className="relative w-full max-w-sm border-[1.5px] border-ink bg-surface">
        <div className="flex items-end justify-between gap-3 border-b-[1.5px] border-ink px-4 py-4">
          <Image src={logo} alt="3Concept" className="h-auto w-full max-w-[240px]" priority />
          <span className="font-mono text-[11px] font-semibold tracking-[.1em] text-ink-2 uppercase">
            beta
          </span>
        </div>
        {children}
      </div>
      <p className="relative mt-4 font-mono text-[11px] tracking-[.1em] text-ink-2 uppercase">
        3Concept Work · platforma operacyjna
      </p>
    </main>
  );
}
