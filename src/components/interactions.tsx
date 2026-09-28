"use client";

import { useState, useTransition } from "react";
import { Bookmark, Check, Copy, Share2 } from "lucide-react";
import { useApp, type BookmarkType } from "@/lib/store";

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
  const active = hydrated && isBookmarked(id);
  return (
    <button
      type="button"
      aria-label={active ? "Remove bookmark" : "Add bookmark"}
      aria-pressed={active}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleBookmark({ id, type, ref: href, title, subtitle });
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
