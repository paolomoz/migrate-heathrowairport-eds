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

## Next
- Batch the remaining ~56 pages with `node tools/eds-fill-v2.mjs --all` → `eds-batch-v2.mjs --publish`,
  then a full headless sweep. (Held for go-ahead — examples-first was the agreed checkpoint.)
- v2 home: reuse the POC marketing home under `/v2/` (decision 1) — to be PUT during the batch.
