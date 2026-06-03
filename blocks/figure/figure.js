/* figure — single illustration. Row 1: [image, caption]. Zoom badge injected globally.
   `map` variant (v2 doc shell): overlaid title chip + a "View interactive map →" CTA;
   the frame stays click-to-lightbox (handled site-wide), so the CTA opens the zoom. */
export default function decorate(block) {
  const c = [...(block.querySelector(':scope > div')?.children || [])];
  const pic = c[0]?.querySelector('picture, img');
  const cap = (c[1]?.textContent || '').trim() || (c[0]?.querySelector('img')?.getAttribute('alt') || '');
  const alt = block.classList.contains('alt');
  const isMap = block.classList.contains('map');
  block.className = `cmp${alt ? ' alt' : ''}`;
  if (isMap) {
    block.innerHTML = `<div class="wrap"><figure class="figure figure--map"><div class="figure-frame"><div class="figure-map-overlay"><span class="figure-map-title">${cap}</span><span class="figure-map-cta">View interactive map <span aria-hidden="true">→</span></span></div>${pic ? pic.outerHTML : ''}</div></figure></div>`;
    return;
  }
  block.innerHTML = `<div class="wrap"><figure class="figure"><div class="figure-frame"><span class="figure-cap">${cap}</span>${pic ? pic.outerHTML : ''}</div><figcaption>${cap} — illustrative.</figcaption></figure></div>`;
}
