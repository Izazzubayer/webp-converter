"use client";

import { useState, useEffect } from "react";
import { Download, Loader2, RefreshCw, CheckCheck, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
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
  const allDone = doneCount > 0 && needsConversionCount === 0 && !isConverting;
  const progressPercent =
    conversionProgress.total > 0
      ? Math.round((conversionProgress.completed / conversionProgress.total) * 100)
      : 0;

  // Flash "just finished" state briefly after conversion completes
  const [justFinished, setJustFinished] = useState(false);
  useEffect(() => {
    if (allDone && doneCount > 0) {
      setJustFinished(true);
      const t = setTimeout(() => setJustFinished(false), 2200);
      return () => clearTimeout(t);
    }
  }, [allDone, doneCount]);

  const presets = [
    { label: "4K", w: 3840, h: 2160 },
    { label: "2K", w: 2560, h: 1440 },
    { label: "1080", w: 1920, h: 1080 },
    { label: "720", w: 1280, h: 720 },
  ];

  const isPresetSelected = (preset: { w: number; h: number }) =>
    options.maxWidth === preset.w && options.maxHeight === preset.h;

  // Quality label
  const qualityLabel =
    options.quality >= 85 ? "High" : options.quality >= 60 ? "Balanced" : "Small file";

  return (
    <div className="space-y-2">
      <Card className="p-3 sm:p-4 transition-shadow duration-300">
        <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 sm:gap-4">

          {/* ── Format Selector ── */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xs font-medium text-muted-foreground whitespace-nowrap hidden sm:inline">
              Format
            </span>
            <div className="flex gap-1 flex-wrap">
              {(["webp", "avif", "png", "jpeg"] as OutputFormat[]).map((format) => (
                <button
                  key={format}
                  title={{
                    webp: "Best balance of quality & size",
                    avif: "Smallest file, modern browsers",
                    png: "Lossless, supports transparency",
                    jpeg: "Universal compatibility",
                  }[format]}
                  onClick={() => onOptionsChange({ ...options, format })}
                  className={cn(
                    "relative h-7 sm:h-6 px-2.5 sm:px-2 rounded text-xs font-medium uppercase tracking-wide",
                    "border transition-all duration-150 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary/50",
                    options.format === format
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "border-border text-muted-foreground hover:border-primary/60 hover:text-foreground hover:bg-accent/40"
                  )}
                >
                  {format}
                  {/* active indicator dot */}
                  {options.format === format && (
                    <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-green-400 badge-pop" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <Separator orientation="vertical" className="h-6 hidden sm:block" />
          <Separator orientation="horizontal" className="w-full sm:hidden" />

          {/* ── Resolution Presets ── */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xs font-medium text-muted-foreground whitespace-nowrap hidden sm:inline">
              Presets
            </span>
            <div className="flex gap-1 flex-wrap">
              {presets.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() =>
                    onOptionsChange({ ...options, maxWidth: preset.w, maxHeight: preset.h })
                  }
                  className={cn(
                    "h-7 sm:h-6 px-2.5 sm:px-2 rounded text-xs font-medium",
                    "border transition-all duration-150 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary/50",
                    isPresetSelected(preset)
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "border-border text-muted-foreground hover:border-primary/60 hover:text-foreground hover:bg-accent/40"
                  )}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <Separator orientation="vertical" className="h-6 hidden sm:block" />
          <Separator orientation="horizontal" className="w-full sm:hidden" />

          {/* ── Quality Slider ── */}
          <div className="flex items-center gap-2 flex-1 min-w-0 sm:min-w-[160px]">
            <span className="text-xs font-medium text-muted-foreground whitespace-nowrap hidden sm:inline">
              Quality
            </span>
            <Slider
              value={[options.quality]}
              onValueChange={([value]) => onOptionsChange({ ...options, quality: value })}
              min={1}
              max={100}
              step={1}
              className="flex-1"
            />
            <div className="flex flex-col items-end flex-shrink-0 w-[52px]">
              <span className="text-xs font-medium tabular-nums leading-none">
                {options.quality}%
              </span>
              <span className="text-[10px] text-muted-foreground leading-none mt-0.5 hidden sm:block">
                {qualityLabel}
              </span>
            </div>
          </div>

          <Separator orientation="vertical" className="h-6 hidden sm:block" />
          <Separator orientation="horizontal" className="w-full sm:hidden" />

          {/* ── Actions ── */}
          <div className="flex items-center gap-2 sm:ml-auto w-full sm:w-auto">

            {/* Convert button */}
            <Button
              size="sm"
              onClick={onConvert}
              disabled={isConverting || needsConversionCount === 0}
              className={cn(
                "flex-1 sm:flex-initial min-w-0 sm:min-w-[120px] h-9 sm:h-8",
                "transition-all duration-150 active:scale-95",
                // All done → show muted "re-convert" look
                allDone && needsConversionCount === 0
                  ? "opacity-50"
                  : ""
              )}
            >
              {isConverting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  <span className="tabular-nums text-xs sm:text-sm">
                    {conversionProgress.completed}/{conversionProgress.total}
                  </span>
                </>
              ) : justFinished ? (
                <>
                  <CheckCheck className="w-4 h-4 mr-2 check-bounce" />
                  <span className="text-xs sm:text-sm">Done!</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  <span className="text-xs sm:text-sm">
                    Convert{needsConversionCount > 0 ? ` (${needsConversionCount})` : ""}
                  </span>
                </>
              )}
            </Button>

            {/* Download ZIP button — glows green when ready */}
            {doneCount > 0 && (
              <Button
                variant="secondary"
                size="sm"
                onClick={onDownloadZip}
                disabled={isConverting || isDownloading}
                className={cn(
                  "flex-1 sm:flex-initial h-9 sm:h-8",
                  "transition-all duration-200 active:scale-95",
                  // Lit-up state: green glow pulse
                  !isConverting && !isDownloading
                    ? "btn-download-ready"
                    : "opacity-60"
                )}
              >
                {isDownloading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    <span className="text-xs sm:text-sm">Packing…</span>
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

      {/* ── Progress bar ── shown while converting */}
      {isConverting && conversionProgress.total > 0 && (
        <div className="px-1 space-y-1.5">
          <div className="flex items-center gap-2 sm:gap-3">
            <Progress value={progressPercent} className="flex-1 h-1.5" />
            <span className="text-xs font-medium text-muted-foreground tabular-nums min-w-[46px] text-right">
              {progressPercent}%
            </span>
          </div>
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Zap className="w-3 h-3 text-yellow-400" />
            Running {Math.min(6, conversionProgress.total - conversionProgress.completed)} in parallel…
          </p>
        </div>
      )}
    </div>
  );
}
