"use client";

import { useState, useRef, ChangeEvent, DragEvent } from "react";
import { PDFDocument } from "pdf-lib";

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

const PRESET_COLORS = [
  { label: "Gray",   hex: "#808080" },
  { label: "Black",  hex: "#000000" },
  { label: "Red",    hex: "#DC2626" },
  { label: "Blue",   hex: "#2563EB" },
  { label: "Green",  hex: "#16A34A" },
  { label: "Orange", hex: "#EA580C" },
  { label: "Purple", hex: "#7C3AED" },
  { label: "Teal",   hex: "#0D9488" },
];

type Position = "diagonal" | "tiled";

interface WatermarkSettings {
  text: string;
  fontSize: number;
  opacity: number;
  rotation: number;
  color: string;
  position: Position;
}

function formatSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

/** Convert hex color to CSS rgba for the live preview canvas */
function hexToRgba(hex: string, opacity: number): string {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity / 100})`;
}

// ---------- Live Preview Component ----------
function WatermarkPreview({ settings }: { settings: WatermarkSettings }) {
  const { text, fontSize, opacity, rotation, color, position } = settings;

  // Scale font for the small preview box (preview is ~200×280px representing a page)
  const PREVIEW_W = 200;
  const PREVIEW_H = 280;
  // A4 is roughly 595×842pt; scale factor for preview:
  const scale = PREVIEW_W / 595;
  const previewFontSize = Math.max(8, Math.round(fontSize * scale));
  const displayText = text || "CONFIDENTIAL";
  const rgba = hexToRgba(color, opacity);
  const rotationDeg = rotation;

  return (
    <div
      className="relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm mx-auto"
      style={{ width: PREVIEW_W, height: PREVIEW_H }}
      aria-label="Watermark preview"
    >
      {/* Mock page lines */}
      <div className="absolute inset-0 flex flex-col gap-1.5 p-4 pt-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="h-1.5 rounded-full bg-slate-100"
            style={{ width: `${70 + ((i * 17) % 30)}%` }}
          />
        ))}
      </div>

      {/* Watermark overlay */}
      {position === "diagonal" ? (
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
          style={{ transform: `rotate(${rotationDeg}deg)` }}
        >
          <span
            style={{
              fontSize: previewFontSize,
              color: rgba,
              fontWeight: 700,
              whiteSpace: "nowrap",
              fontFamily: "Helvetica, Arial, sans-serif",
              letterSpacing: "0.05em",
            }}
          >
            {displayText}
          </span>
        </div>
      ) : (
        // Tiled mode: 3×4 grid
        <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
          {Array.from({ length: 12 }).map((_, i) => {
            const col = i % 3;
            const row = Math.floor(i / 3);
            return (
              <div
                key={i}
                className="absolute flex items-center justify-center"
                style={{
                  left: `${(col / 3) * 100 + 16}%`,
                  top: `${(row / 4) * 100 + 12}%`,
                  transform: `rotate(${rotationDeg}deg)`,
                }}
              >
                <span
                  style={{
                    fontSize: Math.max(6, Math.round(previewFontSize * 0.6)),
                    color: rgba,
                    fontWeight: 700,
                    whiteSpace: "nowrap",
                    fontFamily: "Helvetica, Arial, sans-serif",
                  }}
                >
                  {displayText}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Corner page-number mock */}
      <div className="absolute bottom-2 right-3 text-[8px] text-slate-300 font-medium select-none">
        1
      </div>
    </div>
  );
}

// ---------- Main Component ----------
export default function WatermarkToolClient() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [isLoadingPages, setIsLoadingPages] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [settings, setSettings] = useState<WatermarkSettings>({
    text: "",
    fontSize: 48,
    opacity: 30,
    rotation: -45,
    color: "#808080",
    position: "diagonal",
  });

  const updateSetting = <K extends keyof WatermarkSettings>(
    key: K,
    value: WatermarkSettings[K]
  ) => setSettings((prev) => ({ ...prev, [key]: value }));

  // ---- File handling ----
  const processSelectedFile = async (selectedFile: File) => {
    setErrorMessage(null);
    setIsSuccess(false);

    const isPdfMime =
      selectedFile.type === "application/pdf" ||
      selectedFile.type === "application/x-pdf";
    const isPdfExt = selectedFile.name.toLowerCase().endsWith(".pdf");

    if (!isPdfMime && !isPdfExt) {
      setErrorMessage(
        `"${selectedFile.name}" is not a PDF file. Only PDF files are allowed.`
      );
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setErrorMessage(
        `"${selectedFile.name}" (${formatSize(selectedFile.size)}) exceeds the max size of 20MB.`
      );
      return;
    }

    setFile(selectedFile);
    setPageCount(null);
    setIsLoadingPages(true);

    try {
      const buffer = await selectedFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
      setPageCount(pdfDoc.getPageCount());
    } catch (err: any) {
      console.error("Error reading PDF client-side:", err);
      const msg = err?.message || "";
      if (msg.includes("encrypted") || msg.includes("password")) {
        setErrorMessage(
          `"${selectedFile.name}" is password-protected or encrypted. Please decrypt it before adding a watermark.`
        );
      } else {
        setErrorMessage(
          `Failed to read "${selectedFile.name}". The file may be corrupted or invalid.`
        );
      }
    } finally {
      setIsLoadingPages(false);
    }
  };

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      if (e.target.files.length > 1) {
        setErrorMessage("Watermark PDF only accepts one file at a time.");
      } else {
        processSelectedFile(e.target.files[0]);
      }
    }
    if (e.target) e.target.value = "";
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isProcessing) setIsDragging(true);
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
    if (isProcessing) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      if (e.dataTransfer.files.length > 1) {
        setErrorMessage("Watermark PDF only accepts one file at a time.");
      } else {
        processSelectedFile(e.dataTransfer.files[0]);
      }
    }
  };

  const removeFile = () => {
    if (isProcessing) return;
    setFile(null);
    setPageCount(null);
    setIsLoadingPages(false);
    setErrorMessage(null);
    setIsSuccess(false);
  };

  const resetAll = () => {
    setFile(null);
    setPageCount(null);
    setIsLoadingPages(false);
    setErrorMessage(null);
    setIsSuccess(false);
    setIsProcessing(false);
  };

  // ---- Watermark action ----
  const isButtonDisabled =
    !file ||
    isLoadingPages ||
    pageCount === null ||
    isProcessing ||
    settings.text.trim() === "";

  const handleWatermark = async () => {
    if (isButtonDisabled || !file) return;

    setIsProcessing(true);
    setErrorMessage(null);
    setIsSuccess(false);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("text", settings.text.trim());
      formData.append("fontSize", String(settings.fontSize));
      formData.append("opacity", String(settings.opacity));
      formData.append("rotation", String(settings.rotation));
      formData.append("color", settings.color);
      formData.append("position", settings.position);

      const response = await fetch("/api/pdf/watermark", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        let errText = "Failed to watermark PDF file.";
        try {
          const data = await response.json();
          if (data?.error) errText = data.error;
        } catch {
          // ignore non-JSON payload
        }
        throw new Error(errText);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "watermarked.pdf";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setIsSuccess(true);
    } catch (err: any) {
      setErrorMessage(
        err?.message ||
          "An error occurred while adding the watermark. Please try again."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // ---- Render ----
  return (
    <div className="mx-auto max-w-4xl">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Watermark PDF
        </h1>
        <p className="mt-3 text-lg text-slate-600">
          Add a text watermark to every page of your PDF.
        </p>
      </div>

      {/* Dismissible Error Alert */}
      {errorMessage && (
        <div className="mb-6 flex items-start justify-between rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 shadow-sm transition-all">
          <div className="flex items-start gap-3">
            <svg
              className="h-5 w-5 text-red-500 shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0zm-9 3.75h.008v.008H12v-.008z"
              />
            </svg>
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="ml-4 rounded-lg p-1 text-red-500 hover:bg-red-100 transition-colors"
            title="Dismiss error"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      )}

      {/* Success Notification */}
      {isSuccess && (
        <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-6 text-center shadow-sm">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm">
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 12.75l6 6 9-13.5"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-emerald-900">
            Watermark added successfully!
          </h3>
          <p className="mt-1 text-sm text-emerald-700">
            Your file{" "}
            <span className="font-medium">watermarked.pdf</span> has been
            downloaded automatically.
          </p>
          <button
            onClick={resetAll}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-emerald-700"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182"
              />
            </svg>
            Watermark another file
          </button>
        </div>
      )}

      {/* Upload Zone or Selected File Card */}
      {!file ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !isProcessing && fileInputRef.current?.click()}
          className={`group relative flex flex-col items-center justify-center rounded-3xl border-2 border-dashed p-8 sm:p-12 text-center transition-all duration-200 ${
            isProcessing
              ? "cursor-not-allowed border-slate-200 bg-slate-100/50 opacity-60"
              : isDragging
              ? "cursor-pointer border-sky-500 bg-sky-50/70 shadow-lg scale-[1.01]"
              : "cursor-pointer border-slate-300 bg-white hover:border-sky-400 hover:bg-sky-50/30 hover:shadow-md"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileInput}
            disabled={isProcessing}
            className="hidden"
          />

          <div
            className={`mb-4 flex h-16 w-16 items-center justify-center rounded-2xl transition-transform group-hover:scale-110 ${
              isDragging
                ? "bg-sky-500 text-white"
                : "bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-md"
            }`}
          >
            <svg
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.75}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 6h.008v.008H6V6Z"
              />
            </svg>
          </div>

          <p className="text-lg font-semibold text-slate-800">
            Drag &amp; drop a PDF file here, or{" "}
            <span className="text-sky-600 underline underline-offset-2">
              click to browse
            </span>
          </p>
          <p className="mt-2 text-xs text-slate-500">
            PDF file only • Max 20MB • Exactly 1 file
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-600">
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                  />
                </svg>
              </div>

              <div className="min-w-0">
                <p
                  className="truncate text-base font-semibold text-slate-900"
                  title={file.name}
                >
                  {file.name}
                </p>
                <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span>{formatSize(file.size)}</span>
                  <span>•</span>
                  {isLoadingPages ? (
                    <span className="inline-flex items-center gap-1 text-sky-600 font-medium">
                      <svg
                        className="h-3.5 w-3.5 animate-spin"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Reading pages...
                    </span>
                  ) : pageCount !== null ? (
                    <span className="font-semibold text-slate-700">
                      {pageCount} page{pageCount === 1 ? "" : "s"}
                    </span>
                  ) : (
                    <span className="text-red-500 font-medium">
                      Page count unavailable
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={removeFile}
              disabled={isProcessing}
              title="Remove file"
              className="rounded-xl p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-30 transition-colors"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Settings Panel + Preview */}
      {file && pageCount !== null && (
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-5">
          {/* Settings — takes 3/5 columns on large screens */}
          <div className="lg:col-span-3 space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900">
              Watermark Settings
            </h2>

            {/* Watermark Text */}
            <div>
              <label
                htmlFor="wm-text"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                Watermark text{" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                id="wm-text"
                type="text"
                value={settings.text}
                onChange={(e) =>
                  updateSetting("text", e.target.value.slice(0, 100))
                }
                disabled={isProcessing}
                placeholder="CONFIDENTIAL"
                maxLength={100}
                className={`w-full rounded-xl border px-4 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2 ${
                  settings.text.trim() === ""
                    ? "border-slate-300 focus:border-sky-500 focus:ring-sky-200"
                    : "border-slate-300 focus:border-sky-500 focus:ring-sky-200"
                } text-slate-900 disabled:opacity-50`}
              />
              <p className="mt-1 text-xs text-slate-400 text-right">
                {settings.text.length}/100
              </p>
            </div>

            {/* Position Mode */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Position mode
              </label>
              <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
                {(
                  [
                    { value: "diagonal", label: "Diagonal single" },
                    { value: "tiled",    label: "Tiled / repeated" },
                  ] as { value: Position; label: string }[]
                ).map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => updateSetting("position", opt.value)}
                    disabled={isProcessing}
                    className={`rounded-lg py-2 px-3 text-xs font-semibold transition-all duration-200 ${
                      settings.position === opt.value
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Font Size */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="wm-fontsize"
                  className="text-sm font-medium text-slate-700"
                >
                  Font size
                </label>
                <span className="text-sm font-semibold text-slate-900">
                  {settings.fontSize}pt
                </span>
              </div>
              <input
                id="wm-fontsize"
                type="range"
                min={12}
                max={120}
                step={2}
                value={settings.fontSize}
                onChange={(e) =>
                  updateSetting("fontSize", Number(e.target.value))
                }
                disabled={isProcessing}
                className="w-full accent-sky-500 disabled:opacity-50"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-0.5">
                <span>12pt</span><span>120pt</span>
              </div>
            </div>

            {/* Opacity */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="wm-opacity"
                  className="text-sm font-medium text-slate-700"
                >
                  Opacity
                </label>
                <span className="text-sm font-semibold text-slate-900">
                  {settings.opacity}%
                </span>
              </div>
              <input
                id="wm-opacity"
                type="range"
                min={10}
                max={100}
                step={5}
                value={settings.opacity}
                onChange={(e) =>
                  updateSetting("opacity", Number(e.target.value))
                }
                disabled={isProcessing}
                className="w-full accent-sky-500 disabled:opacity-50"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-0.5">
                <span>10% (subtle)</span><span>100% (solid)</span>
              </div>
            </div>

            {/* Rotation */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="wm-rotation"
                  className="text-sm font-medium text-slate-700"
                >
                  Rotation angle
                </label>
                <span className="text-sm font-semibold text-slate-900">
                  {settings.rotation}°
                </span>
              </div>
              <input
                id="wm-rotation"
                type="range"
                min={-90}
                max={90}
                step={5}
                value={settings.rotation}
                onChange={(e) =>
                  updateSetting("rotation", Number(e.target.value))
                }
                disabled={isProcessing}
                className="w-full accent-sky-500 disabled:opacity-50"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-0.5">
                <span>−90°</span><span>0°</span><span>+90°</span>
              </div>
            </div>

            {/* Color Presets */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Color
              </label>
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => updateSetting("color", c.hex)}
                    disabled={isProcessing}
                    title={c.label}
                    className={`h-8 w-8 rounded-full border-2 transition-all duration-150 ${
                      settings.color === c.hex
                        ? "border-sky-500 scale-110 shadow-md"
                        : "border-transparent hover:scale-105 hover:border-slate-300"
                    } disabled:opacity-50`}
                    style={{ backgroundColor: c.hex }}
                    aria-label={c.label}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Live Preview — takes 2/5 columns on large screens */}
          <div className="lg:col-span-2 flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900 self-start">
              Live Preview
            </h2>
            <p className="text-xs text-slate-400 self-start -mt-2">
              Approximate — actual PDF may differ slightly
            </p>
            <div className="mt-2">
              <WatermarkPreview settings={settings} />
            </div>
          </div>
        </div>
      )}

      {/* Action Button */}
      <div className="mt-8 text-center">
        <button
          onClick={handleWatermark}
          disabled={isButtonDisabled}
          className={`relative inline-flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-2xl px-8 py-4 text-base font-semibold text-white shadow-lg transition-all duration-200 ${
            isButtonDisabled
              ? "cursor-not-allowed bg-slate-300 shadow-none text-slate-500"
              : "bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 hover:shadow-sky-200/50 hover:shadow-xl active:scale-[0.99]"
          }`}
        >
          {isProcessing ? (
            <>
              <svg
                className="h-5 w-5 animate-spin text-white"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>Adding Watermark...</span>
            </>
          ) : (
            <>
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 6h.008v.008H6V6Z"
                />
              </svg>
              <span>Add Watermark</span>
            </>
          )}
        </button>

        {file && settings.text.trim() === "" && !isProcessing && (
          <p className="mt-2 text-xs text-slate-500">
            Enter watermark text above to enable.
          </p>
        )}
      </div>

      {/* Security Note */}
      <div className="mt-12 flex items-center justify-center gap-2 text-xs text-slate-400">
        <svg
          className="h-4 w-4 text-slate-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
          />
        </svg>
        <span>Your files are processed securely and not stored on our servers.</span>
      </div>
    </div>
  );
}
