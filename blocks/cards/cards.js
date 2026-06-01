/* cards — section/subsection navigation grid. alt substrate.
   Row 1: [eyebrow, heading]. Rows 2..N: [image, kicker, title, desc, link]. */
export default function decorate(block) {
  const rows = [...block.querySelectorAll(':scope > div')];
  const head = [...(rows[0]?.children || [])];
  const eyebrow = (head[0]?.textContent || '').trim();
  const heading = (head[1]?.textContent || '').trim();
  const cards = rows.slice(1).map((row) => {
    const c = [...row.children];
    const pic = c[0]?.querySelector('picture, img');
    const kicker = (c[1]?.textContent || '').trim();
    const title = (c[2]?.textContent || '').trim();
    const desc = (c[3]?.textContent || '').trim();
    const a = c[4]?.querySelector('a');
    const href = a ? a.getAttribute('href') : '#';
    return `<a class="card card--nav" href="${href}"><div class="card-fig">${pic ? pic.outerHTML : ''}</div><div class="card-body">${kicker ? `<span class="num">${kicker}</span>` : ''}<h3>${title}</h3><p>${desc}</p><span class="more">Explore this section</span></div></a>`;
  }).join('');
  block.className = 'cmp alt';
  block.innerHTML = `<div class="wrap"><div class="section-head"><p class="eyebrow">${eyebrow}</p><h2>${heading}</h2></div><div class="cards">${cards}</div></div>`;
}
