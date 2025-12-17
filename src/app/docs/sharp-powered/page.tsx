import { DocsLayout } from "@/components/docs-layout";

export default function SharpPoweredPage() {
  return (
    <DocsLayout title="Sharp Powered">
      <div className="space-y-4 text-muted-foreground">
        <p className="text-base leading-relaxed">
          Our image converter is powered by <strong className="text-foreground">Sharp</strong>, a high-performance Node.js image processing library built on top of <strong className="text-foreground">libvips</strong>.
        </p>

        <h2 className="font-mono text-xl font-semibold text-foreground mt-6 mb-3">Why Sharp?</h2>
        <ul className="list-disc list-inside space-y-2 text-base">
          <li><strong className="text-foreground">Professional-grade quality:</strong> libvips is used by major image processing services and provides industry-standard image conversion</li>
          <li><strong className="text-foreground">Memory efficient:</strong> Processes images in streaming fashion, using minimal memory even for large files</li>
          <li><strong className="text-foreground">Fast processing:</strong> Optimized C++ backend ensures quick conversions without compromising quality</li>
          <li><strong className="text-foreground">Format support:</strong> Handles WebP, AVIF, PNG, JPEG, and many other formats with precision</li>
        </ul>

        <h2 className="font-mono text-xl font-semibold text-foreground mt-6 mb-3">Technical Details</h2>
        <p className="text-base leading-relaxed">
          Sharp uses libvips, a demand-driven, horizontally threaded image processing library. Unlike traditional image libraries that load entire images into memory, libvips processes images in small tiles, making it incredibly memory-efficient and fast.
        </p>

        <div className="mt-6 p-4 rounded-lg bg-card border border-border">
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Note:</strong> All processing happens client-side in your browser. Sharp runs via WebAssembly, ensuring your images never leave your device.
          </p>
        </div>
      </div>
    </DocsLayout>
  );
}
