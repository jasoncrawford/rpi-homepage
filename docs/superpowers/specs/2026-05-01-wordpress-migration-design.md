---
name: WordPress to Astro Static Site Migration
description: Phased migration of Roots of Progress WordPress site to Astro + Decap CMS, with focus on component-driven architecture and easy team maintenance
type: design
---

# WordPress to Astro Static Site Migration

## Project Overview

**Goal:** Migrate Roots of Progress nonprofit website from WordPress to a static site (Astro), addressing security vulnerabilities, improving team accessibility, and enabling flexible customization via Claude Code.

**Site characteristics:**
- ~12 pages of content (About, Programs, Support, etc.)
- Blog with occasional announcements
- 4 main programs (Conference, Fellowship, Progress in Medicine, etc.)
- Structured data (fellows list, speakers, team members)
- External integrations (Typeform, Patreon, PayPal links, Substack newsletter)
- No complex dynamic features (no comments, search, or user interactions)

**Team:**
- Jason: technical lead, site admin
- 3-4 other team members: non-technical but learning Claude Code, will maintain their program pages

**Motivations:**
1. **Security:** WordPress has been hacked and vandalized multiple times
2. **Accessibility:** Team wants to understand and modify the whole site without learning WordPress/plugins
3. **Flexibility:** Use Claude Code to work with the codebase
4. **Maintainability:** Distributed content ownership (each program owner maintains their pages)

**Timeline:** Relatively urgent, but willing to invest in getting the architecture right. Phased approach acceptable.

---

## Architecture & Technology Choices

### Why Astro?

- **Component-native:** Built-in support for reusable components (a key requirement for fellows, speakers, team members)
- **Content Collections API:** First-class support for organizing and querying markdown + frontmatter
- **Mixed content:** Handles markdown pages, data-driven pages, and complex components seamlessly
- **Performance:** Generates fast static HTML with minimal JavaScript
- **Modern DX:** Integrates well with Claude Code for rapid development and maintenance
- **Flexible deployment:** Works with Netlify, Vercel, any static host

### Hosting & Deployment

