# V2 Design Delta — Heathrow Expansion consultation as a *document shell*

Phase-1 analysis of the client wireframes (Figma file *Heathrow Expansion — HTML PDFs*,
page **"Wireframe examples"**) and the per-page-type diff against the current POC.

**Guiding principle (confirmed with client): v2 is a LAYOUT / IA change, NOT a restyle.**
Every design token — palette (`--primary #462170`, `--primary-deep #2B0B50`, `--accent #FFD000`,
`--mist #F4F4F6`, `--border #DADEE1`), the Hanken Grotesk type substitute, the type ramp, the
8px spacing grid, brand chrome (header/footer) — carries over **verbatim** from the POC. The
Figma even references the licensed original `FrutigerNext LT`; we keep our Hanken Grotesk stand-in.
Nothing about colour, font, or component *skin* changes. What changes is **how pages are
assembled**: a two-column document shell with a persistent contents rail, a consultation-document
header band, and a PDF→HTML content mapping per page type.

---

## 1. Source material inventory

| Asset | Where | Use |
|---|---|---|
| Wireframes | Figma `XkMQqMK3lb0xkYlxxfo7II`, page "Wireframe examples" | layout templates (6 examples) |
| Source PDF | `assets/heathrow-expansion-consultation-2019.pdf` (110pp master book) | structure-of-record for the PDF→HTML mapping |
| Verbatim content | source repo `content/section*.json` (+ `-figures/-legends`) | already extracted in the POC; reused as-is |
| Section/subsection tree | `content/sections.json` (14 chapters) + each section's `ia.pages[]` | drives the Contents rail |

### The 6 Figma examples (each = an HTML wireframe paired with its source PDF page[s])

| Figma frame | Maps to content | PDF pp | Page type |
|---|---|---|---|
| `1.0 Forward` (0:3796) | `section1` foreword | 5 | **foreword-style detail** |
| `3.1 Airfield` (0:3234) | `section3/airfield` | 16–17 | **section detail** |
| `3.2 Terminals…` (0:3518) | `section3/terminals-satellites-aprons` | 18–19 | section detail |
| `3.3 Roads and rail` (0:3937) | `section3/roads-and-rail` | 20–21 | section detail (2 maps) |
| `3.4 Active travel` (0:4450) | `section3/active-travel` | 22–23 | section detail |
| `3.5 Water environment` (0:4605) | `section3/water-environment` | 24–25 | section detail |

The wireframes cover **two** page types explicitly (foreword + section-detail). **Home** and
**section-landing** are not in the Figma — their layouts are *inferred* from the same shell (see §5).

---

## 2. The v2 document shell (new global layout — shared by every page type)

```
┌──────────────────────────────────────────────────────────────┐
│  NAV  (brand header — REUSED from POC, unchanged)              │
├──────────────────────────────────────────────────────────────┤
│  DOC-HEADER BAND  (purple) — NEW                               │
│    eyebrow: "June 2026"                                        │
│    H1: "Consultation document"                                 │
│    [⬇ Download PDF]  (outlined button → the 110pp PDF)         │
├───────────────┬──────────────────────────────────────────────┤
│ CONTENTS RAIL │  CONTENT COLUMN                                │
│  (sticky,     │   ┌────────────────────────────────────────┐  │
│   290px) NEW  │   │ SECTION BAR — NEW                        │  │
│               │   │  "Section 3.1 · Airfield"   ~3 min · 🔊 │  │
│  01 Forward   │   ├────────────────────────────────────────┤  │
│  02 Intro     │   │ SECTION HERO (image + overlaid title +   │  │
│ ▸03 Preferred │   │  overlaid lead) — hero variant           │  │
│    3.1 Airfld◀│   ├────────────────────────────────────────┤  │
│    3.2 …      │   │ PROSE  /  definition callout  /  map     │  │
│    …          │   │ figure  /  checklist  /  profile  …      │  │
│  04 Construct │   ├────────────────────────────────────────┤  │
│  …            │   │ PAGER  ‹ Prev      Next 2.0 Intro ›      │  │
│  14 Questions │   └────────────────────────────────────────┘  │
├───────────────┴──────────────────────────────────────────────┤
│  "HAVE YOUR SAY" promo band  (REUSED `band`)                   │
├──────────────────────────────────────────────────────────────┤
│  FOOTER  (REUSED from POC, unchanged)                          │
└──────────────────────────────────────────────────────────────┘
```

Measurements lifted from Figma (1440 frame): content container left-offset `x=103`; contents rail
`290px`, `gap 8px`, `py 20px`; content column `~1023px`; section hero image `1023×576` (~16:9);
8px grid (`size-01=8, size-02=16, size-08=64, size-15=120`). These slot into the POC's existing
`--maxw:1279px` container model.

---

## 3. Component inventory — reuse / modify / new

### REUSE as-is (no change)
- **`header`**, **`footer`** — brand chrome is identical in the wireframes.
- **`band`** — the "Have your say / Give feedback" promo band (eyebrow + title + button).
- **`text`**, **`checklist`** — body prose and the "What is this consultation about?" bullet list.
- **`callout`**, **`infobox`** — the "Want more information? · Jump to section →" grey jump-box.
- **`figure` / `gallery` / `legend`** — standard (non-interactive) figures keep working.
- Tokens, type ramp, `styles.css` design canon — unchanged.

### MODIFY (add a v2 variant, scoped — never touch the POC default path)
- **`hero` → `hero--doc` variant.** Image background with the **title AND a lead paragraph
  overlaid** on a bottom gradient, sized to sit *inside* the content column (not full-bleed).
  POC hero already does image-bg + overlaid title; the delta is the overlaid lead + in-column sizing.
