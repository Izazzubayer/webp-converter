"use client";

import { useState, useCallback } from "react";
import { ImageUploader } from "@/components/image-uploader";
import { ImagePreviewGrid } from "@/components/image-preview-grid";
import { ConversionToolbar } from "@/components/conversion-toolbar";
import { Header } from "@/components/header";
import { toast } from "sonner";
import { convertImage } from "@/lib/image-converter";
import { downloadAsZip } from "@/lib/zip-download";

export interface ImageFile {
  id: string;
  file: File;
  preview: string;
  name: string;
  size: number;
  status: "pending" | "converting" | "done" | "error";
  convertedBlob?: Blob;
  convertedSize?: number;
  convertedUrl?: string;
  outputFormat?: OutputFormat;
  // Track settings used for conversion to detect stale conversions
  convertedWithSettings?: {
    quality: number;
    maxWidth: number;
    maxHeight: number;
    format: OutputFormat;
  };
}

export type OutputFormat = "webp" | "avif" | "png" | "jpeg";

export interface ConversionOptions {
  quality: number;
  maxWidth: number;
  maxHeight: number;
  maintainAspectRatio: boolean;
  format: OutputFormat;
}

const defaultOptions: ConversionOptions = {
  quality: 80,
  maxWidth: 1920,
  maxHeight: 1080,
  maintainAspectRatio: true,
  format: "webp",
};

// Helper to check if an image needs reconversion (settings changed)
export function isConversionStale(image: ImageFile, currentOptions: ConversionOptions): boolean {
  if (image.status !== "done" || !image.convertedWithSettings) return false;
  
  const { quality, maxWidth, maxHeight, format } = image.convertedWithSettings;
  return (
    quality !== currentOptions.quality ||
    maxWidth !== currentOptions.maxWidth ||
    maxHeight !== currentOptions.maxHeight ||
    format !== currentOptions.format
  );
}

