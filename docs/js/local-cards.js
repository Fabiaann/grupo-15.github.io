(() => {
  const DEMO_BALANCE = 260;
  const RENTAL_COSTS = { 1: 100, 2: 200, 3: 300 };
  const catalog = [
    {
      id: 'library', title: 'Biblioteca', variant: 'compact', library: true, games: [
        ['Counter-Strike 2', 'counter-strike.jpg', '10 días'], ['God of War', 'god-of-war.jpg', '4 días'],
        ['Grand Theft Auto V', 'gta-v.jpg', '1 día'], ['Portal 2', 'portal-2.jpg', '4 h'],
        ['Hollow Knight', 'hollow-knight.jpg', '30 min'], ['Rocket League', 'rocket-league.jpg', '10 min'],
        ['Stardew Valley', 'stardew-valley.jpg', '5 min']]
    },
    {
      id: 'popular', title: 'Más jugados', variant: 'large', games: [
        ['Grand Theft Auto V', 'gta-v.jpg'], ['Cyberpunk 2077', 'cyberpunk-2077.jpg'],
        ['Horizon Zero Dawn', 'horizon-zero-dawn.jpg'], ['Destiny 2', 'destiny-2.jpg'],
        ['BioShock Infinite', 'bioshock-infinite.jpg']]
    },
    {
      id: 'novedades', title: 'Creemos que te puede gustar', variant: 'compact', games: [
        ['Life is Strange', 'life-is-strange.jpg'], ['Rise of the Tomb Raider', 'rise-of-the-tomb-raider.jpg'],
        ['Portal 2', 'portal-2.jpg'], ['Portal', 'portal.jpg'], ['Half-Life 2', 'half-life-2.jpg'],
        ['BioShock', 'bioshock.jpg'], ['Alan Wake', 'alan-wake.jpg']]
    },
    {
      id: 'game-survival', title: 'Juegos Survival', variant: 'compact', games: [
        ['Terraria', 'terraria.jpg'], ['Stardew Valley', 'stardew-valley.jpg'], ["Garry's Mod", 'garrys-mod.jpg'],
        ['Path of Exile', 'path-of-exile.jpg'], ['Warframe', 'warframe.jpg'],
        ['Hollow Knight', 'hollow-knight.jpg'], ['The Walking Dead', 'walking-dead.jpg']]
    }
  ].map((group) => ({ ...group, games: group.games.map(([title, image, remainingTime]) => ({ title, image: `img/${image}`, remainingTime })) }));

  const root = document.querySelector('#local-game-catalog');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function setBackInteractive(card, interactive) {
    card.querySelector('.local-game-card__back').setAttribute('aria-hidden', String(!interactive));
    card.querySelectorAll('.local-game-card__back a, .local-game-card__back button').forEach((control) => { control.tabIndex = interactive ? 0 : -1; });
  }

  function setCarouselCardActive(card, active) {
    const carousel = card.closest('.local-carousel');
    if (!carousel) return;
    if (active) carousel.classList.add('has-active-card');
    else if (!carousel.querySelector('.local-game-card.is-pinned, .local-game-card:hover, .local-game-card:focus-within')) carousel.classList.remove('has-active-card');
  }

  function closeCard(card) {
    card.classList.remove('is-pinned');
    card.querySelector('.local-game-card__front').setAttribute('aria-expanded', 'false');
    if (card.contains(document.activeElement)) document.activeElement.blur();
    setBackInteractive(card, false);
    card.resetCard?.();
    setCarouselCardActive(card, false);
  }

  function closePinnedCards(except = null) {
    document.querySelectorAll('.local-game-card.is-pinned').forEach((card) => { if (card !== except) closeCard(card); });
  }

  function rentalControls() {
    return `<p class="local-game-card__prompt">¿Por cuánto tiempo querés extenderlo?</p>
      <div class="local-game-card__terms" aria-label="Duración de la extensión">
        <button type="button" data-months="1">1 mes</button><button type="button" data-months="2">2 meses</button><button type="button" data-months="3">3 meses</button>
      </div>`;
  }

  function cardFor(game, isLibrary) {
    const card = document.createElement('article');
    card.className = `local-game-card${isLibrary ? ' local-game-card--library' : ''}`;
    card.dataset.game = game.title;
    card.innerHTML = `
      <div class="local-game-card__inner">
        <button class="local-game-card__front" type="button" aria-label="${isLibrary ? 'Abrir alquiler de' : 'Alquilar'} ${game.title}" aria-expanded="false">
          <img src="${game.image}" alt="Portada de ${game.title}">
          ${isLibrary ? `<span class="local-game-card__time"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>${game.remainingTime}</span>` : ''}
          <strong>${game.title}</strong><span>${isLibrary ? 'Alquiler activo' : 'Desde 100 coins'}</span>
        </button>
        <div class="local-game-card__back" aria-hidden="true">
          <strong>${game.title}</strong>
          ${isLibrary ? `<div class="local-game-card__library-actions">
              <a href="pages/game.html">Jugar</a><button type="button" data-extend>Extender</button>
            </div>
            <div class="local-game-card__extension" hidden>${rentalControls()}<button class="local-game-card__back-action" type="button" data-back-library>Cancelar</button></div>`
        : `<p class="local-game-card__prompt">¿Por cuánto tiempo querés alquilarlo?</p>
              <div class="local-game-card__terms" aria-label="Duración del alquiler">
                <button type="button" data-months="1">1 mes</button><button type="button" data-months="2">2 meses</button><button type="button" data-months="3">3 meses</button>
              </div>`}
          <div class="local-game-card__confirmation" hidden>
            <p><span data-summary></span> · <strong data-total></strong></p>
            <div><button type="button" data-cancel>Cancelar</button><button type="button" data-confirm>Confirmar</button></div>
          </div>
          <p class="local-game-card__message" role="status"></p>
        </div>
      </div>`;

    const front = card.querySelector('.local-game-card__front');
    const prompt = card.querySelector('.local-game-card__prompt');
    const terms = card.querySelector('.local-game-card__terms');
    const confirmation = card.querySelector('.local-game-card__confirmation');
    const message = card.querySelector('.local-game-card__message');
    const libraryActions = card.querySelector('.local-game-card__library-actions');
    const extension = card.querySelector('.local-game-card__extension');
    let selectedCost = 0;

    function reset() {
      selectedCost = 0;
      confirmation.hidden = true;
      terms.hidden = false;
      prompt.hidden = false;
      message.textContent = '';
      if (isLibrary) { libraryActions.hidden = false; extension.hidden = true; }
    }
    card.resetCard = reset;

    front.addEventListener('focus', () => setBackInteractive(card, true));
    card.addEventListener('pointerenter', () => setCarouselCardActive(card, true));
    card.addEventListener('pointerleave', () => setCarouselCardActive(card, false));
    card.addEventListener('focusin', () => setCarouselCardActive(card, true));
    card.addEventListener('focusout', () => setTimeout(() => {
      if (!card.contains(document.activeElement) && !card.classList.contains('is-pinned')) {
        setBackInteractive(card, false);
        setCarouselCardActive(card, false);
      }
    }));
    front.addEventListener('click', () => {
      closePinnedCards(card); card.classList.add('is-pinned'); setCarouselCardActive(card, true); front.setAttribute('aria-expanded', 'true'); setBackInteractive(card, true); reset();
    });
    if (isLibrary) {
      const extendButton = card.querySelector('[data-extend]');
      function openExtension() {
        libraryActions.hidden = true; extension.hidden = false; extension.querySelector('[data-months]').focus();
      }
      extendButton.addEventListener('pointerdown', (event) => {
        if (event.button !== 0) return;
        event.preventDefault();
        openExtension();
      });
      extendButton.addEventListener('click', openExtension);
      card.querySelector('[data-back-library]').addEventListener('click', () => { reset(); card.querySelector('[data-extend]').focus(); });
    }
    function selectMonths(button) {
      const months = Number(button.dataset.months);
      selectedCost = RENTAL_COSTS[months];
      card.querySelector('[data-summary]').textContent = `${months} ${months === 1 ? 'mes' : 'meses'}`;
      card.querySelector('[data-total]').textContent = `${selectedCost} coins`;
      terms.hidden = true; prompt.hidden = true;
      if (isLibrary) extension.hidden = true;
      confirmation.hidden = false; card.querySelector('[data-cancel]').focus();
    }
    card.querySelectorAll('[data-months]').forEach((button) => {
      button.addEventListener('pointerdown', (event) => {
        if (event.button !== 0) return;
        event.preventDefault();
        selectMonths(button);
      });
      button.addEventListener('click', () => selectMonths(button));
    });
    card.querySelector('[data-cancel]').addEventListener('click', () => {
      reset(); (isLibrary ? card.querySelector('[data-extend]') : card.querySelector('[data-months]')).focus();
    });
    card.querySelector('[data-confirm]').addEventListener('click', () => {
      confirmation.hidden = true;
      message.textContent = selectedCost <= DEMO_BALANCE ? 'Alquiler confirmado' : 'Coins insuficientes';
    });
    setBackInteractive(card, false);
    return card;
  }

  function sectionFor(group) {
    const section = document.createElement('section');
    section.className = `local-games-section local-games-section--${group.variant}${group.library ? ' local-games-section--library' : ''}`;
    section.id = group.id;
    section.dataset.cardSize = group.variant;
    section.innerHTML = `<h2>${group.title}</h2><div class="local-carousel" data-local-carousel>
      <button class="local-carousel__button local-carousel__button--previous" type="button" aria-label="Ver juego anterior">‹</button>
      <div class="local-carousel__viewport"><div class="local-carousel__track"></div></div>
      <button class="local-carousel__button local-carousel__button--next" type="button" aria-label="Ver juego siguiente">›</button></div>`;
    section.querySelector('.local-carousel__track').append(...group.games.map((game) => cardFor(game, group.library)));
    return section;
  }

  root.append(...catalog.map(sectionFor));
  document.addEventListener('pointerdown', (event) => {
    const pinned = document.querySelector('.local-game-card.is-pinned');
    if (pinned && !pinned.contains(event.target)) closeCard(pinned);
  });
  document.addEventListener('close-game-overlays', () => closePinnedCards());

  document.querySelectorAll('[data-local-carousel]').forEach((carousel) => {
    const track = carousel.querySelector('.local-carousel__track');
    const previous = carousel.querySelector('.local-carousel__button--previous');
    const next = carousel.querySelector('.local-carousel__button--next');
    let moving = false;
    const stepSize = () => track.firstElementChild.getBoundingClientRect().width + parseFloat(getComputedStyle(track).gap || 0);
    function finish() { moving = false; previous.disabled = false; next.disabled = false; track.classList.remove('is-moving'); }
    function move(direction) {
      if (moving || track.children.length < 2) return;
      moving = true; previous.disabled = true; next.disabled = true; closePinnedCards();
      const step = stepSize();
      if (reducedMotion.matches) { direction > 0 ? track.append(track.firstElementChild) : track.prepend(track.lastElementChild); finish(); return; }
      track.classList.add('is-moving');
      if (direction > 0) {
        const done = (event) => { if (event.target !== track || event.propertyName !== 'transform') return; track.removeEventListener('transitionend', done); track.classList.remove('is-moving'); track.append(track.firstElementChild); track.style.transform = 'translateX(0)'; finish(); };
        track.addEventListener('transitionend', done); track.style.transform = `translateX(-${step}px)`;
      } else {
        const done = (event) => { if (event.target !== track || event.propertyName !== 'transform') return; track.removeEventListener('transitionend', done); finish(); };
        track.classList.remove('is-moving'); track.prepend(track.lastElementChild); track.style.transform = `translateX(-${step}px)`; track.getBoundingClientRect(); track.addEventListener('transitionend', done); track.classList.add('is-moving'); track.style.transform = 'translateX(0)';
      }
    }
    previous.addEventListener('click', () => move(-1)); next.addEventListener('click', () => move(1));
  });
})();
