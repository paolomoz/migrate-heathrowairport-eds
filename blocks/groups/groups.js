/* groups — grid of {title, body}. Rows: [title, body-paragraphs]. Variant alt. */
export default function decorate(block) {
  const rows = [...block.querySelectorAll(':scope > div')];
  const alt = block.classList.contains('alt');
  const items = rows.map((r) => {
    const c = [...r.children];
    return `<div class="group"><h3>${(c[0]?.textContent || '').trim()}</h3>${c[1] ? c[1].innerHTML : ''}</div>`;
  }).join('');
  block.className = `cmp${alt ? ' alt' : ''}`;
  block.innerHTML = `<div class="wrap"><div class="groups${rows.length > 3 ? ' two' : ''}">${items}</div></div>`;
}
