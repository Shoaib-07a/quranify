import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import {
  Amiri_Quran,
  Fraunces,
  Manrope,
  Noto_Nastaliq_Urdu,
  Tiro_Devanagari_Hindi,
} from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/lib/store";
import BottomNav from "@/components/chrome/BottomNav";
import { ensureProvisioned } from "@/lib/provision";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const amiriQuran = Amiri_Quran({
  subsets: ["arabic"],
  weight: "400",
  variable: "--font-amiri-quran",
  display: "swap",
});

const notoNastaliq = Noto_Nastaliq_Urdu({
  subsets: ["arabic"],
  weight: "400",
  variable: "--font-noto-nastaliq",
  display: "swap",
});

const tiroHindi = Tiro_Devanagari_Hindi({
  subsets: ["devanagari"],
  weight: "400",
  variable: "--font-tiro-devanagari",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Quranify — Quran • Tafseer • Islamic Knowledge",
    template: "%s · Quranify",
  },
  description:
    "Quranify — a calm, modern Quran and Islamic knowledge companion. Read the Quran with translation, study detailed Tafseer in English, Urdu and Hindi, and explore Hadith, Duas, Azkaar and the 99 Names of Allah.",
  applicationName: "Quranify",
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f2ea" },
    { media: "(prefers-color-scheme: dark)", color: "#080f0d" },
  ],
  width: "device-width",
  initialScale: 1,
};

const bootScript = `(function(){try{var s=JSON.parse(localStorage.getItem("quranify.settings")||"{}");var d=s.theme==="dark"||((!s.theme||s.theme==="system")&&window.matchMedia("(prefers-color-scheme: dark)").matches);if(d)document.documentElement.classList.add("dark");if(s.arabicSize)document.documentElement.style.setProperty("--reader-ar-size",s.arabicSize+"px");}catch(e){}})();`;

export default function RootLayout({ children }: { children: ReactNode }) {
  // Self-heal the content database in the background if it was reset.
  void ensureProvisioned();
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
      </head>
      <body
        className={`${manrope.variable} ${fraunces.variable} ${amiriQuran.variable} ${notoNastaliq.variable} ${tiroHindi.variable} antialiased`}
      >
        <AppProvider>
          <div className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col">
            <main className="flex-1 pb-32">{children}</main>
          </div>
          <BottomNav />
        </AppProvider>
      </body>
    </html>
  );
}
