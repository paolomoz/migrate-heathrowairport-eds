/* split — prose beside a figure (detail intro) or a callout (landing pullquote).
   Row 1: [prose, right]. right with <img> → figure; else → "In short" callout. */
export default function decorate(block) {
  const cells = [...(block.querySelector(':scope > div')?.children || [])];
  const left = cells[0] ? cells[0].innerHTML : '';
  const right = cells[1];
  const alt = block.classList.contains('alt');
  let rightHTML = '';
  let cls = 'split';
  if (right) {
    const pic = right.querySelector('picture, img');
    if (pic) {
      const img = right.querySelector('img');
      const cap = img ? (img.getAttribute('alt') || '') : '';
      rightHTML = `<figure class="figure"><div class="figure-frame"><span class="figure-cap">${cap}</span>${pic.outerHTML}</div><figcaption>${cap} — illustrative.</figcaption></figure>`;
    } else if (right.textContent.trim()) {
      // .split--text-first only overrides the columns; it must keep .split (display:grid)
      cls = 'split split--text-first';
      rightHTML = `<div class="callout"><p class="eyebrow">In short</p><h3 style="font-weight:400;line-height:1.3">${right.textContent.trim()}</h3></div>`;
    }
  }
  block.className = `cmp${alt ? ' alt' : ''}`;
  block.innerHTML = `<div class="wrap"><div class="${cls}"><div class="prose">${left}</div><div>${rightHTML}</div></div></div>`;
}
