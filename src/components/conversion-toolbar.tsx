"use client";

import { Download, Loader2, RefreshCw } from "lucide-react";
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
      <Card className="p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 sm:gap-4">
          {/* Format Selector */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xs font-medium text-muted-foreground whitespace-nowrap hidden sm:inline">Format</span>
            <div className="flex gap-1 flex-wrap">
              {(["webp", "avif", "png", "jpeg"] as OutputFormat[]).map((format) => (
                <Button
                  key={format}
                  variant={options.format === format ? "default" : "outline"}
                  size="sm"
                  className="text-xs font-medium h-7 sm:h-6 px-2.5 sm:px-2 uppercase"
                  onClick={() => onOptionsChange({ ...options, format })}
                >
                  {format}
                </Button>
              ))}
            </div>
          </div>

          <Separator orientation="vertical" className="h-6 hidden sm:block" />
          <Separator orientation="horizontal" className="w-full sm:hidden" />

          {/* Presets */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xs font-medium text-muted-foreground whitespace-nowrap hidden sm:inline">Presets</span>
            <div className="flex gap-1 flex-wrap">
              {presets.map((preset) => (
                <Button
                  key={preset.label}
                  variant={isPresetSelected(preset) ? "default" : "outline"}
                  size="sm"
                  className="text-xs font-medium h-7 sm:h-6 px-2.5 sm:px-2"
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

          <Separator orientation="vertical" className="h-6 hidden sm:block" />
          <Separator orientation="horizontal" className="w-full sm:hidden" />

          {/* Quality */}
          <div className="flex items-center gap-2 flex-1 min-w-0 sm:min-w-[150px]">
            <span className="text-xs font-medium text-muted-foreground whitespace-nowrap hidden sm:inline">Quality</span>
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
            <span className="text-xs font-medium tabular-nums w-10 sm:w-10 text-right flex-shrink-0">
              {options.quality}%
            </span>
          </div>

          <Separator orientation="vertical" className="h-6 hidden sm:block" />
          <Separator orientation="horizontal" className="w-full sm:hidden" />

          {/* Actions */}
          <div className="flex items-center gap-2 sm:ml-auto w-full sm:w-auto">
            <Button
              size="sm"
              onClick={onConvert}
              disabled={isConverting || needsConversionCount === 0}
              className="flex-1 sm:flex-initial min-w-0 sm:min-w-[120px] h-9 sm:h-8"
            >
              {isConverting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  <span className="tabular-nums text-xs sm:text-sm">
                    {conversionProgress.completed}/{conversionProgress.total}
                  </span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  <span className="text-xs sm:text-sm">
                    Convert {needsConversionCount > 0 && `(${needsConversionCount})`}
                  </span>
                </>
              )}
            </Button>

            {doneCount > 0 && (
              <Button
                variant="secondary"
                size="sm"
                onClick={onDownloadZip}
                disabled={isConverting || isDownloading}
                className="flex-1 sm:flex-initial h-9 sm:h-8"
              >
                {isDownloading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    <span className="text-xs sm:text-sm">Creating...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    <span className="text-xs sm:text-sm">
                      <span className="hidden sm:inline">Download </span>({doneCount})
                    </span>
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
          <div className="flex items-center gap-2 sm:gap-3">
            <Progress value={progressPercent} className="flex-1 h-2" />
            <span className="text-xs font-medium text-muted-foreground tabular-nums min-w-[50px] sm:min-w-[60px] text-right">
              {progressPercent}%
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Processing {Math.min(6, conversionProgress.total - conversionProgress.completed)} images in parallel...
          </p>
        </div>
      )}
    </div>
  );
}
