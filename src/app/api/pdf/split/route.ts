import { NextRequest, NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";
import JSZip from "jszip";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB
const MAX_INDIVIDUAL_PAGES = 200;

export function parsePageRanges(rangeStr: string, totalPages: number): { pageIndices: number[]; error: string | null } {
  if (!rangeStr || !rangeStr.trim()) {
    return { pageIndices: [], error: "Please enter pages or ranges to extract (e.g. 1-3, 5)." };
  }

  const parts = rangeStr.split(",").map((s) => s.trim()).filter(Boolean);
  if (parts.length === 0) {
    return { pageIndices: [], error: "Please enter pages or ranges to extract." };
  }

  const pages: number[] = [];

  for (const part of parts) {
    if (/^\d+$/.test(part)) {
      const pageNum = parseInt(part, 10);
      if (pageNum < 1 || pageNum > totalPages) {
        return {
          pageIndices: [],
          error: `Page ${pageNum} doesn't exist — this PDF has ${totalPages} page${totalPages === 1 ? "" : "s"}.`,
        };
      }
      pages.push(pageNum);
    } else if (/^\d+\s*-\s*\d+$/.test(part)) {
      const [startStr, endStr] = part.split("-").map((s) => s.trim());
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);

      if (start > end) {
        return {
          pageIndices: [],
          error: `Invalid range "${part}": start page cannot be greater than end page.`,
        };
      }
      if (start < 1 || end > totalPages) {
        const invalidPage = start < 1 ? start : end;
        return {
          pageIndices: [],
          error: `Page ${invalidPage} doesn't exist — this PDF has ${totalPages} page${totalPages === 1 ? "" : "s"}.`,
        };
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    } else {
      return {
        pageIndices: [],
        error: `Invalid format: "${part}". Use numbers or ranges like 1-3, 5.`,
      };
    }
  }

  const uniquePages = Array.from(new Set(pages));
  if (uniquePages.length === 0) {
    return { pageIndices: [], error: "No valid pages were specified." };
  }

  const pageIndices = uniquePages.map((p) => p - 1);
  return { pageIndices, error: null };
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    let rawFiles = formData.getAll("file");
    if (rawFiles.length === 0) {
      rawFiles = formData.getAll("files");
    }

    const files: File[] = [];
    for (const item of rawFiles) {
      if (item && typeof item === "object" && "arrayBuffer" in item && "name" in item) {
        files.push(item as File);
      }
    }

    if (files.length === 0) {
      return NextResponse.json(
        { error: "No PDF file provided. Please upload a file to split." },
        { status: 400 }
      );
    }

    if (files.length > 1) {
      return NextResponse.json(
        { error: "Split PDF only accepts one file at a time." },
        { status: 400 }
      );
    }

    const file = files[0];

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File "${file.name}" exceeds the maximum 20MB limit.` },
        { status: 400 }
      );
    }

    const isPdfMime = file.type === "application/pdf" || file.type === "application/x-pdf";
    const isPdfExt = file.name.toLowerCase().endsWith(".pdf");
    if (!isPdfMime && !isPdfExt) {
      return NextResponse.json(
        { error: `File "${file.name}" is not a valid PDF file.` },
        { status: 400 }
      );
    }

    const mode = (formData.get("mode") as string) || "extract";
    if (mode !== "extract" && mode !== "individual") {
      return NextResponse.json(
        { error: "Invalid split mode specified. Must be 'extract' or 'individual'." },
        { status: 400 }
      );
    }

    let arrayBuffer: ArrayBuffer;
    try {
      arrayBuffer = await file.arrayBuffer();
    } catch {
      return NextResponse.json(
        { error: `Failed to read content from file "${file.name}".` },
        { status: 400 }
      );
    }

    let pdfDoc: PDFDocument;
    try {
      pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: false });
    } catch (err: any) {
      const errorMsg = err?.message || "";
      if (errorMsg.includes("encrypted") || errorMsg.includes("password")) {
        return NextResponse.json(
          { error: `File "${file.name}" is password-protected or encrypted. Please decrypt it before splitting.` },
          { status: 422 }
        );
      }
      return NextResponse.json(
        { error: `Failed to parse "${file.name}". The file may be corrupted or an invalid PDF.` },
        { status: 422 }
      );
    }

    const totalPages = pdfDoc.getPageCount();
    if (totalPages === 0) {
      return NextResponse.json(
        { error: "The uploaded PDF document contains no pages." },
        { status: 400 }
      );
    }

    if (mode === "extract") {
      const rangesStr = (formData.get("ranges") as string) || "";
      const { pageIndices, error } = parsePageRanges(rangesStr, totalPages);

      if (error || pageIndices.length === 0) {
        return NextResponse.json(
          { error: error || "Invalid page range specified." },
          { status: 400 }
        );
      }

      const newPdf = await PDFDocument.create();
      const copiedPages = await newPdf.copyPages(pdfDoc, pageIndices);
      copiedPages.forEach((page) => newPdf.addPage(page));

      const pdfBytes = await newPdf.save();

      return new NextResponse(Buffer.from(pdfBytes), {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": 'attachment; filename="split.pdf"',
          "Content-Length": pdfBytes.byteLength.toString(),
        },
      });
    } else {
      // Individual mode
      if (totalPages > MAX_INDIVIDUAL_PAGES) {
        return NextResponse.json(
          {
            error: `Cannot split PDFs with more than ${MAX_INDIVIDUAL_PAGES} pages into individual files. (This document has ${totalPages} pages)`,
          },
          { status: 400 }
        );
      }

      const zip = new JSZip();

      for (let i = 0; i < totalPages; i++) {
        const singlePagePdf = await PDFDocument.create();
        const [copiedPage] = await singlePagePdf.copyPages(pdfDoc, [i]);
        singlePagePdf.addPage(copiedPage);

        const bytes = await singlePagePdf.save();
        zip.file(`page-${i + 1}.pdf`, bytes);
      }

      const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });

      return new NextResponse(Buffer.from(zipBuffer), {
        status: 200,
        headers: {
          "Content-Type": "application/zip",
          "Content-Disposition": 'attachment; filename="split-pages.zip"',
          "Content-Length": zipBuffer.byteLength.toString(),
        },
      });
    }
  } catch (error: any) {
    console.error("Error in PDF split route:", error);
    return NextResponse.json(
      { error: error?.message || "An unexpected error occurred while splitting your PDF file." },
      { status: 500 }
    );
  }
}
