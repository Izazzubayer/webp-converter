import { DocsLayout } from "@/components/docs-layout";

export default function BatchConvertPage() {
  return (
    <DocsLayout title="Batch Convert">
      <div className="space-y-4 text-muted-foreground">
        <p className="text-base leading-relaxed">
          Convert <strong className="text-foreground">multiple images at once</strong> with our batch conversion feature. Upload dozens of images, set your preferences, and convert them all in a single operation.
        </p>

        <h2 className="font-mono text-xl font-semibold text-foreground mt-6 mb-3">Features</h2>
        <ul className="list-disc list-inside space-y-2 text-base">
          <li><strong className="text-foreground">Drag & drop multiple files:</strong> Select or drag multiple images at once for quick uploads</li>
          <li><strong className="text-foreground">Unified settings:</strong> Apply the same quality, format, and resize settings to all images</li>
          <li><strong className="text-foreground">Individual preview:</strong> See each image before and after conversion</li>
          <li><strong className="text-foreground">Bulk download:</strong> Download all converted images as a single ZIP file</li>
        </ul>

        <h2 className="font-mono text-xl font-semibold text-foreground mt-6 mb-3">How to Use</h2>
        <ol className="list-decimal list-inside space-y-2 text-base">
          <li>Upload multiple images using the drag & drop area or file picker</li>
          <li>Adjust your conversion settings (format, quality, dimensions)</li>
          <li>Click "Convert All" to process all images simultaneously</li>
          <li>Review the results and download individually or as a ZIP</li>
        </ol>

        <h2 className="font-mono text-xl font-semibold text-foreground mt-6 mb-3">Supported Formats</h2>
        <p className="text-base leading-relaxed">
          You can upload images in JPEG, PNG, GIF, WebP, BMP, or TIFF format, and convert them to WebP, AVIF, PNG, or JPEG. The converter automatically handles format detection and conversion.
        </p>

        <div className="mt-6 p-4 rounded-lg bg-card border border-border">
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Pro tip:</strong> Combine batch conversion with parallel processing for maximum efficiency when working with large image sets!
          </p>
        </div>
      </div>
    </DocsLayout>
  );
}
