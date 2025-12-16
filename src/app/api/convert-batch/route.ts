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

interface BatchResult {
  id: string;
  success: boolean;
  data?: string; // Base64 encoded image
  size?: number;
  originalSize?: number;
  error?: string;
}

const MIME_TYPES: Record<OutputFormat, string> = {
  webp: "image/webp",
  avif: "image/avif",
  png: "image/png",
  jpeg: "image/jpeg",
};

// Maximum concurrent conversions on server (leverages Sharp's thread pool)
const MAX_SERVER_CONCURRENCY = 8;

/**
 * Batch convert endpoint - processes multiple images in parallel
 * This is more efficient than multiple single requests due to:
 * 1. Reduced HTTP overhead
 * 2. Shared Sharp thread pool
 * 3. Better memory management
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const optionsJson = formData.get("options") as string | null;
    
    // Get all files from formData
    const files: { id: string; file: File }[] = [];
    for (const [key, value] of formData.entries()) {
      if (key.startsWith("file-") && value instanceof File) {
        const id = key.replace("file-", "");
        files.push({ id, file: value });
      }
    }

    if (files.length === 0) {
      return NextResponse.json(
        { error: "No files provided" },
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

    // Process all images in parallel with controlled concurrency
    const results = await processInParallel(files, options, MAX_SERVER_CONCURRENCY);

    return NextResponse.json({
      success: true,
      results,
      format: options.format,
      mimeType: MIME_TYPES[options.format],
    });
  } catch (error) {
    console.error("Batch conversion error:", error);
    return NextResponse.json(
      { error: "Failed to process images" },
      { status: 500 }
    );
  }
}

/**
 * Process multiple images in parallel with concurrency limit
 */
async function processInParallel(
  files: { id: string; file: File }[],
  options: ConversionOptions,
  concurrency: number
): Promise<BatchResult[]> {
  const results: BatchResult[] = [];
  const queue = [...files];
  const inProgress: Promise<void>[] = [];

  const processOne = async (item: { id: string; file: File }) => {
    const result = await convertSingleImage(item.id, item.file, options);
    results.push(result);
  };

  while (queue.length > 0 || inProgress.length > 0) {
    // Start new tasks up to concurrency limit
    while (queue.length > 0 && inProgress.length < concurrency) {
      const item = queue.shift()!;
      const promise = processOne(item).then(() => {
        // Remove this promise from inProgress when done
        const index = inProgress.indexOf(promise);
        if (index > -1) inProgress.splice(index, 1);
      });
      inProgress.push(promise);
    }

    // Wait for at least one to complete
    if (inProgress.length > 0) {
      await Promise.race(inProgress);
    }
  }

  return results;
}

/**
 * Convert a single image
 */
async function convertSingleImage(
  id: string,
  file: File,
  options: ConversionOptions
): Promise<BatchResult> {
  try {
    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const inputBuffer = Buffer.from(arrayBuffer);
    const originalSize = inputBuffer.length;

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
          .webp({ quality: options.quality, effort: 4 }) // Reduced effort for speed
          .toBuffer();
        break;
      case "avif":
        outputBuffer = await pipeline
          .avif({ quality: options.quality, effort: 4 }) // Reduced effort for speed
          .toBuffer();
        break;
      case "png":
        outputBuffer = await pipeline
          .png({ compressionLevel: Math.min(6, Math.round((100 - options.quality) / 10)) })
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

    // Return base64 encoded result
    return {
      id,
      success: true,
      data: outputBuffer.toString("base64"),
      size: outputBuffer.length,
      originalSize,
    };
  } catch (error) {
    console.error('Failed to convert image ' + id + ':', error);
    return {
      id,
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
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
