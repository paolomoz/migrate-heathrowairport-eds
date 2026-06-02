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

## Round 2 — eyeball-review fixes (sections 1 & 2, generalised site-wide)

User reviewed the live site and found 8 issues. Root-caused, fixed, generalised across
all 62 pages, re-deployed. Two themes dominate: **boilerplate CSS leakage** and **blocks
that over-split / re-wrap content instead of preserving authored semantic HTML**.

- **ISSUE D — boilerplate block CSS leaks onto the ported design (header + footer).**
  The AEM boilerplate left full `blocks/header/header.css` and `blocks/footer/footer.css`.
  `header nav a:any-link{color:currentcolor}` has specificity (0,1,3) and out-ranks our
  `.site-nav a{color:#fff}` (0,1,1) → nav links rendered dark/illegible over the hero;
  `header nav{padding;max-width;height}` shifted the bar. `footer .footer > div{max-width:1200px;
  margin:auto}` matched our `.subscribe`/`.site-footer` bands and capped them at 1200px →
  the full-bleed purple broke (beige gutters). **FIX:** gut both block CSS files to a comment;
  all chrome styling lives in the ported global `styles.css`. **Skill rule:** when a block's
  DOM is rebuilt in JS against the ported design system, the scaffolder's boilerplate
  `.css` must be **emptied**, not left in place — boilerplate selectors silently out-specify
  ported ones. (The mirror of ISSUE A: every block needs a `.css` file, but it must not carry
  boilerplate rules.)

- **ISSUE E — hero block dropped the image and double-wrapped text.** `hero.js` read four
  positional cells and rebuilt `<p class=eyebrow>${innerHTML}</p><h1>${innerHTML}</h1>…`.
  When a cell already held block elements (a hand-authored `<h1>`, or a pipeline `<p>`), the
  re-wrap produced `<p class=eyebrow><p>…</p></p>` (browser splits it) and `<h1><p>…</p></h1>`,
  and the image cell wasn't recognised so the hero fell back to solid purple — the image
  vanished. **FIX:** hero.js now classifies cells (media = picture/img/mp4-link with no
  heading; everything else is text), **reuses the EDS `<picture>` node** as `.hero-media`
  (srcset preserved), and **moves the authored h1/p as-is** into `.wrap`, only tagging the
  eyebrow. Pipeline now emits the hero as one rich-text cell + one media cell.
  **Skill rule:** blocks should *preserve* authored semantic elements, not rebuild them from
  `innerHTML` strings — re-wrapping is what breaks the moment a cell isn't bare text.

- **ISSUE F — checklist lead-in wasn't a heading and sat on white.** `commitments`/`respond`
  checklists rendered the intro as a `<p>` on a white band; the prototype has it as an `<h2>`
  on grey. Also the authoring split one table row per item. **FIX:** checklist is now **one
  semantic cell** — a heading (+optional intro) followed by a `<ul>` — and the block defaults
  to the grey band (`plain` variant for white). Generalised to every checklist
  (commitments, respond, keyAreas, highlights).

- **ISSUE G — list content flattened to paragraphs.** Detail-intro `list` items were emitted
  as `<p>` each (via `paras`) instead of a `<ul>`, so "In this consultation we are seeking
  feedback on:" lost its bullets. **FIX:** pipeline appends a real `<ul>` to the intro prose;
  text/split blocks already pass `innerHTML` through, so the list survives. Added `.prose ul`
  styling.

- **ISSUE H — a whole section was silently dropped (`docGrid`).** The "Overview of the
  consultation documents" library grid on `introduction/this-consultation` had **no pipeline
  handler at all**, so the section just disappeared. A field-coverage audit (compare every
  key in `content/section*.json` against the keys the pipeline consumes) also found detail
  `pullquote` (early-growth) being dropped — the prototype dropped it too, but losing real
  content is wrong. **FIX:** added a `docgrid` block (+`.docgrid/.docgroup` CSS) and a handler;
  detail `pullquote` now renders as an "In short" callout. **Skill rule:** the fill pipeline
  must run a **content-field coverage check** and fail/warn on any content key it doesn't map,
  so a section can never silently vanish.

- **ISSUE I — split figure too tall / unbalanced.** Portrait map figures towered over their
  prose column (`align-items:center` made it worse). **FIX:** `.split{align-items:start}` and
  cap the split figure (`.split .figure-frame img{max-height:520px;object-fit:contain}`) so a
  tall map fits its frame on the mist background without cropping. (The 2-col grid itself was
  fine at desktop — the imbalance read as "stacked".)

- **ISSUE J — picture-backed heroes rendered solid purple (boilerplate leak, again).**
  After the content re-deploy, every hero with a background image showed only the
  `.cmp--hero` purple. Two causes, both boilerplate-leak: (1) reusing the EDS `<picture>`
  node as `.hero-media` sized the wrapper but not its inner `<img>` (added
  `.hero picture.hero-media img{width/height:100%;object-fit:cover}`); (2) the leftover
  `blocks/hero/hero.css` still carried `.hero picture{z-index:-1}`, which pushed the picture
  *behind* the hero's purple background. I'd cleaned header/footer block CSS but missed
  hero's. **FIX:** neutralise `hero.css` too. **Skill rule (reinforces D/#8):** sweep *every*
  rebuilt block's boilerplate `.css`, not just the obvious chrome ones — any `.hero/.cards/…`
  selector left behind can silently out-rank or invert the ported design (`z-index:-1` here).

- **ISSUE K — landing "In short" split stacked instead of side-by-side.** The landing intro
  uses `.split--text-first` (prose | pullquote callout). That modifier only overrides
  `grid-template-columns` — `display:grid` lives on the base `.split`. `split.js` set the
  class to `'split--text-first'` *replacing* `'split'`, so the element had no `display:grid`
  and stacked. The prototype uses both classes (`split split--text-first`). **FIX:** emit
  `'split split--text-first'`. **Skill rule:** when a block applies a CSS *modifier* class,
  keep the base class too — modifiers are written to extend the base, not stand alone.

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
8. **Empty the boilerplate block CSS, don't just add yours.** Leftover `header.css`/`footer.css`
   boilerplate out-specifies the ported design system (`a:any-link{color:currentcolor}`,
   `max-width:1200px`). When a block is rebuilt in JS against ported global CSS, reset its
   block `.css` to a comment. (ISSUE D — pairs with #2.)
9. **Blocks must preserve authored semantic HTML, not rebuild it from `innerHTML` strings.**
   Re-wrapping cell text in `<p>`/`<h1>` breaks as soon as a cell holds block elements
   (hand-authored or pipeline-produced) — nested `<p><p>`, dropped media. Classify cells,
   reuse the EDS `<picture>` node, and *move* authored elements into place. (ISSUE E.)
10. **Author in fewer, richer cells — closer to copy-pasting HTML.** One checklist cell
    (heading + `<ul>`) beats one row per item; one hero rich-text cell + one media cell beats
    four positional rows. More natural to author and far less fragile to EDS's cell cleaning.
    (ISSUES E/F/G.)
11. **The fill pipeline needs a content-field coverage check.** Audit every key in the source
    content against the keys the pipeline maps; warn/fail on unmapped keys. A missing `docGrid`
    handler silently deleted a whole section (ISSUE H). Silent truncation reads as "covered
    everything" when it didn't.
