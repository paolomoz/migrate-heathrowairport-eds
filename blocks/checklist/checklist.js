/* checklist — one authored cell: an optional heading (+ intro paragraph) followed by a
   <ul>/<ol> of items. The heading/intro go into a .section-head; the list becomes the
   tick-marked .checklist. Sits on the grey band by default (the consultation document
   always renders these on grey); add the `plain` variant for a white band.

   Single-cell, semantic authoring — the lead-in is a real <h2>, the items are real
   <li>s — rather than one table row per item. */
export default function decorate(block) {
  const cell = block.querySelector(':scope > div > div');
  const list = cell && cell.querySelector('ul, ol');
  const headEls = cell ? [...cell.children].filter((el) => el !== list) : [];

  const plain = block.classList.contains('plain');
  block.className = `cmp${plain ? '' : ' alt'}`;

  const wrap = document.createElement('div');
  wrap.className = 'wrap';
  if (headEls.length) {
    const head = document.createElement('div');
    head.className = 'section-head';
    headEls.forEach((el) => head.append(el));
    wrap.append(head);
  }
  if (list) {
    list.classList.add('checklist');
    wrap.append(list);
  }
  block.replaceChildren(wrap);
}
