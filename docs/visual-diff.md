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

## Debugging high diffs — measure, don't eyeball

When the diff PNG is busy with red and you can't tell what's wrong, **stop staring at the PNG and measure with Playwright**. Eyeballing typically takes hours and guesses wrong; measurement finds the offending property in seconds.

The pattern: open both URLs in the same browser context, query the DOM, compare. Section heights first to find the offending section, then computed CSS on its children to find the offending property.

```js
// Inside a Playwright script. Run against http://127.0.0.1:4321/ and the live URL.
const sections = await page.evaluate(() =>
  [...document.querySelectorAll('main > section')].map(s => ({
    cls: s.className,
    h: Math.round(s.getBoundingClientRect().height),
  }))
);
// Compare local[i].h vs live[i].h to find the section with the largest delta.

// Then on the offending section, compare computed CSS on its children:
const styles = await page.evaluate(() => {
  const out = {};
  for (const sel of ['.headline', '.title', '.bottoms', /* ... */]) {
    const el = document.querySelector(sel);
    if (!el) continue;
    const cs = getComputedStyle(el);
    out[sel] = { font: cs.fontFamily, color: cs.color, padding: cs.padding };
  }
  return out;
});
```

Trace each property where local differs from live:

- **In your CSS but not in captured?** → invented; delete it. (See the `no-invented-css` skill.)
- **In captured but not in yours?** → missing; port it.
- **In both at different specificity / media query?** → fix the cascade.

Real result: this technique took the C12 homepage diff from 12% → 2.9% by surfacing six invented rules that no amount of eyeballing would have found.

## Chromium install

`npm install` automatically installs the Chromium browser via the `postinstall` script. If you skipped that or need to re-run it:

```bash
npx playwright install chromium
```
