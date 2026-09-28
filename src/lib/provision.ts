import { sql } from "drizzle-orm";
import { spawn } from "node:child_process";
import path from "node:path";
import { db } from "@/db";

/**
 * Self-healing content database.
 *
 * The preview environment can reset the PostgreSQL volume when the app
 * restarts. `ensureProvisioned()` detects an empty/missing schema and
 * re-creates the tables + re-seeds the verified content in the background
 * so the app always comes back fully populated.
 */

const g = globalThis as typeof globalThis & { __quranifyProvision?: Promise<void> };

const DDL = `
create table if not exists surahs (
  number integer primary key,
  name_arabic text not null,
  name_english text not null,
  ayah_count integer not null,
  revelation_type text not null
);
create table if not exists ayahs (
  id serial primary key,
  surah_number integer not null,
  ayah_number integer not null,
  text_uthmani text not null,
  source text not null default 'Tanzil / quran-json (Uthmani)'
);
create unique index if not exists ayahs_surah_ayah_idx on ayahs(surah_number, ayah_number);
create table if not exists translations (
  id serial primary key,
  surah_number integer not null,
  ayah_number integer not null,
  language text not null,
  translator text not null,
  text text not null
);
create index if not exists translations_lookup_idx on translations(surah_number, language, ayah_number);
create index if not exists translations_lang_idx on translations(language);
create table if not exists tafsir (
  id serial primary key,
  surah_number integer not null,
  ayah_number integer not null,
  language text not null,
  source text not null,
  source_detail text,
  text text not null
);
create index if not exists tafsir_lookup_idx on tafsir(surah_number, language, ayah_number);
create index if not exists tafsir_lang_idx on tafsir(language);
create table if not exists hadith_collections (
  slug text primary key,
  name_english text not null,
  name_arabic text,
  compiler text,
  description text,
  hadith_count integer not null default 0
);
create table if not exists hadiths (
  id serial primary key,
  collection text not null,
  book_number integer,
  book_title text,
  hadith_number text not null,
  arabic text,
  english text not null,
  urdu text,
  grades text,
  reference text not null,
  source text not null
);
create index if not exists hadiths_collection_idx on hadiths(collection);
create index if not exists hadiths_book_idx on hadiths(collection, book_number);
create table if not exists dua_categories (
  slug text primary key,
  title text not null,
  subtitle text,
  sort_order integer not null default 0,
  item_count integer not null default 0
);
create table if not exists duas (
  id serial primary key,
  category text not null,
  chapter_id integer not null,
  chapter_title text not null,
  title text,
  arabic text not null,
  transliteration text,
  translation text not null,
  repeat integer,
  reference text,
  source text not null,
  sort_order integer not null default 0
);
create index if not exists duas_category_idx on duas(category);
create table if not exists azkar_categories (
  slug text primary key,
  title text not null,
  subtitle text,
  sort_order integer not null default 0,
  item_count integer not null default 0
);
create table if not exists azkar (
  id serial primary key,
  category text not null,
  chapter_id integer not null,
  chapter_title text not null,
  arabic text not null,
  translation text not null,
  repeat integer,
  reference text,
  source text not null,
  sort_order integer not null default 0
);
create index if not exists azkar_category_idx on azkar(category);
create table if not exists allah_names (
  number integer primary key,
  arabic text not null,
  transliteration text not null,
  meaning_en text not null,
  meaning_ur text not null,
  meaning_hi text not null,
  explanation text not null,
  reference text,
  source text not null
);
create table if not exists content_meta (
  key text primary key,
  value text not null
);
`;

export async function isSeeded(): Promise<boolean> {
  try {
    const r = await db.execute(
      sql`select
        (select count(*) from surahs)::int as s,
        (select count(*) from allah_names)::int as n`,
    );
    const row = (r as unknown as { rows: Array<{ s: number; n: number }> }).rows[0];
    // surahs are inserted first, names last — both present means the run finished.
    return (row?.s ?? 0) >= 114 && (row?.n ?? 0) >= 99;
  } catch {
    return false;
  }
}

/** Runs the deterministic CLI seeder (proven path) as a subprocess. */
function runSeedScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    const bin = path.join(process.cwd(), "node_modules", ".bin", "tsx");
    const child = spawn(bin, ["scripts/seed.ts"], {
      cwd: process.cwd(),
      env: process.env,
      stdio: ["ignore", "inherit", "inherit"],
    });
    child.on("error", reject);
    child.on("exit", (code) =>
      code === 0 ? resolve() : reject(new Error(`seed script exited with code ${code}`)),
    );
  });
}

async function runProvision(): Promise<void> {
  if (await isSeeded()) return;
  const t0 = Date.now();
  console.log("[quranify] content database empty — provisioning schema + verified content…");
  await db.execute(sql.raw(DDL));
  // Make retries idempotent: a previous partial run may have left some rows,
  // which would otherwise violate primary keys on re-insert.
  await db.execute(
    sql.raw(
      "truncate table surahs, ayahs, translations, tafsir, hadith_collections, hadiths, dua_categories, duas, azkar_categories, azkar, allah_names, content_meta restart identity cascade",
    ),
  );
  await runSeedScript();
  console.log(`[quranify] content ready in ${Math.round((Date.now() - t0) / 1000)}s`);
}

/** Starts provisioning once (deduped) in the background if needed. */
export function ensureProvisioned(): Promise<void> {
  if (!g.__quranifyProvision) {
    g.__quranifyProvision = runProvision().catch((e) => {
      console.error("[quranify] provisioning failed:", e);
      g.__quranifyProvision = undefined;
    });
  }
  return g.__quranifyProvision;
}
