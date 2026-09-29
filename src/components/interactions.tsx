"use client";

import { useState, useTransition } from "react";
import { Bookmark, Check, Copy, Share2, Tag, StickyNote, X } from "lucide-react";
import { useApp, type BookmarkType, type BookmarkCategory } from "@/lib/store";
import { saveNote } from "@/app/actions/notes";

export function NoteButton({ surah, ayah, initial }: { surah: number; ayah: number; initial?: string }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(initial || "");
  const [isSaving, setIsSaving] = useState(false);

  const save = async () => {
    setIsSaving(true);
    await saveNote(surah, ayah, text);
    setIsSaving(false);
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="press flex h-9 w-9 items-center justify-center rounded-full border"
        style={{
          borderColor: initial ? "var(--accent-line)" : "var(--line)",
          background: initial ? "var(--accent-soft)" : "transparent",
          color: initial ? "var(--accent-ink)" : "var(--muted)",
        }}
      >
        <StickyNote size={16} fill={initial ? "currentColor" : "none"} />
      </button>

      {open && (
        <div className="card fixed inset-x-5 top-1/2 z-[200] -translate-y-1/2 p-5 shadow-2xl md:absolute md:top-full md:right-0 md:left-auto md:w-80 md:translate-y-0">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="text-sm font-bold">Personal Note</h4>
            <button onClick={() => setOpen(false)}><X size={16}/></button>
          </div>
          <textarea
            autoFocus
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="h-32 w-full rounded-xl border bg-slate-50 p-3 text-sm dark:bg-slate-900"
            placeholder="Write your thoughts on this ayah..."
          />
          <button
            disabled={isSaving}
            onClick={save}
            className="press mt-3 w-full rounded-xl bg-accent py-2.5 text-sm font-bold text-white"
          >
            {isSaving ? "Saving..." : "Save Note"}
          </button>
        </div>
      )}
    </div>
  );
}

export function BookmarkButton({
  id,
  type,
  href,
  title,
  subtitle,
  size = 18,
}: {
  id: string;
  type: BookmarkType;
  href: string;
  title: string;
  subtitle?: string;
  size?: number;
}) {
  const { isBookmarked, toggleBookmark, hydrated } = useApp();
  const [showCat, setShowCat] = useState(false);
  const active = hydrated && isBookmarked(id);

  const categories: BookmarkCategory[] = ["Favorites", "Dua", "Important", "Personal", "General"];

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={active ? "Remove bookmark" : "Add bookmark"}
        aria-pressed={active}
        onContextMenu={(e) => {
          e.preventDefault();
          setShowCat(!showCat);
        }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (!active) {
            setShowCat(!showCat);
          } else {
            toggleBookmark({ id, type, category: "General", ref: href, title, subtitle });
          }
        }}
        className="press flex h-9 w-9 items-center justify-center rounded-full border"
        style={{
          borderColor: active ? "var(--accent-line)" : "var(--line)",
          background: active ? "var(--accent-soft)" : "transparent",
          color: active ? "var(--accent-ink)" : "var(--muted)",
        }}
      >
        <Bookmark size={size} fill={active ? "currentColor" : "none"} aria-hidden />
      </button>

      {showCat && (
        <div
          className="card absolute right-0 bottom-full z-[100] mb-2 min-w-[140px] overflow-hidden p-1 shadow-xl"
          style={{ background: "var(--surface)" }}
        >
          <p className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-widest text-muted">
            Select Category
          </p>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={(e) => {
                e.stopPropagation();
                toggleBookmark({ id, type, category: cat, ref: href, title, subtitle });
                setShowCat(false);
              }}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[13px] hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Tag size={12} />
              {cat}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function TextActions({
  payload,
  shareTitle = "Quranify",
}: {
  payload: string;
  shareTitle?: string;
}) {
  const [copied, setCopied] = useState(false);
  const [, startTransition] = useTransition();

  const markCopied = () => {
    startTransition(() => setCopied(true));
    window.setTimeout(() => setCopied(false), 1800);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(payload);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = payload;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    markCopied();
  };

  const share = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: shareTitle, text: payload });
        return;
      } catch {
        /* user dismissed or share unsupported — fall through to copy */
      }
    }
    await copy();
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={copy}
        aria-label="Copy text"
        className="press flex h-9 w-9 items-center justify-center rounded-full border"
        style={{
          borderColor: copied ? "var(--accent-line)" : "var(--line)",
          background: copied ? "var(--accent-soft)" : "transparent",
          color: copied ? "var(--accent-ink)" : "var(--muted)",
        }}
      >
        {copied ? <Check size={17} aria-hidden /> : <Copy size={16} aria-hidden />}
      </button>
      <button
        type="button"
        onClick={share}
        aria-label="Share"
        className="press flex h-9 w-9 items-center justify-center rounded-full border"
        style={{ borderColor: "var(--line)", color: "var(--muted)" }}
      >
        <Share2 size={16} aria-hidden />
      </button>
    </div>
  );
}
