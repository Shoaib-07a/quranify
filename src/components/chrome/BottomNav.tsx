"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, BookText, Home, LayoutGrid, ScrollText } from "lucide-react";

const items = [
  { href: "/", label: "Home", Icon: Home, match: (p: string) => p === "/" },
  {
    href: "/quran",
    label: "Quran",
    Icon: BookOpen,
    match: (p: string) => p.startsWith("/quran"),
  },
  {
    href: "/tafseer",
    label: "Tafseer",
    Icon: BookText,
    match: (p: string) => p.startsWith("/tafseer"),
  },
  {
    href: "/hadith",
    label: "Hadith",
    Icon: ScrollText,
    match: (p: string) => p.startsWith("/hadith"),
  },
  {
    href: "/more",
    label: "More",
    Icon: LayoutGrid,
    match: (p: string) =>
      ["/more", "/duas", "/azkaar", "/names", "/settings", "/bookmarks", "/search"].some(
        (x) => p.startsWith(x),
      ),
  },
];

export default function BottomNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Primary navigation"
      className="fixed inset-x-0 bottom-0 z-50"
      style={{
        background: "color-mix(in srgb, var(--surface) 82%, transparent)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        borderTop: "1px solid var(--line)",
      }}
    >
      <div className="mx-auto grid max-w-2xl grid-cols-5 px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {items.map(({ href, label, Icon, match }) => {
          const active = match(pathname);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className="press flex flex-col items-center gap-1 rounded-2xl py-1.5"
            >
              <span
                className="flex h-8 w-14 items-center justify-center rounded-full transition-colors"
                style={{
                  background: active ? "var(--accent-soft)" : "transparent",
                  color: active ? "var(--accent-ink)" : "var(--muted)",
                }}
              >
                <Icon size={21} strokeWidth={active ? 2.2 : 1.8} aria-hidden />
              </span>
              <span
                className="text-[11px] font-semibold tracking-wide"
                style={{ color: active ? "var(--accent-ink)" : "var(--muted)" }}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