- **`figure` → `figure--map` variant.** Annotated map with an **overlaid title chip** and a
  **"View interactive map →"** CTA button (the PDF's full-page annotated maps). Builds on the
  existing figure/lightbox.
- **`pager` → doc styling.** Boxed Prev / Next with section number + title + arrow
  (`Next · 2.0 Introduction →`). Visual scope only, under the doc shell.

### NEW blocks
- **`doc-header`** — the purple consultation-document band (eyebrow date · H1 · Download-PDF button).
  Global, top of every v2 page.
- **`doc-nav`** (the Contents rail) — sticky document outline: 14 chapters, the current chapter's
  subsections expanded, current page highlighted. **Data model:** authored ONCE as a fragment at
  `/v2/nav`, fetched by the block (mirrors how EDS `header`/`footer` fetch `/nav`,`/footer`); the
  block marks `aria-current` + auto-expands the active branch from the page path — so the tree is
  not duplicated across 62 pages.
- **`section-bar`** — "Section N.N · Title", a reading-time estimate, and a **Listen** control
  (see open question Q3 for TTS vs. visual-only).
- **`profile`** — author signature card (photo + name + role); foreword uses
  `signature: {name:"John Holland-Kaye", role:"Chief Executive, Heathrow"}`.

### Layout scaffolding (CSS, not a block)
- **`doc-shell`** — the two-column grid (sticky `doc-nav` left + content right) + the doc-header
  full-bleed treatment. Applied via a **page-level `template: doc` metadata → `body.doc-v2`**
  class, so the grid only affects `/v2/` pages and the POC `main` is untouched. All v2 CSS lives in
  a new `styles/v2.css` (or a guarded block) gated under `.doc-v2` — **zero bytes of the POC CSS
  path change.**

---

## 4. PDF → HTML structure mapping (the core deliverable)

Derived from the Airfield (p16–17) and Foreword (p5) pairs; generalises to all detail pages.

| PDF print structure | → HTML page structure |
|---|---|
| Pink vertical **section tab** ("Section 1", "3. Our Preferred Masterplan") | **Contents rail** active state + **section bar** label |
| Section number + title + lead, top-left of spread | **Section hero**: title + lead **overlaid** on the hero image |
| Full-bleed **illustrative render** / caption chip ("Illustrative visualisation…") | Hero background image (chip → caption / alt text) |
| Multi-column **body text** | Single-column **prose** (`text` block, `--measure` width) |
| Boxed **definition** w/ 🔍 ("What are taxiways?") | Grey **definition callout** (image + heading + text) — `infobox`/`callout` |
| Full-page **annotated map** (labels, Key, dimensions) | **`figure--map`**: map image + title chip + "View interactive map →" |
| "What is this consultation about?" bulleted list | **`checklist`** |
| Author photo + name + title (foreword) | **`profile`** card |
| Page-foot continuation / next-section pointer | **`pager`** (Prev / Next) |
| Running footer "Page N" / book furniture | dropped (web has no pagination) |

---

## 5. Per-page-type diff (current POC vs v2)

### A. Detail page (e.g. `/v2/preferred-masterplan/airfield`) — *fully specified by wireframes*
- **Current POC:** breadcrumb → hero (full-bleed) → content blocks → pager. No persistent outline.
- **v2:** doc-header band → **doc-shell**(sticky `doc-nav` + content) → section-bar → `hero--doc`
  (in-column, overlaid lead) → prose/definition/`figure--map`/checklist → doc `pager` → have-your-say
  band. Breadcrumb is replaced by the contents rail + section bar.

### B. Foreword (`/v2/foreword`) — *fully specified by wireframes*
- Same shell as A; content = lead + prose + **`profile`** (John Holland-Kaye) + pager. No map/definition.

### C. Section landing (`/v2/<section>`) — *inferred (not in Figma)*
- Same shell; content column = chapter intro (lede + body) + a list/cards of its subsections (the
  POC landing content already exists). Proposed, pending sign-off.

### D. Home (`/v2/`) — *inferred (not in Figma)*
- **Proposal:** a document **cover/landing** in the same shell — doc-header band + contents rail +
  a cover hero ("The UK's Gateway to Growth") + "what's in this consultation" + have-your-say.
  Alternative: reuse the POC marketing home unchanged under `/v2/`. **Needs sign-off (Q1).**

---

## 6. Decisions (signed off — Phase 2)
1. **Home** — **reuse the POC marketing home under `/v2/`** (no doc-cover). The doc shell applies
   to foreword / landing / detail pages, not the root.
2. **Scope** — **wireframed examples first**: ship the shell + foreword + the five §3 details
   (airfield, terminals-satellites-aprons, roads-and-rail, active-travel, water-environment),
   validate against Figma, then batch the remaining ~56 pages.
3. **"Listen" control** — **visual-only** for now (matches the wireframe; TTS deferred).
4. **"View interactive map →"** — **opens the existing figure lightbox/zoom**.

---

## 7. Isolation guarantees
- Code on branch **`v2`** only; new blocks have new names; modified blocks gain a **variant**
  (POC default path byte-unchanged); all v2 CSS gated under `.doc-v2` in a new file.
- Content under DA prefix **`/v2/`** only; nav fragment at `/v2/nav`.
- Working URL: `https://v2--migrate-heathrowairport-eds--paolomoz.aem.page/v2/`.
