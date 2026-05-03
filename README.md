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
    [slug].astro       # Dynamic route for content/pages collection
    blog/
      [slug].astro     # Dynamic route for content/blog collection
  layouts/
    Base.astro         # Main layout: header, nav, footer, SEO metadata
    BlogPost.astro     # Blog post layout: date, author, body
  content/
    config.ts          # Content collection schemas (pages + blog)
    pages/             # Static content pages (.md) — rendered via [slug].astro
    blog/              # Blog posts (.md) — rendered via blog/[slug].astro
  data/                # Structured data files (.yaml)
  components/          # Reusable Astro components
    HeroSection.astro  # Large banner with title and subtitle
    PersonCard.astro   # Person display: name, role, bio, image, website
    EventCard.astro    # Event display: date, location, description, link
  assets/
    images/            # Site images
public/
  styles.css           # Global CSS
docs/                  # Project documentation and design specs
```

## Adding content

**New page:** create `src/content/pages/<slug>.md` with `title` (and optionally `description`) in frontmatter. It will be served at `/<slug>/`.

**New blog post:** create `src/content/blog/<slug>.md` with `title`, `date`, and optionally `author` and `description` in frontmatter. It will be served at `/blog/<slug>/`. The homepage automatically shows the three most recent posts.
