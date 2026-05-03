#!/usr/bin/env node
/**
 * Tests for consolidate-images.mjs pure functions.
 * Run with: node scripts/consolidate-images.test.mjs
 */

import { strict as assert } from 'assert';
import { test } from 'node:test';

import {
  stripSizeVariant,
  groupKey,
  pickCanonical,
  buildManifestMap,
} from './consolidate-images.mjs';

// ---------------------------------------------------------------------------
// stripSizeVariant
// ---------------------------------------------------------------------------

test('stripSizeVariant: removes -WIDTHxHEIGHT suffix', () => {
  assert.equal(stripSizeVariant('photo-300x200.jpg'), 'photo.jpg');
});

test('stripSizeVariant: removes large size suffix', () => {
  assert.equal(stripSizeVariant('photo-1536x1024.jpg'), 'photo.jpg');
});

test('stripSizeVariant: leaves un-suffixed filename unchanged', () => {
  assert.equal(stripSizeVariant('photo.jpg'), 'photo.jpg');
});

test('stripSizeVariant: leaves -scaled suffix intact', () => {
  assert.equal(stripSizeVariant('image-scaled.png'), 'image-scaled.png');
});

test('stripSizeVariant: removes -WIDTHxHEIGHT from -scaled variant', () => {
  assert.equal(stripSizeVariant('image-scaled-700x700.jpg'), 'image-scaled.jpg');
});

test('stripSizeVariant: handles -e<timestamp>-WIDTHxHEIGHT pattern', () => {
  assert.equal(
    stripSizeVariant('Screenshot-2024-08-08-at-10.25.36AM-e1723133640306-700x877.png'),
    'Screenshot-2024-08-08-at-10.25.36AM-e1723133640306.png'
  );
});

test('stripSizeVariant: leaves -e<timestamp>-only filename unchanged', () => {
  assert.equal(
    stripSizeVariant('DSC_2268-scaled-e1723232659912.jpg'),
    'DSC_2268-scaled-e1723232659912.jpg'
  );
});

test('stripSizeVariant: does not strip numbers that are not WIDTHxHEIGHT', () => {
  // "5KT7Z9X5_400x400.jpg" has a 400x400 suffix — should strip it
  assert.equal(stripSizeVariant('5KT7Z9X5_400x400.jpg'), '5KT7Z9X5_400x400.jpg');
  // because the separator before 400x400 is _ not -
});

test('stripSizeVariant: handles png extension', () => {
  assert.equal(stripSizeVariant('banner-1200x630.png'), 'banner.png');
});

test('stripSizeVariant: handles webp extension', () => {
  assert.equal(stripSizeVariant('hero-800x600.webp'), 'hero.webp');
});

// ---------------------------------------------------------------------------
// groupKey
// ---------------------------------------------------------------------------

test('groupKey: returns dir + canonical basename + ext', () => {
  const key = groupKey('rootsofprogress.org/wp-content/uploads/2024/06', 'photo-300x200.jpg');
  assert.equal(key, 'rootsofprogress.org/wp-content/uploads/2024/06/photo.jpg');
});

test('groupKey: un-suffixed file maps to same key', () => {
  const key = groupKey('rootsofprogress.org/wp-content/uploads/2024/06', 'photo.jpg');
  assert.equal(key, 'rootsofprogress.org/wp-content/uploads/2024/06/photo.jpg');
});

test('groupKey: variants across sizes share same key', () => {
  const k1 = groupKey('a/b', 'img-120x120.jpg');
  const k2 = groupKey('a/b', 'img-300x300.jpg');
  const k3 = groupKey('a/b', 'img-700x700.jpg');
  const k4 = groupKey('a/b', 'img.jpg');
  assert.equal(k1, k2);
  assert.equal(k2, k3);
  assert.equal(k3, k4);
});

// ---------------------------------------------------------------------------
// pickCanonical
// ---------------------------------------------------------------------------

test('pickCanonical: prefers un-suffixed file when present', () => {
  const group = [
    { relPath: 'domain/dir/photo-120x120.jpg', size: 1000, hasSizeSuffix: true },
    { relPath: 'domain/dir/photo.jpg', size: 5000, hasSizeSuffix: false },
    { relPath: 'domain/dir/photo-300x200.jpg', size: 3000, hasSizeSuffix: true },
  ];
  const result = pickCanonical(group);
  assert.equal(result.relPath, 'domain/dir/photo.jpg');
});

