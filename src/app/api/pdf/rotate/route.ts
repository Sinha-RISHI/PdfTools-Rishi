import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, degrees } from "pdf-lib";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB
const VALID_DEGREES = [0, 90, 180, 270];

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
        { error: "No PDF file provided. Please upload a file to rotate." },
        { status: 400 }
      );
    }

    if (files.length > 1) {
      return NextResponse.json(
        { error: "Rotate PDF only accepts one file at a time." },
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

    const rotationsRaw = formData.get("rotations");
    if (!rotationsRaw || typeof rotationsRaw !== "string") {
      return NextResponse.json(
        { error: "No rotation data provided." },
        { status: 400 }
      );
    }

    let rotations: Record<string, number>;
    try {
      rotations = JSON.parse(rotationsRaw);
    } catch {
      return NextResponse.json(
        { error: "Invalid rotation data format." },
        { status: 400 }
      );
    }

    if (typeof rotations !== "object" || rotations === null || Array.isArray(rotations)) {
      return NextResponse.json(
        { error: "Rotations data must be a JSON object mapping page indices to degree values." },
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
          { error: `File "${file.name}" is password-protected or encrypted. Please decrypt it before rotating.` },
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

    const entries = Object.entries(rotations);
    if (entries.length === 0) {
      return NextResponse.json(
        { error: "No rotation changes were specified." },
        { status: 400 }
      );
    }

    let hasNonZeroRotation = false;

    for (const [key, value] of entries) {
      const pageIdx = parseInt(key, 10);
      if (isNaN(pageIdx) || pageIdx < 0 || pageIdx >= totalPages || String(pageIdx) !== key) {
        return NextResponse.json(
          { error: `Invalid page index "${key}". Must be between 0 and ${totalPages - 1}.` },
          { status: 400 }
        );
      }

      if (typeof value !== "number" || !VALID_DEGREES.includes(value)) {
        return NextResponse.json(
          { error: `Invalid rotation angle ${value} for page ${pageIdx + 1}. Must be 0, 90, 180, or 270.` },
          { status: 400 }
        );
      }

      if (value !== 0) {
        hasNonZeroRotation = true;
      }
    }

    if (!hasNonZeroRotation) {
      return NextResponse.json(
        { error: "No rotation changes were specified." },
        { status: 400 }
      );
    }

    // Apply rotation for each page in rotations map
    const pages = pdfDoc.getPages();
    for (const [key, value] of entries) {
      const pageIdx = parseInt(key, 10);
      const page = pages[pageIdx];
      if (page) {
        page.setRotation(degrees(value));
      }
    }

    const pdfBytes = await pdfDoc.save();

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="rotated.pdf"',
        "Content-Length": pdfBytes.byteLength.toString(),
      },
    });
  } catch (error: any) {
    console.error("Error in PDF rotate route:", error);
    return NextResponse.json(
      { error: error?.message || "An unexpected error occurred while rotating your PDF file." },
      { status: 500 }
    );
  }
}
