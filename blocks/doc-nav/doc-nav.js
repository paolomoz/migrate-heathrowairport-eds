/* doc-nav — the sticky "Contents" rail for the document shell.
   Row 1: single cell = the rail title ("Contents").
   Item rows: [level, number, title, href, current]
     level   = "chapter" | "sub"
     current = "current" on the active page (else empty)
   The current chapter's subsections are emitted inline by the fill pipeline, so the
   rail shows the whole document with the active branch expanded. */
export default function decorate(block) {
  const rows = [...block.querySelectorAll(':scope > div')];
  let title = 'Contents';
  const items = [];

  rows.forEach((row) => {
    const cells = [...row.children];
    if (cells.length <= 1) {
      const t = (cells[0]?.textContent || '').trim();
      if (t) title = t;
      return;
    }
    const level = (cells[0]?.textContent || '').trim() || 'chapter';
    const number = (cells[1]?.textContent || '').trim();
    const label = (cells[2]?.textContent || '').trim();
    const a = cells[3]?.querySelector('a');
    const href = a ? a.getAttribute('href') : (cells[3]?.textContent || '').trim();
    const current = (cells[4]?.textContent || '').trim() === 'current';
    items.push({ level, number, label, href, current });
  });

  const lis = items.map((it) => {
    const cls = `doc-nav-item doc-nav-${it.level === 'sub' ? 'sub' : 'chapter'}${it.current ? ' is-current' : ''}`;
    const aria = it.current ? ' aria-current="page"' : '';
    return `<li class="${cls}"><a href="${it.href}"${aria}><span class="doc-nav-num">${it.number}</span><span class="doc-nav-label">${it.label}</span></a></li>`;
  }).join('');

  block.className = 'doc-nav';
  block.innerHTML = `<nav aria-label="${title}"><p class="doc-nav-title">${title}</p><ul>${lis}</ul></nav>`;
}
