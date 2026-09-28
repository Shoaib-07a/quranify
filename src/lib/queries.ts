import { and, asc, count, eq, ilike, inArray, or, sql, type SQL } from "drizzle-orm";
import { db } from "@/db";
import {
  allahNames,
  ayahs,
  azkar,
  azkarCategories,
  duaCategories,
  duas,
  hadithCollections,
  hadiths,
  surahs,
  tafsir,
  translations,
} from "@/db/schema";

export type LangCode = "en" | "ur" | "hi";

/* ------------------------------ Quran ------------------------------ */

export const getSurahs = () => db.select().from(surahs).orderBy(asc(surahs.number));

export async function getSurah(n: number) {
  const rows = await db.select().from(surahs).where(eq(surahs.number, n)).limit(1);
  return rows[0] ?? null;
}

export async function getAyahsWithTranslation(surahNumber: number, lang: LangCode) {
  return db
    .select({
      surahNumber: ayahs.surahNumber,
      ayahNumber: ayahs.ayahNumber,
      textUthmani: ayahs.textUthmani,
      translation: translations.text,
      translator: translations.translator,
    })
    .from(ayahs)
    .leftJoin(
      translations,
      and(
        eq(translations.surahNumber, ayahs.surahNumber),
        eq(translations.ayahNumber, ayahs.ayahNumber),
        eq(translations.language, lang),
      ),
    )
    .where(eq(ayahs.surahNumber, surahNumber))
    .orderBy(asc(ayahs.ayahNumber));
}

/* ----------------------------- Tafseer ----------------------------- */

export async function getTafsirPage(surahNumber: number, lang: LangCode) {
  return db
    .select({
      surahNumber: ayahs.surahNumber,
      ayahNumber: ayahs.ayahNumber,
      textUthmani: ayahs.textUthmani,
      translation: translations.text,
      translator: translations.translator,
      tafsirText: tafsir.text,
      tafsirSource: tafsir.source,
    })
    .from(ayahs)
    .leftJoin(
      translations,
      and(
        eq(translations.surahNumber, ayahs.surahNumber),
        eq(translations.ayahNumber, ayahs.ayahNumber),
        eq(translations.language, lang),
      ),
    )
    .leftJoin(
      tafsir,
      and(
        eq(tafsir.surahNumber, ayahs.surahNumber),
        eq(tafsir.ayahNumber, ayahs.ayahNumber),
        eq(tafsir.language, lang),
      ),
    )
    .where(eq(ayahs.surahNumber, surahNumber))
    .orderBy(asc(ayahs.ayahNumber));
}

export interface TafsirCoverage {
  surahNumber: number;
  en: number;
  ur: number;
  hi: number;
}

export async function getTafsirCoverage(): Promise<Map<number, TafsirCoverage>> {
  const rows = await db
    .select({
      surahNumber: tafsir.surahNumber,
      language: tafsir.language,
      c: count(),
    })
    .from(tafsir)
    .groupBy(tafsir.surahNumber, tafsir.language);
  const map = new Map<number, TafsirCoverage>();
  for (const r of rows) {
    const cur = map.get(r.surahNumber) ?? { surahNumber: r.surahNumber, en: 0, ur: 0, hi: 0 };
    if (r.language === "en") cur.en = r.c;
    if (r.language === "ur") cur.ur = r.c;
    if (r.language === "hi") cur.hi = r.c;
    map.set(r.surahNumber, cur);
  }
  return map;
}

/* ----------------------------- Hadith ------------------------------ */

export const getHadithCollections = () =>
  db.select().from(hadithCollections).orderBy(asc(hadithCollections.slug));

export async function getHadithCollection(slug: string) {
  const rows = await db
    .select()
    .from(hadithCollections)
    .where(eq(hadithCollections.slug, slug))
    .limit(1);
  return rows[0] ?? null;
}

export async function getHadithBooks(slug: string) {
  return db
    .selectDistinct({ bookNumber: hadiths.bookNumber, bookTitle: hadiths.bookTitle })
    .from(hadiths)
    .where(eq(hadiths.collection, slug))
    .orderBy(asc(hadiths.bookNumber));
}

