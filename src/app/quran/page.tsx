import type { Metadata } from "next";
import { PageHeader } from "@/components/ui";
import SurahBrowser from "@/components/SurahBrowser";
import { getSurahs } from "@/lib/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Quran — 114 Surahs",
  description: "Browse all 114 Surahs of the Holy Quran with ayah counts and Makki/Madani classification.",
};

export default async function QuranIndexPage() {
  const surahs = await getSurahs();
  return (
    <div className="px-5">
      <PageHeader
        title="The Holy Quran"
        subtitle="114 Surahs · Uthmani script (Tanzil)"
        arabic="ٱلْقُرْآن ٱلْكَرِيم"
      />
      <SurahBrowser
        basePath="/quran"
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
