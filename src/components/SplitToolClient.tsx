"use client";

import { useState, useRef, ChangeEvent, DragEvent } from "react";
import { PDFDocument } from "pdf-lib";

type Mode = "extract" | "individual";

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

function formatSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function validatePageRanges(
  rangeStr: string,
  totalPages: number
): { valid: boolean; count: number; error: string | null } {
  const trimmed = rangeStr.trim();
  if (!trimmed) {
    return { valid: false, count: 0, error: null };
  }

  const parts = trimmed.split(",").map((s) => s.trim()).filter(Boolean);
  if (parts.length === 0) {
    return { valid: false, count: 0, error: null };
  }

  const pages: number[] = [];

  for (const part of parts) {
    if (/^\d+$/.test(part)) {
      const pageNum = parseInt(part, 10);
      if (pageNum < 1 || pageNum > totalPages) {
        return {
          valid: false,
          count: 0,
          error: `Page ${pageNum} doesn't exist — this PDF has ${totalPages} page${totalPages === 1 ? "" : "s"}.`,
        };
      }
      pages.push(pageNum);
    } else if (/^\d+\s*-\s*\d+$/.test(part)) {
      const rangeParts = part.split("-").map((s) => s.trim());
      const start = parseInt(rangeParts[0], 10);
      const end = parseInt(rangeParts[1], 10);

      if (start > end) {
        return {
          valid: false,
          count: 0,
          error: `Invalid range "${part}": start page cannot be greater than end page.`,
        };
      }
      if (start < 1 || end > totalPages) {
        const invalidPage = start < 1 ? start : end;
        return {
          valid: false,
          count: 0,
          error: `Page ${invalidPage} doesn't exist — this PDF has ${totalPages} page${totalPages === 1 ? "" : "s"}.`,
        };
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    } else {
      return {
        valid: false,
        count: 0,
        error: `Invalid format: "${part}". Use numbers or ranges like 1-3, 5.`,
      };
    }
  }

  const uniquePages = Array.from(new Set(pages));
  return { valid: true, count: uniquePages.length, error: null };
}

export default function SplitToolClient() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [isLoadingPages, setIsLoadingPages] = useState(false);
  const [mode, setMode] = useState<Mode>("extract");
  const [rangesInput, setRangesInput] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [downloadName, setDownloadName] = useState("split.pdf");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processSelectedFile = async (selectedFile: File) => {
    setErrorMessage(null);
    setIsSuccess(false);

    // Validate type
    const isPdfMime = selectedFile.type === "application/pdf" || selectedFile.type === "application/x-pdf";
    const isPdfExt = selectedFile.name.toLowerCase().endsWith(".pdf");

    if (!isPdfMime && !isPdfExt) {
      setErrorMessage(`"${selectedFile.name}" is not a PDF file. Only PDF files are allowed.`);
      return;
    }

    // Validate size
    if (selectedFile.size > MAX_FILE_SIZE) {
      setErrorMessage(`"${selectedFile.name}" (${formatSize(selectedFile.size)}) exceeds the max size of 20MB.`);
      return;
    }

    setFile(selectedFile);
    setPageCount(null);
    setIsLoadingPages(true);

    try {
      const buffer = await selectedFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
      const count = pdfDoc.getPageCount();
      setPageCount(count);
    } catch (err: any) {
      console.error("Error reading client-side PDF page count:", err);
      const msg = err?.message || "";
      if (msg.includes("encrypted") || msg.includes("password")) {
        setErrorMessage(`"${selectedFile.name}" is password-protected or encrypted. Please decrypt it before splitting.`);
      } else {
        setErrorMessage(`Failed to read page count for "${selectedFile.name}". The file may be corrupted or invalid.`);
      }
    } finally {
      setIsLoadingPages(false);
    }
  };

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      if (e.target.files.length > 1) {
        setErrorMessage("Split PDF only accepts one file at a time.");
      } else {
        processSelectedFile(e.target.files[0]);
      }
    }
    if (e.target) {
      e.target.value = "";
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isProcessing) {
      setIsDragging(true);
    }
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
        setErrorMessage("Split PDF only accepts one file at a time.");
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
    setRangesInput("");
    setErrorMessage(null);
    setIsSuccess(false);
  };

  const resetAll = () => {
    setFile(null);
    setPageCount(null);
    setIsLoadingPages(false);
    setRangesInput("");
    setErrorMessage(null);
    setIsSuccess(false);
    setIsProcessing(false);
  };

  // Range validation state
  const rangeValidation = pageCount ? validatePageRanges(rangesInput, pageCount) : { valid: false, count: 0, error: null };

  const isButtonDisabled =
    !file ||
    isLoadingPages ||
    pageCount === null ||
    isProcessing ||
    (mode === "extract" && (!rangeValidation.valid || rangeValidation.count === 0));

  const handleSplit = async () => {
    if (isButtonDisabled || !file) return;

    setIsProcessing(true);
    setErrorMessage(null);
    setIsSuccess(false);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("mode", mode);

      if (mode === "extract") {
        formData.append("ranges", rangesInput);
      }

      const response = await fetch("/api/pdf/split", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        let errText = "Failed to split PDF file.";
        try {
          const data = await response.json();
          if (data?.error) {
            errText = data.error;
          }
        } catch {
          // ignore non-JSON error payloads
        }
        throw new Error(errText);
      }

      const filename = mode === "extract" ? "split.pdf" : "split-pages.zip";
      setDownloadName(filename);

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setIsSuccess(true);
    } catch (err: any) {
      setErrorMessage(err?.message || "An error occurred while splitting your PDF file. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Split PDF
        </h1>
        <p className="mt-3 text-lg text-slate-600">
          Extract specific pages or split every page into its own file.
        </p>
      </div>

      {/* Dismissible Error Alert */}
      {errorMessage && (
        <div className="mb-6 flex items-start justify-between rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 shadow-sm transition-all">
          <div className="flex items-start gap-3">
            <svg className="h-5 w-5 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="ml-4 rounded-lg p-1 text-red-500 hover:bg-red-100 transition-colors"
            title="Dismiss error"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Success Notification */}
      {isSuccess && (
        <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-6 text-center shadow-sm">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-emerald-900">
            PDF split successfully!
          </h3>
          <p className="mt-1 text-sm text-emerald-700">
            Your file <span className="font-medium">{downloadName}</span> has been downloaded automatically.
          </p>
          <button
            onClick={resetAll}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-emerald-700"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" />
            </svg>
            Split another file
          </button>
        </div>
      )}

      {/* Upload zone or Selected File Card */}
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
              ? "cursor-pointer border-orange-500 bg-orange-50/70 shadow-lg scale-[1.01]"
              : "cursor-pointer border-slate-300 bg-white hover:border-orange-400 hover:bg-orange-50/30 hover:shadow-md"
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
              isDragging ? "bg-orange-500 text-white" : "bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-md"
            }`}
          >
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.057 1.123-.08M15.75 18H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.133 48.133 0 0 0-1.123-.08M15.75 18.75v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75M15.75 18.75H9.75"
              />
            </svg>
          </div>

          <p className="text-lg font-semibold text-slate-800">
            Drag & drop a PDF file here, or <span className="text-orange-600 underline underline-offset-2">click to browse</span>
          </p>
          <p className="mt-2 text-xs text-slate-500">
            PDF file only • Max 20MB • Exactly 1 file
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                  />
                </svg>
              </div>

              <div className="min-w-0">
                <p className="truncate text-base font-semibold text-slate-900" title={file.name}>
                  {file.name}
                </p>
                <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span>{formatSize(file.size)}</span>
                  <span>•</span>
                  {isLoadingPages ? (
                    <span className="inline-flex items-center gap-1 text-amber-600 font-medium">
                      <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
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
                      This PDF has {pageCount} page{pageCount === 1 ? "" : "s"}
                    </span>
                  ) : (
                    <span className="text-red-500 font-medium">Page count unavailable</span>
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
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Mode Selector & Configuration */}
      {file && pageCount !== null && (
        <div className="mt-8 space-y-6">
          {/* Tab Selector */}
          <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1.5 text-sm font-medium text-slate-600">
            <button
              type="button"
              onClick={() => setMode("extract")}
              disabled={isProcessing}
              className={`flex items-center justify-center gap-2 rounded-xl py-2.5 px-4 transition-all duration-200 ${
                mode === "extract"
                  ? "bg-white font-semibold text-slate-900 shadow-sm"
                  : "hover:text-slate-900"
              }`}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 17.25v2.25A2.25 2.25 0 0 1 13.5 21.75h-9a2.25 2.25 0 0 1-2.25-2.25v-9A2.25 2.25 0 0 1 4.5 8.25H6.75"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 14.25v-9A2.25 2.25 0 0 1 11.25 3h9A2.25 2.25 0 0 1 22.5 5.25v9a2.25 2.25 0 0 1-2.25 2.25h-9A2.25 2.25 0 0 1 9 14.25Z"
                />
              </svg>
              Extract Pages
            </button>

            <button
              type="button"
              onClick={() => setMode("individual")}
              disabled={isProcessing}
              className={`flex items-center justify-center gap-2 rounded-xl py-2.5 px-4 transition-all duration-200 ${
                mode === "individual"
                  ? "bg-white font-semibold text-slate-900 shadow-sm"
                  : "hover:text-slate-900"
              }`}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25A2.25 2.25 0 0 1 13.5 8.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z"
                />
              </svg>
              Split into Individual Pages
            </button>
          </div>

          {/* Tab Content */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            {mode === "extract" ? (
              <div className="space-y-4">
                <div>
                  <label htmlFor="pages-input" className="block text-sm font-semibold text-slate-900 mb-1.5">
                    Pages to extract
                  </label>
                  <input
                    id="pages-input"
                    type="text"
                    value={rangesInput}
                    onChange={(e) => setRangesInput(e.target.value)}
                    disabled={isProcessing}
                    placeholder="e.g. 1-3, 5, 8-10"
                    className={`w-full rounded-xl border px-4 py-3 text-sm transition-colors focus:outline-none focus:ring-2 ${
                      rangeValidation.error
                        ? "border-red-300 bg-red-50/30 text-red-900 focus:border-red-500 focus:ring-red-200"
                        : "border-slate-300 text-slate-900 focus:border-orange-500 focus:ring-orange-200"
                    }`}
                  />
                  <p className="mt-1.5 text-xs text-slate-500">
                    Use commas to separate pages/ranges, e.g. 1-3, 5, 8-10
                  </p>
                </div>

                {/* Validation status / live preview */}
                {rangeValidation.error && (
                  <div className="flex items-center gap-2 text-xs font-medium text-red-600">
                    <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0zm-9 3.75h.008v.008H12v-.008z"
                      />
                    </svg>
                    <span>{rangeValidation.error}</span>
                  </div>
                )}

                {!rangeValidation.error && rangeValidation.valid && rangeValidation.count > 0 && (
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2 border border-emerald-200">
                    <svg className="h-4 w-4 shrink-0 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                    <span>
                      This will extract {rangeValidation.count} page{rangeValidation.count === 1 ? "" : "s"}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-2 text-center sm:text-left">
                <p className="text-sm text-slate-700">
                  Each page will become its own PDF file, delivered as a ZIP archive.
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Total output: <strong className="text-slate-800">{pageCount} separate PDF files</strong> inside split-pages.zip
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Button Section */}
      <div className="mt-8 text-center">
        <button
          onClick={handleSplit}
          disabled={isButtonDisabled}
          className={`relative inline-flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-2xl px-8 py-4 text-base font-semibold text-white shadow-lg transition-all duration-200 ${
            isButtonDisabled
              ? "cursor-not-allowed bg-slate-300 shadow-none text-slate-500"
              : "bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 hover:shadow-orange-200/50 hover:shadow-xl active:scale-[0.99]"
          }`}
        >
          {isProcessing ? (
            <>
              <svg className="h-5 w-5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>Splitting...</span>
            </>
          ) : (
            <>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.057 1.123-.08M15.75 18H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.133 48.133 0 0 0-1.123-.08M15.75 18.75v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75M15.75 18.75H9.75"
                />
              </svg>
              <span>Split PDF</span>
            </>
          )}
        </button>
      </div>

      {/* Security note */}
      <div className="mt-12 flex items-center justify-center gap-2 text-xs text-slate-400">
        <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
