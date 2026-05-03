# WordPress to Astro Migration — Implementation Plan (v2)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **READ THIS FIRST:** `verbatim-content-extraction` skill. Any LLM-mediated tool (WebFetch, asking Claude to "convert this HTML to markdown", etc.) silently paraphrases content. The migration must be **mechanical** — direct HTTP, library-based HTML→markdown, no LLM in the content path.

---

## Goal

Produce a **100% faithful clone** of rootsofprogress.org on Astro: same pages, same content (verbatim), same visual design. Not "a site like the original" — the same site, on a new stack.

## Why v2 of the plan

The original plan (40 tasks across phases 1a–1l) built generic components first and assumed content could be slotted in later. Issue #7 (PR #23) followed it and produced a site with hallucinated text and pages that don't exist on the original. Closed.

Two root causes:

1. **Backwards order.** Built components hoping content would fit. Faithful migration requires the opposite: capture the original first, derive components from what's actually there.
2. **LLM in the content path.** WebFetch returns an LLM summary of a page, not raw HTML. Anything downstream is paraphrased. Same hazard if you paste HTML to Claude and ask "give me this in markdown."

This plan reorders the work into five phases, each with strict no-LLM-in-content rules.

---

## Foundation (already complete)

Issues #1–#6 (merged) built the Astro skeleton: project setup, directory layout, base layouts, three placeholder components (PersonCard, HeroSection, EventCard), content collections, and sample data. The skeleton stays. Most of the **placeholder styling** in `public/styles.css` and the example content in `src/content/` will be replaced as part of Phases B–D.

Existing `Base.astro` nav links and footer also point to invented pages (e.g. `/programs/`) and will be rewritten in Phase D against the real site nav.

---

## Phase A — Mechanical Capture (zero LLM)

**Output:** A `capture/` directory in the repo containing the raw HTML and images of every page on rootsofprogress.org as of capture date. This is the source of truth for everything downstream.

**Rule:** No LLM touches site content. The LLM writes the script; the script does the work.

### A1. Crawl the site and save raw HTML

- Use `fetch()` (Node) or `curl` to download HTML for every URL discoverable from the sitemap and from internal links found while crawling
- Save under `capture/html/<slug>.html` preserving the URL path
- Save the sitemap and a manifest (`capture/manifest.json`) listing every URL captured, its HTTP status, content-type, and SHA-256
- Capture-date stamp in the manifest so future re-runs are comparable

**Deliverable:** PR adding `scripts/capture-site.mjs`, `capture/html/**`, `capture/manifest.json`. Reviewer spot-checks 3–5 captured files against the live site.

### A2. Download all images

- Parse `<img src>`, `<source srcset>`, and CSS `url(...)` references from captured HTML and CSS
- Download to `capture/images/` preserving paths from the WP CDN
- Record originals in the manifest (URL, size, content-type, hash)

**Deliverable:** PR adding `scripts/download-images.mjs` and `capture/images/**`.

---

## Phase B — Design System Extraction

**Output:** A working `Base` layout, `public/styles.css`, and font assets that match the original site's typography, color, spacing, and chrome (header / footer / nav). No content yet — just the visual frame.

### B1. Extract design tokens

- Pull the linked stylesheets from the captured HTML; save to `capture/css/`
- Identify and document tokens (colors, font families and weights, spacing scale, breakpoints) in `docs/design-tokens.md`
- Download the original webfonts (F37Grotesc, Palast-Web) into `public/fonts/` if licensing allows; otherwise document the substitution

**Deliverable:** PR adding `capture/css/`, `docs/design-tokens.md`, and `public/fonts/`.

### B2. Rebuild Base layout to match the original chrome

- Replace `src/layouts/Base.astro` header, nav, and footer to match the original site's markup and link list (no invented pages)
- Replace `public/styles.css` global rules with rules derived from the original CSS — typography, color, spacing, link styles
- Preview against a captured page and visually compare

**Deliverable:** PR replacing `Base.astro` and `public/styles.css`. Reviewer compares header/footer side-by-side with rootsofprogress.org.

---

## Phase C — Page-Type Components

**Output:** Astro components that match the layout patterns actually used on the site. One component set per **page type** observed in `capture/html/`, not per imagined feature.

### C1. Inventory page types

- Read every file under `capture/html/`; group by visible layout pattern
- Produce `docs/page-types.md` listing each type, its URLs, and the components it needs
- Expected types (subject to what we actually find): homepage, simple text page (About, Support, Manifesto), blog index, blog post, person grid (fellows, advisors), program/event landing page

**Deliverable:** PR adding `docs/page-types.md`.

### C2…Cn. Build one component set per page type

One issue per page type. Each issue:

