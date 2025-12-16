import type { ConversionOptions, ImageFile } from "@/app/page";
import { parallelMap } from "./parallel-processor";

export interface ConversionResult {
  blob: Blob;
  url: string;
  size: number;
  originalSize: number;
}

export interface BatchConversionResult {
  id: string;
  success: boolean;
  blob?: Blob;
  url?: string;
  size?: number;
  originalSize?: number;
  error?: string;
}

// Optimal concurrency for client-side - balances speed with browser limits
const CLIENT_CONCURRENCY = 6;
// Max images per batch request - prevents oversized requests
const BATCH_SIZE = 10;

/**
 * Converts an image file using Sharp via API route
 * High quality, efficient conversion powered by libvips
 */
export async function convertImage(
  file: File,
  options: ConversionOptions
): Promise<ConversionResult> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("options", JSON.stringify(options));

  const response = await fetch("/api/convert", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(error.error || "Failed to convert image");
  }

  // Get size info from headers
  const originalSize = parseInt(response.headers.get("X-Original-Size") || "0", 10);
  const convertedSize = parseInt(response.headers.get("X-Converted-Size") || "0", 10);
  const contentType = response.headers.get("Content-Type") || "image/webp";

  // Get the blob
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);

  return {
    blob: new Blob([blob], { type: contentType }),
    url,
    size: convertedSize || blob.size,
    originalSize: originalSize || file.size,
  };
}

/**
 * Convert multiple images in parallel using the batch API
 * This is the fastest method for bulk conversions
 */
export async function convertImagesBatch(
  images: { id: string; file: File }[],
  options: ConversionOptions,
  onProgress?: (completed: number, total: number) => void
): Promise<BatchConversionResult[]> {
  const results: BatchConversionResult[] = [];
  const mimeType = getMimeType(options.format);
  
  // Split into chunks to avoid oversized requests
  const chunks = chunkArray(images, BATCH_SIZE);
  let totalCompleted = 0;
  
  // Process chunks in parallel with controlled concurrency
  for (const chunk of chunks) {
    const formData = new FormData();
    formData.append("options", JSON.stringify(options));
    
    // Add all files with their IDs
    for (const { id, file } of chunk) {
      formData.append('file-' + id, file);
    }

    try {
      const response = await fetch("/api/convert-batch", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        // If batch fails, mark all in chunk as failed
        for (const { id } of chunk) {
          results.push({
            id,
            success: false,
            error: "Batch conversion failed",
          });
        }
        totalCompleted += chunk.length;
        onProgress?.(totalCompleted, images.length);
        continue;
      }

      const data = await response.json();
      
      // Process each result
      for (const result of data.results) {
        if (result.success && result.data) {
          // Convert base64 to blob
          const binary = atob(result.data);
          const bytes = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
          }
          const blob = new Blob([bytes], { type: mimeType });
          const url = URL.createObjectURL(blob);

          results.push({
            id: result.id,
            success: true,
            blob,
            url,
            size: result.size,
            originalSize: result.originalSize,
          });
        } else {
          results.push({
            id: result.id,
            success: false,
            error: result.error || "Conversion failed",
          });
        }
        totalCompleted++;
        onProgress?.(totalCompleted, images.length);
      }
    } catch (error) {
      // Network error - mark all in chunk as failed
      for (const { id } of chunk) {
        results.push({
          id,
          success: false,
          error: error instanceof Error ? error.message : "Network error",
        });
        totalCompleted++;
        onProgress?.(totalCompleted, images.length);
      }
    }
  }

  return results;
}

/**
 * Convert images in parallel using individual API calls
 * Good for smaller batches or when batch API isn't available
 */
export async function convertImagesParallel(
  images: { id: string; file: File }[],
  options: ConversionOptions,
  onProgress?: (completed: number, total: number) => void,
  onImageComplete?: (id: string, result: BatchConversionResult) => void
): Promise<BatchConversionResult[]> {
  const results = await parallelMap(
    images,
    async ({ id, file }) => {
      try {
        const result = await convertImage(file, options);
        const batchResult: BatchConversionResult = {
          id,
          success: true,
          blob: result.blob,
          url: result.url,
          size: result.size,
          originalSize: result.originalSize,
        };
        onImageComplete?.(id, batchResult);
        return batchResult;
      } catch (error) {
        const batchResult: BatchConversionResult = {
          id,
          success: false,
          error: error instanceof Error ? error.message : "Conversion failed",
        };
        onImageComplete?.(id, batchResult);
        return batchResult;
      }
    },
    {
      concurrency: CLIENT_CONCURRENCY,
      onProgress,
    }
  );

  return results;
}

/**
 * Get file extension for output format
 */
export function getFileExtension(format: ConversionOptions["format"]): string {
  switch (format) {
    case "webp":
      return ".webp";
    case "avif":
      return ".avif";
    case "png":
      return ".png";
    case "jpeg":
      return ".jpg";
    default:
      return ".webp";
  }
}

/**
 * Get MIME type for format
 */
export function getMimeType(format: ConversionOptions["format"]): string {
  switch (format) {
    case "webp":
      return "image/webp";
    case "avif":
      return "image/avif";
    case "png":
      return "image/png";
    case "jpeg":
      return "image/jpeg";
    default:
      return "image/webp";
  }
}

/**
 * Validates if a file is a supported image type
 */
export function isSupportedImageType(file: File): boolean {
  const supportedTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/bmp",
    "image/tiff",
    "image/avif",
  ];
  return supportedTypes.includes(file.type);
}

/**
 * Split array into chunks
 */
function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}
