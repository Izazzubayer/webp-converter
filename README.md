# WebP Converter

A high-performance, client-side image conversion tool built with Next.js and Sharp. Convert images to WebP, AVIF, PNG, or JPEG with quality control and resizing options.

![WebP Converter](https://img.shields.io/badge/Next.js-16.0-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![Sharp](https://img.shields.io/badge/Sharp-0.34-green?style=flat-square)

## ✨ Features

- **Multiple Format Support**: Convert images to WebP, AVIF, PNG, or JPEG
- **High-Quality Processing**: Powered by Sharp (libvips) for professional-grade image conversion
- **Batch Conversion**: Upload and convert multiple images at once
- **Quality Control**: Adjustable quality slider (1-100%)
- **Smart Resizing**: Preset resolutions (4K, 2K, 1080, 720) or custom dimensions
- **Aspect Ratio**: Maintain aspect ratio during resizing
- **Bulk Download**: Download all converted images as a ZIP file
- **Privacy-First**: All processing happens client-side - no data stored, ever
- **Modern UI**: Beautiful, responsive interface built with Tailwind CSS and Radix UI

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Izazzubayer/webp-converter.git
cd webp-converter
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📦 Build for Production

```bash
npm run build
npm start
```

## 🛠️ Tech Stack

- **[Next.js 16](https://nextjs.org/)** - React framework
- **[Sharp](https://sharp.pixelplumbing.com/)** - High-performance image processing
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety
- **[Tailwind CSS](https://tailwindcss.com/)** - Styling
- **[Radix UI](https://www.radix-ui.com/)** - Accessible component primitives
- **[Lucide React](https://lucide.dev/)** - Icon library
- **[Sonner](https://sonner.emilkowal.ski/)** - Toast notifications
- **[JSZip](https://stuk.github.io/jszip/)** - ZIP file generation

## 📖 Usage

1. **Upload Images**: Drag and drop images or click to browse
   - Supports: JPEG, PNG, GIF, WebP, BMP, TIFF

2. **Select Format**: Choose your output format (WebP, AVIF, PNG, JPEG)

3. **Adjust Quality**: Use the slider to set quality (1-100%)

4. **Choose Preset** (optional): Select a resolution preset or set custom dimensions

5. **Convert**: Click the "Convert" button to process all images

6. **Download**: Download individual images or all as a ZIP file

## 🎨 Features in Detail

### Format Selection
- **WebP**: Best balance of quality & size (recommended)
- **AVIF**: Smallest size, modern browsers only
- **PNG**: Lossless, supports transparency
- **JPEG**: Universal, good compression

### Quality Control
Adjust the quality slider to balance file size and image quality. Lower values result in smaller files but may reduce image quality.

### Resizing
Use preset buttons (4K, 2K, 1080, 720) for quick resizing, or the dimensions are automatically set. Images maintain aspect ratio by default.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Built for web developers who need optimized images
- Made with ❤️ by [Pixel Mango](https://pixelmango.studio/)

## 📧 Support

If you have any questions or issues, please open an issue on [GitHub](https://github.com/Izazzubayer/webp-converter/issues).

---

**Note**: This project processes images entirely client-side. No data is sent to any server or stored anywhere. Your privacy is guaranteed.
