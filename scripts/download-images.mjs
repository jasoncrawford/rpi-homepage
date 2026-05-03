#!/usr/bin/env node
/**
 * Phase A2: Download all images referenced in captured HTML.
 *
 * Parses every file in capture/html/ for image references:
 *   - <img src>, <img srcset>, <source srcset>
 *   - <link rel="icon">, <link rel="apple-touch-icon">
 *   - og:image, twitter:image, msapplication-TileImage meta tags
 *   - Inline CSS url() references (image files only)
 *
 * Downloads each unique image to capture/images/ preserving the URL path.
 * Writes capture/images-manifest.json with url, path, contentType, bytes,
 * sha256, and sourceUrls (the HTML files that referenced each image).
 *
 * Usage: node scripts/download-images.mjs
 */

import { fileURLToPath } from 'url';
import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';

const CAPTURE_DIR = 'capture';
const HTML_DIR = path.join(CAPTURE_DIR, 'html');
const IMAGES_DIR = path.join(CAPTURE_DIR, 'images');
const IMAGES_MANIFEST_PATH = path.join(CAPTURE_DIR, 'images-manifest.json');
const USER_AGENT = 'rpi-migration-capture/1.0';
const DEFAULT_DELAY_MS = 1000;
const DEFAULT_CONCURRENCY = 1;

const IMAGE_EXTENSIONS = new Set([
  '.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.ico',
  '.avif', '.tiff', '.tif', '.bmp',
]);

// ---------------------------------------------------------------------------
// Pure parsing functions (exported for tests)
// ---------------------------------------------------------------------------

/**
 * Parse a srcset attribute value and return an array of URL strings.
 * Handles "url w, url w" and "url 1x, url 2x" formats.
 */
export function parseSrcset(srcset) {
  return srcset
    .split(',')
    .map(entry => entry.trim().split(/\s+/)[0])
    .filter(url => url.length > 0);
}

/**
 * Return true if the URL looks like an image (based on path extension).
 */
function looksLikeImage(url) {
  if (!url || url.startsWith('data:')) return false;
  try {
    const u = new URL(url);
    const ext = path.extname(u.pathname).toLowerCase();
    return IMAGE_EXTENSIONS.has(ext);
  } catch {
    return false;
  }
}

/**
 * Extract all image URLs referenced in an HTML string.
 * Returns a Set<string> of absolute URLs.
 *
 * @param {string} html  - raw HTML content
 * @param {string} sourceUrl - the URL of the page (for resolving relative refs)
 */
