/* doc-header — the consultation-document band that sits above the doc shell.
   One row, three cells: [eyebrow date, title, download link].
   Rebuilds a purple full-bleed band with an outlined Download-PDF button. */
const DOWNLOAD = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 3v12m0 0l-4-4m4 4l4-4" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" stroke-linecap="round"/></svg>';

export default function decorate(block) {
  const cells = [...(block.querySelector(':scope > div')?.children || [])];
  const eyebrow = (cells[0]?.textContent || '').trim();
  const title = (cells[1]?.textContent || '').trim();
  const a = cells[2]?.querySelector('a');
  const href = a ? a.getAttribute('href') : '';
  const label = a ? a.textContent.trim() : 'Download PDF';

  const dl = href
    ? `<a class="doc-header-dl" href="${href}" download>${DOWNLOAD}<span>${label}</span></a>`
    : '';

  block.className = 'doc-header';
  block.innerHTML = `<div class="wrap">${eyebrow ? `<p class="eyebrow">${eyebrow}</p>` : ''}<h1>${title}</h1>${dl}</div>`;
}
