import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PageHeader, SourceTag } from "@/components/ui";
import { BookmarkButton, TextActions } from "@/components/interactions";
import { getAllahName } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const n = await getAllahName(Number(id));
  return { title: n ? `${n.transliteration} — ${n.meaningEn}` : "Name of Allah" };
}

function MeaningRow({ label, dir, fontClass, children }: { label: string; dir?: "rtl" | "ltr"; fontClass?: string; children: React.ReactNode }) {
  return (
    <div className="card-flat flex items-center justify-between gap-4 px-5 py-4">
      <span className="text-[11px] font-bold tracking-[0.14em] uppercase" style={{ color: "var(--muted)" }}>
        {label}
      </span>
      <span className={`text-right text-[17px] font-semibold ${fontClass ?? ""}`} dir={dir} style={{ color: "var(--ink)" }}>
        {children}
      </span>
    </div>
  );
}

export default async function NameDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const num = Number(id);
  if (!Number.isInteger(num) || num < 1 || num > 99) notFound();
  const n = await getAllahName(num);
  if (!n) notFound();

  const payload = `${n.arabic}\n${n.transliteration} — ${n.meaningEn}\nUrdu: ${n.meaningUr}\nHindi: ${n.meaningHi}\n\nThe ${num}${num === 1 ? "st" : num === 2 ? "nd" : num === 3 ? "rd" : "th"} name of Allah (al-Asma' al-Husna)`;

  return (
    <div className="px-5">
      <PageHeader
        title={`${n.transliteration}`}
        subtitle={`Name ${n.number} of 99`}
        back={{ href: "/names", label: "Back to the 99 names" }}
      />

      <section className="card fade-up relative overflow-hidden px-6 py-10 text-center">
        <p className="text-[11px] font-bold tracking-[0.22em] uppercase" style={{ color: "var(--gold)" }}>
          {String(n.number).padStart(2, "0")} / 99
        </p>
        <p className="font-arabic mt-4 text-[64px] leading-[1.5]" dir="rtl" lang="ar" style={{ color: "var(--accent-ink)" }}>
          {n.arabic}
        </p>
        <h1 className="font-display mt-2 text-[30px] font-semibold tracking-tight">{n.transliteration}</h1>
        <div className="mt-5 flex items-center justify-center gap-2">
          <BookmarkButton
            id={`name:${n.number}`}
            type="name"
            href={`/names/${n.number}`}
            title={`${n.transliteration} — ${n.meaningEn}`}
            subtitle="99 Names of Allah"
          />
          <TextActions payload={payload} shareTitle={`${n.transliteration} — Name of Allah`} />
        </div>
      </section>

      <div className="stagger mt-4 flex flex-col gap-2.5">
        <MeaningRow label="English">{n.meaningEn}</MeaningRow>
        <MeaningRow label="اردو" dir="rtl" fontClass="font-urdu !leading-[2]">
          {n.meaningUr}
        </MeaningRow>
        <MeaningRow label="हिन्दी" fontClass="font-hindi">
          {n.meaningHi}
        </MeaningRow>
      </div>

      <section className="card-flat fade-up mt-4 px-5 py-4.5">
        <p className="text-[11px] font-bold tracking-[0.14em] uppercase" style={{ color: "var(--muted)" }}>
          Meaning
        </p>
        <p className="mt-2 text-[14.5px] leading-[1.85]" style={{ color: "var(--ink-soft)" }}>
          {n.explanation}
        </p>
        {n.reference && (
          <p className="mt-3 border-t pt-3 text-[12px] leading-relaxed" style={{ borderColor: "var(--line)", color: "var(--muted)" }}>
            {n.reference}
          </p>
        )}
      </section>

      <div className="mt-5 flex items-stretch gap-3">
        {num > 1 ? (
          <Link href={`/names/${num - 1}`} className="press card-flat flex flex-1 items-center gap-2 px-4 py-3">
            <ChevronLeft size={16} style={{ color: "var(--accent)" }} aria-hidden />
            <span className="min-w-0">
              <span className="block text-[10px] font-bold tracking-widest uppercase" style={{ color: "var(--muted)" }}>Previous</span>
              <span className="block truncate text-[13.5px] font-bold">Name {num - 1}</span>
            </span>
          </Link>
        ) : <div className="flex-1" />}
        {num < 99 ? (
          <Link href={`/names/${num + 1}`} className="press card-flat flex flex-1 items-center justify-end gap-2 px-4 py-3 text-right">
            <span className="min-w-0">
              <span className="block text-[10px] font-bold tracking-widest uppercase" style={{ color: "var(--muted)" }}>Next</span>
              <span className="block truncate text-[13.5px] font-bold">Name {num + 1}</span>
            </span>
            <ChevronRight size={16} style={{ color: "var(--accent)" }} aria-hidden />
          </Link>
        ) : <div className="flex-1" />}
      </div>

      <div className="mt-5 mb-4 px-1">
        <SourceTag>{n.source}</SourceTag>
      </div>
    </div>
  );
}
