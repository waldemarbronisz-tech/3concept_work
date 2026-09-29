import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-2 p-6 text-center">
      <h1 className="text-3xl font-semibold">3Concept Work</h1>
      <p className="text-ink-2">Wersja beta — dane testowe</p>
      {process.env.NODE_ENV === "development" && (
        <Link href="/dev/ui" className="mt-4 font-mono text-sm text-navy underline">
          Podgląd komponentów UI
        </Link>
      )}
    </main>
  );
}
