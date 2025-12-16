"use client";

import Image from "next/image";
import { X, Check, Loader2, AlertCircle, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ImageFile } from "@/app/page";

interface ImagePreviewGridProps {
  images: ImageFile[];
  onRemove: (id: string) => void;
}

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
      return (
        <Badge variant="secondary" className="bg-green-500/20 text-green-400">
          Done
        </Badge>
      );
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

export function ImagePreviewGrid({ images, onRemove }: ImagePreviewGridProps) {
  const handleDownload = (image: ImageFile) => {
    if (!image.convertedUrl || !image.convertedBlob) return;

    const link = document.createElement("a");
    link.href = image.convertedUrl;
    link.download = image.name.replace(/\.[^/.]+$/, "") + ".webp";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          Images ({images.length})
        </h2>
        <div className="text-sm text-muted-foreground">
          {images.filter((img) => img.status === "done").length} converted
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {images.map((image) => (
          <Card
            key={image.id}
            className={cn(
              "group relative overflow-hidden transition-all duration-200",
              "hover:ring-2 hover:ring-primary/20"
            )}
          >
            {/* Image Preview */}
            <div className="relative aspect-video bg-muted">
              <Image
                src={image.convertedUrl || image.preview}
                alt={image.name}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
              
              {/* Status Overlay */}
              {image.status === "converting" && (
                <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              )}

              {/* Remove Button */}
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => onRemove(image.id)}
              >
                <X className="w-4 h-4" />
              </Button>

              {/* Download Button (when done) */}
              {image.status === "done" && (
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute top-2 left-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleDownload(image)}
                >
                  <Download className="w-4 h-4" />
                </Button>
              )}
            </div>

            {/* Info */}
            <div className="p-3 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium truncate flex-1" title={image.name}>
                  {image.name}
                </p>
                {getStatusIcon(image.status)}
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{formatFileSize(image.size)}</span>
                {image.status === "done" && image.convertedSize && (
                  <span className="flex items-center gap-1">
                    →{" "}
                    <span
                      className={cn(
                        image.convertedSize < image.size
                          ? "text-green-500"
                          : "text-yellow-500"
                      )}
                    >
                      {formatFileSize(image.convertedSize)}
                    </span>
                    {image.convertedSize < image.size && (
                      <span className="text-green-500">
                        (-{Math.round((1 - image.convertedSize / image.size) * 100)}%)
                      </span>
                    )}
                  </span>
                )}
              </div>

              {getStatusBadge(image.status)}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

