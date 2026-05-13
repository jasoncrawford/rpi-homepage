#!/usr/bin/env node
/**
 * Usage: node scripts/visual-diff.mjs <path>
 * Examples:
 *   node scripts/visual-diff.mjs /
 *   node scripts/visual-diff.mjs /about/
 *
 * Takes desktop (1280×800) and mobile (375×800) full-page screenshots of:
 *   - Local:  http://localhost:4321<path>
 *   - Live:   https://rootsofprogress.org<path>
 *
 * Also produces a pixel-diff overlay PNG per viewport (red highlights on the
 * local screenshot wherever it disagrees with live).
 *
 * Saves PNGs to tmp/visual-diff/ and prints the paths.
 */

import fs from 'fs/promises';
import net from 'net';
import path from 'path';
import { spawn } from 'child_process';
import { once } from 'events';
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

async function isPortFree(port, host) {
  return new Promise(resolve => {
    const server = net.createServer();
    server.once('error', () => resolve(false));
    server.once('listening', () => server.close(() => resolve(true)));
    server.listen(port, host);
  });
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

// Scroll from top to bottom in half-viewport steps so each lazy-loaded image
// (loading="lazy") enters the intersection observer's viewport and starts its
// network request. Then scroll back to top so any scroll-state classes on the
// header (e.g. header.scroll) reset before the screenshot.
async function triggerLazyImages(page) {
  await page.evaluate(async () => {
    await new Promise(resolve => {
      let y = 0;
      const step = window.innerHeight / 2;
      const interval = setInterval(() => {
        window.scrollTo(0, y);
        y += step;
        if (y >= document.body.scrollHeight) {
          clearInterval(interval);
          window.scrollTo(0, 0);
          resolve();
        }
      }, 100);
    });
  });
  await page.waitForLoadState('networkidle');
}

async function screenshot(browser, url, slug, label, viewport, size) {
  const ctx = await browser.newContext({ viewport });
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: 'networkidle' });
  await triggerLazyImages(page);
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
    console.error('Usage: node scripts/visual-diff.mjs <path>  (e.g. / or /about/)');
    process.exit(1);
  }

  await fs.mkdir(OUT_DIR, { recursive: true });

  const slug = pathToSlug(urlPath);

  if (!(await isPortFree(LOCAL_PORT, '127.0.0.1'))) {
    console.error(`Port ${LOCAL_PORT} on 127.0.0.1 is already in use. Stop the process holding it (e.g. \`pkill -9 -f 'astro dev'\` — do NOT pkill node, that kills your shell/agent) and retry.`);
    process.exit(1);
  }

  // Start astro dev server.
  // - --host 127.0.0.1 forces IPv4 binding; without it Vite calls
  //   listen('localhost', ...) and Node may resolve to ::1, leaving nothing
  //   listening on 127.0.0.1.
  // - stderr is inherited so astro errors (port conflicts, config problems)
  //   surface immediately instead of being swallowed.
  // - detached:true puts npx and its astro grandchild into a new process
  //   group, so we can kill the whole tree with a negative PID below.
  //   Without this, kill() reaches only npx and astro is reparented to init
  //   and keeps running, holding inherited file descriptors open and the
  //   port pinned for the next run.
  const devServer = spawn('npx', ['astro', 'dev', '--port', String(LOCAL_PORT), '--host', '127.0.0.1'], {
    stdio: ['ignore', 'ignore', 'inherit'],
    detached: true,
  });

  let devServerExited = false;
  devServer.on('exit', () => { devServerExited = true; });

  // SIGKILL the whole process group. SIGTERM is ignored by Vite during HMR.
  // Negative PID kills every process in devServer's group (npx + astro).
  const killDevServer = () => {
    if (devServerExited) return;
    try { process.kill(-devServer.pid, 'SIGKILL'); } catch { /* already dead */ }
  };
  process.on('exit', killDevServer);
  process.on('SIGINT', () => { killDevServer(); process.exit(130); });
  process.on('SIGTERM', () => { killDevServer(); process.exit(143); });

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
    } finally {
      await browser.close();
    }

    console.log(`\nDone. ${saved.length} screenshots in ${OUT_DIR}/`);
  } finally {
    killDevServer();
    if (!devServerExited) await once(devServer, 'exit');
  }
}

main().catch(err => {
  console.error(err.message || err);
  process.exit(1);
});
