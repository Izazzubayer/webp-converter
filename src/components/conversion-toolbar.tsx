"use client";

import { Download, Loader2, RefreshCw, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import type { ImageFile, ConversionOptions, OutputFormat } from "@/app/page";

interface ConversionToolbarProps {
  options: ConversionOptions;
  onOptionsChange: (options: ConversionOptions) => void;
  images: ImageFile[];
  onConvert: () => Promise<void>;
  onDownloadZip: () => Promise<void>;
  isConverting: boolean;
  isDownloading: boolean;
  needsConversionCount: number;
  conversionProgress?: { completed: number; total: number };
}

export function ConversionToolbar({
  options,
  onOptionsChange,
  images,
  onConvert,
  onDownloadZip,
  isConverting,
  isDownloading,
  needsConversionCount,
  conversionProgress = { completed: 0, total: 0 },
}: ConversionToolbarProps) {
  const doneCount = images.filter((img) => img.status === "done").length;
  const progressPercent = conversionProgress.total > 0 
    ? Math.round((conversionProgress.completed / conversionProgress.total) * 100) 
    : 0;

  const presets = [
    { label: "4K", w: 3840, h: 2160 },
    { label: "2K", w: 2560, h: 1440 },
    { label: "1080", w: 1920, h: 1080 },
    { label: "720", w: 1280, h: 720 },
  ];

  const isPresetSelected = (preset: { w: number; h: number }) => {
    return options.maxWidth === preset.w && options.maxHeight === preset.h;
  };

  return (
    <div className="space-y-2">
      {/* Main Toolbar */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Format Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">Format</span>
            <div className="flex gap-1">
              {(["webp", "avif", "png", "jpeg"] as OutputFormat[]).map((format) => (
                <Button
                  key={format}
                  variant={options.format === format ? "default" : "outline"}
                  size="sm"
                  className="text-xs font-medium h-6 px-2 uppercase"
                  onClick={() => onOptionsChange({ ...options, format })}
                >
                  {format}
                </Button>
              ))}
            </div>
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Presets */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">Presets</span>
            <div className="flex gap-1">
              {presets.map((preset) => (
                <Button
                  key={preset.label}
                  variant={isPresetSelected(preset) ? "default" : "outline"}
                  size="sm"
                  className="text-xs font-medium h-6 px-2"
                  onClick={() =>
                    onOptionsChange({
                      ...options,
                      maxWidth: preset.w,
                      maxHeight: preset.h,
                    })
                  }
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Quality */}
          <div className="flex items-center gap-2 min-w-[150px]">
            <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">Quality</span>
            <Slider
              value={[options.quality]}
              onValueChange={([value]) =>
                onOptionsChange({ ...options, quality: value })
              }
              min={1}
              max={100}
              step={1}
              className="flex-1"
            />
            <span className="text-xs font-medium tabular-nums w-10 text-right">
              {options.quality}%
            </span>
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Actions */}
          <div className="flex items-center gap-2 ml-auto">
            <Button
              size="sm"
              onClick={onConvert}
              disabled={isConverting || needsConversionCount === 0}
              className="min-w-[120px]"
            >
              {isConverting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  <span className="tabular-nums">
                    {conversionProgress.completed}/{conversionProgress.total}
                  </span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Convert {needsConversionCount > 0 && `(${needsConversionCount})`}
                </>
              )}
            </Button>

            {doneCount > 0 && (
              <Button
                variant="secondary"
                size="sm"
                onClick={onDownloadZip}
                disabled={isConverting || isDownloading}
              >
                {isDownloading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Download ({doneCount})
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Progress Bar - Only show during conversion */}
      {isConverting && conversionProgress.total > 0 && (
        <div className="px-1">
          <div className="flex items-center gap-3">
            <Progress value={progressPercent} className="flex-1 h-2" />
            <span className="text-xs font-medium text-muted-foreground tabular-nums min-w-[60px] text-right">
              {progressPercent}% done
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            <Zap className="w-3 h-3 text-primary" />
            Processing {Math.min(6, conversionProgress.total - conversionProgress.completed)} images in parallel...
          </p>
        </div>
      )}
    </div>
  );
}
