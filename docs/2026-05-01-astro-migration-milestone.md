---
name: WordPress to Astro Migration Milestone
description: Complete migration of Roots of Progress WordPress site to Astro static site with file-based content
type: milestone
---

# WordPress to Astro Migration Milestone

## Goal

Migrate Roots of Progress nonprofit website from WordPress to Astro static site, eliminating security vulnerabilities, enabling team-friendly maintenance via Claude Code, and establishing a foundation for eventual Decap CMS layer (Phase 2).

**Scope:** `rootsofprogress.org` only. `blog.rootsofprogress.org` and `newsletter.rootsofprogress.org` are separate sites and are not part of this migration.

## Definition of Done

- All WordPress content migrated to markdown/YAML files in git
- Astro site builds and deploys successfully to Netlify
- Full feature parity with WordPress (pages, blog, data-driven components)
- Staging environment fully tested and approved by team
- Performance, accessibility, and SEO baselines met (Lighthouse > 90, WCAG AA)
- Team documentation written and team trained
- Ready for production cutover (DNS swap or 301 redirects)

## Approach

### Architecture

**Astro static site generator** with:
- Content in markdown files with YAML frontmatter (no database)
- Structured data in YAML files for data-driven pages (fellows, speakers)
- Reusable Astro components for layout and content rendering
- Git as source of truth
- Netlify for hosting and auto-deployment

**Advantages:**
- **Security:** Static files only, no server backend
- **Performance:** Fast HTML served from CDN
- **Maintainability:** Git-based workflow teams understand
- **Team-friendly:** Non-technical members can edit markdown with Claude Code help
- **Future-proof:** Easy to add Decap CMS visual editor in Phase 2 without changing architecture

### Content Organization

- **Pages:** Static content in `src/content/pages/*.md` (About, Support, etc.)
- **Blog:** Time-ordered posts in `src/content/blog/*.md`
- **Data:** Structured YAML in `src/data/*.yaml` (fellows, speakers, team)
- **Components:** Reusable `.astro` files for layout and rendering logic

### Migration Strategy

1. Extract WordPress content (posts, pages, images, metadata)
2. Build Astro skeleton (layouts, components, config)
3. Incrementally migrate content by section
4. Test thoroughly on staging environment
5. Deploy to production when ready (zero-downtime cutover)

### Testing Strategy

- **Build:** Verify `npm run build` produces valid static site
- **Functionality:** Manual testing of all pages, links, images
- **Performance:** Lighthouse audit (target > 90 on all metrics)
- **Accessibility:** WCAG AA compliance check
- **SEO:** Verify metadata, sitemap generation, Google Search Console
- **Team review:** Staging site review and approval before cutover

## Key Decisions

1. **Astro over other SSGs:** Component-native, excellent DX, Collections API for content, Markdown + data support
2. **Markdown + YAML:** Human-readable, version-controllable, easy to edit via Claude Code
3. **Netlify deployment:** Auto-deploy on git push, staging support, excellent Astro integration
4. **Phased approach:** Phase 1 (file-based), Phase 2 (add Decap CMS later if needed)
5. **Team workflow:** Claude Code handles git/commits for non-technical members

## Open Questions

- Will team use Claude Code for editing, or prefer Decap CMS in Phase 2?
- What's the preferred custom domain/hosting for production?
- Are there any WordPress plugins/features we haven't discussed that need special handling?

## Issue Breakdown

The original 10-issue plan was restructured after issues #1–#6 (foundation) merged. The first attempt at content extraction (issue #7 / PR #23) produced invented pages and paraphrased text because it allowed LLM-mediated tools in the content path. Issues #7–#10 and the redo #24 were closed and replaced by the v2 plan.

**Foundation (complete):**
- #1 Project Setup
- #2 Directory Structure & Base Layouts
- #3 Core Components (placeholders)
- #4 Page Templates & Homepage
- #5 Content Collections & Sample Data
- #6 Data-Driven Components & Pages

**v2 plan — capture-first, no LLM in content path:**
- **Phase A — Mechanical Capture:** #27 ✓ crawl HTML (merged PR #33), #28 ✓ download images (merged PR #36)
- **Phase B — Design System:** #29 ✓ extract tokens (merged PR #35), #30 (rebuild Base + CSS)
- **Phase C — Page-Type Components:** #31 ✓ inventory (PR #37 in review) + C2–C12 to file after merge
- **Phase D — Page-by-Page Reproduction:** filed after C1 inventory lands; one issue per page group; can run in parallel
- **Phase E — Verification:** filed after Phase D; visual diff, staging review, cutover prep

See `docs/superpowers/plans/2026-05-01-wordpress-migration.md` for the full plan, including the discipline rules every implementing PR must follow.

## Success Criteria

- ✅ All WordPress content migrated and rendering correctly
- ✅ Site builds without errors
- ✅ All pages accessible and links working
- ✅ Images present and displaying correctly
- ✅ Navigation functional across all pages
- ✅ Lighthouse performance > 90
- ✅ Accessibility WCAG AA baseline met
- ✅ Google Analytics configured
- ✅ Sitemap generated and valid
- ✅ Staging environment fully functional
- ✅ Team reviewed and approved staging site
- ✅ Documentation complete
- ✅ Ready for production cutover

## Timeline

No fixed deadline, but targeting completion in order of dependency (estimated ~2-3 weeks with Brunel's full focus and Claude Code assistance).

## Resources

- **Implementation plan:** `docs/superpowers/plans/2026-05-01-wordpress-migration.md`
- **Design spec:** `docs/superpowers/specs/2026-05-01-wordpress-migration-design.md`
- **GitHub repo:** https://github.com/jasoncrawford/rpi-homepage
- **Current WordPress site:** https://rootsofprogress.org (reference for content/design)

## Risks & Mitigation

| Risk | Mitigation |
|------|-----------|
| Content extraction errors | Claude Code automates with manual review; test on staging |
| Image migration issues | Centralize in `src/assets/images/`; test thoroughly |
| Team confusion with git workflow | Claude Code handles commits; Phase 2 adds Decap CMS UI |
| SEO metadata lost | Explicitly map WordPress metadata to frontmatter; verify |
| Performance regression | Lighthouse audits; compare to WordPress baseline |
| Missed content during migration | Detailed content audit checklist before cutover |

---

**Status:** Phase B in progress — B1 complete (merged PR #35), B2 (#30) next; Phase C in progress — C1 inventory in review (PR #37); C2–C12 to file after merge

**Assigned to:** Brunel (implementation via 10 PR-sized issues)

**Reviewed by:** Jason Crawford (project owner, decision maker)
