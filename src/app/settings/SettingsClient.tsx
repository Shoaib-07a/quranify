"use client";

import { useState } from "react";
import { Info, Moon, ShieldCheck, Sun, Trash2, Monitor } from "lucide-react";
import { PageHeader, SectionLabel, SourceTag } from "@/components/ui";
import { useApp, type LangCode, type ThemeMode } from "@/lib/store";

const THEME_OPTIONS: Array<{ value: ThemeMode; label: string; Icon: typeof Sun }> = [
  { value: "light", label: "Light", Icon: Sun },
  { value: "dark", label: "Dark", Icon: Moon },
  { value: "sepia", label: "Sepia", Icon: Sun }, // Could use a different icon if available
  { value: "system", label: "Auto", Icon: Monitor },
];

const LANG_OPTIONS: Array<{ value: LangCode; label: string }> = [
  { value: "en", label: "English" },
  { value: "ur", label: "اردو" },
  { value: "hi", label: "हिन्दी" },
];

const SOURCES: Array<{ title: string; detail: string }> = [
  {
    title: "Quran text (Uthmani script)",
    detail: "Tanzil project text, distributed via quran-json (CC-BY-4.0).",
  },
  {
    title: "Quran translations",
    detail:
      "Saheeh International (English) · Ahmed Ali (Urdu) · Suhel Farooq Khan & Saifur Rahman Nadwi (Hindi) — via AlQuran Cloud (islamic.network).",
  },
  {
    title: "Tafseer (concise)",
    detail:
      "Al-Mukhtasar fi al-Tafsir (English & Hindi, Markaz al-Malik Fahd) · Tazkirul Quran — Maulana Wahiduddin Khan (Urdu) — via spa5k/tafsir_api, a mirror of tafsir.app.",
  },
  {
    title: "Hadith",
    detail:
      "Sahih al-Bukhari, Sahih Muslim, 40 Hadith Nawawi & 40 Hadith Qudsi — Sunnah.com-aligned dataset via fawazahmed0/hadith-api. Grades as recorded in source.",
  },
  {
    title: "Duas & Azkaar",
    detail: "Hisnul Muslim (Fortress of the Muslim) by Sa'id ibn 'Ali ibn Wahf al-Qahtani — official hisnmuslim.com API.",
  },
  {
    title: "99 Names of Allah",
    detail:
      "Al-Adhan API (Islamic Network) — Arabic, transliteration & English meaning, per the narration of Tirmidhi 3507.",
  },
  {
    title: "Audio recitation",
    detail: "Mishary Rashid Alafasy — Islamic Network CDN (requires internet).",
  },
];

