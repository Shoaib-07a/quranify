"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type ThemeMode = "light" | "dark" | "system";
export type LangCode = "en" | "ur" | "hi";

export interface Settings {
  theme: ThemeMode;
  arabicSize: number;
  /** Single unified content language — translation AND tafseer follow it. */
  lang: LangCode;
}

export type BookmarkType =
  | "ayah"
  | "tafseer"
  | "hadith"
  | "dua"
  | "dhikr"
  | "name";

export interface Bookmark {
  id: string;
  type: BookmarkType;
  ref: string; // route path
  title: string;
  subtitle?: string;
  createdAt: number;
}

export interface LastRead {
  surah: number;
  ayah: number;
  surahName: string;
  at: number;
}

const SETTINGS_KEY = "quranify.settings";
const BOOKMARKS_KEY = "quranify.bookmarks";
const LASTREAD_KEY = "quranify.lastread";

const defaultSettings: Settings = {
  theme: "system",
  arabicSize: 30,
  lang: "en",
};

interface AppState {
  settings: Settings;
  bookmarks: Bookmark[];
  lastRead: LastRead | null;
  hydrated: boolean;
  setTheme: (t: ThemeMode) => void;
  setArabicSize: (n: number) => void;
  setLang: (l: LangCode) => void;
  toggleBookmark: (b: Omit<Bookmark, "createdAt">) => void;
  removeBookmark: (id: string) => void;
  isBookmarked: (id: string) => boolean;
  setLastRead: (r: LastRead) => void;
  clearLocalData: () => void;
}

const AppContext = createContext<AppState | null>(null);

function applyTheme(theme: ThemeMode) {
  const dark =
    theme === "dark" ||
    (theme === "system" &&
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
}

function applyArabicSize(size: number) {
  document.documentElement.style.setProperty("--reader-ar-size", `${size}px`);
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [lastRead, setLastReadState] = useState<LastRead | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "null");
      if (s) {
        // Migrate the previous split quranLang/tafseerLang keys into one.
        const legacy = (s.quranLang ?? s.tafseerLang ?? "en") as LangCode;
        const lang: LangCode = ["en", "ur", "hi"].includes(s.lang) ? s.lang : legacy;
        setSettings({
          ...defaultSettings,
          theme: s.theme ?? defaultSettings.theme,
          arabicSize: typeof s.arabicSize === "number" ? s.arabicSize : defaultSettings.arabicSize,
          lang,
        });
      }
    } catch {}
    try {
      const b = JSON.parse(localStorage.getItem(BOOKMARKS_KEY) || "[]");
      if (Array.isArray(b)) setBookmarks(b);
    } catch {}
    try {
      const r = JSON.parse(localStorage.getItem(LASTREAD_KEY) || "null");
      if (r) setLastReadState(r);
    } catch {}
    setHydrated(true);

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      const cur = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}");
      if (!cur.theme || cur.theme === "system") applyTheme("system");
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const persistSettings = useCallback((next: Settings) => {
    setSettings(next);
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
    } catch {}
    applyTheme(next.theme);
    applyArabicSize(next.arabicSize);
  }, []);

  const setTheme = useCallback(
    (theme: ThemeMode) => persistSettings({ ...settings, theme }),
    [settings, persistSettings],
  );
  const setArabicSize = useCallback(
    (arabicSize: number) => persistSettings({ ...settings, arabicSize }),
    [settings, persistSettings],
  );
  const setLang = useCallback(
    (lang: LangCode) => persistSettings({ ...settings, lang }),
    [settings, persistSettings],
  );

  const persistBookmarks = useCallback((next: Bookmark[]) => {
    setBookmarks(next);
    try {
      localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(next));
    } catch {}
  }, []);

  const toggleBookmark = useCallback(
    (b: Omit<Bookmark, "createdAt">) => {
      const exists = bookmarks.some((x) => x.id === b.id);
      if (exists) {
        persistBookmarks(bookmarks.filter((x) => x.id !== b.id));
      } else {
        persistBookmarks([{ ...b, createdAt: Date.now() }, ...bookmarks]);
      }
    },
    [bookmarks, persistBookmarks],
  );

  const removeBookmark = useCallback(
    (id: string) => persistBookmarks(bookmarks.filter((x) => x.id !== id)),
    [bookmarks, persistBookmarks],
  );

  const isBookmarked = useCallback(
    (id: string) => bookmarks.some((x) => x.id === id),
    [bookmarks],
  );

  const setLastRead = useCallback((r: LastRead) => {
    setLastReadState(r);
    try {
      localStorage.setItem(LASTREAD_KEY, JSON.stringify(r));
    } catch {}
  }, []);

  const clearLocalData = useCallback(() => {
    try {
      localStorage.removeItem(BOOKMARKS_KEY);
      localStorage.removeItem(LASTREAD_KEY);
    } catch {}
    setBookmarks([]);
    setLastReadState(null);
  }, []);

  const value = useMemo<AppState>(
    () => ({
      settings,
      bookmarks,
      lastRead,
      hydrated,
      setTheme,
      setArabicSize,
      setLang,
      toggleBookmark,
      removeBookmark,
      isBookmarked,
      setLastRead,
      clearLocalData,
    }),
    [
      settings,
      bookmarks,
      lastRead,
      hydrated,
      setTheme,
      setArabicSize,
      setLang,
      toggleBookmark,
      removeBookmark,
      isBookmarked,
      setLastRead,
      clearLocalData,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
