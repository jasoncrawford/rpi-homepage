#!/usr/bin/env node
/**
 * Tests for download-images.mjs parsing logic.
 * Run with: node scripts/download-images.test.mjs
 */

import { strict as assert } from 'assert';
import { test } from 'node:test';

// We import only the pure functions — no I/O. The script exports them via
// a named export block at the bottom; the main() function is not called on
// import because of the `if (process.argv[1] === fileURLToPath(import.meta.url))`
// guard.
import {
  parseSrcset,
  extractImageUrls,
  urlToImagePath,
} from './download-images.mjs';

// ---------------------------------------------------------------------------
// parseSrcset
// ---------------------------------------------------------------------------

test('parseSrcset: single URL without descriptor', () => {
  const result = parseSrcset('https://example.com/img.jpg');
  assert.deepEqual(result, ['https://example.com/img.jpg']);
});

test('parseSrcset: multiple URLs with width descriptors', () => {
  const result = parseSrcset(
    'https://example.com/img-300.jpg 300w, https://example.com/img-700.jpg 700w'
  );
  assert.deepEqual(result, [
    'https://example.com/img-300.jpg',
    'https://example.com/img-700.jpg',
  ]);
});

test('parseSrcset: multiple URLs with pixel density descriptors', () => {
  const result = parseSrcset(
    'https://example.com/img.jpg 1x, https://example.com/img@2x.jpg 2x'
  );
  assert.deepEqual(result, [
    'https://example.com/img.jpg',
    'https://example.com/img@2x.jpg',
  ]);
});

test('parseSrcset: ignores empty entries', () => {
  const result = parseSrcset('  , https://example.com/img.jpg 1x,  ');
  assert.deepEqual(result, ['https://example.com/img.jpg']);
});

// ---------------------------------------------------------------------------
// extractImageUrls
// ---------------------------------------------------------------------------

const BASE = 'https://rootsofprogress.org/about';

test('extractImageUrls: img src', () => {
  const html = '<img src="https://rootsofprogress.org/wp-content/uploads/2024/06/photo.jpg" />';
  const result = extractImageUrls(html, BASE);
  assert.ok(result.has('https://rootsofprogress.org/wp-content/uploads/2024/06/photo.jpg'));
});

test('extractImageUrls: img srcset', () => {
  const html = '<img srcset="https://example.com/img-300.jpg 300w, https://example.com/img-700.jpg 700w" />';
  const result = extractImageUrls(html, BASE);
  assert.ok(result.has('https://example.com/img-300.jpg'));
  assert.ok(result.has('https://example.com/img-700.jpg'));
});

test('extractImageUrls: source srcset', () => {
  const html = '<source srcset="https://example.com/hero.webp 1200w, https://example.com/hero-sm.webp 600w" />';
  const result = extractImageUrls(html, BASE);
  assert.ok(result.has('https://example.com/hero.webp'));
  assert.ok(result.has('https://example.com/hero-sm.webp'));
});

test('extractImageUrls: link rel=icon', () => {
  const html = '<link rel="icon" href="https://rootsofprogress.org/wp-content/uploads/2024/06/icon-32x32.jpg" sizes="32x32" />';
  const result = extractImageUrls(html, BASE);
  assert.ok(result.has('https://rootsofprogress.org/wp-content/uploads/2024/06/icon-32x32.jpg'));
});

test('extractImageUrls: link rel=apple-touch-icon', () => {
  const html = '<link rel="apple-touch-icon" href="https://rootsofprogress.org/wp-content/uploads/2024/06/icon-180x180.jpg" />';
  const result = extractImageUrls(html, BASE);
  assert.ok(result.has('https://rootsofprogress.org/wp-content/uploads/2024/06/icon-180x180.jpg'));
});

test('extractImageUrls: og:image meta', () => {
  const html = '<meta property="og:image" content="https://rootsofprogress.org/wp-content/uploads/2024/06/og.jpg" />';
  const result = extractImageUrls(html, BASE);
  assert.ok(result.has('https://rootsofprogress.org/wp-content/uploads/2024/06/og.jpg'));
});

