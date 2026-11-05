const menuButton = document.querySelector('.site-header__menu-button');
const siteMenu = document.querySelector('#site-menu');

function closeMenu(restoreFocus = false) {
  siteMenu.hidden = true;
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Abrir menú');
  if (restoreFocus) menuButton.focus();
}

menuButton.addEventListener('click', () => {
  if (!siteMenu.hidden) return closeMenu();
  siteMenu.hidden = false;
  menuButton.setAttribute('aria-expanded', 'true');
  menuButton.setAttribute('aria-label', 'Cerrar menú');
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
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const CLASSICS_API_URL = 'https://vj.interfaces.jima.com.ar/api/v2';
const CLASSICS_TIMEOUT = 3200;

function validClassicImage(value) {
  if (typeof value !== 'string') return null;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' ? url.href : null;
  } catch {
    return null;
  }
}

function selectClassicGames(records) {
  if (!Array.isArray(records)) return [];
  const seen = new Set();
  const games = records
    .map((game) => ({
      id: String(game?.id ?? ''),
      name: typeof game?.name === 'string' ? game.name.trim() : '',
      image: validClassicImage(game?.background_image_low_res) || validClassicImage(game?.background_image),
      rating: Number(game?.rating),
      genres: Array.isArray(game?.genres) ? game.genres.map((genre) => String(genre?.name || genre).toLowerCase()) : []
    }))
    .filter((game) => {
      if (!game.id || !game.name || !game.image || seen.has(game.id)) return false;
      seen.add(game.id);
      return true;
    });

  const classicGenres = ['arcade', 'platform', 'puzzle', 'action', 'adventure', 'rpg'];
  const preferred = games.filter((game) => game.genres.some((genre) => classicGenres.some((name) => genre.includes(name))));
  return [...(preferred.length >= 6 ? preferred : games)]
    .sort((a, b) => (b.rating || 0) - (a.rating || 0) || a.name.localeCompare(b.name, 'es'))
    .slice(0, 10);
}

function attachClassicImageFallback(image, game) {
  image.addEventListener('error', () => {
    image.remove();
    game.card?.classList.add('classic-card--unavailable');
  }, { once: true });
}

function makeClassicCard(game) {
  const card = document.createElement('article');
  card.className = 'classic-card';
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'classic-card__button';
  button.setAttribute('aria-label', `Seleccionar ${game.name}`);

  const image = document.createElement('img');
  image.src = game.image;
  image.alt = `Portada de ${game.name}`;
  image.loading = 'lazy';
  image.decoding = 'async';
  attachClassicImageFallback(image, game);

  const title = document.createElement('h3');
  title.textContent = game.name;
  button.append(image, title);
  card.append(button);
  game.card = card;

  button.addEventListener('click', () => {
    button.classList.remove('is-clicked');
    void button.offsetWidth;
    if (!reducedMotion.matches) button.classList.add('is-clicked');
    window.setTimeout(() => button.classList.remove('is-clicked'), 360);
  });
  return card;
}

function renderClassicGames(records) {
  const games = selectClassicGames(records);
  if (!games.length) return false;
  classicsTrack.replaceChildren(...games.map(makeClassicCard));
  const classicCards = [...classicsTrack.querySelectorAll('.classic-card')];
  if ('IntersectionObserver' in window) {
    const classicObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => entry.target.classList.toggle('is-visible', entry.isIntersecting));
    }, { root: classicsTrack, threshold: .45 });
    classicCards.forEach(card => classicObserver.observe(card));
  } else {
    classicCards.forEach(card => card.classList.add('is-visible'));
  }
  return true;
}

const fallbackClassics = window.JUEGOS_ONLINE_FALLBACK || [];
renderClassicGames(fallbackClassics);

const classicsController = new AbortController();
const classicsTimeout = window.setTimeout(() => classicsController.abort(), CLASSICS_TIMEOUT);
fetch(CLASSICS_API_URL, { signal: classicsController.signal })
  .then(response => {
    if (!response.ok) throw new Error(`API ${response.status}`);
    return response.json();
  })
  .then(renderClassicGames)
  .catch(() => {})
  .finally(() => window.clearTimeout(classicsTimeout));

