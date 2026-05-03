# Page Type Inventory — rootsofprogress.org

**Source:** `capture/manifest.json` — 261 URLs captured 2026-05-03  
**Purpose:** Gates Phase C component work. Every URL in the manifest is accounted for below.

---

## Summary Table

| Page type | Count | Migratable |
|-----------|------:|:----------:|
| [homepage](#1-homepage) | 1 | ✓ |
| [post](#2-post) | 25 | ✓ |
| [simple-text](#3-simple-text) | 6 | ✓ |
| [post-index](#4-post-index) | 3 | ✓ |
| [person-grid](#5-person-grid) | 1 | ✓ |
| [conference](#6-conference) | 3 | ✓ |
| [fellowship-landing](#7-fellowship-landing) | 3 | ✓ |
| [program-landing](#8-program-landing) | 1 | ✓ |
| [fellow-profile](#9-fellow-profile) | 74 | ✓ |
| [advisory-profile](#10-advisory-profile) | 29 | ✓ |
| [expert-profile](#11-expert-profile) | 20 | ✓ |
| [member-profile](#12-member-profile) | 6 | ✓ |
| [blog-subdomain-redirect](#a-blog-subdomain-redirect) | 17 | redirect only |
| [wp-api-endpoint](#b-wp-api-endpoint) | 46 | not replicated |
| [404-returned](#c-404-returned) | 19 | not replicated |
| [homepage-redirect](#d-homepage-redirect) | 5 | not replicated |
| [http-duplicate](#e-http-duplicate) | 2 | handled by Netlify |
| **Total** | **261** | |

Migratable pages requiring Astro routes: **172**

---

## Migratable Page Types

### 1. `homepage`

**URL:** `https://rootsofprogress.org/`  
**Captured file:** `capture/html/index.html`

#### Layout

Full-width parallax hero (`section.main`) with large centered text and a CTA button. The hero layer uses `.bg-wrap` + `.parallax` with a lazy-loaded background image and scroll-triggered fade/slide animations (`.t--fade`, `.t--fadedown`, `.t--delay_*`). The grid system is flex-based with responsive column classes (`col-6-md`, `col-12-sm`). Sections below the hero follow the standard `section > .container > .grid > .col-*` pattern.

#### Key CSS classes

`.main`, `.bg-wrap`, `.parallax`, `.container`, `.grid`, `.vcenter-xs`, `.hend-sm`, `.t--fade`, `.t--fadedown`, `.t--delay_*`

#### Components needed

- **HomepageHero** — full-width parallax section with centered CTA text
- Additional sections visible in the full scrolled capture (requires visual review)

#### Existing placeholder assessment

`HeroSection.astro` — **rework**: current placeholder is a simple title/subtitle block; needs the parallax scroll behavior, `.bg-wrap` layering, and animation classes matching the original.

---

### 2. `post`

**URLs (25):**

- https://rootsofprogress.org/how-does-progress-happen
- https://rootsofprogress.org/how-can-we-make-the-world-progress-faster-jason-crawford-wants-to-know
- https://rootsofprogress.org/do-we-need-a-better-understanding-of-progress
- https://rootsofprogress.org/one-week-left-to-apply-for-the-roots-of-progress-blog-building-intensive
- https://rootsofprogress.org/announcing-the-2024-roots-of-progress-blog-building-intensive
- https://rootsofprogress.org/reason-magazine-progress-rediscovered
- https://rootsofprogress.org/progress-studies-as-a-moral-imperative
- https://rootsofprogress.org/we-need-a-new-philosophy-of-progress
- https://rootsofprogress.org/progress-conference-2024-toward-abundant-futures
- https://rootsofprogress.org/new-name-and-logo-announcement
- https://rootsofprogress.org/the-techno-humanist-manifesto
- https://rootsofprogress.org/progress-humanism-agency-intellectual-core
- https://rootsofprogress.org/jason-carman-celine-halioua-cate-hall-lynne-kiesling-and-hannu-rajaniemi-to-speak-at-progress-conference-2024
- https://rootsofprogress.org/introducing-the-2024-blog-building-intensive-fellows
- https://rootsofprogress.org/progress-conference-reflections-and-2025-plans-were-hiring
- https://rootsofprogress.org/blog-building-2024-lookback
- https://rootsofprogress.org/announcing-progress-conference-2025
- https://rootsofprogress.org/save-the-date-progress-conference-2025
- https://rootsofprogress.org/announcing-the-2025-roots-of-progress-blog-building-intensive
- https://rootsofprogress.org/write-about-agriculture-or-health-longevity-and-biotech
- https://rootsofprogress.org/more-great-speakers-join-progress-conference-2025
- https://rootsofprogress.org/reflections-on-pc25
- https://rootsofprogress.org/announcing-progress-in-medicine-a-high-school-summer-career-exploration-program
- https://rootsofprogress.org/save-the-date-progress-conference-2026
- https://rootsofprogress.org/announcing-progress-conference-2026

**Captured files:** `capture/html/<slug>/index.html`

#### Layout

Parallax hero (`section.post`) with layered background (`bg-wrap-75` + `bg-wrap-under`), post title, and a metadata strip (`.newsletter`) showing date and read time. Body is single-column (`section.centered > .content`) with an optional sticky sidebar (`.sidebar`) for table-of-contents navigation. Related posts appear at the bottom as a 2-up card grid (`.posts.more`, `col-6-md`).

Two CSS variants are observable:
- **Regular post** (essays, long-form): full sidebar and large body content
- **Announcement post** (`.post.annonce`): shorter; distinct hero treatment with announcement-specific styling

#### Key CSS classes

`section.post`, `.post.annonce`, `.bg-wrap-75`, `.bg-wrap-under`, `.sidebar`, `.centered`, `.content`, `.newsletter`, `.posts.more`, `.col-6-md`, `.hspace-between-xs`, `.t--fade`

#### Components needed

- **PostHero** — parallax hero with title + metadata strip; parameterized for regular vs. announcement variant
- **ArticleBody** — prose content wrapper (pulls styles from Phase B CSS)
- **PostSidebar** — optional sticky table-of-contents nav
- **RelatedPostsGrid** — 2-up post card row at end of article

#### Existing placeholder assessment

No close match. `HeroSection.astro` — **rework** into PostHero. `EventCard.astro` — **replace** with PostCard for the related-posts grid.

---

### 3. `simple-text`

**URLs (6):**

- https://rootsofprogress.org/about
- https://rootsofprogress.org/manifesto
- https://rootsofprogress.org/subscribe
- https://rootsofprogress.org/support
- https://rootsofprogress.org/privacy-policy
- https://rootsofprogress.org/cookie-policy

**Captured files:** `capture/html/<slug>/index.html`

#### Layout

WordPress static page template (`wp-singular page-template-page-static`). Parallax hero/media section (`section.media`) followed by one or more `section.text` content blocks. Some pages include a `section.newsletter` CTA. The manifesto includes a nested-list table of contents. The About page likely includes a staff/team section. Content blocks use WordPress block editor wrappers (`wp-block-heading`, `is-layout-flex`, `is-layout-grid`).

#### Key CSS classes

`section.media`, `section.text`, `section.newsletter`, `.container`, `.grid`, `.col-6-md`, `wp-block-heading`, `is-layout-flex`, `is-layout-grid`

#### Components needed

- **TextPageHero** — parallax media section (can share structure with PostHero)
- **TextContent** — prose wrapper that handles WP block editor output

#### Existing placeholder assessment

`HeroSection.astro` — **rework** into TextPageHero. No existing placeholder for TextContent.

---

### 4. `post-index`

**URLs (3):**

- https://rootsofprogress.org/essays
- https://rootsofprogress.org/announcements
- https://rootsofprogress.org/fellows-writing

**Captured files:** `capture/html/<slug>/index.html`

#### Layout

Hero/media section followed by a featured row (2-col at `.col-6-xmd`) and then an all-posts grid (3-col at `.col-4-md`). Each card uses: thumbnail (`.thumb`), title (`.title`), excerpt (`.excerpt`), and CTA button (`.bottoms`). Cards are wrapped in `.posts > .grid`.

`fellows-writing` uses JavaScript dynamic loading: the post grid container has a `data-items` attribute and a "Load More" button (`data-more`) — posts are injected at runtime. The static capture will contain empty/partial `data-items`; Phase D will need to understand the data source.

#### Key CSS classes

`.posts`, `.grid`, `.col-4-md`, `.col-6-xmd`, `.inside`, `.title`, `.excerpt`, `.thumb`, `.bottoms`, `data-items` (dynamic), `data-more` (dynamic)

#### Components needed

- **PostCard** — card: thumbnail + title + excerpt + CTA button
- **PostGrid** — responsive 2+3-column grid wrapping PostCards
- **LoadMore** (fellows-writing only) — JS-driven pagination trigger

#### Existing placeholder assessment

`EventCard.astro` — **replace**: scoped to events/dates; PostCard is a different shape. No existing placeholder for PostGrid or LoadMore.

---

### 5. `person-grid`

**URLs (1):**

- https://rootsofprogress.org/fellows

**Captured file:** `capture/html/fellows/index.html`

#### Layout

Responsive grid of fellow profile cards. Each card uses `.block` with a headshot (`.thumb`) and bio summary (`.bio-title`, `.bio`). A WordPress archive-style listing of all fellows.

#### Key CSS classes

`.grid`, `.col-*`, `.block`, `.thumb`, `.bio-title`, `.bio`

#### Components needed

- **FellowCard** — grid card: headshot + name + short bio
- **FellowGrid** — responsive grid of FellowCards

#### Existing placeholder assessment

`PersonCard.astro` — **rework**: structure is close (image + name + role + bio). Rework to match the `.block` card pattern from the original HTML, including correct class names.

---

### 6. `conference`

**URLs (3):**

- https://rootsofprogress.org/conference
- https://rootsofprogress.org/conference-2024
- https://rootsofprogress.org/conference-2025

**Captured files:** `capture/html/conference*/index.html`

#### Layout

Multi-section modular layout. All three pages share the same section sequence (with varying content):

1. **Media hero** — full-height parallax (`section.media`)
2. **Newsletter/CTA** — 2-column text + button (`section.newsletter`)
3. **Text sections** — prose with col-6-md splits (`section.text`)
4. **Speakers grid** — `section.team.simple` — speaker card grid
5. **Accordion sections** — `section.text.acco` — collapsible content blocks
6. **Agenda section** — `section.text.agenda` — schedule/timeline layout
7. **Venue gallery** — `section.text.ven` with `.venue-gallery` image grid
8. **Separator** — `section.separator` — SVG decorative divider

#### Key CSS classes

`section.media`, `section.newsletter`, `section.text`, `section.team.simple`, `section.text.acco`, `section.text.agenda`, `section.text.ven`, `.venue-gallery`, `.separator`, `.col-6-md`, `.hspace-between-xs`

#### Components needed

- **ConferenceHero** — full-height parallax media section
- **SpeakerGrid** — `section.team.simple` speaker card grid
- **Accordion** — collapsible content section (`section.text.acco`)
- **AgendaSection** — `section.text.agenda` schedule layout (shared with fellowship-landing)
- **VenueGallery** — `section.text.ven` image gallery

#### Existing placeholder assessment

`EventCard.astro` — **replace**: the conference speaker grid (`section.team.simple`) is a different card pattern than EventCard. Create **SpeakerCard** for this context. `HeroSection.astro` — **rework** into ConferenceHero.

---

### 7. `fellowship-landing`

**URLs (3):**

- https://rootsofprogress.org/fellowship
- https://rootsofprogress.org/fellowship-2024
- https://rootsofprogress.org/fellowship-2025

**Captured files:** `capture/html/fellowship/index.html`, `capture/html/fellowship-2024/index.html`, `capture/html/fellowship-2025/index.html`

#### Layout

Parallax hero (`section.media`) followed by accordion-heavy curriculum layout. Two-column heading/content split (`col-6-md`) throughout. Six or more `section.text.acco.alt.fellow` blocks represent collapsible curriculum topic sections. Agenda cards at the bottom (`section.text.agenda`).

`/fellowship-2024` and `/fellowship-2025` are year editions of the main fellowship. All three use identical markup structure; only content differs.

#### Key CSS classes

`section.media`, `section.text.acco.alt.fellow`, `section.text.agenda`, `.col-6-md`, `.grid`, `.hspace-between-xs`

#### Components needed

- **FellowshipHero** — parallax media section (shares structure with ConferenceHero)
- **CurriculumAccordion** — `section.text.acco.alt.fellow` heading + collapsible content
- **AgendaSection** — shared with conference page type

#### Existing placeholder assessment

No close match among existing placeholders.

---

### 8. `program-landing`

**URLs (1):**

- https://rootsofprogress.org/progress-in-medicine

**Captured file:** `capture/html/progress-in-medicine/index.html`

#### Layout

Most complex single-page type: combines multi-section landing (from `conference`) with the popup expert grid (from `expert-profile`). Structure:

1. Parallax hero
2. Text content sections
3. Expert/instructor grid — `section.fellows.alt.popups` (same popup pattern as expert profiles)
4. Agenda section — `section.text.agenda`
5. Video embed section

#### Key CSS classes

`section.media`, `section.text`, `section.fellows.alt.popups`, `section.text.agenda`, `.stick`, `.block`, `.thumb`, video embed wrappers

#### Components needed

- **ProgramHero** — shares structure with ConferenceHero/FellowshipHero
- **ExpertGrid** — `section.fellows.alt.popups` (shared with expert-profile type)
- **VideoSection** — embedded video block
- **AgendaSection** — shared with conference and fellowship-landing

#### Existing placeholder assessment

No close match. All components are shared with other types; none currently exist as placeholders.

---

### 9. `fellow-profile`

**URLs (74):** all paths under `https://rootsofprogress.org/fellow/`

<details>
<summary>All 74 URLs</summary>

https://rootsofprogress.org/fellow/abby-shalekbriski  
https://rootsofprogress.org/fellow/adam-kroetsch  
https://rootsofprogress.org/fellow/afra-wang  
https://rootsofprogress.org/fellow/alex-kustov  
https://rootsofprogress.org/fellow/alex-telford  
https://rootsofprogress.org/fellow/allison-lehman  
https://rootsofprogress.org/fellow/andrew-burleson  
https://rootsofprogress.org/fellow/andrew-miller  
https://rootsofprogress.org/fellow/anton-leicht  
https://rootsofprogress.org/fellow/ariel-patton  
https://rootsofprogress.org/fellow/ben-james  
https://rootsofprogress.org/fellow/benedict-springbett  
https://rootsofprogress.org/fellow/brian-balkus  
https://rootsofprogress.org/fellow/byron-cohen  
https://rootsofprogress.org/fellow/colleen-smith  
https://rootsofprogress.org/fellow/connor-obrien  
https://rootsofprogress.org/fellow/dean-ball  
https://rootsofprogress.org/fellow/deric-tilson  
https://rootsofprogress.org/fellow/dominik-hermle  
https://rootsofprogress.org/fellow/duncan-mcclements  
https://rootsofprogress.org/fellow/dynomight  
https://rootsofprogress.org/fellow/elizabeth-van-nostrand  
https://rootsofprogress.org/fellow/elle-griffin  
https://rootsofprogress.org/fellow/etienne-fortier-dubois  
https://rootsofprogress.org/fellow/fin-moorhouse  
https://rootsofprogress.org/fellow/florian-metzler  
https://rootsofprogress.org/fellow/grant-dever  
https://rootsofprogress.org/fellow/grant-mulligan  
https://rootsofprogress.org/fellow/heidi-huang  
https://rootsofprogress.org/fellow/hiya-jain  
https://rootsofprogress.org/fellow/ibis-slade  
https://rootsofprogress.org/fellow/jacob-rintamaki  
https://rootsofprogress.org/fellow/jannik-reigl  
https://rootsofprogress.org/fellow/jeff-fong  
https://rootsofprogress.org/fellow/jenni-morales  
https://rootsofprogress.org/fellow/jeremy-cote  
https://rootsofprogress.org/fellow/jonah-messinger  
https://rootsofprogress.org/fellow/jordan-mcgillis  
https://rootsofprogress.org/fellow/julius-simonelli  
https://rootsofprogress.org/fellow/karthik-tadepalli  
https://rootsofprogress.org/fellow/kelly-vedi  
https://rootsofprogress.org/fellow/kevin-kohler  
https://rootsofprogress.org/fellow/lauren-gilbert  
https://rootsofprogress.org/fellow/laura-london  
https://rootsofprogress.org/fellow/laura-mazer  
https://rootsofprogress.org/fellow/lesley-gao  
https://rootsofprogress.org/fellow/maarten-boudry  
https://rootsofprogress.org/fellow/madeline-zimmerman  
https://rootsofprogress.org/fellow/malcolm-cochran  
https://rootsofprogress.org/fellow/mary-hui  
https://rootsofprogress.org/fellow/max-tabarrok  
https://rootsofprogress.org/fellow/michael-hill  
https://rootsofprogress.org/fellow/niko-mccarty  
https://rootsofprogress.org/fellow/nehal-udyavar  
https://rootsofprogress.org/fellow/paige-lambermont  
https://rootsofprogress.org/fellow/pouya-nikmand  
https://rootsofprogress.org/fellow/quade-macdonald  
https://rootsofprogress.org/fellow/raiany-romanni  
https://rootsofprogress.org/fellow/rhishi-pethe  
https://rootsofprogress.org/fellow/rob-lheureux  
https://rootsofprogress.org/fellow/robert-long  
https://rootsofprogress.org/fellow/rosie-campbell  
https://rootsofprogress.org/fellow/ruxandra-teslo  
https://rootsofprogress.org/fellow/ryan-puzycki  
https://rootsofprogress.org/fellow/sam-enright  
https://rootsofprogress.org/fellow/sarah-constantin  
https://rootsofprogress.org/fellow/sean-fleming  
https://rootsofprogress.org/fellow/sean-oneill-mcpartlin  
https://rootsofprogress.org/fellow/smrithi-sunil  
https://rootsofprogress.org/fellow/steve-newman  
https://rootsofprogress.org/fellow/steven-adler  
https://rootsofprogress.org/fellow/tim-durham  
https://rootsofprogress.org/fellow/tina-marsh-dalton  
https://rootsofprogress.org/fellow/venkatesh-ranjan  

</details>

**Captured files:** `capture/html/fellow/*/index.html`

#### Layout

Full-page popup/modal style (`section.fellows.alt.popups`). The page renders the fellows-grid HTML as a background with the individual profile panel open on top — a WordPress single-entry popup pattern. A sticky sidebar (`.stick`) on the left shows the fellow's name, location, and social links. The main area contains a grid of content cards (`.block`) each with a headshot (`.thumb`) and bio text (`.bio-title`, `.bio`).

**Body class:** `fellow-template-default`

#### Key CSS classes

`section.fellows.alt.popups`, `.stick`, `.name`, `.details`, `.block`, `.thumb`, `.bio-title`, `.bio`, `.grid`, `.vcenter-xs`

#### Components needed

- **FellowProfilePage** — full-page popup layout: sticky sidebar + card grid
- **FellowCard** — shared with `person-grid` type (the `.block` cards within the profile)

#### Existing placeholder assessment

`PersonCard.astro` — **rework** into FellowCard (the individual `.block` card). The full-page `FellowProfilePage` layout is new with no matching placeholder.

---

### 10. `advisory-profile`

**URLs (29):** all paths under `https://rootsofprogress.org/advisory/`

<details>
<summary>All 29 URLs</summary>

https://rootsofprogress.org/advisory/alice-evans  
https://rootsofprogress.org/advisory/alex-kustov  
https://rootsofprogress.org/advisory/andrej-karpathy  
https://rootsofprogress.org/advisory/blake-scholl  
https://rootsofprogress.org/advisory/bob-mcgrew  
https://rootsofprogress.org/advisory/brendan-mccord  
https://rootsofprogress.org/advisory/brian-potter  
https://rootsofprogress.org/advisory/chandler-tuttle  
https://rootsofprogress.org/advisory/delian-asparouhov  
https://rootsofprogress.org/advisory/ela-madej  
https://rootsofprogress.org/advisory/eli-dourado  
https://rootsofprogress.org/advisory/elle-griffin  
https://rootsofprogress.org/advisory/emma-mcaleavy  
https://rootsofprogress.org/advisory/greg-lukianoff  
https://rootsofprogress.org/advisory/holden-karnofsky  
https://rootsofprogress.org/advisory/john-wilbanks  
https://rootsofprogress.org/advisory/kanjun-qiu  
https://rootsofprogress.org/advisory/kevin-esvelt  
https://rootsofprogress.org/advisory/max-roser  
https://rootsofprogress.org/advisory/mike-riggs  
https://rootsofprogress.org/advisory/noah-smith  
https://rootsofprogress.org/advisory/patrick-collison  
https://rootsofprogress.org/advisory/rob-tracinski  
https://rootsofprogress.org/advisory/saloni-dattani  
https://rootsofprogress.org/advisory/shreeda-segan  
https://rootsofprogress.org/advisory/timothy-b-lee  
https://rootsofprogress.org/advisory/tomas-pueyo  
https://rootsofprogress.org/advisory/tyler-cowen  
https://rootsofprogress.org/advisory/virginia-postrel  

</details>

**Captured files:** `capture/html/advisory/*/index.html`

#### Layout

Two-column bio split (`section.bio`): headshot on the left (`.thumb` inside `.col-6-xmd`), content on the right (name `h1`, role/subtitle `h2`, bio paragraphs, social links in `.bottom`). Back navigation button at top. Scroll-triggered entrance animations (`.t--fade`, `.t--fadedown`). Footer includes a newsletter CTA (`section.newsletter`).

**Body class:** `advisory-template-default`

#### Key CSS classes

`section.bio`, `.grid`, `.col-6-xmd`, `.vend-xs`, `.thumb`, `.t--fade`, `.t--fadedown`, `.bottom`

#### Components needed

- **BioProfilePage** — two-column full-page layout: image left, content right

#### Existing placeholder assessment

`PersonCard.astro` — **replace**: existing placeholder is a widget card, not a full-page two-column layout. BioProfilePage is a fundamentally different shape.

---

### 11. `expert-profile`

**URLs (20):** all paths under `https://rootsofprogress.org/expert/`

<details>
<summary>All 20 URLs</summary>

https://rootsofprogress.org/expert/2540  
https://rootsofprogress.org/expert/abigail-thomas  
https://rootsofprogress.org/expert/adam-kroetsch  
https://rootsofprogress.org/expert/akash-kulgod  
https://rootsofprogress.org/expert/amesh-adalja  
https://rootsofprogress.org/expert/celine-halioua  
https://rootsofprogress.org/expert/fred-milgrim  
https://rootsofprogress.org/expert/gavriel-kleinwaks  
https://rootsofprogress.org/expert/grace-klaris  
https://rootsofprogress.org/expert/hannah-m-hamlin  
https://rootsofprogress.org/expert/heidi-huang  
https://rootsofprogress.org/expert/jake-swett  
https://rootsofprogress.org/expert/jared-seehafer  
https://rootsofprogress.org/expert/jason-crawford  
https://rootsofprogress.org/expert/kristen-shea  
https://rootsofprogress.org/expert/laura-mazer  
https://rootsofprogress.org/expert/leon-han  
https://rootsofprogress.org/expert/mike-riggs  
https://rootsofprogress.org/expert/test-person  
https://rootsofprogress.org/expert/vassilis-alexopoulos  

</details>

**Captured files:** `capture/html/expert/*/index.html`

#### Layout

Same popup/modal structure as `fellow-profile` (`section.fellows.alt.popups`, `.stick`, `.block`, `.thumb`, `.bio-title`, `.bio`) with one addition: a `.essays` section below the bio cards that lists related essays written by this expert.

**Body class:** `other-template-default`

#### Key CSS classes

`section.fellows.alt.popups`, `.stick`, `.block`, `.thumb`, `.bio-title`, `.bio`, `.essays`

#### Components needed

- **ExpertProfilePage** — extends FellowProfilePage + EssaysList
- **EssaysList** — `section.essays` title + linked essay items

#### Existing placeholder assessment

`PersonCard.astro` — **rework** (same as fellow-profile: becomes FellowCard for the `.block` cards). `ExpertProfilePage` and `EssaysList` are new.

---

### 12. `member-profile`

**URLs (6):**

- https://rootsofprogress.org/member/yel-alonzo
- https://rootsofprogress.org/member/heike-larson
- https://rootsofprogress.org/member/emma-mcaleavy
- https://rootsofprogress.org/member/ben-thomas
- https://rootsofprogress.org/member/jason-crawford
- https://rootsofprogress.org/member/mike-riggs

**Captured files:** `capture/html/member/*/index.html`

#### Layout

Identical to `advisory-profile`: `section.bio`, two-column split with headshot left and content right, same CSS classes.

**Body class:** `member-template-default`

#### Components needed

Reuse **BioProfilePage** from `advisory-profile` with no changes.

#### Existing placeholder assessment

Same assessment as advisory-profile.

---

## Non-Migratable URLs

### A. `blog-subdomain-redirect`

**Count:** 17 URLs — status 301

All redirect to `blog.rootsofprogress.org`, which is out of scope per the migration plan ("Scope: `rootsofprogress.org` only. `blog.rootsofprogress.org` and `newsletter.rootsofprogress.org` are separate sites.").

| Source URL | Target |
|------------|--------|
| /progress-humanism-agency | blog.rootsofprogress.org/progress-humanism-agency |
| /solutionism-on-ai-safety | blog.rootsofprogress.org/solutionism-on-ai-safety |
| /progress-studies-a-moral-imperative | blog.rootsofprogress.org/progress-studies-a-moral-imperative |
| /a-new-philosophy-of-progress | blog.rootsofprogress.org/a-new-philosophy-of-progress |
| /smart-rich-and-free | blog.rootsofprogress.org/smart-rich-and-free |
| /the-beginning | blog.rootsofprogress.org/the-beginning |
| /the-idea-of-progress | blog.rootsofprogress.org/the-idea-of-progress |
| /books/the-rise-and-fall-of-american-growth | blog.rootsofprogress.org/books/the-rise-and-fall-of-american-growth |
| /problem-solution-history | blog.rootsofprogress.org/problem-solution-history |
| /enlightenment-now | blog.rootsofprogress.org/enlightenment-now |
| /the-baconian-program | blog.rootsofprogress.org/the-baconian-program |
| /devanney-on-the-nuclear-flop | blog.rootsofprogress.org/devanney-on-the-nuclear-flop |
| /descriptive-vs-prescriptive-optimism | blog.rootsofprogress.org/descriptive-vs-prescriptive-optimism |
| /summary-the-rise-and-fall-of-american-growth | blog.rootsofprogress.org/summary-the-rise-and-fall-of-american-growth |
| /side-effects-of-technology | blog.rootsofprogress.org/side-effects-of-technology |
| /a-thriving-progress-movement | blog.rootsofprogress.org/a-thriving-progress-movement |
| /bibliography | blog.rootsofprogress.org/bibliography |

**Treatment:** Implement as 301 redirects in `netlify.toml` preserving the original target URLs. No Astro page is built for these paths.

---

### B. `wp-api-endpoint`

**Count:** 46 URLs — status 200 (44) or 400 (1), plus 1 root

WordPress REST API responses at `/api`, `/api/oembed/1.0/embed`, `/api/wp/v2/posts/*` (25 entries), `/api/wp/v2/pages/*` (19 entries). These return JSON, not HTML. No Astro route is needed.

**Treatment:** No Astro route. These paths will 404 naturally on the new site. No inbound HTML links to these paths exist in the captured pages.

---

### C. `404-returned`

**Count:** 19 URLs — status 404

URLs that the live WP site currently returns 404 for. No content to migrate.

| Path | Note |
|------|------|
| `/e404` | WP's internal 404 template URL; fetching it directly returns 404. The custom 404 design must be sourced by observing what WP renders for any non-existent URL in a browser. |
| `/category/announcements`, `/category/essays`, `/category/featured`, `/category/press` | WP category archives — 4 URLs |
| `/tag/biotech`, `/tag/career-search`, `/tag/college-prep`, `/tag/high-school`, `/tag/medicine`, `/tag/summer-program` | WP tag archives — 6 URLs |
| `/advisory_cat/industry-experts`, `/advisory_cat/other-near-peer-mentors`, `/advisory_cat/other-program-advisors`, `/advisory_cat/other-team`, `/advisory_cat/progress-intellectuals-and-writers`, `/advisory_cat/roots-of-progress-institute`, `/advisory_cat/writing-audience-building-guides` | WP advisory taxonomy pages — 7 URLs |
| `/fellow/dynomight.net` | Malformed URL (domain as path segment) — 1 URL |

**Treatment:** No Astro route. Astro's default 404 behavior handles these paths. A custom `src/pages/404.astro` should be created in a future issue, with design taken from a visual observation of WP's 404 rendering (not from `/e404`).

---

### D. `homepage-redirect`

**Count:** 5 URLs — captured with status 200 but serve homepage content

These URLs return the homepage HTML verbatim (confirmed by matching sha256 `80d78a1f...` against the homepage capture). There is no distinct page to migrate.

| URL | Note |
|-----|------|
| `/year/2023` | WP year archive falls back to homepage |
| `/year/2024` | WP year archive falls back to homepage |
| `/year/2025` | WP year archive falls back to homepage |
| `/fellowship/fellows` | Redirects to `/fellows` (same sha256 `f9b626bc...`) |
| `/fellowship-2` | Temporary staging copy of the fellowship page; not for migration |

**Treatment:** No Astro route. `/year/*` and `/fellowship/fellows` will naturally 404 on the new site (acceptable — neither appears in the site nav). `/fellowship-2` is intentionally excluded.

---

### E. `http-duplicate`

**Count:** 2 URLs — status 200 (bare HTTP)

- `http://rootsofprogress.org/progress-in-medicine`
- `http://rootsofprogress.org`

Bare HTTP versions of the homepage and /progress-in-medicine, captured because the WP server apparently responds to HTTP without redirecting.

**Treatment:** Netlify's HTTPS-only configuration handles HTTP→HTTPS redirection automatically. No Astro page needed.

---

## Proposed C2…Cn Issue List

File these issues after this doc merges. Each maps to one page type.

| Issue | Title | Type(s) covered | URL count |
|-------|-------|-----------------|----------:|
| C2 | Build `post` template — parallax post with optional sidebar | `post` | 25 |
| C3 | Build `simple-text` template — hero + prose content | `simple-text` | 6 |
| C4 | Build `post-index` template — featured + 3-col post grid | `post-index` | 3 |
| C5 | Build `fellow-profile` template — full-page popup layout | `fellow-profile` | 74 |
| C6 | Build `expert-profile` template — popup + essays section | `expert-profile` | 20 |
| C7 | Build `advisory-profile` and `member-profile` templates — two-column bio | `advisory-profile`, `member-profile` | 35 |
| C8 | Build `person-grid` template — fellows listing page | `person-grid` | 1 |
| C9 | Build `conference` template — multi-section event page | `conference` | 3 |
| C10 | Build `fellowship-landing` template — accordion curriculum layout | `fellowship-landing` | 3 |
| C11 | Build `program-landing` template — Progress in Medicine | `program-landing` | 1 |
| C12 | Build `homepage` — custom landing page | `homepage` | 1 |

**Dependency notes:**
- C6 depends on C5 (ExpertProfilePage extends FellowProfilePage)
- C4 and C5 can share the LoadMore JS pattern; coordinate if filing concurrently
- C9, C10, C11 share AgendaSection and the media-hero component; the first one filed should define those shared pieces
- C12 (homepage) is listed last because it references the most components and benefits from other types being stable
- C7 (BioProfilePage) should replace `PersonCard.astro` rather than add a parallel component
