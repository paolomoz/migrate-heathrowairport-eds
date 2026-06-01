/* callout — sidebar/aside. Rows: [title, body]. >1 row → aside-grid. Variant alt. */
export default function decorate(block) {
  const rows = [...block.querySelectorAll(':scope > div')];
  const alt = block.classList.contains('alt');
  const items = rows.map((r) => {
    const c = [...r.children];
    return `<div class="callout"><p class="eyebrow">${(c[0]?.textContent || '').trim()}</p>${c[1] ? c[1].innerHTML : ''}</div>`;
  }).join('');
  block.className = `cmp${alt ? ' alt' : ''}`;
  block.innerHTML = `<div class="wrap">${rows.length > 1 ? `<div class="aside-grid two">${items}</div>` : items}</div>`;
}