// Desliza el carrusel y revela las tarjetas nuevas.
document.querySelectorAll('.classics__arrow').forEach(button => button.addEventListener('click', () => {
  const classicCards = [...classicsTrack.querySelectorAll('.classic-card')];
  if (!classicCards.length) return;
  const direction = button.classList.contains('classics__arrow--next') ? 1 : -1;
  const step = classicCards[0].getBoundingClientRect().width + 24;
  const current = Math.round(classicsTrack.scrollLeft / step);
  const maxScroll = classicsTrack.scrollWidth - classicsTrack.clientWidth;
  const projectedScroll = Math.max(0, Math.min(maxScroll, classicsTrack.scrollLeft + direction * step * 2));
  const reachedLimit = direction > 0
    ? projectedScroll >= maxScroll - 4
    : projectedScroll <= 4;
  const targetIndex = reachedLimit
    ? (direction > 0 ? classicCards.length - 1 : 0)
    : Math.max(0, Math.min(classicCards.length - 1, current + direction * 2));
  const target = classicCards[targetIndex];
  target.classList.remove('is-entering');
  void target.offsetWidth;
  if (!reducedMotion.matches) target.classList.add('is-entering');
  classicsTrack.scrollBy({ left: direction * step * 2, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
  window.setTimeout(() => target.classList.remove('is-entering'), 500);
}));

const gallery = document.querySelector('#galeria');
const galleryTrack = document.querySelector('#galeria-track');
const galleryImages = galleryTrack ? [...galleryTrack.querySelectorAll('img')] : [];
const galleryPrevious = document.querySelector('#galeria-anterior');
const galleryNext = document.querySelector('#galeria-siguiente');
const galleryLightbox = document.querySelector('#galeria-lightbox');
const galleryExpandedImage = document.querySelector('#galeria-ampliada');
const galleryClose = document.querySelector('#galeria-cerrar');
const galleryExpandedPrevious = document.querySelector('#galeria-ampliada-anterior');
const galleryExpandedNext = document.querySelector('#galeria-ampliada-siguiente');
let galleryPosition = 0;
let expandedGalleryPosition = 0;

function galleryLayout() {
  if (!gallery || !galleryTrack || !galleryImages.length) return null;
  const imageWidth = galleryImages[0].getBoundingClientRect().width;
  const gap = Number.parseFloat(getComputedStyle(galleryTrack).gap) || 0;
  const step = imageWidth + gap;
  const maxOffset = Math.max(0, galleryTrack.scrollWidth - gallery.clientWidth);
  return { step, maxOffset, maxPosition: Math.ceil(maxOffset / step) };
}

function updateGallery() {
  const layout = galleryLayout();
  if (!layout) return;
  galleryPosition = Math.max(0, Math.min(layout.maxPosition, galleryPosition));
  const offset = galleryPosition === layout.maxPosition
    ? layout.maxOffset
    : galleryPosition * layout.step;
  galleryTrack.style.transform = `translateX(${-offset}px)`;
  galleryPrevious.disabled = galleryPosition === 0;
  galleryNext.disabled = galleryPosition === layout.maxPosition;
}

function moveGallery(direction) {
  galleryPosition += direction;
  updateGallery();
}

galleryPrevious?.addEventListener('click', () => moveGallery(-1));
galleryNext?.addEventListener('click', () => moveGallery(1));
window.addEventListener('resize', updateGallery);
galleryImages.forEach((image, index) => {
  image.tabIndex = 0;
  const open = () => {
    expandedGalleryPosition = index;
    galleryExpandedImage.src = image.currentSrc || image.src;
    galleryExpandedImage.alt = image.alt;
    galleryLightbox.hidden = false;
    document.body.classList.add('gallery-open');
    galleryClose.focus();
  };
  image.addEventListener('click', open);
  image.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      open();
    }
  });
});

function moveExpandedGallery(direction) {
  if (!galleryImages.length) return;
  expandedGalleryPosition = (expandedGalleryPosition + direction + galleryImages.length) % galleryImages.length;
  const image = galleryImages[expandedGalleryPosition];
  galleryExpandedImage.src = image.currentSrc || image.src;
  galleryExpandedImage.alt = image.alt;
}

function closeGallery() {
  galleryLightbox.hidden = true;
  document.body.classList.remove('gallery-open');
}

galleryExpandedPrevious?.addEventListener('click', () => moveExpandedGallery(-1));
galleryExpandedNext?.addEventListener('click', () => moveExpandedGallery(1));
galleryClose?.addEventListener('click', closeGallery);
galleryLightbox?.addEventListener('click', (event) => {
  if (event.target === galleryLightbox) closeGallery();
});
document.addEventListener('keydown', (event) => {
  if (!galleryLightbox || galleryLightbox.hidden) return;
  if (event.key === 'Escape') closeGallery();
  if (event.key === 'ArrowLeft') moveExpandedGallery(-1);
  if (event.key === 'ArrowRight') moveExpandedGallery(1);
});
updateGallery();

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
