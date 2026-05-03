# Image Handling

This document describes how images flow from the raw WordPress capture into the Astro build pipeline.

## Overview

```
capture/images/          ← immutable archive (Phase A2)
      ↓  consolidate-images.mjs (Phase A3)
src/assets/images/       ← one canonical original per logical image
      ↓  Astro <Image /> at build time
dist/_astro/             ← optimized size variants + WebP/AVIF
```

## Phase A2: Raw capture

`scripts/download-images.mjs` parses every HTML file under `capture/html/` for image references (`<img src>`, `srcset`, CSS `url()`, OG/Twitter meta tags) and downloads each unique image to `capture/images/`, preserving the full URL path (including hostname).

The result is an immutable archive of every image that appeared on the original site, including all WordPress-generated size variants. The manifest at `capture/images-manifest.json` records every downloaded URL with its local path, content-type, byte size, and SHA-256 hash.

**`capture/` is read-only after Phase A.** Never modify or delete files under `capture/`.

## Phase A3: Consolidation

WordPress generates many size variants per upload:

```
photo.jpg                  ← full-resolution original
photo-150x150.jpg
photo-300x200.jpg
photo-768x512.jpg
photo-1536x1024.jpg
```

`scripts/consolidate-images.mjs` consolidates these into `src/assets/images/` so the Astro image pipeline can generate variants at build time instead of shipping them all.

### Consolidation rule

For each group of same-image variants:

1. **Strip the trailing `-WIDTHxHEIGHT` segment** from the filename to identify the logical image.
   - `photo-300x200.jpg` → logical base `photo.jpg`
   - `img-scaled-700x700.jpg` → logical base `img-scaled.jpg` (the `-scaled` prefix is part of the name, not a size marker)
   - `foo-e1723133640306-700x877.png` → logical base `foo-e1723133640306.png` (the `-eNNNN` edit-timestamp prefix is preserved)
   - Only hyphens trigger stripping; `5KT7Z9X5_400x400.jpg` is unchanged (underscore separator)

2. **Choose the canonical original:**
   - Prefer the un-suffixed file (e.g., `photo.jpg`) if it was downloaded.
   - Otherwise, use the largest variant by file size (the highest-resolution proxy for the original).

3. **Copy the canonical to `src/assets/images/`**, preserving the relative path from `capture/images/`.

### manifest.json

`src/assets/images/manifest.json` maps every URL that appeared in captured HTML (including all srcset variants) to the canonical `src/assets/images/...` path:

```json
{
  "https://example.org/u/2024/05/photo-120x120.jpg": "src/assets/images/example.org/u/2024/05/photo.jpg",
  "https://example.org/u/2024/05/photo-300x200.jpg": "src/assets/images/example.org/u/2024/05/photo.jpg",
  "https://example.org/u/2024/05/photo.jpg":         "src/assets/images/example.org/u/2024/05/photo.jpg"
}
```

Phase D pages use this manifest to rewrite captured `<img src>` attributes to local imports.

### Re-running

The script is idempotent: if a canonical file already exists at the destination it is skipped. Run it again after a fresh `capture/` to pick up any newly downloaded images.

```bash
node scripts/consolidate-images.mjs
```

## Phase D: Using images in Astro pages

When migrating a page in Phase D, look up each image URL in `src/assets/images/manifest.json` to get its canonical asset path, then import and use it with Astro's `<Image />` component:

```astro
---
import { Image } from 'astro:assets';
import photo from '../assets/images/example.org/u/2024/05/photo.jpg';
---

<Image src={photo} alt="Description" />
```

Astro's built-in image pipeline (`astro:assets`) automatically:
- Generates optimized size variants
- Converts to WebP/AVIF where supported
- Emits correct `srcset` and `sizes` attributes
- Preserves aspect ratio and prevents layout shift

No extra Astro integration is needed — `astro:assets` is built in.

### Static paths that cannot use `<Image />`

For `og:image` and `twitter:image` meta tags, use `getImage()` to get the optimized URL:

```astro
---
import { getImage } from 'astro:assets';
import ogPhoto from '../assets/images/example.org/u/2024/06/og.jpg';
const og = await getImage({ src: ogPhoto, format: 'jpeg', width: 1200 });
---

<meta property="og:image" content={og.src} />
```
