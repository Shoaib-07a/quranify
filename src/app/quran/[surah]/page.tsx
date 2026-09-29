import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Chip, PageHeader, SourceTag } from "@/components/ui";
import { BookmarkButton, TextActions, NoteButton } from "@/components/interactions";
import {
  AyahAudioButton,
  FontSizeControl,
  LastReadTracker,
  ReaderSettings,
  ReciterSelector,
} from "@/components/ReaderChrome";
import { getAyahsWithTranslation, getSurah, getSurahs, type LangCode } from "@/lib/queries";
import { getNotesForSurah } from "@/app/actions/notes";

export const dynamic = "force-dynamic";

const LANGS: LangCode[] = ["en", "ur", "hi"];
const BISMILLAH = "بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ surah: string }>;
}): Promise<Metadata> {
  const { surah } = await params;
  const s = await getSurah(Number(surah));
  if (!s) return { title: "Surah not found" };
  return {
    title: `Surah ${s.nameEnglish}`,
    description: `Read Surah ${s.nameEnglish} (${s.nameArabic}) — ${s.ayahCount} ayahs with translation.`,
  };
}

export default async function SurahReaderPage({
  params,
  searchParams,
}: {
  params: Promise<{ surah: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ surah }, sp] = await Promise.all([params, searchParams]);
  const n = Number(surah);
  if (!Number.isInteger(n) || n < 1 || n > 114) notFound();

  const langParam = typeof sp.tl === "string" ? (sp.tl as LangCode) : "en";
  const lang: LangCode = LANGS.includes(langParam) ? langParam : "en";

  const [meta, rows, all, notes] = await Promise.all([
    getSurah(n),
    getAyahsWithTranslation(n, lang),
    getSurahs(),
    getNotesForSurah(n),
  ]);
  if (!meta) notFound();

  const prev = all.find((s) => s.number === n - 1);
  const next = all.find((s) => s.number === n + 1);
  const globalOffset = all
    .filter((s) => s.number < n)
    .reduce((acc, s) => acc + s.ayahCount, 0);
  const translator = rows.find((r) => r.translator)?.translator ?? null;

  return (
    <div className="px-5">
      <PageHeader
        title={`${meta.number}. ${meta.nameEnglish}`}
        subtitle={meta.revelationType === "makki" ? "Makki Surah" : "Madani Surah"}
        arabic={meta.nameArabic}
        back={{ href: "/quran", label: "Back to surah list" }}
        actions={<FontSizeControl />}
      />
      <LastReadTracker surah={n} surahName={meta.nameEnglish} />

      {/* Surah banner */}
      <section className="card fade-up relative mb-3 overflow-hidden px-6 py-8 text-center">
        <p className="text-[11px] font-bold tracking-[0.2em] uppercase" style={{ color: "var(--gold)" }}>
          Surah {String(meta.number).padStart(2, "0")}
        </p>
        <p className="font-arabic mt-3 text-[46px] leading-[1.4]" dir="rtl" lang="ar" style={{ color: "var(--accent-ink)" }}>
          {meta.nameArabic}
        </p>
        <h1 className="font-display mt-1 text-2xl font-semibold tracking-tight">{meta.nameEnglish}</h1>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <Chip tone="accent">{meta.ayahCount} Ayahs</Chip>
          <Chip tone="gold">{meta.revelationType === "makki" ? "Makki" : "Madani"}</Chip>
        </div>
      </section>

      <div className="mb-5 flex flex-col items-center gap-3">
        <ReaderSettings param="tl" />
        <ReciterSelector />
      </div>

      {/* Bismillah (not part of At-Tawbah; Al-Fatihah already includes it as ayah 1) */}
      {n !== 9 && n !== 1 && (
        <p className="font-arabic arabic-size fade-up mb-6 text-center" dir="rtl" lang="ar" style={{ color: "var(--accent-ink)" }}>
          {BISMILLAH}
        </p>
      )}

      {/* Ayahs */}
      <ol className="flex flex-col gap-3">
        {rows.map((a) => {
          const globalId = globalOffset + a.ayahNumber;
          const payload = `${a.textUthmani}\n\n${a.translation ?? ""}\n\n— Surah ${meta.nameEnglish} ${a.surahNumber}:${a.ayahNumber}`;
          return (
            <li key={a.ayahNumber} id={`ayah-${a.ayahNumber}`} data-ayah={a.ayahNumber} className="scroll-mt-32">
              <article className="card-flat fade-up px-5 py-5">
                <div className="mb-3 flex items-center justify-between">
                  <span className="ayah-marker" aria-label={`Ayah ${a.ayahNumber}`}>
                    {a.ayahNumber}
                  </span>
                  <div className="flex items-center gap-2">
                    <AyahAudioButton globalId={globalId} label={`ayah ${a.ayahNumber} of Surah ${meta.nameEnglish}`} />
                    <NoteButton
                      surah={meta.number}
                      ayah={a.ayahNumber}
                      initial={notes.find((n) => n.ayahNumber === a.ayahNumber)?.note}
                    />
                    <BookmarkButton
                      id={`ayah:${a.surahNumber}:${a.ayahNumber}`}
                      type="ayah"
                      href={`/quran/${a.surahNumber}#ayah-${a.ayahNumber}`}
                      title={`${meta.nameEnglish} — Ayah ${a.ayahNumber}`}
                      subtitle="Quran"
                    />
                    <TextActions payload={payload} shareTitle={`Surah ${meta.nameEnglish} ${a.surahNumber}:${a.ayahNumber}`} />
                  </div>
                </div>
                <p className="font-arabic arabic-size text-right" dir="rtl" lang="ar">
                  {a.textUthmani}
                </p>
                {a.translation ? (
                  <p
                    className={`mt-4 border-t pt-4 ${lang === "ur" ? "font-urdu text-right" : lang === "hi" ? "font-hindi" : "leading-relaxed"}`}
                    dir={lang === "ur" ? "rtl" : "ltr"}
                    lang={lang === "ur" ? "ur" : lang === "hi" ? "hi" : "en"}
                    style={{
                      borderColor: "var(--line)",
                      color: "var(--ink-soft)",
                      fontSize: "var(--reader-tr-size, 15px)",
                      lineHeight: lang === "hi" ? "2" : "1.7",
                    }}
                  >
                    {a.translation}
                  </p>
                ) : (
                  <p className="mt-4 border-t pt-4 text-[13px] italic" style={{ borderColor: "var(--line)", color: "var(--muted)" }}>
                    Translation not available in this language yet.
                  </p>
                )}
              </article>
            </li>
          );
        })}
      </ol>

      {/* Surah navigation + attribution */}
      <div className="mt-6 flex items-stretch gap-3">
        {prev ? (
          <Link href={`/quran/${prev.number}`} className="press card-flat flex flex-1 items-center gap-2 px-4 py-3">
            <ChevronLeft size={16} style={{ color: "var(--accent)" }} aria-hidden />
            <span className="min-w-0">
              <span className="block text-[10px] font-bold tracking-widest uppercase" style={{ color: "var(--muted)" }}>Previous</span>
              <span className="block truncate text-[13.5px] font-bold">{prev.nameEnglish}</span>
            </span>
          </Link>
        ) : <div className="flex-1" />}
        {next ? (
          <Link href={`/quran/${next.number}`} className="press card-flat flex flex-1 items-center justify-end gap-2 px-4 py-3 text-right">
            <span className="min-w-0">
              <span className="block text-[10px] font-bold tracking-widest uppercase" style={{ color: "var(--muted)" }}>Next</span>
              <span className="block truncate text-[13.5px] font-bold">{next.nameEnglish}</span>
            </span>
            <ChevronRight size={16} style={{ color: "var(--accent)" }} aria-hidden />
          </Link>
        ) : <div className="flex-1" />}
      </div>

      <div className="mt-5 mb-4 flex flex-col gap-1.5 px-1">
        <SourceTag>Quran text — Tanzil Uthmani (CC-BY-4.0, via quran-json)</SourceTag>
        {translator && <SourceTag>Translation — {translator}</SourceTag>}
        <SourceTag>Recitation — Mishary Rashid Alafasy, Islamic Network CDN (internet required)</SourceTag>
      </div>
    </div>
  );
}
