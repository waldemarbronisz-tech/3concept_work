import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "3Concept Work",
  description: "Platforma operacyjna 3Concept",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pl" className="h-full antialiased">
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
