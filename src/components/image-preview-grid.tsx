"use client";

import { useState } from "react";
import Image from "next/image";
import { X, Loader2, Download, RotateCcw, Eye, Trash2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ImageViewer } from "@/components/image-viewer";
import { isConversionStale } from "@/app/page";
import type { ImageFile, OutputFormat, ConversionOptions } from "@/app/page";

interface ImagePreviewGridProps {
  images: ImageFile[];
  options: ConversionOptions;
  onRemove: (id: string) => void;
  onRetry: (id: string) => Promise<void>;
  onClearAll: () => void;
  lastConversionTime?: number; // Time in seconds
}

const FORMAT_EXTENSIONS: Record<OutputFormat, string> = {
  webp: ".webp",
  avif: ".avif",
  png: ".png",
  jpeg: ".jpg",
};

export function ImagePreviewGrid({ 
  images, 
  options, 
  onRemove, 
  onRetry, 
  onClearAll,
  lastConversionTime 
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

  const handleImageClick = (index: number) => {
    setSelectedIndex(index);
  };

  const handleCloseViewer = () => {
    setSelectedIndex(null);
  };

  const convertedCount = images.filter((img) => img.status === "done").length;

  return (
    <div className="space-y-3">
      <ImageViewer
        images={images}
        currentIndex={selectedIndex}
        onClose={handleCloseViewer}
        onDownload={handleDownload}
      />
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-3">
          <span>
            {images.length} image{images.length !== 1 ? "s" : ""}
            {convertedCount > 0 && (
              <span className="ml-2 text-green-500">
                • {convertedCount} converted
              </span>
            )}
          </span>
          {lastConversionTime !== undefined && lastConversionTime > 0 && convertedCount > 0 && (
            <span className="flex items-center gap-1 text-primary">
              <Zap className="w-3 h-3" />
              {lastConversionTime.toFixed(1)}s
            </span>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearAll}
          className="text-destructive hover:text-destructive h-7 px-2"
        >
          <Trash2 className="w-4 h-4 mr-1" />
          Clear All
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {images.map((image) => (
          <div
            key={image.id}
            className="group"
          >
            {/* Image Preview */}
            <div
              className="relative aspect-square bg-muted rounded overflow-hidden cursor-pointer"
              onClick={() => handleImageClick(images.indexOf(image))}
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
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleImageClick(images.indexOf(image))}
                  title="View"
                >
                  <Eye className="w-4 h-4" />
                </Button>
                {image.status === "done" && (
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleDownload(image)}
                    title="Download"
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
                    title="Retry"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                )}
                <Button
                  variant="destructive"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onRemove(image.id)}
                  title="Remove"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Format Badge - shows stale indicator if settings changed */}
              {image.status === "done" && image.outputFormat && (
                <div className="absolute top-2 right-2 flex gap-1">
                  {isConversionStale(image, options) ? (
                    <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400 text-[10px] px-1.5 py-0.5">
                      Outdated
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-green-500 text-white uppercase text-[10px] px-1.5 py-0.5 font-semibold">
                      {image.outputFormat}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
