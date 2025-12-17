"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { X, Download, ChevronLeft, ChevronRight, Check, Trash2 } from "lucide-react";
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
  onRemove?: (imageId: string) => void;
}

export function ImageViewer({
  images,
  currentIndex,
  onClose,
  onDownload,
  onRemove,
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

  const handleRemove = () => {
    if (onRemove && currentImage) {
      onRemove(currentImage.id);
      // Close viewer after removal to avoid index issues
      // User can reopen to view other images if needed
      onClose();
      setOffset(0);
    }
  };

  return (
    <Dialog open={currentIndex !== null} onOpenChange={handleOpenChange}>
      <DialogContent
        className="!max-w-[100vw] !w-full !h-[85vh] sm:!max-w-[95vw] sm:!h-[90vh] !p-0 !gap-0 bg-black !border-none !rounded-none sm:!rounded-lg !fixed !top-[50%] !left-[50%] !right-auto !bottom-auto sm:!top-[50%] sm:!left-[50%] sm:!right-auto sm:!bottom-auto !translate-x-[-50%] !translate-y-[-50%] !m-0"
        overlayClassName="!bg-black"
        onKeyDown={handleKeyDown}
        showCloseButton={false}
      >
        <div className="relative w-full h-full flex flex-col overflow-hidden min-w-0 min-h-0">
          {/* Top Bar - Large close button on mobile */}
          <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-3 sm:px-6 py-2.5 sm:py-4 bg-black/70 backdrop-blur-md">
            <span className="text-white/80 text-xs sm:text-sm font-medium">
              {index + 1} / {images.length}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white hover:text-white hover:bg-white/30 rounded-full h-12 w-12 sm:h-10 sm:w-10 bg-white/10 border border-white/20"
            >
              <X className="w-6 h-6 sm:w-5 sm:h-5" />
            </Button>
          </div>

          {/* Image Container - Full screen on mobile */}
          <div className="relative flex-1 flex items-center justify-center overflow-hidden pt-12 pb-16 sm:pt-14 sm:pb-0 px-2 sm:px-12 md:px-20 min-h-0 min-w-0">
            <div className="relative w-full h-full flex items-center justify-center max-w-full max-h-full min-w-0 min-h-0">
              <Image
                src={currentImage.convertedUrl || currentImage.preview}
                alt={currentImage.name}
                fill
                className="object-contain"
                sizes="100vw"
                priority
              />
            </div>

            {/* Navigation Arrows - Larger touch targets on mobile */}
            {hasPrev && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePrev}
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 h-12 w-12 sm:h-12 sm:w-12 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md border-2 border-white/30 shadow-lg"
              >
                <ChevronLeft className="w-6 h-6 sm:w-6 sm:h-6" />
              </Button>
            )}
            {hasNext && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNext}
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 h-12 w-12 sm:h-12 sm:w-12 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md border-2 border-white/30 shadow-lg"
              >
                <ChevronRight className="w-6 h-6 sm:w-6 sm:h-6" />
              </Button>
            )}
          </div>

          {/* Mobile Bottom Bar - 2x2 grid metadata */}
          <div className="sm:hidden absolute bottom-0 left-0 right-0 z-30 bg-black/95 backdrop-blur-xl border-t border-white/10">
            <div className="px-3 py-3 flex items-center justify-between gap-3">
              {/* Metadata Grid - 2 columns, 2 rows */}
              <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 flex-1 min-w-0">
                {currentImage.status === "done" && currentImage.convertedSize ? (
                  <>
                    {/* Row 1, Col 1: Original */}
                    <div>
                      <div className="text-white/50 text-[9px] font-medium mb-0.5">Original</div>
                      <div className="text-white text-[10px] font-medium">{formatFileSize(currentImage.size)}</div>
                    </div>
                    
                    {/* Row 1, Col 2: Converted */}
                    <div>
                      <div className="text-white/50 text-[9px] font-medium mb-0.5">Converted</div>
                      <div className="text-white text-[10px] font-medium">{formatFileSize(currentImage.convertedSize)}</div>
                    </div>
                    
                    {/* Row 2, Col 1: Saved */}
                    <div>
                      <div className="text-white/50 text-[9px] font-medium mb-0.5">Saved</div>
                      <div className="text-green-400 text-[10px] font-semibold">
                        {Math.round((1 - currentImage.convertedSize / currentImage.size) * 100)}%
                      </div>
                    </div>
                    
                    {/* Row 2, Col 2: Format */}
                    <div>
                      <div className="text-white/50 text-[9px] font-medium mb-0.5">Format</div>
                      <div className="text-white text-[10px] font-medium uppercase">{currentImage.outputFormat}</div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Row 1, Col 1: Original */}
                    <div>
                      <div className="text-white/50 text-[9px] font-medium mb-0.5">Original</div>
                      <div className="text-white text-[10px] font-medium">{formatFileSize(currentImage.size)}</div>
                    </div>
                    
                    {/* Row 1, Col 2: Status */}
                    <div>
                      <div className="text-white/50 text-[9px] font-medium mb-0.5">Status</div>
                      <div className="text-white text-[10px] font-medium capitalize">{currentImage.status}</div>
                    </div>
                  </>
                )}
              </div>
              
              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {onRemove && (
                  <Button
                    onClick={handleRemove}
                    variant="ghost"
                    size="icon"
                    className="text-white hover:text-red-400 hover:bg-red-500/30 rounded-full h-9 w-9"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
                {currentImage.status === "done" && onDownload && (
                  <Button
                    onClick={handleDownload}
                    className="bg-white text-black hover:bg-white/90 rounded-full h-9 px-4 text-xs font-semibold"
                    size="sm"
                  >
                    <Download className="w-4 h-4 mr-1.5" />
                    Download
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Desktop Bottom Info Panel */}
          <div className="hidden sm:block absolute bottom-0 left-0 right-0 z-20 bg-black/80 backdrop-blur-xl border-t border-white/10">
            <div className="px-6 py-5">
              {/* Header with Actions */}
              <div className="flex items-center justify-end gap-3 mb-4">
                {onRemove && (
                  <Button
                    onClick={handleRemove}
                    variant="destructive"
                    className="rounded-full px-6 h-9"
                    size="sm"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    <span className="text-sm">Remove</span>
                  </Button>
                )}
                {currentImage.status === "done" && onDownload && (
                  <Button
                    onClick={handleDownload}
                    className="bg-white text-black hover:bg-white/90 rounded-full px-6 h-9"
                    size="sm"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    <span className="text-sm">Download</span>
                  </Button>
                )}
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {/* Original Size */}
                <div>
                  <div className="text-white/50 text-xs font-medium mb-1">Original</div>
                  <div className="text-white text-sm">{formatFileSize(currentImage.size)}</div>
                </div>

                {/* Converted Size */}
                {currentImage.status === "done" && currentImage.convertedSize && (
                  <>
                    <div>
                      <div className="text-white/50 text-xs font-medium mb-1">Converted</div>
                      <div className="text-white text-sm">{formatFileSize(currentImage.convertedSize)}</div>
                    </div>

                    {/* Savings */}
                    {currentImage.convertedSize < currentImage.size && (
                      <div>
                        <div className="text-white/50 text-xs font-medium mb-1">Saved</div>
                        <div className="text-green-400 text-sm font-medium">
                          {Math.round((1 - currentImage.convertedSize / currentImage.size) * 100)}%
                        </div>
                      </div>
                    )}

                    {/* Format */}
                    <div>
                      <div className="text-white/50 text-xs font-medium mb-1">Format</div>
                      <div className="text-white text-sm uppercase">{currentImage.outputFormat}</div>
                    </div>
                  </>
                )}

                {/* Status for non-converted */}
                {currentImage.status !== "done" && (
                  <div>
                    <div className="text-white/50 text-xs font-medium mb-1">Status</div>
                    <div className="text-white text-sm capitalize">{currentImage.status}</div>
                  </div>
                )}
              </div>

              {/* Success Indicator */}
              {currentImage.status === "done" && currentImage.convertedSize && currentImage.convertedSize < currentImage.size && (
                <div className="mt-4 flex items-center gap-2 text-green-400 text-sm">
                  <Check className="w-4 h-4" />
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
