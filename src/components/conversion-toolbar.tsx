"use client";

import { useState } from "react";
import { Trash2, Download, Loader2, Archive, Settings2, X, CheckSquare, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import type { ImageFile, ConversionOptions, OutputFormat } from "@/app/page";

interface ConversionToolbarProps {
  options: ConversionOptions;
  onOptionsChange: (options: ConversionOptions) => void;
  images: ImageFile[];
  selectedIds: Set<string>;
  onConvert: () => Promise<void>;
  onDownloadZip: () => Promise<void>;
  onClearAll: () => void;
  onSelectAll: () => void;
  onDeleteSelected: () => void;
  onDownloadSelected: () => void;
  isConverting: boolean;
  isDownloading: boolean;
}

export function ConversionToolbar({
  options,
  onOptionsChange,
  images,
  selectedIds,
  onConvert,
  onDownloadZip,
  onClearAll,
  onSelectAll,
  onDeleteSelected,
  onDownloadSelected,
  isConverting,
  isDownloading,
}: ConversionToolbarProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const pendingCount = images.filter((img) => img.status === "pending").length;
  const doneCount = images.filter((img) => img.status === "done").length;
  const selectedCount = selectedIds.size;
  const allSelected = selectedCount === images.length && images.length > 0;
  const selectedConvertedCount = images.filter(
    (img) => selectedIds.has(img.id) && img.status === "done"
  ).length;

  return (
    <div className="space-y-4">
      {/* Selection Bar (when items selected) */}
      {selectedCount > 0 && (
        <Card className="p-3 bg-primary/5 border-primary/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={onSelectAll}
                className="h-8"
              >
                {allSelected ? (
                  <CheckSquare className="w-4 h-4 mr-2" />
                ) : (
                  <Square className="w-4 h-4 mr-2" />
                )}
                {allSelected ? "Deselect All" : "Select All"}
              </Button>
              <span className="text-sm font-medium">
                {selectedCount} selected
              </span>
            </div>
            <div className="flex items-center gap-2">
              {selectedConvertedCount > 0 && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={onDownloadSelected}
                  disabled={isDownloading}
                >
                  {isDownloading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4 mr-2" />
                  )}
                  Download ({selectedConvertedCount})
                </Button>
              )}
              <Button
                variant="destructive"
                size="sm"
                onClick={onDeleteSelected}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete ({selectedCount})
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Main Toolbar */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Select All Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={onSelectAll}
            className="h-8"
          >
            {allSelected ? (
              <CheckSquare className="w-4 h-4" />
            ) : (
              <Square className="w-4 h-4" />
            )}
          </Button>

          <Separator orientation="vertical" className="h-6" />

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
                  Convert {pendingCount > 0 && `(${pendingCount})`}
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
                    <Archive className="w-4 h-4 mr-2" />
                    ZIP ({doneCount})
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

            <Button
              variant="ghost"
              size="sm"
              onClick={onClearAll}
              disabled={isConverting}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

