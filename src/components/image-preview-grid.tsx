"use client";

import { useState } from "react";
import Image from "next/image";
import { X, Check, Loader2, AlertCircle, Download, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ImageViewer } from "@/components/image-viewer";
import type { ImageFile, OutputFormat } from "@/app/page";

interface ImagePreviewGridProps {
  images: ImageFile[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onRemove: (id: string) => void;
  onRetry: (id: string) => Promise<void>;
}

const FORMAT_EXTENSIONS: Record<OutputFormat, string> = {
  webp: ".webp",
  avif: ".avif",
  png: ".png",
  jpeg: ".jpg",
};

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function getStatusIcon(status: ImageFile["status"]) {
  switch (status) {
    case "converting":
      return <Loader2 className="w-4 h-4 animate-spin" />;
    case "done":
      return <Check className="w-4 h-4 text-green-500" />;
    case "error":
      return <AlertCircle className="w-4 h-4 text-red-500" />;
    default:
      return null;
  }
}

function getStatusBadge(status: ImageFile["status"]) {
  switch (status) {
    case "pending":
      return <Badge variant="secondary">Pending</Badge>;
    case "converting":
      return (
        <Badge variant="secondary" className="bg-blue-500/20 text-blue-400">
          Converting...
        </Badge>
      );
    case "done":
      return null; // Format badge shown separately
    case "error":
      return (
        <Badge variant="secondary" className="bg-red-500/20 text-red-400">
          Error
        </Badge>
      );
    default:
      return null;
  }
}

export function ImagePreviewGrid({ images, selectedIds, onToggleSelect, onRemove, onRetry }: ImagePreviewGridProps) {
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

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

  const handleImageClick = (index: number) => {
    setViewerIndex(index);
  };

  const handleCloseViewer = () => {
    setViewerIndex(null);
  };

  return (
    <div className="space-y-3">
      <ImageViewer
        images={images}
        currentIndex={viewerIndex}
        onClose={handleCloseViewer}
        onDownload={handleDownload}
      />
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {images.length} image{images.length !== 1 ? "s" : ""}
          {images.filter((img) => img.status === "done").length > 0 && (
            <span className="ml-2">
              • {images.filter((img) => img.status === "done").length} converted
            </span>
          )}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {images.map((image, index) => {
          const isSelected = selectedIds.has(image.id);
          return (
            <div
              key={image.id}
              className={cn(
                "group relative",
                isSelected && "ring-2 ring-primary ring-offset-2 rounded"
              )}
            >
              {/* Selection Checkbox */}
              <div
                className="absolute top-2 left-2 z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleSelect(image.id);
                }}
              >
                <div
                  className={cn(
                    "h-5 w-5 rounded border-2 flex items-center justify-center cursor-pointer transition-all",
                    isSelected
                      ? "bg-primary border-primary"
                      : "bg-background/80 border-white/50 backdrop-blur-sm opacity-0 group-hover:opacity-100"
                  )}
                >
                  {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
                </div>
              </div>

              {/* Image Preview */}
              <div
                className="relative aspect-square bg-muted rounded overflow-hidden cursor-pointer"
                onClick={() => handleImageClick(index)}
              >
              <Image
                src={image.convertedUrl || image.preview}
                alt={image.name}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 20vw, 16vw"
              />
              
              {/* Status Overlay */}
              {image.status === "converting" && (
                <div className="absolute inset-0 bg-background/90 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              )}

              {/* Action Buttons */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 flex items-center justify-center gap-2"
                onClick={(e) => e.stopPropagation()}
              >
                {image.status === "done" && (
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleDownload(image)}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                )}
                {image.status === "error" && (
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onRetry(image.id)}
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                )}
                <Button
                  variant="destructive"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onRemove(image.id)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Status Indicator */}
              <div className="absolute top-2 left-2">
                {getStatusIcon(image.status)}
              </div>

              {/* Format Badge */}
              {image.status === "done" && image.outputFormat && (
                <div className="absolute top-2 right-2">
                  <Badge variant="secondary" className="bg-green-500/20 text-green-400 uppercase text-[10px] px-1.5 py-0.5">
                    {image.outputFormat}
                  </Badge>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="px-1 py-2 space-y-1">
              <p className="text-xs font-medium truncate" title={image.name}>
                {image.name}
              </p>
              {image.status === "done" && image.convertedSize && (
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <span>{formatFileSize(image.size)}</span>
                  <span>→</span>
                  <span
                    className={cn(
                      image.convertedSize < image.size
                        ? "text-green-500 font-medium"
                        : "text-muted-foreground"
                    )}
                  >
                    {formatFileSize(image.convertedSize)}
                  </span>
                  {image.convertedSize < image.size && (
                    <span className="text-green-500">
                      ({Math.round((1 - image.convertedSize / image.size) * 100)}%)
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        );
        })}
      </div>
    </div>
  );
}

