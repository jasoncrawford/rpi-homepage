# Roots of Progress Homepage — Agent Guide

## Project overview

Static Astro site migrating rootsofprogress.org from WordPress. See `docs/superpowers/plans/2026-05-01-wordpress-migration.md` for the full migration plan and `docs/2026-05-01-astro-migration-milestone.md` for the milestone tracker.

## Non-negotiables

1. **No LLM in the content path.** Use `verbatim-content-extraction` skill for any content migration — including SVGs. WebFetch and asking Claude to "convert HTML" or "copy this SVG" silently paraphrase content. For SVGs specifically: extract via curl + DOM parse, save under `src/components/svg/*.svg.html`, and inject with `?raw` imports — never hand-copy SVG path data into a string literal.
2. **Visual diff before merging any page or component PR.** See workflow below.
3. **No invented pages or copy.** Every page must trace back to `capture/manifest.json`.
4. **Don't invent CSS rules.** Every rule in `public/styles.css` and component `<style is:global>` blocks must trace back to `capture/css/`. If a rule isn't in the captured CSS, don't add it — even if "it makes things look right." (Past bug: invented `section.posts { padding: 60px 0 }` added 360 px of cumulative offset across the page.)

## Visual diff — required on every page/component PR

Any PR that ships a page or page-section component must include a visual comparison before merge.

### Run the script

```bash
npm run visual-diff -- /           # homepage
npm run visual-diff -- /about/     # any path
```

Produces PNGs in `tmp/visual-diff/<slug>-{local,live,diff}-{desktop,mobile}.png`. The `diff` PNG highlights every mismatched pixel in red. For `/demo/...` paths (local-only routes), only the local screenshots are taken — no live, no diff.

### Verify with Read tool

Use the `Read` tool to view each PNG — Claude can see images.

**Read the `diff` PNG first.** Red regions are exactly where local and live disagree. That tells you where to look. Then open `local` and `live` side-by-side to see *what* differs there. Check:

- Layout: columns, spacing, and alignment match
- Typography: font, size, weight, line-height match
- Images: present and correctly sized
- Colors and borders: no unexpected differences
- Mobile: layout stacks correctly at 375 px

### Document in PR body

Describe what you saw. Example:

> **Visual diff — `/about/` desktop & mobile:** Layout matches live. Header, body text, and footer align. No regressions.

If there are differences, explain whether they're intentional.

### Red flags

- Writing "matches the original" without having Read the screenshots
- PR touching a page or component with no visual comparison noted
- Skipping because "it's a small change" — small CSS changes break layouts

See `docs/visual-diff.md` for full details and Chromium install instructions.

## Debugging CSS against the original

`capture/css/global.css` is minified — rules run together. When a CSS value looks wrong, **verify which media query the original rule lives in** before writing your version. A rule inside `@media (max-width:767px)` that you apply at the base level will be wrong on desktop.

Use Python to extract a rule with its surrounding context:

```bash
python3 << 'EOF'
with open('capture/css/global.css') as f:
    content = f.read()
import re
for keyword in ['header .logo{', 'footer .logo\\+']:
    for m in re.finditer(keyword, content):
        print(content[max(0, m.start()-80):m.start()+200])
        print()
EOF
```

If dynamic behavior (hover effects, scroll handling, height adjustments) differs from the static CSS, fetch the original theme JS:

```bash
# URL is in capture/html/index.html — look for theme/assets/js/app.js
curl -s "https://rootsofprogress.org/wp-content/themes/theme/assets/js/app.js?ver=2.0.31" | head -200
```

The theme JS is the authoritative source for JS-driven behaviors (e.g. `li.last` height set dynamically on dropdown hover).
