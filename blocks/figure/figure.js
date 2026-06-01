/* figure — single illustration. Row 1: [image, caption]. Zoom badge injected globally. */
export default function decorate(block) {
  const c = [...(block.querySelector(':scope > div')?.children || [])];
  const pic = c[0]?.querySelector('picture, img');
  const cap = (c[1]?.textContent || '').trim() || (c[0]?.querySelector('img')?.getAttribute('alt') || '');
  const alt = block.classList.contains('alt');
  block.className = `cmp${alt ? ' alt' : ''}`;
  block.innerHTML = `<div class="wrap"><figure class="figure"><div class="figure-frame"><span class="figure-cap">${cap}</span>${pic ? pic.outerHTML : ''}</div><figcaption>${cap} — illustrative.</figcaption></figure></div>`;
}
