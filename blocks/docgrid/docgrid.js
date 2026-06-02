/* docgrid — the "consultation library" document index: an eyebrow + title, then a grid
   of grouped link lists. Row 1: [eyebrow, title]. Rows 2..N: one cell per group, each an
   <h3> heading followed by <a> document links (authored as semantic HTML in a single
   cell — no per-link table row). Grey band. */
export default function decorate(block) {
  const rows = [...block.querySelectorAll(':scope > div')];
  const head = [...(rows[0]?.children || [])];
  const eyebrow = (head[0]?.textContent || '').trim();
  const title = (head[1]?.textContent || '').trim();

  block.className = 'cmp alt';
  const wrap = document.createElement('div');
  wrap.className = 'wrap';
  wrap.innerHTML = `<div class="section-head">${eyebrow ? `<p class="eyebrow">${eyebrow}</p>` : ''}${title ? `<h2>${title}</h2>` : ''}</div><div class="docgrid"></div>`;
  const grid = wrap.querySelector('.docgrid');
  rows.slice(1).forEach((r) => {
    const c = r.querySelector('div');
    if (!c) return;
    const group = document.createElement('div');
    group.className = 'docgroup';
    while (c.firstChild) group.append(c.firstChild);
    grid.append(group);
  });
  block.replaceChildren(wrap);
}
