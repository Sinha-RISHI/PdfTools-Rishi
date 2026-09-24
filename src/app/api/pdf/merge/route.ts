import { NextRequest, NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB
const MAX_FILES = 15;
const MIN_FILES = 2;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Support field name 'files' or 'file'
    let rawFiles = formData.getAll("files");
    if (rawFiles.length === 0) {
      rawFiles = formData.getAll("file");
    }

    const files: File[] = [];
    for (const item of rawFiles) {
      if (item && typeof item === "object" && "arrayBuffer" in item && "name" in item) {
        files.push(item as File);
      }
    }

    if (files.length < MIN_FILES) {
      return NextResponse.json(
        { error: "At least 2 PDF files are required to merge." },
        { status: 400 }
      );
    }

    if (files.length > MAX_FILES) {
      return NextResponse.json(
        { error: `Cannot merge more than ${MAX_FILES} files at once.` },
        { status: 400 }
      );
    }

    // Check individual file sizes and basic content type
    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `File "${file.name}" exceeds the maximum 20MB limit.` },
          { status: 400 }
        );
      }

      // Check MIME type or extension
      const isPdfMime = file.type === "application/pdf" || file.type === "application/x-pdf";
      const isPdfExt = file.name.toLowerCase().endsWith(".pdf");
      if (!isPdfMime && !isPdfExt) {
        return NextResponse.json(
          { error: `File "${file.name}" is not a valid PDF file.` },
          { status: 400 }
        );
      }
    }

    const mergedPdf = await PDFDocument.create();

    // Process each PDF file in memory
    for (const file of files) {
      let arrayBuffer: ArrayBuffer;
      try {
        arrayBuffer = await file.arrayBuffer();
      } catch (err) {
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
            { error: `File "${file.name}" is password-protected or encrypted. Please decrypt it before merging.` },
            { status: 422 }
          );
        }
        return NextResponse.json(
          { error: `Failed to parse "${file.name}". The file may be corrupted or an invalid PDF.` },
          { status: 422 }
        );
      }

      try {
        const pageIndices = pdfDoc.getPageIndices();
        const copiedPages = await mergedPdf.copyPages(pdfDoc, pageIndices);
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      } catch (err: any) {
        return NextResponse.json(
          { error: `Failed to copy pages from "${file.name}". ${err?.message || ""}`.trim() },
          { status: 422 }
        );
      }
    }

    const pdfBytes = await mergedPdf.save();

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="merged.pdf"',
        "Content-Length": pdfBytes.byteLength.toString(),
      },
    });
  } catch (error: any) {
    console.error("Error in PDF merge route:", error);
    return NextResponse.json(
      { error: error?.message || "An unexpected error occurred while merging your PDF files." },
      { status: 500 }
    );
  }
}
