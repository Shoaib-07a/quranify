import type { Metadata } from "next";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, BadgeCheck, MoonStar, Shield, Sparkles, Sunrise } from "lucide-react";
import { ChevronRight } from "lucide-react";
import { PageHeader, SourceTag } from "@/components/ui";
import { getAzkarCategories } from "@/lib/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Azkaar — Daily Remembrance",
  description: "Morning, evening, after-salah and protective adhkar from Hisnul Muslim, with a built-in tasbeeh counter.",
};

const ICONS: Record<string, LucideIcon> = {
  "morning-evening": Sunrise,
  "sleep-night": MoonStar,
  "after-salah": BadgeCheck,
  "praise-remembrance": Sparkles,
  "protection-azkar": Shield,
};

export default async function AzkaarIndexPage() {
  const cats = await getAzkarCategories();
  return (
    <div className="px-5">
      <PageHeader title="Azkaar" subtitle="Daily remembrance of Allah" arabic="ٱلْأَذْكَار" />

      {/* Tasbeeh hub */}
      <Link
        href="/azkaar/tasbeeh"
        className="press lift fade-up mb-5 flex items-center justify-between gap-4 rounded-[24px] p-5"
        style={{
          background: "linear-gradient(150deg, #0c3f38 0%, #0e5a4e 60%, #106456 100%)",
          color: "#f3efe2",
        }}
      >
        <div>
          <p className="text-[11px] font-bold tracking-[0.18em] uppercase" style={{ color: "#bfe3d7" }}>
            Tasbeeh Counter
          </p>
          <p className="font-display mt-1.5 text-[21px] font-semibold tracking-tight">Count your dhikr</p>
          <p className="mt-0.5 text-[12.5px]" style={{ color: "#cde6dc" }}>
            A gentle tap counter with targets of 33, 100 and more.
          </p>
        </div>
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full" style={{ background: "rgba(255,255,255,0.12)" }} aria-hidden>
          <ArrowRight size={19} />
        </span>
      </Link>

      <div className="stagger grid grid-cols-1 gap-3 sm:grid-cols-2">
        {cats.map((c) => {
          const Icon = ICONS[c.slug] ?? Sparkles;
          return (
            <Link key={c.slug} href={`/azkaar/${c.slug}`} className="press lift card group flex items-center gap-4 p-4.5">
              <span
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
                style={{ background: "var(--gold-soft)", color: "var(--gold)" }}
                aria-hidden
              >
                <Icon size={21} strokeWidth={1.9} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[15.5px] font-bold tracking-tight">{c.title}</span>
                <span className="mt-0.5 block text-[12px] leading-snug" style={{ color: "var(--muted)" }}>
                  {c.itemCount} adhkar{c.subtitle ? ` · ${c.subtitle}` : ""}
                </span>
              </span>
              <ChevronRight size={17} className="shrink-0 transition-transform group-hover:translate-x-0.5" style={{ color: "var(--muted)" }} aria-hidden />
            </Link>
          );
        })}
      </div>

      <div className="mt-5 mb-4 px-1">
        <SourceTag>Hisnul Muslim (Fortress of the Muslim) — repetition counts as recorded in the source; references preserved per item.</SourceTag>
      </div>
    </div>
  );
}
