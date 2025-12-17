import { DocsLayout } from "@/components/docs-layout";

export default function NoDataStoredPage() {
  return (
    <DocsLayout title="No Data Stored">
      <div className="space-y-4 text-muted-foreground">
        <p className="text-base leading-relaxed">
          Your privacy is our top priority. <strong className="text-foreground">All image processing happens entirely in your browser</strong> - no data is ever sent to our servers or stored anywhere.
        </p>

        <h2 className="font-mono text-xl font-semibold text-foreground mt-6 mb-3">Privacy-First Architecture</h2>
        <p className="text-base leading-relaxed">
          Unlike cloud-based image converters, our tool runs completely client-side. Your images are processed locally using WebAssembly, ensuring they never leave your device.
        </p>

        <h2 className="font-mono text-xl font-semibold text-foreground mt-6 mb-3">What This Means</h2>
        <ul className="list-disc list-inside space-y-2 text-base">
          <li><strong className="text-foreground">No server uploads:</strong> Images are never sent to any server</li>
          <li><strong className="text-foreground">No data storage:</strong> We don't store, log, or track your images</li>
          <li><strong className="text-foreground">No tracking:</strong> Your conversion activity is completely private</li>
        </ul>

        <h2 className="font-mono text-xl font-semibold text-foreground mt-6 mb-3">Security Benefits</h2>
        <p className="text-base leading-relaxed">
          By processing images locally, you maintain complete control over your data. This is especially important for:
        </p>
        <ul className="list-disc list-inside space-y-2 text-base mt-2">
          <li>Sensitive or confidential images</li>
          <li>Personal photos and private content</li>
          <li>Corporate or proprietary images</li>
          <li>Any content you want to keep completely private</li>
        </ul>

        <h2 className="font-mono text-xl font-semibold text-foreground mt-6 mb-3">How It Works</h2>
        <p className="text-base leading-relaxed">
          The Sharp image processing library runs in your browser via WebAssembly. All conversion operations - resizing, format changes, quality adjustments - happen entirely within your browser's memory. Once you close the page or clear your browser data, all temporary image data is automatically removed.
        </p>

        <div className="mt-6 p-4 rounded-lg bg-card border border-border">
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Your privacy is guaranteed:</strong> We have no way to access, view, or store your images because they never leave your device.
          </p>
        </div>
      </div>
    </DocsLayout>
  );
}
