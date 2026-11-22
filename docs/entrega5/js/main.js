const menuButton = document.querySelector('.site-header__menu-button');
const siteMenu = document.querySelector('#site-menu');

//abrir
function closeMenu(restoreFocus = false) {
  siteMenu.hidden = true;
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Abrir menú');
  if (restoreFocus) menuButton.focus();
}

//cerrar
menuButton.addEventListener('click', () => {
  if (!siteMenu.hidden) {
    closeMenu();
    return;
  }
  siteMenu.hidden = false;
  menuButton.setAttribute('aria-expanded', 'true');
  menuButton.setAttribute('aria-label', 'Cerrar menú');
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
 
  if (!reducedRewardMotion.matches){ releaseRewardCoins()
    

  };
});

if(rewardClaimed){
   rewardButton.classList.add('.ocultar');
}
const loader = document.querySelector('#loader');
const progress = document.querySelector('#progress');
const canvas = document.querySelector('#canvas');
const ctx = canvas.getContext('2d');
// Rebota las pelotas; toca duration, gravity o launchSpeed.
const duration = 5000;
const spiralDuration = 1800;
const mergeDuration = 900;
const gravity = 1.8 * canvas.height;
const cycleDuration = 1.25;
const ballDelay = 0.3;
const launchSpeed = 360;
const reducedLoaderMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let startTime;
let animationFrame;
let phaseStart;
let finished = false;

const balls = [
  { x: 175, y: 325, radius: 25, dy: 0, squash: 0, color: '#0de8d4' },
  { x: 250, y: 325, radius: 25, dy: 0, squash: 0, color: '#8b48f2' },
  { x: 325, y: 325, radius: 25, dy: 0, squash: 0, color: '#31a8ff' }
];

function clearCanvas(floorOpacity = 0) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (floorOpacity > 0) {
    ctx.save();
    ctx.globalAlpha = floorOpacity;
    ctx.fillStyle = '#555';
    ctx.fillRect(0, canvas.height - 2, canvas.width, 2);
    ctx.restore();
  }
}

function drawCanvasBall(x, y, radius, color, opacity = 1, scaleX = 1, scaleY = 1) {
  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.translate(x, y);
  ctx.scale(scaleX, scaleY);
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 16;
  ctx.fill();
  ctx.restore();
}

function drawMergedBall(radius, opacity = 1) {
  if (radius <= 0 || opacity <= 0) return;
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const gradient = ctx.createRadialGradient(
    centerX - radius * .3,
    centerY - radius * .35,
    radius * .1,
    centerX,
    centerY,
    radius
  );
  gradient.addColorStop(0, '#eaffff');
  gradient.addColorStop(.3, '#0de8d4');
  gradient.addColorStop(.68, '#8b48f2');
  gradient.addColorStop(1, '#31a8ff');

  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.fillStyle = gradient;
  ctx.shadowColor = '#6f8fff';
  ctx.shadowBlur = 20;
  ctx.fill();
  ctx.restore();
}

function drawBalls() {
  clearCanvas(1);

  balls.forEach((ball) => {
    const floor = canvas.height - ball.radius;
    const distanceToFloor = floor - ball.y;
    const stretch = ball.dy > 0 && distanceToFloor < 90
      ? (1 - distanceToFloor / 90) * 0.18
      : 0;
    const scaleY = 1 + stretch - ball.squash * 0.22;
    const scaleX = 1 - stretch * 0.35 + ball.squash * 0.22;

    drawCanvasBall(ball.x, ball.y, ball.radius, ball.color, 1, scaleX, scaleY);
  });
}

function clamp(value, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function easeInOutCubic(value) {
  return value < .5
    ? 4 * value * value * value
    : 1 - Math.pow(-2 * value + 2, 3) / 2;
}

function finishLoading() {
  if (finished) return;
  finished = true;
  progress.textContent = '100%';
  loader.classList.add('hidden');
  cancelAnimationFrame(animationFrame);
}

function startMerge(now) {
  phaseStart = now;
  animationFrame = requestAnimationFrame(animateMerge);
}

function animateMerge(now) {
  if (finished) return;
  const phase = clamp((now - phaseStart) / mergeDuration);
  let radius;
  let opacity = 1;

  if (phase < .32) {
    const expansion = phase / .32;
    const easedExpansion = 1 - Math.pow(1 - expansion, 3);
    radius = 25 + 7 * easedExpansion;
  } else {
    const contraction = (phase - .32) / .68;
    radius = 32 * (1 - contraction * contraction);
    opacity = 1 - Math.pow(contraction, 1.6);
  }

  clearCanvas();
  drawMergedBall(radius, opacity);

  if (phase < 1) animationFrame = requestAnimationFrame(animateMerge);
  else finishLoading();
}

function startSpiral(now) {
  progress.textContent = '100%';
  if (reducedLoaderMotion.matches) {
    finishLoading();
    return;
  }

  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  balls.forEach((ball) => {
    ball.spiralRadius = Math.hypot(ball.x - centerX, ball.y - centerY);
    ball.spiralAngle = Math.atan2(ball.y - centerY, ball.x - centerX);
  });
  phaseStart = now;
  animationFrame = requestAnimationFrame(animateSpiral);
}

function animateSpiral(now) {
  if (finished) return;
  const phase = clamp((now - phaseStart) / spiralDuration);
  const easedPhase = easeInOutCubic(phase);
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const mergeProgress = clamp((phase - .72) / .28);

  clearCanvas(1 - phase);
  drawMergedBall(25 * mergeProgress, mergeProgress);

  balls.forEach((ball) => {
    const radius = ball.spiralRadius * (1 - easedPhase);
    const angle = ball.spiralAngle + Math.PI * 4 * easedPhase;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    drawCanvasBall(x, y, ball.radius, ball.color, 1 - mergeProgress);
  });

  if (phase < 1) animationFrame = requestAnimationFrame(animateSpiral);
  else startMerge(now);
}

function animateLoading(now) {
  if (finished) return;
  const elapsed = Math.max(0, now - startTime);
  const loadingElapsed = Math.min(elapsed, duration);

  progress.textContent = `${Math.min(99, Math.round(loadingElapsed / duration * 100))}%`;
  balls.forEach((ball, index) => {
    const floor = canvas.height - ball.radius;
    const activeTime = loadingElapsed / 1000 - index * ballDelay;
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
  if (elapsed >= duration) startSpiral(now);
  else animationFrame = requestAnimationFrame(animateLoading);
}

function startLoading(now) {
  startTime = now;
  animationFrame = requestAnimationFrame(animateLoading);
}

drawBalls();
requestAnimationFrame(() => requestAnimationFrame(startLoading));
