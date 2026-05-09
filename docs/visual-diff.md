# Visual Diff

`scripts/visual-diff.mjs` takes side-by-side screenshots of the local dev build vs. the live site, at desktop and mobile widths, so you can confirm a page looks right before merging.

## How to run

```bash
npm run visual-diff -- /
npm run visual-diff -- /about/
```

Output: six PNG files in `tmp/visual-diff/`. For paths under `/demo/...` (local-only routes), only two `local` PNGs are produced — no live counterpart, no diff.

File naming: `<slug>-{local,live,diff}-{desktop,mobile}.png`

## What it does

1. Starts `astro dev` on port 4321 and waits for it to be ready.
2. Opens Chromium (headless) via Playwright.
3. Captures full-page screenshots at 1280×800 (desktop) and 375×800 (mobile).
4. For non-demo paths, generates a `diff` PNG per viewport that highlights every mismatched pixel in red on top of the local screenshot, and prints the percent of mismatched pixels.
5. Tears down the dev server on exit, including on error.

`/demo/...` paths are local-only — there's nothing to compare on the live site, so no `live` or `diff` PNG is produced.

## What to look for

**Start with the `diff` PNG.** Red regions are exactly where local and live disagree pixel-by-pixel. Use it to find what to focus on, then open the `local` and `live` PNGs side-by-side to see *what* the difference is.

Check:

- **Layout**: columns, spacing, alignment match.
- **Typography**: font, size, weight, line-height look the same.
- **Images**: present, correctly sized, not broken.
- **Colors / borders**: no unexpected differences.
- **Mobile**: nav, stacking, tap targets make sense at 375 px.

Small rendering deltas (anti-aliasing, font hinting) are fine — pixelmatch tolerates them by default. Layout shifts, missing elements, or wrong colors light up clearly in the diff.

## When they don't match

1. Identify whether the difference is in your new code or a pre-existing divergence.
2. If pre-existing, note it in the PR description so reviewers have context.
3. If caused by your changes, iterate until local matches live (or the departure is intentional and approved).

## Chromium install

`npm install` automatically installs the Chromium browser via the `postinstall` script. If you skipped that or need to re-run it:

```bash
npx playwright install chromium
```
