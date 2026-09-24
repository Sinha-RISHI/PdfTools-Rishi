"use client";

import { useState, useRef, DragEvent, ChangeEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function HeroDropzone() {
  const router = useRouter();
  const [isDragging, setIsDragging] = useState(false);
  const [stagedFiles, setStagedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files).filter(
        (f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf")
      );
      if (files.length > 0) {
        setStagedFiles(files);
      }
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      setStagedFiles(files);
    }
  };

  const openPicker = () => {
    fileInputRef.current?.click();
  };

  const navigateToTool = (toolSlug: string) => {
    router.push(`/tools/${toolSlug}`);
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`group relative mx-auto max-w-4xl overflow-hidden rounded-2xl border transition-all duration-300 ${
        isDragging
          ? "border-indigo-400 bg-indigo-950/30 ring-2 ring-indigo-500/40 shadow-2xl shadow-indigo-500/20"
          : "border-slate-800/90 bg-[#0d0f17]/90 hover:border-slate-700/80 shadow-2xl backdrop-blur-xl"
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,application/pdf"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Decorative gradient corner light */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-transparent blur-2xl" />

      <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        {/* Left upload trigger */}
        <div
          onClick={openPicker}
          className="flex cursor-pointer items-start gap-4 sm:items-center"
        >
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-slate-700/80 bg-slate-800/80 text-indigo-400 shadow-inner transition-transform group-hover:scale-105 group-hover:border-indigo-500/50 group-hover:text-indigo-300">
            <svg
              className="h-7 w-7"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.75}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z"
              />
            </svg>
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-base font-semibold text-slate-100 sm:text-lg">
                Drop PDF files here
              </span>
              <span className="rounded bg-indigo-950/80 px-2 py-0.5 font-mono text-[10px] font-medium tracking-wider text-indigo-300 border border-indigo-700/50">
                AUTOMATIC DISPATCH
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-400">
              or{" "}
              <button
                type="button"
                className="font-medium text-indigo-400 underline decoration-indigo-400/50 underline-offset-2 hover:text-indigo-300"
              >
                browse local filesystem
              </button>{" "}
              to execute fast in-memory transformation.
            </p>
            <p className="mt-2 font-mono text-[11px] tracking-tight text-slate-500">
              (MAX 20MB / PIPELINE - SANDBOXED PROTOCOL [STRICT ZERO DISK])
            </p>
          </div>
        </div>

        {/* Right side quick tool routing */}
        <div className="flex shrink-0 flex-row gap-2 border-t border-slate-800/80 pt-4 sm:flex-col sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0">
          <Link
            href="/tools/merge"
            className="flex items-center justify-between gap-3 rounded-lg border border-slate-800 bg-slate-900/90 px-3.5 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:border-indigo-500/50 hover:bg-slate-800 hover:text-white"
          >
            <span>Merge</span>
            <span className="text-indigo-400">↗</span>
          </Link>
          <Link
            href="/tools/split"
            className="flex items-center justify-between gap-3 rounded-lg border border-slate-800 bg-slate-900/90 px-3.5 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:border-rose-500/50 hover:bg-slate-800 hover:text-white"
          >
            <span>Split</span>
            <span className="text-rose-400">↗</span>
          </Link>
          <Link
            href="/tools/rotate"
            className="flex items-center justify-between gap-3 rounded-lg border border-slate-800 bg-slate-900/90 px-3.5 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:border-emerald-500/50 hover:bg-slate-800 hover:text-white"
          >
            <span>Rotate</span>
            <span className="text-emerald-400">↗</span>
          </Link>
        </div>
      </div>

      {/* If files were dropped directly on the hero */}
      {stagedFiles.length > 0 && (
        <div className="border-t border-indigo-500/30 bg-indigo-950/40 p-4">
          <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <div className="text-xs text-indigo-200">
              <span className="font-semibold text-white">{stagedFiles.length} PDF file(s)</span>{" "}
              ready for processing:{" "}
              <span className="font-mono text-slate-300">
                {stagedFiles.map((f) => f.name).join(", ")}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => navigateToTool("merge")}
                className="rounded-lg bg-indigo-600 px-3 py-1 text-xs font-semibold text-white hover:bg-indigo-500"
              >
                Merge Files →
              </button>
              <button
                type="button"
                onClick={() => navigateToTool("split")}
                className="rounded-lg bg-slate-800 px-3 py-1 text-xs font-medium text-slate-200 hover:bg-slate-700"
              >
                Split →
              </button>
              <button
                type="button"
                onClick={() => setStagedFiles([])}
                className="rounded-lg px-2 py-1 text-xs text-slate-400 hover:text-slate-200"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
