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

**Validation 2 (home, corrected arch):** all blocks render at `/` — hero+video, download,
5 benefits + 5 yellow icons, 14 contents cards, 3 news cards, band, chrome, #F4F4F6, 0
broken images, 0 console errors. Faithful match to the prototype.

Blocks built (each rebuilds DOM from positional cells; CSS reused from global styles.css):
hero, breadcrumb, text, split, groups, callout, infobox, figure, gallery, stats, timeline,
checklist, cards, benefit, newscard, download, band, pager, legend, phases (+ cmp kept for
any pass-through). SVGs (zoom-badge, benefit icons) injected in JS, never in DA cells.

### Phase 3 — fill pipeline (DONE)
- `tools/eds-fill.mjs` reads content/section*.json and emits clean block tables per page,
  mirroring build-section.mjs landing/detail order. All 14 sections share one schema
  (incl. §3 which used a bespoke generator). 61 section pages + home = 62.
- `tools/eds-home.mjs` (bespoke home), `tools/eds-deploy.mjs` (1 page), `tools/eds-batch.mjs`
  (all pages PUT+preview+publish). Images → `/img/figures/<id>.png`, host-qualified.

### Phase 4 — batch deploy (DONE)
- 62/62 pages PUT + previewed OK. Then published to .aem.live.

### Phase 5 — verify (DONE)
- Full sweep of all 62 live pages: **0 issues** (HTTP 200, no overflow, no broken images,
  all blocks decorated, hero present, no console errors).
- **ISSUE C (fixed):** `querySelectorAll('picture, img')` in `phases.js` matched both the
  EDS-generated `<picture>` AND its nested `<img>`, so single-map phases rendered blank /
  duplicated. Fix: select `picture` first, fall back to `img`. → skill note: when reading
  authored images in block JS, EDS wraps `<img>` in `<picture>`; always select one, never
  the `picture, img` union for multi-image cells.
- Faithful-to-prototype note: construction-programme intro shows a phase map as its primary
  figure because `primaryFig` matches phase-maps (role≠context) — same as the prototype.

## Skill-improvement summary (for review)
1. **Don't pass prototype HTML through DA cells** — EDS strips wrapper divs + classes.
   Importer must emit clean cells + rebuild DOM in block JS. (ISSUE B — the big one.)
2. **Every block needs a `.css` file** even if empty; a 404 block CSS fails `loadBlock`.
   (ISSUE A)
3. **EDS wraps authored `<img>` in `<picture>`** — block JS must select `picture` (or img),
   never the `picture, img` union when collecting multiple. (ISSUE C)
4. **`index.html` serves at `/`, not `/index`** — verify against the root.
5. **`.env` / DA token must be gitignored** — GitHub push-protection blocks the token
   otherwise (cost a push + amend). Importer should gitignore `.env` at bootstrap.
6. **Reuse the prototype's global CSS verbatim** by mapping `section{}` → a `.cmp` band the
   blocks emit; only the section-band selectors needed rewriting. Big time-saver, high
   fidelity — worth formalising in the skill.
7. **Bespoke-block + content-model fill pipeline** (vs generic-blocks) gave ~pixel-faithful
   reproduction of a bespoke design while staying authorable. Good fit when the design is
   the deliverable.