test('extractImageUrls: twitter:image meta', () => {
  const html = '<meta name="twitter:image" content="https://rootsofprogress.org/wp-content/uploads/2024/06/tw.jpg" />';
  const result = extractImageUrls(html, BASE);
  assert.ok(result.has('https://rootsofprogress.org/wp-content/uploads/2024/06/tw.jpg'));
});

test('extractImageUrls: msapplication-TileImage meta', () => {
  const html = '<meta name="msapplication-TileImage" content="https://rootsofprogress.org/wp-content/uploads/2024/06/tile.jpg" />';
  const result = extractImageUrls(html, BASE);
  assert.ok(result.has('https://rootsofprogress.org/wp-content/uploads/2024/06/tile.jpg'));
});

test('extractImageUrls: inline CSS url()', () => {
  const html = '<style>div { background: url("https://rootsofprogress.org/wp-content/uploads/2024/06/bg.jpg"); }</style>';
  const result = extractImageUrls(html, BASE);
  assert.ok(result.has('https://rootsofprogress.org/wp-content/uploads/2024/06/bg.jpg'));
});

test('extractImageUrls: CSS url() without quotes', () => {
  const html = '<style>div { background: url(https://rootsofprogress.org/wp-content/uploads/2024/06/bg.jpg); }</style>';
  const result = extractImageUrls(html, BASE);
  assert.ok(result.has('https://rootsofprogress.org/wp-content/uploads/2024/06/bg.jpg'));
});

test('extractImageUrls: skips non-image CSS url() (fonts)', () => {
  const html = '<style>@font-face { src: url("https://example.com/font.woff2"); }</style>';
  const result = extractImageUrls(html, BASE);
  assert.equal(result.size, 0);
});

test('extractImageUrls: skips data: URIs', () => {
  const html = '<img src="data:image/png;base64,abc123" />';
  const result = extractImageUrls(html, BASE);
  assert.equal(result.size, 0);
});

test('extractImageUrls: skips empty src', () => {
  const html = '<img src="" />';
  const result = extractImageUrls(html, BASE);
  assert.equal(result.size, 0);
});

test('extractImageUrls: resolves relative URLs against source', () => {
  const html = '<img src="/wp-content/uploads/2024/06/photo.jpg" />';
  const result = extractImageUrls(html, BASE);
  assert.ok(result.has('https://rootsofprogress.org/wp-content/uploads/2024/06/photo.jpg'));
});

// ---------------------------------------------------------------------------
// urlToImagePath
// ---------------------------------------------------------------------------

test('urlToImagePath: wp-content uploads URL', () => {
  const result = urlToImagePath(
    'https://rootsofprogress.org/wp-content/uploads/2024/06/photo.jpg'
  );
  assert.equal(result, 'capture/images/rootsofprogress.org/wp-content/uploads/2024/06/photo.jpg');
});

test('urlToImagePath: CDN URL (api subdomain)', () => {
  const result = urlToImagePath(
    'https://api.rootsofprogress.org/u/2024/06/photo.png'
  );
  assert.equal(result, 'capture/images/api.rootsofprogress.org/u/2024/06/photo.png');
});

test('urlToImagePath: URL with query string strips query', () => {
  const result = urlToImagePath(
    'https://rootsofprogress.org/wp-content/uploads/2024/06/photo.jpg?ver=1.2'
  );
  assert.equal(result, 'capture/images/rootsofprogress.org/wp-content/uploads/2024/06/photo.jpg');
});

test('urlToImagePath: icon URL', () => {
  const result = urlToImagePath(
    'https://rootsofprogress.org/wp-content/uploads/2024/06/icon-32x32.jpg'
  );
  assert.equal(result, 'capture/images/rootsofprogress.org/wp-content/uploads/2024/06/icon-32x32.jpg');
});
