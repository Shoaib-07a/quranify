import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader, SourceTag } from "@/components/ui";
import { getAllahNames } from "@/lib/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "99 Names of Allah",
  description: "Al-Asma' al-Husna — the 99 beautiful names of Allah with Arabic, transliteration and meanings in English, Urdu and Hindi.",
};

export default async function NamesIndexPage() {
  const names = await getAllahNames();
  return (
    <div className="px-5">
      <PageHeader
        title="99 Names of Allah"
        subtitle="Al-Asma' al-Husna — The Most Beautiful Names"
        arabic="ٱلْأَسْمَاء ٱلْحُسْنَىٰ"
      />
      <div className="stagger grid grid-cols-2 gap-3 sm:grid-cols-3">
        {names.map((n) => (
          <Link
            key={n.number}
            href={`/names/${n.number}`}
            className="press lift card group flex flex-col items-center gap-1 px-3 py-5 text-center"
          >
            <span className="text-[10.5px] font-bold tracking-widest tabular-nums" style={{ color: "var(--gold)" }} aria-hidden>
              {String(n.number).padStart(2, "0")}
            </span>
            <span className="font-arabic mt-1 text-[26px] leading-[1.5]" dir="rtl" lang="ar" style={{ color: "var(--accent-ink)" }}>
              {n.arabic}
            </span>
            <span className="text-[13.5px] font-bold tracking-tight">{n.transliteration}</span>
            <span className="text-[11px] leading-snug" style={{ color: "var(--muted)" }}>
              {n.meaningEn}
            </span>
          </Link>
        ))}
      </div>
      <div className="mt-5 mb-4 px-1">
        <SourceTag>Arabic text, transliteration &amp; English meaning — Al-Adhan API (Islamic Network). List per the narration of Tirmidhi 3507 (Al-Walid tradition).</SourceTag>
      </div>
    </div>
  );
}
