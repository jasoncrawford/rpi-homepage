# Roots of Progress Homepage

Static site for [rootsofprogress.org](https://rootsofprogress.org), built with [Astro](https://astro.build).

## Development

**Requirements:** Node.js 20+

```bash
npm install
npm run dev      # start dev server at http://localhost:4321
npm run build    # build to dist/
npm run preview  # preview the built site locally
```

## Project structure

```
src/
  pages/
    index.astro        # Homepage: hero, mission, programs, latest news, CTA
    fellows.astro      # Fellows page: renders PersonCard grid from data/fellows.yaml
    speakers.astro     # Speakers/advisory page: renders PersonCard grid from data/speakers.yaml
    programs.astro     # Programs overview: Conference, Fellowship, Progress in Medicine
    [slug].astro       # Dynamic route for content/pages collection
    blog/
      index.astro      # Blog listing: all posts sorted by date
      [slug].astro     # Dynamic route for content/blog collection
  layouts/
    Base.astro         # Main layout: header, nav, footer, SEO metadata
    BlogPost.astro     # Blog post layout: date, author, body
  content/
    config.ts          # Content collection schemas (pages + blog)
    pages/             # Static content pages (.md) — rendered via [slug].astro
      about.md         # About the Institute
      conference.md    # Annual Progress Conference
      essays.md        # Essays listing
      fellowship.md    # Blog-Building Intensive Fellowship
      manifesto.md     # The Techno-Humanist Manifesto
      progress-in-medicine.md  # High school summer program
      subscribe.md     # Newsletter & social links
      support.md       # Donation options
    blog/              # Blog posts (.md) — rendered via blog/[slug].astro
                       # 24 posts scraped from rootsofprogress.org (2019–2026)
  data/                # Structured data files (.yaml)
    fellows.yaml       # 74+ fellows across 2023–2025 cohorts
    speakers.yaml      # 29 advisory board members
  components/          # Reusable Astro components
    HeroSection.astro  # Large banner with title and subtitle
    PersonCard.astro   # Person display: name, role, bio, image, website
    EventCard.astro    # Event display: date, location, description, link
  assets/
    images/
      fellows/         # Profile photos for all 74 fellows (downloaded from WP)
      advisory/        # Profile photos for all 29 advisory board members
public/
  styles.css           # Global CSS
scripts/
  download-images.mjs  # Script to download profile images from rootsofprogress.org
docs/                  # Project documentation and design specs
```

## Adding content

**New page:** create `src/content/pages/<slug>.md` with `title` (and optionally `description`) in frontmatter. It will be served at `/<slug>/`.

**New blog post:** create `src/content/blog/<slug>.md` with `title`, `date`, and optionally `author` and `description` in frontmatter. It will be served at `/blog/<slug>/`. The homepage automatically shows the three most recent posts.

**Fellows/speakers data:** edit `src/data/fellows.yaml` or `src/data/speakers.yaml`. Each entry supports `name`, `role`, `bio`, `image`, and `website` — these map directly to `PersonCard` props. To add a new data-driven page for a different collection, create a `src/data/<collection>.yaml` file and a `src/pages/<collection>.astro` that imports the YAML with `?raw` and parses it with `js-yaml`.

## Refreshing scraped content

To re-download profile images from rootsofprogress.org (e.g. after adding new fellows):

```bash
node scripts/download-images.mjs
```

This fetches each fellow and advisory profile page, extracts the headshot URL, and saves images to `src/assets/images/fellows/` and `src/assets/images/advisory/`.
