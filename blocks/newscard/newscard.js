/* newscard — "Latest updates" dark photo cards. alt substrate.
   Row 1: [eyebrow, heading]. Rows 2..N: [image, date, title, link]. */
export default function decorate(block) {
  const rows = [...block.querySelectorAll(':scope > div')];
  const head = [...(rows[0]?.children || [])];
  const eyebrow = (head[0]?.textContent || '').trim();
  const heading = (head[1]?.textContent || '').trim();
  const cards = rows.slice(1).map((row) => {
    const c = [...row.children];
    const pic = c[0]?.querySelector('picture, img');
    const date = (c[1]?.textContent || '').trim();
    const title = (c[2]?.textContent || '').trim();
    const a = c[3]?.querySelector('a');
    const href = a ? a.getAttribute('href') : '#';
    return `<a class="newscard" href="${href}">${pic ? pic.outerHTML : ''}<div class="meta"><span class="date">${date}</span><h3>${title}</h3><span class="more" style="margin-top:10px;font-family:var(--sans-med);font-weight:500">Read more →</span></div></a>`;
  }).join('');
  block.className = 'cmp alt';
  block.innerHTML = `<div class="wrap"><div class="section-head"><p class="eyebrow">${eyebrow}</p><h2>${heading}</h2></div><div class="cards three">${cards}</div></div>`;
}
