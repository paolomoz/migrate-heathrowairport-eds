/* checklist — Row 1: [title, intro]. Rows 2..N: list items. Variant alt. */
export default function decorate(block) {
  const rows = [...block.querySelectorAll(':scope > div')];
  const head = [...(rows[0]?.children || [])];
  const title = (head[0]?.textContent || '').trim();
  const intro = (head[1]?.textContent || '').trim();
  const items = rows.slice(1).map((r) => `<li>${(r.querySelector('div')?.innerHTML || '').trim()}</li>`).join('');
  const alt = block.classList.contains('alt');
  block.className = `cmp${alt ? ' alt' : ''}`;
  block.innerHTML = `<div class="wrap"><div class="section-head">${title ? `<h2>${title}</h2>` : ''}${intro ? `<p>${intro}</p>` : ''}</div><ul class="checklist" style="max-width:84ch">${items}</ul></div>`;
}
