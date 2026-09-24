"use client";

import { useState, useRef, ChangeEvent, DragEvent } from "react";

type PDFFileItem = {
  id: string;
  file: File;
};

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
const MAX_FILES = 15;

function formatSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export default function MergeToolClient() {
  const [files, setFiles] = useState<PDFFileItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleValidationAndAdd = (newFiles: File[]) => {
    setErrorMessage(null);
    setIsSuccess(false);

    const validFiles: PDFFileItem[] = [];
    const errors: string[] = [];

    let currentCount = files.length;

    for (const file of newFiles) {
      // Check file type
      const isPdfMime = file.type === "application/pdf" || file.type === "application/x-pdf";
      const isPdfExt = file.name.toLowerCase().endsWith(".pdf");

      if (!isPdfMime && !isPdfExt) {
        errors.push(`"${file.name}" is not a PDF file. Only PDF files are allowed.`);
        continue;
      }

      // Check size
      if (file.size > MAX_FILE_SIZE) {
        errors.push(`"${file.name}" (${formatSize(file.size)}) exceeds the max size of 20MB.`);
        continue;
      }

      // Check count limit
      if (currentCount + validFiles.length >= MAX_FILES) {
        errors.push(`Maximum ${MAX_FILES} files allowed. Some files were skipped.`);
        break;
      }

      validFiles.push({
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${file.name}`,
        file,
      });
    }

    if (errors.length > 0) {
      setErrorMessage(errors.join(" "));
    }

    if (validFiles.length > 0) {
      setFiles((prev) => [...prev, ...validFiles]);
    }
  };

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      handleValidationAndAdd(selectedFiles);
    }
    // Reset file input value so selecting the same file again works
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
      const droppedFiles = Array.from(e.dataTransfer.files);
      handleValidationAndAdd(droppedFiles);
    }
  };

  const moveUp = (index: number) => {
    if (index === 0 || isProcessing) return;
    setFiles((prev) => {
      const updated = [...prev];
      const temp = updated[index - 1];
      updated[index - 1] = updated[index];
      updated[index] = temp;
      return updated;
    });
  };

  const moveDown = (index: number) => {
    if (index === files.length - 1 || isProcessing) return;
    setFiles((prev) => {
      const updated = [...prev];
      const temp = updated[index + 1];
      updated[index + 1] = updated[index];
      updated[index] = temp;
      return updated;
    });
  };

  const removeFile = (index: number) => {
    if (isProcessing) return;
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setErrorMessage(null);
  };

  const resetAll = () => {
    setFiles([]);
    setErrorMessage(null);
    setIsSuccess(false);
    setIsProcessing(false);
  };

  const handleMerge = async () => {
    if (files.length < 2 || isProcessing) return;

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const formData = new FormData();
      files.forEach((item) => {
        formData.append("files", item.file);
      });

      const response = await fetch("/api/pdf/merge", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        let errText = "Failed to merge PDF files.";
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
      link.download = "merged.pdf";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setIsSuccess(true);
    } catch (err: any) {
      setErrorMessage(err?.message || "An error occurred while merging your PDF files. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const totalBytes = files.reduce((acc, curr) => acc + curr.file.size, 0);

  return (
    <div className="mx-auto max-w-3xl">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Merge PDF
        </h1>
        <p className="mt-3 text-lg text-slate-600">
          Combine multiple PDFs into one document, in the order you choose.
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
            PDFs merged successfully!
          </h3>
          <p className="mt-1 text-sm text-emerald-700">
            Your file <span className="font-medium">merged.pdf</span> has been downloaded automatically.
          </p>
          <button
            onClick={resetAll}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-emerald-700"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" />
            </svg>
            Merge more files
          </button>
        </div>
      )}

      {/* Main Drag and Drop Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isProcessing && fileInputRef.current?.click()}
        className={`group relative flex flex-col items-center justify-center rounded-3xl border-2 border-dashed p-8 sm:p-12 text-center transition-all duration-200 ${
          isProcessing
            ? "cursor-not-allowed border-slate-200 bg-slate-100/50 opacity-60"
            : isDragging
            ? "cursor-pointer border-rose-500 bg-rose-50/70 shadow-lg scale-[1.01]"
            : "cursor-pointer border-slate-300 bg-white hover:border-rose-400 hover:bg-rose-50/30 hover:shadow-md"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          multiple
          onChange={handleFileInput}
          disabled={isProcessing}
          className="hidden"
        />

        <div className={`mb-4 flex h-16 w-16 items-center justify-center rounded-2xl transition-transform group-hover:scale-110 ${
          isDragging ? "bg-rose-500 text-white" : "bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-md"
        }`}>
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5h10.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6.75v10.5a2.25 2.25 0 002.25 2.25z" />
          </svg>
        </div>

        <p className="text-lg font-semibold text-slate-800">
          Drag & drop PDF files here, or <span className="text-rose-600 underline underline-offset-2">click to browse</span>
        </p>
        <p className="mt-2 text-xs text-slate-500">
          PDF files only • Max 20MB per file • Up to 15 files
        </p>
      </div>

      {/* Selected Files List */}
      {files.length > 0 && (
        <div className="mt-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">
              Files to merge ({files.length})
            </h2>
            <button
              onClick={resetAll}
              disabled={isProcessing}
              className="text-xs font-medium text-slate-500 hover:text-red-600 transition-colors disabled:opacity-50"
            >
              Clear all
            </button>
          </div>

          <div className="space-y-3">
            {files.map((item, index) => (
              <div
                key={item.id}
                className="group relative flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-slate-300 hover:shadow-md"
              >
                <div className="flex items-center gap-3.5 min-w-0 pr-4">
                  {/* Number Badge */}
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-700">
                    {index + 1}
                  </span>

                  {/* PDF Icon */}
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                    </svg>
                  </div>

                  {/* File Info */}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900" title={item.file.name}>
                      {item.file.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatSize(item.file.size)}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  {/* Up Button */}
                  <button
                    onClick={() => moveUp(index)}
                    disabled={index === 0 || isProcessing}
                    title="Move Up"
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400 transition-colors"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                    </svg>
                  </button>

                  {/* Down Button */}
                  <button
                    onClick={() => moveDown(index)}
                    disabled={index === files.length - 1 || isProcessing}
                    title="Move Down"
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400 transition-colors"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </button>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFile(index)}
                    disabled={isProcessing}
                    title="Remove File"
                    className="ml-1 rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-30 transition-colors"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Stats Bar */}
          <div className="flex items-center justify-between rounded-xl bg-slate-100 px-4 py-3 text-xs font-medium text-slate-600">
            <span>Total files: <strong className="text-slate-900">{files.length}</strong> / 15</span>
            <span>Total size: <strong className="text-slate-900">{formatSize(totalBytes)}</strong></span>
          </div>
        </div>
      )}

      {/* Action Button Section */}
      <div className="mt-8 text-center">
        <button
          onClick={handleMerge}
          disabled={files.length < 2 || isProcessing}
          className={`relative inline-flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-2xl px-8 py-4 text-base font-semibold text-white shadow-lg transition-all duration-200 ${
            files.length < 2 || isProcessing
              ? "cursor-not-allowed bg-slate-300 shadow-none text-slate-500"
              : "bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 hover:shadow-rose-200/50 hover:shadow-xl active:scale-[0.99]"
          }`}
        >
          {isProcessing ? (
            <>
              <svg className="h-5 w-5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Merging PDFs...</span>
            </>
          ) : (
            <>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
              </svg>
              <span>Merge PDFs</span>
            </>
          )}
        </button>

        {files.length < 2 && !isProcessing && (
          <p className="mt-2 text-xs text-slate-500">
            Please add at least 2 PDF files to enable merging.
          </p>
        )}
      </div>

      {/* Security note */}
      <div className="mt-12 flex items-center justify-center gap-2 text-xs text-slate-400">
        <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
        </svg>
        <span>Your files are processed securely and not stored on our servers.</span>
      </div>
    </div>
  );
}
