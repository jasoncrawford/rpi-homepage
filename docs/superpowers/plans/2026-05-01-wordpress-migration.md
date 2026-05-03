# WordPress to Astro Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate Roots of Progress WordPress site to Astro with file-based content (markdown + YAML), achieving feature parity, improved security, and team-friendly maintenance.

**Architecture:** Astro generates static HTML from markdown pages and YAML data. Content lives in git, components render data-driven pages (fellows, speakers), layouts wrap pages with headers/footers, and Netlify/Vercel auto-deploys on git push.

**Tech Stack:** Astro, Node.js, npm, Markdown, YAML, CSS, Git, Netlify/Vercel

---

## Phase 1a: Project Setup & Configuration

### Task 1: Initialize npm project

**Files:**
- Create: `package.json`

- [ ] **Step 1: Create package.json**

```bash
cd /Users/jason/projects/rpi-homepage
npm init -y
```

Expected output: Creates `package.json` with basic Node.js project metadata.

- [ ] **Step 2: Verify file created**

```bash
cat package.json
```

Expected: JSON file with name, version, main, scripts, keywords, author, license.

- [ ] **Step 3: Commit**

```bash
git add package.json
git commit -m "Initialize npm project"
```

---

### Task 2: Install Astro and dependencies

**Files:**
- Modify: `package.json`
- Create: `package-lock.json`, `node_modules/`

- [ ] **Step 1: Install Astro and core packages**

```bash
npm install astro
npm install -D typescript @types/node
```

Expected: Installs Astro ~4.0+ and TypeScript, updates `package.json` with dependencies.

- [ ] **Step 2: Verify installation**

```bash
npx astro --version
```

Expected: Prints Astro version 4.x.x

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "Install Astro and TypeScript dependencies"
```

---

### Task 3: Create Astro configuration

**Files:**
- Create: `astro.config.mjs`

- [ ] **Step 1: Write astro.config.mjs**

```javascript
import { defineConfig } from 'astro/config';

export default defineConfig({
  // Routing
  trailingSlash: 'ignore',
  
  // Content collections
  integrations: [],
  
  // Build
  vite: {
    ssr: {
      external: ['svgo']
    }
  }
});
```

- [ ] **Step 2: Verify file created**

```bash
cat astro.config.mjs
```

- [ ] **Step 3: Commit**

```bash
git add astro.config.mjs
git commit -m "Add Astro configuration with content collections setup"
```

---

### Task 4: Create TypeScript configuration

**Files:**
- Create: `tsconfig.json`

- [ ] **Step 1: Write tsconfig.json**

```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "jsxImportSource": "astro",
    "strictNullChecks": true
  }
}
```

- [ ] **Step 2: Verify file created**

```bash
cat tsconfig.json
```

- [ ] **Step 3: Commit**

```bash
git add tsconfig.json
git commit -m "Add TypeScript configuration"
```

---

### Task 5: Add npm scripts for development

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Read current package.json**

```bash
cat package.json
```

- [ ] **Step 2: Update package.json with scripts**

Replace the `"scripts"` section with:

```json
"scripts": {
  "dev": "astro dev",
  "build": "astro build",
  "preview": "astro preview",
  "astro": "astro"
}
```

Updated full `package.json`:

```json
{
  "name": "rpi-homepage",
  "version": "1.0.0",
  "description": "Roots of Progress website built with Astro",
  "main": "index.js",
  "type": "module",
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "astro": "astro"
  },
  "dependencies": {
    "astro": "^4.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0"
  }
}
```

- [ ] **Step 3: Verify scripts added**

```bash
cat package.json | grep -A 5 '"scripts"'
```

- [ ] **Step 4: Commit**

```bash
git add package.json
git commit -m "Add development scripts (dev, build, preview)"
```

---

## Phase 1b: Directory Structure & Base Layouts

### Task 6: Create directory structure

**Files:**
- Create: `src/` directory tree

- [ ] **Step 1: Create all required directories**

```bash
mkdir -p src/pages src/content/pages src/content/blog src/data src/components src/layouts src/assets/images
```

- [ ] **Step 2: Verify structure**

```bash
find src -type d | sort
```

Expected:
```
src
src/assets
src/assets/images
src/components
src/content
src/content/blog
src/content/pages
src/data
src/layouts
src/pages
```

- [ ] **Step 3: Create placeholder files to preserve directories in git**

```bash
touch src/content/pages/.gitkeep src/content/blog/.gitkeep src/data/.gitkeep src/assets/images/.gitkeep src/components/.gitkeep
```

- [ ] **Step 4: Commit**

```bash
git add src/
git commit -m "Create directory structure for src/ with placeholders"
```

---

### Task 7: Create Base layout component

**Files:**
- Create: `src/layouts/Base.astro`

- [ ] **Step 1: Write Base.astro layout**

```astro
---
export interface Props {
  title: string;
  description?: string;
  image?: string;
}

const { title, description = "Roots of Progress Institute", image } = Astro.props;
---

<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title} | Roots of Progress</title>
    <meta name="description" content={description} />
    
    <!-- Open Graph -->
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    {image && <meta property="og:image" content={image} />}
    
    <!-- Google Analytics -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-XXXXXXXXXX');
    </script>

    <link rel="stylesheet" href="/styles.css" />
  </head>
  <body>
    <header>
      <nav>
        <a href="/">Home</a>
        <a href="/about/">About</a>
        <a href="/writing/">Writing</a>
        <a href="/programs/">Programs</a>
        <a href="/support/">Support</a>
      </nav>
    </header>

    <main>
      <slot />
    </main>

    <footer>
      <p>&copy; 2026 Roots of Progress Institute. All rights reserved.</p>
      <ul>
        <li><a href="https://x.com/rootsofprogress">Twitter</a></li>
        <li><a href="https://linkedin.com/company/roots-of-progress/">LinkedIn</a></li>
        <li><a href="mailto:contact@rootsofprogress.org">Contact</a></li>
      </ul>
    </footer>
  </body>
