(() => {
  const API_URL = 'https://vj.interfaces.jima.com.ar/api/v2';
  const GAMES_PER_ROW = 12;
  const REQUEST_TIMEOUT = 3200;
  const FALLBACK_IMAGE = 'assets/logo-juegos-online.png';
  const sections = [
    document.querySelector('#library'),
    document.querySelector('#popular'),
    document.querySelector('#novedades')
  ];
  const dialog = document.querySelector('#game-details');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let lastDetailButton = null;
  let replacing = false;

  function validImage(value) {
    if (typeof value !== 'string') return null;
    try {
      const url = new URL(value);
      return url.protocol === 'https:' ? url.href : null;
    } catch {
      return null;
    }
  }

  function namesFrom(values) {
    if (!Array.isArray(values)) return [];
    return values.map((value) => typeof value === 'string' ? value : value?.name)
      .filter((value) => typeof value === 'string' && value.trim())
      .map((value) => value.trim());
  }

  function normalize(raw) {
    if (!raw || !Number.isFinite(Number(raw.id)) || typeof raw.name !== 'string') return null;
    const name = raw.name.trim();
    const image = validImage(raw.background_image_low_res) || validImage(raw.background_image);
    const rating = Number(raw.rating);
    if (!name || !image || !Number.isFinite(rating) || rating < 0 || rating > 5) return null;
    return {
      id: String(raw.id),
      name,
      image,
      originalImage: validImage(raw.background_image) || image,
      rating,
      genres: namesFrom(raw.genres),
      platforms: namesFrom(raw.platforms),
      description: typeof raw.description === 'string' ? raw.description.trim() : ''
    };
  }

  function selectGames(records) {
    if (!Array.isArray(records)) return null;
    const seenIds = new Set();
    const seenImages = new Set();
    const games = [];
    records.forEach((record) => {
      const game = normalize(record);
      if (!game || seenIds.has(game.id) || seenImages.has(game.image)) return;
      seenIds.add(game.id);
      seenImages.add(game.image);
      games.push(game);
    });
    if (games.length < GAMES_PER_ROW * sections.length) return null;

    const library = games.slice(0, GAMES_PER_ROW);
    const libraryIds = new Set(library.map((game) => game.id));
    const remaining = games.filter((game) => !libraryIds.has(game.id));
    const popular = [...remaining]
      .sort((a, b) => b.rating - a.rating || a.name.localeCompare(b.name, 'es'))
      .slice(0, GAMES_PER_ROW);
    const usedIds = new Set([...library, ...popular].map((game) => game.id));
    const recommendationPool = remaining.filter((game) => !usedIds.has(game.id));
    const recommendations = [];
    const usedGenres = new Set();

    recommendationPool.forEach((game) => {
      const genre = game.genres[0];
      if (genre && !usedGenres.has(genre) && recommendations.length < GAMES_PER_ROW) {
        recommendations.push(game);
        usedGenres.add(genre);
      }
    });
    recommendationPool.forEach((game) => {
      if (recommendations.length < GAMES_PER_ROW && !recommendations.includes(game)) {
        recommendations.push(game);
      }
    });

    return [library, popular, recommendations];
  }

  function attachImageFallback(image, game) {
    let attempt = 0;
    image.onerror = () => {
      if (attempt === 0 && game.originalImage !== image.src) {
        attempt = 1;
        image.src = game.originalImage;
      } else if (attempt < 2) {
        attempt = 2;
        image.classList.add('card__image--fallback');
        image.src = FALLBACK_IMAGE;
      }
    };
  }

  function ratingLabel(game) {
    return `★ ${game.rating.toLocaleString('es-AR', { minimumFractionDigits: 1, maximumFractionDigits: 2 })}/5`;
  }

  function makeCard(game, mini) {
    const card = document.createElement('article');
    card.className = mini ? 'card mini' : 'card';
    card.dataset.gameId = game.id;

    const inner = document.createElement('div');
    inner.className = 'card__inner';
    const front = document.createElement('button');
    front.className = 'card__front';
    front.type = 'button';
    front.setAttribute('aria-label', `Ver información de ${game.name}`);
    const image = document.createElement('img');
    image.className = 'card__image';
    image.src = game.image;
    image.alt = '';
    image.loading = 'lazy';
    image.decoding = 'async';
    attachImageFallback(image, game);
    const badge = document.createElement('span');
    badge.className = 'card__price';
    badge.textContent = ratingLabel(game);
    front.append(image, badge);

    const back = document.createElement('div');
    back.className = 'card__back';
    const heading = document.createElement('h3');
    heading.textContent = game.name;
    const summary = document.createElement('p');
    summary.textContent = [game.genres[0], game.platforms[0]].filter(Boolean).join(' · ') || 'Datos en la ficha';
    const details = document.createElement('button');
    details.className = 'card__play';
    details.type = 'button';
    details.textContent = 'Ver ficha';
    details.setAttribute('aria-label', `Ver ficha de ${game.name}`);
    back.append(heading, summary, details);
    inner.append(front, back);
    card.append(inner);

    front.addEventListener('click', (event) => {
      card.classList.toggle('is-flipped');
      if (event.detail > 0) front.blur();
    });
    details.addEventListener('click', () => openDetails(game, details));
    return card;
  }

  function openDetails(game, button) {
    lastDetailButton = button;
    const image = dialog.querySelector('.game-dialog__image');
    image.src = game.originalImage;
    image.alt = '';
    attachImageFallback(image, game);
    dialog.querySelector('#game-details-title').textContent = game.name;
    dialog.querySelector('[data-detail-rating]').textContent = ratingLabel(game);
    dialog.querySelector('[data-detail-genres]').textContent = game.genres.join(', ') || 'No informado';
    dialog.querySelector('[data-detail-platforms]').textContent = game.platforms.join(', ') || 'No informado';
    dialog.querySelector('[data-detail-description]').textContent = game.description || 'La API no incluye una descripción para este juego.';
    dialog.showModal();
  }

  dialog.querySelector('.game-dialog__close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener('close', () => {
    if (lastDetailButton?.isConnected) lastDetailButton.focus();
    lastDetailButton = null;
  });

  const carousels = sections.map((section) => {
    const carousel = section.querySelector('[data-carousel]');
    const track = carousel.querySelector('.track');
    const previous = carousel.querySelector('.previous');
    const next = carousel.querySelector('.next');
    const state = { track, previous, next, moving: null };

    function rotate(direction) {
      if (replacing || state.moving || track.children.length < 2) return;
      previous.disabled = true;
      next.disabled = true;
      track.scrollLeft = 0;
      const cards = [...track.children];
      const before = new Map(cards.map((card) => [card, card.getBoundingClientRect().left]));
      if (direction > 0) track.append(cards[0]);
      else track.prepend(cards[cards.length - 1]);

      if (reducedMotion.matches) {
        previous.disabled = false;
        next.disabled = false;
        return;
      }

      const animations = cards.map((card) => {
        const offset = before.get(card) - card.getBoundingClientRect().left;
        return card.animate([
          { transform: `translateX(${offset}px) scale(1)`, opacity: 1 },
          { transform: `translateX(${offset * .42}px) scale(.88)`, opacity: .68, offset: .56 },
          { transform: 'translateX(0) scale(1)', opacity: 1 }
        ], { duration: 560, easing: 'ease-in-out' });
      });
      state.moving = Promise.all(animations.map((animation) => animation.finished.catch(() => {})))
        .then(() => {
          state.moving = null;
          previous.disabled = false;
          next.disabled = false;
        });
    }

    previous.addEventListener('click', () => rotate(-1));
    next.addEventListener('click', () => rotate(1));
    return state;
  });

  document.addEventListener('click', (event) => {
    document.querySelectorAll('.card.is-flipped').forEach((card) => {
      if (!card.contains(event.target)) card.classList.remove('is-flipped');
    });
  });

  async function renderCatalog(groups, source) {
    if (!groups) return;
    replacing = true;
    try {
      await Promise.all(carousels.map((carousel) => carousel.moving || Promise.resolve()));
      if (dialog.open) {
        await new Promise((resolve) => dialog.addEventListener('close', resolve, { once: true }));
      }
      groups.forEach((games, index) => {
        const carousel = carousels[index];
        carousel.track.replaceChildren(...games.map((game) => makeCard(game, index === 0)));
        carousel.track.scrollLeft = 0;
        sections[index].dataset.catalogSource = source;
      });
    } finally {
      replacing = false;
    }
  }

  renderCatalog(selectGames(window.JUEGOS_ONLINE_FALLBACK), 'respaldo');

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
  fetch(API_URL, { signal: controller.signal })
    .then((response) => {
      if (!response.ok) throw new Error(`API ${response.status}`);
      return response.json();
    })
    .then((data) => renderCatalog(selectGames(data), 'api'))
    .catch(() => { /* El catálogo local ya está visible. */ })
    .finally(() => window.clearTimeout(timeout));
})();
