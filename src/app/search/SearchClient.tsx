"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  BookText,
  HandHeart,
  Loader2,
  ScrollText,
  Search,
  Sparkles,
  Star,
} from "lucide-react";
import { PageHeader } from "@/components/ui";

interface ApiResults {
  surahs: Array<{ number: number; nameEnglish: string; nameArabic: string }>;
  ayahs: Array<{ surahNumber: number; ayahNumber: number; text: string; lang: string }>;
  hadiths: Array<{ id: number; collection: string; reference: string; text: string }>;
  duas: Array<{ id: number; category: string; title: string | null; text: string }>;
  azkar: Array<{ id: number; category: string; text: string }>;
  names: Array<{ number: number; transliteration: string; meaningEn: string }>;
}

const EMPTY: ApiResults = { surahs: [], ayahs: [], hadiths: [], duas: [], azkar: [], names: [] };

function ResultRow({
  href,
  icon: Icon,
  kicker,
  title,
  snippet,
}: {
  href: string;
  icon: LucideIcon;
  kicker: string;
  title: string;
  snippet?: string;
}) {
  return (
    <li>
      <Link href={href} className="press card-flat flex items-start gap-3 px-4 py-3.5">
        <span
          className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
          style={{ background: "var(--accent-soft)", color: "var(--accent-ink)" }}
          aria-hidden
        >
          <Icon size={16} strokeWidth={1.9} />
        </span>
        <span className="min-w-0">
          <span className="block text-[10px] font-bold tracking-[0.14em] uppercase" style={{ color: "var(--gold)" }}>
            {kicker}
          </span>
          <span className="mt-0.5 block text-[14px] font-bold tracking-tight">{title}</span>
          {snippet && (
            <span className="mt-1 line-clamp-2 block text-[12.5px] leading-relaxed" style={{ color: "var(--muted)" }}>
              {snippet}
            </span>
          )}
        </span>
      </Link>
    </li>
  );
}

export default function SearchClient() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<ApiResults>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const query = q.trim();
    if (query.length < 2) {
      setResults(EMPTY);
      setSearched(false);
      setLoading(false);
      return;
    }
    setLoading(true);
    const t = window.setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const json = (await res.json()) as ApiResults;
        setResults(json);
        setSearched(true);
      } catch {
        setResults(EMPTY);
        setSearched(true);
      } finally {
        setLoading(false);
      }
    }, 320);
    return () => window.clearTimeout(t);
  }, [q]);

  const total =
    results.surahs.length +
    results.ayahs.length +
    results.hadiths.length +
    results.duas.length +
    results.azkar.length +
    results.names.length;

  return (
    <div className="px-5">
      <PageHeader title="Search" subtitle="Quran · Tafseer · Hadith · Duas · Azkaar · Names" />

      <label
        className="card-flat fade-up mb-5 flex items-center gap-2.5 px-4"
        style={{ height: 52, borderRadius: 999 }}
      >
        {loading ? (
          <Loader2 size={19} className="animate-spin" style={{ color: "var(--accent)" }} aria-hidden />
        ) : (
          <Search size={19} style={{ color: "var(--muted)" }} aria-hidden />
        )}
        <input
          ref={inputRef}
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Try “rahmah”, “patience”, “Fatiha”, “knowledge”…"
          aria-label="Search the library"
          className="w-full bg-transparent text-[15.5px] outline-none"
          style={{ color: "var(--ink)" }}
        />
      </label>

      {searched && total === 0 && (
        <div className="card-flat fade-in px-6 py-12 text-center">
          <p className="text-sm font-semibold">No results for “{q.trim()}”</p>
          <p className="mt-1 text-[12.5px]" style={{ color: "var(--muted)" }}>
            Try different keywords — search covers English text, surah names and hadith.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-6">
        {results.surahs.length > 0 && (
          <section>
            <GroupLabel>Surahs</GroupLabel>
            <ol className="flex flex-col gap-2.5">
              {results.surahs.map((s) => (
                <ResultRow
                  key={s.number}
                  href={`/quran/${s.number}`}
                  icon={BookOpen}
                  kicker="Quran"
                  title={`${s.number}. ${s.nameEnglish} — ${s.nameArabic}`}
                />
              ))}
            </ol>
          </section>
        )}

        {results.ayahs.length > 0 && (
          <section>
            <GroupLabel>Ayahs (translation)</GroupLabel>
            <ol className="flex flex-col gap-2.5">
              {results.ayahs.map((a) => (
                <ResultRow
                  key={`${a.surahNumber}:${a.ayahNumber}`}
                  href={`/quran/${a.surahNumber}#ayah-${a.ayahNumber}`}
                  icon={BookText}
                  kicker={`Quran ${a.surahNumber}:${a.ayahNumber}`}
                  title={a.text.slice(0, 90) + (a.text.length > 90 ? "…" : "")}
                />
              ))}
            </ol>
          </section>
        )}

        {results.hadiths.length > 0 && (
          <section>
            <GroupLabel>Hadith</GroupLabel>
            <ol className="flex flex-col gap-2.5">
              {results.hadiths.map((h) => (
                <ResultRow
                  key={h.id}
                  href={`/hadith/${h.collection}?q=${encodeURIComponent(h.reference)}`}
                  icon={ScrollText}
                  kicker={h.reference}
                  title={h.text.slice(0, 110) + (h.text.length > 110 ? "…" : "")}
                />
              ))}
            </ol>
          </section>
        )}

        {results.duas.length > 0 && (
          <section>
            <GroupLabel>Duas</GroupLabel>
            <ol className="flex flex-col gap-2.5">
              {results.duas.map((d) => (
                <ResultRow
                  key={d.id}
                  href={`/duas/${d.category}`}
                  icon={HandHeart}
                  kicker="Dua"
                  title={d.title ?? "Supplication"}
                  snippet={d.text.slice(0, 110)}
                />
              ))}
            </ol>
          </section>
        )}

        {results.azkar.length > 0 && (
          <section>
            <GroupLabel>Azkaar</GroupLabel>
            <ol className="flex flex-col gap-2.5">
              {results.azkar.map((z) => (
                <ResultRow
                  key={z.id}
                  href={`/azkaar/${z.category}`}
                  icon={Sparkles}
                  kicker="Dhikr"
                  title={z.text.slice(0, 110) + (z.text.length > 110 ? "…" : "")}
                />
              ))}
            </ol>
          </section>
        )}

        {results.names.length > 0 && (
          <section>
            <GroupLabel>99 Names of Allah</GroupLabel>
            <ol className="flex flex-col gap-2.5">
              {results.names.map((n) => (
                <ResultRow
                  key={n.number}
                  href={`/names/${n.number}`}
                  icon={Star}
                  kicker={`Name ${n.number}`}
                  title={`${n.transliteration} — ${n.meaningEn}`}
                />
              ))}
            </ol>
          </section>
        )}
      </div>
    </div>
  );
}

function GroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 px-1 text-[11px] font-bold tracking-[0.14em] uppercase" style={{ color: "var(--muted)" }}>
      {children}
    </p>
  );
}
