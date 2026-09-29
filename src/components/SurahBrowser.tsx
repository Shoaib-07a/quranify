"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { useApp } from "@/lib/store";

export interface SurahListItem {
  number: number;
  nameEnglish: string;
  nameArabic: string;
  ayahCount: number;
  revelationType: string;
  juzStart?: number | null;
  revelationOrder?: number | null;
}

export default function SurahBrowser({
  surahs,
  basePath,
}: {
  surahs: SurahListItem[];
  basePath: "/quran" | "/tafseer";
}) {
  const { lastRead, hydrated, addRecentSurah } = useApp();
  const resume = hydrated ? lastRead : null;
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return surahs;
    return surahs.filter(
      (x) =>
        x.nameEnglish.toLowerCase().includes(s) ||
        x.nameArabic.includes(q.trim()) ||
        String(x.number) === s,
    );
  }, [q, surahs]);

  return (
    <div className="fade-up">
      <label
        className="card-flat mb-4 flex items-center gap-2.5 px-4"
        style={{ height: 48, borderRadius: 999 }}
      >
        <Search size={18} style={{ color: "var(--muted)" }} aria-hidden />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search surah by name or number…"
          aria-label="Search surahs"
          className="w-full bg-transparent text-[15px] outline-none placeholder:text-[14px]"
          style={{ color: "var(--ink)" }}
        />
      </label>

      <ol className="flex flex-col gap-2.5" aria-label="Surah list">
        {filtered.map((s) => {
          const isResume = resume?.surah === s.number;
          return (
            <li key={s.number}>
              <Link
                href={isResume ? `${basePath}/${s.number}#ayah-${resume?.ayah ?? 1}` : `${basePath}/${s.number}`}
                onClick={() => addRecentSurah(s.number)}
                className="press card-flat group flex items-center gap-3.5 px-4 py-3.5"
              >
                <span
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-[13px] font-bold tabular-nums"
                  style={{ background: "var(--accent-soft)", color: "var(--accent-ink)" }}
                  aria-hidden
                >
                  {String(s.number).padStart(2, "0")}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline gap-2">
                    <span className="truncate text-[15px] font-bold tracking-tight">{s.nameEnglish}</span>
                    {isResume && (
                      <span
                        className="shrink-0 rounded-full px-2 py-px text-[10px] font-bold tracking-wide uppercase"
                        style={{ background: "var(--gold-soft)", color: "var(--gold)" }}
                      >
                        Last read
                      </span>
                    )}
                  </span>
                  <span className="mt-0.5 block text-[12.5px]" style={{ color: "var(--muted)" }}>
                    {s.ayahCount} Ayahs · {s.revelationType === "makki" ? "Makki" : "Madani"}
                  </span>
                </span>
                <span className="font-arabic shrink-0 text-[22px] leading-none" dir="rtl" lang="ar" style={{ color: "var(--accent-ink)" }}>
                  {s.nameArabic}
                </span>
              </Link>
            </li>
          );
        })}
        {filtered.length === 0 && (
          <li className="card-flat px-6 py-10 text-center text-sm" style={{ color: "var(--muted)" }}>
            No surah matches “{q}”.
          </li>
        )}
      </ol>
    </div>
  );
}
