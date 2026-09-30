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
  if (!siteMenu.hidden) {
    closeMenu();
    return;
  }
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

const rewardCard = document.querySelector('#reward');
const rewardDate = rewardCard.querySelector('.reward__date');
const today = new Date();
rewardDate.dateTime = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
rewardDate.textContent = `${today.getDate()}/${today.getMonth() + 1}`;
rewardDate.setAttribute('aria-label', today.toLocaleDateString('es-AR', { day: 'numeric', month: 'long' }));
const rewardButton = rewardCard.querySelector('.reward__button');
const rewardMessage = rewardCard.querySelector('.reward__message');
const rewardCoins = rewardCard.querySelector('.reward__coins');
const reducedRewardMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let rewardClaimed = false;

function releaseRewardCoins() {
  // Lanza monedas; toca speeds, gravity o 1.25 para cambiarlo.
  const speeds = [-150, -95, -38, 38, 95, 150];
  const gravity = 520;
  const coins = speeds.map((vx, index) => {
    const element = document.createElement('span');
    element.className = 'reward__coin';
    rewardCoins.append(element);
    return { element, vx, vy: -315 - (index % 2) * 35 };
  });
  let firstFrame;

  function moveCoins(now) {
    if (firstFrame === undefined) firstFrame = now;
    const seconds = (now - firstFrame) / 1000;
    coins.forEach(({ element, vx, vy }, index) => {
      const x = vx * seconds;
      const y = vy * seconds + gravity * seconds * seconds / 2;
      element.style.transform = `translate(${x}px, ${y}px) rotate(${(index % 2 ? 1 : -1) * seconds * 260}deg)`;
    });
    if (seconds < 1.25) requestAnimationFrame(moveCoins);
    else rewardCoins.replaceChildren();
  }

  requestAnimationFrame(moveCoins);
}

rewardButton.addEventListener('click', () => {
  if (rewardClaimed) return;
  rewardClaimed = true;
  rewardCard.classList.add('is-claimed');
  rewardMessage.textContent = 'Recompensa obtenida';
  rewardButton.setAttribute('aria-label', 'Recompensa obtenida');
  rewardButton.setAttribute('aria-disabled', 'true');
  if (!reducedRewardMotion.matches) releaseRewardCoins();
});

const loader = document.querySelector('#loader');
const progress = document.querySelector('#progress');
const canvas = document.querySelector('#canvas');
const ctx = canvas.getContext('2d');
// Rebota las pelotas; toca duration, gravity o launchSpeed.
const duration = 5000;
const gravity = 1.8 * canvas.height;
const cycleDuration = 1.25;
const ballDelay = 0.3;
const launchSpeed = 360;
let startTime;
let animationFrame;
let finishTimer;
let finished = false;

const balls = [
  { x: 175, y: 325, radius: 25, dy: 0, squash: 0, color: '#0de8d4' },
  { x: 250, y: 325, radius: 25, dy: 0, squash: 0, color: '#8b48f2' },
  { x: 325, y: 325, radius: 25, dy: 0, squash: 0, color: '#31a8ff' }
];

function drawBalls() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#555';
  ctx.fillRect(0, canvas.height - 2, canvas.width, 2);

  balls.forEach((ball) => {
    const floor = canvas.height - ball.radius;
    const distanceToFloor = floor - ball.y;
    const stretch = ball.dy > 0 && distanceToFloor < 90
      ? (1 - distanceToFloor / 90) * 0.18
      : 0;
    const scaleY = 1 + stretch - ball.squash * 0.22;
    const scaleX = 1 - stretch * 0.35 + ball.squash * 0.22;

    ctx.save();
    ctx.translate(ball.x, ball.y);
    ctx.scale(scaleX, scaleY);
    ctx.beginPath();
    ctx.arc(0, 0, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = ball.color;
    ctx.shadowColor = ball.color;
    ctx.shadowBlur = 16;
    ctx.fill();
    ctx.restore();
  });
}

function finishLoading() {
  if (finished) return;
  finished = true;
  progress.textContent = '100%';
  loader.classList.add('hidden');
  cancelAnimationFrame(animationFrame);
  clearTimeout(finishTimer);
}

function animateLoading(now) {
  if (finished) return;
  const elapsed = Math.max(0, now - startTime);
  if (elapsed >= duration) {
    finishLoading();
    return;
  }

  progress.textContent = `${Math.min(99, Math.round(elapsed / duration * 100))}%`;
  balls.forEach((ball, index) => {
    const floor = canvas.height - ball.radius;
    const activeTime = elapsed / 1000 - index * ballDelay;
    if (activeTime < 0) {
      ball.y = floor;
      ball.dy = 0;
      ball.squash = 0;
      return;
    }

    const cycle = Math.floor(activeTime / cycleDuration);
    const phase = activeTime - cycle * cycleDuration;
    const speed = launchSpeed * Math.pow(0.9, cycle);
    const flightDuration = 2 * speed / gravity;

    if (phase < flightDuration) {
      ball.y = floor - speed * phase + gravity * phase * phase / 2;
      ball.dy = -speed + gravity * phase;
      if (cycle > 0) {
        const previousSpeed = speed / 0.9;
        const sinceImpact = cycleDuration - 2 * previousSpeed / gravity + phase;
        ball.squash = Math.max(0, 1 - 5 * sinceImpact);
      } else {
        ball.squash = 0;
      }
    } else {
      ball.y = floor;
      ball.dy = 0;
      ball.squash = Math.max(0, 1 - 5 * (phase - flightDuration));
    }
  });

  drawBalls();
  animationFrame = requestAnimationFrame(animateLoading);
}

function startLoading() {
  startTime = 0;
  animationFrame = requestAnimationFrame(animateLoading);
  finishTimer = setTimeout(finishLoading, Math.max(0, duration - performance.now()));
}

drawBalls();
requestAnimationFrame(() => requestAnimationFrame(startLoading));
