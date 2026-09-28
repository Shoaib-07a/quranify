/**
 * Re-seeds ONLY the tafsir table with the concise "essential" tafseer
 * editions:
 *   en — Al-Mukhtasar fi al-Tafsir (King Fahd Complex)
 *   ur — Tazkirul Quran (Maulana Wahiduddin Khan)
 *   hi — Al-Mukhtasar fi al-Tafsir (King Fahd Complex)
 *
 * Existing rows are cleared first so this can run safely on a seeded DB.
 */
import "dotenv/config";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { tafsir } from "../src/db/schema";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

const UA = { "User-Agent": "Quranify-Seeder/1.0 (educational app)" };

async function fetchJson(url: string, attempts = 3): Promise<any> {
  let lastErr: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(url, { headers: UA, signal: AbortSignal.timeout(45_000) });
      if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
      return await res.json();
    } catch (e) {
      lastErr = e;
      await new Promise((r) => setTimeout(r, 800 * (i + 1)));
    }
  }
  throw lastErr;
}

async function mapLimit<T, R>(arr: T[], limit: number, fn: (item: T, idx: number) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(arr.length);
  let i = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, arr.length) }, async () => {
      while (i < arr.length) {
        const idx = i++;
        out[idx] = await fn(arr[idx], idx);
      }
    }),
  );
  return out;
}

const TAFSIR_EDITIONS = [
  { edition: "en-tafsir-al-mukhtasar", lang: "en", source: "Al-Mukhtasar fi al-Tafsir (English) — Markaz al-Malik Fahd" },
  { edition: "ur-tazkirul-quran", lang: "ur", source: "Tazkirul Quran (Urdu) — Maulana Wahiduddin Khan" },
  { edition: "hindi-mokhtasar", lang: "hi", source: "Al-Mukhtasar fi al-Tafsir (Hindi) — Markaz al-Malik Fahd" },
];

async function main() {
  await pool.query("truncate table tafsir restart identity");
  console.log("cleared tafsir table");
  const surahNums = Array.from({ length: 114 }, (_, i) => i + 1);
  for (const ed of TAFSIR_EDITIONS) {
    console.log(`• ${ed.edition} (${ed.lang})…`);
    let failed = 0;
    const rows: any[] = [];
    await mapLimit(surahNums, 8, async (n) => {
      try {
        const json = await fetchJson(
          `https://cdn.jsdelivr.net/gh/spa5k/tafsir_api@main/tafsir/${ed.edition}/${n}.json`,
          2,
        );
        const items: any[] = Array.isArray(json) ? json : Array.isArray(json?.ayahs) ? json.ayahs : [];
        for (const it of items) {
          const ayahNumber = Number(it.ayah ?? 0);
          const text = String(it.text ?? "").trim();
          if (ayahNumber > 0 && text) {
            rows.push({
              surahNumber: n,
              ayahNumber,
              language: ed.lang,
              source: ed.source,
              sourceDetail: "spa5k/tafsir_api (tafsir.app mirror)",
              text,
            });
          }
        }
      } catch {
        failed++;
      }
      if (n % 30 === 0) console.log(`   …${n}/114`);
    });
    if (failed) console.log(`   ⚠ ${failed} files failed`);
    for (let i = 0; i < rows.length; i += 1000) {
      await db.insert(tafsir).values(rows.slice(i, i + 1000));
    }
    console.log(`   inserted ${rows.length} (${ed.lang})`);
  }
  const { rows } = await pool.query(
    "select language, count(*) c, round(avg(length(text))) avg_len from tafsir group by language order by language",
  );
  console.table(rows);
  await pool.end();
}

main().catch(async (e) => {
  console.error(e);
  try {
    await pool.end();
  } catch {}
  process.exit(1);
});