</html>
```

- [ ] **Step 2: Verify file created**

```bash
head -20 src/layouts/Base.astro
```

- [ ] **Step 3: Commit**

```bash
git add src/layouts/Base.astro
git commit -m "Create Base layout with header, nav, footer, and SEO setup"
```

---

### Task 8: Create BlogPost layout

**Files:**
- Create: `src/layouts/BlogPost.astro`

- [ ] **Step 1: Write BlogPost.astro layout**

```astro
---
import Base from './Base.astro';

export interface Props {
  title: string;
  date: Date;
  author?: string;
  description?: string;
}

const { title, date, author = "Roots of Progress", description } = Astro.props;
const formattedDate = new Date(date).toLocaleDateString('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
});
---

<Base title={title} description={description}>
  <article class="blog-post">
    <h1>{title}</h1>
    <div class="blog-meta">
      <time datetime={date.toISOString()}>{formattedDate}</time>
      {author && <span class="author">by {author}</span>}
    </div>
    <slot />
  </article>
</Base>
```

- [ ] **Step 2: Verify file created**

```bash
head -25 src/layouts/BlogPost.astro
```

- [ ] **Step 3: Commit**

```bash
git add src/layouts/BlogPost.astro
git commit -m "Create BlogPost layout with metadata display"
```

---

### Task 9: Create global styles

**Files:**
- Create: `public/styles.css`

- [ ] **Step 1: Create public directory**

```bash
mkdir -p public
```

- [ ] **Step 2: Write basic CSS**

```css
/* Global Styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
  font-size: 16px;
  line-height: 1.5;
  color: #333;
  background: #fff;
}

body {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Header & Navigation */
header {
  border-bottom: 1px solid #eee;
  padding: 20px 0;
  margin-bottom: 40px;
}

nav {
  display: flex;
  gap: 30px;
}

nav a {
  text-decoration: none;
  color: #333;
  font-weight: 500;
}

nav a:hover {
  color: #0066cc;
}

/* Main Content */
main {
  min-height: 60vh;
  margin: 40px 0;
}

h1 {
  font-size: 2.5rem;
  margin-bottom: 20px;
  line-height: 1.2;
}

h2 {
  font-size: 1.75rem;
  margin: 30px 0 15px;
}

h3 {
  font-size: 1.25rem;
  margin: 20px 0 10px;
}

p {
  margin-bottom: 15px;
}

