import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, StandardFonts, degrees, rgb } from "pdf-lib";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB
const MAX_TEXT_LENGTH = 100;

/** Parse a 6-digit hex color string (#rrggbb or rrggbb) into { r, g, b } in [0,1] range. */
function parseHexColor(hex: string): { r: number; g: number; b: number } | null {
  const clean = hex.replace(/^#/, "").toLowerCase();
  if (!/^[0-9a-f]{6}$/.test(clean)) return null;
  return {
    r: parseInt(clean.substring(0, 2), 16) / 255,
    g: parseInt(clean.substring(2, 4), 16) / 255,
    b: parseInt(clean.substring(4, 6), 16) / 255,
  };
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // ---- File extraction ----
    let rawFiles = formData.getAll("file");
    if (rawFiles.length === 0) rawFiles = formData.getAll("files");

    const files: File[] = [];
    for (const item of rawFiles) {
      if (item && typeof item === "object" && "arrayBuffer" in item && "name" in item) {
        files.push(item as File);
      }
    }

    if (files.length === 0) {
      return NextResponse.json(
        { error: "No PDF file provided. Please upload a file to watermark." },
        { status: 400 }
      );
    }
    if (files.length > 1) {
      return NextResponse.json(
        { error: "Watermark PDF only accepts one file at a time." },
        { status: 400 }
      );
    }

    const file = files[0];

    // ---- File size & type ----
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

    // ---- Watermark settings validation ----
    const rawText = formData.get("text");
    if (!rawText || typeof rawText !== "string" || rawText.trim() === "") {
      return NextResponse.json(
        { error: "Watermark text is required and cannot be empty." },
        { status: 400 }
      );
    }
    const text = rawText.trim();
    if (text.length > MAX_TEXT_LENGTH) {
      return NextResponse.json(
        { error: `Watermark text must be ${MAX_TEXT_LENGTH} characters or fewer.` },
        { status: 400 }
      );
    }

    const rawFontSize = Number(formData.get("fontSize"));
    if (isNaN(rawFontSize) || rawFontSize < 12 || rawFontSize > 120) {
      return NextResponse.json(
        { error: "Font size must be between 12 and 120." },
        { status: 400 }
      );
    }
    const fontSize = rawFontSize;

    const rawOpacity = Number(formData.get("opacity"));
    if (isNaN(rawOpacity) || rawOpacity < 10 || rawOpacity > 100) {
      return NextResponse.json(
        { error: "Opacity must be between 10 and 100." },
        { status: 400 }
      );
    }
    const opacity = rawOpacity / 100; // pdf-lib uses 0–1

    const rawRotation = Number(formData.get("rotation"));
    if (isNaN(rawRotation) || rawRotation < -90 || rawRotation > 90) {
      return NextResponse.json(
        { error: "Rotation must be between -90 and 90 degrees." },
        { status: 400 }
      );
    }
    const rotationDeg = rawRotation;

    const rawColor = formData.get("color");
    if (!rawColor || typeof rawColor !== "string") {
      return NextResponse.json(
        { error: "Color value is required." },
        { status: 400 }
      );
    }
    const colorRgb = parseHexColor(rawColor);
    if (!colorRgb) {
      return NextResponse.json(
        { error: `Invalid color value "${rawColor}". Must be a hex color like #808080.` },
        { status: 400 }
      );
    }

    const rawPosition = formData.get("position");
    if (rawPosition !== "diagonal" && rawPosition !== "tiled") {
      return NextResponse.json(
        { error: "Position must be 'diagonal' or 'tiled'." },
        { status: 400 }
      );
    }
    const position = rawPosition;

    // ---- Load PDF ----
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
          {
            error: `File "${file.name}" is password-protected or encrypted. Please decrypt it before adding a watermark.`,
          },
          { status: 422 }
        );
      }
      return NextResponse.json(
        {
          error: `Failed to parse "${file.name}". The file may be corrupted or an invalid PDF.`,
        },
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

    // ---- Embed font ----
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // ---- Draw watermark on each page ----
    const pages = pdfDoc.getPages();
    for (const page of pages) {
      const { width, height } = page.getSize();

      // Measure text width at the target font size
      const textWidth = font.widthOfTextAtSize(text, fontSize);
      const textHeight = font.heightAtSize(fontSize);

      if (position === "diagonal") {
        // Single watermark centered on the page
        // We position the text at the center, accounting for rotation
        const x = width / 2 - textWidth / 2;
        const y = height / 2 - textHeight / 2;

        page.drawText(text, {
          x,
          y,
          size: fontSize,
          font,
          color: rgb(colorRgb.r, colorRgb.g, colorRgb.b),
          opacity,
          rotate: degrees(rotationDeg),
        });
      } else {
        // Tiled: draw a grid of watermarks across the entire page.
        // Use the diagonal text width as the cell spacing so tiles don't overlap too much.
        const diagonalLen = Math.sqrt(textWidth * textWidth + textHeight * textHeight);
        const cellW = Math.max(diagonalLen * 1.4, 120);
        const cellH = Math.max(diagonalLen * 0.8, 80);

        // Extend slightly beyond page bounds so edge tiles aren't clipped
        const startX = -cellW;
        const startY = -cellH;

        for (let tileY = startY; tileY < height + cellH; tileY += cellH) {
          for (let tileX = startX; tileX < width + cellW; tileX += cellW) {
            // Center the text within the tile
            const x = tileX + cellW / 2 - textWidth / 2;
            const y = tileY + cellH / 2 - textHeight / 2;

            page.drawText(text, {
              x,
              y,
              size: fontSize,
              font,
              color: rgb(colorRgb.r, colorRgb.g, colorRgb.b),
              opacity,
              rotate: degrees(rotationDeg),
            });
          }
        }
      }
    }

    // ---- Save & respond ----
    const pdfBytes = await pdfDoc.save();

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="watermarked.pdf"',
        "Content-Length": pdfBytes.byteLength.toString(),
      },
    });
  } catch (error: any) {
    console.error("Error in PDF watermark route:", error);
    return NextResponse.json(
      {
        error:
          error?.message ||
          "An unexpected error occurred while watermarking your PDF file.",
      },
      { status: 500 }
    );
  }
}
