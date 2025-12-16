import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

export type OutputFormat = "webp" | "avif" | "png" | "jpeg";

interface ConversionOptions {
  quality: number;
  maxWidth: number;
  maxHeight: number;
  maintainAspectRatio: boolean;
  format: OutputFormat;
}

const MIME_TYPES: Record<OutputFormat, string> = {
  webp: "image/webp",
  avif: "image/avif",
  png: "image/png",
  jpeg: "image/jpeg",
};

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const optionsJson = formData.get("options") as string | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Parse options
    const options: ConversionOptions = optionsJson
      ? JSON.parse(optionsJson)
      : {
          quality: 80,
          maxWidth: 1920,
          maxHeight: 1080,
          maintainAspectRatio: true,
          format: "webp",
        };

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const inputBuffer = Buffer.from(arrayBuffer);

    // Create Sharp instance
    let pipeline = sharp(inputBuffer);

    // Get image metadata
    const metadata = await pipeline.metadata();

    // Calculate resize dimensions
    const resizeOptions = calculateResizeDimensions(
      metadata.width || 0,
      metadata.height || 0,
      options.maxWidth,
      options.maxHeight,
      options.maintainAspectRatio
    );

    // Apply resize if needed
    if (resizeOptions.width && resizeOptions.height) {
      pipeline = pipeline.resize(resizeOptions.width, resizeOptions.height, {
        fit: options.maintainAspectRatio ? "inside" : "fill",
        withoutEnlargement: true,
      });
    }

    // Convert to target format with quality settings
    let outputBuffer: Buffer;
    switch (options.format) {
      case "webp":
        outputBuffer = await pipeline
          .webp({ quality: options.quality, effort: 6 })
          .toBuffer();
        break;
      case "avif":
        outputBuffer = await pipeline
          .avif({ quality: options.quality, effort: 6 })
          .toBuffer();
        break;
      case "png":
        outputBuffer = await pipeline
          .png({ compressionLevel: Math.round((100 - options.quality) / 10) })
          .toBuffer();
        break;
      case "jpeg":
        outputBuffer = await pipeline
          .jpeg({ quality: options.quality, mozjpeg: true })
          .toBuffer();
        break;
      default:
        outputBuffer = await pipeline
          .webp({ quality: options.quality })
          .toBuffer();
    }

    // Return the converted image
    return new NextResponse(new Uint8Array(outputBuffer), {
      headers: {
        "Content-Type": MIME_TYPES[options.format],
        "Content-Length": outputBuffer.length.toString(),
        "X-Original-Size": inputBuffer.length.toString(),
        "X-Converted-Size": outputBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Conversion error:", error);
    return NextResponse.json(
      { error: "Failed to convert image" },
      { status: 500 }
    );
  }
}

function calculateResizeDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number,
  maintainAspectRatio: boolean
): { width: number | undefined; height: number | undefined } {
  // If no constraints or image already smaller, no resize needed
  if (
    (maxWidth === 0 || originalWidth <= maxWidth) &&
    (maxHeight === 0 || originalHeight <= maxHeight)
  ) {
    return { width: undefined, height: undefined };
  }

  if (!maintainAspectRatio) {
    return {
      width: maxWidth > 0 ? Math.min(originalWidth, maxWidth) : undefined,
      height: maxHeight > 0 ? Math.min(originalHeight, maxHeight) : undefined,
    };
  }

  // Calculate with aspect ratio
  const aspectRatio = originalWidth / originalHeight;
  let width = originalWidth;
  let height = originalHeight;

  if (maxWidth > 0 && width > maxWidth) {
    width = maxWidth;
    height = width / aspectRatio;
  }

  if (maxHeight > 0 && height > maxHeight) {
    height = maxHeight;
    width = height * aspectRatio;
  }

  return {
    width: Math.round(width),
    height: Math.round(height),
  };
}

