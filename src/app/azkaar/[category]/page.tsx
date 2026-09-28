import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Chip, PageHeader, SectionLabel } from "@/components/ui";
import { BookmarkButton, TextActions } from "@/components/interactions";
import { DhikrCounter } from "@/components/Tasbeeh";
import { getAzkarByCategory, getAzkarCategory } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const c = await getAzkarCategory(category);
  return { title: c ? `Azkaar — ${c.title}` : "Azkaar" };
}

export default async function AzkarCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const [cat, items] = await Promise.all([
    getAzkarCategory(category),
    getAzkarByCategory(category),
  ]);
  if (!cat) notFound();

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
        subtitle={`${cat.itemCount} remembrances`}
        arabic="ٱلْأَذْكَار"
        back={{ href: "/azkaar", label: "Back to azkaar categories" }}
      />

      <Link
        href="/azkaar/tasbeeh"
        className="press card-flat fade-up mb-5 flex items-center justify-between px-4 py-3"
      >
        <span className="text-[13px] font-bold" style={{ color: "var(--accent-ink)" }}>
          Open the Tasbeeh counter beside these adhkar
        </span>
        <ArrowRight size={16} style={{ color: "var(--accent)" }} aria-hidden />
      </Link>

      {groups.map((g) => (
        <div key={g.title} className="mb-6">
          <SectionLabel>{g.title}</SectionLabel>
          <ol className="flex flex-col gap-3.5">
            {g.items.map((d) => {
              const payload = `${d.arabic}\n\n${d.translation}\n\n— ${d.reference ?? cat.title} · Hisnul Muslim`;
              return (
                <li key={d.id}>
                  <article className="card fade-up px-5 py-5">
                    <p className="font-arabic text-right text-[23px] leading-[2.15]" dir="rtl" lang="ar">
                      {d.arabic}
                    </p>
                    <p className="mt-4 border-t pt-4 text-[14.5px] leading-[1.85]" style={{ borderColor: "var(--line)", color: "var(--ink-soft)" }}>
                      {d.translation}
                    </p>
                    <div className="mt-4 flex items-center justify-between gap-3 border-t pt-3.5" style={{ borderColor: "var(--line)" }}>
                      <div className="flex flex-wrap items-center gap-2">
                        {d.repeat && d.repeat > 0 ? (
                          <DhikrCounter repeat={d.repeat} />
                        ) : null}
                        {d.reference && <Chip>{d.reference}</Chip>}
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <BookmarkButton
                          id={`dhikr:${d.id}`}
                          type="dhikr"
                          href={`/azkaar/${cat.slug}`}
                          title={d.translation.slice(0, 64)}
                          subtitle={`Dhikr · ${cat.title}`}
                        />
                        <TextActions payload={payload} shareTitle="Dhikr" />
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