export async function getHadiths(opts: {
  collection: string;
  page: number;
  pageSize: number;
  q?: string;
  book?: number;
}) {
  const conds: SQL[] = [eq(hadiths.collection, opts.collection)];
  if (opts.q && opts.q.trim().length > 0) {
    conds.push(ilike(hadiths.english, `%${opts.q.trim()}%`));
  }
  if (typeof opts.book === "number" && !Number.isNaN(opts.book)) {
    conds.push(eq(hadiths.bookNumber, opts.book));
  }
  const where = and(...conds);
  const [totalRow] = await db.select({ c: count() }).from(hadiths).where(where);
  const rows = await db
    .select()
    .from(hadiths)
    .where(where)
    .orderBy(asc(hadiths.id))
    .limit(opts.pageSize)
    .offset((opts.page - 1) * opts.pageSize);
  return { rows, total: totalRow?.c ?? 0 };
}

/* ------------------------------ Duas ------------------------------- */

export const getDuaCategories = () =>
  db.select().from(duaCategories).orderBy(asc(duaCategories.sortOrder));

export const getDuasByCategory = (slug: string) =>
  db.select().from(duas).where(eq(duas.category, slug)).orderBy(asc(duas.sortOrder));

export const getDuaCategory = async (slug: string) =>
  (await db.select().from(duaCategories).where(eq(duaCategories.slug, slug)).limit(1))[0] ?? null;

/* ------------------------------ Azkaar ----------------------------- */

export const getAzkarCategories = () =>
  db.select().from(azkarCategories).orderBy(asc(azkarCategories.sortOrder));

export const getAzkarByCategory = (slug: string) =>
  db.select().from(azkar).where(eq(azkar.category, slug)).orderBy(asc(azkar.sortOrder));

export const getAzkarCategory = async (slug: string) =>
  (await db.select().from(azkarCategories).where(eq(azkarCategories.slug, slug)).limit(1))[0] ??
  null;

/* ---------------------------- Names -------------------------------- */

export const getAllahNames = () => db.select().from(allahNames).orderBy(asc(allahNames.number));

export async function getAllahName(n: number) {
  const rows = await db.select().from(allahNames).where(eq(allahNames.number, n)).limit(1);
  return rows[0] ?? null;
}

/* ----------------------------- Search ------------------------------ */

export interface SearchResults {
  surahs: Array<{ number: number; nameEnglish: string; nameArabic: string }>;
  ayahs: Array<{
    surahNumber: number;
    ayahNumber: number;
    text: string;
    lang: string;
  }>;
  hadiths: Array<{ id: number; collection: string; reference: string; text: string }>;
  duas: Array<{ id: number; category: string; title: string | null; text: string }>;
  azkar: Array<{ id: number; category: string; text: string }>;
  names: Array<{ number: number; transliteration: string; meaningEn: string }>;
}

export async function searchAll(raw: string): Promise<SearchResults> {
  const q = raw.trim();
  if (q.length < 2) {
    return { surahs: [], ayahs: [], hadiths: [], duas: [], azkar: [], names: [] };
  }
  const pattern = `%${q}%`;

  const [s, a, h, d, z, n] = await Promise.all([
    db
      .select({
        number: surahs.number,
        nameEnglish: surahs.nameEnglish,
        nameArabic: surahs.nameArabic,
      })
      .from(surahs)
      .where(
        or(
          ilike(surahs.nameEnglish, pattern),
          ilike(surahs.nameArabic, pattern),
          sql`${surahs.number}::text = ${q}`,
        ),
      )
      .limit(8),

    db
      .select({
        surahNumber: translations.surahNumber,
        ayahNumber: translations.ayahNumber,
        text: translations.text,
        lang: translations.language,
      })
      .from(translations)
      .where(and(ilike(translations.text, pattern), inArray(translations.language, ["en"])))
      .limit(10),

    db
      .select({
        id: hadiths.id,
        collection: hadiths.collection,
        reference: hadiths.reference,
        text: hadiths.english,
      })
      .from(hadiths)
      .where(ilike(hadiths.english, pattern))
      .limit(8),

    db
      .select({
        id: duas.id,
        category: duas.category,
        title: duas.title,
        text: duas.translation,
      })
      .from(duas)
      .where(or(ilike(duas.translation, pattern), ilike(duas.title, pattern)))
      .limit(8),

    db
      .select({ id: azkar.id, category: azkar.category, text: azkar.translation })
      .from(azkar)
      .where(ilike(azkar.translation, pattern))
      .limit(8),

    db
      .select({
        number: allahNames.number,
        transliteration: allahNames.transliteration,
        meaningEn: allahNames.meaningEn,
      })
      .from(allahNames)
      .where(
        or(ilike(allahNames.transliteration, pattern), ilike(allahNames.meaningEn, pattern)),
      )
      .limit(8),
  ]);

  return { surahs: s, ayahs: a, hadiths: h, duas: d, azkar: z, names: n };
}
