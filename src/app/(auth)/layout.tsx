/** Ekrany logowania: jeden arkusz na środku papieru, telefon pierwszy. */
export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm border-[1.5px] border-ink bg-surface">
        <div className="flex items-center gap-2.5 border-b-[1.5px] border-ink px-4 py-2.5 font-bold tracking-[.02em]">
          <span
            aria-hidden
            className="grid size-[22px] place-items-center bg-navy font-mono text-[11px] font-bold text-white"
          >
            3C
          </span>
          Work
          <span className="ml-auto font-mono text-[11px] font-semibold tracking-[.1em] text-ink-2 uppercase">
            beta
          </span>
        </div>
        {children}
      </div>
    </main>
  );
}
