/* section-bar — the thin bar at the top of the content column.
   One row: [section label, reading time]. Adds:
   - a working "Listen" control (Web Speech API reads the section's prose)
   - a fixed runway-lights reading-progress bar with a plane that "lands" at the end */
const HEADPHONES = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 14v-2a8 8 0 0116 0v2" stroke-linecap="round"/><rect x="2.5" y="14" width="4" height="6" rx="1.5"/><rect x="17.5" y="14" width="4" height="6" rx="1.5"/></svg>';
const PLANE = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M2 21l21-9L2 3v7l15 2-15 2z"/></svg>';

// the readable prose of the page (content blocks only — not chrome/nav/pager)
function readableText() {
  const root = document.querySelector('.doc-content') || document;
  const sel = '.hero--doc h1, .hero--doc p, .text, .callout, .groups, .checklist, .infobox, .stats, .profile, .docgrid, .phases';
  const seen = new Set();
  return [...root.querySelectorAll(sel)]
    .map((e) => e.innerText.trim())
    .filter((t) => t && !seen.has(t) && seen.add(t))
    .join('. ');
}

function setupListen(btn) {
  const synth = window.speechSynthesis;
  const label = btn.querySelector('span');
  if (!synth || typeof SpeechSynthesisUtterance === 'undefined') { btn.hidden = true; return; }
  const reset = () => { btn.classList.remove('is-playing'); btn.setAttribute('aria-pressed', 'false'); label.textContent = 'Listen'; };
  btn.setAttribute('aria-pressed', 'false');
  btn.addEventListener('click', () => {
    if (btn.classList.contains('is-playing')) { synth.cancel(); reset(); return; }
    const text = readableText();
    if (!text) return;
    synth.cancel();
    // chunk into sentences → short utterances, smooth stop, reliable end callback
    const chunks = text.match(/[^.!?]+[.!?]+|\S[^.!?]*$/g) || [text];
    chunks.forEach((c, i) => {
      const u = new SpeechSynthesisUtterance(c.trim());
      u.lang = 'en-GB'; u.rate = 1;
      if (i === chunks.length - 1) u.onend = reset;
      synth.speak(u);
    });
    btn.classList.add('is-playing'); btn.setAttribute('aria-pressed', 'true'); label.textContent = 'Stop';
  });
  window.addEventListener('pagehide', () => synth.cancel());
}

function setupRunway() {
  if (document.querySelector('.reading-runway')) return;
  const runway = document.createElement('div');
  runway.className = 'reading-runway';
  runway.setAttribute('aria-hidden', 'true');
  runway.innerHTML = `<div class="runway-track"></div><div class="runway-fill"></div><span class="runway-plane">${PLANE}</span>`;
  document.body.append(runway);
  const fill = runway.querySelector('.runway-fill');
  const plane = runway.querySelector('.runway-plane');
  let landed = false;
  let ticking = false;
  const update = () => {
    ticking = false;
    const content = document.querySelector('.doc-content');
    if (!content || !content.offsetHeight) return;
    // how much of the content area has scrolled into view, normalised by its height
    const top = content.getBoundingClientRect().top + window.scrollY;
    const seen = window.scrollY + window.innerHeight - top;
    const p = Math.max(0, Math.min(1, seen / content.offsetHeight));
    fill.style.width = `${p * 100}%`;
    plane.style.left = `${p * 100}%`;
    if (p >= 0.995 && !landed) { landed = true; runway.classList.add('landed'); }
    else if (p < 0.985 && landed) { landed = false; runway.classList.remove('landed'); }
  };
  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  window.addEventListener('load', onScroll);
  onScroll();
  setTimeout(onScroll, 600); // recompute once layout/images have settled
}

export default function decorate(block) {
  const cells = [...(block.querySelector(':scope > div')?.children || [])];
  const label = (cells[0]?.textContent || '').trim();
  const meta = (cells[1]?.textContent || '').trim();

  block.className = 'section-bar';
  block.innerHTML = '<div class="section-bar-inner">'
    + `<span class="section-bar-label">${label}</span>`
    + '<span class="section-bar-meta">'
      + (meta ? `<span class="section-bar-time">${meta}</span>` : '')
      + '<button type="button" class="section-bar-listen" aria-label="Listen to this section">' + HEADPHONES + '<span>Listen</span></button>'
    + '</span>'
    + '</div>';

  setupListen(block.querySelector('.section-bar-listen'));
  setupRunway();
}
