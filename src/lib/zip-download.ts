import JSZip from "jszip";
import { saveAs } from "file-saver";
import type { ImageFile, OutputFormat } from "@/app/page";

const FORMAT_EXTENSIONS: Record<OutputFormat, string> = {
  webp: ".webp",
  avif: ".avif",
  png: ".png",
  jpeg: ".jpg",
};

/**
 * Creates a ZIP file from converted images and triggers download
 */
export async function downloadAsZip(
  images: ImageFile[],
  format: OutputFormat,
  zipFileName: string = "converted-images"
): Promise<void> {
  const convertedImages = images.filter(
    (img) => img.status === "done" && img.convertedBlob
  );

  if (convertedImages.length === 0) {
    throw new Error("No converted images to download");
  }

  const zip = new JSZip();
  const extension = FORMAT_EXTENSIONS[format];

  // Add each converted image to the ZIP
  for (const image of convertedImages) {
    if (image.convertedBlob) {
      const fileName = image.name.replace(/\.[^/.]+$/, "") + extension;
      zip.file(fileName, image.convertedBlob);
    }
  }

  // Generate ZIP blob
  const zipBlob = await zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });

  // Trigger download
  const timestamp = new Date().toISOString().slice(0, 10);
  saveAs(zipBlob, `${zipFileName}-${timestamp}.zip`);
}

/**
 * Downloads a single converted image
 */
export function downloadSingleImage(image: ImageFile, format: OutputFormat): void {
  if (!image.convertedUrl || !image.convertedBlob) {
    throw new Error("Image has not been converted yet");
  }

  const extension = FORMAT_EXTENSIONS[format];
  const fileName = image.name.replace(/\.[^/.]+$/, "") + extension;
  saveAs(image.convertedBlob, fileName);
}
