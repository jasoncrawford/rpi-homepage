# Roots of Progress Homepage

Static site for [rootsofprogress.org](https://rootsofprogress.org), built with [Astro](https://astro.build).

## Development

**Requirements:** Node.js 20+

```bash
npm install      # also installs Chromium for visual-diff (via postinstall)
npm run dev      # start dev server at http://localhost:4321
npm run build    # build to dist/
npm run preview  # preview the built site locally
```

### Visual diff

Before merging any PR that touches a page or component, take screenshots to compare local vs. live:

```bash
npm run visual-diff -- /          # homepage
npm run visual-diff -- /about/    # any path
```

This saves PNGs to `tmp/visual-diff/`. See [docs/visual-diff.md](docs/visual-diff.md) for details.

## Project structure

```
src/
  pages/
    index.astro        # Homepage: hero, mission, programs, latest news, CTA
    fellows.astro      # Fellows page: renders PersonCard grid from data/fellows.yaml
    speakers.astro     # Speakers page: renders PersonCard grid from data/speakers.yaml
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

**Fellows/speakers data:** edit `src/data/fellows.yaml` or `src/data/speakers.yaml`. Each entry supports `name`, `role`, `bio`, `image`, and `website` — these map directly to `PersonCard` props. To add a new data-driven page for a different collection, create a `src/data/<collection>.yaml` file and a `src/pages/<collection>.astro` that imports the YAML with `?raw` and parses it with `js-yaml`.
