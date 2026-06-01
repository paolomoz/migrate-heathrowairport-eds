/* pager — Row 1: [prev-link, next-link]. */
export default function decorate(block) {
  const c = [...(block.querySelector(':scope > div')?.children || [])];
  const prev = c[0]?.querySelector('a');
  const next = c[1]?.querySelector('a');
  const prevHTML = prev ? `<a class="btn btn-ghost" href="${prev.getAttribute('href')}" style="flex-direction:row-reverse"><span style="transform:scaleX(-1);display:inline-block">→</span> ${prev.textContent.trim()}</a>` : '';
  const nextHTML = next ? `<a class="btn btn-primary" href="${next.getAttribute('href')}">${next.textContent.trim()}</a>` : '';
  block.className = 'cmp';
  block.innerHTML = `<div class="wrap"><div class="pager"><div>${prevHTML}</div><div>${nextHTML}</div></div></div>`;
}
