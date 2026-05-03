#!/usr/bin/env node
/**
 * Phase A1: Crawl rootsofprogress.org and save raw HTML.
 *
 * Discovers URLs from the sitemap and from internal links found while crawling.
 * Saves raw HTML to capture/html/<path>/index.html.
 * Writes capture/manifest.json listing every captured URL.
 * Saves capture/sitemap.xml verbatim.
 *
 * Usage: node scripts/capture-site.mjs
 */

import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';

const BASE_URL = 'https://rootsofprogress.org';
const SITEMAP_URL = `${BASE_URL}/sitemap.xml`;
const CAPTURE_DIR = 'capture';
const HTML_DIR = path.join(CAPTURE_DIR, 'html');
const MANIFEST_PATH = path.join(CAPTURE_DIR, 'manifest.json');
const SITEMAP_PATH = path.join(CAPTURE_DIR, 'sitemap.xml');
const USER_AGENT = 'rpi-migration-capture/1.0';
const DELAY_MS = 1000;

// ----- helpers -----

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithUA(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT },
    redirect: 'follow',
  });
  return res;
}

function sha256(buf) {
  return crypto.createHash('sha256').update(buf).digest('hex');
}

/** Convert a rootsofprogress.org URL path to a filesystem path under capture/html/. */
function urlToFilePath(urlStr) {
  const u = new URL(urlStr);
  let p = u.pathname;
  // Normalise trailing slash → directory index
  if (p === '' || p === '/') p = '/';
  if (!p.endsWith('/')) p = p + '/';
  // Remove leading slash; join with HTML_DIR
  const rel = p.replace(/^\//, '');
  return path.join(HTML_DIR, rel, 'index.html');
}

function urlToRelativePath(urlStr) {
  const u = new URL(urlStr);
  let p = u.pathname;
  if (p === '' || p === '/') p = '/';
  if (!p.endsWith('/')) p = p + '/';
  const rel = p.replace(/^\//, '');
  return path.join(rel, 'index.html');
}

/** Extract all internal links from an HTML string. */
function extractInternalLinks(html, baseUrl) {
  const links = new Set();
  const hrefRe = /href=["']([^"']+)["']/gi;
  let m;
  while ((m = hrefRe.exec(html)) !== null) {
    const href = m[1].trim();
    if (!href || href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('mailto:')) continue;
    try {
      const abs = new URL(href, baseUrl);
      // Stay within the same host; only http/https
      if (abs.hostname !== new URL(BASE_URL).hostname) continue;
      if (abs.protocol !== 'http:' && abs.protocol !== 'https:') continue;
      // Strip fragment and query
      abs.hash = '';
      abs.search = '';
      // Normalise: ensure no trailing slash except root
      let canonical = abs.href;
      if (canonical.endsWith('/') && canonical !== BASE_URL + '/') {
        canonical = canonical.slice(0, -1);
      }
      links.add(canonical);
    } catch {
      // ignore malformed hrefs
    }
  }
  return links;
}

/** Parse URLs from a sitemap XML string (handles both sitemap_index and urlset). */
function parseSitemapUrls(xml) {
  const urls = new Set();
  // <loc>...</loc>
  const locRe = /<loc>\s*(https?:\/\/[^<]+)\s*<\/loc>/gi;
  let m;
  while ((m = locRe.exec(xml)) !== null) {
    urls.add(m[1].trim());
  }
  return urls;
}

/** Return true if this URL is a sitemap (index or subsidiary). */
function isSitemapUrl(url) {
  return url.includes('sitemap') && (url.endsWith('.xml') || url.includes('sitemap'));
}

// ----- robots.txt -----

async function fetchRobotsTxt() {
  try {
    const res = await fetchWithUA(`${BASE_URL}/robots.txt`);
    if (res.ok) return await res.text();
  } catch { /* ignore */ }
  return '';
}

function buildDisallowSet(robotsTxt) {
  const disallowed = new Set();
  let inOurAgent = false;
  for (const raw of robotsTxt.split('\n')) {
    const line = raw.trim();
    if (/^user-agent\s*:/i.test(line)) {
      const agent = line.replace(/^user-agent\s*:\s*/i, '').trim();
      inOurAgent = agent === '*' || agent.toLowerCase().includes('rpi-migration');
    }
    if (inOurAgent && /^disallow\s*:/i.test(line)) {
      const p = line.replace(/^disallow\s*:\s*/i, '').trim();
      if (p) disallowed.add(p);
    }
  }
  return disallowed;
}

function isDisallowed(urlStr, disallowed) {
  const p = new URL(urlStr).pathname;
  for (const prefix of disallowed) {
    if (p.startsWith(prefix)) return true;
  }
  return false;
}

// ----- sitemap discovery -----

async function collectSitemapUrls() {
  const pageUrls = new Set();
  const sitemapQueue = [SITEMAP_URL];
  const visitedSitemaps = new Set();
  let savedSitemapXml = null;

  while (sitemapQueue.length > 0) {
    const surl = sitemapQueue.shift();
    if (visitedSitemaps.has(surl)) continue;
    visitedSitemaps.add(surl);

    console.log(`  Fetching sitemap: ${surl}`);
    let res;
    try {
      res = await fetchWithUA(surl);
    } catch (err) {
      console.warn(`  Warning: failed to fetch ${surl}: ${err.message}`);
      continue;
    }
    if (!res.ok) {
      console.warn(`  Warning: ${surl} returned ${res.status}`);
      continue;
    }
    const xml = await res.text();

    // Save the root sitemap
    if (surl === SITEMAP_URL) savedSitemapXml = xml;

    const found = parseSitemapUrls(xml);
    for (const u of found) {
      const host = new URL(BASE_URL).hostname;
      try {
        const parsed = new URL(u);
        if (parsed.hostname !== host) continue;
        if (isSitemapUrl(u)) {
          sitemapQueue.push(u);
        } else {
          pageUrls.add(u);
        }
      } catch { /* skip */ }
    }

    await sleep(DELAY_MS);
  }

  return { pageUrls, savedSitemapXml };
}

// ----- main crawl -----

async function main() {
  console.log('Phase A1: Crawl rootsofprogress.org\n');

  await fs.mkdir(HTML_DIR, { recursive: true });

  // Respect robots.txt
  console.log('Fetching robots.txt…');
  const robotsTxt = await fetchRobotsTxt();
  const disallowed = buildDisallowSet(robotsTxt);
  if (disallowed.size > 0) {
    console.log(`  Disallowed paths: ${[...disallowed].join(', ')}`);
  }
  await sleep(DELAY_MS);

  // Collect URLs from sitemap
  console.log('\nCollecting URLs from sitemap…');
  const { pageUrls: sitemapUrls, savedSitemapXml } = await collectSitemapUrls();
  console.log(`  Found ${sitemapUrls.size} URLs in sitemap`);

  // Save sitemap verbatim
  if (savedSitemapXml) {
    await fs.writeFile(SITEMAP_PATH, savedSitemapXml, 'utf8');
    console.log(`  Saved sitemap.xml`);
  }

  // Crawl queue: start with all sitemap URLs + the homepage
  const visited = new Set();
  const queue = [BASE_URL + '/', ...sitemapUrls];
  const manifest = [];

  // Normalise queue entries
  const normalise = (u) => {
    try {
      const parsed = new URL(u);
      parsed.hash = '';
      parsed.search = '';
      let href = parsed.href;
      if (href.endsWith('/') && href !== BASE_URL + '/') href = href.slice(0, -1);
      return href;
    } catch { return null; }
  };

  const toVisit = new Set(queue.map(normalise).filter(Boolean));

  console.log(`\nStarting crawl (${toVisit.size} initial URLs)…\n`);

  for (const url of toVisit) {
    if (visited.has(url)) continue;
    visited.add(url);

    if (isDisallowed(url, disallowed)) {
      console.log(`  SKIP (robots.txt) ${url}`);
      continue;
    }

    // Only crawl HTML pages (skip obvious non-HTML)
    if (/\.(xml|rss|atom|txt|pdf|jpg|jpeg|png|gif|svg|webp|ico|css|js|woff|woff2|ttf|eot|zip|gz)$/i.test(new URL(url).pathname)) {
      console.log(`  SKIP (non-html) ${url}`);
      continue;
    }

    console.log(`  GET ${url}`);
    let res;
    let status;
    let contentType = '';
    let body = '';
    let bodyBuf = Buffer.alloc(0);

    try {
      res = await fetchWithUA(url);
      status = res.status;
      contentType = res.headers.get('content-type') || '';
      bodyBuf = Buffer.from(await res.arrayBuffer());
      body = bodyBuf.toString('utf8');
    } catch (err) {
      console.warn(`  ERROR fetching ${url}: ${err.message}`);
      manifest.push({
        url,
        path: null,
        status: 0,
        contentType: '',
        sha256: null,
        fetchedAt: new Date().toISOString(),
        error: err.message,
      });
      await sleep(DELAY_MS);
      continue;
    }

    const hash = sha256(bodyBuf);
    const filePath = urlToFilePath(url);
    const relPath = urlToRelativePath(url);

    if (status === 200 && contentType.includes('text/html')) {
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, bodyBuf);

      // Discover new internal links
      const newLinks = extractInternalLinks(body, url);
      for (const link of newLinks) {
        const norm = normalise(link);
        if (norm && !visited.has(norm) && !toVisit.has(norm)) {
          const parsed = new URL(norm);
          if (parsed.hostname === new URL(BASE_URL).hostname) {
            toVisit.add(norm);
          }
        }
      }
    }

    manifest.push({
      url,
      path: status === 200 && contentType.includes('text/html') ? relPath : null,
      status,
      contentType,
      sha256: hash,
      fetchedAt: new Date().toISOString(),
    });

    await sleep(DELAY_MS);
  }

  // Write manifest
  await fs.writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n', 'utf8');

  const ok = manifest.filter(e => e.status === 200 && e.path);
  const err = manifest.filter(e => e.status !== 200);
  console.log(`\nDone.`);
  console.log(`  Total URLs processed: ${manifest.length}`);
  console.log(`  Saved HTML files:     ${ok.length}`);
  console.log(`  Non-200 responses:    ${err.length}`);
  if (err.length > 0) {
    for (const e of err) {
      console.log(`    ${e.status || 'ERR'} ${e.url}`);
    }
  }
  console.log(`\nManifest written to ${MANIFEST_PATH}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
