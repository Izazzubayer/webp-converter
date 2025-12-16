"use client";

import { useCallback, useState, useRef } from "react";
import { Upload, ImagePlus } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploaderProps {
  onFilesAdded: (files: File[]) => void;
  compact?: boolean;
}

export function ImageUploader({ onFilesAdded, compact = false }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files).filter((file) =>
        file.type.startsWith("image/")
      );

      if (files.length > 0) {
        onFilesAdded(files);
      }
    },
    [onFilesAdded]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length > 0) {
        onFilesAdded(files);
      }
      // Reset input so same file can be selected again
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    },
    [onFilesAdded]
  );

  const handleClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleClick();
      }
    },
    [handleClick]
  );

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={cn(
        "relative border-2 border-dashed rounded-lg transition-all duration-200 cursor-pointer",
        "hover:border-primary/50 hover:bg-primary/5",
        "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background",
        isDragging
          ? "border-primary bg-primary/10 scale-[1.01]"
          : "border-border",
        compact ? "p-4" : "p-12"
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp,image/bmp,image/tiff"
        multiple
        onChange={handleFileSelect}
        className="hidden"
        aria-label="Upload images"
      />

      <div className={cn(
        "flex items-center justify-center gap-3 text-center",
        compact ? "flex-row" : "flex-col"
      )}>
        <div
          className={cn(
            "rounded-full transition-colors",
            isDragging ? "bg-primary/20" : "bg-muted",
            compact ? "p-2" : "p-4"
          )}
        >
          {isDragging ? (
            <ImagePlus className={cn("text-primary", compact ? "w-5 h-5" : "w-8 h-8")} />
          ) : (
            <Upload className={cn("text-muted-foreground", compact ? "w-5 h-5" : "w-8 h-8")} />
          )}
        </div>

        <div className={cn("space-y-1", compact && "text-left")}>
          <p className={cn("font-medium", compact ? "text-sm" : "text-lg")}>
            {isDragging ? "Drop images here" : compact ? "Add more images" : "Drag & drop images here"}
          </p>
          {!compact && (
            <>
              <p className="text-sm text-muted-foreground">
                or click to browse files
              </p>
              <p className="text-xs text-muted-foreground">
                Supports JPEG, PNG, GIF, WebP, BMP, TIFF
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