a {
  color: #0066cc;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

img {
  max-width: 100%;
  height: auto;
}

/* Blog */
.blog-meta {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 30px;
}

.blog-meta time::after {
  content: " • ";
  margin: 0 10px;
}

/* Footer */
footer {
  border-top: 1px solid #eee;
  padding: 40px 0;
  margin-top: 60px;
  font-size: 0.9rem;
  color: #666;
}

footer ul {
  list-style: none;
  display: flex;
  gap: 20px;
  margin-top: 15px;
}

/* Responsive */
@media (max-width: 768px) {
  h1 {
    font-size: 2rem;
  }
  h2 {
    font-size: 1.5rem;
  }
  nav {
    flex-direction: column;
    gap: 15px;
  }
}
```

- [ ] **Step 3: Verify file created**

```bash
wc -l public/styles.css
```

- [ ] **Step 4: Commit**

```bash
git add public/styles.css
git commit -m "Add global CSS styles for layouts, typography, navigation"
```

---

## Phase 1c: Core Components

### Task 10: Create PersonCard component

**Files:**
- Create: `src/components/PersonCard.astro`

> **Implemented in PR #15.** Actual implementation uses global CSS classes in `public/styles.css` (consistent with the rest of the codebase) rather than scoped `<style>` blocks. Props: `name` (required), `role`, `bio`, `image`, `website` (all optional except name).

- [x] **Step 1: Write PersonCard.astro**

```astro
---
export interface Props {
  name: string;
  role: string;
  bio?: string;
  image?: string;
  website?: string;
}

const { name, role, bio, image, website } = Astro.props;
---

<div class="person-card">
  {image && <img src={`/images/${image}`} alt={name} class="person-image" />}
  <h3>{name}</h3>
  <p class="role">{role}</p>
  {bio && <p class="bio">{bio}</p>}
  {website && (
    <a href={website} target="_blank" rel="noopener noreferrer">
      Learn more →
    </a>
  )}
</div>

<style>
  .person-card {
    border: 1px solid #eee;
    border-radius: 8px;
    padding: 20px;
    text-align: center;
  }
  
  .person-image {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    object-fit: cover;
    margin-bottom: 15px;
  }
  
  h3 {
    margin: 0 0 5px 0;
  }
  
  .role {
    color: #0066cc;
    font-weight: 600;
    margin-bottom: 10px;
  }
  
  .bio {
    font-size: 0.9rem;
    color: #666;
    margin-bottom: 15px;
  }
</style>
```

- [x] **Step 2: Verify file created**

```bash
head -30 src/components/PersonCard.astro
```

- [x] **Step 3: Commit**

```bash
git add src/components/PersonCard.astro
git commit -m "Create PersonCard component for rendering person profiles"
```

---

### Task 11: Create HeroSection component

**Files:**
- Create: `src/components/HeroSection.astro`

> **Implemented in PR #15.** Uses global CSS. Props: `title` (required), `subtitle` (optional). The `image` background prop from the plan example was not included — the issue spec only called for title and subtitle; a background image can be added later if needed.

- [x] **Step 1: Write HeroSection.astro**

```astro
---
export interface Props {
  title: string;
  subtitle?: string;
  image?: string;
}

const { title, subtitle, image } = Astro.props;
---

<section class="hero" {style: image ? `background-image: url('${image}')` : ''}>
  <div class="hero-content">
    <h1>{title}</h1>
    {subtitle && <p class="subtitle">{subtitle}</p>}
  </div>
</section>

<style>
  .hero {
    background-size: cover;
    background-position: center;
    background-color: #f0f0f0;
    padding: 100px 20px;
    text-align: center;
    color: white;
    text-shadow: 0 2px 4px rgba(0,0,0,0.3);
    margin: -40px -20px 40px -20px;
  }
  
  .hero h1 {
    font-size: 3rem;
    margin-bottom: 20px;
  }
  
  .subtitle {
    font-size: 1.25rem;
    max-width: 600px;
    margin: 0 auto;
  }
  
  @media (max-width: 768px) {
    .hero {
      padding: 60px 20px;
    }
    .hero h1 {
      font-size: 2rem;
    }
    .subtitle {
      font-size: 1rem;
    }
  }
</style>
```

- [x] **Step 2: Verify file created**

```bash
head -30 src/components/HeroSection.astro
```

- [x] **Step 3: Commit**

```bash
git add src/components/HeroSection.astro
git commit -m "Create HeroSection component for page headers"
```

---

### Task 12: Create EventCard component

**Files:**
- Create: `src/components/EventCard.astro`

> **Implemented in PR #15.** Uses global CSS. Props: `title` (required), `date` (required, ISO string — auto-formatted for display), `location`, `description`, `link` (all optional). The `linkText` prop from the plan example was omitted per issue scope; link label is hardcoded as "Learn more →".

- [x] **Step 1: Write EventCard.astro**

```astro
---
export interface Props {
  title: string;
  date: string;
  location?: string;
  description?: string;
  link?: string;
  linkText?: string;
}

const { title, date, location, description, link, linkText = "Learn more" } = Astro.props;
---

<div class="event-card">
  <h3>{title}</h3>
  <div class="event-meta">
    <span class="date">{date}</span>
    {location && <span class="location">{location}</span>}
  </div>
  {description && <p>{description}</p>}
  {link && (
    <a href={link} class="event-link">
      {linkText} →
    </a>
  )}
</div>

<style>
  .event-card {
    border-left: 4px solid #0066cc;
    padding: 20px;
    background: #f9f9f9;
    border-radius: 4px;
    margin-bottom: 20px;
  }
  
  h3 {
    margin: 0 0 10px 0;
  }
  
  .event-meta {
    display: flex;
    gap: 20px;
    font-size: 0.9rem;
    color: #666;
    margin-bottom: 10px;
  }
  
  .event-link {
    display: inline-block;
    margin-top: 10px;
    color: #0066cc;
  }
</style>
```

- [x] **Step 2: Verify file created**

```bash
head -30 src/components/EventCard.astro
```

- [x] **Step 3: Commit**

```bash
git add src/components/EventCard.astro
git commit -m "Create EventCard component for displaying events/programs"
```

---

## Phase 1d: Page Templates

### Task 13: Create dynamic page template

**Files:**
- Create: `src/pages/[slug].astro`

> **Implemented in PR #N (issue #4).** Uses `getCollection('pages')` for static path generation. Renders page title as an `<h1>` outside the `<Content />` component, wrapped in `content-page` / `prose` CSS classes consistent with the global stylesheet.

- [x] **Step 1: Write [slug].astro**

- [x] **Step 2: Verify file created**

- [x] **Step 3: Commit**

---

### Task 14: Create blog post template

**Files:**
- Create: `src/pages/blog/[slug].astro`

> **Implemented in PR #N (issue #4).** Uses `getCollection('blog')` for static path generation. Passes `title`, `date`, `author`, and `description` from frontmatter to the `BlogPost` layout, then renders `<Content />` inside it.

- [x] **Step 1: Create blog directory**

- [x] **Step 2: Write blog/[slug].astro**

- [x] **Step 3: Verify file created**

- [x] **Step 4: Commit**

---

### Task 15: Create homepage

**Files:**
- Create: `src/pages/index.astro`

> **Implemented in PR #N (issue #4).** Homepage includes: `HeroSection` with tagline, mission section, programs grid (Conference, Fellowship, Progress in Medicine), dynamic latest-news section driven by the blog collection (sorted by date, up to 3 posts, shown via `EventCard`), and a support CTA section. The news section is conditionally rendered and will populate automatically as blog posts are added.

- [x] **Step 1: Write index.astro**

```astro
---
import Base from '../layouts/Base.astro';
import HeroSection from '../components/HeroSection.astro';
import EventCard from '../components/EventCard.astro';

// For now, we'll create sample data. This will be populated during migration.
const upcomingEvents = [
  {
    title: "Progress Conference 2026",
    date: "October 8-11, 2026",
    location: "Berkeley, CA",
    description: "Annual conference bringing together leading thinkers on progress",
    link: "/programs/"
  },
  {
    title: "Fellowship Program",
    date: "Applications Open",
    description: "Support for writers and thinkers advancing progress studies",
    link: "/programs/"
  }
];

const recentNews = [];
---

<Base title="Roots of Progress">
  <HeroSection 
    title="A culture of progress for the 21st century"
    subtitle="While humanity has achieved remarkable progress over centuries, progress is not automatic or inevitable."
  />

  <section class="homepage-section">
    <h2>Our Mission</h2>
    <p>
      Roots of Progress is a nonprofit organization dedicated to studying and advocating for human progress.
      We work to understand the history, drivers, and future of technological and material progress,
      and to rebuild the cultural appreciation for progress in modern society.
    </p>
  </section>

  <section class="homepage-section">
    <h2>Upcoming Events</h2>
    <div class="events-list">
      {upcomingEvents.map(event => (
        <EventCard {...event} />
      ))}
    </div>
  </section>

  <section class="homepage-section">
    <h2>Get Involved</h2>
    <p>
      <a href="/programs/">Learn about our programs</a> • 
      <a href="/support/">Support our mission</a>
    </p>
  </section>
</Base>

<style>
  .homepage-section {
    margin: 60px 0;
    padding: 40px 0;
    border-bottom: 1px solid #eee;
  }

  .events-list {
    margin-top: 30px;
  }
</style>
```

- [x] **Step 2: Verify file created**

- [x] **Step 3: Commit**

---

## Phase 1e: Content Collections Configuration

### Task 16: Set up Astro content collection config

**Files:**
- Create: `src/content/config.ts`

> **Implemented in PR #N (issue #4).** Required by the page templates; implemented early. Schema uses `z.coerce.date()` (not `z.date()`) to handle ISO date strings from markdown frontmatter. Blog schema: `title` (required), `date` (required, coerced), `author` and `description` (optional). Pages schema: `title` (required), `description` and `order` (optional).

- [x] **Step 1: Write config.ts**

```typescript
import { defineCollection, z } from 'astro:content';

const pages = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    date: z.date().optional(),
  }),
});

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.date(),
    author: z.string().optional(),
    description: z.string().optional(),
    tags: z.array(z.string()).optional(),
  }),
});

