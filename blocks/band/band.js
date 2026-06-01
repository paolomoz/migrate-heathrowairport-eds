/* band — full-width purple CTA band. Rows: 1 eyebrow · 2 heading · 3 body · 4 link. */
export default function decorate(block) {
  const rows = [...block.querySelectorAll(':scope > div')];
  const txt = (r) => (rows[r]?.querySelector('div')?.textContent || '').trim();
  const a = rows[3]?.querySelector('a');
  const href = a ? a.getAttribute('href') : '#';
  const label = a ? a.textContent.trim() : 'Find out more';
  block.className = 'cmp';
  block.innerHTML = `<div class="band"><div class="wrap"><p class="eyebrow" style="color:#fff">${txt(0)}</p><h2>${txt(1)}</h2><p>${txt(2)}</p><a class="btn btn-ghost on-dark" href="${href}">${label}</a></div></div>`;
}
