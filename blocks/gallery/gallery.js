/* gallery — multiple figures in a grid. Rows: [image, caption]. */
export default function decorate(block) {
  const rows = [...block.querySelectorAll(':scope > div')];
  const alt = block.classList.contains('alt');
  const figs = rows.map((r) => {
    const c = [...r.children];
    const pic = c[0]?.querySelector('picture, img');
    const cap = (c[1]?.textContent || '').trim() || (c[0]?.querySelector('img')?.getAttribute('alt') || '');
    return `<figure class="figure"><div class="figure-frame"><span class="figure-cap">${cap}</span>${pic ? pic.outerHTML : ''}</div><figcaption>${cap} — illustrative.</figcaption></figure>`;
  }).join('');
  block.className = `cmp${alt ? ' alt' : ''}`;
  block.innerHTML = `<div class="wrap"><div class="figure-gallery">${figs}</div></div>`;
}
