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
      const files = Array.from(e.dataTransfer.files).filter((f) =>
        f.type.startsWith("image/")
      );
      if (files.length > 0) onFilesAdded(files);
    },
    [onFilesAdded]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length > 0) onFilesAdded(files);
      if (inputRef.current) inputRef.current.value = "";
    },
    [onFilesAdded]
  );

  const handleClick = useCallback(() => inputRef.current?.click(), []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleClick();
      }
    },
    [handleClick]
  );

  /* ─── Compact (workspace) mode ─── */
  if (compact) {
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
          "relative flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl",
          "border-2 border-dashed cursor-pointer select-none",
          "transition-all duration-150 active:scale-[0.99]",
          "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background",
          isDragging
            ? "border-primary bg-primary/10 scale-[1.005] shadow-md shadow-primary/20"
            : "border-border hover:border-primary/50 hover:bg-primary/5"
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

        <div
          className={cn(
            "rounded-full p-2 sm:p-2.5 transition-all duration-150 flex items-center justify-center upload-icon-wiggle",
            isDragging ? "bg-primary/20 scale-110" : "bg-muted"
          )}
        >
          {isDragging ? (
            <ImagePlus className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          ) : (
            <Upload className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
          )}
        </div>

        <div className="text-left">
          <p className={cn(
            "text-xs sm:text-sm font-semibold leading-none transition-colors",
            isDragging ? "text-primary" : "text-foreground"
          )}>
            {isDragging ? "Drop to add" : "Add more images"}
          </p>
          <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 leading-none">
            or click to browse
          </p>
        </div>
      </div>
    );
  }

  /* ─── Full (empty state) mode ─── */
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
        "relative border-2 border-dashed rounded-xl cursor-pointer select-none",
        "p-4 sm:p-6 max-w-2xl mx-auto",
        "transition-all duration-200 active:scale-[0.995]",
        "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background",
        isDragging
          ? "border-primary bg-primary/10 scale-[1.01] shadow-xl shadow-primary/15"
          : "border-border hover:border-primary/50 hover:bg-primary/5 hover:shadow-md"
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

      <div className={cn("flex flex-col items-center justify-center gap-3 sm:gap-4 text-center")}>
        {/* Icon */}
        <div
          className={cn(
            "rounded-full transition-all duration-200 flex items-center justify-center upload-icon-wiggle",
            isDragging
              ? "bg-primary/20 scale-110 shadow-lg shadow-primary/25"
              : "bg-muted hover:bg-muted/80",
            "p-2.5 sm:p-3"
          )}
        >
          {isDragging ? (
            <ImagePlus className="w-6 h-6 sm:w-8 sm:h-8 text-primary transition-transform" />
          ) : (
            <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground" />
          )}
        </div>

        {/* Text */}
        <div className="space-y-1.5 sm:space-y-2">
          <p className={cn(
            "font-semibold transition-colors text-sm sm:text-base",
            isDragging && "text-primary"
          )}>
            {isDragging ? "Release to upload" : "Drag & drop images here"}
          </p>
          <p className="text-xs sm:text-sm text-muted-foreground">
            or{" "}
            <span className="underline underline-offset-2 decoration-dotted hover:decoration-solid cursor-pointer">
              click to browse
            </span>
          </p>
          <p className="text-[10px] sm:text-xs text-muted-foreground/70">
            JPEG · PNG · GIF · WebP · BMP · TIFF
          </p>
        </div>
      </div>
    </div>
  );
}