test('pickCanonical: falls back to largest variant when no un-suffixed file', () => {
  const group = [
    { relPath: 'domain/dir/photo-120x120.jpg', size: 1000, hasSizeSuffix: true },
    { relPath: 'domain/dir/photo-700x500.jpg', size: 8000, hasSizeSuffix: true },
    { relPath: 'domain/dir/photo-300x200.jpg', size: 3000, hasSizeSuffix: true },
  ];
  const result = pickCanonical(group);
  assert.equal(result.relPath, 'domain/dir/photo-700x500.jpg');
});

test('pickCanonical: single-member group returns that member', () => {
  const group = [
    { relPath: 'domain/dir/solo.jpg', size: 2000, hasSizeSuffix: false },
  ];
  const result = pickCanonical(group);
  assert.equal(result.relPath, 'domain/dir/solo.jpg');
});

test('pickCanonical: single-member variant group returns that variant', () => {
  const group = [
    { relPath: 'domain/dir/only-300x300.jpg', size: 2000, hasSizeSuffix: true },
  ];
  const result = pickCanonical(group);
  assert.equal(result.relPath, 'domain/dir/only-300x300.jpg');
});

// ---------------------------------------------------------------------------
// buildManifestMap
// ---------------------------------------------------------------------------

test('buildManifestMap: maps variant URLs to canonical asset path', () => {
  const captureEntries = [
    {
      url: 'https://example.com/u/2024/05/photo-120x120.jpg',
      path: 'images/example.com/u/2024/05/photo-120x120.jpg',
    },
    {
      url: 'https://example.com/u/2024/05/photo-300x200.jpg',
      path: 'images/example.com/u/2024/05/photo-300x200.jpg',
    },
    {
      url: 'https://example.com/u/2024/05/photo.jpg',
      path: 'images/example.com/u/2024/05/photo.jpg',
    },
  ];
  // canonical: photo.jpg (un-suffixed)
  const canonicalMap = new Map([
    ['example.com/u/2024/05/photo.jpg', 'src/assets/images/example.com/u/2024/05/photo.jpg'],
  ]);
  const result = buildManifestMap(captureEntries, canonicalMap);
  assert.equal(result.get('https://example.com/u/2024/05/photo-120x120.jpg'), 'src/assets/images/example.com/u/2024/05/photo.jpg');
  assert.equal(result.get('https://example.com/u/2024/05/photo-300x200.jpg'), 'src/assets/images/example.com/u/2024/05/photo.jpg');
  assert.equal(result.get('https://example.com/u/2024/05/photo.jpg'), 'src/assets/images/example.com/u/2024/05/photo.jpg');
});

test('buildManifestMap: skips entries with null path (download failures)', () => {
  const captureEntries = [
    {
      url: 'https://example.com/u/2024/05/missing.jpg',
      path: null,
    },
  ];
  const canonicalMap = new Map();
  const result = buildManifestMap(captureEntries, canonicalMap);
  assert.equal(result.size, 0);
});

test('buildManifestMap: handles URLs where canonical is a variant (no original)', () => {
  const captureEntries = [
    {
      url: 'https://example.com/dir/img-300x300.jpg',
      path: 'images/example.com/dir/img-300x300.jpg',
    },
    {
      url: 'https://example.com/dir/img-700x700.jpg',
      path: 'images/example.com/dir/img-700x700.jpg',
    },
  ];
  // canonical picked was the larger variant
  const canonicalMap = new Map([
    ['example.com/dir/img.jpg', 'src/assets/images/example.com/dir/img-700x700.jpg'],
  ]);
  const result = buildManifestMap(captureEntries, canonicalMap);
  assert.equal(result.get('https://example.com/dir/img-300x300.jpg'), 'src/assets/images/example.com/dir/img-700x700.jpg');
  assert.equal(result.get('https://example.com/dir/img-700x700.jpg'), 'src/assets/images/example.com/dir/img-700x700.jpg');
});
