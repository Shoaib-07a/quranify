import type { Metadata } from "next";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  CloudRain,
  HandHeart,
  HeartHandshake,
  LifeBuoy,
  MoonStar,
  Plane,
  Shield,
  Sun,
  Users,
  UtensilsCrossed,
  Sparkles,
} from "lucide-react";
import { ChevronRight } from "lucide-react";
import { PageHeader, SourceTag } from "@/components/ui";
import { getDuaCategories } from "@/lib/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Duas — Authentic Supplications",
  description: "Authentic duas from Hisnul Muslim organised by category — daily life, salah, travel, protection and more.",
};

const ICONS: Record<string, LucideIcon> = {
  daily: Sun,
  salah: HandHeart,
  "night-waking": MoonStar,
  food: UtensilsCrossed,
  travel: Plane,
  protection: Shield,
  forgiveness: HeartHandshake,
  difficulty: LifeBuoy,
  family: Users,
  nature: CloudRain,
  worship: Sparkles,
};

export default async function DuasIndexPage() {
  const cats = await getDuaCategories();
  return (
    <div className="px-5">
      <PageHeader title="Duas" subtitle="Supplications for every moment" arabic="ٱلدُّعَاء" />
      <div className="stagger grid grid-cols-1 gap-3 sm:grid-cols-2">
        {cats.map((c) => {
          const Icon = ICONS[c.slug] ?? Sun;
          return (
            <Link key={c.slug} href={`/duas/${c.slug}`} className="press lift card group flex items-center gap-4 p-4.5">
              <span
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
                style={{ background: "var(--accent-soft)", color: "var(--accent-ink)" }}
                aria-hidden
              >
                <Icon size={21} strokeWidth={1.9} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[15.5px] font-bold tracking-tight">{c.title}</span>
                <span className="mt-0.5 block text-[12px] leading-snug" style={{ color: "var(--muted)" }}>
                  {c.itemCount} duas{c.subtitle ? ` · ${c.subtitle}` : ""}
                </span>
              </span>
              <ChevronRight size={17} className="shrink-0 transition-transform group-hover:translate-x-0.5" style={{ color: "var(--muted)" }} aria-hidden />
            </Link>
          );
        })}
      </div>
      <div className="mt-5 mb-4 px-1">
        <SourceTag>Hisnul Muslim (Fortress of the Muslim) — Sa'id ibn 'Ali ibn Wahf al-Qahtani, via the official hisnmuslim.com API. References preserved per item.</SourceTag>
      </div>
    </div>
  );
}
