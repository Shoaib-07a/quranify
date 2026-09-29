"use client";

import { useState } from "react";
import { PageHeader, SectionLabel } from "@/components/ui";
import { Calendar, ChevronRight, BookOpen } from "lucide-react";
import Link from "next/link";

export default function ReadingPlansPage() {
  const [days, setDays] = useState(30);
  
  // Quran has 604 pages in standard Madani Mushaf or 30 Juz
  // Let's use Juz for simplicity in the calculation
  const juzPerDay = 30 / days;
  const pagesPerDay = 604 / days;

  return (
    <div className="px-5 pb-10">
      <PageHeader title="Reading Plans" subtitle="Set a goal to complete the Quran" />
      
      <div className="card p-6 text-center">
        <Calendar className="mx-auto text-accent" size={32} />
        <h2 className="mt-4 text-xl font-bold">I want to complete in...</h2>
        
        <div className="mt-6 flex items-center justify-center gap-4">
          {[7, 15, 30, 60].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className="press rounded-2xl border px-5 py-3 font-bold transition-all"
              style={{
                borderColor: days === d ? "var(--accent)" : "var(--line)",
                background: days === d ? "var(--accent-soft)" : "transparent",
                color: days === d ? "var(--accent-ink)" : "var(--ink-soft)",
              }}
            >
              {d} Days
            </button>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4">
          <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900">
            <p className="text-2xl font-bold text-accent">{juzPerDay.toFixed(2)}</p>
            <p className="text-xs font-bold uppercase tracking-widest text-muted">Juz / Day</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900">
            <p className="text-2xl font-bold text-accent">{Math.ceil(pagesPerDay)}</p>
            <p className="text-xs font-bold uppercase tracking-widest text-muted">Pages / Day</p>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <SectionLabel>Plan Breakdown</SectionLabel>
        <div className="flex flex-col gap-3">
          {Array.from({ length: days }).slice(0, 10).map((_, i) => (
            <div key={i} className="card-flat flex items-center justify-between p-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted">Day {i + 1}</p>
                <p className="font-bold">Read Juz {Math.floor(i * juzPerDay) + 1} to {Math.floor((i + 1) * juzPerDay) || 1}</p>
              </div>
              <Link href={`/quran`} className="press flex h-10 w-10 items-center justify-center rounded-full bg-accent-soft text-accent">
                <BookOpen size={18} />
              </Link>
            </div>
          ))}
          {days > 10 && <p className="text-center text-xs text-muted">...and so on for {days} days</p>}
        </div>
      </div>
    </div>
  );
}
