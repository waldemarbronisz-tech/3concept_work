import Image from "next/image";
import logo from "../../../public/brand/3concept-logo.png";

/** Ekrany logowania: jeden arkusz na środku papieru, pełne logo nad formularzem. */
export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm border-[1.5px] border-ink bg-surface">
        <div className="flex items-end justify-between gap-3 border-b-[1.5px] border-ink px-4 py-4">
          <Image src={logo} alt="3Concept" className="h-auto w-full max-w-[240px]" priority />
          <span className="font-mono text-[11px] font-semibold tracking-[.1em] text-ink-2 uppercase">
            beta
          </span>
        </div>
        {children}
      </div>
    </main>
  );
}
