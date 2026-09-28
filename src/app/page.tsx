import Link from "next/link";
import { ArrowUpRight, BookOpen, BookText, Search, Settings } from "lucide-react";

function StarOfIsar({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden fill="none" stroke="currentColor" strokeWidth="1.4">
      <rect x="22" y="22" width="56" height="56" />
      <rect x="22" y="22" width="56" height="56" transform="rotate(45 50 50)" />
      <circle cx="50" cy="50" r="12" />
    </svg>
  );
}

export default function HomePage() {
  return (
    <div className="px-5 pt-5">
      {/* Top bar */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span
            className="flex h-10 w-10 items-center justify-center rounded-2xl"
            style={{ background: "var(--accent)", color: "var(--surface)" }}
            aria-hidden
          >
            <span className="font-arabic text-[19px] leading-none">ق</span>
          </span>
          <div>
            <p className="font-display text-[20px] font-semibold leading-none tracking-tight">Quranify</p>
            <p className="mt-1 text-[10.5px] font-semibold tracking-[0.16em] uppercase" style={{ color: "var(--muted)" }}>
              Quran · Tafseer · Knowledge
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/search"
            aria-label="Search the library"
            className="press card-flat flex h-10 w-10 items-center justify-center"
            style={{ color: "var(--ink-soft)" }}
          >
            <Search size={18} aria-hidden />
          </Link>
          <Link
            href="/settings"
            aria-label="Open settings"
            className="press card-flat flex h-10 w-10 items-center justify-center"
            style={{ color: "var(--ink-soft)" }}
          >
            <Settings size={18} aria-hidden />
          </Link>
        </div>
      </div>

      {/* Greeting hero */}
      <section
        className="fade-up relative overflow-hidden rounded-[28px] px-6 py-9 text-center"
        style={{
          background:
            "linear-gradient(160deg, #0c3f38 0%, #0e5a4e 55%, #106456 100%)",
          color: "#f3efe2",
        }}
      >
        <div className="pointer-events-none absolute inset-0 opacity-[0.16]" aria-hidden>
          <StarOfIsar className="absolute -top-10 -right-8 h-44 w-44" />
          <StarOfIsar className="absolute -bottom-14 -left-10 h-48 w-48" />
        </div>
        <p className="fade-up text-[12px] font-semibold tracking-[0.22em] uppercase" style={{ color: "#bfe3d7" }}>
          As-salamu alaykum
        </p>
        <p
          className="font-arabic mx-auto mt-5 max-w-md text-[30px] leading-[2]"
          dir="rtl"
          lang="ar"
        >
          بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
        </p>
        <p className="mx-auto mt-4 max-w-sm text-[14px] leading-relaxed" style={{ color: "#cde6dc" }}>
          In the name of Allah, the Most Gracious, the Most Merciful
        </p>
      </section>

      {/* Primary destinations */}
      <div className="stagger mt-5 flex flex-col gap-4">
        <Link href="/quran" className="press lift card group relative block overflow-hidden p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <BookOpen size={16} style={{ color: "var(--accent)" }} aria-hidden />
                <p className="text-[11px] font-bold tracking-[0.16em] uppercase" style={{ color: "var(--accent)" }}>
                  Quran
                </p>
              </div>
              <h2 className="font-display mt-2.5 text-[26px] leading-tight font-semibold tracking-tight">
                Read the Quran
              </h2>
              <p className="mt-1.5 max-w-[16rem] text-[13.5px] leading-relaxed" style={{ color: "var(--muted)" }}>
                All 114 Surahs with translation, bookmarks and a calm reading experience.
              </p>
            </div>
            <span className="font-arabic text-[44px] leading-none" dir="rtl" lang="ar" style={{ color: "var(--accent-ink)" }} aria-hidden>
              ٱلْقُرْآن
            </span>
          </div>
          <div className="mt-5 flex items-center gap-1.5 text-[13px] font-bold" style={{ color: "var(--accent)" }}>
            Open Quran
            <ArrowUpRight size={15} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
          </div>
        </Link>

        <Link href="/tafseer" className="press lift card group relative block overflow-hidden p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <BookText size={16} style={{ color: "var(--gold)" }} aria-hidden />
                <p className="text-[11px] font-bold tracking-[0.16em] uppercase" style={{ color: "var(--gold)" }}>
                  Tafseer
                </p>
              </div>
              <h2 className="font-display mt-2.5 text-[26px] leading-tight font-semibold tracking-tight">
                Detailed Surah Tafseer
              </h2>
              <p className="mt-1.5 max-w-[16rem] text-[13.5px] leading-relaxed" style={{ color: "var(--muted)" }}>
                Ayah-by-ayah explanation from verified scholarship — in English, اردو and हिन्दी.
              </p>
            </div>
            <span className="font-arabic text-[44px] leading-none" dir="rtl" lang="ar" style={{ color: "var(--accent-ink)" }} aria-hidden>
              ٱلتَّفْسِير
            </span>
          </div>
          <div className="mt-5 flex items-center gap-1.5 text-[13px] font-bold" style={{ color: "var(--gold)" }}>
            Open Tafseer
            <ArrowUpRight size={15} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
          </div>
        </Link>
      </div>

      <p className="mt-8 flex items-center justify-center gap-1.5 px-2 pb-2 text-center text-[11.5px] leading-relaxed" style={{ color: "var(--muted)" }}>
        <span aria-hidden>✦</span>
        <span>
          Made by <span className="font-bold" style={{ color: "var(--ink-soft)" }}>Shoaib</span>
        </span>
        <span aria-hidden>✦</span>
      </p>
    </div>
  );
}
