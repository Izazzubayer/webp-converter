"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { X, Download, RotateCcw, Eye, Trash2 } from "lucide-react";
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

// Animated linear progress bar component
function LinearLoader() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((oldProgress) => {
        if (oldProgress >= 100) {
          return 0;
        }
        const diff = Math.random() * 15 + 5;
        return Math.min(oldProgress + diff, 100);
      });
    }, 400);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary/20 overflow-hidden">
      <div 
        className="h-full bg-primary transition-all duration-300 ease-out"
        style={{ width: `${progress}%` }}
      />
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
    <div className="space-y-3">
      <ImageViewer
        images={images}
        currentIndex={selectedIndex}
        onClose={handleCloseViewer}
        onDownload={handleDownload}
      />
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {images.length} image{images.length !== 1 ? "s" : ""}
          {convertedCount > 0 && ` • ${convertedCount} converted`}
          {showTime && ` • ${lastConversionTime.toFixed(1)}s`}
        </span>
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
              
              {/* Linear Progress Bar - shows at bottom during conversion */}
              {image.status === "converting" && <LinearLoader />}

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
