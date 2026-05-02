---
name: WordPress to Astro Migration Milestone
description: Complete migration of Roots of Progress WordPress site to Astro static site with file-based content
type: milestone
---

# WordPress to Astro Migration Milestone

## Goal

Migrate Roots of Progress nonprofit website from WordPress to Astro static site, eliminating security vulnerabilities, enabling team-friendly maintenance via Claude Code, and establishing a foundation for eventual Decap CMS layer (Phase 2).

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

See GitHub milestone for the complete list of 10 issues with dependencies:

1. Project Setup (Tasks 1-5) — No blockers
2. Directory Structure & Base Layouts (Tasks 6-9) — Depends on #1
3. Core Components (Tasks 10-12) — Depends on #1; parallel with #2
4. Page Templates & Homepage (Tasks 13-15) — Depends on #2, #3
5. Content Collections & Sample Data (Tasks 16-18) — Depends on #2, #4
6. Data-Driven Components & Pages (Tasks 19-21) — Depends on #3, #5
7. Build, Test & WordPress Migration (Tasks 22-25) — Depends on #6
8. Advanced Features (Tasks 26-28) — Depends on #7
9. Deployment Configuration & Testing (Tasks 29-33) — Depends on #8
10. Content Migration Completion & Documentation (Tasks 34-40) — Depends on #9

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

**Status:** Ready for issue creation

**Assigned to:** Brunel (implementation via 10 PR-sized issues)

**Reviewed by:** Jason Crawford (project owner, decision maker)
