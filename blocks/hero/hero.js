/* hero — a heading band over a background medium.
   Authoring (natural, "copy-paste from HTML"): one cell of rich text (an eyebrow
   paragraph, an <h1>, and a lede paragraph) plus one cell holding the background
   medium — an <img>/<picture>, or an <a href="*.mp4" data-poster="…"> for a looping
   video. Order-independent: the media cell is whichever cell carries a picture/img/mp4
   link and no heading; every other cell is treated as text.

   The block PRESERVES the authored semantic elements (h1/p/strong) rather than
   rebuilding them from bare strings — so it renders correctly whether the cell was
   produced by the fill pipeline or hand-authored in DA, and never double-wraps a
   <p> inside another <p>. */
export default function decorate(block) {
  // v2 doc shell: the hero sits *inside* the content column with title + lead
  // overlaid on the image (not a full-bleed band). Additive — default path unchanged.
  const isDoc = block.classList.contains('doc');
  const cells = [...block.querySelectorAll(':scope > div > div')];

  // classify cells: the media cell holds a picture/img/mp4 link and no heading
  let mediaCell = null;
  const textCells = [];
  cells.forEach((c) => {
    const hasHeading = c.querySelector('h1, h2, h3');
    const isMedia = !hasHeading && (c.querySelector('a[href$=".mp4"]') || c.querySelector('picture, img'));
    if (isMedia && !mediaCell) mediaCell = c;
    else textCells.push(c);
  });

  // build / reuse the background medium
  let mediaEl = null;
  if (mediaCell) {
    const vid = mediaCell.querySelector('a[href$=".mp4"]');
    if (vid) {
      const video = document.createElement('video');
      video.className = 'hero-media';
      video.autoplay = true; video.muted = true; video.loop = true; video.playsInline = true;
      const poster = vid.getAttribute('data-poster');
      if (poster) video.poster = poster;
      const src = document.createElement('source');
      src.src = vid.getAttribute('href'); src.type = 'video/mp4';
      video.append(src);
      mediaEl = video;
    } else {
      // reuse the EDS-optimized <picture> (or <img>) node so its srcset survives
      mediaEl = mediaCell.querySelector('picture') || mediaCell.querySelector('img');
      if (mediaEl) {
        mediaEl.classList.add('hero-media');
        // the hero image is the LCP — load it eagerly, not lazily
        const innerImg = mediaEl.tagName === 'IMG' ? mediaEl : mediaEl.querySelector('img');
        if (innerImg) innerImg.loading = 'eager';
      }
    }
  }

  // collect text
  const wrap = document.createElement('div');
  wrap.className = 'wrap';
  const hasHeading = textCells.some((c) => c.querySelector('h1, h2, h3'));
  if (hasHeading) {
    // preferred: preserve authored elements (eyebrow <p> / <h1> / lede <p>)
    textCells.forEach((c) => { while (c.firstChild) wrap.append(c.firstChild); });
    const kids = [...wrap.children];
    const h1i = kids.findIndex((e) => e.tagName === 'H1');
    const eyebrow = kids.find((e, i) => e.tagName === 'P' && (h1i < 0 || i < h1i));
    if (eyebrow) eyebrow.classList.add('eyebrow');
  } else {
    // legacy positional cells: [eyebrow, h1, lede] as bare text
    const t = (c) => (c ? c.textContent.trim() : '');
    wrap.innerHTML = `${t(textCells[0]) ? `<p class="eyebrow">${t(textCells[0])}</p>` : ''}<h1>${t(textCells[1])}</h1>${t(textCells[2]) ? `<p>${t(textCells[2])}</p>` : ''}`;
  }

  const hero = document.createElement('div');
  hero.className = `hero${isDoc ? ' hero--doc' : ''}${mediaEl ? '' : ' hero--solid'}`;
  if (mediaEl) hero.append(mediaEl);
  hero.append(wrap);

  // doc variant renders in-column (no full-bleed .cmp band)
  block.className = isDoc ? 'hero-doc' : 'cmp cmp--hero';
  block.replaceChildren(hero);
}
