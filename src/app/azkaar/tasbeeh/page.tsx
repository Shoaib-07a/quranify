import type { Metadata } from "next";
import TasbeehCounter from "@/components/Tasbeeh";
import { PageHeader, SourceTag } from "@/components/ui";

export const metadata: Metadata = {
  title: "Tasbeeh Counter",
  description: "A simple, calming tasbeeh counter for daily dhikr.",
};

const PHRASES = [
  { ar: "سُبْحَانَ ٱللَّٰهِ", en: "SubhanAllah — Glory be to Allah", count: 33 },
  { ar: "ٱلْحَمْدُ لِلَّٰهِ", en: "Alhamdulillah — All praise is due to Allah", count: 33 },
  { ar: "ٱللَّٰهُ أَكْبَرُ", en: "Allahu Akbar — Allah is the Greatest", count: 34 },
];

export default function TasbeehPage() {
  return (
    <div className="px-5">
      <PageHeader
        title="Tasbeeh Counter"
        subtitle="Tap anywhere on the circle to count"
        arabic="تَسْبِيح"
        back={{ href: "/azkaar", label: "Back to azkaar" }}
      />

      <div className="fade-up mb-5 grid grid-cols-3 gap-2">
        {PHRASES.map((p) => (
          <div key={p.ar} className="card-flat flex flex-col items-center gap-1.5 px-2 py-3.5 text-center">
            <span className="font-arabic text-[19px] leading-tight" dir="rtl" lang="ar" style={{ color: "var(--accent-ink)" }}>
              {p.ar}
            </span>
            <span className="text-[10.5px] font-semibold" style={{ color: "var(--muted)" }}>
              {p.en}
            </span>
            <span
              className="rounded-full px-2 py-px text-[10px] font-bold"
              style={{ background: "var(--accent-soft)", color: "var(--accent-ink)" }}
            >
              ×{p.count}
            </span>
          </div>
        ))}
      </div>

      <div className="fade-up">
        <TasbeehCounter />
      </div>

      <div className="mt-5 mb-4 flex flex-col gap-1.5 px-1">
        <SourceTag>
          Reciting SubhanAllah (33×), Alhamdulillah (33×) and Allahu Akbar (34×) after each
          obligatory prayer is reported in Sahih Muslim 597.
        </SourceTag>
      </div>
    </div>
  );
}
