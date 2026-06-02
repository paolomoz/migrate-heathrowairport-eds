/* newscard — "Latest updates" tall photo cards (matches heathrow.com/expansion).
   Row 1: [heading, View-All link]. Rows 2..N: [image, date, title, description, link].
   Each card = full-bleed image + bottom gradient + date / title / description / "See update". */
export default function decorate(block) {
  const rows = [...block.querySelectorAll(':scope > div')];
  const head = [...(rows[0]?.children || [])];
  const heading = (head[0]?.textContent || '').trim();
  const viewAll = head[1]?.querySelector('a');

  const cards = rows.slice(1).map((row) => {
    const c = [...row.children];
    const pic = c[0]?.querySelector('picture, img');
    const date = (c[1]?.textContent || '').trim();
    const title = (c[2]?.textContent || '').trim();
    const desc = (c[3]?.textContent || '').trim();
    const a = c[4]?.querySelector('a') || c[3]?.querySelector('a');
    const href = a ? a.getAttribute('href') : '#';
    const label = (a?.textContent || 'See update').trim();
    return `<a class="newscard" href="${href}">${pic ? pic.outerHTML : ''}<div class="meta"><span class="date">${date}</span><h3>${title}</h3>${desc ? `<p class="desc">${desc}</p>` : ''}<span class="more">${label}</span></div></a>`;
  }).join('');

  const viewAllHTML = viewAll
    ? `<a class="view-all" href="${viewAll.getAttribute('href')}">${viewAll.textContent.trim()}</a>`
    : '';
  block.className = 'cmp alt';
  block.innerHTML = `<div class="wrap"><div class="newscard-head"><h2>${heading}</h2>${viewAllHTML}</div><div class="cards three">${cards}</div></div>`;
}
