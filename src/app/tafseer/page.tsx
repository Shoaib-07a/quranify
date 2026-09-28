import type { Metadata } from "next";
import { PageHeader, Chip } from "@/components/ui";
import SurahBrowser from "@/components/SurahBrowser";
import { getSurahs } from "@/lib/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tafseer — Ayah by Ayah",
  description:
    "Detailed, authenticated Tafseer of every Surah, verse by verse — in English, Urdu and Hindi.",
};

export default async function TafseerIndexPage() {
  const surahs = await getSurahs();
  return (
    <div className="px-5">
      <PageHeader
        title="Tafseer"
        subtitle="Ayah-by-ayah explanation of the Quran"
        arabic="ٱلتَّفْسِير"
      />
      <div className="fade-up card-flat mb-5 flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3.5">
        <Chip tone="accent">English · Al-Mukhtasar</Chip>
        <Chip tone="accent">اردو · تذکیرالقرآن</Chip>
        <Chip tone="accent">हिन्दी · अल-मुख़्तसर</Chip>
        <p className="w-full text-[12px] leading-relaxed" style={{ color: "var(--muted)" }}>
          Concise, essential tafseer from verified scholarship — verse, translation and
          explanation always appear together in your chosen language.
        </p>
      </div>
      <SurahBrowser
        basePath="/tafseer"
        surahs={surahs.map((s) => ({
          number: s.number,
          nameEnglish: s.nameEnglish,
          nameArabic: s.nameArabic,
          ayahCount: s.ayahCount,
          revelationType: s.revelationType,
        }))}
      />
    </div>
  );
}
