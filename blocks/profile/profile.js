/* profile — author signature card. One row: [image, name, role].
   The image cell is optional; with no photo we render an initials avatar (we do not
   re-host a person's photograph). */
export default function decorate(block) {
  const cells = [...(block.querySelector(':scope > div')?.children || [])];
  const pic = cells[0]?.querySelector('picture, img');
  const name = (cells[1]?.textContent || '').trim();
  const role = (cells[2]?.textContent || '').trim();

  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  const media = pic
    ? `<div class="profile-photo">${pic.outerHTML}</div>`
    : `<div class="profile-photo profile-photo--placeholder" aria-hidden="true">${initials}</div>`;

  block.className = 'profile';
  block.innerHTML = `<div class="wrap"><div class="profile-card">${media}<div class="profile-meta"><p class="profile-name">${name}</p><p class="profile-role">${role}</p></div></div></div>`;
}
