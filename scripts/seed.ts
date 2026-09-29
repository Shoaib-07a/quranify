/**
 * Quranify content seeder.
 *
 * Populates PostgreSQL with verified religious content from public,
 * widely-used datasets. Every row records its source so the UI can
 * attribute text accurately:
 *
 *  - Quran Arabic text   : Tanzil Uthmani text (via quran-json, CC-BY-4.0)
 *  - Translations        : AlQuran Cloud (en.sahih / ur.ahmedali / hi.farooq)
 *  - Tafseer             : spa5k/tafsir_api mirror of tafsir.app sources
 *                          (Ibn Kathir EN & UR, Al-Mukhtasar HI)
 *  - Hadith              : fawazahmed0/hadith-api (sunnah.com data)
 *  - Duas & Azkaar       : Hisnul Muslim (hisnmuslim.com official API)
 *  - 99 Names of Allah   : Al-Adhan API (Islamic Network)
 */
import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { Pool } from "pg";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import {
  allahNames,
  ayahs,
  azkar,
  azkarCategories,
  duaCategories,
  duas,
  hadithCollections,
  hadiths,
  meta,
  surahs,
  tafsir,
  translations,
} from "../src/db/schema";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

/* ------------------------------------------------------------------ */
/* helpers                                                             */
/* ------------------------------------------------------------------ */

const UA = { "User-Agent": "Quranify-Seeder/1.0 (educational app)" };

