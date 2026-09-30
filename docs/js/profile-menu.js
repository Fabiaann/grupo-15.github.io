const profileWrap = document.querySelector('.site-header__profile-wrap');
const profileButton = profileWrap.querySelector('.site-header__profile');
const profilePanel = profileWrap.querySelector('.profile-menu');
const homeUrl = document.querySelector('.site-header__logo').href;
const registerUrl = new URL('pages/register.html', homeUrl).href;
const avatar = '<svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="9" r="6" fill="currentColor"/><path d="M3 29c0-7 5.8-11 13-11s13 4 13 11" fill="currentColor"/></svg>';

function renderProfile() {
  const isRoot = sessionStorage.getItem('juegosonline-demo-user') === 'root';
  const name = isRoot ? 'root' : 'Invitado';
  const subtitle = isRoot ? 'root@juegosonline.com' : 'Ingresá para ver tu perfil';

  profilePanel.innerHTML = `
    <div class="profile-menu__identity">
      <div class="profile-menu__avatar">${avatar}</div>
      <div class="profile-menu__person">
        <strong class="profile-menu__name">${name}</strong>
        <span class="profile-menu__email">${subtitle}</span>
      </div>
    </div>
    ${isRoot ? `
      <div class="profile-menu__stats">
        <div class="profile-menu__coins">
          <span>Tus monedas</span>
          <strong>260 coins</strong>
          <a href="${homeUrl}#coin-recharge" data-open-recharge>Recargar</a>
        </div>
        <div class="profile-menu__activity">
          <span>21 horas jugadas</span>
          <span>Estás en el puesto <strong>N°61</strong></span>
        </div>
      </div>
      <button class="profile-menu__logout" type="button">Cerrar sesión</button>
    ` : `
      <p class="profile-menu__welcome">Entrá para disfrutar de tus juegos y recompensas.</p>
      <div class="profile-menu__actions">
        <a href="${registerUrl}">Iniciar sesión</a>
        <a href="${registerUrl}">Registrarte</a>
      </div>
    `}
  `;
}

function closeProfile(restoreFocus = false) {
  profilePanel.hidden = true;
  profileButton.setAttribute('aria-expanded', 'false');
  profileButton.setAttribute('aria-label', 'Abrir perfil');
  if (restoreFocus) profileButton.focus();
}

profileButton.addEventListener('click', () => {
  if (!profilePanel.hidden) {
    closeProfile();
    return;
  }
  const menuButton = document.querySelector('.site-header__menu-button');
  if (menuButton?.getAttribute('aria-expanded') === 'true') menuButton.click();
  renderProfile();
  profilePanel.hidden = false;
  profileButton.setAttribute('aria-expanded', 'true');
  profileButton.setAttribute('aria-label', 'Cerrar perfil');
});

profilePanel.addEventListener('click', (event) => {
  if (!event.target.closest('.profile-menu__logout')) return;
  sessionStorage.removeItem('juegosonline-demo-user');
  renderProfile();
  profilePanel.querySelector('.profile-menu__actions a').focus();
});

document.addEventListener('pointerdown', (event) => {
  if (!profilePanel.hidden && !profileWrap.contains(event.target)) closeProfile();
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !profilePanel.hidden) closeProfile(true);
});
