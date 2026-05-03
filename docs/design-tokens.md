# Design Tokens — Roots of Progress Institute

Source of truth: `capture/css/global.css` (and per-section CSS files). All values below are extracted verbatim from the site's CSS; none are invented.

---

## Color Palette

These four colors are defined as CSS custom properties in `global.css` and used throughout every stylesheet.

| Token | Hex | CSS Variable | Usage |
|-------|-----|--------------|-------|
| Cream | `#FFFCF2` | `--Cream` | Page background, header/nav background, light card bg |
| Dark Green | `#5F6E60` | `--DarkGreen` | H1–H4 color, footer background, nav links, logo SVG |
| Red (accent) | `#B92D24` | `--Red` | Links, CTAs, buttons, mark, newsletter banner |
| Charcoal | `#2C2626` | `--Charcoal` | Body text, some secondary text |

### Hardcoded accent colors (not custom properties)

These appear as literal hex values in the CSS and represent the supporting palette:

| Color | Hex | Where used |
|-------|-----|------------|
| Light Green | `#A6C4A7` | Separator lines, card borders (`section.posts`, `section.fellows`), `.sep.small` |
| Off-white (Sand) | `#EDEADE` | Blockquote backgrounds, accordion section backgrounds, table cell backgrounds, headline separator lines |
| Warm Beige | `#E0DAC4` | Table borders in conference tables |
| Pale Beige | `#F6F5EE` | Conference schedule table row backgrounds |
| Dark Stone | `#847872` | Conference schedule table header cells |
| White | `#ffffff` | Card inner backgrounds (fellows cards, team cards) |
| Black | `#000000` | Some link/text edge cases in dark contexts |
| Muted Gray | `#808080` | Newsletter disclaimer text |

---

## Typography

### Font Families

Two typefaces are used across the site. The CSS internal family names are `"F37"` and `"Palast"`.

| Family | Foundry product name | CSS family name | Weights used |
|--------|---------------------|-----------------|--------------|
| F37Grotesc | F37Grotesc (F37 Type Foundry) | `"F37"` | 300 (Book), 400 (Regular), 500 (Medium) |
| Palast-Web | Palast Web Display (Betatype) | `"Palast"` | 300 (Light), 400 (Regular) |