export const collections = { pages, blog };
```

- [x] **Step 2: Verify file created**

- [x] **Step 3: Commit**

---

### Task 17: Create sample pages for testing

**Files:**
- Create: `src/content/pages/about.md`, `src/content/pages/support.md`

> **Implemented across PR #18 (issue #4) and PR #19 (issue #5).** `about.md` was created in issue #4 alongside the content collection config. `support.md` was added in issue #5 with `title`, `description`, and `order` frontmatter. Both render via `[slug].astro`.

- [x] **Step 1: Write about.md**

```markdown
---
title: About Roots of Progress
description: Learn about our organization and mission
---

# About Roots of Progress

## Our Mission

We are dedicated to understanding and advocating for human progress. We work to understand the history, drivers, and future of technological, scientific, and material progress.

## Why Progress Studies?

Progress is not automatic or inevitable. Understanding what drives progress—and what threatens it—is essential for maintaining and accelerating human advancement.

## Our Programs

We offer several programs focused on advancing progress studies as a discipline and as a cultural movement:

- **Progress Conference**: Annual gathering of leading thinkers
- **Fellowship Program**: Support for intellectual entrepreneurs
- **Progress in Medicine**: Summer program for high school students

## Get in Touch

Have questions? [Contact us](mailto:contact@rootsofprogress.org)
```

- [x] **Step 2: Write support.md**

```markdown
---
title: Support Our Work
description: Help us advance progress studies
---

# Support Roots of Progress

Your support helps us continue our mission to study and advocate for human progress.

## Ways to Support

### Donate

