/* section-bar — the thin bar at the top of the content column.
   One row: [section label, reading time].  A visual "Listen" control is appended
   (audio not wired yet — see V2-NOTES). */
const HEADPHONES = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 14v-2a8 8 0 0116 0v2" stroke-linecap="round"/><rect x="2.5" y="14" width="4" height="6" rx="1.5"/><rect x="17.5" y="14" width="4" height="6" rx="1.5"/></svg>';

export default function decorate(block) {
  const cells = [...(block.querySelector(':scope > div')?.children || [])];
  const label = (cells[0]?.textContent || '').trim();
  const meta = (cells[1]?.textContent || '').trim();

  block.className = 'section-bar';
  block.innerHTML = `<div class="section-bar-inner">`
    + `<span class="section-bar-label">${label}</span>`
    + `<span class="section-bar-meta">`
      + (meta ? `<span class="section-bar-time">${meta}</span>` : '')
      + `<button type="button" class="section-bar-listen" aria-label="Listen to this section">${HEADPHONES}<span>Listen</span></button>`
    + `</span>`
    + `</div>`;
}