export default function SettingsClient() {
  const {
    settings,
    bookmarks,
    hydrated,
    setTheme,
    setArabicSize,
    setTranslationSize,
    setLang,
    clearLocalData,
  } = useApp();
  const [confirmClear, setConfirmClear] = useState(false);

  return (
    <div className="px-5">
      <PageHeader title="Settings" subtitle="Personalise your reading" back={{ href: "/more", label: "Back to more" }} />

      {/* Appearance */}
      <SectionLabel>Appearance</SectionLabel>
      <div className="card-flat fade-up flex items-center justify-between gap-4 px-5 py-4">
        <div>
          <p className="text-[14.5px] font-bold">Theme</p>
          <p className="text-[12px]" style={{ color: "var(--muted)" }}>
            Easy on the eyes, day and night
          </p>
        </div>
        <div className="seg" role="group" aria-label="Theme">
          {THEME_OPTIONS.map(({ value, label, Icon }) => (
            <button
              key={value}
              type="button"
              data-active={hydrated && settings.theme === value}
              aria-pressed={hydrated && settings.theme === value}
              onClick={() => setTheme(value)}
              className="flex items-center gap-1.5"
            >
              <Icon size={13} aria-hidden />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Reading */}
      <div className="mt-6">
        <SectionLabel>Reading</SectionLabel>
        <div className="card-flat fade-up flex flex-col gap-5 px-5 py-5">
          <div>
            <div className="flex items-center justify-between">
              <p className="text-[14.5px] font-bold">Arabic font size</p>
              <span className="rounded-full px-2.5 py-0.5 text-[11.5px] font-bold tabular-nums" style={{ background: "var(--accent-soft)", color: "var(--accent-ink)" }}>
                {settings.arabicSize}px
              </span>
            </div>
            <input
              type="range"
              min={22}
              max={48}
              step={2}
              value={settings.arabicSize}
              aria-label="Arabic font size"
              className="q-range mt-3"
              style={{
                // @ts-expect-error CSS var for fill
                "--fill": `${((settings.arabicSize - 22) / 26) * 100}%`,
              }}
              onChange={(e) => setArabicSize(Number(e.target.value))}
            />
            <p
              className="font-arabic arabic-size mt-4 rounded-2xl border px-4 py-4 text-center"
              dir="rtl"
              lang="ar"
              style={{ borderColor: "var(--line)", background: "var(--surface-2)", color: "var(--accent-ink)" }}
            >
              بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
            </p>
          </div>

          <div className="mt-4 border-t pt-5" style={{ borderColor: "var(--line)" }}>
            <div className="flex items-center justify-between">
              <p className="text-[14.5px] font-bold">Translation font size</p>
              <span className="rounded-full px-2.5 py-0.5 text-[11.5px] font-bold tabular-nums" style={{ background: "var(--accent-soft)", color: "var(--accent-ink)" }}>
                {settings.translationSize}px
              </span>
            </div>
            <input
              type="range"
              min={12}
              max={24}
              step={1}
              value={settings.translationSize}
              aria-label="Translation font size"
              className="q-range mt-3"
              style={{
                // @ts-expect-error CSS var for fill
                "--fill": `${((settings.translationSize - 12) / 12) * 100}%`,
              }}
              onChange={(e) => setTranslationSize(Number(e.target.value))}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4" style={{ borderColor: "var(--line)" }}>
            <div>
              <p className="text-[14.5px] font-bold">Content language</p>
              <p className="text-[12px] leading-snug" style={{ color: "var(--muted)" }}>
                One choice everywhere — translation &amp; tafseer switch together
              </p>
            </div>
            <div className="seg" role="group" aria-label="Content language">
              {LANG_OPTIONS.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  data-active={hydrated && settings.lang === value}
                  aria-pressed={hydrated && settings.lang === value}
                  onClick={() => setLang(value)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Library data */}
      <div className="mt-6">
        <SectionLabel>Your library</SectionLabel>
        <div className="card-flat fade-up flex items-center justify-between gap-4 px-5 py-4">
          <div>
            <p className="text-[14.5px] font-bold">
              {hydrated ? `${bookmarks.length} bookmark${bookmarks.length === 1 ? "" : "s"}` : "Bookmarks"}
            </p>
            <p className="text-[12px]" style={{ color: "var(--muted)" }}>
              Keeps working fully offline — stored only on this device
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              if (confirmClear) {
                clearLocalData();
                setConfirmClear(false);
              } else {
                setConfirmClear(true);
                window.setTimeout(() => setConfirmClear(false), 3500);
              }
            }}
            className="press flex items-center gap-1.5 rounded-full border px-4 py-2 text-[12.5px] font-bold"
            style={{
              borderColor: confirmClear ? "#b3452f" : "var(--line)",
              color: confirmClear ? "#b3452f" : "var(--ink-soft)",
            }}
          >
            <Trash2 size={14} aria-hidden />
            {confirmClear ? "Tap again to confirm" : "Clear data"}
          </button>
        </div>
      </div>

      {/* About */}
      <div className="mt-6">
        <SectionLabel>About</SectionLabel>
        <div className="card fade-up px-5 py-5">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl" style={{ background: "var(--accent)", color: "#f3efe2" }} aria-hidden>
              <span className="font-arabic text-[20px] leading-none">ق</span>
            </span>
            <div>
              <p className="font-display text-[18px] font-semibold leading-tight">Quranify</p>
              <p className="text-[12px]" style={{ color: "var(--muted)" }}>
                Quran · Tafseer · Islamic Knowledge
              </p>
            </div>
            <span className="ml-auto rounded-full border px-2.5 py-1 text-[11px] font-bold tabular-nums" style={{ borderColor: "var(--line)", color: "var(--muted)" }}>
              v1.0.0
            </span>
          </div>
          <p className="mt-4 flex items-start gap-2 text-[13px] leading-relaxed" style={{ color: "var(--ink-soft)" }}>
            <Info size={15} className="mt-0.5 shrink-0" style={{ color: "var(--accent)" }} aria-hidden />
            A calm, carefully-sourced companion for daily Quran reading and Islamic learning.
            Religious texts are never generated — only verified datasets are served, each with
            its attribution.
          </p>
        </div>
      </div>

      {/* Sources */}
      <div className="mt-6">
        <SectionLabel>Sources &amp; credits</SectionLabel>
        <ol className="card-flat fade-up flex flex-col divide-y" style={{ borderColor: "var(--line)" }}>
          {SOURCES.map((s) => (
            <li key={s.title} className="px-5 py-4" style={{ borderColor: "var(--line)" }}>
              <p className="text-[13.5px] font-bold">{s.title}</p>
              <p className="mt-1 text-[12.5px] leading-relaxed" style={{ color: "var(--muted)" }}>
                {s.detail}
              </p>
            </li>
          ))}
        </ol>
      </div>

      {/* Privacy */}
      <div className="mt-6 mb-4">
        <SectionLabel>Privacy</SectionLabel>
        <div className="card-flat fade-up px-5 py-5">
          <p className="flex items-start gap-2 text-[13px] leading-relaxed" style={{ color: "var(--ink-soft)" }}>
            <ShieldCheck size={16} className="mt-0.5 shrink-0" style={{ color: "var(--accent)" }} aria-hidden />
            Quranify is local-first. Bookmarks, reading position, theme and language preferences
            are stored only on your device. There are no accounts, no analytics, and no tracking.
          </p>
        </div>
        <div className="mt-4 px-1">
          <SourceTag>All religious content is served from the local Quranify content database — basic reading works without internet once loaded.</SourceTag>
        </div>
      </div>
    </div>
  );
}
