# Image Converter - Requirements & Setup

## 🚀 Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📋 Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# ============================================
# OPTIONAL: AI Enhancement Features
# ============================================

# Hugging Face API Token (for AI-powered image enhancement/upscaling)
# Get your token from: https://huggingface.co/settings/tokens
NEXT_PUBLIC_HUGGINGFACE_API_TOKEN=

# ============================================
# NOTES
# ============================================
# - All core conversion features work WITHOUT any API keys
# - AI enhancement features are OPTIONAL and require Hugging Face token
# - No database required - everything runs client-side
```

---

## 🔑 API Keys Setup Guide

### Hugging Face (Optional - for AI Enhancement)

1. Go to [Hugging Face](https://huggingface.co/)
2. Create an account or sign in
3. Navigate to **Settings** → **Access Tokens**
4. Click **New token** → Give it a name → Select **Read** permission
5. Copy the token and paste it in `.env.local`

**Note:** The Hugging Face free tier allows:
- Unlimited inference on most models
- Rate limits apply (varies by model)

---

## 📦 Tech Stack

| Technology | Purpose |
|------------|---------|
| Next.js 15 | React framework |
| TypeScript | Type safety |
| Tailwind CSS v4 | Styling |
| shadcn/ui | UI components (zinc theme) |
| browser-image-compression | Client-side image processing |
| JSZip | Batch download as ZIP |
| FileSaver.js | File download handling |
| Lucide React | Icons |

---

## ✨ Features

### Core (No API Required)
- [x] Single image to WebP conversion
- [x] Batch image conversion
- [x] Quality control slider
- [x] Resize options
- [x] Preview before/after
- [x] Download individual or ZIP
- [x] Drag & drop upload
- [x] Dark/Light mode

### Optional (Requires Hugging Face API)
- [ ] AI-powered image enhancement
- [ ] Super resolution upscaling
- [ ] Background removal
- [ ] Noise reduction

---

## 🔒 Privacy & Security

- **No server uploads** - All processing happens in your browser
- **No data storage** - Images are never stored anywhere
- **No tracking** - No analytics or user tracking
- **100% client-side** - Your images never leave your device

---

## 🛠️ Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run production build
npm start

# Lint code
npm run lint
```

---

## 📝 TODO (Development Roadmap)

### Segment 1 ✅
- [x] Project setup
- [x] shadcn/ui initialization
- [x] Requirements documentation

### Segment 2 (Current)
- [ ] Basic layout & header
- [ ] File upload dropzone
- [ ] Image preview grid

### Segment 3
- [ ] Conversion settings panel
- [ ] Quality slider
- [ ] Resize options

### Segment 4
- [ ] Conversion engine
- [ ] Progress indicators
- [ ] Download functionality

### Segment 5
- [ ] Batch processing
- [ ] ZIP download
- [ ] Polish & UX improvements

### Segment 6 (Optional)
- [ ] AI enhancement integration
- [ ] Hugging Face API connection

---

## 🐛 Troubleshooting

**Images not converting?**
- Ensure your browser supports WebP (all modern browsers do)
- Check if the image file is corrupted
- Try a smaller file first

**Slow performance with large images?**
- Large images take longer to process client-side
- Consider reducing quality or dimensions
- Close other browser tabs to free up memory

**AI features not working?**
- Verify your Hugging Face API token is correct
- Check the browser console for error messages
- Ensure you have API credits remaining

