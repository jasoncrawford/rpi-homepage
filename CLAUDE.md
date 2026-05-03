# Roots of Progress Homepage — Agent Guide

## Project overview

Static Astro site migrating rootsofprogress.org from WordPress. See `docs/superpowers/plans/2026-05-01-wordpress-migration.md` for the full migration plan and `docs/2026-05-01-astro-migration-milestone.md` for the milestone tracker.

## Non-negotiables

1. **No LLM in the content path.** Use `verbatim-content-extraction` skill for any content migration. WebFetch and asking Claude to "convert HTML" silently paraphrase content.
2. **Visual diff before merging any page or component PR.** See workflow below.
3. **No invented pages or copy.** Every page must trace back to `capture/manifest.json`.

## Visual diff — required on every page/component PR

Any PR that ships a page or page-section component must include a visual comparison before merge.

### Run the script

```bash
npm run visual-diff -- /           # homepage
npm run visual-diff -- /about/     # any path
npm run visual-diff -- /demo/homepage-demo   # demo route (local only)
```

Produces PNGs in `tmp/visual-diff/<slug>-{local,live}-{desktop,mobile}.png`. For `/demo/` paths, only local screenshots are taken.

### Verify with Read tool

Use the `Read` tool to view each PNG — Claude can see images. Check:

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
