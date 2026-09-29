"use server";

import { db } from "@/db";
import { ayahNotes } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function saveNote(surah: number, ayah: number, note: string) {
  if (!note.trim()) {
    await db.delete(ayahNotes).where(and(eq(ayahNotes.surahNumber, surah), eq(ayahNotes.ayahNumber, ayah)));
  } else {
    const existing = await db.select().from(ayahNotes).where(and(eq(ayahNotes.surahNumber, surah), eq(ayahNotes.ayahNumber, ayah))).limit(1);
    if (existing.length) {
      await db.update(ayahNotes).set({ note, createdAt: Date.now() }).where(eq(ayahNotes.id, existing[0].id));
    } else {
      await db.insert(ayahNotes).values({
        surahNumber: surah,
        ayahNumber: ayah,
        note,
        createdAt: Date.now(),
      });
    }
  }
  revalidatePath(`/quran/${surah}`);
}

export async function getNotesForSurah(surah: number) {
  return db.select().from(ayahNotes).where(eq(ayahNotes.surahNumber, surah));
}
