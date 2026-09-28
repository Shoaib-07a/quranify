import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

/* ------------------------- Page header ------------------------- */

export function PageHeader({
  title,
  subtitle,
  arabic,
  back,
  actions,
}: {
  title: string;
  subtitle?: string;
  arabic?: string;
  back?: { href: string; label: string };
  actions?: ReactNode;
}) {
  return (
    <header
      className="sticky top-0 z-40 -mx-5 mb-2 px-5 pt-3 pb-3"
      style={{
        background: "color-mix(in srgb, var(--bg) 78%, transparent)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: "1px solid var(--line)",
      }}
    >
      <div className="flex items-center gap-3">
        {back && (
          <Link
            href={back.href}
            aria-label={back.label}
            className="press card-flat flex h-10 w-10 shrink-0 items-center justify-center"
            style={{ color: "var(--ink-soft)" }}
          >
            <ChevronLeft size={20} aria-hidden />
          </Link>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="font-display truncate text-xl font-semibold tracking-tight">{title}</h1>
          {subtitle && (
            <p className="truncate text-[13px]" style={{ color: "var(--muted)" }}>
              {subtitle}
            </p>
          )}
        </div>
        {arabic && (
          <span className="font-arabic shrink-0 text-2xl" dir="rtl" lang="ar" style={{ color: "var(--accent-ink)" }}>
            {arabic}
          </span>
        )}
        {actions}
      </div>
    </header>
  );
}

/* ------------------------- Small pieces ------------------------- */

export function Chip({ children, tone = "muted" }: { children: ReactNode; tone?: "muted" | "accent" | "gold" }) {
  const styles =
    tone === "accent"
      ? { background: "var(--accent-soft)", color: "var(--accent-ink)", borderColor: "var(--accent-line)" }
      : tone === "gold"
        ? { background: "var(--gold-soft)", color: "var(--gold)", borderColor: "var(--line-strong)" }
        : { background: "var(--surface-2)", color: "var(--muted)", borderColor: "var(--line)" };
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wide"
      style={styles}
    >
      {children}
    </span>
  );
}

export function SourceTag({ children }: { children: ReactNode }) {
  return (
    <p className="text-[11px] leading-relaxed" style={{ color: "var(--muted)" }}>
      <span className="font-semibold" style={{ color: "var(--gold)" }}>
        Source ·{" "}
      </span>
      {children}
    </p>
  );
}

export function EmptyState({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="card-flat fade-in flex flex-col items-center gap-1.5 px-6 py-14 text-center">
      <div
        className="mb-1 flex h-12 w-12 items-center justify-center rounded-full"
        style={{ background: "var(--accent-soft)", color: "var(--accent-ink)" }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
      </div>
      <p className="text-sm font-semibold">{title}</p>
      {subtitle && (
        <p className="max-w-xs text-[13px]" style={{ color: "var(--muted)" }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

export function SectionLabel({ children, trailing }: { children: ReactNode; trailing?: ReactNode }) {
  return (
    <div className="mb-3 flex items-end justify-between px-1">
      <p
        className="text-[11px] font-bold tracking-[0.14em] uppercase"
        style={{ color: "var(--muted)" }}
      >
        {children}
      </p>
      {trailing}
    </div>
  );
}

export function LangText({ lang, children, className = "" }: { lang: "en" | "ur" | "hi"; children: ReactNode; className?: string }) {
  if (lang === "ur")
    return (
      <div dir="rtl" lang="ur" className={`font-urdu text-[16.5px] ${className}`}>
        {children}
      </div>
    );
  if (lang === "hi")
    return (
      <div lang="hi" className={`font-hindi text-[16.5px] leading-[2] ${className}`}>
        {children}
      </div>
    );
  return <div className={`text-[15px] leading-relaxed ${className}`}>{children}</div>;
}
