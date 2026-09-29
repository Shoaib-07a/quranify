import type { Metadata } from "next";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  Bookmark,
  ChevronRight,
  HandHeart,
  Search,
  Settings,
  Sparkles,
  Star,
  BookOpen,
} from "lucide-react";
import { PageHeader } from "@/components/ui";

export const metadata: Metadata = {
  title: "More",
  description: "Duas, Azkaar, 99 Names of Allah, bookmarks, search and settings.",
};

const DESTINATIONS: Array<{
  href: string;
  icon: LucideIcon;
  title: string;
  arabic?: string;
  desc: string;
}> = [
  {
    href: "/plans",
    icon: BookOpen,
    title: "Reading Plans",
    desc: "Set a goal to complete the Quran in 7, 15 or 30 days",
  },
  {
    href: "/duas",
    icon: HandHeart,
    title: "Duas",
    arabic: "ٱلدُّعَاء",
    desc: "Authentic supplications for daily life, salah, travel, protection & more",
  },
  {
    href: "/azkaar",
    icon: Sparkles,
    title: "Azkaar",
    arabic: "ٱلْأَذْكَار",
    desc: "Morning, evening & after-salah remembrance — with tasbeeh counter",
  },
  {
    href: "/names",
    icon: Star,
    title: "99 Names of Allah",
    arabic: "ٱلْأَسْمَاء ٱلْحُسْنَىٰ",
    desc: "Al-Asma' al-Husna with meanings in English, Urdu and Hindi",
  },
];

const UTILITIES: Array<{ href: string; icon: LucideIcon; title: string; desc: string }> = [
  { href: "/search", icon: Search, title: "Search", desc: "Find across Quran, tafseer, hadith, duas, azkaar & names" },
  { href: "/bookmarks", icon: Bookmark, title: "Bookmarks", desc: "Everything you saved — stored privately on your device" },
  { href: "/settings", icon: Settings, title: "Settings", desc: "Theme, font size, languages, sources & privacy" },
];

export default function MorePage() {
  return (
    <div className="px-5">
      <PageHeader title="More" subtitle="Library, bookmarks & settings" />

      <div className="stagger flex flex-col gap-3.5">
        {DESTINATIONS.map(({ href, icon: Icon, title, arabic, desc }) => (
          <Link key={href} href={href} className="press lift card group block p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <span
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
                  style={{ background: "var(--accent-soft)", color: "var(--accent-ink)" }}
                  aria-hidden
                >
                  <Icon size={22} strokeWidth={1.9} />
                </span>
                <div>
                  <h2 className="font-display text-[19px] font-semibold tracking-tight">{title}</h2>
                  <p className="mt-1 text-[12.5px] leading-relaxed" style={{ color: "var(--muted)" }}>
                    {desc}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-2">
                {arabic && (
                  <span className="font-arabic text-[20px] leading-none" dir="rtl" lang="ar" style={{ color: "var(--accent-ink)" }}>
                    {arabic}
                  </span>
                )}
                <ChevronRight size={17} className="transition-transform group-hover:translate-x-0.5" style={{ color: "var(--muted)" }} aria-hidden />
              </div>
            </div>
          </Link>
        ))}
      </div>

      <p className="mt-7 mb-3 px-1 text-[11px] font-bold tracking-[0.14em] uppercase" style={{ color: "var(--muted)" }}>
        Library
      </p>
      <div className="stagger flex flex-col gap-2.5">
        {UTILITIES.map(({ href, icon: Icon, title, desc }) => (
          <Link key={href} href={href} className="press card-flat group flex items-center gap-4 px-4 py-4">
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
              style={{ background: "var(--surface-2)", color: "var(--ink-soft)", border: "1px solid var(--line)" }}
              aria-hidden
            >
              <Icon size={18} strokeWidth={1.9} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[15px] font-bold tracking-tight">{title}</span>
              <span className="mt-0.5 block truncate text-[12px]" style={{ color: "var(--muted)" }}>
                {desc}
              </span>
            </span>
            <ChevronRight size={17} className="shrink-0 transition-transform group-hover:translate-x-0.5" style={{ color: "var(--muted)" }} aria-hidden />
          </Link>
        ))}
      </div>

      <p className="mt-8 px-2 pb-2 text-center text-[11.5px] leading-relaxed" style={{ color: "var(--muted)" }}>
        Quranify — Quran • Tafseer • Islamic Knowledge · v1.0
        <br />
        Local-first: your bookmarks and preferences never leave your device.
      </p>
    </div>
  );
}
