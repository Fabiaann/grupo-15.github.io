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

siteMenu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => closeMenu()));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !siteMenu.hidden) closeMenu(true);
});

const reactionButtons = [...document.querySelectorAll('.game-summary__rating .reaction')];
reactionButtons.forEach(button => button.addEventListener('click', () => {
  const select = button.getAttribute('aria-pressed') !== 'true';
  reactionButtons.forEach(item => item.setAttribute('aria-pressed', String(item === button && select)));
}));

const classicsTrack = document.querySelector('#classics-track');
const classicCards = [...classicsTrack.querySelectorAll('.classic-card')];
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const classicObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => entry.target.classList.toggle('is-visible', entry.isIntersecting));
}, { root: classicsTrack, threshold: .45 });
classicCards.forEach(card => classicObserver.observe(card));

document.querySelectorAll('.classics__arrow').forEach(button => button.addEventListener('click', () => {
  const direction = button.classList.contains('classics__arrow--next') ? 1 : -1;
  const step = classicCards[0].getBoundingClientRect().width + 24;
  const current = Math.round(classicsTrack.scrollLeft / step);
  const target = classicCards[Math.max(0, Math.min(classicCards.length - 1, current + direction * 2))];
  target.classList.remove('is-entering');
  void target.offsetWidth;
  if (!reducedMotion.matches) target.classList.add('is-entering');
  classicsTrack.scrollBy({ left: direction * step * 2, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
  window.setTimeout(() => target.classList.remove('is-entering'), 500);
}));

const commentForm = document.querySelector('#comment-form');
const commentText = document.querySelector('#comment-text');
const commentFeedback = document.querySelector('#comment-feedback');
const commentList = document.querySelector('#comment-list');
const commentTabs = [...document.querySelectorAll('[data-comments-tab]')];

function sortComments(mode) {
  const cards = [...commentList.querySelectorAll('.comment-card')];
  cards.sort((a, b) => mode === 'featured'
    ? Number(b.dataset.likes) - Number(a.dataset.likes) || b.dataset.date.localeCompare(a.dataset.date)
    : b.dataset.date.localeCompare(a.dataset.date));
  cards.forEach(card => commentList.append(card));
}

commentTabs.forEach(tab => tab.addEventListener('click', () => {
  commentTabs.forEach(item => item.setAttribute('aria-selected', String(item === tab)));
  sortComments(tab.dataset.commentsTab);
}));

commentForm.addEventListener('submit', event => {
  event.preventDefault();
  const message = commentText.value.trim();
  if (!message) {
    commentFeedback.textContent = 'Escribí un comentario antes de publicarlo.';
    commentText.focus();
    return;
  }
  const now = new Date();
  const card = document.createElement('article');
  card.className = 'comment-card';
  card.dataset.date = now.toISOString();
  card.dataset.likes = '0';
  card.innerHTML = '<div class="comment-card__head"><span class="avatar avatar--self" aria-hidden="true"></span><strong>Tú</strong><button type="button" class="comment-like" aria-pressed="false" aria-label="Me gusta tu comentario"><span>0 me gusta</span> ♡</button></div><div class="comment-card__body"><p></p><time></time></div>';
  card.querySelector('p').textContent = message;
  const time = card.querySelector('time');
  time.dateTime = now.toISOString();
  time.textContent = now.toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });
  commentList.prepend(card);
  commentText.value = '';
  commentFeedback.textContent = 'Comentario publicado en esta sesión.';
  commentTabs.forEach(item => item.setAttribute('aria-selected', String(item.dataset.commentsTab === 'latest')));
  sortComments('latest');
});

commentList.addEventListener('click', event => {
  const button = event.target.closest('.comment-like');
  if (!button) return;
  const card = button.closest('.comment-card');
  const selected = button.getAttribute('aria-pressed') !== 'true';
  button.setAttribute('aria-pressed', String(selected));
  const count = Number(card.dataset.likes) + (selected ? 1 : -1);
  card.dataset.likes = String(count);
  button.querySelector('span').textContent = `${count} me gusta`;
});
