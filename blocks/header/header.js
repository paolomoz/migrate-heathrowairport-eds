// Heathrow Expansion brand chrome — site-wide header (ported from stardust _lib/chrome.mjs).
// Static brand chrome (not per-page authored), so the markup is built here directly.

const NAV = [
  ['About Heathrow expansion', '/'],
  ['Local community', '/'],
  ['Our proposal', '/'],
  ['Latest news', '/'],
  ['Contact us', '/have-your-say'],
];
const SEARCH = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3" stroke-linecap="round"/></svg>';

export default async function decorate(block) {
  block.textContent = '';
  const header = document.createElement('div');
  header.className = 'site-header';
  header.innerHTML = `<div class="wrap-wide base-header">
    <a class="logo-link" href="/"><img class="white-logo" src="/icons/logo.png" alt="Heathrow Expansion" height="48"><img class="dark-logo" src="/icons/dark-logo.png" alt="Heathrow Expansion" height="48"></a>
    <button class="nav-toggle" aria-label="Menu">Menu</button>
    <nav class="site-nav" id="nav">${NAV.map(([l, h]) => `<a href="${h}">${l}</a>`).join('')}<button class="header-search" aria-label="Search">${SEARCH}</button></nav>
  </div>`;
  header.querySelector('.nav-toggle').addEventListener('click', () => {
    header.querySelector('#nav').classList.toggle('open');
  });
  block.append(header);
}
