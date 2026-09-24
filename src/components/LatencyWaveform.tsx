"use client";

import { useEffect, useState } from "react";

export default function LatencyWaveform() {
  const [latency, setLatency] = useState(142);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate micro-variations around 138 - 146ms
      const delta = Math.floor(Math.random() * 9) - 4;
      setLatency(142 + delta);
      setPulse((prev) => !prev);
    }, 2400);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-800/90 bg-[#0d0f17]/90 p-5 shadow-2xl backdrop-blur-xl">
      {/* Background ambient glow */}
      <div className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-indigo-500/10 blur-3xl" />

      {/* Header */}
      <div className="mb-4 flex items-center justify-between border-b border-slate-800/60 pb-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Live Heap Latency
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded bg-slate-800/80 px-2 py-0.5 font-mono text-[10px] text-slate-400 border border-slate-700/60">
            SAMPLING: 60Hz
          </span>
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div className="relative h-36 w-full">
        {/* Subtle grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between opacity-15">
          <div className="border-b border-dashed border-slate-500" />
          <div className="border-b border-dashed border-slate-500" />
          <div className="border-b border-dashed border-slate-500" />
        </div>

        <svg
          viewBox="0 0 500 130"
          className="h-full w-full overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="latencyGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#818cf8" stopOpacity="0.45" />
              <stop offset="60%" stopColor="#6366f1" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="strokeGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="50%" stopColor="#818cf8" />
              <stop offset="85%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#34d399" />
            </linearGradient>
          </defs>

          {/* Area fill */}
          <path
            d="M 0 95 C 40 92, 80 105, 120 75 C 160 45, 200 95, 240 60 C 280 25, 320 80, 360 40 C 400 10, 440 60, 500 20 L 500 130 L 0 130 Z"
            fill="url(#latencyGradient)"
          />

          {/* Stroke path */}
          <path
            d="M 0 95 C 40 92, 80 105, 120 75 C 160 45, 200 95, 240 60 C 280 25, 320 80, 360 40 C 400 10, 440 60, 500 20"
            fill="none"
            stroke="url(#strokeGradient)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Active pulse marker */}
          <circle
            cx="440"
            cy="45"
            r={pulse ? "5" : "4"}
            className="fill-emerald-400 transition-all duration-300"
          />
          <circle
            cx="440"
            cy="45"
            r="9"
            className="fill-none stroke-emerald-400/50 animate-ping"
          />
        </svg>

        {/* Live pointer indicator */}
        <div className="absolute right-12 top-6 rounded-md border border-slate-700/80 bg-slate-900/90 px-2 py-0.5 font-mono text-[10px] text-emerald-300 shadow">
          {latency}ms
        </div>
      </div>

      {/* Metrics footer bar */}
      <div className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-800/60 pt-3 text-center">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-slate-500">Avg Time</div>
          <div className="font-mono text-sm font-semibold text-slate-200">{latency}ms</div>
        </div>
        <div className="border-x border-slate-800/80">
          <div className="text-[10px] uppercase tracking-wider text-slate-500">Heap Spike</div>
          <div className="font-mono text-sm font-semibold text-emerald-400">18 MB</div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wider text-slate-500">Leak Check</div>
          <div className="font-mono text-sm font-semibold text-cyan-400">0.00%</div>
        </div>
      </div>
    </div>
  );
}