Both are commercial typefaces. The font files are self-hosted on rootsofprogress.org and served from the same license; they have been copied to `public/fonts/` for use in the Astro build (see [Font Files](#font-files) below).

### F37Grotesc — applied as body / UI font

| Weight | Style | File | Applied to |
|--------|-------|------|------------|
| 300 | normal | `F37Grotesc-Book.woff2` | Body text, paragraphs, nav links weight fallback |
| 300 | italic | `F37Grotesc-BookItalic.woff2` | `em`, `i` in body |
| 400 | normal | `F37Grotesc-Regular.woff2` | General weight-400 text |
| 500 | normal | `F37Grotesc-Medium.woff2` | `strong`, `b`, nav links, button text, labels, list counters |

`body` rule: `font-family: "F37", Helvetica, Arial, sans-serif; font-size: 17px; font-weight: 300; color: var(--Charcoal)`

### Palast-Web — applied as display / heading font

| Weight | Style | File | Applied to |
|--------|-------|------|------------|
| 300 | normal | `Palast-Web-Display-Light.woff2` | H2, H3, `.sep .text`, section heading accents |
| 400 | normal | `Palast-Web-Display-Regular.woff2` | Post card titles, announcement year labels, fellow card names, section separator text |

### Type Scale

| Element | Size (desktop) | Size (mobile ≤767px) | Weight | Line-height | Letter-spacing | Family |
|---------|---------------|---------------------|--------|------------|----------------|--------|
| `h1` (global) | 60px | 40px | 400 | 100% | -0.03em | F37 |
| `h1` in `section.text` | 46px | 40px | 300 | — | — | Palast |
| `h2` | 40px | 30px | 300 | 109% | -0.03em | Palast |
| `h3` | 30px | 20px | 300 | 125% | -0.03em | Palast |
| `h4` | 20px | 18px | 500 | 135% | — | F37 |
| Body | 17px | 15px | 300 | 135% (paragraphs) | — | F37 |
| Small / caption | 12px | 12px | 400 | 110% | — | F37 |
| Button / label | 14px | 14px | 500 | 1 | — | F37 |
| Nav links | inherit | 24px (mobile menu) | 500 | — | — | F37 |
| Footer menu | 12px | 12px | 700 | 135% | — | F37 |

All headings are colored `var(--DarkGreen)` by default. Anti-aliasing is set on `body` and font faces: `-webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale`.

---

## Layout Grid

The site uses a custom 12-column flexbox grid (not Bootstrap). Classes follow the pattern `.col-{1–12}-{breakpoint}`.

### Breakpoints

| Name | Min-width | Container max-width |
|------|-----------|---------------------|
| xs (base) | — | 100% (no max) |
| m | 480px | 480px |
| sm | 768px | 768px |
| md | 1024px | 1024px |
| xmd | 1200px | 1200px |
| lg | 1440px | 1440px |

### Container

```css
.container {
  margin: 0 auto;
  position: relative;
  width: 100%;
  padding: 0 28px;   /* → 0 10px at max-width: 767px */
}
```

### Columns

- Columns: `.grid div[class*=col-]` use `padding: 0 10px` (20px total gutter per column).
- The `.grid` wrapper is a flex container (`display: flex; flex-wrap: wrap`).
- Column widths are percentages of the 12-column grid: `col-6` = 50%, `col-3` = 25%, etc.

### Key layout widths (from CSS)

| Element | Max-width |
|---------|-----------|
| Blog post `.centered` | 840px |
| Blog post `.sidebar` | 270px (desktop) |
| Section `.max` | 600px |
| Footer newsletter form | 256px |
| Testimonial slider | 970px (1440px+), 800px (1200px+) |

---

## Spacing

No explicit spacing scale custom properties — spacing is hardcoded throughout. Common values extracted from CSS:

| Context | Value |
|---------|-------|
| Container horizontal padding | 28px (10px mobile) |
| Column gutter (each side) | 10px |
| Section vertical padding (standard) | 60px top and bottom (36px mobile) |
| `section.text:first-of-type` top padding | 150px (90px mobile) |
| `section.main` top padding | 256px desktop, 75px tablet |
| Headline separator line top margin | 28px |
| `section.bio` top padding | 110px (80px mobile) |
| `section.fellows` vertical padding | 50px (42px mobile) |
| Header logo padding | 20px top and bottom |
| Footer padding | 30px top and bottom |

---

## Links

```css
a {
  text-decoration: none !important;
  color: var(--Red);            /* #B92D24 */
  border-bottom: 1px solid transparent;
  transition: color 0.2s ease, border 0.2s ease;
}

/* Hover (desktop only, min-width: 1025px) */
a:hover {
  border-color: var(--DarkGreen);
  color: var(--DarkGreen);
}
```

Special cases:
- `a[data-nou]`: no border at all (used for links that shouldn't have underline effect)
- Links inside `section.post .content`: `border-bottom-color: var(--Red)` when not hovered (underlined in red by default)
- Links in `section.text .acc .a .inside`: `text-decoration: underline !important` (standard underline, not border trick)
- Footer links: `color: var(--Cream)`, hover: `opacity: 0.7`
- Nav links: `color: var(--DarkGreen)`, hover: `color: var(--Red)`

---

## Buttons

```css
/* Primary button */
.btn {
  background: var(--Red);       /* #B92D24 */
  color: var(--Cream) !important;
  font-size: 14px;
  line-height: 1;
  font-weight: 500;
  padding: 9px;
  display: inline-block;
  transition: background 0.2s ease;
}
/* Hover (desktop) */
.btn:hover { background: var(--DarkGreen); }

/* Large variant */
.btn.big {
  font-size: 18px;
  padding: 7px 9px;
}
/* mobile .btn.big */
/* font-size: 14px; padding: 9px */

/* Back/outline variant */
.btn.back {
  background: none;
  border-left: 1px solid var(--Red);
  border-right: 1px solid var(--Red);
  color: var(--Red) !important;
  padding-top: 5px;
  padding-bottom: 5px;
  font-size: 17px;
}
/* Hover: background → var(--Red), color → var(--Cream) */
```

---

## Form Controls

### Footer email subscribe input

```css
footer input {
  background: none;
  border: 0;
  border-radius: 0;
  font-size: 14px;
  color: var(--Cream);
  border-bottom: 1px solid var(--Cream);
  width: 100%;
  padding-left: 0;
  padding-bottom: 3px;
}
footer button {
  background: none;
  border: 0;
  cursor: pointer;
}
```

### Inline newsletter form (in `section.text`)

```css
input {
  padding: 8px 20px;
  border: 1px solid var(--Red);
  border-radius: 10px 0 0 10px;
  font-size: 18px;
  background: none;
  font-weight: 300;
  width: 100%;
}
button {
  padding: 10px 20px;
  background: var(--Red);
  border-radius: 0 10px 10px 0;
  font-weight: 500;
  font-size: 18px;
  color: var(--Cream);
}
```

All form elements share: `outline: 0 !important; font-family: "F37", Helvetica, Arial, sans-serif`.

---

## Header

- Position: `fixed`, `top: 0`, full width, `z-index: 100`
- Background: `#FFFCF2` (Cream), transitions to none when `.transparent:not(.scroll):not(.open)`
- Mobile breakpoint: `max-width: 1023px` — hamburger menu appears, nav slides in from top
- Logo: SVG, `padding: 20px 0`, `width: 184px` on mobile
- Nav links: F37 weight 500, color `--DarkGreen`, hover: `--Red`
- Hamburger spans: `background: var(--Red)`; 3px height, 30×30px hit area

---

## Footer

- Background: `var(--DarkGreen)` (`#5F6E60`)
- Text/links: `var(--Cream)` (`#FFFCF2`)
- Padding: `30px 0`
- Menu items: font-size 12px, `font-weight: 700`, `text-transform: uppercase`
- Copyright text: `font-weight: 400`, `font-size: 14px`, `line-height: 150%`
- Social icon hover: `opacity: 0.7`
- Logo: absolute-positioned 50px icon on left side of footer

---

## Newsletter Banner (`section.newsletter`)

- Background: `var(--Red)` (`#B92D24`)
- Text: `var(--Cream)` (`#FFFCF2`)
- Padding: `22px 0`
- Links: `color: var(--Cream)`, hover: `color: #f1bbb8` (light pink tint)
- Vertical divider: `background: var(--Cream)`, 1px wide, centered

---

## Separator / Divider (`section.separator`, `.sep`)

```css
.sep span {
  background: #5F6E60;   /* --DarkGreen */
  height: 1px;
  width: 50%;
}
.sep.small span { background: #A6C4A7; }  /* Light Green */
```

The `.sep` pattern is: `[line] [SVG logo mark] [line]`, with optional text label styled as Palast 400 20px uppercase `--DarkGreen`.

---

## Common Background Colors by Section

| Section | Background |
|---------|-----------|
| Page default | `#FFFCF2` (Cream) |
| `section.text.green` | `var(--DarkGreen)` |
| `section.text#igajbydxsn`, `section.text.acco` | `#EDEADE` (Off-white) |
| `section.support` | `#EDEADE` |
| `section.sponsors` | `#ffffff` |
| `section.newsletter` | `var(--Red)` |
| Header / mobile nav | `#FFFCF2` |
| Footer | `var(--DarkGreen)` |
| Fellow / team card `.inside` | `#ffffff` |
| Blockquote | `#EDEADE` |

---

## Animations

Four named animation patterns from global.css:

| Name | Effect |
|------|--------|
| `fade` | opacity 0 → 1 |
| `fadedown` | translateY(25px) + opacity 0 → none + 1 |
| `fadeleft` | translateX(-25px) + opacity 0 → none + 1 (becomes translateY on mobile) |
| `faderight` | translateX(25px) + opacity 0 → none + 1 |

Delay utilities: `.t--delay_250` through `.t--delay_1500` (250ms increments).

Page transition: `.animate-in { animation: animateIn 0.25s ease-in }` (opacity 0 → 1); `.animate-out { transition: opacity 0.25s; opacity: 0 }`.

---

## Font Files

All files are in `public/fonts/`. Corresponding `@font-face` declarations are in `capture/css/global.css` and should be replicated in the Astro global stylesheet.

| File | Family | Weight | Style |
|------|--------|--------|-------|
| `F37Grotesc-Book.woff2` | F37 | 300 | normal |
| `F37Grotesc-BookItalic.woff2` | F37 | 300 | italic |
| `F37Grotesc-Regular.woff2` | F37 | 400 | normal |
| `F37Grotesc-Medium.woff2` | F37 | 500 | normal |
| `Palast-Web-Display-Light.woff2` | Palast | 300 | normal |
| `Palast-Web-Display-Regular.woff2` | Palast | 400 | normal |

**Licensing note:** F37Grotesc (F37 Type Foundry) and Palast Web (Betatype) are commercial typefaces. The files are copied from the rootsofprogress.org production server, where they are licensed for web use by the organization. Since this Astro site replaces the same domain for the same organization, the existing license covers this use. If the site moves to a different domain or organization, a new web license will be required from each foundry. The files must not be redistributed outside of this project.

### @font-face declarations (to be added to global stylesheet)

```css
@font-face {
  font-family: "F37";
  src: url("/fonts/F37Grotesc-Book.woff2") format("woff2");
  font-weight: 300;
  font-style: normal;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
@font-face {
  font-family: "F37";
  src: url("/fonts/F37Grotesc-BookItalic.woff2") format("woff2");
  font-weight: 300;
  font-style: italic;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
@font-face {
  font-family: "F37";
  src: url("/fonts/F37Grotesc-Regular.woff2") format("woff2");
  font-weight: 400;
  font-style: normal;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
@font-face {
  font-family: "F37";
  src: url("/fonts/F37Grotesc-Medium.woff2") format("woff2");
  font-weight: 500;
  font-style: normal;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
@font-face {
  font-family: "Palast";
  src: url("/fonts/Palast-Web-Display-Light.woff2") format("woff2");
  font-weight: 300;
  font-style: normal;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
@font-face {
  font-family: "Palast";
  src: url("/fonts/Palast-Web-Display-Regular.woff2") format("woff2");
  font-weight: 400;
  font-style: normal;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```
