/* stats — value/label tiles. Rows: [value, label]. Variant alt. */
export default function decorate(block) {
  const rows = [...block.querySelectorAll(':scope > div')];
  const alt = block.classList.contains('alt');
  const items = rows.map((r) => {
    const c = [...r.children];
    return `<div class="stat"><div class="v">${(c[0]?.textContent || '').trim()}</div><div class="l">${(c[1]?.textContent || '').trim()}</div></div>`;
  }).join('');
  block.className = `cmp${alt ? ' alt' : ''}`;
  block.innerHTML = `<div class="wrap"><div class="stats">${items}</div></div>`;
}
