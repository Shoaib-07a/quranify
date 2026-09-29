"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, BookOpen, BookText, Search, Settings, Clock, Flame, Target } from "lucide-react";
import { useApp } from "@/lib/store";

function StarOfIsar({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden fill="none" stroke="currentColor" strokeWidth="1.4">
      <rect x="22" y="22" width="56" height="56" />
      <rect x="22" y="22" width="56" height="56" transform="rotate(45 50 50)" />
      <circle cx="50" cy="50" r="12" />
    </svg>
  );
}

export default function HomePage() {
  const { lastRead, recentSurahs, hydrated } = useApp();
  const [ayahOfDay, setAyahOfDay] = useState<{ ar: string; en: string; ref: string } | null>(null);

  useEffect(() => {
    // In a real app, this would be a daily dynamic fetch. Here we simulate.
    setAyahOfDay({
      ar: "فَاصْبِرْ صَبْرًا جَمِيلًا",
      en: "So be patient with beautiful patience.",
      ref: "70:5",
    });
  }, []);

  return (
    <div className="px-5 pt-5 pb-10">
      {/* Top bar */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span
            className="flex h-10 w-10 items-center justify-center rounded-2xl"
            style={{ background: "var(--accent)", color: "var(--surface)" }}
            aria-hidden
          >
            <span className="font-arabic text-[19px] leading-none">ق</span>
          </span>
          <div>
            <p className="font-display text-[20px] font-semibold leading-none tracking-tight">Quranify</p>
            <p className="mt-1 text-[10.5px] font-semibold tracking-[0.16em] uppercase" style={{ color: "var(--muted)" }}>
              Quranify
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/search"
            aria-label="Search"
            className="press card-flat flex h-10 w-10 items-center justify-center"
            style={{ color: "var(--ink-soft)" }}
          >
            <Search size={18} aria-hidden />
          </Link>
          <Link
            href="/settings"
            aria-label="Settings"
            className="press card-flat flex h-10 w-10 items-center justify-center"
            style={{ color: "var(--ink-soft)" }}
          >
            <Settings size={18} aria-hidden />
          </Link>
        </div>
      </div>

      {/* Greeting hero */}
      <section
        className="fade-up relative overflow-hidden rounded-[28px] px-6 py-8 text-center"
        style={{
          background: "linear-gradient(160deg, #0c3f38 0%, #0e5a4e 55%, #106456 100%)",
          color: "#f3efe2",
        }}
      >
        <div className="pointer-events-none absolute inset-0 opacity-[0.16]" aria-hidden>
          <StarOfIsar className="absolute -top-10 -right-8 h-44 w-44" />
        </div>
        <p className="text-[11px] font-bold tracking-[0.22em] uppercase" style={{ color: "#bfe3d7" }}>
          As-salamu alaykum
        </p>
        
        {ayahOfDay && (
          <div className="mt-4">
            <p className="font-arabic text-[26px] leading-relaxed" dir="rtl" lang="ar">
              {ayahOfDay.ar}
            </p>
            <p className="mt-2 text-[13px] italic opacity-90">
              "{ayahOfDay.en}" — {ayahOfDay.ref}
            </p>
          </div>
        )}
      </section>

      {/* Stats / Progress Bar */}
      <div className="fade-up mt-4 grid grid-cols-2 gap-3">
        <div className="card-flat flex flex-col items-center p-3 text-center">
          <Flame size={18} className="text-orange-500" />
          <p className="mt-1 text-[11px] font-bold uppercase tracking-widest text-muted">Reading Streak</p>
          <p className="text-lg font-bold">3 Days</p>
        </div>
        <div className="card-flat flex flex-col items-center p-3 text-center">
          <Target size={18} className="text-blue-500" />
          <p className="mt-1 text-[11px] font-bold uppercase tracking-widest text-muted">Surah Goal</p>
          <p className="text-lg font-bold">12 / 114</p>
        </div>
      </div>

      {/* Continue Reading */}
      {hydrated && lastRead && (
        <Link
          href={`/quran/${lastRead.surah}#ayah-${lastRead.ayah}`}
          className="press lift card mt-4 flex items-center gap-4 p-5"
        >
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
            style={{ background: "var(--gold-soft)", color: "var(--gold)" }}
          >
            <Clock size={22} />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">Continue Reading</p>
            <h3 className="text-lg font-bold leading-tight">{lastRead.surahName}</h3>
            <p className="text-xs text-muted">Last read ayah {lastRead.ayah}</p>
          </div>
          <ArrowUpRight size={18} className="text-muted" />
        </Link>
      )}

      {/* Primary destinations */}
      <div className="stagger mt-5 flex flex-col gap-4">
        <Link href="/quran" className="press lift card group relative block overflow-hidden p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <BookOpen size={16} style={{ color: "var(--accent)" }} aria-hidden />
                <p className="text-[11px] font-bold tracking-[0.16em] uppercase" style={{ color: "var(--accent)" }}>
                  Quran
                </p>
              </div>
              <h2 className="font-display mt-2.5 text-[24px] font-semibold tracking-tight">
                Read the Quran
              </h2>
            </div>
            <span className="font-arabic text-[40px] leading-none" dir="rtl" lang="ar" style={{ color: "var(--accent-ink)" }} aria-hidden>
              ٱلْقُرْآن
            </span>
          </div>
        </Link>

        <Link href="/tafseer" className="press lift card group relative block overflow-hidden p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <BookText size={16} style={{ color: "var(--gold)" }} aria-hidden />
                <p className="text-[11px] font-bold tracking-[0.16em] uppercase" style={{ color: "var(--gold)" }}>
                  Tafseer
                </p>
              </div>
              <h2 className="font-display mt-2.5 text-[24px] font-semibold tracking-tight">
                Detailed Tafseer
              </h2>
            </div>
            <span className="font-arabic text-[40px] leading-none" dir="rtl" lang="ar" style={{ color: "var(--accent-ink)" }} aria-hidden>
              ٱلتَّفْسِير
            </span>
          </div>
        </Link>
      </div>

      {/* Recent Surahs */}
      {hydrated && recentSurahs.length > 0 && (
        <div className="mt-8">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-muted">Recently Opened</p>
          <div className="no-scrollbar flex gap-3 overflow-x-auto pb-2">
            {recentSurahs.map((num) => (
              <Link
                key={num}
                href={`/quran/${num}`}
                className="press card-flat flex min-w-[120px] flex-col items-center gap-1 p-4"
              >
                <span className="font-arabic text-xl" style={{ color: "var(--accent)" }}>
                  Surah {num}
                </span>
                <span className="text-[10px] font-bold text-muted">Open Reader</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <p className="mt-10 flex items-center justify-center gap-1.5 px-2 pb-2 text-center text-[11.5px] leading-relaxed" style={{ color: "var(--muted)" }}>
        <span aria-hidden>✦</span>
        <span>
          Made by <span className="font-bold" style={{ color: "var(--ink-soft)" }}>Shoaib</span>
        </span>
        <span aria-hidden>✦</span>
      </p>
    </div>
  );
}
