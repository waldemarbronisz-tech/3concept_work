import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { UiPreview } from "./ui-preview";

export const metadata: Metadata = {
  title: "Podgląd UI · 3Concept Work",
  robots: { index: false },
};

/** Podgląd komponentów wg docs/ui/preview.html — tylko w trybie development. */
export default function DevUiPage() {
  if (process.env.NODE_ENV !== "development") notFound();
  return <UiPreview />;
}
