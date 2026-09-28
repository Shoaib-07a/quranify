import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ChevronRight, BookText } from "lucide-react";
import { Chip, PageHeader, SourceTag } from "@/components/ui";
import { BookmarkButton, TextActions } from "@/components/interactions";
import { FontSizeControl, ReaderSettings } from "@/components/ReaderChrome";
import { getSurah, getSurahs, getTafsirPage, type LangCode } from "@/lib/queries";

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
    title: `Tafseer — Surah ${s.nameEnglish}`,
    description: `Detailed ayah-by-ayah tafseer of Surah ${s.nameEnglish} in English, Urdu and Hindi.`,
  };
}

function Paragraphs({ text, lang }: { text: string; lang: LangCode }) {
  const paragraphs = text.split(/\n{2,}|\r\n{1,}/).filter((p) => p.trim().length > 0);
  const cls =
    lang === "ur"
      ? "font-urdu text-right text-[16px]"
      : lang === "hi"
        ? "font-hindi text-[16px] leading-[2.05]"
        : "text-[14.5px] leading-[1.85]";
  return (
    <div
      className={`q-prose ${cls}`}
      dir={lang === "ur" ? "rtl" : "ltr"}
      lang={lang === "ur" ? "ur" : lang === "hi" ? "hi" : "en"}
      style={{ color: "var(--ink-soft)" }}
    >
      {paragraphs.map((p, i) => (
        <p key={i} className="whitespace-pre-line">{p.trim()}</p>
      ))}
    </div>
  );
}