export default function Home() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [options, setOptions] = useState<ConversionOptions>(defaultOptions);
  const [isConverting, setIsConverting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Count images needing conversion (pending, error, or stale)
  const needsConversionCount = images.filter(
    (img) => 
      img.status === "pending" || 
      img.status === "error" || 
      isConversionStale(img, options)
  ).length;

  const handleFilesAdded = useCallback((files: File[]) => {
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/bmp", "image/tiff"];
    
    const newImages: ImageFile[] = files
      .filter((file) => {
        if (!validTypes.includes(file.type)) {
          toast.error(`${file.name} is not a supported image format`);
          return false;
        }
        return true;
      })
      .map((file) => ({
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        file,
        preview: URL.createObjectURL(file),
        name: file.name,
        size: file.size,
        status: "pending" as const,
      }));

    if (newImages.length > 0) {
      setImages((prev) => [...prev, ...newImages]);
      toast.success(`${newImages.length} image${newImages.length > 1 ? "s" : ""} added`);
    }
  }, []);

  const handleRemoveImage = useCallback((id: string) => {
    setImages((prev) => {
      const image = prev.find((img) => img.id === id);
      if (image) {
        URL.revokeObjectURL(image.preview);
        if (image.convertedUrl) {
          URL.revokeObjectURL(image.convertedUrl);
        }
      }
      return prev.filter((img) => img.id !== id);
    });
  }, []);

  const handleClearAll = useCallback(() => {
    images.forEach((img) => {
      URL.revokeObjectURL(img.preview);
      if (img.convertedUrl) {
        URL.revokeObjectURL(img.convertedUrl);
      }
    });
    setImages([]);
    toast.info("All images cleared");
  }, [images]);

  const updateImageStatus = useCallback(
    (id: string, updates: Partial<ImageFile>) => {
      setImages((prev) =>
        prev.map((img) => (img.id === id ? { ...img, ...updates } : img))
      );
    },
    []
  );

  const handleConvert = useCallback(async () => {
    // Get images that need conversion: pending, error, or stale (settings changed)
    const imagesToConvert = images.filter(
      (img) =>
        img.status === "pending" ||
        img.status === "error" ||
        isConversionStale(img, options)
    );
    
    if (imagesToConvert.length === 0) {
      toast.info("No images to convert");
      return;
    }

    setIsConverting(true);
    let successCount = 0;
    let errorCount = 0;

    for (const image of imagesToConvert) {
      try {
        // Revoke old converted URL if reconverting
        if (image.convertedUrl) {
          URL.revokeObjectURL(image.convertedUrl);
        }
        
        updateImageStatus(image.id, { 
          status: "converting",
          // Clear old conversion data
          convertedBlob: undefined,
          convertedSize: undefined,
          convertedUrl: undefined,
        });
        
        const result = await convertImage(image.file, options);
        updateImageStatus(image.id, {
          status: "done",
          convertedBlob: result.blob,
          convertedSize: result.size,
          convertedUrl: result.url,
          outputFormat: options.format,
          convertedWithSettings: {
            quality: options.quality,
            maxWidth: options.maxWidth,
            maxHeight: options.maxHeight,
            format: options.format,
          },
        });
        successCount++;
      } catch (error) {
        console.error(`Failed to convert ${image.name}:`, error);
        updateImageStatus(image.id, { status: "error" });
        errorCount++;
        toast.error(`Failed to convert ${image.name}`);
      }
    }

    setIsConverting(false);

    if (successCount > 0) {
      toast.success(
        `Successfully converted ${successCount} image${successCount > 1 ? "s" : ""}`
      );
    }
    if (errorCount > 0) {
      toast.error(
        `Failed to convert ${errorCount} image${errorCount > 1 ? "s" : ""}`
      );
    }
  }, [images, options, updateImageStatus]);

  const handleDownloadZip = useCallback(async () => {
    const convertedImages = images.filter((img) => img.status === "done");
    
    if (convertedImages.length === 0) {
      toast.info("No converted images to download");
      return;
    }

    setIsDownloading(true);
    try {
      await downloadAsZip(images, options.format, `${options.format}-images`);
      toast.success(`Downloaded ${convertedImages.length} images as ZIP`);
    } catch (error) {
      console.error("Failed to create ZIP:", error);
      toast.error("Failed to create ZIP file");
    } finally {
      setIsDownloading(false);
    }
  }, [images, options.format]);

  const handleRetry = useCallback(
    async (id: string) => {
      const image = images.find((img) => img.id === id);
      if (!image) return;

      try {
        // Revoke old converted URL if exists
        if (image.convertedUrl) {
          URL.revokeObjectURL(image.convertedUrl);
        }
        
        updateImageStatus(id, { 
          status: "converting",
          convertedBlob: undefined,
          convertedSize: undefined,
          convertedUrl: undefined,
        });
        
        const result = await convertImage(image.file, options);
        updateImageStatus(id, {
          status: "done",
          convertedBlob: result.blob,
          convertedSize: result.size,
          convertedUrl: result.url,
          outputFormat: options.format,
          convertedWithSettings: {
            quality: options.quality,
            maxWidth: options.maxWidth,
            maxHeight: options.maxHeight,
            format: options.format,
          },
        });
        toast.success(`Successfully converted ${image.name}`);
      } catch (error) {
        console.error(`Failed to convert ${image.name}:`, error);
        updateImageStatus(id, { status: "error" });
        toast.error(`Failed to convert ${image.name}`);
      }
    },
    [images, options, updateImageStatus]
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-6 max-w-7xl">
        {/* Hero - Only show when no images */}
        {images.length === 0 && (
          <section className="text-center space-y-4 py-8 mb-8">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Image <span className="text-primary">Converter</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              High-quality conversion powered by Sharp. WebP, AVIF, PNG, JPEG.
            </p>
          </section>
        )}

        {/* Upload Area - Compact when images exist */}
        <div className={images.length > 0 ? "mb-6" : "mb-8"}>
          <ImageUploader onFilesAdded={handleFilesAdded} compact={images.length > 0} />
        </div>

        {/* Toolbar & Images - Only show when images exist */}
        {images.length > 0 && (
          <div className="space-y-6">
            {/* Compact Toolbar */}
            <ConversionToolbar
              options={options}
              onOptionsChange={setOptions}
              images={images}
              onConvert={handleConvert}
              onDownloadZip={handleDownloadZip}
              isConverting={isConverting}
              isDownloading={isDownloading}
              needsConversionCount={needsConversionCount}
            />

            {/* Image Grid */}
            <ImagePreviewGrid
              images={images}
              options={options}
              onRemove={handleRemoveImage}
              onRetry={handleRetry}
              onClearAll={handleClearAll}
            />
          </div>
        )}

        {/* Empty State Info */}
        {images.length === 0 && (
          <section className="text-center py-8 space-y-6">
            <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <div className="p-6 rounded-lg bg-card border border-border">
                <div className="text-3xl mb-3">🔧</div>
                <h3 className="font-semibold mb-2">Sharp Powered</h3>
                <p className="text-sm text-muted-foreground">
                  High-quality libvips processing
                </p>
              </div>
              <div className="p-6 rounded-lg bg-card border border-border">
                <div className="text-3xl mb-3">⚡</div>
                <h3 className="font-semibold mb-2">Multi-Format</h3>
                <p className="text-sm text-muted-foreground">
                  WebP, AVIF, PNG, JPEG output
                </p>
              </div>
              <div className="p-6 rounded-lg bg-card border border-border">
                <div className="text-3xl mb-3">📦</div>
                <h3 className="font-semibold mb-2">Batch Convert</h3>
                <p className="text-sm text-muted-foreground">
                  Convert multiple images at once
                </p>
              </div>
            </div>
          </section>
        )}
      </main>

      <footer className="border-t border-border py-6 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            Built for web developers who need optimized images.
            <span className="mx-2">•</span>
            No data stored, ever.
          </p>
        </div>
      </footer>
    </div>
  );
}
