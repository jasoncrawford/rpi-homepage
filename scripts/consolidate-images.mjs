#!/usr/bin/env node
/**
 * Phase A3: Consolidate canonical originals into src/assets/images/.
 *
 * Walks capture/images/, groups WordPress size variants by logical image,
 * picks one canonical original per group, copies it to src/assets/images/,
 * and writes src/assets/images/manifest.json mapping every captured URL
 * (including srcset variants) to the canonical asset path.
 *
 * Usage: node scripts/consolidate-images.mjs
 */

import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import path from 'path';

const CAPTURE_DIR = 'capture';
const CAPTURE_IMAGES_DIR = path.join(CAPTURE_DIR, 'images');
const CAPTURE_MANIFEST_PATH = path.join(CAPTURE_DIR, 'images-manifest.json');
const ASSETS_DIR = path.join('src', 'assets', 'images');
const ASSETS_MANIFEST_PATH = path.join(ASSETS_DIR, 'manifest.json');

// ---------------------------------------------------------------------------
// Pure functions (exported for tests)
// ---------------------------------------------------------------------------

/**
 * Strip the trailing WordPress size suffix (-WIDTHxHEIGHT) from a filename.
 * Only strips when the separator is a hyphen, e.g. photo-300x200.jpg → photo.jpg.
 * Leaves filenames without the suffix (or with _ separator) unchanged.
 */
export function stripSizeVariant(filename) {
  return filename.replace(/^(.+)-(\d+x\d+)(\.[^.]+)$/, '$1$3');
}

/**
 * Compute the group key for a file: the canonical path under capture/images/
 * after stripping the size variant from the filename.
 *
 * e.g. groupKey('domain/dir', 'photo-300x200.jpg') === 'domain/dir/photo.jpg'
 *      groupKey('domain/dir', 'photo.jpg')          === 'domain/dir/photo.jpg'
 */
export function groupKey(relDir, filename) {
  return relDir + '/' + stripSizeVariant(filename);
}

/**
 * Pick the canonical file from a group of size variants.
 *
 * Prefers the un-suffixed original (hasSizeSuffix === false).
 * Falls back to the largest variant by file size.
 *
 * @param {Array<{relPath: string, size: number, hasSizeSuffix: boolean}>} group
 * @returns {{relPath: string, size: number, hasSizeSuffix: boolean}}
 */
export function pickCanonical(group) {
  const original = group.find(f => !f.hasSizeSuffix);
  if (original) return original;
  return group.reduce((best, f) => (f.size > best.size ? f : best));
}

/**
 * Build the URL → canonical asset path map.
 *
 * @param {Array<{url: string, path: string|null}>} captureEntries
 *   Entries from capture/images-manifest.json. path is relative to capture/.
 * @param {Map<string, string>} canonicalMap
 *   Maps groupKey (e.g. 'domain/dir/photo.jpg') to asset path
 *   (e.g. 'src/assets/images/domain/dir/photo.jpg').
 * @returns {Map<string, string>} url → asset path
 */
export function buildManifestMap(captureEntries, canonicalMap) {
  const result = new Map();
  for (const entry of captureEntries) {
    if (!entry.path) continue;
    // entry.path is relative to capture/, e.g. "images/domain/dir/photo-300x200.jpg"
    const relToImages = entry.path.replace(/^images\//, '');
    const dir = path.dirname(relToImages);
    const basename = path.basename(relToImages);
    const key = groupKey(dir, basename);
    const assetPath = canonicalMap.get(key);
    if (assetPath) {
      result.set(entry.url, assetPath);
    }
  }
  return result;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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

async function main() {
  console.log('Phase A3: Consolidate canonical originals into src/assets/images/\n');

  // Step 1: Walk capture/images/ and collect all files with their sizes.
  const allFiles = [];
  for await (const absPath of walkDir(CAPTURE_IMAGES_DIR)) {
    const relPath = path.relative(CAPTURE_IMAGES_DIR, absPath);
    const stat = await fs.stat(absPath);
    const basename = path.basename(relPath);
    const dir = path.dirname(relPath);
    const canonical = stripSizeVariant(basename);
    const hasSizeSuffix = canonical !== basename;
    allFiles.push({ relPath, absPath, size: stat.size, dir, basename, hasSizeSuffix });
  }
  console.log(`Found ${allFiles.length} files in capture/images/`);

  // Step 2: Group by logical image key.
  const groups = new Map();
  for (const file of allFiles) {
    const key = groupKey(file.dir, file.basename);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(file);
  }
  console.log(`Grouped into ${groups.size} logical images`);

  // Step 3: Pick canonical for each group.
  const canonicalMap = new Map(); // groupKey → assetPath
  const canonicals = [];
  for (const [key, group] of groups) {
    const canonical = pickCanonical(group);
    const assetPath = path.join(ASSETS_DIR, canonical.relPath);
    canonicalMap.set(key, assetPath);
    canonicals.push({ ...canonical, assetPath });
  }

  // Step 4: Copy canonical files to src/assets/images/.
  await fs.mkdir(ASSETS_DIR, { recursive: true });
  let copied = 0;
  let skipped = 0;
  for (const file of canonicals) {
    const destDir = path.dirname(file.assetPath);
    await fs.mkdir(destDir, { recursive: true });
    try {
      await fs.access(file.assetPath);
      skipped++;
    } catch {
      await fs.copyFile(file.absPath, file.assetPath);
      copied++;
    }
  }
  console.log(`\nCopied ${copied} canonical originals to ${ASSETS_DIR}/`);
  if (skipped > 0) console.log(`Skipped ${skipped} already-present files`);

  // Step 5: Load capture/images-manifest.json.
  let captureEntries = [];
  try {
    const raw = await fs.readFile(CAPTURE_MANIFEST_PATH, 'utf8');
    captureEntries = JSON.parse(raw);
  } catch (err) {
    console.warn(`\nWarning: could not read ${CAPTURE_MANIFEST_PATH}: ${err.message}`);
    console.warn('manifest.json will be empty.');
  }
  console.log(`\nLoaded ${captureEntries.length} entries from capture manifest`);

  // Step 6: Build URL → asset path map and write manifest.
  const manifestMap = buildManifestMap(captureEntries, canonicalMap);
  const manifestObj = Object.fromEntries(
    [...manifestMap.entries()].sort(([a], [b]) => a.localeCompare(b))
  );
  await fs.writeFile(ASSETS_MANIFEST_PATH, JSON.stringify(manifestObj, null, 2) + '\n', 'utf8');

  const nullCount = captureEntries.filter(e => !e.path).length;
  console.log(`Mapped ${manifestMap.size} URLs → canonical paths`);
  if (nullCount > 0) {
    console.log(`Skipped ${nullCount} entries with no local file (download errors)`);
  }
  console.log(`\nManifest written to ${ASSETS_MANIFEST_PATH}`);

  // Step 7: Summary
  console.log('\n--- Summary ---');
  console.log(`Total files in capture/images/:  ${allFiles.length}`);
  console.log(`Logical images (groups):          ${groups.size}`);
  console.log(`Canonicals copied to assets/:     ${copied + skipped}`);
  console.log(`URLs in manifest.json:            ${manifestMap.size}`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch(err => {
    console.error(err);
    process.exit(1);
  });
}
