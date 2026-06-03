/* doc-nav — the sticky "Contents" rail for the document shell.
   The whole document tree is authored ONCE in /blocks/doc-nav/nav-tree.json (built by
   tools/eds-nav-tree-v2.mjs); this block fetches it and renders the rail, expanding the
   current chapter and highlighting the current page from the URL. The page content only
   carries an empty doc-nav marker — the tree is never duplicated per page. */

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// collapse the doc-body's other blocks into one .doc-content column → the grid has
// exactly two children (sticky rail | content); done synchronously to avoid layout shift
function wrapContent(block) {
  const section = block.closest('.section');
  const navWrapper = block.parentElement;
  if (!section || !navWrapper || section.querySelector(':scope > .doc-content')) return;
  const content = document.createElement('div');
  content.className = 'doc-content';
  [...section.children].forEach((child) => {
    if (child !== navWrapper && !child.classList.contains('section-metadata')) content.append(child);
  });
  navWrapper.after(content);
}

function currentFromPath() {
  const m = window.location.pathname.replace(/\/+$/, '').match(/^\/v2\/([^/]+)(?:\/([^/]+))?/);
  return { slug: m?.[1] || '', sub: m?.[2] || '' };
}

function buildNav(tree, cur) {
  const items = [];
  tree.forEach((ch) => {
    const chapterCurrent = ch.slug === cur.slug && !cur.sub;
    items.push(`<li class="doc-nav-item doc-nav-chapter${chapterCurrent ? ' is-current' : ''}">`
      + `<a href="/v2/${ch.slug}"${chapterCurrent ? ' aria-current="page"' : ''}>`
      + `<span class="doc-nav-num">${esc(String(ch.n).padStart(2, '0'))}</span>`
      + `<span class="doc-nav-label">${esc(ch.title)}</span></a></li>`);
    if (ch.slug === cur.slug) {
      ch.subs.forEach((sb) => {
        const subCurrent = sb.slug === cur.sub;
        items.push(`<li class="doc-nav-item doc-nav-sub${subCurrent ? ' is-current' : ''}">`
          + `<a href="/v2/${ch.slug}/${sb.slug}"${subCurrent ? ' aria-current="page"' : ''}>`
          + `<span class="doc-nav-num">${esc(sb.number)}</span>`
          + `<span class="doc-nav-label">${esc(sb.title)}</span></a></li>`);
      });
    }
  });
  return `<nav aria-label="Contents"><p class="doc-nav-title">Contents</p><ul>${items.join('')}</ul></nav>`;
}

export default async function decorate(block) {
  wrapContent(block);
  block.className = 'doc-nav';
  block.innerHTML = '<nav aria-label="Contents"><p class="doc-nav-title">Contents</p></nav>';
  try {
    const base = window.hlx?.codeBasePath || '';
    const tree = await (await fetch(`${base}/blocks/doc-nav/nav-tree.json`)).json();
    block.innerHTML = buildNav(tree, currentFromPath());
  } catch (e) {
    // leave the "Contents" title if the tree can't be fetched
  }
}
