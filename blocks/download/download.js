/* download — brochure band. Rows: 1 eyebrow · 2 heading · 3 body · 4 link. */
export default function decorate(block) {
  const rows = [...block.querySelectorAll(':scope > div')];
  const txt = (r) => (rows[r]?.querySelector('div')?.textContent || '').trim();
  const a = rows[3]?.querySelector('a');
  const href = a ? a.getAttribute('href') : '#';
  const label = a ? a.textContent.trim() : 'Download';
  block.className = 'cmp';
  block.innerHTML = `<div class="download"><div class="wrap">
    <div><p class="eyebrow">${txt(0)}</p><h2>${txt(1)}</h2><p>${txt(2)}</p><a class="btn btn-primary" href="${href}">${label}</a></div>
    <div class="doc-art"><div class="doc"><div class="doc-top"><span class="k">June 2019</span><div class="t">Airport Expansion Consultation</div></div><span class="doc-tag"></span><div class="doc-line"></div><div class="doc-line"></div><div class="doc-line s"></div></div><div class="doc"><div class="doc-top"></div><div class="doc-line"></div><div class="doc-line s"></div></div></div>
  </div></div>`;
}
