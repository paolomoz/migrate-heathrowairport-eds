/* infobox — "For more information" linked references. Rows: each a ref (cell). */
export default function decorate(block) {
  const rows = [...block.querySelectorAll(':scope > div')];
  const items = rows.map((r) => {
    const c = r.querySelector('div');
    return `<div class="infobox"><span class="i">i</span><p>${c ? c.innerHTML : ''}</p></div>`;
  }).join('');
  block.className = 'cmp alt';
  block.innerHTML = `<div class="wrap"><div class="section-head" style="margin-bottom:18px"><p class="eyebrow">For more information</p></div>${items}</div>`;
}
