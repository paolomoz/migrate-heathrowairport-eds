/* Client-side search over the v2 consultation document. Opened from the header
   magnifier on /v2/ pages. Fetches the static index (built by eds-search-index-v2.mjs)
   on first open, then filters/ranks in the browser. No backend. */
let INDEX = null;
let overlay = null;
let lastFocus = null;

const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const escRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

async function loadIndex() {
  if (INDEX) return INDEX;
  const base = window.hlx?.codeBasePath || '';
  const res = await fetch(`${base}/blocks/header/search-index.json`);
  INDEX = res.ok ? await res.json() : [];
  // pre-lower the text once for fast matching
  INDEX.forEach((e) => { e.lc = `${e.title} ${e.label} ${e.text}`.toLowerCase(); });
  return INDEX;
}

function snippet(text, terms) {
  const lc = text.toLowerCase();
  let at = -1;
  for (const t of terms) { const i = lc.indexOf(t); if (i >= 0 && (at < 0 || i < at)) at = i; }
  if (at < 0) at = 0;
  const start = Math.max(0, at - 70);
  let frag = text.slice(start, start + 200).trim();
  if (start > 0) frag = `… ${frag}`;
  frag = esc(frag);
  terms.forEach((t) => { frag = frag.replace(new RegExp(`(${escRe(t)})`, 'gi'), '<mark>$1</mark>'); });
  return frag;
}

function rank(query) {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!terms.length) return [];
  const scored = INDEX.map((e) => {
    let score = 0; let allTerms = true;
    for (const t of terms) {
      const inTitle = e.title.toLowerCase().includes(t);
      const inLabel = e.label.toLowerCase().includes(t);
      const occ = e.lc.split(t).length - 1;
      if (!occ && !inTitle && !inLabel) allTerms = false;
      score += (inTitle ? 12 : 0) + (inLabel ? 4 : 0) + occ;
    }
    return { e, score, allTerms };
  }).filter((r) => r.score > 0);
  // prefer entries containing every term; fall back to any-term matches
  const strict = scored.filter((r) => r.allTerms);
  return (strict.length ? strict : scored).sort((a, b) => b.score - a.score).slice(0, 12);
}

function render(query) {
  const list = overlay.querySelector('.doc-search-results');
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  const results = rank(query);
  overlay.querySelector('.doc-search-status').textContent = query.trim()
    ? `${results.length} result${results.length === 1 ? '' : 's'}` : '';
  list.innerHTML = results.map((r, i) => `
    <li>
      <a href="${r.e.path}" class="doc-search-hit${i === 0 ? ' is-active' : ''}">
        <span class="doc-search-hit-label">${esc(r.e.label)}</span>
        <span class="doc-search-hit-title">${esc(r.e.title)}</span>
        <span class="doc-search-hit-snip">${snippet(r.e.text, terms)}</span>
      </a>
    </li>`).join('');
  if (query.trim() && !results.length) list.innerHTML = '<li class="doc-search-empty">No matches in the consultation document.</li>';
}

function move(dir) {
  const hits = [...overlay.querySelectorAll('.doc-search-hit')];
  if (!hits.length) return;
  let i = hits.findIndex((h) => h.classList.contains('is-active'));
  hits[i]?.classList.remove('is-active');
  i = (i + dir + hits.length) % hits.length;
  hits[i].classList.add('is-active');
  hits[i].scrollIntoView({ block: 'nearest' });
}

function close() {
  overlay.classList.remove('open');
  document.body.style.overflow = '';
  if (lastFocus) lastFocus.focus();
}

function build() {
  overlay = document.createElement('div');
  overlay.className = 'doc-search';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Search the consultation document');
  overlay.innerHTML = `
    <div class="doc-search-backdrop"></div>
    <div class="doc-search-panel">
      <div class="doc-search-bar">
        <input type="text" class="doc-search-input" placeholder="Search the consultation document…" autocomplete="off" spellcheck="false" aria-label="Search">
        <button type="button" class="doc-search-close" aria-label="Close search">&times;</button>
      </div>
      <p class="doc-search-status" aria-live="polite"></p>
      <ul class="doc-search-results"></ul>
    </div>`;
  document.body.append(overlay);

  const input = overlay.querySelector('.doc-search-input');
  let t;
  input.addEventListener('input', () => { clearTimeout(t); t = setTimeout(() => render(input.value), 120); });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); move(1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
    else if (e.key === 'Enter') { const a = overlay.querySelector('.doc-search-hit.is-active'); if (a) window.location.href = a.getAttribute('href'); }
  });
  overlay.querySelector('.doc-search-close').addEventListener('click', close);
  overlay.querySelector('.doc-search-backdrop').addEventListener('click', close);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && overlay.classList.contains('open')) close(); });
}

export default async function openSearch() {
  if (!overlay) build();
  lastFocus = document.activeElement;
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  const input = overlay.querySelector('.doc-search-input');
  input.focus();
  input.select();
  await loadIndex();
}
