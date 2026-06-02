/* checklist — one authored cell: an optional heading (+ intro paragraph) followed by a
   <ul>/<ol> of items. The heading/intro go into a .section-head; the list becomes the
   tick-marked .checklist. Sits on the grey band by default (the consultation document
   always renders these on grey); add the `plain` variant for a white band.

   Single-cell, semantic authoring — the lead-in is a real <h2>, the items are real
   <li>s — rather than one table row per item. */
export default function decorate(block) {
  const cell = block.querySelector(':scope > div > div');
  let list = cell && cell.querySelector('ul, ol');
  let headEls = [];

  if (list) {
    // preferred single-cell form: heading(s) + a <ul>
    headEls = [...cell.children].filter((el) => el !== list);
  } else {
    // legacy form: row 1 = [title, intro], rows 2..N = one item per row
    const rows = [...block.querySelectorAll(':scope > div')];
    const head = [...(rows[0]?.children || [])];
    const title = (head[0]?.textContent || '').trim();
    const intro = (head[1]?.textContent || '').trim();
    if (title) { const h = document.createElement('h2'); h.textContent = title; headEls.push(h); }
    if (intro) { const h = document.createElement('h2'); h.textContent = intro; headEls.push(h); }
    list = document.createElement('ul');
    rows.slice(1).forEach((r) => {
      const c = r.querySelector('div');
      const li = document.createElement('li');
      li.innerHTML = (c?.innerHTML || '').trim();
      list.append(li);
    });
  }

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
  if (list && list.children.length) {
    list.classList.add('checklist');
    wrap.append(list);
  }
  block.replaceChildren(wrap);
}