export default async function TafseerReaderPage({
  params,
  searchParams,
}: {
  params: Promise<{ surah: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ surah }, sp] = await Promise.all([params, searchParams]);
  const n = Number(surah);
  if (!Number.isInteger(n) || n < 1 || n > 114) notFound();

  const langParam = typeof sp.lang === "string" ? (sp.lang as LangCode) : "en";
  const lang: LangCode = LANGS.includes(langParam) ? langParam : "en";

  const [meta, rows, all] = await Promise.all([getSurah(n), getTafsirPage(n, lang), getSurahs()]);
  if (!meta) notFound();

  const prev = all.find((s) => s.number === n - 1);
  const next = all.find((s) => s.number === n + 1);
  const tafsirSource = rows.find((r) => r.tafsirSource)?.tafsirSource ?? null;
  const translator = rows.find((r) => r.translator)?.translator ?? null;

  return (
    <div className="px-5">
      <PageHeader
        title={`Tafseer · ${meta.nameEnglish}`}
        subtitle={`Surah ${meta.number} · ${meta.ayahCount} ayahs`}
        arabic={meta.nameArabic}
        back={{ href: "/tafseer", label: "Back to tafseer surah list" }}
        actions={<FontSizeControl />}
      />

      <div className="mb-5 flex items-center justify-center">
        <ReaderSettings param="lang" />
      </div>

      {n !== 9 && n !== 1 && (
        <p className="font-arabic arabic-size fade-up mb-6 text-center" dir="rtl" lang="ar" style={{ color: "var(--accent-ink)" }}>
          {BISMILLAH}
        </p>
      )}

      <ol className="flex flex-col gap-4">
        {rows.map((a) => {
          const payload = `${meta.nameEnglish} ${a.surahNumber}:${a.ayahNumber}\n\n${a.textUthmani}\n\n${a.translation ?? ""}\n\nTafseer:\n${a.tafsirText ?? ""}`;
          return (
            <li key={a.ayahNumber} id={`ayah-${a.ayahNumber}`} className="scroll-mt-32">
              <article className="card fade-up overflow-hidden">
                {/* Verse */}
                <div className="px-5 pt-5 pb-5">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="ayah-marker" aria-label={`Ayah ${a.ayahNumber}`}>{a.ayahNumber}</span>
                    <div className="flex items-center gap-2">
                      <BookmarkButton
                        id={`tafseer:${a.surahNumber}:${a.ayahNumber}:${lang}`}
                        type="tafseer"
                        href={`/tafseer/${a.surahNumber}?lang=${lang}#ayah-${a.ayahNumber}`}
                        title={`Tafseer ${meta.nameEnglish} — Ayah ${a.ayahNumber}`}
                        subtitle={`Tafseer · ${lang.toUpperCase()}`}
                      />
                      <TextActions payload={payload} shareTitle={`Tafseer of ${meta.nameEnglish} ${a.surahNumber}:${a.ayahNumber}`} />
                    </div>
                  </div>
                  <p className="font-arabic arabic-size text-right" dir="rtl" lang="ar">
                    {a.textUthmani}
                  </p>
                  {a.translation && (
                    <p
                      className={`mt-4 border-l-2 pl-4 ${lang === "ur" ? "font-urdu border-r-2 border-l-0 pr-4 pl-0 text-right text-[16px]" : lang === "hi" ? "font-hindi text-[16px] leading-[2]" : "text-[15px] leading-relaxed"}`}
                      dir={lang === "ur" ? "rtl" : "ltr"}
                      lang={lang === "ur" ? "ur" : lang === "hi" ? "hi" : "en"}
                      style={{ borderColor: "var(--accent-line)", color: "var(--ink-soft)" }}
                    >
                      {a.translation}
                    </p>
                  )}
                </div>

                {/* Tafseer */}
                <div className="border-t px-5 py-5" style={{ borderColor: "var(--line)", background: "var(--surface-2)" }}>
                  <div className="mb-3 flex items-center gap-2">
                    <BookText size={14} style={{ color: "var(--gold)" }} aria-hidden />
                    <p className="text-[11px] font-bold tracking-[0.14em] uppercase" style={{ color: "var(--gold)" }}>
                      Tafseer — {lang === "en" ? "Detailed commentary" : lang === "ur" ? "تفصیلی تفسیر" : "विस्तृत टिप्पणी"}
                    </p>
                  </div>
                  {a.tafsirText ? (
                    <Paragraphs text={a.tafsirText} lang={lang} />
                  ) : (
                    <p className="text-[13px] italic" style={{ color: "var(--muted)" }}>
                      Tafseer for this ayah is not yet digitised in this language — please try English.
                    </p>
                  )}
                </div>
              </article>
            </li>
          );
        })}
      </ol>

      <div className="mt-6 flex items-stretch gap-3">
        {prev ? (
          <Link href={`/tafseer/${prev.number}?lang=${lang}`} className="press card-flat flex flex-1 items-center gap-2 px-4 py-3">
            <ChevronLeft size={16} style={{ color: "var(--accent)" }} aria-hidden />
            <span className="min-w-0">
              <span className="block text-[10px] font-bold tracking-widest uppercase" style={{ color: "var(--muted)" }}>Previous</span>
              <span className="block truncate text-[13.5px] font-bold">{prev.nameEnglish}</span>
            </span>
          </Link>
        ) : <div className="flex-1" />}
        {next ? (
          <Link href={`/tafseer/${next.number}?lang=${lang}`} className="press card-flat flex flex-1 items-center justify-end gap-2 px-4 py-3 text-right">
            <span className="min-w-0">
              <span className="block text-[10px] font-bold tracking-widest uppercase" style={{ color: "var(--muted)" }}>Next</span>
              <span className="block truncate text-[13.5px] font-bold">{next.nameEnglish}</span>
            </span>
            <ChevronRight size={16} style={{ color: "var(--accent)" }} aria-hidden />
          </Link>
        ) : <div className="flex-1" />}
      </div>

      <div className="mt-5 mb-4 flex flex-col gap-1.5 px-1">
        <SourceTag>Quran text — Tanzil Uthmani (CC-BY-4.0)</SourceTag>
        {translator && <SourceTag>Translation — {translator}</SourceTag>}
        {tafsirSource && <SourceTag>{tafsirSource} — via spa5k/tafsir_api (tafsir.app mirror)</SourceTag>}
      </div>
    </div>
  );
}
