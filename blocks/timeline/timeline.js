/* timeline — Row 1: [eyebrow, title]. Rows 2..N: [year, title, body]. */
export default function decorate(block) {
  const rows = [...block.querySelectorAll(':scope > div')];
  const head = [...(rows[0]?.children || [])];
  const eyebrow = (head[0]?.textContent || '').trim();
  const title = (head[1]?.textContent || '').trim();
  const events = rows.slice(1).map((r) => {
    const c = [...r.children];
    const yr = (c[0]?.textContent || '').trim();
    const t = (c[1]?.textContent || '').trim();
    const body = (c[2]?.textContent || '').trim();
    return `<li><div class="yr">${yr}</div><p class="t">${t}</p>${body ? `<p class="t" style="color:var(--muted)">${body}</p>` : ''}</li>`;
  }).join('');
  block.className = 'cmp';
  block.innerHTML = `<div class="wrap"><div class="section-head"><p class="eyebrow">${eyebrow}</p><h2>${title}</h2></div><ol class="timeline" style="max-width:80ch">${events}</ol></div>`;
}
