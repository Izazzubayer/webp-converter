"use client";

import { useState } from "react";
import Image from "next/image";
import { Trash2, Loader2, Download, RefreshCw, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ImageViewer } from "@/components/image-viewer";
import { isConversionStale } from "@/app/page";
import { cn } from "@/lib/utils";
import type { ImageFile, OutputFormat, ConversionOptions } from "@/app/page";

interface ImagePreviewGridProps {
  images: ImageFile[];
  options: ConversionOptions;
  onRemove: (id: string) => void;
  onRetry: (id: string) => Promise<void>;
  onClearAll: () => void;
  lastConversionTime?: number;
}

const FORMAT_EXTENSIONS: Record<OutputFormat, string> = {
  webp: ".webp",
  avif: ".avif",
  png: ".png",
  jpeg: ".jpg",
};

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/** Spinner + shimmer overlay while converting */
function ConvertingOverlay() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center backdrop-blur-[1px] bg-black/55">
      <div className="converting-shimmer absolute inset-0" />
      <Loader2 className="relative z-10 w-6 h-6 sm:w-7 sm:h-7 text-white animate-spin" />
      <span className="relative z-10 mt-1.5 text-[10px] sm:text-xs font-medium text-white/90 tracking-wide">
        Converting…
      </span>
    </div>
  );
}

