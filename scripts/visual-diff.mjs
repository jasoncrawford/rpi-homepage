#!/usr/bin/env node
/**
 * Usage: node scripts/visual-diff.mjs <path>
 * Examples:
 *   node scripts/visual-diff.mjs /
 *   node scripts/visual-diff.mjs /about/
 *   node scripts/visual-diff.mjs /demo/homepage-demo
 *
 * Takes desktop (1280×800) and mobile (375×800) full-page screenshots of:
 *   - Local:  http://localhost:4321<path>  (always)
 *   - Live:   https://rootsofprogress.org<path>  (skipped for /demo/... paths)
 *
 * For non-demo paths, also produces a pixel-diff overlay PNG per viewport
 * (red highlights on the local screenshot wherever it disagrees with live).
 *
 * Saves PNGs to tmp/visual-diff/ and prints the paths.
 */

import fs from 'fs/promises';
import path from 'path';
import { spawn } from 'child_process';
import { chromium } from 'playwright';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

const LIVE_BASE = 'https://rootsofprogress.org';
const LOCAL_PORT = 4321;
const LOCAL_BASE = `http://127.0.0.1:${LOCAL_PORT}`;
const OUT_DIR = 'tmp/visual-diff';
const VIEWPORTS = {
  desktop: { width: 1280, height: 800 },
  mobile: { width: 375, height: 800 },
};
const DEV_READY_TIMEOUT_MS = 90_000;
const DEV_POLL_MS = 500;

function pathToSlug(urlPath) {
  return urlPath.replace(/^\//, '').replace(/\/$/, '').replace(/\//g, '-') || 'home';
}

function isDemo(urlPath) {
  return urlPath.startsWith('/demo/') || urlPath === '/demo';
}

async function waitForDevServer(url) {
  const deadline = Date.now() + DEV_READY_TIMEOUT_MS;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(1000) });
      if (res.ok || res.status < 500) return;
    } catch {
      // not ready yet
    }
    await new Promise(r => setTimeout(r, DEV_POLL_MS));
  }
  throw new Error(`Dev server at ${url} did not become ready within ${DEV_READY_TIMEOUT_MS}ms`);
}

async function screenshot(browser, url, slug, label, viewport, size) {
  const ctx = await browser.newContext({ viewport });
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: 'networkidle' });
  const outPath = path.join(OUT_DIR, `${slug}-${label}-${size}.png`);
  await page.screenshot({ path: outPath, fullPage: true });
  await ctx.close();
  return outPath;
}

// Pad PNG to (width, height) on a white background so pixelmatch can compare
// images of different heights (full-page screenshots routinely differ).
// PNG.sync.read returns a plain object (not a PNG instance), so we copy the
// raw RGBA buffer row-by-row instead of using PNG.bitblt.
function padTo(png, width, height) {
  if (png.width === width && png.height === height) return png;
  const out = new PNG({ width, height });
  out.data.fill(0xff);
  const rowBytes = png.width * 4;
  for (let y = 0; y < png.height; y++) {
    png.data.copy(out.data, y * width * 4, y * rowBytes, (y + 1) * rowBytes);
  }
  return out;
}

async function diffPNGs(localPath, livePath, diffPath) {
  const [localBuf, liveBuf] = await Promise.all([
    fs.readFile(localPath),
    fs.readFile(livePath),
  ]);
  const local = PNG.sync.read(localBuf);
  const live = PNG.sync.read(liveBuf);
  const width = Math.max(local.width, live.width);
  const height = Math.max(local.height, live.height);
  const a = padTo(local, width, height);
  const b = padTo(live, width, height);
  const diff = new PNG({ width, height });
  const mismatched = pixelmatch(a.data, b.data, diff.data, width, height, {
    threshold: 0.1,
    alpha: 0.3,
    diffColor: [255, 0, 0],
  });
  await fs.writeFile(diffPath, PNG.sync.write(diff));
  return { mismatched, total: width * height };
}

async function main() {
  const urlPath = process.argv[2];
  if (!urlPath || !urlPath.startsWith('/')) {
    console.error('Usage: node scripts/visual-diff.mjs <path>  (e.g. / or /about/ or /demo/homepage-demo)');
    process.exit(1);
  }

  await fs.mkdir(OUT_DIR, { recursive: true });

  const slug = pathToSlug(urlPath);
  const skipLive = isDemo(urlPath);

  // Start astro dev server
  const devServer = spawn('npx', ['astro', 'dev', '--port', String(LOCAL_PORT), '--host', '127.0.0.1'], {
    stdio: ['ignore', 'pipe', 'pipe'],
    detached: false,
  });

  let devServerExited = false;
  devServer.on('exit', () => { devServerExited = true; });

  const cleanup = () => {
    if (!devServerExited) {
      devServer.kill('SIGTERM');
    }
  };
  process.on('exit', cleanup);
  process.on('SIGINT', () => { cleanup(); process.exit(130); });
  process.on('SIGTERM', () => { cleanup(); process.exit(143); });

  try {
    console.log(`Starting astro dev on port ${LOCAL_PORT}…`);
    await waitForDevServer(`${LOCAL_BASE}/`);
    console.log('Dev server ready.\n');

    const browser = await chromium.launch();
    const saved = [];

    try {
      for (const [size, viewport] of Object.entries(VIEWPORTS)) {
        const localUrl = `${LOCAL_BASE}${urlPath}`;
        const localPath = await screenshot(browser, localUrl, slug, 'local', viewport, size);
        console.log(`Saved: ${localPath}`);
        saved.push(localPath);

        if (!skipLive) {
          const liveUrl = `${LIVE_BASE}${urlPath}`;
          const livePath = await screenshot(browser, liveUrl, slug, 'live', viewport, size);
          console.log(`Saved: ${livePath}`);
          saved.push(livePath);

          const diffPath = path.join(OUT_DIR, `${slug}-diff-${size}.png`);
          const { mismatched, total } = await diffPNGs(localPath, livePath, diffPath);
          const pct = ((mismatched / total) * 100).toFixed(2);
          console.log(`Saved: ${diffPath}  (${pct}% mismatch)`);
          saved.push(diffPath);
        }
      }
    } finally {
      await browser.close();
    }

    console.log(`\nDone. ${saved.length} screenshots in ${OUT_DIR}/`);
    if (skipLive) {
      console.log('(Live screenshots skipped: /demo/ path)');
    }
  } finally {
    cleanup();
  }
}

main().catch(err => {
  console.error(err.message || err);
  process.exit(1);
});
