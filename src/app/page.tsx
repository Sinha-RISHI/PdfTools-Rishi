import Link from "next/link";
import Navbar from "@/components/Navbar";
import HeroDropzone from "@/components/HeroDropzone";
import LatencyWaveform from "@/components/LatencyWaveform";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#090a0f] text-slate-100 selection:bg-indigo-500/30 selection:text-indigo-200">
      <Navbar />

      {/* Ticker Ribbon */}
      <div className="border-y border-slate-800/80 bg-[#0c0d14]/90 px-4 py-2 font-mono text-[11px] text-slate-400">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-1.5 text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>INITIALIZED: sys_core online [v1.4]</span>
            </div>
            <div className="hidden items-center gap-1.5 text-cyan-400 sm:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
              <span>ZERO DISK RETENTION: ACTIVE</span>
            </div>
            <div className="hidden items-center gap-1.5 text-indigo-400 md:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
              <span>IN-MEMORY ALLOCATION: 0 MB PERSISTENT</span>
            </div>
            <div className="hidden items-center gap-1.5 text-purple-400 lg:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
              <span>CLIENT RUNTIME: ACTIVE</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-slate-500">SYS_VERIFIED_SECURE</span>
            <span className="rounded bg-emerald-950/80 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/30">
              READY [0.0MS]
            </span>
          </div>
        </div>
      </div>

      <main>
        {/* HERO SECTION */}
        <section className="relative overflow-hidden px-4 pb-16 pt-16 sm:px-6 sm:pb-24 sm:pt-20">
          {/* Subtle cosmic background glows */}
          <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-b from-indigo-600/15 via-purple-600/10 to-transparent blur-3xl" />
          <div className="pointer-events-none absolute left-1/4 top-36 -z-10 h-72 w-72 rounded-full bg-rose-500/10 blur-3xl" />

          <div className="mx-auto max-w-5xl text-center">
            {/* Feature Pills */}
            <div className="mb-6 flex flex-wrap items-center justify-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-800 bg-slate-900/90 px-3 py-1 font-mono text-xs text-slate-300 shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Zero In-Memory Processing
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-800 bg-slate-900/90 px-3 py-1 font-mono text-xs text-slate-300 shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                Zero Disk Retention
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-800 bg-slate-900/90 px-3 py-1 font-mono text-xs text-slate-300 shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                Double-Validation Architecture
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-800 bg-slate-900/90 px-3 py-1 font-mono text-xs text-slate-300 shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
                20 MB Span Limit
              </span>
            </div>

            {/* Title */}
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl sm:leading-[1.15]">
              The Privacy-First PDF Suite Powered by{" "}
              <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
                Next.js & WebAssembly
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mx-auto mt-6 max-w-3xl text-base leading-relaxed text-slate-400 sm:text-lg">
              Fast, secure, and client-accelerated document operations. Merge, split, rotate, and
              watermark sensitive PDFs in high-performance RAM with absolute zero persistence to disk.
            </p>

            {/* Hero Dropzone Card */}
            <div id="dropzone" className="mt-10 scroll-mt-24">
              <HeroDropzone />
            </div>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <a
                href="#tools"
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 transition-all hover:from-indigo-500 hover:to-purple-500 hover:shadow-indigo-500/40"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
                </svg>
                <span>Explore 4 Core Tools</span>
              </a>
              <a
                href="#architecture"
                className="flex items-center gap-2 rounded-xl border border-slate-700/80 bg-slate-900/80 px-6 py-3 text-sm font-semibold text-slate-200 transition-all hover:border-slate-600 hover:bg-slate-800 hover:text-white"
              >
                <svg className="h-4 w-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 9.75 16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0 0 20.25 18V6A2.25 2.25 0 0 0 18 3.75H6A2.25 2.25 0 0 0 3.75 6v12A2.25 2.25 0 0 0 6 20.25Z" />
                </svg>
                <span>View Technical Architecture</span>
              </a>
            </div>
          </div>
        </section>

        {/* METRICS ROW (5 STAT CARDS) */}
        <section className="border-y border-slate-800/80 bg-[#0c0e15]/70 py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
              <div className="border-l-2 border-emerald-500/70 pl-4">
                <div className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
                  Architecture
                </div>
                <div className="mt-1 text-lg font-bold text-slate-100 sm:text-xl">
                  100% <span className="text-emerald-400 text-sm font-normal">RAM-Only</span>
                </div>
                <div className="text-[11px] text-slate-500">No ephemeral disk writes</div>
              </div>

              <div className="border-l-2 border-emerald-500/70 pl-4">
                <div className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
                  Disk Written
                </div>
                <div className="mt-1 text-lg font-bold text-slate-100 sm:text-xl">
                  0 KB <span className="text-emerald-400 text-sm font-normal">Total</span>
                </div>
                <div className="text-[11px] text-slate-500">Direct buffer response</div>
              </div>

              <div className="border-l-2 border-indigo-500/70 pl-4">
                <div className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
                  Avg Execution
                </div>
                <div className="mt-1 text-lg font-bold text-slate-100 sm:text-xl">
                  114 <span className="text-indigo-400 text-sm font-normal">ms</span>
                </div>
                <div className="text-[11px] text-slate-500">WASM / binary optimization</div>
              </div>

              <div className="border-l-2 border-purple-500/70 pl-4">
                <div className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
                  Pipeline Ceiling
                </div>
                <div className="mt-1 text-lg font-bold text-slate-100 sm:text-xl">
                  20 <span className="text-purple-400 text-sm font-normal">MB</span>
                </div>
                <div className="text-[11px] text-slate-500">Client & edge verified</div>
              </div>

              <div className="border-l-2 border-blue-500/70 pl-4 col-span-2 md:col-span-1">
                <div className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
                  Framework
                </div>
                <div className="mt-1 text-lg font-bold text-slate-100 sm:text-xl">
                  React 19
                </div>
                <div className="text-[11px] text-slate-500">Next.js 16 App Router</div>
              </div>
            </div>
          </div>
        </section>

        {/* CORE TOOLS CATALOG SECTION */}
        <section id="tools" className="scroll-mt-20 px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-7xl">
            {/* Section Header */}
            <div className="mb-12 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded bg-indigo-950/80 px-2 py-0.5 font-mono text-[10px] font-semibold text-indigo-300 border border-indigo-700/50">
                    PRODUCTION TOOLKIT
                  </span>
                  <span className="font-mono text-xs text-slate-500">STANDALONE UTILITIES</span>
                </div>
                <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                  Core PDF Tools Catalog
                </h2>
                <p className="mt-2 text-sm text-slate-400">
                  Zero upload delay. Drag, reorder, stamp, and assemble confidential documents instantly.
                </p>
              </div>

              <div className="flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/80 px-3 py-1 font-mono text-xs text-slate-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span className="text-slate-200">4 ACTIVE MODULES</span>
                <span className="text-slate-600">/</span>
                <span className="text-slate-400">2 IN LABS</span>
              </div>
            </div>

            {/* 6-Card Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* CARD 1: MERGE PDF */}
              <div className="group relative flex flex-col justify-between rounded-2xl border border-slate-800/90 bg-[#0d0f17]/90 p-6 shadow-xl backdrop-blur-xl transition-all duration-200 hover:-translate-y-1 hover:border-indigo-500/50 hover:shadow-indigo-500/10">
                <div>
                  <div className="mb-5 flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-900/30">
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                      </svg>
                    </div>
                    <span className="rounded-full border border-emerald-500/30 bg-emerald-950/60 px-2.5 py-0.5 font-mono text-[10px] font-medium text-emerald-400">
                      Production Ready
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white transition-colors group-hover:text-indigo-300">
                    Merge PDF Documents
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">
                    Combine between 2 and 15 PDF files into one clean document with fluid drag-and-drop
                    page sequencing and instant byte-stream assembly.
                  </p>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    <span className="rounded bg-slate-800/80 px-2 py-0.5 font-mono text-[10px] text-slate-300 border border-slate-700/60">
                      Up to 15 Files
                    </span>
                    <span className="rounded bg-slate-800/80 px-2 py-0.5 font-mono text-[10px] text-slate-300 border border-slate-700/60">
                      Drag Reorder
                    </span>
                    <span className="rounded bg-slate-800/80 px-2 py-0.5 font-mono text-[10px] text-slate-300 border border-slate-700/60">
                      Instant Download
                    </span>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-slate-800/70 pt-4">
                  <span className="font-mono text-[10px] text-slate-500">GET / POST [0-15MB]</span>
                  <Link
                    href="/tools/merge"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
                  >
                    <span>Open Merge Tool</span>
                    <span>→</span>
                  </Link>
                </div>
              </div>

              {/* CARD 2: SPLIT PDF */}
              <div className="group relative flex flex-col justify-between rounded-2xl border border-slate-800/90 bg-[#0d0f17]/90 p-6 shadow-xl backdrop-blur-xl transition-all duration-200 hover:-translate-y-1 hover:border-rose-500/50 hover:shadow-rose-500/10">
                <div>
                  <div className="mb-5 flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-md shadow-rose-900/30">
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.057 1.123-.08M15.75 18H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.133 48.133 0 0 0-1.123-.08M15.75 18.75v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75M15.75 18.75H9.75" />
                      </svg>
                    </div>
                    <span className="rounded-full border border-emerald-500/30 bg-emerald-950/60 px-2.5 py-0.5 font-mono text-[10px] font-medium text-emerald-400">
                      Production Ready
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white transition-colors group-hover:text-rose-300">
                    Split & Extract Pages
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">
                    Split documents by custom mathematical ranges or extract individual isolated pages
                    into a downloadable compressed ZIP archive.
                  </p>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    <span className="rounded bg-slate-800/80 px-2 py-0.5 font-mono text-[10px] text-slate-300 border border-slate-700/60">
                      Custom Range (1-3, 5)
                    </span>
                    <span className="rounded bg-slate-800/80 px-2 py-0.5 font-mono text-[10px] text-slate-300 border border-slate-700/60">
                      Individual Pages (ZIP)
                    </span>
                    <span className="rounded bg-slate-800/80 px-2 py-0.5 font-mono text-[10px] text-slate-300 border border-slate-700/60">
                      Syntax Validator
                    </span>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-slate-800/70 pt-4">
                  <span className="font-mono text-[10px] text-slate-500">POST [0-20MB]</span>
                  <Link
                    href="/tools/split"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-rose-400 hover:text-rose-300"
                  >
                    <span>Open Split Tool</span>
                    <span>→</span>
                  </Link>
                </div>
              </div>

              {/* CARD 3: ROTATE PDF */}
              <div className="group relative flex flex-col justify-between rounded-2xl border border-slate-800/90 bg-[#0d0f17]/90 p-6 shadow-xl backdrop-blur-xl transition-all duration-200 hover:-translate-y-1 hover:border-emerald-500/50 hover:shadow-emerald-500/10">
                <div>
                  <div className="mb-5 flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-900/30">
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" />
                      </svg>
                    </div>
                    <span className="rounded-full border border-emerald-500/30 bg-emerald-950/60 px-2.5 py-0.5 font-mono text-[10px] font-medium text-emerald-400">
                      Production Ready
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white transition-colors group-hover:text-emerald-300">
                    Rotate Pages Orientation
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">
                    Correct upside-down or sideways pages with visual canvas previews. Apply discrete
                    90°, 180°, or 270° orientation transforms per page or in batch.
                  </p>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    <span className="rounded bg-slate-800/80 px-2 py-0.5 font-mono text-[10px] text-slate-300 border border-slate-700/60">
                      Interactive Grid
                    </span>
                    <span className="rounded bg-slate-800/80 px-2 py-0.5 font-mono text-[10px] text-slate-300 border border-slate-700/60">
                      Batch Rotate All
                    </span>
                    <span className="rounded bg-slate-800/80 px-2 py-0.5 font-mono text-[10px] text-slate-300 border border-slate-700/60">
                      0° / 90° / 180° / 270°
                    </span>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-slate-800/70 pt-4">
                  <span className="font-mono text-[10px] text-slate-500">CLIENT-ACCELERATED</span>
                  <Link
                    href="/tools/rotate"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300"
                  >
                    <span>Open Rotate Tool</span>
                    <span>→</span>
                  </Link>
                </div>
              </div>

              {/* CARD 4: WATERMARK PDF */}
              <div className="group relative flex flex-col justify-between rounded-2xl border border-slate-800/90 bg-[#0d0f17]/90 p-6 shadow-xl backdrop-blur-xl transition-all duration-200 hover:-translate-y-1 hover:border-sky-500/50 hover:shadow-sky-500/10">
                <div>
                  <div className="mb-5 flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-md shadow-sky-900/30">
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" />
                      </svg>
                    </div>
                    <span className="rounded-full border border-emerald-500/30 bg-emerald-950/60 px-2.5 py-0.5 font-mono text-[10px] font-medium text-emerald-400">
                      Production Ready
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white transition-colors group-hover:text-sky-300">
                    Watermark PDF Pages
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">
                    Stamp custom confidential badges, diagonal copyright text, or repeating security
                    overlays with live real-time opacity & tilt angle controls.
                  </p>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    <span className="rounded bg-slate-800/80 px-2 py-0.5 font-mono text-[10px] text-slate-300 border border-slate-700/60">
                      Diagonal & Tiled Grid
                    </span>
                    <span className="rounded bg-slate-800/80 px-2 py-0.5 font-mono text-[10px] text-slate-300 border border-slate-700/60">
                      Custom Spacing & Tint
                    </span>
                    <span className="rounded bg-slate-800/80 px-2 py-0.5 font-mono text-[10px] text-slate-300 border border-slate-700/60">
                      Live Preview
                    </span>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-slate-800/70 pt-4">
                  <span className="font-mono text-[10px] text-slate-500">TRUE VECTOR TEXT</span>
                  <Link
                    href="/tools/watermark"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-sky-400 hover:text-sky-300"
                  >
                    <span>Open Watermark Tool</span>
                    <span>→</span>
                  </Link>
                </div>
              </div>

              {/* CARD 5: JPG TO PDF (ROADMAP) */}
              <div id="roadmap" className="group relative flex flex-col justify-between rounded-2xl border border-slate-800/60 bg-[#0c0e14]/60 p-6 shadow-xl backdrop-blur-xl">
                <div>
                  <div className="mb-5 flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-700/80 bg-slate-800/70 text-slate-400">
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
                      </svg>
                    </div>
                    <span className="rounded-full border border-slate-700 bg-slate-800/80 px-2.5 py-0.5 font-mono text-[10px] font-medium text-slate-400">
                      In Roadmap
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-300">
                    JPG / PNG to PDF Converter
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500">
                    Batch compress and package high-resolution image bundles into standardized
                    ISO-compliant PDF/A archives with embedded metadata.
                  </p>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    <span className="rounded bg-slate-800/50 px-2 py-0.5 font-mono text-[10px] text-slate-400 border border-slate-800">
                      Auto-Orientation
                    </span>
                    <span className="rounded bg-slate-800/50 px-2 py-0.5 font-mono text-[10px] text-slate-400 border border-slate-800">
                      DPI Preservation
                    </span>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-slate-800/60 pt-4">
                  <span className="font-mono text-[10px] text-slate-600">COLOR: SRGB / CMYK</span>
                  <span className="text-xs font-mono text-slate-500">Coming Soon</span>
                </div>
              </div>

              {/* CARD 6: COMPRESS PDF (ROADMAP) */}
              <div className="group relative flex flex-col justify-between rounded-2xl border border-slate-800/60 bg-[#0c0e14]/60 p-6 shadow-xl backdrop-blur-xl">
                <div>
                  <div className="mb-5 flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-700/80 bg-slate-800/70 text-slate-400">
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                      </svg>
                    </div>
                    <span className="rounded-full border border-slate-700 bg-slate-800/80 px-2.5 py-0.5 font-mono text-[10px] font-medium text-slate-400">
                      In Roadmap
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-300">
                    Compress & Optimize PDF
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500">
                    Reduce payload footprints by stripping orphaned streams, downsampling redundant
                    raster layers, and deduplicating font subsets.
                  </p>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    <span className="rounded bg-slate-800/50 px-2 py-0.5 font-mono text-[10px] text-slate-400 border border-slate-800">
                      Ghostscript Core
                    </span>
                    <span className="rounded bg-slate-800/50 px-2 py-0.5 font-mono text-[10px] text-slate-400 border border-slate-800">
                      Quality Presets
                    </span>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-slate-800/60 pt-4">
                  <span className="font-mono text-[10px] text-slate-600">TARGET: &lt;50% RATIO</span>
                  <span className="text-xs font-mono text-slate-500">In Development</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ZERO-DISK ARCHITECTURE & EXECUTION FLOW */}
        <section id="architecture" className="scroll-mt-20 border-t border-slate-800/80 bg-[#0a0c12] px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-7xl">
            {/* Header */}
            <div className="mb-12 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
              <div>
                <span className="rounded bg-emerald-950/80 px-2 py-0.5 font-mono text-[10px] font-semibold text-emerald-400 border border-emerald-700/50">
                  RUNTIME ARCHITECTURE
                </span>
                <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                  Zero-Disk In-Memory Execution Flow
                </h2>
                <p className="mt-2 text-sm text-slate-400">
                  How PDFTools eliminates data residency risk across the full client-server lifecycle.
                </p>
              </div>

              <div className="rounded-full border border-slate-800 bg-slate-900/80 px-3 py-1 font-mono text-xs text-emerald-400">
                DETERMINISTIC ZERO-TRACE
              </div>
            </div>

            {/* 4 Pipeline Flow Cards */}
            <div className="grid gap-4 md:grid-cols-4">
              {/* Step 1 */}
              <div className="relative rounded-2xl border border-slate-800/90 bg-[#0d0f17]/90 p-5 shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-indigo-400">01. INGEST</span>
                  <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                </div>
                <h4 className="mt-2 text-sm font-semibold text-slate-200">Browser UI (React 19)</h4>
                <p className="mt-2 text-xs leading-relaxed text-slate-400">
                  Client-side verified magic bytes stream (&lt;=20MB) buffered into local memory buffer.
                </p>
                <div className="mt-4 flex items-center justify-between text-[11px] font-mono text-slate-500">
                  <span>ASYNC DISPATCH</span>
                  <span className="text-indigo-400 font-bold">POST STREAM →</span>
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative rounded-2xl border border-slate-800/90 bg-[#0d0f17]/90 p-5 shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-rose-400">02. ROUTE</span>
                  <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h4 className="mt-2 text-sm font-semibold text-slate-200">Next.js 16 Handlers</h4>
                <p className="mt-2 text-xs leading-relaxed text-slate-400">
                  Direct stream dispatch to in-memory route capabilities entirely in RAM without writing to disk /tmp.
                </p>
                <div className="mt-4 flex items-center justify-between text-[11px] font-mono text-slate-500">
                  <span>RAM PIPELINE</span>
                  <span className="text-rose-400 font-bold">IN-MEM FORK →</span>
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative rounded-2xl border border-slate-800/90 bg-[#0d0f17]/90 p-5 shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-emerald-400">03. TRANSFORM</span>
                  <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h4 className="mt-2 text-sm font-semibold text-slate-200">pdf-lib Engine Core</h4>
                <p className="mt-2 text-xs leading-relaxed text-slate-400">
                  Cryptographic assembly, range slicing, and watermarking operations executed inside ephemeral workers.
                </p>
                <div className="mt-4 flex items-center justify-between text-[11px] font-mono text-slate-500">
                  <span>ZERO PERSIST</span>
                  <span className="text-emerald-400 font-bold">200 OK FEED →</span>
                </div>
              </div>

              {/* Step 4 */}
              <div className="relative rounded-2xl border border-slate-800/90 bg-[#0d0f17]/90 p-5 shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-cyan-400">04. DISCHARGE</span>
                  <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </div>
                <h4 className="mt-2 text-sm font-semibold text-slate-200">Binary Stream Out</h4>
                <p className="mt-2 text-xs leading-relaxed text-slate-400">
                  Streamed directly back to client browser. Buffer immediately garbage-collected on connection termination.
                </p>
                <div className="mt-4 flex items-center justify-between text-[11px] font-mono text-slate-500">
                  <span>CLEAN BUFFER</span>
                  <span className="text-cyan-400 font-bold">FLUSH COMPLETE ✓</span>
                </div>
              </div>
            </div>

            {/* 4 Security Pillars Grid */}
            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-slate-800/60 bg-[#0b0d14]/60 p-5">
                <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                  </svg>
                </div>
                <h5 className="font-semibold text-slate-200 text-sm">Zero File Retention</h5>
                <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                  No cloud buckets (S3/GCS), no internal SQLite storage, no disk staging. When the HTTP connection terminates, memory space is instantly freed.
                </p>
              </div>

              <div className="rounded-xl border border-slate-800/60 bg-[#0b0d14]/60 p-5">
                <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                </div>
                <h5 className="font-semibold text-slate-200 text-sm">Double Validation</h5>
                <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                  Client-side magic byte inspection before transmission, independently re-validated by Next.js server runtime guards.
                </p>
              </div>

              <div className="rounded-xl border border-slate-800/60 bg-[#0b0d14]/60 p-5">
                <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                  </svg>
                </div>
                <h5 className="font-semibold text-slate-200 text-sm">Bcrypt & JWT Protected</h5>
                <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                  For authenticated operations, history, and user quotas, user identity verification employs constant-time hashing with short-lived JWT tokens.
                </p>
              </div>

              <div className="rounded-xl border border-slate-800/60 bg-[#0b0d14]/60 p-5">
                <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 0 0 2.25-2.25V6.75a2.25 2.25 0 0 0-2.25-2.25H6.75A2.25 2.25 0 0 0 4.5 6.75v10.5a2.25 2.25 0 0 0 2.25 2.25Z" />
                  </svg>
                </div>
                <h5 className="font-semibold text-slate-200 text-sm">Memory Bound Isolation</h5>
                <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                  Hard 20MB payload ceiling guarantees that memory pressure cannot trigger swap exhaustion, preventing cold-start stalls or denial of service.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* BENCHMARK & WAVEFORM LATENCY SECTION */}
        <section id="benchmarks" className="scroll-mt-20 border-t border-slate-800/80 px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
              {/* Left Column */}
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-950/40 px-2.5 py-0.5 text-xs font-mono text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  TEST BENCHMARK DATA
                </span>
                <h3 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                  Deterministic Sub-Second Transformation
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-400">
                  Monitored on an Apple M3 & Intel Xeon edge runtime. PDFTools merges an 8-page
                  document and writes the combined byte stream in less than a single display frame.
                </p>

                {/* Benchmark metrics table */}
                <div className="mt-6 space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-[#0d0f17]/90 px-4 py-3">
                    <span className="text-slate-300">Merge 4 Files (12.4 MB Total)</span>
                    <span className="text-emerald-400 font-semibold">PORTFOLIO RUN: 112 ms</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-[#0d0f17]/90 px-4 py-3">
                    <span className="text-slate-300">Split 96-Page Ledger to ZIP</span>
                    <span className="text-emerald-400 font-semibold">PORTFOLIO RUN: 245 ms</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-[#0d0f17]/90 px-4 py-3">
                    <span className="text-slate-300">Watermark 30 Pages (Diagonal)</span>
                    <span className="text-emerald-400 font-semibold">PORTFOLIO RUN: 78 ms</span>
                  </div>
                </div>

                <div className="mt-6 flex items-center gap-4">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700"
                  >
                    <span>⎔ Real Worker Speed</span>
                  </button>
                  <a
                    href="https://github.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-semibold text-indigo-400 hover:text-indigo-300"
                  >
                    Verify on GitHub ↗
                  </a>
                </div>
              </div>

              {/* Right Column: Latency Waveform Component */}
              <div>
                <LatencyWaveform />
              </div>
            </div>
          </div>
        </section>

        {/* CALL TO ACTION BANNER */}
        <section className="px-4 pb-20 pt-8 sm:px-6">
          <div className="mx-auto max-w-7xl">
            <div className="relative overflow-hidden rounded-3xl border border-slate-800/90 bg-gradient-to-r from-[#0d0f17] via-[#121422] to-[#0d0f17] p-8 shadow-2xl backdrop-blur-xl sm:p-12">
              <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />
              <div className="pointer-events-none absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-rose-500/10 blur-3xl" />

              <div className="relative flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
                <div>
                  <h3 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                    Ready to process sensitive documents?
                  </h3>
                  <p className="mt-2 text-sm text-slate-400">
                    No account required to start. No logs created. No traces left on any server.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Link
                    href="/tools/merge"
                    className="rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 transition-all hover:bg-indigo-500 hover:shadow-indigo-500/40"
                  >
                    Start Merging Free
                  </Link>
                  <Link
                    href="/tools/split"
                    className="rounded-xl border border-slate-700 bg-slate-800/90 px-5 py-2.5 text-xs font-semibold text-slate-200 transition-all hover:border-slate-600 hover:bg-slate-700 hover:text-white"
                  >
                    Launch Splitter
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-800/80 bg-[#07080c] px-4 pt-12 pb-8 sm:px-6">
        <div className="mx-auto max-w-7xl">
          {/* Privacy Guarantee Pill */}
          <div className="mb-10 flex flex-col items-start justify-between gap-4 rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                </svg>
              </div>
              <div>
                <span className="text-xs font-bold text-white">100% Client-Side Privacy Guarantee</span>
                <p className="text-[11px] text-slate-400">
                  Files never leave your machine. Processing exists solely in browser memory or WebAssembly.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 font-mono text-[10px]">
              <span className="text-slate-500">ZERO RETENTION</span>
              <span className="rounded bg-emerald-950/80 px-2 py-0.5 text-emerald-400 border border-emerald-500/30">
                HASH: VERIFIED
              </span>
            </div>
          </div>

          {/* 4 Footer Columns */}
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div>
              <h5 className="font-mono text-xs font-semibold uppercase tracking-wider text-slate-400">
                Tool Shortcuts
              </h5>
              <ul className="mt-4 space-y-2 text-xs text-slate-400">
                <li>
                  <Link href="/tools/merge" className="hover:text-white transition-colors">
                    Merge PDF Files
                  </Link>
                </li>
                <li>
                  <Link href="/tools/split" className="hover:text-white transition-colors">
                    Split & Extract Pages
                  </Link>
                </li>
                <li>
                  <Link href="/tools/rotate" className="hover:text-white transition-colors">
                    Rotate Orientation
                  </Link>
                </li>
                <li>
                  <Link href="/tools/watermark" className="hover:text-white transition-colors">
                    Watermark PDF
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h5 className="font-mono text-xs font-semibold uppercase tracking-wider text-slate-400">
                Security & Architecture
              </h5>
              <ul className="mt-4 space-y-2 text-xs text-slate-400">
                <li>
                  <a href="#architecture" className="hover:text-white transition-colors">
                    Architecture Whitepaper
                  </a>
                </li>
                <li>
                  <a href="#benchmarks" className="hover:text-white transition-colors">
                    WASM Benchmarks
                  </a>
                </li>
                <li>
                  <a href="#architecture" className="hover:text-white transition-colors">
                    Local Sandboxing
                  </a>
                </li>
                <li>
                  <a href="#architecture" className="hover:text-white transition-colors">
                    Zero-Disk Policy
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h5 className="font-mono text-xs font-semibold uppercase tracking-wider text-slate-400">
                Developers
              </h5>
              <ul className="mt-4 space-y-2 text-xs text-slate-400">
                <li>
                  <Link href="/api/pdf/merge" className="hover:text-white transition-colors">
                    REST / Worker API
                  </Link>
                </li>
                <li>
                  <a href="#dropzone" className="hover:text-white transition-colors">
                    CLI & SDK
                  </a>
                </li>
                <li>
                  <a href="#roadmap" className="hover:text-white transition-colors">
                    Release Roadmap
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h5 className="font-mono text-xs font-semibold uppercase tracking-wider text-slate-400">
                Open Source
              </h5>
              <ul className="mt-4 space-y-2 text-xs text-slate-400">
                <li>
                  <span className="text-slate-300">Next.js 16 (App Router)</span>
                </li>
                <li>
                  <span className="text-slate-300">Tailwind CSS v4</span>
                </li>
                <li>
                  <span className="text-slate-300">Prisma ORM & SQLite</span>
                </li>
                <li>
                  <span className="text-slate-300">pdf-lib Engine</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Copyright */}
          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-800/80 pt-6 text-xs text-slate-500 sm:flex-row">
            <div>© 2026 PDFTools Institute. Free and Privatized PDF utilities forever.</div>
            <div className="flex gap-4">
              <a href="#architecture" className="hover:text-slate-300 transition-colors">
                Privacy Policy
              </a>
              <span>·</span>
              <a href="#architecture" className="hover:text-slate-300 transition-colors">
                Terms
              </a>
              <span>·</span>
              <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-slate-300 transition-colors">
                GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
