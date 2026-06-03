# V2 build log

Short running log for the v2 document-shell build. Companion to `V2-DESIGN-DELTA.md`
(the Phase-1 analysis + signed-off plan).

## Status
- **Phase 1 (analyze):** done — `V2-DESIGN-DELTA.md`.
- **Phase 2 (design + sign-off):** done — 4 decisions captured (home reuses POC; examples first;
  Listen visual-only; map CTA opens lightbox).
- **Phase 3 (implement):** **6 wireframed examples LIVE + validated.** Remaining ~56 pages pending.

## Live (v2 branch code + /v2/ content)
Base: `https://v2--migrate-heathrowairport-eds--paolomoz.aem.page`
- `/v2/foreword`
- `/v2/preferred-masterplan/airfield`
- `/v2/preferred-masterplan/terminals-satellites-aprons`
- `/v2/preferred-masterplan/roads-and-rail`
- `/v2/preferred-masterplan/active-travel`
- `/v2/preferred-masterplan/water-environment`

All 6: PUT+preview+publish OK; headless sweep clean (grid resolves to 290px+content, no
horizontal overflow, hero LCP loaded, 0 broken images, correct Contents-rail highlight,
have-your-say band correct, 0 console errors).

## What was built (v2 branch only)
- **Blocks (new):** `doc-header`, `doc-nav` (sticky Contents rail), `section-bar`
  (label · reading-time · visual Listen), `profile` (author card).
- **Block variants (additive, POC default path unchanged):** `hero` gains a `doc` variant
  (in-column, title+lead overlaid on the image); `figure` gains a `map` variant (title chip +
  "View interactive map →"; the frame stays click-to-lightbox).
- **CSS:** `styles/v2.css`, every rule scoped under `body.docshell`; linked from `head.html`.
  Inert on all POC pages.
- **Pipeline (source repo):** `tools/eds-fill-v2.mjs` (emits the doc shell; `--all` for every page),
  `tools/eds-batch-v2.mjs` (`/v2/` prefix, `v2` branch, retry/backoff).

## Gotchas hit this session (add to the harvest)
- **Body-class collision (cost ~5 debug loops).** Naming the doc template `doc` put `class="doc"`
  on `<body>`, which is `html`'s 2nd child — so it matched the POC's *download-block* art rule
  `.doc:nth-child(2){position:absolute}` **and** `.doc{width:210px}`. Body went position:absolute +
  210px → the whole page shrink-wrapped to a 210px column. **Rule:** a `template:` value becomes a
  `<body>` class via `decorateTemplateAndTheme`; never reuse an existing component class name for it.
  Renamed `doc` → `docshell`. (New skill candidate.)
- **EDS section DOM has no intermediate `> div`.** Block wrappers are *direct* children of
  `.section`. The doc-shell grid must be on `.section.doc-body`, not `.section.doc-body > div`.
- **Author cells, not positional rows (re-confirms SKILL #10).** Reused `band` block expects four
  *rows* (eyebrow/heading/body/link), one cell each — I first emitted one row of four cells and the
  band rendered an empty `<h2>` + the default "Find out more". Match the block's authored shape.
- **Footer subscribe band hidden on doc pages** (`body.docshell .subscribe{display:none}`) — the
  wireframe footer is the dark footer only; the purple subscribe band duplicated the have-your-say CTA.

## Deviations from the wireframe (intentional)
- **Author photo → initials avatar.** The foreword wireframe shows a photo of the author; we render
  a "JH" initials avatar (we do not re-host a person's photograph — same policy as the brand font).
- **`/v2/nav` fragment → inline.** The delta doc proposed a fetched nav fragment; the fill pipeline
  emits the Contents tree inline per page instead (deterministic, no extra fetch). Each page shows
  all 14 chapters with the active chapter's subsections expanded and the current page highlighted.
- **Date eyebrow = "June 2019"** (the real consultation date) rather than the wireframe's "June 2026"
  placeholder.

## Isolation (verified)
- Code: branch `v2` only; `main` untouched (HEAD still `e98d5cb`). New blocks have new names;
  `hero`/`figure` changes are additive variants; all CSS gated under `body.docshell`.
- Content: only `/v2/**` paths written in DA; POC root content untouched.

## Full site (Phase 3 complete)
- **All 61 doc pages + the `/v2/` home are built and published** on the `v2` branch.
  `eds-fill-v2.mjs --all` → 14 landings + 47 details; `eds-home-v2.mjs` → `/v2/` home
  (POC marketing home, v2-prefixed links, NOT a doc-shell page).
- **Verbatim guaranteed by a build guard.** `eds-fill-v2` now handles every content field
  (added: landing `pullquote`/`highlights`/`keyMap`/`timeline`/subsection-cards;
  detail `commitments`/`respond`/`docGrid`/`phases`/`timeline`) and a coverage check
  **fails the build** on any unmapped source key (`HANDLED_LANDING`/`HANDLED_DETAIL`).
  Audited against all 14 sections → 0 gaps. (Implements SKILL #11 / closes ISSUE H.)
- **Full headless sweep of all 61 doc pages: ALL CLEAN** — grid resolves, no horizontal
  overflow, 0 stretched images (the `.figure-frame img{height:auto}` fix also covers
  gallery + phases, which both render via `.figure-frame`; cards use `.card-fig img`
  object-fit:cover), 0 broken images, correct Contents-rail highlight, 0 console errors.
  Spot-checked the newly-handled block types (phases, cards, keyMap, highlights, docGrid,
  timeline) visually — all render faithfully.

## Search (header magnifier)
- Client-side full-text search over the consultation document, opened from the header
  magnifier on `/v2/` pages (doc pages + home). No backend.
- **Index:** `tools/eds-search-index-v2.mjs` builds `blocks/header/search-index.json`
  (61 entries, ~258 KB) — one per page with `{path,title,label,n,sub,text}`, where `text`
  recursively collects every string in the page's content object (full body copy, verbatim).
  Served from the code bus; fetched once on first open.
- **UI:** `blocks/header/search.js` — overlay with ranked results (title-match > label > body
  occurrences; AND-match with OR fallback), highlighted snippets, keyboard nav (↑/↓ + Enter),
  Esc/backdrop/× close. `header.js` wires the button when `location.pathname` starts `/v2/`.
  CSS: unscoped `.doc-search` in v2.css (overlay only created on /v2/ pages → inert on POC).
- Validated headless: open+focus, ranked results with `<mark>` highlights, click-nav,
  arrow+Enter nav, works on doc pages and the home, 0 console errors.

## Earlier review fixes (post-examples)
- **doc-nav row span:** `grid-row: 1 / -1` resolved to span-1 (no explicit row tracks), so
  row 1 inflated to the rail height and pushed content down. Fixed to `1 / span 99`.
- **map stretch:** EDS writes natural `width/height` attrs on `<img>`; `.figure-frame img{width:100%}`
  left the height hint → `object-fit:fill` squashed maps. Fixed with `.figure-frame img{height:auto}`.
- **"Our proposal" header highlight** on doc-shell pages (aria-current → yellow underline); POC nav unaffected.
