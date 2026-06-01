/* breadcrumb — one row, each cell a crumb (link or text); last = current. */
export default function decorate(block) {
  const cells = [...(block.querySelector(':scope > div')?.children || [])];
  const html = cells.map((c, i) => {
    const last = i === cells.length - 1;
    const t = c.textContent.trim();
    if (last) return `<span class="current" aria-current="page">${t}</span>`;
    const a = c.querySelector('a');
    return `<a href="${a ? a.getAttribute('href') : '#'}">${t}</a><span class="sep">/</span>`;
  }).join('');
  block.className = 'breadcrumb';
  block.innerHTML = `<div class="wrap-wide">${html}</div>`;
}
