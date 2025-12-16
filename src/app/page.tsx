"use client";

import { useState, useCallback, useRef } from "react";
import { ImageUploader } from "@/components/image-uploader";
import { ImagePreviewGrid } from "@/components/image-preview-grid";
import { ConversionToolbar } from "@/components/conversion-toolbar";
import { Header } from "@/components/header";
import { toast } from "sonner";
import { convertImagesParallel, BatchConversionResult } from "@/lib/image-converter";
import { downloadAsZip } from "@/lib/zip-download";
import { Settings, Zap, Package, Heart } from "lucide-react";

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
  const [conversionProgress, setConversionProgress] = useState({ completed: 0, total: 0 });
  const [lastConversionTime, setLastConversionTime] = useState<number>(0);
  
  // Ref to track cancellation
  const cancelRef = useRef(false);

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

  /**
   * PARALLEL BATCH CONVERSION
   * Processes multiple images simultaneously for maximum speed
   */
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
    cancelRef.current = false;
    setConversionProgress({ completed: 0, total: imagesToConvert.length });

    // Prepare images and revoke old URLs
    const preparedImages = imagesToConvert.map((image) => {
      if (image.convertedUrl) {
        URL.revokeObjectURL(image.convertedUrl);
      }
      return { id: image.id, file: image.file };
    });

    // Mark all as converting
    setImages((prev) =>
      prev.map((img) =>
        preparedImages.some((p) => p.id === img.id)
          ? {
              ...img,
              status: "converting" as const,
              convertedBlob: undefined,
              convertedSize: undefined,
              convertedUrl: undefined,
            }
          : img
      )
    );

    const startTime = performance.now();

    // PARALLEL PROCESSING - Multiple images at once!
    const results = await convertImagesParallel(
      preparedImages,
      options,
      // Progress callback - update count as each image completes
      (completed, total) => {
        setConversionProgress({ completed, total });
      },
      // Individual image completion callback - update UI immediately
      (id, result) => {
        if (cancelRef.current) return;
        
        if (result.success && result.blob && result.url) {
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
        } else {
          updateImageStatus(id, { status: "error" });
        }
      }
    );

    const durationSeconds = (performance.now() - startTime) / 1000;
    const duration = durationSeconds.toFixed(1);
    setLastConversionTime(durationSeconds);

    setIsConverting(false);
    setConversionProgress({ completed: 0, total: 0 });

    const successCount = results.filter((r) => r.success).length;
    const errorCount = results.filter((r) => !r.success).length;

    if (successCount > 0) {
      toast.success(
        `Converted ${successCount} image${successCount > 1 ? "s" : ""} in ${duration}s`
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

      // Use the parallel converter for a single image
      try {
        if (image.convertedUrl) {
          URL.revokeObjectURL(image.convertedUrl);
        }
        
        updateImageStatus(id, { 
          status: "converting",
          convertedBlob: undefined,
          convertedSize: undefined,
          convertedUrl: undefined,
        });
        
        const results = await convertImagesParallel(
          [{ id: image.id, file: image.file }],
          options
        );
        
        const result = results[0];
        if (result.success && result.blob && result.url) {
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
        } else {
          updateImageStatus(id, { status: "error" });
          toast.error(`Failed to convert ${image.name}`);
        }
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
      
      <main className="flex-1 container mx-auto px-4 py-3 max-w-7xl flex flex-col justify-center">
        {/* Hero - Only show when no images */}
        {images.length === 0 && (
          <section className="text-center space-y-2 py-3 mb-3">
            <h1 className="font-mono text-3xl md:text-4xl font-bold tracking-tight">
              <span className="text-primary">WebP</span> Converter
            </h1>
            <p className="text-muted-foreground text-sm max-w-2xl mx-auto">
              Built for web devs who need optimized images. No data stored, ever.
            </p>
          </section>
        )}

        {/* Upload Area - Compact when images exist */}
        <div className={images.length > 0 ? "mb-4" : "mb-4"}>
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
              conversionProgress={conversionProgress}
            />

            {/* Image Grid */}
            <ImagePreviewGrid
              images={images}
              options={options}
              onRemove={handleRemoveImage}
              onRetry={handleRetry}
              onClearAll={handleClearAll}
              lastConversionTime={lastConversionTime}
            />
          </div>
        )}

        {/* Empty State Info */}
        {images.length === 0 && (
          <section className="text-center py-3 space-y-3">
            <div className="grid md:grid-cols-3 gap-3 max-w-3xl mx-auto">
              <div className="p-4 rounded-lg bg-card border border-border">
                <div className="mb-2 flex justify-center">
                  <Settings className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-mono font-semibold text-sm mb-1">Sharp Powered</h3>
                <p className="text-xs text-muted-foreground">
                  High-quality libvips processing
                </p>
              </div>
              <div className="p-4 rounded-lg bg-card border border-border">
                <div className="mb-2 flex justify-center">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-mono font-semibold text-sm mb-1">Parallel Processing</h3>
                <p className="text-xs text-muted-foreground">
                  6x faster with concurrent conversion
                </p>
              </div>
              <div className="p-4 rounded-lg bg-card border border-border">
                <div className="mb-2 flex justify-center">
                  <Package className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-mono font-semibold text-sm mb-1">Batch Convert</h3>
                <p className="text-xs text-muted-foreground">
                  Convert multiple images at once
                </p>
              </div>
            </div>
          </section>
        )}
      </main>

      <footer className="border-t border-border py-3 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p className="flex items-center justify-center gap-1.5">
            Made with{" "}
            <Heart className="w-4 h-4 text-orange-500 fill-orange-500" />
            by{" "}
            <a
              href="https://pixelmango.studio/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline font-medium"
            >
              Pixel Mango
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
