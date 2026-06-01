/* text — prose band. One cell of paragraphs. Variant `alt` → grey. */
export default function decorate(block) {
  const cell = block.querySelector(':scope > div > div');
  const alt = block.classList.contains('alt');
  block.className = `cmp${alt ? ' alt' : ''}`;
  block.innerHTML = `<div class="wrap"><div class="prose">${cell ? cell.innerHTML : ''}</div></div>`;
}
