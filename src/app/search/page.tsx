import type { Metadata } from "next";
import SearchClient from "./SearchClient";

export const metadata: Metadata = {
  title: "Search",
  description: "Search across Surahs, Ayahs, Hadith, Duas, Azkaar and the 99 Names of Allah.",
};

export default function SearchPage() {
  return <SearchClient />;
}
