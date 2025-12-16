"use client";

import { Trash2, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import type { ImageFile, ConversionOptions } from "@/app/page";

interface ConversionSettingsProps {
  options: ConversionOptions;
  onOptionsChange: (options: ConversionOptions) => void;
  images: ImageFile[];
  onConvert: () => Promise<void>;
  onClearAll: () => void;
  isConverting: boolean;
}

export function ConversionSettings({
  options,
  onOptionsChange,
  images,
  onConvert,
  onClearAll,
  isConverting,
}: ConversionSettingsProps) {
  const pendingCount = images.filter((img) => img.status === "pending").length;
  const doneCount = images.filter((img) => img.status === "done").length;

  return (
    <Card className="sticky top-24">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Conversion Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quality Slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Quality</label>
            <span className="text-sm text-muted-foreground tabular-nums">
              {options.quality}%
            </span>
          </div>
          <Slider
            value={[options.quality]}
            onValueChange={([value]) =>
              onOptionsChange({ ...options, quality: value })
            }
            min={1}
            max={100}
            step={1}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            Higher quality = larger file size
          </p>
        </div>

        <Separator />

        {/* Max Dimensions */}
        <div className="space-y-3">
          <label className="text-sm font-medium">Max Dimensions</label>
          <div className="grid grid-cols-2 gap-3">
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
                className="h-9"
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
                className="h-9"
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

        <Separator />

        {/* Preset Dimensions */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Quick Presets</label>
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
                className="text-xs h-8"
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

        <Separator />

        {/* Actions */}
        <div className="space-y-3">
          <Button
            className="w-full"
            size="lg"
            onClick={onConvert}
            disabled={isConverting || pendingCount === 0}
          >
            {isConverting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Converting...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Convert {pendingCount > 0 ? `(${pendingCount})` : "All"}
              </>
            )}
          </Button>

          {doneCount > 0 && (
            <Button variant="secondary" className="w-full" disabled={isConverting}>
              <Download className="w-4 h-4 mr-2" />
              Download All as ZIP
            </Button>
          )}

          <Button
            variant="ghost"
            className="w-full text-destructive hover:text-destructive"
            onClick={onClearAll}
            disabled={isConverting}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear All
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

