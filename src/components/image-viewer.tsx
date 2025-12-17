"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { X, Download, ChevronLeft, ChevronRight, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { ImageFile } from "@/app/page";

interface ImageViewerProps {
  images: ImageFile[];
  currentIndex: number | null;
  onClose: () => void;
  onDownload?: (image: ImageFile) => void;
}

export function ImageViewer({
  images,
  currentIndex,
  onClose,
  onDownload,
}: ImageViewerProps) {
  // Use offset from currentIndex for navigation within viewer
  const [offset, setOffset] = useState(0);
  
  // Reset offset when dialog opens with new index
  const handleOpenChange = useCallback((open: boolean) => {
    if (!open) {
      onClose();
      setOffset(0);
    }
  }, [onClose]);

  if (currentIndex === null || images.length === 0) return null;

  const index = currentIndex + offset;
  const currentImage = images[index];
  const hasNext = index < images.length - 1;
  const hasPrev = index > 0;

  const handleNext = () => {
    if (hasNext) setOffset(offset + 1);
  };

  const handlePrev = () => {
    if (hasPrev) setOffset(offset - 1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft" && hasPrev) handlePrev();
    if (e.key === "ArrowRight" && hasNext) handleNext();
    if (e.key === "Escape") onClose();
  };

  const handleDownload = () => {
    if (onDownload && currentImage) {
      onDownload(currentImage);
    }
  };

  return (
    <Dialog open={currentIndex !== null} onOpenChange={handleOpenChange}>
      <DialogContent
        className="max-w-[95vw] w-full h-[95vh] sm:h-[90vh] p-0 gap-0 bg-black/95 border-none"
        onKeyDown={handleKeyDown}
        showCloseButton={false}
      >
        <div className="relative w-full h-full flex flex-col">
          {/* Minimal Top Bar */}
          <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-3 sm:px-6 py-2 sm:py-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="text-white/60 text-xs sm:text-sm font-medium">
                {index + 1} of {images.length}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white/80 hover:text-white hover:bg-white/10 rounded-full h-8 w-8 sm:h-10 sm:w-10"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          </div>

          {/* Image Container */}
          <div className="relative flex-1 flex items-center justify-center overflow-hidden px-4 sm:px-12 md:px-20">
            <div className="relative w-full h-full flex items-center justify-center">
              <Image
                src={currentImage.convertedUrl || currentImage.preview}
                alt={currentImage.name}
                fill
                className="object-contain"
                sizes="100vw"
                priority
              />
            </div>

            {/* Navigation Arrows */}
            {hasPrev && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePrev}
                className="absolute left-1 sm:left-4 top-1/2 -translate-y-1/2 h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm"
              >
                <ChevronLeft className="w-4 h-4 sm:w-6 sm:h-6" />
              </Button>
            )}
            {hasNext && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNext}
                className="absolute right-1 sm:right-4 top-1/2 -translate-y-1/2 h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm"
              >
                <ChevronRight className="w-4 h-4 sm:w-6 sm:h-6" />
              </Button>
            )}
          </div>

          {/* Clean Bottom Info Panel */}
          <div className="absolute bottom-0 left-0 right-0 z-20 bg-black/80 backdrop-blur-xl border-t border-white/10">
            <div className="px-3 sm:px-6 py-3 sm:py-5">
              {/* Header with Download */}
              <div className="flex items-center justify-end mb-3 sm:mb-4">
                {currentImage.status === "done" && onDownload && (
                  <Button
                    onClick={handleDownload}
                    className="bg-white text-black hover:bg-white/90 rounded-full px-4 sm:px-6 h-8 sm:h-9"
                    size="sm"
                  >
                    <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                    <span className="text-xs sm:text-sm">Download</span>
                  </Button>
                )}
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
                {/* Original Size */}
                <div>
                  <div className="text-white/50 text-[10px] sm:text-xs font-medium mb-0.5 sm:mb-1">Original</div>
                  <div className="text-white text-xs sm:text-sm">{formatFileSize(currentImage.size)}</div>
                </div>

                {/* Converted Size */}
                {currentImage.status === "done" && currentImage.convertedSize && (
                  <>
                    <div>
                      <div className="text-white/50 text-[10px] sm:text-xs font-medium mb-0.5 sm:mb-1">Converted</div>
                      <div className="text-white text-xs sm:text-sm">{formatFileSize(currentImage.convertedSize)}</div>
                    </div>

                    {/* Savings */}
                    {currentImage.convertedSize < currentImage.size && (
                      <div>
                        <div className="text-white/50 text-[10px] sm:text-xs font-medium mb-0.5 sm:mb-1">Saved</div>
                        <div className="text-green-400 text-xs sm:text-sm font-medium">
                          {Math.round((1 - currentImage.convertedSize / currentImage.size) * 100)}%
                        </div>
                      </div>
                    )}

                    {/* Format */}
                    <div>
                      <div className="text-white/50 text-[10px] sm:text-xs font-medium mb-0.5 sm:mb-1">Format</div>
                      <div className="text-white text-xs sm:text-sm uppercase">{currentImage.outputFormat}</div>
                    </div>
                  </>
                )}

                {/* Status for non-converted */}
                {currentImage.status !== "done" && (
                  <div>
                    <div className="text-white/50 text-[10px] sm:text-xs font-medium mb-0.5 sm:mb-1">Status</div>
                    <div className="text-white text-xs sm:text-sm capitalize">{currentImage.status}</div>
                  </div>
                )}
              </div>

              {/* Success Indicator */}
              {currentImage.status === "done" && currentImage.convertedSize && currentImage.convertedSize < currentImage.size && (
                <div className="mt-3 sm:mt-4 flex items-center gap-1.5 sm:gap-2 text-green-400 text-xs sm:text-sm">
                  <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>Successfully optimized</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
