import type { ConversionOptions, ImageFile } from "@/app/page";
import { parallelMap } from "./parallel-processor";
import { convertImageAction } from "@/app/actions/convert";

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
// Vercel / serverless payload limit (~4.5MB safely)
const MAX_SERVER_PAYLOAD = 4 * 1024 * 1024;

/**
 * Converts an image file. 
 * Automatically chooses between Server Action (Sharp) and Client-side (Canvas)
 * based on file size to avoid "413 Payload Too Large" errors on Vercel.
 */
export async function convertImage(
  file: File,
  options: ConversionOptions
): Promise<ConversionResult> {
  // If file is too large for the server, use client-side conversion immediately
  if (file.size > MAX_SERVER_PAYLOAD) {
    console.info(`Image ${file.name} is too large (${(file.size / 1024 / 1024).toFixed(2)}MB) for the server. Using client-side conversion…`);
    return convertImageClientSide(file, options);
  }

  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("options", JSON.stringify(options));

    const result = await convertImageAction(formData);

    if (!result.success || !result.data) {
      throw new Error(result.error || "Failed to convert image");
    }

    // Convert base64 to blob
    const binary = atob(result.data);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }

    const blob = new Blob([bytes], { type: result.contentType });
    const url = URL.createObjectURL(blob);

    return {
      blob,
      url,
      size: result.convertedSize || blob.size,
      originalSize: result.originalSize || file.size,
    };
  } catch (error) {
    console.warn(`Server conversion failed for ${file.name}. Falling back to client-side.`, error);
    // Fallback to client-side if server fails for any reason
    return convertImageClientSide(file, options);
  }
}

/**
 * Client-side fallback conversion using Canvas API
 * This runs entirely in the browser, bypassing all server limits.
 */
async function convertImageClientSide(
  file: File,
  options: ConversionOptions
): Promise<ConversionResult> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      
      const canvas = document.createElement("canvas");
      let width = img.width;
      let height = img.height;
      
      // Calculate dimensions (simplified version of server logic)
      if (options.maxWidth > 0 && width > options.maxWidth) {
        const ratio = options.maxWidth / width;
        width = options.maxWidth;
        height = height * ratio;
      }
      if (options.maxHeight > 0 && height > options.maxHeight) {
        const ratio = options.maxHeight / height;
        height = options.maxHeight;
        width = width * ratio;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Could not create canvas context"));
        return;
      }
      
      // Draw and convert
      ctx.drawImage(img, 0, 0, width, height);
      
      const mimeType = getMimeType(options.format);
      const quality = options.quality / 100;
      
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Canvas toBlob failed"));
            return;
          }
          const blobUrl = URL.createObjectURL(blob);
          resolve({
            blob,
            url: blobUrl,
            size: blob.size,
            originalSize: file.size,
          });
        },
        mimeType,
        quality
      );
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image for client-side conversion"));
    };
    
    img.src = url;
  });
}

/**
 * Convert multiple images in parallel using individual API/Action calls
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
 * Convert multiple images in parallel using the batch API
 * Note: Should be used with caution for very large images
 */
export async function convertImagesBatch(
  images: { id: string; file: File }[],
  options: ConversionOptions,
  onProgress?: (completed: number, total: number) => void
): Promise<BatchConversionResult[]> {
  // Batch API is more limited by body size, so we'll fallback to parallel for large batches
  const totalSize = images.reduce((acc, img) => acc + img.file.size, 0);
  if (totalSize > MAX_SERVER_PAYLOAD || images.some(img => img.file.size > MAX_SERVER_PAYLOAD / 2)) {
    return convertImagesParallel(images, options, onProgress);
  }

  const results: BatchConversionResult[] = [];
  const mimeType = getMimeType(options.format);
  const chunks = chunkArray(images, BATCH_SIZE);
  let totalCompleted = 0;
  
  for (const chunk of chunks) {
    const formData = new FormData();
    formData.append("options", JSON.stringify(options));
    for (const { id, file } of chunk) {
      formData.append('file-' + id, file);
    }

    try {
      const response = await fetch("/api/convert-batch", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        // Fallback to individual for this chunk
        const chunkResults = await convertImagesParallel(chunk, options);
        results.push(...chunkResults);
        totalCompleted += chunk.length;
        onProgress?.(totalCompleted, images.length);
        continue;
      }

      const data = await response.json();
      for (const result of data.results) {
        if (result.success && result.data) {
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
      // Fallback
      const chunkResults = await convertImagesParallel(chunk, options);
      results.push(...chunkResults);
      totalCompleted += chunk.length;
      onProgress?.(totalCompleted, images.length);
    }
  }

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
