"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  BookText,
  HandHeart,
  ScrollText,
  Sparkles,
  Star,
  Trash2,
} from "lucide-react";
import { PageHeader, SectionLabel, EmptyState } from "@/components/ui";
import { useApp, type BookmarkType } from "@/lib/store";

const META: Record<BookmarkType, { label: string; icon: LucideIcon }> = {
  ayah: { label: "Quran Ayahs", icon: BookOpen },
  tafseer: { label: "Tafseer", icon: BookText },
  hadith: { label: "Hadith", icon: ScrollText },
  dua: { label: "Duas", icon: HandHeart },
  dhikr: { label: "Azkaar", icon: Sparkles },
  name: { label: "99 Names of Allah", icon: Star },
};

const ORDER: BookmarkType[] = ["ayah", "tafseer", "hadith", "dua", "dhikr", "name"];

export default function BookmarksClient() {
  const { bookmarks, removeBookmark, hydrated } = useApp();

  return (
    <div className="px-5">
      <PageHeader
        title="Bookmarks"
        subtitle={hydrated ? `${bookmarks.length} saved — stored on this device` : "Saved on this device"}
        arabic="ٱلْعَلَامَات"
      />

      {hydrated && bookmarks.length === 0 && (
        <EmptyState
          title="No bookmarks yet"
          subtitle="Tap the bookmark icon on any ayah, tafseer, hadith, dua, dhikr or name to save it here."
        />
      )}

      {ORDER.map((type) => {
        const items = bookmarks.filter((b) => b.type === type);
        if (items.length === 0) return null;
        const { label, icon: Icon } = META[type];
        return (
          <div key={type} className="mb-6">
            <SectionLabel>{label}</SectionLabel>
            <ol className="flex flex-col gap-2.5">
              {items.map((b) => (
                <li key={b.id}>
                  <div className="card-flat flex items-center gap-3 px-4 py-3.5">
                    <span
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                      style={{ background: "var(--accent-soft)", color: "var(--accent-ink)" }}
                      aria-hidden
                    >
                      <Icon size={16} strokeWidth={1.9} />
                    </span>
                    <Link href={b.ref} className="min-w-0 flex-1">
                      <span className="block truncate text-[14.5px] font-bold tracking-tight">{b.title}</span>
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
              ))}
            </ol>
          </div>
        );
      })}
    </div>
  );
}
