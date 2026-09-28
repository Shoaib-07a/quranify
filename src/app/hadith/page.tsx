import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Chip, PageHeader } from "@/components/ui";
import { getHadithCollections } from "@/lib/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Hadith Collections",
  description: "Authentic hadith collections with Arabic text, translation, grading and references.",
};

export default async function HadithIndexPage() {
  const collections = await getHadithCollections();
  return (
    <div className="px-5">
      <PageHeader
        title="Hadith"
        subtitle="Sayings & traditions of the Prophet ﷺ"
        arabic="ٱلْحَدِيث"
      />
      <p className="fade-up mb-4 px-1 text-[13px] leading-relaxed" style={{ color: "var(--muted)" }}>
        Every hadith retains its Arabic text, translation, grading and full reference from
        established collections.
      </p>
      <div className="stagger flex flex-col gap-3.5">
        {collections.map((c) => (
          <Link key={c.slug} href={`/hadith/${c.slug}`} className="press lift card group block p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Chip tone="accent">{c.hadithCount.toLocaleString()} hadith</Chip>
                </div>
                <h2 className="font-display mt-2.5 text-[21px] font-semibold tracking-tight">{c.nameEnglish}</h2>
                {c.compiler && (
                  <p className="mt-1 text-[12.5px] font-semibold" style={{ color: "var(--gold)" }}>
                    {c.compiler}
                  </p>
                )}
                {c.description && (
                  <p className="mt-1.5 text-[13px] leading-relaxed" style={{ color: "var(--muted)" }}>
                    {c.description}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 flex-col items-end gap-2">
                {c.nameArabic && (
                  <span className="font-arabic text-[24px] leading-none" dir="rtl" lang="ar" style={{ color: "var(--accent-ink)" }}>
                    {c.nameArabic}
                  </span>
                )}
                <ChevronRight size={18} className="transition-transform group-hover:translate-x-0.5" style={{ color: "var(--muted)" }} aria-hidden />
              </div>
            </div>
          </Link>
        ))}
        {collections.length === 0 && (
          <div className="card-flat px-6 py-12 text-center text-sm" style={{ color: "var(--muted)" }}>
            Hadith collections are being prepared. Please check back shortly.
          </div>
        )}
      </div>
    </div>
  );
}
