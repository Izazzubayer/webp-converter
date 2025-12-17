import { DocsLayout } from "@/components/docs-layout";

export default function ParallelProcessingPage() {
  return (
    <DocsLayout title="Parallel Processing">
      <div className="space-y-4 text-muted-foreground">
        <p className="text-base leading-relaxed">
          Our converter uses <strong className="text-foreground">parallel processing</strong> to convert multiple images simultaneously, delivering up to <strong className="text-foreground">6x faster</strong> conversion speeds compared to sequential processing.
        </p>

        <h2 className="font-mono text-xl font-semibold text-foreground mt-6 mb-3">How It Works</h2>
        <p className="text-base leading-relaxed">
          Instead of converting images one at a time, our system processes multiple images concurrently. This takes full advantage of modern multi-core processors and browser capabilities.
        </p>

        <h2 className="font-mono text-xl font-semibold text-foreground mt-6 mb-3">Performance Benefits</h2>
        <ul className="list-disc list-inside space-y-2 text-base">
          <li><strong className="text-foreground">Faster batch conversions:</strong> Convert 10 images in the time it would take to convert 2-3 sequentially</li>
          <li><strong className="text-foreground">Better resource utilization:</strong> Maximizes CPU and memory usage without overwhelming your system</li>
          <li><strong className="text-foreground">Real-time progress:</strong> See each image complete as it finishes, not just at the end</li>
          <li><strong className="text-foreground">Scalable:</strong> Performance scales with the number of images you're converting</li>
        </ul>

        <h2 className="font-mono text-xl font-semibold text-foreground mt-6 mb-3">Smart Concurrency</h2>
        <p className="text-base leading-relaxed">
          Our system intelligently manages concurrent conversions to prevent browser overload. It processes images in optimal batches, ensuring smooth performance even when converting dozens of images at once.
        </p>

        <div className="mt-6 p-4 rounded-lg bg-card border border-border">
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Tip:</strong> The more images you convert at once, the more time you'll save with parallel processing!
          </p>
        </div>
      </div>
    </DocsLayout>
  );
}
