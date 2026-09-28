import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ChevronRight, GraduationCap, Search } from "lucide-react";
import { Chip, EmptyState, PageHeader, SourceTag } from "@/components/ui";
import { BookmarkButton, TextActions } from "@/components/interactions";
import {
  getHadithBooks,
  getHadithCollection,
  getHadiths,
} from "@/lib/queries";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 10;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ collection: string }>;
}): Promise<Metadata> {
  const { collection } = await params;
  const c = await getHadithCollection(collection);
  if (!c) return { title: "Hadith collection" };
  return { title: c.nameEnglish, description: c.description ?? undefined };
}

export default async function HadithCollectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ collection: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ collection }, sp] = await Promise.all([params, searchParams]);
  const col = await getHadithCollection(collection);
  if (!col) notFound();

  const q = typeof sp.q === "string" ? sp.q : "";
  const page = Math.max(1, Number(sp.page) || 1);
  const book = typeof sp.book === "string" ? Number(sp.book) : undefined;

  const [{ rows, total }, books] = await Promise.all([
    getHadiths({ collection: col.slug, page, pageSize: PAGE_SIZE, q, book }),
    getHadithBooks(col.slug),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const buildQuery = (over: Record<string, string | number | undefined>) => {
    const usp = new URLSearchParams();
    if (q) usp.set("q", q);
    if (book) usp.set("book", String(book));
    Object.entries(over).forEach(([k, v]) => {
      if (v === undefined || v === "") usp.delete(k);
      else usp.set(k, String(v));
    });
    const s = usp.toString();
    return s ? `?${s}` : "";
  };

  return (
    <div className="px-5">
      <PageHeader
        title={col.nameEnglish}
        subtitle={`${total.toLocaleString()} hadith${q ? ` matching “${q}”` : ""}`}
        arabic={col.nameArabic ?? undefined}
        back={{ href: "/hadith", label: "Back to hadith collections" }}
      />

      {/* Search */}
      <form method="get" action={`/hadith/${col.slug}`} className="fade-up mb-4 flex gap-2">
        {book && <input type="hidden" name="book" value={book} />}
        <label
          className="card-flat flex flex-1 items-center gap-2.5 px-4"
          style={{ height: 48, borderRadius: 999 }}
        >
          <Search size={18} style={{ color: "var(--muted)" }} aria-hidden />
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder={`Search within ${col.nameEnglish}…`}
            aria-label={`Search within ${col.nameEnglish}`}
            className="w-full bg-transparent text-[15px] outline-none"
            style={{ color: "var(--ink)" }}
          />
        </label>
        <button
          type="submit"
          className="press rounded-full px-5 text-[13.5px] font-bold text-white"
          style={{ background: "var(--accent)" }}
        >
          Search
        </button>
      </form>

      {/* Book filter */}
      {books.length > 1 && (
        <div className="no-scrollbar fade-up -mx-5 mb-4 flex gap-2 overflow-x-auto px-5 pb-1" role="list" aria-label="Filter by book">
          <Link
            href={`/hadith/${col.slug}${buildQuery({ book: undefined, page: undefined })}`}
            className="press shrink-0 rounded-full border px-3.5 py-1.5 text-[12px] font-bold whitespace-nowrap"
            style={{
              borderColor: !book ? "var(--accent-line)" : "var(--line)",
              background: !book ? "var(--accent-soft)" : "var(--surface)",
              color: !book ? "var(--accent-ink)" : "var(--ink-soft)",
            }}
          >
            All books
          </Link>
          {books
            .filter((b) => b.bookNumber !== null)
            .map((b) => (
              <Link
                key={b.bookNumber}
                href={`/hadith/${col.slug}${buildQuery({ book: b.bookNumber ?? undefined })}`}
                className="press shrink-0 rounded-full border px-3.5 py-1.5 text-[12px] font-bold whitespace-nowrap"
                style={{
                  borderColor: book === b.bookNumber ? "var(--accent-line)" : "var(--line)",
                  background: book === b.bookNumber ? "var(--accent-soft)" : "var(--surface)",
                  color: book === b.bookNumber ? "var(--accent-ink)" : "var(--ink-soft)",
                }}
              >
                {b.bookTitle ?? `Book ${b.bookNumber}`}
              </Link>
            ))}
        </div>
      )}

      {/* Hadith list */}
      <ol className="flex flex-col gap-3.5">
        {rows.map((h) => {
          let grades: Array<{ name: string; grade: string }> = [];
          try {
            if (h.grades) grades = JSON.parse(h.grades);
          } catch {}
          const payload = `${h.arabic ? h.arabic + "\n\n" : ""}${h.english}\n\n— ${h.reference}${h.bookTitle ? ` (${h.bookTitle})` : ""}`;
          return (
            <li key={h.id}>
              <article className="card fade-up px-5 py-5">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <Chip tone="accent">{h.reference}</Chip>
                  {h.bookTitle && <Chip>{h.bookTitle}</Chip>}
                  {grades.slice(0, 1).map((g, i) => (
                    <Chip key={i} tone="gold">
                      <GraduationCap size={11} aria-hidden /> {g.grade}
                      {g.name ? ` · ${g.name}` : ""}
                    </Chip>
                  ))}
                </div>
                {h.arabic && (
                  <p className="font-arabic text-right text-[22px] leading-[2.1]" dir="rtl" lang="ar">
                    {h.arabic}
                  </p>
                )}
                <p className={`${h.arabic ? "mt-4 border-t pt-4" : ""} text-[14.5px] leading-[1.85]`} style={{ borderColor: "var(--line)", color: "var(--ink-soft)" }}>
                  {h.english}
                </p>
                <div className="mt-4 flex items-center justify-between border-t pt-3.5" style={{ borderColor: "var(--line)" }}>
                  <p className="max-w-[55%] truncate text-[11px]" style={{ color: "var(--muted)" }}>
                    {h.source}
                  </p>
                  <div className="flex items-center gap-2">
                    <BookmarkButton
                      id={`hadith:${h.collection}:${h.hadithNumber}`}
                      type="hadith"
                      href={`/hadith/${h.collection}?q=${encodeURIComponent(h.reference)}`}
                      title={h.reference}
                      subtitle={`Hadith · ${col.nameEnglish}`}
                    />
                    <TextActions payload={payload} shareTitle={h.reference} />
                  </div>
                </div>
              </article>
            </li>
          );
        })}
      </ol>

      {rows.length === 0 && (
        <EmptyState title="No hadith found" subtitle={q ? `Nothing in ${col.nameEnglish} matches “${q}”.` : "This collection is empty."} />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          {page > 1 ? (
            <Link href={`/hadith/${col.slug}${buildQuery({ page: page - 1 })}`} className="press card-flat flex items-center gap-1.5 px-4 py-2.5 text-[13px] font-bold">
              <ChevronLeft size={15} style={{ color: "var(--accent)" }} aria-hidden /> Newer
            </Link>
          ) : <span />}
          <span className="text-[12px] font-semibold" style={{ color: "var(--muted)" }}>
            Page {page} of {totalPages}
          </span>
          {page < totalPages ? (
            <Link href={`/hadith/${col.slug}${buildQuery({ page: page + 1 })}`} className="press card-flat flex items-center gap-1.5 px-4 py-2.5 text-[13px] font-bold">
              Older <ChevronRight size={15} style={{ color: "var(--accent)" }} aria-hidden />
            </Link>
          ) : <span />}
        </div>
      )}

      <div className="mt-5 mb-4 px-1">
        <SourceTag>{col.nameEnglish} — Sunnah.com-aligned dataset via the public fawazahmed0/hadith-api mirror. Grades as recorded in the source dataset.</SourceTag>
      </div>
    </div>
  );
}
