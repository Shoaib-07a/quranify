"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Minus, Pause, Play, Plus } from "lucide-react";
import { useApp, type LangCode } from "@/lib/store";

const LANG_LABELS: Record<LangCode, string> = { en: "English", ur: "اردو", hi: "हिन्दी" };

/**
 * Reader toolbar: keeps the ?tl= (translation) / ?lang= (tafseer) URL param
 * in sync with ONE unified, locally-persisted language preference — so the
 * whole reading experience (translation + tafseer) always switches together.
 */
export function ReaderSettings({ param }: { param: "tl" | "lang" }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { settings, hydrated, setLang } = useApp();

  const current = (searchParams.get(param) as LangCode | null) ?? null;
  const preferred = settings.lang;

  // On first paint, align the URL with the remembered preference.
  useEffect(() => {
    if (!hydrated) return;
    if (!current && preferred) {
      const next = new URLSearchParams(searchParams.toString());
      next.set(param, preferred);
      router.replace(`${pathname}?${next.toString()}`, { scroll: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  const active: LangCode = current ?? preferred;

  const choose = (lang: LangCode) => {
    setLang(lang);
    const next = new URLSearchParams(searchParams.toString());
    next.set(param, lang);
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  };

  return (
    <div className="seg" role="group" aria-label="Language selection">
      {(Object.keys(LANG_LABELS) as LangCode[]).map((l) => (
        <button
          key={l}
          type="button"
          data-active={active === l}
          onClick={() => choose(l)}
          aria-pressed={active === l}
          className={l !== "en" ? (l === "ur" ? "font-urdu !leading-none" : "font-hindi !leading-none") : ""}
        >
          {LANG_LABELS[l]}
        </button>
      ))}
    </div>
  );
}

export function FontSizeControl() {
  const { settings, setArabicSize, hydrated } = useApp();
  const size = hydrated ? settings.arabicSize : 30;
  return (
    <div
      className="flex items-center gap-1.5 rounded-full border px-1.5 py-1"
      style={{ borderColor: "var(--line)", background: "var(--surface)" }}
      role="group"
      aria-label="Arabic font size"
    >
      <button
        type="button"
        aria-label="Decrease Arabic font size"
        className="press flex h-7 w-7 items-center justify-center rounded-full"
        style={{ color: "var(--ink-soft)" }}
        onClick={() => setArabicSize(Math.max(22, size - 2))}
        disabled={size <= 22}
      >
        <Minus size={15} aria-hidden />
      </button>
      <span className="font-arabic px-0.5 text-[15px] leading-none" style={{ color: "var(--accent-ink)" }} aria-hidden>
        ع
      </span>
      <button
        type="button"
        aria-label="Increase Arabic font size"
        className="press flex h-7 w-7 items-center justify-center rounded-full"
        style={{ color: "var(--ink-soft)" }}
        onClick={() => setArabicSize(Math.min(48, size + 2))}
        disabled={size >= 48}
      >
        <Plus size={15} aria-hidden />
      </button>
    </div>
  );
}

export function LastReadTracker({
  surah,
  surahName,
}: {
  surah: number;
  surahName: string;
}) {
  const { setLastRead } = useApp();
  const ayahRef = useRef(1);

  useEffect(() => {
    setLastRead({ surah, ayah: 1, surahName, at: Date.now() });
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            const n = Number((e.target as HTMLElement).dataset.ayah ?? 1);
            if (n && n !== ayahRef.current) {
              ayahRef.current = n;
              setLastRead({ surah, ayah: n, surahName, at: Date.now() });
            }
          }
        }
      },
      { rootMargin: "-30% 0px -55% 0px" },
    );
    document.querySelectorAll("[data-ayah]").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [surah, surahName, setLastRead]);

  return null;
}

type AudioState = "idle" | "playing" | "paused" | "error";

export function AyahAudioButton({ globalId, label }: { globalId: number; label: string }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [state, setState] = useState<AudioState>("idle");

  const toggle = async () => {
    if (!audioRef.current) {
      const el = new Audio(`https://cdn.islamic.network/quran/audio/128/ar.alafasy/${globalId}.mp3`);
      el.addEventListener("ended", () => setState("idle"));
      el.addEventListener("error", () => setState("error"));
      el.addEventListener("playing", () => setState("playing"));
      el.addEventListener("pause", () => {
        setState((s) => (s === "playing" ? "paused" : s));
      });
      audioRef.current = el;
    }
    const el = audioRef.current;
    if (state === "playing") {
      el.pause();
      return;
    }
    try {
      setState("idle");
      await el.play();
    } catch {
      setState("error");
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={state === "error" ? "Audio unavailable (needs internet)" : `Play recitation of ${label}`}
      title={state === "error" ? "Audio unavailable offline" : "Play recitation"}
      className="press flex h-9 w-9 items-center justify-center rounded-full border"
      style={{
        borderColor: state === "playing" ? "var(--accent-line)" : "var(--line)",
        background: state === "playing" ? "var(--accent-soft)" : "transparent",
        color: state === "error" ? "var(--line-strong)" : state === "playing" ? "var(--accent-ink)" : "var(--muted)",
      }}
    >
      {state === "playing" ? <Pause size={16} aria-hidden /> : <Play size={16} aria-hidden />}
    </button>
  );
}