/** Hover overlay: Download + Remove quick actions */
function HoverActions({
  image,
  onDownload,
  onRemove,
  onRetry,
}: {
  image: ImageFile;
  onDownload: () => void;
  onRemove: () => void;
  onRetry: () => void;
}) {
  return (
    <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-150 backdrop-blur-[1px]">
      {image.status === "done" && (
        <button
          onClick={(e) => { e.stopPropagation(); onDownload(); }}
          title="Download this image"
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center",
            "bg-green-500 hover:bg-green-400 text-white",
            "transition-transform duration-100 active:scale-90 shadow-md",
          )}
        >
          <Download className="w-3.5 h-3.5" />
        </button>
      )}
      {image.status === "error" && (
        <button
          onClick={(e) => { e.stopPropagation(); onRetry(); }}
          title="Retry conversion"
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center",
            "bg-amber-500 hover:bg-amber-400 text-white",
            "transition-transform duration-100 active:scale-90 shadow-md",
          )}
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      )}
      <button
        onClick={(e) => { e.stopPropagation(); onRemove(); }}
        title="Remove image"
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center",
          "bg-white/20 hover:bg-red-500 text-white border border-white/30",
          "transition-all duration-100 active:scale-90 shadow-md",
        )}
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export function ImagePreviewGrid({
  images,
  options,
  onRemove,
  onRetry,
  onClearAll,
  lastConversionTime,
}: ImagePreviewGridProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const handleDownload = (image: ImageFile) => {
    if (!image.convertedUrl || !image.convertedBlob) return;
    const extension = FORMAT_EXTENSIONS[image.outputFormat || "webp"];
    const link = document.createElement("a");
    link.href = image.convertedUrl;
    link.download = image.name.replace(/\.[^/.]+$/, "") + extension;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const convertedCount = images.filter((img) => img.status === "done").length;
  const totalOriginal = images
    .filter((img) => img.status === "done")
    .reduce((s, img) => s + img.size, 0);
  const totalConverted = images
    .filter((img) => img.status === "done" && img.convertedSize)
    .reduce((s, img) => s + (img.convertedSize ?? 0), 0);
  const totalSaved =
    totalOriginal > 0 && totalConverted > 0
      ? Math.round((1 - totalConverted / totalOriginal) * 100)
      : null;

  const showTime = lastConversionTime !== undefined && lastConversionTime > 0 && convertedCount > 0;

  return (
    <div className="space-y-2 sm:space-y-3">
      <ImageViewer
        images={images}
        currentIndex={selectedIndex}
        onClose={() => setSelectedIndex(null)}
        onDownload={handleDownload}
        onRemove={onRemove}
      />

      {/* ── Stats bar ── */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap text-xs sm:text-sm text-muted-foreground">
          <span>{images.length} image{images.length !== 1 ? "s" : ""}</span>
          {convertedCount > 0 && (
            <>
              <span className="text-border">·</span>
              <span className="flex items-center gap-1 text-green-400 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {convertedCount} converted
              </span>
            </>
          )}
          {showTime && (
            <>
              <span className="text-border">·</span>
              <span>{lastConversionTime.toFixed(1)}s</span>
            </>
          )}
          {totalSaved !== null && totalSaved > 0 && (
            <>
              <span className="text-border">·</span>
              <span className="text-green-400 font-medium">−{totalSaved}% size</span>
            </>
          )}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={onClearAll}
          className={cn(
            "text-muted-foreground hover:text-destructive h-7 px-2 flex-shrink-0",
            "transition-colors duration-150 active:scale-95",
          )}
        >
          <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" />
          <span className="hidden sm:inline text-xs">Clear All</span>
          <span className="sm:hidden text-xs">Clear</span>
        </Button>
      </div>

      {/* ── Image Grid ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3">
        {images.map((image, idx) => {
          const isStale = isConversionStale(image, options);
          const sizeSaved =
            image.status === "done" && image.convertedSize && image.size > 0
              ? Math.round((1 - image.convertedSize / image.size) * 100)
              : null;

          return (
            <div
              key={image.id}
              className="group tile-in"
              style={{ animationDelay: `${Math.min(idx, 8) * 30}ms` }}
            >
              {/* Thumbnail card */}
              <div
                className={cn(
                  "relative aspect-square bg-muted rounded-lg overflow-hidden cursor-pointer",
                  "ring-1 ring-transparent transition-all duration-150",
                  "hover:ring-primary/50 hover:shadow-lg hover:shadow-black/40 hover:-translate-y-0.5",
                  image.status === "done" && !isStale && "ring-green-500/30",
                  image.status === "error" && "ring-destructive/50",
                  image.status === "converting" && "ring-primary/30",
                )}
                onClick={() => setSelectedIndex(idx)}
              >
                <Image
                  src={image.convertedUrl || image.preview}
                  alt={image.name}
                  fill
                  className={cn(
                    "object-cover transition-transform duration-200",
                    "group-hover:scale-105",
                  )}
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 20vw, 16vw"
                />

                {/* Converting overlay */}
                {image.status === "converting" && <ConvertingOverlay />}

                {/* Top-right badges */}
                <div className="absolute top-1.5 right-1.5 flex flex-col items-end gap-1 pointer-events-none">
                  {image.status === "done" && image.outputFormat && !isStale && (
                    <Badge
                      variant="secondary"
                      className="badge-pop bg-green-500 text-white uppercase text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0.5 font-semibold shadow-sm"
                    >
                      {image.outputFormat}
                    </Badge>
                  )}
                  {isStale && (
                    <Badge
                      variant="secondary"
                      className="badge-pop bg-yellow-500/90 text-white text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0.5 shadow-sm"
                    >
                      Outdated
                    </Badge>
                  )}
                  {image.status === "error" && (
                    <Badge
                      variant="destructive"
                      className="badge-pop text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0.5 shadow-sm"
                    >
                      Error
                    </Badge>
                  )}
                </div>

                {/* Bottom-left: size reduction chip */}
                {sizeSaved !== null && sizeSaved > 0 && (
                  <div className="absolute bottom-1.5 left-1.5 pointer-events-none">
                    <span className="badge-pop inline-flex items-center px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-bold bg-black/70 text-green-400 backdrop-blur-sm">
                      −{sizeSaved}%
                    </span>
                  </div>
                )}

                {/* Pending dot */}
                {image.status === "pending" && (
                  <div className="absolute bottom-1.5 right-1.5 w-2 h-2 rounded-full bg-muted-foreground/60 ring-1 ring-background" />
                )}

                {/* Hover quick-action overlay */}
                {image.status !== "converting" && (
                  <HoverActions
                    image={image}
                    onDownload={() => handleDownload(image)}
                    onRemove={() => onRemove(image.id)}
                    onRetry={() => onRetry(image.id)}
                  />
                )}
              </div>

              {/* Filename + size below tile */}
              <div className="mt-1 px-0.5 space-y-0.5">
                <p
                  className="text-[11px] text-muted-foreground truncate leading-none"
                  title={image.name}
                >
                  {image.name.replace(/\.[^/.]+$/, "")}
                </p>
                <p className="text-[10px] text-muted-foreground/50 leading-none">
                  {image.status === "done" && image.convertedSize
                    ? `${formatBytes(image.convertedSize)} · was ${formatBytes(image.size)}`
                    : formatBytes(image.size)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
