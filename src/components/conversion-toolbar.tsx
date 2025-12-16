"use client";

import { Download, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
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
}: ConversionToolbarProps) {
  const doneCount = images.filter((img) => img.status === "done").length;

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
    <div className="space-y-4">
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
            >
              {isConverting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Converting...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
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
    </div>
  );
}

