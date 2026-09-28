import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Repeat } from "lucide-react";
import { Chip, PageHeader, SectionLabel } from "@/components/ui";
import { BookmarkButton, TextActions } from "@/components/interactions";
import { getDuaCategory, getDuasByCategory } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const c = await getDuaCategory(category);
  return { title: c ? `Duas — ${c.title}` : "Duas" };
}

export default async function DuaCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const [cat, items] = await Promise.all([getDuaCategory(category), getDuasByCategory(category)]);
  if (!cat) notFound();

  // Group by chapter while preserving source order.
  const groups: Array<{ title: string; items: typeof items }> = [];
  for (const d of items) {
    const last = groups[groups.length - 1];
    if (last && last.title === d.chapterTitle) last.items.push(d);
    else groups.push({ title: d.chapterTitle, items: [d] });
  }

  return (
    <div className="px-5">
      <PageHeader
        title={cat.title}
        subtitle={`${cat.itemCount} authentic supplications`}
        arabic="ٱلدُّعَاء"
        back={{ href: "/duas", label: "Back to dua categories" }}
      />
      {groups.map((g) => (
        <div key={g.title} className="mb-6">
          <SectionLabel>{g.title}</SectionLabel>
          <ol className="flex flex-col gap-3.5">
            {g.items.map((d) => {
              const payload = `${d.title ? d.title + "\n\n" : ""}${d.arabic}\n\n${d.translation}\n\n— ${d.reference ?? cat.title} · Hisnul Muslim`;
              return (
                <li key={d.id}>
                  <article className="card fade-up px-5 py-5">
                    {d.title && (
                      <p className="mb-3 text-[13px] font-bold" style={{ color: "var(--ink)" }}>
                        {d.title}
                      </p>
                    )}
                    <p className="font-arabic text-right text-[23px] leading-[2.15]" dir="rtl" lang="ar">
                      {d.arabic}
                    </p>
                    <p className="mt-4 border-t pt-4 text-[14.5px] leading-[1.85]" style={{ borderColor: "var(--line)", color: "var(--ink-soft)" }}>
                      {d.translation}
                    </p>
                    <div className="mt-4 flex items-center justify-between gap-3 border-t pt-3.5" style={{ borderColor: "var(--line)" }}>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {d.repeat && d.repeat > 1 && (
                          <Chip tone="accent">
                            <Repeat size={11} aria-hidden /> ×{d.repeat}
                          </Chip>
                        )}
                        {d.reference && <Chip>{d.reference}</Chip>}
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <BookmarkButton
                          id={`dua:${d.id}`}
                          type="dua"
                          href={`/duas/${cat.slug}`}
                          title={d.title ?? d.translation.slice(0, 60)}
                          subtitle={`Dua · ${cat.title}`}
                        />
                        <TextActions payload={payload} shareTitle={d.title ?? "Dua"} />
                      </div>
                    </div>
                  </article>
                </li>
              );
            })}
          </ol>
        </div>
      ))}
    </div>
  );
}
