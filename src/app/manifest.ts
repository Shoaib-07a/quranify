import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Quranify — Quran • Tafseer • Islamic Knowledge",
    short_name: "Quranify",
    description:
      "Read the Quran, study Tafseer in English, Urdu and Hindi, and explore Hadith, Duas, Azkaar and the 99 Names of Allah.",
    start_url: "/",
    display: "standalone",
    background_color: "#f5f2ea",
    theme_color: "#0e7568",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
    ],
  };
}