- References the relevant captured HTML files and `docs/design-tokens.md`
- Implements the components in `src/components/`
- Builds a `*-demo.astro` route under `src/pages/_demo/` that renders sample data through the component, for visual review
- Updates or replaces the existing PersonCard / HeroSection / EventCard placeholders rather than adding parallel ones

Component fidelity is judged by visual diff against the original, not against the spec.

---

## Phase D — Page-by-Page Reproduction

**Output:** Every unique page on the original site, reproduced from `capture/html/` content using Phase C components, rendering at the same URL.

**Rule:** Content comes from the captured HTML via mechanical conversion (Turndown or similar). Frontmatter (title, date, author, description) comes from page `<meta>` tags. The LLM never reads or writes page body text.

### D1. Wire up the conversion pipeline

- Add `scripts/html-to-markdown.mjs` using `turndown` (or `node-html-markdown`)
- Configure it for the page-builder markup observed in capture (handle WP-specific block wrappers, image shortcodes, etc.)
- Output: writes `.md` files into `src/content/pages/` or `src/content/blog/` based on URL pattern, with frontmatter from `<meta>` tags

**Deliverable:** PR adding the script. No content commits in this PR.

### D2…Dn. Migrate pages, one issue per logical group

Group by page type so pages in one PR share a layout/component fix cycle. Suggested groups (final list determined by Phase C inventory):

- D-home: homepage (`/`)
- D-about: About + Manifesto + similar narrative pages
- D-support: Support page (donation links, embeds)
- D-fellowship: Fellowship landing page + fellows grid (data file from captured profile pages)
- D-conference: Conference landing + speakers grid
- D-medicine: Progress in Medicine
- D-blog-index: `/blog/` listing
- D-blog-posts: all individual posts (one batch PR; ~25 posts)

For each group:
- Run the conversion script to produce content files
- Spot-check 2–3 against the original (diff the rendered page text)
- Wire up the route if it's not data-driven
- Verify navigation, internal links, and images

These groups are largely independent and can be worked in parallel once Phases A–C are merged.

---

## Phase E — Verification & Cutover Prep

### E1. Visual + content verification

- Build the site (`npm run build`) and serve locally
- For each captured URL, render the new page and the captured HTML side-by-side; record any discrepancy
- Check every internal link resolves (script: parse all `<a href>`, fetch each)
- Check every `<img src>` resolves and matches a captured image hash where applicable

**Deliverable:** `docs/verification-report.md` with per-page status.

### E2. Deployment, SEO, and team review

- Confirm Netlify production build green; configure custom domain on a staging subdomain
- Verify `<title>`, `<meta description>`, OG tags match captured originals
- Generate sitemap; submit to staging Search Console
- Team walkthrough on staging URL; collect punch list
- Address punch list items as small follow-up PRs

### E3. Cutover

Out of scope for this plan — gated on team sign-off after E2. DNS swap and 301 strategy will be planned separately when staging is approved.

---

## Issue mapping (for Brunel)

| Phase | Issues |
|-------|--------|
| Foundation | #1–#6 (closed, merged) |
| A. Capture | A1 (crawl HTML), A2 (download images) |
| B. Design system | B1 (tokens), B2 (Base + global CSS) |
| C. Components | C1 (inventory) + one per page type discovered |
| D. Pages | D1 (pipeline) + one per page group from C1 |
| E. Verification | E1 (verify), E2 (staging review) |

Total expected: ~15–20 new issues. Final count depends on what Phase C inventory reveals.

Phases A → B → C run sequentially. Within Phase D, page-group issues run in parallel. Phase E is sequential.

---

## Discipline / non-negotiables

1. **No LLM in the content path.** Not WebFetch, not "Claude, convert this HTML." LLM writes scripts; scripts process content.
2. **No invented pages.** If a URL isn't in `capture/manifest.json`, it doesn't exist on the new site.
3. **No invented copy.** All page body text traces back to a captured HTML file via a mechanical transform. If a string can't be traced, delete it.
4. **Visual diff before merge.** Every page-shipping PR includes a side-by-side comparison in the PR description.
5. **Capture is immutable.** `capture/` is read-only after Phase A. If the live site changes mid-migration, re-run capture as a separate PR with a fresh date stamp.

---

## What changed vs v1

- Removed: 40-task linear plan that built components first
- Removed: Tasks 22–28 (premature build/test, programs page, hand-written homepage content)
- Removed: Tasks 34–40 (placeholder migration steps with no concrete pipeline)
- Added: Phase A capture as the source of truth
- Added: Page-type inventory before component work
- Added: Mechanical conversion pipeline as a discrete deliverable
- Added: Visual-diff verification gate before deployment

The Foundation work (issues #1–#6) is preserved as-is. Everything from issue #7 onward is replaced by this plan.
