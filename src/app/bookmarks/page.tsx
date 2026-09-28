import type { Metadata } from "next";
import BookmarksClient from "./BookmarksClient";

export const metadata: Metadata = {
  title: "Bookmarks",
  description: "Your saved ayahs, tafseer, hadith, duas, azkaar and names.",
};

export default function BookmarksPage() {
  return <BookmarksClient />;
}
