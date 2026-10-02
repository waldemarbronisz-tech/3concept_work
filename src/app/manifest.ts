import type { MetadataRoute } from "next";

/** Manifest PWA: ikony ze znaku marki (scripts/generate-icons.mjs), kolory z tokenów UI_STYLE §3. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "3Concept Work",
    short_name: "3C Work",
    description: "Platforma operacyjna 3Concept — budowy, pakiety, czas pracy",
    lang: "pl",
    start_url: "/",
    display: "standalone",
    background_color: "#f1f1f2",
    theme_color: "#525355",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
