"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { useState } from "react";
import {
  BookOpen,
  BookText,
  HandHeart,
  ScrollText,
  Sparkles,
  Star,
  Trash2,
  Tag,
} from "lucide-react";
import { PageHeader, SectionLabel, EmptyState } from "@/components/ui";
import { useApp, type BookmarkType, type BookmarkCategory } from "@/lib/store";

const META: Record<BookmarkType, { label: string; icon: LucideIcon }> = {
  ayah: { label: "Quran Ayahs", icon: BookOpen },
  tafseer: { label: "Tafseer", icon: BookText },
  hadith: { label: "Hadith", icon: ScrollText },
  dua: { label: "Duas", icon: HandHeart },
  dhikr: { label: "Azkaar", icon: Sparkles },
  name: { label: "99 Names of Allah", icon: Star },
};

const CATEGORIES: BookmarkCategory[] = ["Favorites", "Dua", "Important", "Personal", "General"];

export default function BookmarksClient() {
  const { bookmarks, removeBookmark, hydrated } = useApp();
  const [activeCat, setActiveCat] = useState<BookmarkCategory | "All">("All");

  const filtered = bookmarks.filter((b) => activeCat === "All" || b.category === activeCat);

  return (
    <div className="px-5">
      <PageHeader
        title="Bookmarks"
        subtitle={hydrated ? `${bookmarks.length} saved — stored on this device` : "Saved on this device"}
        arabic="ٱلْعَلَامَات"
      />

      <div className="no-scrollbar mb-6 flex gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveCat("All")}
          className={`press shrink-0 rounded-full border px-4 py-1.5 text-[12px] font-bold transition-all ${
            activeCat === "All" ? "border-accent bg-accent-soft text-accent" : "border-line text-muted"
          }`}
        >
          All
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCat(cat)}
            className={`press shrink-0 rounded-full border px-4 py-1.5 text-[12px] font-bold transition-all ${
              activeCat === cat ? "border-accent bg-accent-soft text-accent" : "border-line text-muted"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {hydrated && filtered.length === 0 && (
        <EmptyState
          title="No bookmarks found"
          subtitle={activeCat === "All" ? "Start saving your favorite ayahs and duas." : `No items in category "${activeCat}".`}
        />
      )}

      <ol className="flex flex-col gap-3 pb-20">
        {filtered.map((b) => {
          const { icon: Icon } = META[b.type] || { icon: Tag };
          return (
            <li key={b.id} className="fade-up">
              <div className="card-flat flex items-center gap-3 px-4 py-3.5">
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: "var(--accent-soft)", color: "var(--accent-ink)" }}
                  aria-hidden
                >
                  <Icon size={18} strokeWidth={1.9} />
                </span>
                <Link href={b.ref} className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="truncate text-[14.5px] font-bold tracking-tight">{b.title}</span>
                    <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold uppercase dark:bg-slate-800 text-muted">
                      {b.category}
                    </span>
                  </span>
                  {b.subtitle && (
                    <span className="mt-0.5 block truncate text-[12px]" style={{ color: "var(--muted)" }}>
                      {b.subtitle}
                    </span>
                  )}
                </Link>
                <button
                  type="button"
                  aria-label={`Remove bookmark ${b.title}`}
                  onClick={() => removeBookmark(b.id)}
                  className="press flex h-9 w-9 shrink-0 items-center justify-center rounded-full border"
                  style={{ borderColor: "var(--line)", color: "var(--muted)" }}
                >
                  <Trash2 size={15} aria-hidden />
                </button>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