[Support us on Patreon](https://patreon.com/rootsofprogress)

[Make a one-time gift via PayPal](https://paypal.com)

### Volunteer

Interested in volunteering? [Get in touch](mailto:contact@rootsofprogress.org)

### Subscribe

[Subscribe to our newsletter on Substack](https://substack.com)

---

Roots of Progress is a 501(c)(3) nonprofit organization.
```

- [x] **Step 3: Verify files created**

```bash
wc -l src/content/pages/*.md
```

- [x] **Step 4: Commit**

```bash
git add src/content/pages/about.md src/content/pages/support.md
git commit -m "Add sample pages (About, Support) for testing"
```

---

### Task 18: Create sample blog posts for testing

**Files:**
- Create: `src/content/blog/first-post.md`, `src/content/blog/second-post.md`

> **Implemented across PR #18 (issue #4) and PR #19 (issue #5).** `welcome.md` (serving as the first post) was created in issue #4. `progress-conference-2026.md` (serving as the second post) was added in issue #5. Filenames differ from the plan but the frontmatter schema and rendered routes are equivalent.

- [x] **Step 1: Write first-post.md**

```markdown
---
title: "Welcome to Our New Site"
date: 2026-05-01
author: "Jason Crawford"
description: "We've migrated to a new static site for better security and performance"
---

# Welcome to Our New Website

We're excited to announce the launch of our redesigned website. Built on Astro and hosted on Netlify, this new site is faster, more secure, and easier to maintain.

## Why the Change?

Our previous site had several challenges:
- Security vulnerabilities that required constant patching
- Limited flexibility in design and customization
- Difficult for our team to maintain and update

Our new static site approach provides:
- **Security**: No server backend means no attack surface
- **Performance**: Fast static files served from a global CDN
- **Maintainability**: Git-based workflow our team understands

## What's Next?

We'll be continuously improving this site. Stay tuned for updates on our programs and initiatives.
```

- [x] **Step 2: Write second-post.md**

```markdown
---
title: "Progress Conference 2026 Announced"
date: 2026-05-15
author: "Roots of Progress"
description: "Join us in Berkeley for our annual progress conference"
---

# Progress Conference 2026

We're thrilled to announce the Roots of Progress Conference 2026, happening October 8-11 in Berkeley, California.

## Featured Speakers

We're assembling an impressive lineup of thinkers, scientists, and entrepreneurs who are advancing human progress.

## Conference Tracks

- **Technology & Innovation**: How technology drives progress
- **Medicine & Health**: Progress in extending human lifespan and health
- **Society & Culture**: How culture shapes our relationship with progress

[Learn more and apply →](/programs/)
```

- [x] **Step 3: Verify files created**

```bash
ls -la src/content/blog/
```

- [x] **Step 4: Commit**

```bash
git add src/content/blog/
git commit -m "Add sample blog posts for testing content collection"
```

---

## Phase 1f: Data-Driven Components

### Task 19: Create fellows data file

**Files:**
- Create: `src/data/fellows.yaml`

> **Implemented in PR (issue #6).** Fellows use `name`, `role`, `bio`, and `website` fields — mapping directly to PersonCard props. No `id` or `image` fields in sample data (no images available yet). Three sample fellows included.

- [x] **Step 1: Write fellows.yaml**

```yaml
- id: jane-smith
  name: Jane Smith
  role: Fellowship Director
  bio: Jane leads our fellowship program, helping intellectual entrepreneurs pursue careers in progress studies.
  image: jane-smith.jpg
  website: https://janesmith.example.com

- id: john-doe
  name: John Doe
  role: Research Fellow
  bio: John is researching the history of technological adoption in developing nations.
  image: john-doe.jpg
  website: https://johndoe.example.com
```

- [x] **Step 2: Verify file created**

- [x] **Step 3: Commit**

---

### Task 20: Create speakers data file

**Files:**
- Create: `src/data/speakers.yaml`

> **Implemented in PR (issue #6).** Speakers use `name`, `role`, `bio`, and `website` fields — same structure as fellows, mapping directly to PersonCard. Plan showed `title`/`affiliation` separately, but `role` is used for direct PersonCard compatibility (e.g., "Professor of History, UC Berkeley"). Four sample speakers included.

- [x] **Step 1: Write speakers.yaml**

```yaml
- id: speaker-1
  name: Dr. Sarah Chen
  title: Professor of History
  bio: Exploring the intersection of progress and climate change
  image: sarah-chen.jpg
  affiliation: UC Berkeley

- id: speaker-2
  name: Marcus Johnson
  title: Technology Entrepreneur
  bio: Building tools to accelerate scientific discovery
  image: marcus-johnson.jpg
  affiliation: Progress Labs
```

- [x] **Step 2: Verify file created**

- [x] **Step 3: Commit**

---

### Task 21: Create fellows page

**Files:**
- Create: `src/pages/fellows.astro`
- Create: `src/pages/speakers.astro` (added in issue #6 alongside fellows)

> **Implemented in PR (issue #6).** Both fellows and speakers pages created. YAML is loaded via Vite's `?raw` import (embedded at build time) and parsed with `js-yaml` — direct file `import` of `.yaml` is not supported by default Vite/Astro, and `readFileSync` with `import.meta.url` fails because `import.meta.url` resolves to the compiled `dist/` path at generation time. Uses global `.card-grid` CSS class consistent with the rest of the site.

- [x] **Step 1: Write fellows.astro**

```astro
---
import Base from '../layouts/Base.astro';
import PersonCard from '../components/PersonCard.astro';
import { fellows } from '../data/fellows.yaml';
---

<Base title="Our Fellows" description="Meet the fellows of Roots of Progress">
  <h1>Our Fellows</h1>
  <p>
    Our fellowship program supports intellectual entrepreneurs pursuing careers in progress studies.
  </p>
  
  <div class="fellows-grid">
    {fellows.map(fellow => (
      <PersonCard {...fellow} />
    ))}
  </div>
</Base>

<style>
  .fellows-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 30px;
    margin-top: 40px;
  }
</style>
```

- [x] **Step 2: Verify file created**

- [x] **Step 3: Commit**

---

## Phase 1g: Build & Test

### Task 22: Test Astro build locally

**Files:**
- None (build artifacts)

- [ ] **Step 1: Run dev server**

```bash
npm run dev
```

Expected: Server starts on `http://localhost:3000`, with hot reload enabled.

- [ ] **Step 2: Verify site loads (manual step)**

Open browser to `http://localhost:3000` and check:
- Homepage loads
- Navigation works
- About page loads via `/about/`
- Support page loads via `/support/`
- Blog post loads via `/blog/first-post/`
- Fellows page loads via `/fellows/`

- [ ] **Step 3: Stop dev server**

Press `Ctrl+C` in terminal.

- [ ] **Step 4: Run build**

```bash
npm run build
```

Expected: Creates `dist/` folder with static HTML files, no errors.

- [ ] **Step 5: Verify build output**

```bash
ls -la dist/ | head -20
find dist -name "*.html" | head -10
```

Expected: HTML files for all pages in dist/.

- [ ] **Step 6: No commit needed**

(Build artifacts are temporary, not committed)

---

## Phase 1h: WordPress Content Extraction

### Task 23: Prepare WordPress content export

**Files:**
- Create: scripts directory, export lists

This task is a guide for exporting WordPress content. You'll need to:

- [ ] **Step 1: Export WordPress posts via XML**

From WordPress admin panel:
1. Go to **Tools > Export**
2. Select **All content**
3. Download the XML file as `wp-export.xml`
4. Save to root of project: `/Users/jason/projects/rpi-homepage/wp-export.xml`

Expected: XML file with all posts, pages, metadata

- [ ] **Step 2: Create extraction script plan**

We'll use Claude Code to help convert the WordPress XML to markdown files. The process:
1. Parse XML file
2. For each post/page:
   - Extract title, content, date, author, featured image
   - Convert HTML content to markdown
   - Create frontmatter with metadata
   - Save as `src/content/blog/[slug].md` or `src/content/pages/[slug].md`

- [ ] **Step 3: Download WordPress images**

1. Use WordPress admin or FTP to access `/wp-content/uploads/`
2. Download all images
3. Organize into `src/assets/images/` with structure like: `src/assets/images/2024/post-slug/image.jpg`

**Note:** This will be handled with Claude Code assistance.

---

### Task 24: Migrate blog posts

**Files:**
- Modify: `src/content/blog/`

This is a template task. For each WordPress blog post:

- [ ] **Step 1: Convert post to markdown**

Using Claude Code to assist:
- Extract content from WordPress export
- Convert HTML to clean markdown
- Create proper YAML frontmatter
- Preserve metadata (date, author, categories)

Example result: `src/content/blog/conference-2026-dates.md`

```markdown
---
title: "Progress Conference 2026: Dates Announced"
date: 2026-05-20
author: "Jason Crawford"
description: "The Roots of Progress Conference 2026 will be held October 8-11 in Berkeley"
tags: ["conference", "announcement"]
---

# Progress Conference 2026: Dates Announced

Join us for the inaugural Roots of Progress Conference...
```

- [ ] **Step 2: Test blog post renders**

```bash
npm run dev
# Visit http://localhost:3000/blog/conference-2026-dates/
```

Verify:
- Title displays correctly
- Content renders properly
- Metadata displays
- Links work

- [ ] **Step 3: Commit batch of posts**

```bash
git add src/content/blog/
git commit -m "Migrate blog posts from WordPress: [list of post titles]"
```

**This task will be repeated for each batch of WordPress posts.**

---

### Task 25: Migrate main pages

**Files:**
- Modify: `src/content/pages/`

Similar to blog posts, migrate each main page (About, Programs, Support, etc.):

- [ ] **Step 1: Convert page to markdown**

- [ ] **Step 2: Test page renders**

- [ ] **Step 3: Commit pages**

---

## Phase 1i: Advanced Features

### Task 26: Create blog listing page

**Files:**
- Create: `src/pages/blog/index.astro`

- [ ] **Step 1: Create blog index**

```astro
---
import { getCollection } from 'astro:content';
import Base from '../../layouts/Base.astro';

const posts = (await getCollection('blog')).sort(
  (a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime()
);
---

<Base title="Blog" description="Read our latest articles and announcements">
  <h1>Blog</h1>
  <p>Latest articles and announcements from Roots of Progress</p>
  
  <div class="blog-list">
    {posts.map(post => (
      <article class="blog-preview">
        <h2><a href={`/blog/${post.slug}/`}>{post.data.title}</a></h2>
        <div class="blog-meta">
          <time datetime={post.data.date.toISOString()}>
            {new Date(post.data.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </time>
          {post.data.author && <span>{post.data.author}</span>}
        </div>
        {post.data.description && <p>{post.data.description}</p>}
        <a href={`/blog/${post.slug}/`}>Read more →</a>
      </article>
    ))}
  </div>
</Base>

<style>
  .blog-list {
    margin: 40px 0;
  }
  
  .blog-preview {
    padding: 20px 0;
    border-bottom: 1px solid #eee;
  }
  
  .blog-preview:last-child {
    border-bottom: none;
  }
  
  .blog-preview h2 {
    margin: 0 0 10px 0;
  }
  
  .blog-meta {
    font-size: 0.9rem;
    color: #666;
    margin-bottom: 10px;
  }
</style>
```

- [ ] **Step 2: Verify file created**

```bash
cat src/pages/blog/index.astro | head -40
```

- [ ] **Step 3: Test locally**

```bash
npm run dev
# Visit http://localhost:3000/blog/
```

Verify all posts listed, newest first.

- [ ] **Step 4: Commit**

```bash
git add src/pages/blog/index.astro
git commit -m "Add blog listing page with post previews"
```

---

### Task 27: Create programs page

**Files:**
- Create: `src/pages/programs.astro`

- [ ] **Step 1: Write programs.astro**

```astro
---
import Base from '../layouts/Base.astro';
import EventCard from '../components/EventCard.astro';

const programs = [
  {
    title: "Progress Conference 2026",
    date: "October 8-11, 2026",
    location: "Berkeley, California",
    description: "Annual conference bringing together leading thinkers, scientists, and entrepreneurs advancing human progress",
    link: "#conference",
    linkText: "Learn more"
  },
  {
    title: "Fellowship Program",
    date: "Ongoing",
    description: "Career acceleration for intellectual entrepreneurs pursuing research and writing in progress studies",
    link: "#fellowship",
    linkText: "Apply"
  },
  {
    title: "Progress in Medicine",
    date: "Summer 2026",
    description: "High school summer program exploring the history and future of medical progress",
    link: "#medicine",
    linkText: "Register"
  }
];
---

<Base title="Programs" description="Explore our programs and initiatives">
  <h1>Our Programs</h1>
  
  <div class="programs-list">
    {programs.map(program => (
      <EventCard {...program} />
    ))}
  </div>

  <section id="conference">
    <h2>Progress Conference 2026</h2>
    <p>Join us for our inaugural annual conference in Berkeley, October 8-11, 2026.</p>
    <p>We're assembling speakers including Nobel laureates, leading scientists, and technology entrepreneurs to discuss the future of human progress.</p>
  </section>

  <section id="fellowship">
    <h2>Fellowship Program</h2>
    <p>Support intellectual entrepreneurs pursuing full-time careers in progress studies.</p>
  </section>

  <section id="medicine">
    <h2>Progress in Medicine</h2>
    <p>A summer program for high school students exploring the history and future of medical innovation.</p>
  </section>
</Base>

<style>
  .programs-list {
    margin: 40px 0;
  }
  
  section {
    margin: 60px 0;
    padding: 40px 0;
    border-top: 1px solid #eee;
  }
</style>
```

- [ ] **Step 2: Test locally**

```bash
npm run dev
# Visit http://localhost:3000/programs/
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/programs.astro
git commit -m "Add programs page with conference, fellowship, medicine sections"
```

---

### Task 28: Add Google Analytics ID

**Files:**
- Modify: `src/layouts/Base.astro`

- [ ] **Step 1: Update Base.astro with real GA ID**

Replace `G-XXXXXXXXXX` in two places with your actual Google Analytics measurement ID.

Get your GA ID:
1. Go to Google Analytics
2. Find your Measurement ID (format: `G-XXXXXXXXXX`)

Update the two occurrences in `src/layouts/Base.astro`:

```astro
<!-- Line with script src -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-YOUR-REAL-ID"></script>

<!-- Line with gtag config -->
gtag('config', 'G-YOUR-REAL-ID');
```

- [ ] **Step 2: Verify changes**

```bash
grep "G-XXXXXXXXXX" src/layouts/Base.astro
```

Should show no matches if you replaced all instances.

- [ ] **Step 3: Commit**

```bash
git add src/layouts/Base.astro
git commit -m "Update Google Analytics ID in Base layout"
```

---

## Phase 1j: Deployment & Testing

### Task 29: Create Netlify configuration

**Files:**
- Create: `netlify.toml`

- [ ] **Step 1: Write netlify.toml**

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Content-Type-Options = "nosniff"
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

- [ ] **Step 2: Verify file created**

```bash
cat netlify.toml
```

- [ ] **Step 3: Commit**

```bash
git add netlify.toml
git commit -m "Add Netlify build and deployment configuration"
```

---

### Task 30: Create .gitignore

**Files:**
- Create: `.gitignore`

- [ ] **Step 1: Write .gitignore**

```
# Node
node_modules/
package-lock.json
npm-debug.log
.npm

# Astro
dist/
.astro/

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Environment
.env
.env.local
.env.*.local

# Temp
*.tmp
.cache/

# WordPress (if exporting locally)
wp-export.xml
```

- [ ] **Step 2: Verify file created**

```bash
cat .gitignore
```

- [ ] **Step 3: Commit**

```bash
git add .gitignore
git commit -m "Add .gitignore for Node, Astro, IDE, and OS files"
```

---

### Task 31: Create sitemap configuration

**Files:**
- Modify: `astro.config.mjs`
- Create: `public/sitemap.xml` (auto-generated via integration)

- [ ] **Step 1: Install sitemap integration**

```bash
npm install @astrojs/sitemap
```

- [ ] **Step 2: Update astro.config.mjs**

Replace the file content with:

```javascript
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://rootsofprogress.org',
  integrations: [sitemap()],
  trailingSlash: 'ignore',
});
```

- [ ] **Step 3: Build and verify sitemap**

```bash
npm run build
cat dist/sitemap-0.xml | head -20
```

Expected: XML sitemap with URLs for all pages.

- [ ] **Step 4: Commit**

```bash
git add astro.config.mjs package.json package-lock.json
git commit -m "Add sitemap generation via @astrojs/sitemap integration"
```

---

### Task 32: Performance baseline with Lighthouse

**Files:**
- None (testing only)

- [ ] **Step 1: Build production version**

```bash
npm run build
npm run preview
```

This starts a preview server on `http://localhost:3000`.

- [ ] **Step 2: Run Lighthouse (manual step)**

Using Chrome DevTools or Lighthouse CLI:

```bash
npm install -g lighthouse
lighthouse http://localhost:3000 --view
```

- [ ] **Step 3: Record baseline scores**

Note the performance, accessibility, best practices, and SEO scores. The goal:
- Performance: > 90
- Accessibility: > 95
- Best Practices: > 90
- SEO: > 90

- [ ] **Step 4: Stop preview**

Press `Ctrl+C` in preview terminal.

---

### Task 33: Accessibility audit (WCAG AA)

**Files:**
- None (testing only)

- [ ] **Step 1: Run axe accessibility check (manual step)**

Using axe DevTools browser extension or automated testing:
1. Visit each page while preview server is running
2. Check for accessibility issues
3. Focus on WCAG AA standards

Common issues to check:
- Color contrast (text on background)
- Image alt text
- Heading hierarchy
- Form labels
- Keyboard navigation

- [ ] **Step 2: Document any issues found**

(Will be addressed in refinement tasks if any are critical)

---

## Phase 1k: Content Migration Completion

### Task 34: Migrate remaining WordPress content

**Files:**
- Modify: `src/content/blog/`, `src/content/pages/`, `src/data/`, `src/assets/images/`

This is a batch task. Following the pattern from Task 24-25:

For each remaining WordPress post/page/data:
- Extract from WordPress
- Convert HTML to markdown
- Create proper frontmatter
- Add images to `src/assets/images/`
- Test on local dev server
- Commit with descriptive message

Sections to migrate (in order):
1. ✅ Blog posts (completed in Task 24)
2. ✅ Main pages: About, Support (completed in Task 17)
3. Conference information and speakers (Task 25 onwards)
4. Fellowship program details
5. Medicine program details
6. Team/staff pages
7. Press/news section
8. Any remaining pages or custom content

Each section should result in a commit.

- [ ] **Step 1-N: Migrate each content section**

(Each section follows: extract → convert → test → commit pattern)

---

### Task 35: Final content audit

**Files:**
- None (verification only)

- [ ] **Step 1: Create content audit checklist**

Go through WordPress site and create a list of:
- [ ] All main pages present and rendering correctly
- [ ] All blog posts present with correct dates, authors
- [ ] All images present and displaying
- [ ] All internal links working (update relative URLs if needed)
- [ ] All external links (Patreon, PayPal, Typeform, etc.) present
- [ ] All metadata present (titles, descriptions)
- [ ] Navigation links all working
- [ ] Mobile responsiveness tested

- [ ] **Step 2: Run dev server and systematically test**

```bash
npm run dev
```

Visit each page and verify against checklist.

- [ ] **Step 3: Fix any broken links**

If any internal links are broken (e.g., `/old-page/` instead of `/new-page/`), update them.

---

### Task 36: Staging deployment

**Files:**
- Modify: git (push to GitHub)

- [ ] **Step 1: Ensure all content is committed**

```bash
git status
```

Expected: `working tree clean`

- [ ] **Step 2: Create GitHub repository**

1. Go to github.com and create new private repo `rpi-homepage`
2. Copy the remote URL

- [ ] **Step 3: Add remote and push**

```bash
git remote add origin https://github.com/YOUR-ORG/rpi-homepage.git
git branch -M main
git push -u origin main
```

- [ ] **Step 4: Connect to Netlify**

1. Go to netlify.com
2. Click "New site from Git"
3. Select GitHub repo
4. Confirm build settings (command: `npm run build`, publish: `dist`)
5. Deploy

Netlify will auto-deploy every push to main.

- [ ] **Step 5: Verify staging site**

Once deployed, visit the Netlify URL and verify:
- All pages load
- Navigation works
- Styling is correct
- Performance is good

- [ ] **Step 6: Share staging URL with team**

Share the Netlify URL (e.g., `https://rpi-staging.netlify.app`) with team for review and feedback.

---

## Phase 1l: Final Testing & Documentation

### Task 37: SEO verification

**Files:**
- None (verification only)

- [ ] **Step 1: Verify SEO metadata**

Check each page has:
- [ ] Unique title tag (< 60 chars)
- [ ] Meta description (< 160 chars)
- [ ] Open Graph tags (og:title, og:description, og:image)
- [ ] Canonical URL
- [ ] Proper heading hierarchy (h1 → h2 → h3, no gaps)

View page source to verify.

- [ ] **Step 2: Test with SEO tools**

Use free tools:
- Google Search Console (submit sitemap)
- Bing Webmaster Tools
- Meta Tags testing tools

- [ ] **Step 3: Document results**

Record any issues and plan fixes.

---

### Task 38: Create deployment documentation

**Files:**
- Create: `docs/DEPLOYMENT.md`

- [ ] **Step 1: Write deployment guide**

```markdown
# Deployment Guide

## Environments

- **Production:** rootsofprogress.org
- **Staging:** [Netlify staging URL]

## Deployment Process

### Automatic Deployment
1. Make changes in local repo
2. Commit to main branch
3. Push to GitHub
4. Netlify automatically deploys within 1-2 minutes

### Manual Redeploy
1. Go to Netlify dashboard
2. Click "Trigger deploy"
3. Select "Deploy site"

## Monitoring

- Check Netlify deploy logs for any errors
- Verify site loads and all pages render
- Check Lighthouse scores
- Monitor Google Analytics

## Rollback

If a deployment fails:
1. Find last successful deploy in Netlify
2. Click "Publish deploy" on that version
3. Or revert git commit and push

## Adding Content

### Blog Posts
1. Create `.md` file in `src/content/blog/`
2. Add frontmatter (title, date, author, description)
3. Write content in markdown
4. Push to GitHub
5. Automatic deploy

### Pages
Similar to blog posts, create in `src/content/pages/`

### Data (Fellows, Speakers, etc.)
Edit `.yaml` files in `src/data/`
```

- [ ] **Step 2: Verify file created**

```bash
cat docs/DEPLOYMENT.md
```

- [ ] **Step 3: Commit**

```bash
git add docs/DEPLOYMENT.md
git commit -m "Add deployment documentation and process guide"
```

---

### Task 39: Create team documentation

**Files:**
- Create: `docs/MAINTENANCE.md`

- [ ] **Step 1: Write maintenance guide**

```markdown
# Site Maintenance Guide

## For Team Members

### Editing Content

#### Blog Posts
1. Open project in Claude Code
2. Navigate to `src/content/blog/`
3. Create new `.md` file with name like `post-title.md`
4. Copy frontmatter from existing post
5. Update title, date, author, description
6. Write content in markdown
7. Commit and push
8. Site auto-deploys in 1-2 minutes

#### Pages
Same as blog posts, but save to `src/content/pages/`

#### Data (Fellows, Speakers)
1. Open `src/data/fellows.yaml` (or other data file)
2. Add new entry following existing format
3. Commit and push
4. Page auto-updates

### Adding Images

1. Place image in `src/assets/images/`
2. Use in markdown like: `![description](/images/filename.jpg)`
3. Use in frontmatter like: `image: filename.jpg`

### Preview Changes

1. Run `npm run dev` in your terminal
2. Visit http://localhost:3000
3. Your changes appear automatically (hot reload)
4. When ready, commit and push

## Common Tasks

### Publishing a Blog Post
[Steps here]

### Updating Program Information
[Steps here]

### Adding Team Members
[Steps here]

## Troubleshooting

If something breaks:
1. Check git diff to see what changed
2. Revert with `git checkout -- filename`
3. Ask for help in team Slack
```

- [ ] **Step 2: Verify file created**

```bash
cat docs/MAINTENANCE.md | head -40
```

- [ ] **Step 3: Commit**

```bash
git add docs/MAINTENANCE.md
git commit -m "Add team documentation for content editing and maintenance"
```

---

### Task 40: Final cutover checklist

**Files:**
- None (planning only)

- [ ] **Step 1: Create cutover checklist**

Before switching production DNS:

- [ ] All content migrated and tested
- [ ] Team reviewed staging site and approved
- [ ] Lighthouse scores acceptable (>90 on all metrics)
- [ ] Accessibility audit passed (WCAG AA)
- [ ] All links working (internal and external)
- [ ] Images all present and displaying correctly
- [ ] Mobile responsiveness tested
- [ ] SEO metadata complete on all pages
- [ ] Google Analytics ID configured
- [ ] Sitemap generated and submitted to Google Search Console
- [ ] 404 page created (optional)
- [ ] Redirects configured (if needed for old URLs)
- [ ] Email notifications set up (DNS changes, deployments)
- [ ] Team trained on maintenance process
- [ ] Documentation complete and reviewed

- [ ] **Step 2: Schedule cutover date**

Pick a date when:
- Team is available to monitor
- Low traffic is expected
- You can roll back if needed

- [ ] **Step 3: Plan cutover steps**

Options:
- **Option A:** Swap DNS directly to Netlify
- **Option B:** Redirect WordPress to new site with 301 redirects

Document exact steps and test them.

---

## Success Criteria Checklist

✅ Astro project scaffolded and building
✅ Layouts and base components created
✅ All WordPress content migrated to markdown/YAML
✅ Homepage and main pages rendering
✅ Blog listing and individual posts working
✅ Data-driven components (fellows, speakers) working
✅ All images migrated and displaying
✅ Navigation working across all pages
✅ Styling complete and responsive
✅ Lighthouse scores > 90
✅ Accessibility (WCAG AA) verified
✅ SEO metadata complete
✅ Google Analytics configured
✅ Sitemap generated
✅ Netlify deployment configured and working
✅ Team reviewed and approved staging site
✅ Documentation written
✅ Ready for production cutover

---

## Notes on Execution

This plan contains ~40 bite-sized tasks. When executing:

1. **Use Claude Code liberally:** For content migration, use Claude Code to batch-process WordPress exports, convert HTML to markdown, organize files, etc.

2. **Test frequently:** After each major section, run `npm run dev` and verify changes.

3. **Commit often:** Small commits with clear messages make it easy to review and revert if needed.

4. **Team involvement:** Have team members review the staging site and provide feedback before cutover.

5. **Parallel work:** Some tasks can be done in parallel (e.g., content migration can happen while you build components).
