"use client";

import { useState, useRef, ChangeEvent, DragEvent } from "react";
import { PDFDocument } from "pdf-lib";

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

function formatSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export default function RotateToolClient() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [isLoadingPages, setIsLoadingPages] = useState(false);
  const [rotations, setRotations] = useState<Record<number, number>>({});
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processSelectedFile = async (selectedFile: File) => {
    setErrorMessage(null);
    setIsSuccess(false);

    const isPdfMime = selectedFile.type === "application/pdf" || selectedFile.type === "application/x-pdf";
    const isPdfExt = selectedFile.name.toLowerCase().endsWith(".pdf");

    if (!isPdfMime && !isPdfExt) {
      setErrorMessage(`"${selectedFile.name}" is not a PDF file. Only PDF files are allowed.`);
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setErrorMessage(`"${selectedFile.name}" (${formatSize(selectedFile.size)}) exceeds the max size of 20MB.`);
      return;
    }

    setFile(selectedFile);
    setPageCount(null);
    setRotations({});
    setIsLoadingPages(true);

    try {
      const buffer = await selectedFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
      const count = pdfDoc.getPageCount();
      setPageCount(count);

      const initialRotations: Record<number, number> = {};
      for (let i = 0; i < count; i++) {
        initialRotations[i] = 0;
      }
      setRotations(initialRotations);
    } catch (err: any) {
      console.error("Error reading PDF client-side:", err);
      const msg = err?.message || "";
      if (msg.includes("encrypted") || msg.includes("password")) {
        setErrorMessage(`"${selectedFile.name}" is password-protected or encrypted. Please decrypt it before rotating.`);
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
        setErrorMessage("Rotate PDF only accepts one file at a time.");
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
        setErrorMessage("Rotate PDF only accepts one file at a time.");
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
    setRotations({});
    setErrorMessage(null);
    setIsSuccess(false);
  };

  const resetAll = () => {
    setFile(null);
    setPageCount(null);
    setIsLoadingPages(false);
    setRotations({});
    setErrorMessage(null);
    setIsSuccess(false);
    setIsProcessing(false);
  };

  const rotatePage = (index: number, delta: number) => {
    if (isProcessing) return;
    setRotations((prev) => {
      const current = prev[index] || 0;
      const next = (current + delta + 360) % 360;
      return { ...prev, [index]: next };
    });
  };

  const rotateAllPages = (delta: number) => {
    if (isProcessing || !pageCount) return;
    setRotations((prev) => {
      const next: Record<number, number> = {};
      for (let i = 0; i < pageCount; i++) {
        const current = prev[i] || 0;
        next[i] = (current + delta + 360) % 360;
      }
      return next;
    });
  };

  const resetRotationsOnly = () => {
    if (isProcessing || !pageCount) return;
    setRotations((prev) => {
      const next: Record<number, number> = {};
      for (let i = 0; i < pageCount; i++) {
        next[i] = 0;
      }
      return next;
    });
  };

  const hasAnyRotations = Object.values(rotations).some((deg) => deg !== 0);

  const handleRotate = async () => {
    if (!file || !hasAnyRotations || isProcessing) return;

    setIsProcessing(true);
    setErrorMessage(null);
    setIsSuccess(false);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("rotations", JSON.stringify(rotations));

      const response = await fetch("/api/pdf/rotate", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        let errText = "Failed to rotate PDF file.";
        try {
          const data = await response.json();
          if (data?.error) {
            errText = data.error;
          }
        } catch {
          // ignore non-JSON payload
        }
        throw new Error(errText);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "rotated.pdf";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setIsSuccess(true);
    } catch (err: any) {
      setErrorMessage(err?.message || "An error occurred while rotating your PDF file. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Rotate PDF
        </h1>
        <p className="mt-3 text-lg text-slate-600">
          Rotate all or specific pages to fix their orientation.
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
            PDF pages rotated successfully!
          </h3>
          <p className="mt-1 text-sm text-emerald-700">
            Your file <span className="font-medium">rotated.pdf</span> has been downloaded automatically.
          </p>
          <button
            onClick={resetAll}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-emerald-700"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" />
            </svg>
            Rotate another file
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
              ? "cursor-pointer border-violet-500 bg-violet-50/70 shadow-lg scale-[1.01]"
              : "cursor-pointer border-slate-300 bg-white hover:border-violet-400 hover:bg-violet-50/30 hover:shadow-md"
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
              isDragging ? "bg-violet-500 text-white" : "bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-md"
            }`}
          >
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" />
            </svg>
          </div>

          <p className="text-lg font-semibold text-slate-800">
            Drag & drop a PDF file here, or <span className="text-violet-600 underline underline-offset-2">click to browse</span>
          </p>
          <p className="mt-2 text-xs text-slate-500">
            PDF file only • Max 20MB • Exactly 1 file
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
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
                    <span className="inline-flex items-center gap-1 text-violet-600 font-medium">
                      <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
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

      {/* Global Controls & Page Grid */}
      {file && pageCount !== null && (
        <div className="mt-8 space-y-6">
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 mr-1">
                Rotate All Pages:
              </span>
              <button
                type="button"
                onClick={() => rotateAllPages(-90)}
                disabled={isProcessing}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors disabled:opacity-50"
              >
                <svg className="h-4 w-4 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
                </svg>
                Rotate Left 90°
              </button>

              <button
                type="button"
                onClick={() => rotateAllPages(90)}
                disabled={isProcessing}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors disabled:opacity-50"
              >
                <svg className="h-4 w-4 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l6-6m0 0l-6-6m6 6H9a6 6 0 000 12h3" />
                </svg>
                Rotate Right 90°
              </button>
            </div>

            <button
              type="button"
              onClick={resetRotationsOnly}
              disabled={isProcessing || !hasAnyRotations}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-40"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" />
              </svg>
              Reset Rotations
            </button>
          </div>

          {/* Grid of Page Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: pageCount }).map((_, index) => {
              const currentDeg = rotations[index] || 0;
              const isRotated = currentDeg !== 0;

              return (
                <div
                  key={index}
                  className={`flex flex-col items-center justify-between rounded-2xl border p-4 shadow-sm transition-all bg-white ${
                    isRotated ? "border-violet-300 ring-2 ring-violet-100" : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  {/* Top Bar: Page Number & Degree Badge */}
                  <div className="flex w-full items-center justify-between gap-1 text-xs mb-3">
                    <span className="font-bold text-slate-700">Page {index + 1}</span>
                    <span
                      className={`rounded-md px-2 py-0.5 font-bold transition-colors ${
                        isRotated ? "bg-violet-100 text-violet-700" : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {currentDeg}°
                    </span>
                  </div>

                  {/* Document Preview Card with Rotation Transform */}
                  <div className="my-3 flex h-32 w-24 items-center justify-center rounded-xl bg-slate-50 p-2 shadow-inner">
                    <div
                      style={{ transform: `rotate(${currentDeg}deg)` }}
                      className="relative flex h-24 w-18 flex-col justify-between rounded-lg border border-slate-300 bg-white p-2 shadow-md transition-transform duration-300 ease-in-out"
                    >
                      {/* Top Header Mockup Lines */}
                      <div className="space-y-1">
                        <div className="h-1.5 w-10 rounded bg-slate-300"></div>
                        <div className="h-1 w-14 rounded bg-slate-200"></div>
                        <div className="h-1 w-12 rounded bg-slate-200"></div>
                      </div>

                      {/* Center Indicator */}
                      <div className="flex items-center justify-center">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-50 text-violet-600 font-bold text-[10px]">
                          ↑
                        </div>
                      </div>

                      {/* Bottom Footer Mockup Line */}
                      <div className="flex justify-end">
                        <div className="h-1 w-6 rounded bg-slate-300"></div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Action Controls */}
                  <div className="flex w-full items-center justify-center gap-1.5 mt-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => rotatePage(index, -90)}
                      disabled={isProcessing}
                      title="Rotate Left 90°"
                      className="rounded-lg p-1.5 text-slate-500 hover:bg-violet-50 hover:text-violet-600 transition-colors disabled:opacity-40"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
                      </svg>
                    </button>

                    <button
                      type="button"
                      onClick={() => rotatePage(index, 90)}
                      disabled={isProcessing}
                      title="Rotate Right 90°"
                      className="rounded-lg p-1.5 text-slate-500 hover:bg-violet-50 hover:text-violet-600 transition-colors disabled:opacity-40"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l6-6m0 0l-6-6m6 6H9a6 6 0 000 12h3" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Action Button Section */}
      <div className="mt-8 text-center">
        <button
          onClick={handleRotate}
          disabled={!file || !hasAnyRotations || isProcessing}
          className={`relative inline-flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-2xl px-8 py-4 text-base font-semibold text-white shadow-lg transition-all duration-200 ${
            !file || !hasAnyRotations || isProcessing
              ? "cursor-not-allowed bg-slate-300 shadow-none text-slate-500"
              : "bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 hover:shadow-violet-200/50 hover:shadow-xl active:scale-[0.99]"
          }`}
        >
          {isProcessing ? (
            <>
              <svg className="h-5 w-5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Rotating...</span>
            </>
          ) : (
            <>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" />
              </svg>
              <span>Rotate PDF</span>
            </>
          )}
        </button>

        {file && !hasAnyRotations && !isProcessing && (
          <p className="mt-2 text-xs text-slate-500">
            Rotate at least one page to enable rotation.
          </p>
        )}
      </div>

      {/* Security Note */}
      <div className="mt-12 flex items-center justify-center gap-2 text-xs text-slate-400">
        <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
        </svg>
        <span>Your files are processed securely and not stored on our servers.</span>
      </div>
    </div>
  );
}
