import type { ConversionOptions } from "@/app/page";

export interface ConversionResult {
  blob: Blob;
  url: string;
  size: number;
  originalSize: number;
}

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