- **Hosting:** Netlify or Vercel (user's preference, both fully supported)
- **Source control:** GitHub
- **Deployment:** Automatic on git push
- **Staging:** Separate staging environment (different branch/URL) for safe migration and testing before swapping DNS

### Git-based approach (Phase 1)

- All content stored in `.md` and `.yaml` files in the git repo
- Content updates = git commits = auto-deploy
- Pair well with Claude Code for editing and generation
- No external CMS database to maintain

---

## Phase 1: Astro Site + File-based Content

### Directory Structure

```
rpi-homepage/
├── src/
│   ├── pages/
│   │   ├── index.astro              # Homepage (component-based)
│   │   └── [slug].astro             # Dynamic page template
│   ├── content/
│   │   ├── pages/                   # Static pages
│   │   │   ├── about.md
│   │   │   ├── support.md
│   │   │   └── ...
│   │   └── blog/                    # Blog posts/announcements
│   │       ├── conference-2026-dates.md
│   │       ├── fellowship-opening.md
│   │       └── ...
│   ├── data/                        # Structured data for component rendering
│   │   ├── fellows.yaml
│   │   ├── speakers.yaml
│   │   ├── team.yaml
│   │   └── ...
│   ├── components/
│   │   ├── HeroSection.astro
│   │   ├── PhilosophyCards.astro
│   │   ├── ConferencePreview.astro
│   │   ├── PersonCard.astro
│   │   ├── EventCard.astro
│   │   ├── Navigation.astro
│   │   ├── Footer.astro
│   │   └── ... (other reusable components)
│   ├── layouts/
│   │   ├── Base.astro               # Main layout (header, footer, nav)
│   │   └── BlogPost.astro           # Blog post layout
│   └── assets/
│       └── images/                  # Migrated WordPress images
├── astro.config.mjs
├── tsconfig.json
├── package.json
└── docs/
```

### Content Formats

**Blog posts and pages** (`.md` files with frontmatter):
```yaml
---
title: "Fellowship Program Opens"
date: 2026-05-15
author: "Jason Crawford"
description: "Short excerpt for listings"
layout: "BlogPost"
---

# Content here in markdown
```

**Structured data** (`.yaml` files):
```yaml
# src/data/fellows.yaml
- id: "jane-smith"
  name: "Jane Smith"
  role: "Fellowship Director"
  bio: "Jane leads..."
  image: "jane.jpg"
  website: "https://..."
  
- id: "john-doe"
  name: "John Doe"
  ...
```

### Component-Driven Pages

**Homepage example** (`src/pages/index.astro`):
```astro
---
import Layout from '../layouts/Base.astro'
import HeroSection from '../components/HeroSection.astro'
import PhilosophyCards from '../components/PhilosophyCards.astro'
import ConferencePreview from '../components/ConferencePreview.astro'
import FellowshipPreview from '../components/FellowshipPreview.astro'
import NewsPreview from '../components/NewsPreview.astro'

const conference = await getCollection('conferences')
const news = (await getCollection('blog')).slice(0, 3)
---

<Layout title="Home">
  <HeroSection 
    title="A culture of progress for the 21st century"
    description="While humanity has achieved remarkable progress..."
  />
  <PhilosophyCards />
  <ConferencePreview conference={conference} />
  <FellowshipPreview />
  <NewsPreview posts={news} />
</Layout>
```

**Dynamic pages** (e.g., fellows page renders from `src/data/fellows.yaml`):
```astro
---
// src/pages/fellows.astro
import Layout from '../layouts/Base.astro'
import PersonCard from '../components/PersonCard.astro'
import { fellows } from '../data/fellows.yaml'
---

<Layout title="Fellows">
  <h1>Our Fellows</h1>
  <div class="fellows-grid">
    {fellows.map(fellow => <PersonCard {...fellow} />)}
  </div>
</Layout>
```

### Content Organization

**Pages:** Simple content pages that don't change often (About, Support, Contact, etc.)
- Stored in `src/content/pages/`
- Rendered via dynamic `[slug].astro` template
- Easy to edit (just markdown)

**Blog/Announcements:** Time-ordered content
- Stored in `src/content/blog/`
- Rendered via `src/pages/blog/[slug].astro`
- Supports tags, authors, dates

**Data-driven pages:** Pages that render structured data (fellows, speakers, team)
- Data in `src/data/*.yaml`
- Template pages (e.g., `src/pages/fellows.astro`) loop over data and render components
- Easy to update: just edit the YAML file

**Integrations:** External links/embeds (Typeform, PayPal, Patreon, Substack)
- Stored as simple HTML embeds or links in components
- No special handling needed

---

## Migration Strategy

### Step 1: Content Extraction & Conversion
- Export all WordPress posts/pages (content, metadata, featured images)
- Convert HTML to markdown with YAML frontmatter
- Download and organize images into `src/assets/images/`
- Extract structured data (fellows, speakers) into `.yaml` files

**Effort:** Claude Code can automate much of this extraction and conversion

### Step 2: Build Astro Skeleton
- Create the directory structure above
- Build layout components (header, footer, navigation)
- Create reusable components for common patterns
- Set up Astro config for content collections
- Style with CSS (or Tailwind if preferred)

**Effort:** Moderate; Claude Code can scaffold most of this

### Step 3: Incremental Content Migration
- Migrate content in batches by section (e.g., About → Programs → Blog)
- For each section:
  - Convert content to markdown
  - Adjust component styles/layout as needed
  - Test on staging URL
  - Get team feedback
- Keep WordPress live until new site is fully ready

**Effort:** Lower per-section, but many sections. Claude Code handles bulk conversion; team reviews and refines.

### Step 4: Final Testing & Cutover
- Full content parity check (all pages, links, images present)
- SEO verification (metadata, Open Graph tags, sitemap)
- Performance audit (Lighthouse)
- Accessibility check
- Test on multiple devices/browsers
- Staging URL validation with team
- When ready: **Option A** (swap DNS) or **Option B** (redirect WordPress to new site)

---

## Phase 1 Success Criteria

- [x] All WordPress content migrated to markdown/YAML
- [x] All images migrated to `src/assets/`
- [x] Homepage and all main pages render correctly
- [x] Component system working (fellows, speakers, etc. render from data)
- [x] Navigation, header, footer functional
- [x] Blog posts display with correct metadata
- [x] Links and images working
- [x] Staging site fully functional and tested
- [x] SEO metadata (title, description, OG tags) present on all pages
- [x] Accessibility baseline met (WCAG AA)
- [x] Google Analytics integrated (meta tag)
- [x] Team can navigate and understand the structure

---

## Phase 2: Decap CMS (Post-Launch)

After Phase 1 is live and stable, add a visual CMS layer:

- **Decap CMS** configuration to manage the same git files
- Visual editor at `/admin` for non-technical team members
- No changes to Astro build or deployment
- Team can edit pages via UI instead of editing files directly

**Benefits:**
- Non-technical team members get a familiar WordPress-like interface
- Writers can focus on content, not file structure
- All changes still go through git (version control, review capability)
- Automatic deploy on every change

---

## Future Considerations (Out of Scope)

### MDX (Markdown with embedded components)
If structured pages become tedious to edit, can migrate individual pages from `.astro` to `.mdx` format, allowing markdown + embedded components. Astro supports this natively.

### Search
Can be added later with a static search solution (e.g., Pagefind, Lunr) if needed.

### Analytics
Google Analytics tag in HTML layout is sufficient for Phase 1.

---

## Team Workflow

### Day-to-Day Maintenance (Phase 1)

**Program owners updating their section:**
1. Clone repo
2. Edit markdown file or YAML data
3. Run `npm run dev` to preview locally
4. Commit and push to GitHub
5. Netlify auto-deploys

Or with Claude Code:
1. Open file with Claude Code
2. Claude Code makes edits, previews, and commits
3. Deploy automatic

### Publishing a Blog Post

1. Create `.md` file in `src/content/blog/`
2. Add frontmatter (title, date, author)
3. Write content in markdown
4. Commit and push
5. Auto-deploy to live site

---

## Technical Stack Summary

| Layer | Choice | Why |
|-------|--------|-----|
| **SSG** | Astro | Component-native, Collections API, mixed content, modern DX |
| **Content** | Markdown + YAML | Human-readable, version-controllable, easy to edit |
| **Hosting** | Netlify/Vercel | Fast, auto-deploy from git, excellent DX |
| **Styling** | CSS (or Tailwind) | Keep it simple for Phase 1; add if needed |
| **Components** | Astro | Built-in support, no JavaScript overhead |
| **Data** | YAML | Simple, readable, easy to edit |

---

## Risks & Mitigation

| Risk | Mitigation |
|------|-----------|
| Content extraction errors | Claude Code automates with human review; test thoroughly on staging |
| Image paths breaking | Centralize image organization in `src/assets/`; use Astro's Image component for optimization |
| Team members confused by git workflow | Phase 2 Decap CMS removes need for git; Phase 1 uses Claude Code to handle commits |
| SEO metadata lost | Explicitly map WordPress metadata (title, description) to frontmatter; verify sitemap generation |
| Styling differences from WordPress | Screenshot WordPress, replicate component-by-component on staging; iterate with team |
| Missed pages/content | Content audit checklist before cutover; full staging URL review |

---

## Success Metrics

- All WordPress content migrated and functional
- Staging site passes accessibility audit
- Performance (Lighthouse) improved vs. WordPress
- Team can maintain and update content independently
- Zero downtime migration (DNS swap when ready)
- Reduced security surface (static files vs. WordPress)
