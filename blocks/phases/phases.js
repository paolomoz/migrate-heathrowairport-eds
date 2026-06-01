/* phases — construction phasing. One row per phase:
   [id, year, title, mppa, body-paragraphs, maps(1+ images)]. */
export default function decorate(block) {
  const rows = [...block.querySelectorAll(':scope > div')];
  const out = rows.map((r) => {
    const c = [...r.children];
    const id = (c[0]?.textContent || '').trim();
    const yr = (c[1]?.textContent || '').trim();
    const title = (c[2]?.textContent || '').trim();
    const mppa = (c[3]?.textContent || '').trim();
    const body = c[4] ? c[4].innerHTML : '';
    const pics = [...(c[5]?.querySelectorAll('picture, img') || [])];
    const meta = `<span class="marker">${id}</span><div class="yr">${yr}</div><h2 style="margin-top:6px">${title}</h2>${mppa ? `<span class="mppa">${mppa}</span>` : ''}`;
    const text = `<div class="prose" style="margin-top:18px">${body}</div>`;
    const fig = (p) => { const img = p.tagName === 'IMG' ? p : p.querySelector('img'); const cap = img?.getAttribute('alt') || ''; return `<figure class="figure"><div class="figure-frame"><span class="figure-cap">${cap}</span>${p.outerHTML}</div></figure>`; };
    if (pics.length <= 1) {
      return `<div class="phase"><div>${meta}${text}</div><div>${pics[0] ? fig(pics[0]) : ''}</div></div>`;
    }
    return `<div class="phase phase--gallery" style="grid-template-columns:1fr"><div>${meta}${text}</div><div class="figure-gallery">${pics.map(fig).join('')}</div></div>`;
  }).join('');
  block.className = 'cmp';
  block.innerHTML = `<div class="wrap">${out}</div>`;
}
