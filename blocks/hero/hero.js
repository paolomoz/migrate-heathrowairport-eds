/* hero — eyebrow / h1 / lede over a background medium.
   Authoring rows (positional): 1 eyebrow · 2 h1 · 3 lede · 4 media.
   Media cell: an <a href="*.mp4" data-poster="…"> → looping background video;
   an <img> → background image; empty → solid purple hero. Built in JS so DA never
   has to carry a raw <video>/<img class="hero-media">. */

export default function decorate(block) {
  const rows = [...block.querySelectorAll(':scope > div')];
  const html = (r) => (rows[r]?.querySelector('div')?.innerHTML || '').trim();
  const cell = (r) => rows[r]?.querySelector('div');
  const eyebrow = html(0);
  const h1 = html(1);
  const lede = html(2);
  const media = cell(3);
  let mediaHTML = '';
  let solid = false;
  if (media) {
    const vid = media.querySelector('a[href$=".mp4"]');
    const img = media.querySelector('img');
    if (vid) {
      const poster = vid.getAttribute('data-poster') || '';
      mediaHTML = `<video class="hero-media" autoplay muted loop playsinline${poster ? ` poster="${poster}"` : ''}><source src="${vid.getAttribute('href')}" type="video/mp4"></video>`;
    } else if (img) {
      mediaHTML = `<img class="hero-media" src="${img.getAttribute('src')}" alt="${img.getAttribute('alt') || ''}">`;
    } else {
      solid = true;
    }
  } else {
    solid = true;
  }
  block.className = 'cmp cmp--hero';
  block.innerHTML = `<div class="hero${solid ? ' hero--solid' : ''}">${mediaHTML}<div class="wrap">${eyebrow ? `<p class="eyebrow">${eyebrow}</p>` : ''}<h1>${h1}</h1>${lede ? `<p>${lede}</p>` : ''}</div></div>`;
}