export function extractImageUrls(html, sourceUrl) {
  const urls = new Set();

  const add = (raw) => {
    if (!raw || raw.startsWith('data:')) return;
    try {
      const abs = new URL(raw, sourceUrl).href;
      // Strip query and fragment for deduplication; keep path
      const clean = new URL(abs);
      clean.search = '';
      clean.hash = '';
      if (looksLikeImage(clean.href)) {
        urls.add(clean.href);
      }
    } catch {
      // ignore malformed URLs
    }
  };

  // <img src="...">
  for (const m of html.matchAll(/<img\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi)) {
    add(m[1]);
  }

  // <img srcset="...">
  for (const m of html.matchAll(/<img\b[^>]*\bsrcset=["']([^"']+)["'][^>]*>/gi)) {
    for (const u of parseSrcset(m[1])) add(u);
  }

  // <source srcset="...">
  for (const m of html.matchAll(/<source\b[^>]*\bsrcset=["']([^"']+)["'][^>]*>/gi)) {
    for (const u of parseSrcset(m[1])) add(u);
  }

  // <link rel="icon"> and <link rel="apple-touch-icon">
  for (const m of html.matchAll(/<link\b[^>]*\brel=["']([^"']+)["'][^>]*\bhref=["']([^"']+)["'][^>]*>/gi)) {
    const rel = m[1].toLowerCase();
    if (rel === 'icon' || rel === 'apple-touch-icon') add(m[2]);
  }
  // Also handle reversed attribute order: href before rel
  for (const m of html.matchAll(/<link\b[^>]*\bhref=["']([^"']+)["'][^>]*\brel=["']([^"']+)["'][^>]*>/gi)) {
    const rel = m[2].toLowerCase();
    if (rel === 'icon' || rel === 'apple-touch-icon') add(m[1]);
  }

  // <meta property="og:image" content="...">
  for (const m of html.matchAll(/<meta\b[^>]*\bproperty=["']og:image["'][^>]*\bcontent=["']([^"']+)["'][^>]*>/gi)) {
    add(m[1]);
  }
  // Also reversed attribute order
  for (const m of html.matchAll(/<meta\b[^>]*\bcontent=["']([^"']+)["'][^>]*\bproperty=["']og:image["'][^>]*>/gi)) {
    add(m[1]);
  }

  // <meta name="twitter:image" content="...">
  for (const m of html.matchAll(/<meta\b[^>]*\bname=["']twitter:image["'][^>]*\bcontent=["']([^"']+)["'][^>]*>/gi)) {
    add(m[1]);
  }
  for (const m of html.matchAll(/<meta\b[^>]*\bcontent=["']([^"']+)["'][^>]*\bname=["']twitter:image["'][^>]*>/gi)) {
    add(m[1]);
  }

  // <meta name="msapplication-TileImage" content="...">
  for (const m of html.matchAll(/<meta\b[^>]*\bname=["']msapplication-TileImage["'][^>]*\bcontent=["']([^"']+)["'][^>]*>/gi)) {
    add(m[1]);
  }
  for (const m of html.matchAll(/<meta\b[^>]*\bcontent=["']([^"']+)["'][^>]*\bname=["']msapplication-TileImage["'][^>]*>/gi)) {
    add(m[1]);
  }

  // Inline CSS url(...) — only image files, not fonts or other assets
  for (const m of html.matchAll(/url\(["']?([^"')]+)["']?\)/gi)) {
    add(m[1]);
  }

  return urls;
}

/**
 * Convert an image URL to a local file path under capture/images/.
 * Preserves the host and URL path; strips query string and fragment.
 *
 * e.g. https://rootsofprogress.org/wp-content/uploads/2024/06/photo.jpg
 *   → capture/images/rootsofprogress.org/wp-content/uploads/2024/06/photo.jpg
 */
export function urlToImagePath(urlStr) {
  const u = new URL(urlStr);
  // Strip query and fragment
  u.search = '';
  u.hash = '';
  const hostAndPath = u.hostname + u.pathname;
  return path.join(IMAGES_DIR, hostAndPath);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithUA(url) {
  return fetch(url, {
    headers: { 'User-Agent': USER_AGENT },
    redirect: 'follow',
  });
}

function sha256(buf) {
  return crypto.createHash('sha256').update(buf).digest('hex');
}

/** Walk a directory recursively, yielding file paths. */
async function* walkDir(dir) {
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walkDir(full);
    } else {
      yield full;
    }
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function parseArgs(argv) {
  const args = { delay: DEFAULT_DELAY_MS, concurrency: DEFAULT_CONCURRENCY };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--delay' && argv[i + 1]) args.delay = Number(argv[++i]);
    else if (argv[i] === '--concurrency' && argv[i + 1]) args.concurrency = Number(argv[++i]);
  }
  return args;
}

async function downloadOne(url, sourcePaths, { delayMs, captureDir, imagesDir }) {
  const sourceUrls = [...sourcePaths].sort();
  const localPath = urlToImagePath(url);
  const relPath = path.relative(captureDir, localPath);

  console.log(`  GET ${url}`);
  let res;
  try {
    res = await fetchWithUA(url);
  } catch (err) {
    console.warn(`  ERROR ${url}: ${err.message}`);
    await sleep(delayMs);
    return { url, path: null, contentType: null, bytes: null, sha256: null, sourceUrls, error: err.message };
  }

  if (!res.ok) {
    console.warn(`  ${res.status} ${url}`);
    await sleep(delayMs);
    return { url, path: null, contentType: res.headers.get('content-type') || null, bytes: null, sha256: null, sourceUrls, httpStatus: res.status };
  }

  const buf = Buffer.from(await res.arrayBuffer());
  const contentType = res.headers.get('content-type') || '';
  const hash = sha256(buf);

  await fs.mkdir(path.dirname(localPath), { recursive: true });
  await fs.writeFile(localPath, buf);

  await sleep(delayMs);
  return { url, path: relPath, contentType, bytes: buf.length, sha256: hash, sourceUrls };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  console.log(`Phase A2: Download images referenced in captured HTML`);
  console.log(`  delay=${args.delay}ms  concurrency=${args.concurrency}\n`);

  await fs.mkdir(IMAGES_DIR, { recursive: true });

  // Collect all HTML files
  const htmlFiles = [];
  for await (const f of walkDir(HTML_DIR)) {
    if (f.endsWith('.html')) htmlFiles.push(f);
  }
  console.log(`Found ${htmlFiles.length} HTML files to parse\n`);

  // Map from image URL → Set of source HTML file paths
  const imageSourceMap = new Map();

  for (const htmlFile of htmlFiles) {
    const html = await fs.readFile(htmlFile, 'utf8');
    const rel = path.relative(HTML_DIR, htmlFile);
    const urlPath = '/' + rel.replace(/index\.html$/, '').replace(/\\/g, '/');
    const sourceUrl = 'https://rootsofprogress.org' + urlPath;

    for (const url of extractImageUrls(html, sourceUrl)) {
      if (!imageSourceMap.has(url)) imageSourceMap.set(url, new Set());
      imageSourceMap.get(url).add(htmlFile);
    }
  }

  console.log(`Found ${imageSourceMap.size} unique image URLs\n`);

  // Load existing manifest to support incremental re-runs
  let existingManifest = [];
  try {
    const raw = await fs.readFile(IMAGES_MANIFEST_PATH, 'utf8');
    existingManifest = JSON.parse(raw);
  } catch {
    // No existing manifest; start fresh
  }
  const alreadyDownloaded = new Set(existingManifest.map(e => e.url));

  const manifest = [...existingManifest];
  let downloaded = 0;
  let skipped = 0;
  let errors = 0;

  // Separate already-done from pending
  const pending = [];
  for (const [url, sourcePaths] of imageSourceMap) {
    if (alreadyDownloaded.has(url)) {
      // Keep existing entry; merge any newly-found sourceUrls
      const entry = manifest.find(e => e.url === url);
      if (entry) {
        const combined = new Set([...entry.sourceUrls, ...[...sourcePaths].sort()]);
        entry.sourceUrls = [...combined].sort();
      }
      skipped++;
    } else {
      pending.push([url, sourcePaths]);
    }
  }

  console.log(`  ${skipped} already downloaded, ${pending.length} to fetch\n`);

  // Download with bounded concurrency
  const { concurrency, delay: delayMs } = args;
  const ctx = { delayMs, captureDir: CAPTURE_DIR, imagesDir: IMAGES_DIR };

  for (let i = 0; i < pending.length; i += concurrency) {
    const batch = pending.slice(i, i + concurrency);
    const results = await Promise.all(batch.map(([url, sp]) => downloadOne(url, sp, ctx)));
    for (const entry of results) {
      manifest.push(entry);
      if (entry.path) downloaded++;
      else errors++;
    }
    // Write manifest after each batch so progress is preserved on interruption
    const sorted = [...manifest].sort((a, b) => a.url.localeCompare(b.url));
    await fs.writeFile(IMAGES_MANIFEST_PATH, JSON.stringify(sorted, null, 2) + '\n', 'utf8');
  }

  // Final sorted write
  manifest.sort((a, b) => a.url.localeCompare(b.url));
  await fs.writeFile(IMAGES_MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n', 'utf8');

  console.log(`\nDone.`);
  console.log(`  Unique image URLs:  ${imageSourceMap.size}`);
  console.log(`  Downloaded:         ${downloaded}`);
  console.log(`  Already present:    ${skipped}`);
  console.log(`  Errors:             ${errors}`);
  console.log(`\nManifest written to ${IMAGES_MANIFEST_PATH}`);
}

// Only run main when executed directly (not when imported by tests)
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch(err => {
    console.error(err);
    process.exit(1);
  });
}
