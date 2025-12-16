"use client";

import { Download, Loader2, Settings2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
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

  return (
    <div className="space-y-4">
      {/* Main Toolbar */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Format Selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground whitespace-nowrap">Format:</span>
            <div className="flex gap-1">
              {(["webp", "avif", "png", "jpeg"] as OutputFormat[]).map((format) => (
                <Button
                  key={format}
                  variant={options.format === format ? "default" : "outline"}
                  size="sm"
                  className="text-xs h-8 px-3 uppercase"
                  onClick={() => onOptionsChange({ ...options, format })}
                >
                  {format}
                </Button>
              ))}
            </div>
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Quality */}
          <div className="flex items-center gap-3 min-w-[200px]">
            <span className="text-sm text-muted-foreground whitespace-nowrap">Quality:</span>
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
            <span className="text-sm font-medium tabular-nums w-10 text-right">
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

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings2 className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <div className="p-3 space-y-4">
                  {/* Dimensions */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium">Max Dimensions</label>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Width</label>
                        <Input
                          type="number"
                          value={options.maxWidth}
                          onChange={(e) =>
                            onOptionsChange({
                              ...options,
                              maxWidth: parseInt(e.target.value) || 0,
                            })
                          }
                          min={1}
                          max={10000}
                          className="h-8 text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Height</label>
                        <Input
                          type="number"
                          value={options.maxHeight}
                          onChange={(e) =>
                            onOptionsChange({
                              ...options,
                              maxHeight: parseInt(e.target.value) || 0,
                            })
                          }
                          min={1}
                          max={10000}
                          className="h-8 text-xs"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="aspectRatio"
                        checked={options.maintainAspectRatio}
                        onChange={(e) =>
                          onOptionsChange({
                            ...options,
                            maintainAspectRatio: e.target.checked,
                          })
                        }
                        className="rounded border-border"
                      />
                      <label htmlFor="aspectRatio" className="text-xs text-muted-foreground cursor-pointer">
                        Maintain aspect ratio
                      </label>
                    </div>
                  </div>

                  <DropdownMenuSeparator />

                  {/* Presets */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium">Quick Presets</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: "Full HD", w: 1920, h: 1080 },
                        { label: "4K", w: 3840, h: 2160 },
                        { label: "2K", w: 2560, h: 1440 },
                        { label: "HD", w: 1280, h: 720 },
                      ].map((preset) => (
                        <Button
                          key={preset.label}
                          variant="outline"
                          size="sm"
                          className="text-xs h-7"
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
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </Card>
    </div>
  );
}