async function fetchJson(url: string, attempts = 3): Promise<any> {
  let lastErr: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(url, {
        headers: UA,
        signal: AbortSignal.timeout(45_000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
      return await res.json();
    } catch (e) {
      lastErr = e;
      await new Promise((r) => setTimeout(r, 800 * (i + 1)));
    }
  }
  throw lastErr;
}

async function mapLimit<T, R>(
  arr: T[],
  limit: number,
  fn: (item: T, idx: number) => Promise<R>,
): Promise<R[]> {
  const out: R[] = new Array(arr.length);
  let i = 0;
  const workers = Array.from({ length: Math.min(limit, arr.length) }, async () => {
    while (i < arr.length) {
      const idx = i++;
      out[idx] = await fn(arr[idx], idx);
    }
  });
  await Promise.all(workers);
  return out;
}

async function batchInsert(
  table: any,
  rows: any[],
  size = 500,
  label = "rows",
) {
  for (let i = 0; i < rows.length; i += size) {
    await db.insert(table).values(rows.slice(i, i + size));
  }
  process.stdout.write(`   ${label}: ${rows.length} inserted\n`);
}

/* ------------------------------------------------------------------ */
/* 1. Quran (surahs + ayahs)                                           */
/* ------------------------------------------------------------------ */

async function seedQuran() {
  console.log("• Seeding Quran (Tanzil Uthmani via quran-json)…");
  const file = path.join(process.cwd(), "node_modules/quran-json/dist/quran.json");
  const data = JSON.parse(fs.readFileSync(file, "utf8")) as Array<{
    id: string;
    name: string;
    transliteration: string;
    type: string;
    total_verses: string;
    verses: Array<{ id: number; text: string }>;
  }>;

  console.log("• Fetching surah metadata (revelation order, juz, etc)…");
  const metaJson = await fetchJson("https://api.alquran.cloud/v1/meta");
  const surahMeta = metaJson?.data?.surahs?.references ?? [];
  const metaMap = new Map<number, any>();
  for (const m of surahMeta) {
    metaMap.set(Number(m.number), m);
  }

  const surahRows = data.map((s) => {
    const num = Number(s.id);
    const m = metaMap.get(num);
    return {
      number: num,
      nameArabic: s.name,
      nameEnglish: s.transliteration,
      ayahCount: Number(s.total_verses),
      revelationType: s.type === "meccan" ? "makki" : "madani",
      revelationOrder: m?.revelationOrder ?? null,
      juzStart: m?.juz ?? null,
      introduction: null, // Would require a separate dataset, keeping null for now
    };
  });
  await db.insert(surahs).values(surahRows);
  console.log(`   surahs: ${surahRows.length}`);

  const ayahRows = data.flatMap((s) =>
    s.verses.map((v) => ({
      surahNumber: Number(s.id),
      ayahNumber: v.id,
      textUthmani: v.text,
      source: "Tanzil Uthmani (quran-json, CC-BY-4.0)",
    })),
  );
  await batchInsert(ayahs, ayahRows, 1000, "ayahs");
}

/* ------------------------------------------------------------------ */
/* 2. Translations (English / Urdu / Hindi)                            */
/* ------------------------------------------------------------------ */

const TRANSLATION_EDITIONS: Array<{ edition: string; lang: string; translator: string }> = [
  { edition: "en.sahih", lang: "en", translator: "Saheeh International" },
  { edition: "ur.ahmedali", lang: "ur", translator: "Ahmed Ali" },
  { edition: "hi.farooq", lang: "hi", translator: "Suhel Farooq Khan & Saifur Rahman Nadwi" },
];

async function seedTranslations() {
  for (const t of TRANSLATION_EDITIONS) {
    console.log(`• Fetching Quran translation ${t.edition} (${t.lang})…`);
    const json = await fetchJson(`https://api.alquran.cloud/v1/quran/${t.edition}`);
    const surs = json?.data?.surahs ?? [];
    const rows = surs.flatMap((s: any) =>
      (s.ayahs as any[]).map((a) => ({
        surahNumber: s.number as number,
        ayahNumber: a.numberInSurah as number,
        language: t.lang,
        translator: `${t.translator} (${t.edition} via AlQuran Cloud)`,
        text: String(a.text ?? ""),
      })),
    );
    await batchInsert(translations, rows, 1000, `translations ${t.lang}`);
  }
}

/* ------------------------------------------------------------------ */
/* 3. Tafseer (English / Urdu / Hindi)                                 */
/* ------------------------------------------------------------------ */

const TAFSIR_EDITIONS: Array<{ edition: string; lang: string; source: string }> = [
  {
    edition: "en-tafsir-al-mukhtasar",
    lang: "en",
    source: "Al-Mukhtasar fi al-Tafsir (English) — Markaz al-Malik Fahd",
  },
  {
    edition: "ur-tazkirul-quran",
    lang: "ur",
    source: "Tazkirul Quran (Urdu) — Maulana Wahiduddin Khan",
  },
  {
    edition: "hindi-mokhtasar",
    lang: "hi",
    source: "Al-Mukhtasar fi al-Tafsir (Hindi) — Markaz al-Malik Fahd",
  },
];

async function seedTafsir() {
  const surahNums = Array.from({ length: 114 }, (_, i) => i + 1);
  for (const ed of TAFSIR_EDITIONS) {
    console.log(`• Fetching tafseer ${ed.edition} (${ed.lang})…`);
    let failed = 0;
    const allRows: any[] = [];
    await mapLimit(surahNums, 8, async (n) => {
      try {
        const json = await fetchJson(
          `https://cdn.jsdelivr.net/gh/spa5k/tafsir_api@main/tafsir/${ed.edition}/${n}.json`,
          2,
        );
        const items: any[] = Array.isArray(json)
          ? json
          : Array.isArray(json?.ayahs)
            ? json.ayahs
            : [];
        for (const it of items) {
          const ayahNum = Number(it.ayah ?? it.numberInSurah ?? 0);
          const text = String(it.text ?? "").trim();
          if (ayahNum > 0 && text.length > 0) {
            allRows.push({
              surahNumber: n,
              ayahNumber: ayahNum,
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
      if (n % 20 === 0) process.stdout.write(`   …surah ${n}/114\n`);
    });
    if (failed) console.log(`   ⚠ ${failed} surah files could not be fetched for ${ed.edition}`);
    await batchInsert(tafsir, allRows, 1000, `tafseer ${ed.lang}`);
  }
}

/* ------------------------------------------------------------------ */
/* 4. Hadith                                                           */
/* ------------------------------------------------------------------ */

const HADITH_COLLECTIONS: Array<{
  slug: string;
  engEdition: string;
  araEdition: string;
  name: string;
  arabic: string;
  compiler: string;
  description: string;
}> = [
  {
    slug: "bukhari",
    engEdition: "eng-bukhari",
    araEdition: "ara-bukhari",
    name: "Sahih al-Bukhari",
    arabic: "صحيح البخاري",
    compiler: "Imam Muhammad al-Bukhari (d. 256 AH)",
    description:
      "Regarded as the most authentic hadith collection, compiled by Imam al-Bukhari with strict criteria.",
  },
  {
    slug: "muslim",
    engEdition: "eng-muslim",
    araEdition: "ara-muslim",
    name: "Sahih Muslim",
    arabic: "صحيح مسلم",
    compiler: "Imam Muslim ibn al-Hajjaj (d. 261 AH)",
    description:
      "The second most authentic hadith collection, renowned for its precise thematic arrangement.",
  },
  {
    slug: "nawawi",
    engEdition: "eng-nawawi",
    araEdition: "ara-nawawi",
    name: "40 Hadith Nawawi",
    arabic: "الأربعون النووية",
    compiler: "Imam Yahya an-Nawawi (d. 676 AH)",
    description:
      "A beloved anthology of 42 foundational hadiths covering the essentials of Islam, compiled by Imam an-Nawawi.",
  },
  {
    slug: "qudsi",
    engEdition: "eng-qudsi",
    araEdition: "ara-qudsi",
    name: "40 Hadith Qudsi",
    arabic: "الأحاديث القدسية",
    compiler: "Compiled selection of Hadith Qudsi",
    description:
      "Sayings in which the Prophet ﷺ related words of Allah that are not part of the Quran.",
  },
];

async function seedHadith() {
  for (const c of HADITH_COLLECTIONS) {
    console.log(`• Fetching hadith collection ${c.slug}…`);
    try {
      const eng = await fetchJson(
        `https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/${c.engEdition}.min.json`,
      );
      const ara = await fetchJson(
        `https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/${c.araEdition}.min.json`,
      );
      const araMap = new Map<string, string>();
      for (const h of ara?.hadiths ?? []) {
        araMap.set(String(h.hadithnumber), String(h.text ?? ""));
      }
      const sections: Record<string, string> = eng?.metadata?.sections ?? {};
      const rows = (eng?.hadiths ?? []).map((h: any) => {
        const num = String(h.hadithnumber);
        const book = Number(h?.reference?.book ?? 0) || null;
        return {
          collection: c.slug,
          bookNumber: book,
          bookTitle: book ? sections[String(book)] ?? null : null,
          hadithNumber: num,
          arabic: araMap.get(num) || null,
          english: String(h.text ?? "").trim(),
          urdu: null,
          grades: Array.isArray(h.grades) && h.grades.length > 0 ? JSON.stringify(h.grades) : null,
          reference: `${c.name} ${num}`,
          source: "Sunnah.com-aligned dataset via fawazahmed0/hadith-api",
        };
      }).filter((r: any) => r.english.length > 0);

      await db.insert(hadithCollections).values({
        slug: c.slug,
        nameEnglish: c.name,
        nameArabic: c.arabic,
        compiler: c.compiler,
        description: c.description,
        hadithCount: rows.length,
      });
      await batchInsert(hadiths, rows, 500, `hadiths ${c.slug}`);
    } catch (e) {
      console.log(`   ⚠ Could not seed ${c.slug}: ${(e as Error).message}`);
    }
  }
}

/* ------------------------------------------------------------------ */
/* 5. Duas & Azkaar (Hisnul Muslim)                                    */
/* ------------------------------------------------------------------ */

const HUSN_SOURCE = "Hisnul Muslim — Sa'id ibn 'Ali ibn Wahf al-Qahtani (hisnmuslim.com)";

const AzkarCategories: Array<{ slug: string; title: string; subtitle: string; chapters: number[] }> = [
  { slug: "morning-evening", title: "Morning & Evening Adhkar", subtitle: "The daily remembrances of morning and evening", chapters: [27] },
  { slug: "sleep-night", title: "Adhkar Before Sleep", subtitle: "Remembrances recited before sleeping", chapters: [28] },
  { slug: "after-salah", title: "Adhkar After Salah", subtitle: "What to say after completing the prayer", chapters: [25] },
  { slug: "praise-remembrance", title: "Remembrance & Glorification", subtitle: "The excellence of dhikr and how the Prophet ﷺ glorified Allah", chapters: [130, 131] },
  { slug: "protection-azkar", title: "Protection", subtitle: "Protection from shaytan, shirk and evil", chapters: [45, 88, 92, 125, 126, 128] },
];

const DuaCats: Array<{ slug: string; title: string; subtitle: string; chapters: number[] }> = [
  { slug: "daily", title: "Daily Duas", subtitle: "Home, mosque, clothing, gatherings & everyday manners", chapters: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 77, 78, 83, 84, 85, 86, 87, 89, 90, 91, 93, 98, 106, 108, 109, 110, 111, 112, 113, 114, 132] },
  { slug: "salah", title: "Duas of Salah", subtitle: "Adhan, opening, ruku', sujood, tashahhud & witr", chapters: [15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 32, 33, 42] },
  { slug: "night-waking", title: "Night & Waking", subtitle: "After waking, bad dreams & restlessness at night", chapters: [1, 29, 30, 31] },
  { slug: "food", title: "Food & Drink", subtitle: "Eating, fasting and hosting", chapters: [68, 69, 70, 71, 72, 73, 74, 75, 76] },
  { slug: "travel", title: "Travel", subtitle: "Journeys, vehicles and returning home", chapters: [95, 96, 97, 99, 100, 101, 102, 103, 104, 105] },
  { slug: "protection", title: "Protection", subtitle: "Enemies, oppression, fear & evil omens", chapters: [36, 37, 38, 39, 40, 94] },
  { slug: "forgiveness", title: "Forgiveness & Repentance", subtitle: "Seeking Allah's pardon", chapters: [44, 129] },
  { slug: "difficulty", title: "Difficulty & Grief", subtitle: "Worry, anguish, debt, hardship & tragedy", chapters: [34, 35, 41, 43, 46, 53, 82, 122] },
  { slug: "family", title: "Family & Community", subtitle: "Children, marriage, illness & funerals", chapters: [47, 48, 49, 50, 51, 52, 54, 55, 56, 57, 58, 59, 60, 79, 80, 81] },
  { slug: "nature", title: "Nature & Events", subtitle: "Wind, thunder, rain & the new moon", chapters: [61, 62, 63, 64, 65, 66, 67] },
  { slug: "worship", title: "Worship & Devotion", subtitle: "Istikharah, salawat, Hajj & Umrah", chapters: [26, 107, 115, 116, 117, 118, 119, 120, 121, 123, 124, 127] },
];

function normalizeRepeat(v: any): number | null {
  const n = Number.parseInt(String(v ?? ""), 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

async function seedHusn(kind: "duas" | "azkar") {
  const cats = kind === "duas" ? DuaCats : AzkarCategories;
  const chapterIds = cats.flatMap((c) => c.chapters);
  console.log(`• Fetching Hisnul Muslim ${kind} (${chapterIds.length} chapters)…`);

  // chapterId -> chapter title (from index)
  const index = await fetchJson("https://www.hisnmuslim.com/api/en/husn_en.json");
  const titleMap = new Map<number, string>();
  for (const ch of index?.English ?? []) titleMap.set(Number(ch.ID), String(ch.TITLE));

  const itemsByChapter = new Map<number, any[]>();
  await mapLimit(chapterIds, 6, async (id) => {
    try {
      const json = await fetchJson(`https://www.hisnmuslim.com/api/en/${id}.json`, 2);
      const key = Object.keys(json ?? {})[0];
      itemsByChapter.set(id, Array.isArray(json?.[key]) ? json[key] : []);
    } catch {
      itemsByChapter.set(id, []);
    }
  });

  const catRows: any[] = [];
  const itemRows: any[] = [];
  cats.forEach((cat, ci) => {
    let count = 0;
    let order = 0;
    for (const chId of cat.chapters) {
      const chapterTitle = titleMap.get(chId) ?? `Chapter ${chId}`;
      for (const it of itemsByChapter.get(chId) ?? []) {
        const arabic = String(it.ARABIC_TEXT ?? "").trim();
        const translation = String(it.TRANSLATED_TEXT ?? "").trim();
        if (!arabic || !translation) continue;
        count++;
        order++;
        itemRows.push({
          category: cat.slug,
          chapterId: chId,
          chapterTitle,
          ...(kind === "duas" ? { title: String(it.LANGUAGE_ARABIC_TRANSLATED_TEXT ?? "").trim() || null } : {}),
          arabic,
          ...(kind === "duas" ? { transliteration: null } : {}),
          translation,
          repeat: normalizeRepeat(it.REPEAT),
          reference: `Hisnul Muslim — ${chapterTitle}`,
          source: HUSN_SOURCE,
          sortOrder: order,
        });
      }
    }
    catRows.push({ slug: cat.slug, title: cat.title, subtitle: cat.subtitle, sortOrder: ci + 1, itemCount: count });
  });

  if (kind === "duas") {
    await batchInsert(duaCategories, catRows, 50, "dua categories");
    await batchInsert(duas, itemRows, 500, "duas");
  } else {
    await batchInsert(azkarCategories, catRows, 50, "azkar categories");
    await batchInsert(azkar, itemRows, 500, "azkar");
  }
}

/* ------------------------------------------------------------------ */
/* 6. 99 Names of Allah                                                */
/* ------------------------------------------------------------------ */

// Standard Urdu renderings of the meanings of al-Asma' al-Husna.
const NAMES_UR = [
  "بڑا مہربان", "نہایت رحم والا", "حقیقی بادشاہ", "پاک اور مقدس", "سلامتی عطا کرنے والا",
  "امان اور ایمان دینے والا", "نگہبان اور حفاظت کرنے والا", "غالب اور زبردست", "اپنی مرضی جمانے والا",
  "عظمت اور کبریائی والا", "پیدا کرنے والا", "خوبی سے بنانے والا", "صورتیں بنانے والا",
  "بار بار بخشنے والا", "سب پر غلبہ رکھنے والا", "بلا عوض عطا کرنے والا", "رزق پہنچانے والا",
  "فیصلہ کشا اور کھولنے والا", "سب کچھ جاننے والا", "روزی تنگ کرنے والا", "روزی کشادہ کرنے والا",
  "پست کرنے والا", "بلند کرنے والا", "عزت دینے والا", "ذلت دینے والا", "سب سننے والا",
  "سب دیکھنے والا", "فیصلہ فرمانے والا", "عدل و انصاف والا", "باریک بینیوں سے آگاہ",
  "ہر چیز سے باخبر", "بردبار اور حلیم", "بہت بڑا اور عظیم", "بہت معاف کرنے والا",
  "نیکی کا قدردان", "بلند و برتر", "بہت بڑا", "حفاظت کرنے والا", "قوت اور روزی دینے والا",
  "حساب لینے والا", "جلال اور عظمت والا", "کرم اور فیاضی والا", "مداقلت کرنے والا نگران",
  "دعائیں قبول کرنے والا", "وسعت والا", "حکمت والا", "محبت کرنے والا", "جلال اور عزت والا",
  "مردوں کو دوبارہ اٹھانے والا", "ہر چیز پر گواہ", "برحق", "بھروسے کے لائق کارپرداز",
  "طاقتور", "مضبوط اور پائیدار", "دوست اور سرپرست", "تعریف کے لائق", "ہر چیز کا شمار کرنے والا",
  "پہلی بار پیدا کرنے والا", "دوبارہ پیدا کرنے والا", "زندگی دینے والا", "موت دینے والا",
  "ہمیشہ زندہ", "سب کو قائم رکھنے والا", "ہر چیز پانے والا", "بزرگی اور شرافت والا",
  "یکتا اور واحد", "ایک اور بے مثال", "بے نیاز، سب کا سہارا", "ہر بات پر قادر",
  "پوری قدرت والا", "آگے بڑھانے والا", "پیچھے رکھنے والا", "سب سے پہلا", "سب کے بعد باقی رہنے والا",
  "ظاہر اور آشکار", "پوشیدہ", "حکمران اور مدبر", "بلند مرتبہ", "نیکی کا سرچشمہ",
  "توبہ قبول کرنے والا", "بدلہ لینے والا", "درگزر کرنے والا", "نہایت شفیق", "بادشاہی کا مالک",
  "جلال اور کرم والا", "انصاف قائم کرنے والا", "جمع کرنے والا", "بے نیاز اور غنی",
  "بے نیاز کرنے والا", "روکنے والا", "ضرر پہنچانے کا اختیار رکھنے والا", "فائدہ پہنچانے والا",
  "نور اور روشنی", "ہدایت دینے والا", "انوکھا پیدا کرنے والا", "ہمیشہ باقی رہنے والا",
  "سب کا وارث", "راہِ راست دکھانے والا", "بہت صبر والا",
];

// Standard Hindi renderings of the meanings of al-Asma' al-Husna.
const NAMES_HI = [
  "परम दयालु", "अत्यंत कृपालु", "असली महाराजा", "अत्यंत पवित्र", "शांति का स्रोत",
  "विश्वास और सुरक्षा देने वाला", "रक्षक और निगरान", "सर्वशक्तिमान पराक्रमी", "बलपूर्वक वश में करने वाला",
  "महानतम गरिमावान", "रचनाकार", "उत्पन्न करने वाला", "रूप देने वाला",
  "बार-बार क्षमा करने वाला", "सब पर विजय पाने वाला", "निःस्वार्थ देने वाला", "रोज़ी देने वाला",
  "खोलने और निर्णय करने वाला", "सर्वज्ञ", "संकुचित करने वाला", "विस्तार करने वाला",
  "नीचा करने वाला", "ऊँचा करने वाला", "सम्मान देने वाला", "अपमान करने वाला",
  "सब सुनने वाला", "सब देखने वाला", "न्याय करने वाला", "पूर्ण न्यायी",
  "सूक्ष्मता जानने वाला", "सभी बातों से परिचित", "सहनशील और धीर", "अत्यंत महान",
  "अत्यंत क्षमाशील", "आभार मानने वाला", "सर्वोच्च", "सबसे बड़ा", "संरक्षक",
  "शक्ति और आहार देने वाला", "लेखा लेने वाला", "महिमाशाली", "उदार और करुणामय",
  "सतर्क निगरान", "दुआ स्वीकार करने वाला", "असीम विस्तार वाला", "परम बुद्धिमान",
  "प्रेम करने वाला", "महिमामय", "पुनः जीवित करने वाला", "साक्षी", "परम सत्य",
  "विश्वसनीय कार्यसाधक", "बलशाली", "अत्यंत दृढ़", "संरक्षक मित्र", "स्तुति के योग्य",
  "गणना में रखने वाला", "आरंभ करने वाला", "पुनः स्थापित करने वाला", "जीवन देने वाला",
  "मृत्यु देने वाला", "सदा जीवित", "स्वयं-संचालन करने वाला", "सब कुछ पाने वाला",
  "शानदार श्रेष्ठ", "अद्वितीय", "एकमेव", "स्वयंपूर्ण, सबका आश्रय", "सर्वसमर्थ",
  "पूर्ण शक्तिसम्पन्न", "अग्रसर करने वाला", "विलंबित करने वाला", "प्रथम", "अंतिम",
  "प्रकट", "गुप्त", "सर्वोच्च अधिकारी", "सर्वोपरि उन्नत", "परम भलाई करने वाला",
  "पश्चाताप स्वीकार करने वाला", "प्रतिशोध लेने वाला", "क्षमा करने वाला", "अत्यंत करुणामय",
  "सम्पूर्ण राज्य का स्वामी", "महिमा और सम्मान का स्वामी", "निष्पक्ष न्याय करने वाला",
  "इकट्ठा करने वाला", "धनी और स्वावलंबी", "समृद्ध करने वाला", "रोकने वाला",
  "कष्ट देने का अधिकार रखने वाला", "लाभ देने वाला", "प्रकाशस्वरूप", "मार्गदर्शक",
  "अद्भुत रचनाकार", "अविनाशी", "उत्तराधिकारी", "सीधा मार्ग दिखाने वाला", "अत्यंत धैर्यवान",
];

const NAMES_REFERENCE =
  "Enumeration of the 99 Names known from the famous hadith (Jami' at-Tirmidhi 3507); list per popular tradition (Al-Walid ibn Muslim's narration)";

async function seedNames() {
  console.log("• Seeding 99 Names of Allah (Al-Adhan / Islamic Network)…");
  const json = await fetchJson("https://api.aladhan.com/v1/asmaAlHusna");
  const list: any[] = json?.data ?? [];
  const rows = list.map((n: any, i: number) => {
    const meaningEn: string = n?.en?.meaning ?? "";
    return {
      number: Number(n.number),
      arabic: String(n.name ?? ""),
      transliteration: String(n.transliteration ?? ""),
      meaningEn,
      meaningUr: NAMES_UR[i] ?? "",
      meaningHi: NAMES_HI[i] ?? "",
      explanation: `Allah is ${meaningEn} — one of His beautiful names (al-Asma' al-Husna). Urdu: ${NAMES_UR[i] ?? ""}. Hindi: ${NAMES_HI[i] ?? ""}.`,
      reference: NAMES_REFERENCE,
      source: "Al-Adhan API (Islamic Network) — Arabic, transliteration & English meaning; Urdu/Hindi: standard renderings",
    };
  });
  await batchInsert(allahNames, rows, 100, "names");
}

/* ------------------------------------------------------------------ */
/* main                                                                */
/* ------------------------------------------------------------------ */

/** Seeds every section on top of the existing schema (idempotent per full run). */
export async function seedAll() {
  console.log("Quranify seed starting…\n");
  await seedQuran();
  await seedTranslations();
  await seedTafsir();
  await seedHadith();
  await seedHusn("duas");
  await seedHusn("azkar");
  await seedNames();
  await db
    .insert(meta)
    .values({ key: "seeded_at", value: new Date().toISOString() })
    .onConflictDoNothing();
  console.log("\nSeed complete.");
}

async function main() {
  await seedAll();
  console.log("\nFetching row counts…");
  const { rows } = await pool.query(
    `select 'surahs' t, count(*) c from surahs
     union all select 'ayahs', count(*) from ayahs
     union all select 'translations', count(*) from translations
     union all select 'tafsir', count(*) from tafsir
     union all select 'hadith_collections', count(*) from hadith_collections
     union all select 'hadiths', count(*) from hadiths
     union all select 'duas', count(*) from duas
     union all select 'azkar', count(*) from azkar
     union all select 'names', count(*) from allah_names`,
  );
  console.table(rows);
  await pool.end();
}

const invokedAsCli = (() => {
  try {
    return process.argv[1] ? import.meta.url === pathToFileURL(process.argv[1]).href : false;
  } catch {
    return false;
  }
})();

if (invokedAsCli) {
  main().catch(async (e) => {
    console.error("Seed failed:", e);
    try {
      await pool.end();
    } catch {}
    process.exit(1);
  });
}
