"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { Check, Plus, RotateCcw } from "lucide-react";

const PRESETS = [33, 100, 500, 1000];

export default function TasbeehCounter() {
  const [target, setTarget] = useState(33);
  const [value, setValue] = useState(0);
  const [tick, setTick] = useState(0);
  const done = value >= target;

  const inc = useCallback(() => {
    setValue((v) => v + 1);
    setTick((t) => t + 1);
  }, []);

  const reset = useCallback(() => setValue(0), []);

  const progress = Math.min(1, value / target);
  const R = 120;
  const CIRC = 2 * Math.PI * R;

  return (
    <div className="card flex flex-col items-center gap-6 px-6 py-8">
      <div className="seg" role="group" aria-label="Count target">
        {PRESETS.map((p) => (
          <button
            key={p}
            type="button"
            data-active={target === p}
            onClick={() => {
              setTarget(p);
              setValue(0);
            }}
          >
            {p}
          </button>
        ))}
      </div>

      <div
        className="relative"
        role="progressbar"
        aria-valuenow={done ? target : value % target}
        aria-valuemin={0}
        aria-valuemax={target}
        aria-label={`Tasbeeh count ${value} of target ${target}`}
      >
        <svg width="270" height="270" viewBox="0 0 270 270" className="-rotate-90">
          <circle cx="135" cy="135" r={R} fill="none" stroke="var(--line)" strokeWidth="7" />
          <circle
            cx="135"
            cy="135"
            r={R}
            fill="none"
            stroke="var(--accent)"
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={CIRC}
            strokeDashoffset={CIRC * (1 - progress)}
            style={{ transition: "stroke-dashoffset 0.25s cubic-bezier(0.2,0.8,0.3,1)" }}
          />
        </svg>
        <button
          type="button"
          onClick={inc}
          key={tick}
          aria-label="Tap to count"
          className="press tap-tick absolute inset-[22px] flex flex-col items-center justify-center rounded-full border"
          style={{
            background: done ? "var(--accent-soft)" : "var(--surface-2)",
            borderColor: done ? "var(--accent-line)" : "var(--line)",
          }}
        >
          <span className="font-display text-6xl font-semibold tabular-nums" style={{ color: done ? "var(--accent-ink)" : "var(--ink)" }}>
            {value}
          </span>
          <span className="mt-1 text-[12px] font-semibold tracking-wide uppercase" style={{ color: "var(--muted)" }}>
            {done ? "Target reached — tap to continue" : `of ${target}`}
          </span>
        </button>
      </div>

      <button
        type="button"
        onClick={reset}
        className="press flex items-center gap-2 rounded-full border px-5 py-2.5 text-[13px] font-semibold"
        style={{ borderColor: "var(--line)", color: "var(--ink-soft)" }}
      >
        <RotateCcw size={15} aria-hidden />
        Reset counter
      </button>
    </div>
  );
}

/** Per-item repetition tracker used on Azkaar cards. */
export function DhikrCounter({ repeat }: { repeat: number }) {
  const [n, setN] = useState(0);
  const [tick, setTick] = useState(0);
  const complete = n >= repeat;

  return (
    <button
      key={tick}
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (complete) {
          setN(0);
        } else {
          setN((x) => x + 1);
        }
        setTick((t) => t + 1);
      }}
      aria-label={
        complete
          ? `Completed ${repeat} repetitions — tap to restart`
          : `Tap to count, ${n} of ${repeat}`
      }
      className="press tap-tick flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12.5px] font-bold tabular-nums"
      style={{
        borderColor: complete ? "var(--accent-line)" : "var(--line)",
        background: complete ? "var(--accent-soft)" : "var(--surface)",
        color: complete ? "var(--accent-ink)" : "var(--ink-soft)",
      }}
    >
      {complete ? <Check size={13} aria-hidden /> : <Plus size={13} aria-hidden />}
      {complete ? `${repeat}/${repeat} · restart` : `${n}/${repeat}`}
    </button>
  );
}
