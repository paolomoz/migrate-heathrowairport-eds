# Heathrow Expansion → EDS migration notes

Running log of the stardust-prototype → Edge Delivery Services migration of
`migrate-heathrowairport` into `paolomoz/migrate-heathrowairport-eds`.
Kept for a post-migration review to harvest skill improvements.

- **Source site:** `/Users/paolo/stardust/migrate-heathrowairport` (62 pages, 14 sections + home;
  verbatim content in `content/section*.json`, rendered by `stardust/prototypes/build-*.mjs`
  over a shared `_lib/chrome.mjs`; design = faithful heathrow.com/expansion reproduction).
- **Target:** repo `paolomoz/migrate-heathrowairport-eds`, DA `paolomoz/migrate-heathrowairport-eds`.
- **Strategy (chosen by user):** bespoke blocks (exact reproduction, authorable) + a
  content-model fill pipeline (all pages generated verbatim from `content/section*.json`).
- **URL scheme:** `/` = home, `/<section-slug>` = landing, `/<section-slug>/<subsection>` = detail.

## Architecture decisions
- **CSS reuse:** our `site.css` already uses unique semantic component classes (.hero, .groups,
  .callout, .stats, .timeline, .phase, .figure, .legend, .infobox, .benefit, .newscard,
  .download, .cards, .breadcrumb, .pager). Port it wholesale into the EDS global `styles.css`
  (tokens + reset + chrome + components + lightbox), rewriting asset paths. Block JS rebuilds the
  SAME DOM/classes from EDS table cells, so the tested CSS is reused 1:1 (block `.css` stays minimal).
  Rationale: far less work + proven fidelity vs. re-deriving per-block scoped CSS.
- **Assets:** committed into the EDS repo and referenced by fully-qualified aem.page URLs
  (figures → /img/figures, fonts → /fonts, logos → /icons, video+poster → /img, pdf → /assets).
- **Fill pipeline:** new `tools/eds-fill.mjs` in the source repo emits DA block-table HTML per page
  from `content/section*.json` (no LLM at fill time → verbatim guarantee).

## Phase log

### Phase 0 — setup (DONE)
- Cloned EDS repo locally; AEM boilerplate intact (blocks: header, footer, fragment, hero, cards, columns).
- DA token (from uplift-wheelercat-eds/.env) validated against target: `list` returns 200, empty source (clean slate).

### Phase 1 — foundation (DONE)
- Assets copied into repo: 39 deduped figures → `/img/figures`, hero video+poster → `/img`,
  PDF → `/assets`, logos → `/icons`, Open Sans woff2 → `/fonts`.
- `styles/styles.css` = ported `site.css`. Adaptation: prototype `section{}` → `.cmp{}`
  band; EDS `.section`/wrapper neutralised (`max-width:none;padding:0`); full-bleed bands
  (download/band/subscribe) via `.cmp:has(> .x)`; hero band = `.cmp--hero`.
- `fonts.css` emptied (boilerplate roboto unused; our @font-face is in styles.css).
- Chrome rebuilt directly in `blocks/header/header.js` + `blocks/footer/footer.js`
  (footer also renders the subscribe band). Static brand chrome → not per-page authored.
- Lightbox wired in `scripts/scripts.js` (`setupLightbox`, event-delegated) → covers
  figures in any block, any time.

**Block model (key decision):**
- `blocks/cmp/cmp.js` — generic band: promotes the authored cell's pre-rendered component
  HTML into `.cmp[.alt]`, and **injects SVGs in JS** (zoom-badges into `.figure-frame`,
  yellow benefit icons into `[data-icon]`) so the DA source never carries inline `<svg>`.
- `blocks/hero/hero.js` — builds the hero with video/img/solid media (DA can't safely hold
  a raw `<video>`/`<img class=hero-media>`).

**Pipeline decision:** the prototypes are already rendered HTML, so the fill pipeline
PARSES each prototype, lifts the hero + content `<section>`s, strips inline SVG
(zoom-badge) + the lightbox div, rewrites `assets/figures/*` → `/img/figures/*`, and wraps
each section as a `cmp`/`hero` block. Verbatim fidelity, all 3 render paths reused.

**ISSUE (logged):** rendered prototype HTML contains inline SVG (zoom-badges in figures,
benefit icons on home) which DA sanitises. FIX: strip zoom-badges in the pipeline (cmp.js
re-injects); the home (video hero + SVG benefit icons + download) is hand-authored as DA
content with `[data-icon]` markers instead of pipeline-extracted.
**Skill-improvement candidate:** a stardust→EDS importer should emit icon/zoom SVGs via
block JS from the start (markers in content), not bake them into prototype HTML.

### Phase 2 — blocks + home (IN PROGRESS)

**Validation 1 (home deploy):** PUT 201, preview 200. Chrome + styles + `#F4F4F6` + hero
video all rendered correctly at `/` (note: EDS serves `index.html` at `/`, not `/index`).

**ISSUE A (fixed):** `cmp` block failed to load — missing `blocks/cmp/cmp.css` (this
boilerplate's `loadBlock` treats a 404 block CSS as fatal). Fix: every block needs a
`.css` file even if empty. → skill note: scaffolder must emit an (at least empty) `.css`
per block.

**ISSUE B (ARCHITECTURE PIVOT — key finding):** the EDS render pipeline **strips wrapper
`<div>`s and all `class` attributes from block-cell content**, normalising it to clean
semantic elements (h2/h3/p/ul/li/a/img/strong/em). Confirmed via `/index.plain.html`:
authored `<div class="download"><div class="wrap">…<p class="eyebrow">` came back as bare
`<p>…</p><h2>…</h2>`. So the "pass-through cmp block hosting pre-rendered component HTML"
approach is impossible — EDS destroys the structure before block JS sees it. The hero
block works *because it rebuilds the DOM in JS from cell text*.
**FIX / correct architecture:** real per-component blocks whose `decorate()` reads the
cleaned semantic cell content and rebuilds the component DOM (adding the wrapper classes
the global CSS targets). The fill pipeline emits CLEAN tables (semantic content only),
not rich HTML-with-classes.
**Skill-improvement candidate (important):** a stardust→EDS importer must NOT try to carry
prototype section HTML verbatim into DA cells. It has to (a) define a block per component,
(b) emit clean authorable cells, (c) rebuild DOM in block JS. The `aem-import` "generic
blocks + theme CSS" model is right about this; the lesson is that *any* approach needs
real decorate()-rebuilds, and the fill pipeline emits content, not markup.
