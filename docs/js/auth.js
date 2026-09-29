const menuButton = document.querySelector('.site-header__menu-button');
const siteMenu = document.querySelector('#site-menu');
const categoriesButton = document.querySelector('.site-menu__categories');
const categoriesList = document.querySelector('#site-categories');

function closeMenu(restoreFocus = false) {
  siteMenu.hidden = true;
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Abrir menú');
  categoriesList.hidden = true;
  categoriesButton.setAttribute('aria-expanded', 'false');
  if (restoreFocus) menuButton.focus();
}

menuButton.addEventListener('click', () => {
  if (!siteMenu.hidden) return closeMenu();
  siteMenu.hidden = false;
  menuButton.setAttribute('aria-expanded', 'true');
  menuButton.setAttribute('aria-label', 'Cerrar menú');
});
categoriesButton.addEventListener('click', () => {
  categoriesList.hidden = !categoriesList.hidden;
  categoriesButton.setAttribute('aria-expanded', String(!categoriesList.hidden));
});
siteMenu.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => closeMenu()));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !siteMenu.hidden) closeMenu(true);
});

