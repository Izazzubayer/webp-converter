"use client";

import { useState } from "react";
import Image from "next/image";
import { X, Download, RotateCcw, Eye, Trash2, Loader2 } from "lucide-react";
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
  lastConversionTime?: number;
}

const FORMAT_EXTENSIONS: Record<OutputFormat, string> = {
  webp: ".webp",
  avif: ".avif",
  png: ".png",
  jpeg: ".jpg",
};

// Processing overlay with centered spinner
function ProcessingOverlay() {
  return (
    <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-[1px]">
      <div className="flex flex-col items-center gap-1.5 sm:gap-2">
        <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 text-white animate-spin" />
        <span className="text-[10px] sm:text-xs font-medium text-white/90">Converting...</span>
      </div>
    </div>
  );
}

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
  const showTime = lastConversionTime !== undefined && lastConversionTime > 0 && convertedCount > 0;

  return (
    <div className="space-y-2 sm:space-y-3">
      <ImageViewer
        images={images}
        currentIndex={selectedIndex}
        onClose={handleCloseViewer}
        onDownload={handleDownload}
      />
      <div className="flex items-center justify-between text-xs sm:text-sm text-muted-foreground gap-2">
        <span className="truncate">
          {images.length} image{images.length !== 1 ? "s" : ""}
          {convertedCount > 0 && ` • ${convertedCount} converted`}
          {showTime && ` • ${lastConversionTime.toFixed(1)}s`}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearAll}
          className="text-destructive hover:text-destructive h-7 sm:h-7 px-2 flex-shrink-0"
        >
          <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" />
          <span className="hidden sm:inline">Clear All</span>
          <span className="sm:hidden">Clear</span>
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3">
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
              
              {/* Processing overlay - shows spinner during conversion */}
              {image.status === "converting" && <ProcessingOverlay />}

              {/* Action Buttons - Always visible on mobile, hover on desktop */}
              <div
                className="absolute inset-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity bg-black/40 flex items-center justify-center gap-1.5 sm:gap-2"
                onClick={(e) => e.stopPropagation()}
              >
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-7 w-7 sm:h-8 sm:w-8"
                  onClick={() => handleImageClick(images.indexOf(image))}
                  title="View"
                >
                  <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </Button>
                {image.status === "done" && (
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-7 w-7 sm:h-8 sm:w-8"
                    onClick={() => handleDownload(image)}
                    title="Download"
                  >
                    <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </Button>
                )}
                {image.status === "error" && (
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-7 w-7 sm:h-8 sm:w-8"
                    onClick={() => onRetry(image.id)}
                    title="Retry"
                  >
                    <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </Button>
                )}
                <Button
                  variant="destructive"
                  size="icon"
                  className="h-7 w-7 sm:h-8 sm:w-8"
                  onClick={() => onRemove(image.id)}
                  title="Remove"
                >
                  <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </Button>
              </div>

              {/* Format Badge - shows stale indicator if settings changed */}
              {image.status === "done" && image.outputFormat && (
                <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 flex gap-1">
                  {isConversionStale(image, options) ? (
                    <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400 text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0.5">
                      Outdated
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-green-500 text-white uppercase text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0.5 font-semibold">
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
