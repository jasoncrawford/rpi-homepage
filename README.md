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
  pages/             # Astro pages (.astro files)
  layouts/
    Base.astro       # Main layout: header, nav, footer, SEO metadata
    BlogPost.astro   # Blog post layout: date, author, body
  content/
    pages/           # Static content pages (.md)
    blog/            # Blog posts (.md)
  data/              # Structured data files (.yaml)
  components/        # Reusable Astro components
    HeroSection.astro  # Large banner with title and subtitle
    PersonCard.astro   # Person display: name, role, bio, image, website
    EventCard.astro    # Event display: date, location, description, link
  assets/
    images/          # Site images
public/
  styles.css         # Global CSS
docs/                # Project documentation and design specs
```
