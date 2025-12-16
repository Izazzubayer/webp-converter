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
        "relative border-2 border-dashed rounded-xl transition-all duration-200 cursor-pointer",
        "hover:border-primary/50 hover:bg-primary/5 hover:shadow-md",
        "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background",
        isDragging
          ? "border-primary bg-primary/10 scale-[1.01] shadow-lg"
          : "border-border",
        compact 
          ? "p-4 max-w-full" 
          : "p-10 max-w-2xl mx-auto"
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
        "flex items-center justify-center gap-4 text-center",
        compact ? "flex-row" : "flex-col"
      )}>
        <div
          className={cn(
            "rounded-full transition-all duration-200 flex items-center justify-center",
            isDragging 
              ? "bg-primary/20 scale-110" 
              : "bg-muted hover:bg-muted/80",
            compact ? "p-2.5" : "p-5"
          )}
        >
          {isDragging ? (
            <ImagePlus className={cn("text-primary transition-transform", compact ? "w-5 h-5" : "w-10 h-10")} />
          ) : (
            <Upload className={cn("text-muted-foreground transition-colors hover:text-primary", compact ? "w-5 h-5" : "w-10 h-10")} />
          )}
        </div>

        <div className={cn("space-y-2", compact && "text-left space-y-0.5")}>
          <p className={cn(
            "font-semibold transition-colors",
            isDragging && "text-primary",
            compact ? "text-sm" : "text-xl"
          )}>
            {isDragging ? "Drop images here" : compact ? "Add more images" : "Drag & drop images here"}
          </p>
          {!compact && (
            <>
              <p className="text-sm text-muted-foreground">
                or click to browse files
              </p>
              <p className="text-xs text-muted-foreground/80 pt-1">
                Supports JPEG, PNG, GIF, WebP, BMP, TIFF
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

