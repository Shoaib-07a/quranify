import {
  bigint,
  index,
  integer,
  pgTable,
  primaryKey,
  serial,
  text,
  uniqueIndex,
} from "drizzle-orm/pg-core";

/**
 * Quranify content schema.
 *
 * Every religious text row carries explicit provenance columns
 * (source / translator / language) so the client can always attribute
 * the content to a verified dataset.
 */

export const surahs = pgTable("surahs", {
  number: integer("number").primaryKey(),
  nameArabic: text("name_arabic").notNull(),
  nameEnglish: text("name_english").notNull(),
  ayahCount: integer("ayah_count").notNull(),
  revelationType: text("revelation_type").notNull(), // "makki" | "madani"
  revelationOrder: integer("revelation_order"),
  juzStart: integer("juz_start"),
  introduction: text("introduction"),
});

export const ayahNotes = pgTable("ayah_notes", {
  id: serial("id").primaryKey(),
  surahNumber: integer("surah_number").notNull(),
  ayahNumber: integer("ayah_number").notNull(),
  note: text("note").notNull(),
  createdAt: bigint("created_at", { mode: "number" }).notNull(),
}, (t) => [
  index("ayah_notes_lookup_idx").on(t.surahNumber, t.ayahNumber),
]);

export const ayahs = pgTable(
  "ayahs",
  {
    id: serial("id").primaryKey(),
    surahNumber: integer("surah_number").notNull(),
    ayahNumber: integer("ayah_number").notNull(),
    textUthmani: text("text_uthmani").notNull(),
    source: text("source").notNull().default("Tanzil / quran-json (Uthmani)"),
  },
  (t) => [uniqueIndex("ayahs_surah_ayah_idx").on(t.surahNumber, t.ayahNumber)],
);

export const translations = pgTable(
  "translations",
  {
    id: serial("id").primaryKey(),
    surahNumber: integer("surah_number").notNull(),
    ayahNumber: integer("ayah_number").notNull(),
    language: text("language").notNull(), // en | ur | hi
    translator: text("translator").notNull(),
    text: text("text").notNull(),
  },
  (t) => [
    index("translations_lookup_idx").on(t.surahNumber, t.language, t.ayahNumber),
    index("translations_lang_idx").on(t.language),
  ],
);

export const tafsir = pgTable(
  "tafsir",
  {
    id: serial("id").primaryKey(),
    surahNumber: integer("surah_number").notNull(),
    ayahNumber: integer("ayah_number").notNull(),
    language: text("language").notNull(), // en | ur | hi
    source: text("source").notNull(),
    sourceDetail: text("source_detail"),
    text: text("text").notNull(),
  },
  (t) => [
    index("tafsir_lookup_idx").on(t.surahNumber, t.language, t.ayahNumber),
    index("tafsir_lang_idx").on(t.language),
  ],
);

export const hadithCollections = pgTable("hadith_collections", {
  slug: text("slug").primaryKey(), // bukhari | muslim | nawawi | qudsi
  nameEnglish: text("name_english").notNull(),
  nameArabic: text("name_arabic"),
  compiler: text("compiler"),
  description: text("description"),
  hadithCount: integer("hadith_count").notNull().default(0),
});

export const hadiths = pgTable(
  "hadiths",
  {
    id: serial("id").primaryKey(),
    collection: text("collection").notNull(),
    bookNumber: integer("book_number"),
    bookTitle: text("book_title"),
    hadithNumber: text("hadith_number").notNull(),
    arabic: text("arabic"),
    english: text("english").notNull(),
    urdu: text("urdu"),
    grades: text("grades"), // JSON string of gradings
    reference: text("reference").notNull(),
    source: text("source").notNull(),
  },
  (t) => [
    index("hadiths_collection_idx").on(t.collection),
    index("hadiths_book_idx").on(t.collection, t.bookNumber),
  ],
);

export const duaCategories = pgTable("dua_categories", {
  slug: text("slug").primaryKey(),
  title: text("title").notNull(),
  subtitle: text("subtitle"),
  sortOrder: integer("sort_order").notNull().default(0),
  itemCount: integer("item_count").notNull().default(0),
});

export const duas = pgTable(
  "duas",
  {
    id: serial("id").primaryKey(),
    category: text("category").notNull(),
    chapterId: integer("chapter_id").notNull(),
    chapterTitle: text("chapter_title").notNull(),
    title: text("title"),
    arabic: text("arabic").notNull(),
    transliteration: text("transliteration"),
    translation: text("translation").notNull(),
    repeat: integer("repeat"),
    reference: text("reference"),
    source: text("source").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [index("duas_category_idx").on(t.category)],
);

export const azkarCategories = pgTable("azkar_categories", {
  slug: text("slug").primaryKey(),
  title: text("title").notNull(),
  subtitle: text("subtitle"),
  sortOrder: integer("sort_order").notNull().default(0),
  itemCount: integer("item_count").notNull().default(0),
});

export const azkar = pgTable(
  "azkar",
  {
    id: serial("id").primaryKey(),
    category: text("category").notNull(),
    chapterId: integer("chapter_id").notNull(),
    chapterTitle: text("chapter_title").notNull(),
    arabic: text("arabic").notNull(),
    translation: text("translation").notNull(),
    repeat: integer("repeat"),
    reference: text("reference"),
    source: text("source").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [index("azkar_category_idx").on(t.category)],
);

export const allahNames = pgTable("allah_names", {
  number: integer("number").primaryKey(),
  arabic: text("arabic").notNull(),
  transliteration: text("transliteration").notNull(),
  meaningEn: text("meaning_en").notNull(),
  meaningUr: text("meaning_ur").notNull(),
  meaningHi: text("meaning_hi").notNull(),
  explanation: text("explanation").notNull(),
  reference: text("reference"),
  source: text("source").notNull(),
});

export const meta = pgTable("content_meta", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});
