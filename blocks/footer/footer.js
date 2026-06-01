// Heathrow Expansion brand chrome — subscribe band + site-wide footer
// (ported from stardust _lib/chrome.mjs). Static brand chrome, built here directly.

const TOP = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const COLS = [
  ['ABOUT EXPANSION', [['About expansion', '/'], ['Benefits of expansion', '/']]],
  ['COMMUNITY & SUPPORT', [['Local community', '/'], ['Residential property', '/'], ['Noise and airspace', '/']]],
  ['STAY INFORMED', [['Latest updates', '/'], ['Stay updated on expansion', '/'], ['Contact us', '/have-your-say']]],
  ['HEATHROW SITES', [['Heathrow.com', '/'], ['Heathrow Company', '/'], ['Heathrow Careers', '/']]],
];
const LEGAL = ['Privacy', 'Terms & conditions', 'Accessibility', 'Sitemap', 'Communications', 'Heathrow byelaws'];
const SOCIAL = {
  X: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.9 2H22l-7.6 8.7L23.4 22h-7.4l-5-6.5L5.2 22H2l8.2-9.3L1 2h7.6l4.5 6 5.8-6Zm-1.3 18h2L7 4H4.9l12.7 16Z"/></svg>',
  Facebook: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.2c-1.2 0-1.6.8-1.6 1.6V12h2.7l-.4 2.9h-2.3v7A10 10 0 0 0 22 12Z"/></svg>',
  Instagram: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>',
  LinkedIn: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5A2.5 2.5 0 1 0 5 8.5a2.5 2.5 0 0 0 0-5ZM3 9h4v12H3V9Zm6 0h3.8v1.7h.05c.53-1 1.8-2 3.7-2 4 0 4.7 2.6 4.7 6V21h-4v-5.3c0-1.3 0-2.9-1.8-2.9s-2 1.4-2 2.8V21H9V9Z"/></svg>',
  YouTube: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M23 12s0-3.2-.4-4.7a2.5 2.5 0 0 0-1.8-1.8C19.3 5 12 5 12 5s-7.3 0-8.8.5A2.5 2.5 0 0 0 1.4 7.3C1 8.8 1 12 1 12s0 3.2.4 4.7a2.5 2.5 0 0 0 1.8 1.8C4.7 19 12 19 12 19s7.3 0 8.8-.5a2.5 2.5 0 0 0 1.8-1.8C23 15.2 23 12 23 12Zm-13 3V9l5 3-5 3Z"/></svg>',
};

export default async function decorate(block) {
  block.textContent = '';
  // subscribe band
  const sub = document.createElement('div');
  sub.className = 'subscribe';
  sub.innerHTML = '<div class="wrap-wide"><h2>Stay up to date with the latest news and updates from Heathrow</h2><a class="btn" href="/have-your-say">Subscribe</a></div>';

  const footer = document.createElement('div');
  footer.className = 'site-footer';
  footer.innerHTML = `<button class="back-to-top" aria-label="Back to top">${TOP}</button>
    <div class="wrap-wide">
      <div class="footer-top">
        <div class="footer-brand"><img src="/icons/logo.png" alt="Heathrow Expansion"><p>Heathrow Airport Limited UK, The Compass Centre, Nelson Road, Hounslow, Middlesex, TW6 2GW.</p><div class="footer-social">${Object.entries(SOCIAL).map(([k, svg]) => `<a href="/" aria-label="${k}">${svg}</a>`).join('')}</div></div>
        ${COLS.map(([h, ls]) => `<div class="col"><h4>${h}</h4>${ls.map(([l, href]) => `<a href="${href}">${l}</a>`).join('')}</div>`).join('')}
      </div>
      <div class="footer-divider"></div>
      <div class="footer-legal"><ul>${LEGAL.map((l) => `<li><a href="/">${l}</a></li>`).join('')}</ul><span class="copy">© LHR Airports Limited · Illustrative prototype</span></div>
    </div>`;
  footer.querySelector('.back-to-top').addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  block.append(sub, footer);
}
