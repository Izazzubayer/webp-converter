"use server";

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

/**
 * Server Action for image conversion.
 * Bypasses the 4MB limit for normal API routes in App Router.
 */
export async function convertImageAction(formData: FormData) {
  try {
    const file = formData.get("file") as File | null;
    const optionsJson = formData.get("options") as string | null;

    if (!file) {
      throw new Error("No file provided");
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

    // Return the converted image as base64 string
    // Bypassing directly returning a Blob because Server Actions 
    // are better with serializable data or specific return types.
    return {
      success: true,
      data: outputBuffer.toString("base64"),
      contentType: MIME_TYPES[options.format],
      originalSize: inputBuffer.length,
      convertedSize: outputBuffer.length,
    };
  } catch (error) {
    console.error("Conversion error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to convert image",
    };
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
