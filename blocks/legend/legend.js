/* legend — map Key. Rows: [label, swatch-type(fill|outline|stockpile|line|abbr), abbr?]. */
export default function decorate(block) {
  const rows = [...block.querySelectorAll(':scope > div')];
  const items = rows.map((r) => {
    const c = [...r.children];
    const label = (c[0]?.textContent || '').trim();
    const type = (c[1]?.textContent || 'fill').trim();
    const abbr = (c[2]?.textContent || '').trim();
    const mark = type === 'abbr' ? `<span class="sw-abbr">${abbr}</span>` : `<span class="sw sw--${type}"></span>`;
    return `<li>${mark}<span>${label}</span></li>`;
  }).join('');
  block.className = 'cmp';
  block.innerHTML = `<div class="wrap"><div class="legend"><p class="legend-head">Key</p><ul>${items}</ul></div></div>`;
}
