/* =========================================================
   Delivery Rush - Entregable Nº5
   Horizontal scroller: un repartidor corre solo por la calle.
   Cada "cruce" tiene un obstáculo en el piso y un andamio de
   obra colgando arriba: hay que saltar y pasar por el hueco.
   ========================================================= */
(() => {
  'use strict';

  const frame = document.getElementById('delivery-frame');
  if (!frame) return;

  // ---------- Constantes del mundo (mundo lógico de 800x500) ----------
  const WORLD_W = 800;
  const GROUND_Y = 440;           // altura de la vereda
  const PLAYER_X = 140;
  const PLAYER_SIZE = 80;
  const GRAVITY = 2000;           // px/s²
  const JUMP = -650;              // salto desde el piso
  const DOUBLE_JUMP = -680;       // segundo impulso en el aire
  const FAST_FALL = 750;          // flecha abajo en el aire
  const SLIDE_MIN = 0.3;          // s mínimos de deslizamiento
  const TOP_W = 84;               // ancho del andamio colgante
  const PX_PER_METER = 6;
  const GAP_START = 235;          // hueco vertical inicial entre piso y andamio
  const GAP_MIN = 230;            // hueco vertical mínimodr-cross__top
  const GAP_SHRINK_METERS = 7000; // metros hasta llegar al hueco mínimo

  // Obstáculos del piso: cada uno define la altura del hueco
  const GROUND_TYPES = [
    { name: 'cono', w: 40, h: 46 },
    { name: 'tacho', w: 50, h: 66 },
    { name: 'valla', w: 96, h: 84 },
    { name: 'contenedor', w: 104, h: 112 },
    { name: 'cajas', w: 72, h: 130 },
  ];

  // Velocidad de cada capa respecto del avance (1 = misma velocidad que la calle)
  const LAYERS = [
    { el: frame.querySelector('.dr-layer--nubes'), factor: 0.08 },
    { el: frame.querySelector('.dr-layer--lejana'), factor: 0.22 },
    { el: frame.querySelector('.dr-layer--media'), factor: 0.45 },
    { el: frame.querySelector('.dr-layer--cercana'), factor: 0.75 },
    { el: frame.querySelector('.dr-layer--calle'), factor: 1 },
  ];

  const ORDERS = [
    { item: 'Pizza muzzarella', icon: '🍕', meters: 900, speed: 230, pay: 300 },
    { item: 'Hamburguesa doble', icon: '🍔', meters: 1100, speed: 245, pay: 380 },
    { item: 'Sushi x 30', icon: '🍣', meters: 1300, speed: 260, pay: 460 },
    { item: 'Helado de 1 kg', icon: '🍦', meters: 1500, speed: 275, pay: 540 },
    { item: 'Torta de cumpleaños', icon: '🎂', meters: 1800, speed: 290, pay: 650 },
  ];

  const COIN_VALUE = 25;          // propina por moneda
  const DOG_DAMAGE = 15;          // % del pedido que se pierde con una mordida
  const OBSTACLE_DAMAGE = 20;     // % del pedido que se pierde al chocar un obstáculo
  const MIN_INTEGRITY = 10;       // el pedido nunca baja de acá: siempre se entrega
  const DOG_SLOW = 0.55;          // multiplicador de velocidad mientras está lastimado
  const HURT_INVULNERABLE = 1.4;  // s para pasar el obstáculo después de golpearse

  // ---------- Elementos ----------
  const $ = (sel) => frame.querySelector(sel);
  const world = $('#dr-world');
  const obstaclesLayer = $('#dr-obstacles');
  const entitiesLayer = $('#dr-entities');
  const player = $('#dr-player');
  const ui = {
    orderName: $('#dr-order-name'),
    orderCount: $('#dr-order-count'),
    meters: $('#dr-meters'),
    progress: $('#dr-progress'),
    integrity: $('#dr-integrity'),
    integrityText: $('#dr-integrity-text'),
    integrityCard: $('#dr-integrity-card'),
    money: $('#dr-money'),
    toast: $('#dr-toast'),
    menu: $('#dr-menu'),
    help: $('#dr-help'),
    pause: $('#dr-pause'),
    end: $('#dr-end'),
    endTitle: $('#dr-end-title'),
    endText: $('#dr-end-text'),
    endMoney: $('#dr-end-money'),
    endDelivered: $('#dr-end-delivered'),
    endMeters: $('#dr-end-meters'),
    endBest: $('#dr-end-best'),
    sound: $('#dr-sound'),
    pauseBtn: $('#dr-pause-btn'),
  };

  // ---------- Sonido (reutiliza los audios del sitio) ----------
  const makeAudio = (file, volume, loop = false) => {
    const a = new Audio('../sound/' + file);
    a.volume = volume;
    a.loop = loop;
    a.preload = 'auto';
    return a;
  };
  const sounds = {
    coin: makeAudio('pickup.mp3', 0.45),
    jump: makeAudio('woosh.MP3', 0.2),
    hit: makeAudio('drop1.mp3', 0.6),
    stomp: makeAudio('drop2.mp3', 0.6),
    win: makeAudio('ganar.mp3', 0.55),
    music: makeAudio('musica-ambiente.mp3', 0.22, true),
  };
  let soundOn = true;
  const play = (name) => {
    if (!soundOn) return;
    try {
      sounds[name].currentTime = 0;
      const p = sounds[name].play();
      if (p) p.catch(() => { });
    } catch (e) { /* sin audio */ }
  };
  const playMusic = () => { if (soundOn) { const p = sounds.music.play(); if (p) p.catch(() => { }); } };

  // ---------- Estado ----------
  let state = 'menu'; // menu | playing | paused | over
  let godMode = false; // solo se activa desde ?debug
  let g;
  let lastTime = 0;
  let best = 0;
  try {
     best = Number(localStorage.getItem('deliveryRushBest')) || 0; } catch (e) { best = 0;
      
      }

  const rand = (a, b) => a + Math.random() * (b - a);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const groundTop = () => GROUND_Y - PLAYER_SIZE;

  function newGame() {
    obstaclesLayer.innerHTML = '';
    entitiesLayer.innerHTML = '';
    g = {
      y: groundTop(),
      vy: 0,
      onGround: true,
      jumpsLeft: 50,
      sliding: 0,          // tiempo restante mínimo de deslizamiento
      slideHeld: false,
      distance: 0,
      orderIndex: 0,
      orderDistance: 0,
      orderTime: 0,
      integrity: 100,
      money: 0,
      delivered: 0,
      integritySum: 0,
      slowTimer: 0,
      invulnerable: 0,
      obstacles: [],
      coins: [],
      dogs: [],
      nextObstacleX: WORLD_W + 160,
      dogTimer: 3.5,
      npc: null,
      leavingNpcs: [],
    };
    setPlayerClass('');
    startOrder(0, false);
    render();
  }

  function startOrder(index, announce = true) {
    g.orderIndex = index;
    g.orderDistance = 0;
    g.orderTime = 0;
    g.integrity = 100;
    const o = ORDERS[index];
    ui.orderName.textContent = `${o.icon} ${o.item}`;
    ui.orderCount.textContent = `${index + 1}/${ORDERS.length}`;
    updateIntegrity();
    if (announce) announceOrder(o);
  }

  const announceOrder = (o) => showToast(`Nuevo pedido: ${o.icon} ${o.item}`, `Entregalo a ${o.meters} m`);
  const currentOrder = () => ORDERS[g.orderIndex];

  // El hueco entre el obstáculo del piso y el andamio se achica con la distancia recorrida
  function currentGap() {
    const t = clamp(g.distance / PX_PER_METER / GAP_SHRINK_METERS, 0, 1);
    return GAP_START - (GAP_START - GAP_MIN) * t;
  }

  // ---------- Generación ----------
  // Cruce = obstáculo en el piso + andamio colgante. La altura del hueco cambia
  // según el obstáculo del piso, y su tamaño según la distancia recorrida.
  function spawnCrossing(x) {
    const gap = currentGap();
    const type = GROUND_TYPES[Math.floor(Math.random() * GROUND_TYPES.length)];
    const bottomTop = GROUND_Y - type.h;
    const gapTop = Math.max(30, bottomTop - gap);
    const bx = x + (TOP_W - type.w) / 2;

    const el = document.createElement('div');
    el.className = 'dr-cross';
    el.innerHTML = `<div class="dr-cross__top" style="height:${gapTop}px"></div>
      <div class="dr-cross__bottom dr-cross__bottom--${type.name}"
        style="left:${(TOP_W - type.w) / 2}px;width:${type.w}px;height:${type.h}px"></div>`;
    obstaclesLayer.appendChild(el);
    g.obstacles.push({
      x, el,
      rects: [
        { dx: 0, w: TOP_W, top: 0, bottom: gapTop },
        { dx: bx - x, w: type.w, top: bottomTop, bottom: GROUND_Y, ground: true },
      ],
    });
    if (Math.random() < 0.75) spawnCoin(x + TOP_W / 2 - 16, gapTop + (bottomTop - gapTop) / 2 - 16);
  }

  // Cartel bajo: no se puede saltar, hay que deslizarse por debajo
  function spawnSign(x) {
    const signBottom = GROUND_Y - 44;
    const el = document.createElement('div');
    el.className = 'dr-sign';
    el.innerHTML = `<div class="dr-sign__pole" style="height:${signBottom - 60}px"></div><div class="dr-sign__board"></div>`;
    obstaclesLayer.appendChild(el);
    g.obstacles.push({ x, el, rects: [{ dx: 0, w: 110, top: 0, bottom: signBottom }] });
    spawnCoin(x + 39, GROUND_Y - 36);
  }

  function spawnCoin(x, y) {
    const el = document.createElement('div');
    el.className = 'dr-coin';
    entitiesLayer.appendChild(el);
    g.coins.push({ x, y, el, taken: false });
  }

  // Devuelve false si justo en la entrada hay un obstáculo (el perro no puede aparecer adentro)
  function spawnDog() {
    const x = WORLD_W + 40;
    const blocked = g.obstacles.some((o) => o.rects.some((r) => r.ground &&
      x < o.x + r.dx + r.w + 10 && x + 72 > o.x + r.dx - 10));
    if (blocked) return false;
    const el = document.createElement('div');
    el.className = 'dr-dog';
    el.innerHTML = '<div class="dr-dog__sprite"></div>';
    entitiesLayer.appendChild(el);
    g.dogs.push({ x, y: GROUND_Y - 48, speed: rand(60, 120), dir: -1, el, hit: false, dead: false });
    return true;
  }

  function floatText(x, y, text, good) {
    const el = document.createElement('div');
    el.className = `dr-float-text ${good ? 'dr-float-text--good' : 'dr-float-text--bad'}`;
    el.textContent = text;
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    entitiesLayer.appendChild(el);
    el.addEventListener('animationend', () => el.remove());
  }

  // ---------- Acciones y animaciones del repartidor ----------
  function setPlayerClass(cls) {
    player.className = 'dr-player' + (cls ? ` ${cls}` : '');

  }

  function oneShot(cls, ms) {
    player.classList.remove(cls);
    void player.offsetWidth; // reinicia la animación
    player.classList.add(cls);
    setTimeout(() => player.classList.remove(cls), ms);
  }

  function jump() {
    if (state !== 'playing' || g.jumpsLeft <= 0) return;
    const first = g.onGround;
    g.vy = first ? JUMP : DOUBLE_JUMP;
    g.onGround = false;
    g.jumpsLeft -= 1;
    g.sliding = 0;
    g.slideHeld = false;
    player.classList.remove('is-sliding');
    player.classList.add('is-air');
    if (!first) oneShot('is-double', 450);
    play('jump');
  }

  function slideOrDive(pressed) {
    if (state !== 'playing') return;
    if (!pressed) { g.slideHeld = false; return; }
    if (g.onGround) {
      g.slideHeld = true;
      g.sliding = SLIDE_MIN;
      player.classList.add('is-sliding');
    } else {
      g.vy = Math.max(g.vy, FAST_FALL);
    }
  }

  // ---------- Bucle principal ----------
  const FEET = PLAYER_SIZE;  // los pies del repartidor están en y + FEET
  const DOG_W = 72;
  const DOG_H = 48;

  // Rectángulos del piso (obstáculos sobre los que se puede caer parado)
  function groundRects() {
    const list = [];
    for (const o of g.obstacles) {
      for (const r of o.rects) {
        if (r.ground) list.push({ left: o.x + r.dx, right: o.x + r.dx + r.w, top: r.top, o });
      }
    }
    return list;
  }

  function update(dt) {
    const order = currentOrder();
    if (g.slowTimer > 0) g.slowTimer -= dt;
    if (g.invulnerable > 0) {
      g.invulnerable -= dt;
      if (g.invulnerable <= 0) player.classList.remove('is-invulnerable');
    }
    const speed = order.speed * (g.slowTimer > 0 ? DOG_SLOW : 1);
    const dx = speed * dt;
    g.distance += dx;
    g.orderDistance += dx;
    g.orderTime += dt;
    const remaining = order.meters * PX_PER_METER - g.orderDistance; // px hasta el cliente
    const nearDestination = remaining < WORLD_W + 250;

    // Distancia horizontal variable entre obstáculos (cerca del cliente, la vereda queda libre)
    g.nextObstacleX -= dx;
    if (g.nextObstacleX < WORLD_W + 40) {
      if (!nearDestination) {
        if (g.distance > 1800 && Math.random() < 0.22) spawnSign(g.nextObstacleX);
        else spawnCrossing(g.nextObstacleX);
      }
      g.nextObstacleX += rand(330, 540);
    }
    for (const o of g.obstacles) o.x -= dx;

    // ---- Física del repartidor: piso, plataformas y saltos ----
    const prevFeet = g.y + FEET;
    if (!g.onGround) {
      g.vy += GRAVITY * dt;
      g.y += g.vy * dt;
    }
    const feetL = PLAYER_X + 24;
    const feetR = PLAYER_X + 56;
    let support = GROUND_Y;
    for (const r of groundRects()) {
      // Solo sirve de apoyo si veníamos desde arriba
      if (r.left + 3 < feetR && r.right - 3 > feetL && prevFeet <= r.top + 6) support = Math.min(support, r.top);
    }
    const feet = g.y + FEET;
    if (g.onGround && feet < support - 1) {
      // Se terminó la plataforma: empieza a caer (le queda un salto)
      g.onGround = false;
      g.jumpsLeft = 50;
      player.classList.add('is-air');
    } else if (!g.onGround && g.vy >= 0 && feet >= support) {
      g.y = support - FEET;
      g.vy = 0;
      g.onGround = true;
      g.jumpsLeft = 50;
      player.classList.remove('is-air');
      oneShot('is-land', 220);
    }
    if (g.sliding > 0) g.sliding -= dt;
    if (g.sliding <= 0 && !g.slideHeld) player.classList.remove('is-sliding');
    const sliding = player.classList.contains('is-sliding');
    const box = playerBox(sliding);

    // Choque de frente con un obstáculo (caer encima no lastima)
    if (g.invulnerable <= 0) {
      outer: for (const o of g.obstacles) {
        for (const r of o.rects) {
          const top = r.ground ? r.top + 6 : r.top;
          if (overlap(box, { left: o.x + r.dx + 5, right: o.x + r.dx + r.w - 5, top, bottom: r.bottom - 2 })) {
            hurt(o, `¡Auch! -${OBSTACLE_DAMAGE}% pedido`);
            break outer;
          }
        }
      }
    }
    g.obstacles = g.obstacles.filter((o) => {
      if (o.x < -160) { o.el.remove(); return false; }
      return true;
    });

    // Monedas: suman propina
    for (const c of g.coins) {
      c.x -= dx;
      if (!c.taken && overlap(box, { left: c.x + 4, right: c.x + 28, top: c.y + 4, bottom: c.y + 28 })) {
        c.taken = true;
        c.el.classList.add('is-collected');
        g.money += COIN_VALUE;
        floatText(c.x, c.y - 10, `+$${COIN_VALUE}`, true);
        play('coin');
        setTimeout(() => c.el.remove(), 450);
      }
    }
    g.coins = g.coins.filter((c) => {
      if (c.x < -40 || c.taken) { if (!c.taken) c.el.remove(); return false; }
      return true;
    });

    // ---- Perros ----
    g.dogTimer -= dt;
    if (g.dogTimer <= 0 && !nearDestination) {
      if (spawnDog()) g.dogTimer = rand(2.6, 5) - g.orderIndex * 0.25;
      else g.dogTimer = 0.4; // había un obstáculo justo ahí: reintenta enseguida
    }
    const walls = groundRects();
    for (const d of g.dogs) {
      if (d.dead) { d.x -= dx - (d.hit ? 160 * dt : 0); continue; }
      d.x -= dx;
      d.x += d.dir * d.speed * dt;
      // Como en los plataformas clásicos: si choca contra un obstáculo, se da vuelta
      const dl = d.x + 6;
      const dr = d.x + DOG_W - 6;
      for (const w of walls) {
        if (dl < w.right && dr > w.left) {
          if (d.dir < 0) { d.x = w.right - 6; d.dir = 1; } else { d.x = w.left - DOG_W + 6; d.dir = -1; }
          d.el.classList.toggle('is-flipped', d.dir > 0);
          break;
        }
      }
      const dogBox = { left: d.x + 8, right: d.x + DOG_W - 10, top: d.y + 12, bottom: d.y + DOG_H - 2 };
      if (!overlap(box, dogBox)) continue;
      if (g.vy > 0 && prevFeet <= d.y + 20) {
        // Caer encima: el perro desaparece y el repartidor rebota
        d.dead = true;
        d.el.classList.add('is-stomped');
        setTimeout(() => d.el.remove(), 500);
        g.vy = -480;
        g.onGround = false;
        g.jumpsLeft = 1;
        player.classList.add('is-air');
        floatText(d.x + 10, d.y - 20, '¡Pisotón!', true);
        play('stomp');
      } else if (g.invulnerable <= 0) {
        // De frente: muerde y daña el pedido, pero NO quita vidas ni termina el juego
        d.hit = true;
        d.dead = true; // se va corriendo y ya no muerde
        d.el.classList.add('is-hit');
        setTimeout(() => d.el.remove(), 800);
        bitten();
      }
    }
    g.dogs = g.dogs.filter((d) => {
      if (d.x < -90 || d.x > WORLD_W + 200 || (d.dead && !d.el.isConnected)) { d.el.remove(); return false; }
      return true;
    });

    // ---- Cliente que espera el pedido ----
    if (!g.npc && remaining < WORLD_W - PLAYER_X) spawnNpc(PLAYER_X + 78 + remaining);
    if (g.npc) g.npc.x -= dx;
    for (const n of g.leavingNpcs) n.x -= dx;
    g.leavingNpcs = g.leavingNpcs.filter((n) => {
      if (n.x < -120) { n.el.remove(); return false; }
      return true;
    });

    if (remaining <= 0) completeOrder();
  }

  function playerBox(sliding) {
    if (sliding) return { left: PLAYER_X + 10, right: PLAYER_X + 72, top: g.y + 50, bottom: g.y + 78 };
    return { left: PLAYER_X + 22, right: PLAYER_X + 58, top: g.y + 8, bottom: g.y + 78 };
  }

  // Choque de frente con un obstáculo: el repartidor nunca muere, pero el pedido se golpea
  function hurt(source, text) {
    if (godMode) return;
    source.el.classList.add('is-hit');
    g.invulnerable = HURT_INVULNERABLE;
    g.slowTimer = 0.6;
    oneShot('is-hurt', 1000);
    oneShot('is-impact', 650);
    player.classList.add('is-invulnerable');
    floatText(PLAYER_X + 6, g.y - 16, text, false);
    play('hit');
    damageOrder(OBSTACLE_DAMAGE);
  }

  // Mordida de perro: animación de daño, frena un momento y parpadea
  function bitten() {
    g.invulnerable = 1.2;
    g.slowTimer = 1;
    oneShot('is-bitten', 900);
    player.classList.add('is-invulnerable');
    floatText(PLAYER_X + 6, g.y - 16, `¡Mordida! -${DOG_DAMAGE}% pedido`, false);
    play('hit');
    damageOrder(DOG_DAMAGE);
  }

  const overlap = (a, b) => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;

  // Cada golpe baja el estado del pedido. Nunca baja del mínimo: siempre se entrega,
  // pero cuanto peor llega, menos se cobra.
  function damageOrder(amount) {
    g.integrity = Math.max(MIN_INTEGRITY, g.integrity - amount);
    updateIntegrity();
    ui.integrityCard.classList.remove('is-damaged');
    void ui.integrityCard.offsetWidth;
    ui.integrityCard.classList.add('is-damaged');
    // "-20%" que salta sobre la barra de vida del pedido
    const pop = document.createElement('span');
    pop.className = 'dr-hud__damage';
    pop.textContent = `-${amount}%`;
    ui.integrityCard.appendChild(pop);
    pop.addEventListener('animationend', () => pop.remove());
  }

  // ---------- Cliente (NPC) ----------
  function spawnNpc(x) {
    const el = document.createElement('div');
    el.className = 'dr-npc';
    el.innerHTML = '<div class="dr-npc__pin">📍</div><div class="dr-npc__sprite"></div><div class="dr-npc__bubble">¡Acá!</div>';
    entitiesLayer.appendChild(el);
    g.npc = { x, el };
  }

  function dismissNpc(happy) { // happy = lo que dice el cliente
    if (!g.npc) return;
    const n = g.npc;
    g.npc = null;
    n.el.classList.add('is-happy');
    n.el.querySelector('.dr-npc__bubble').textContent = happy;
    g.leavingNpcs.push(n);
  }

  // El repartidor le alcanza el paquete al cliente
  function handOver(o) {
    if (!g.npc) return;
    const parcel = document.createElement('div');
    parcel.className = 'dr-parcel';
    parcel.textContent = o.icon;
    parcel.style.left = `${PLAYER_X + 40}px`;
    parcel.style.top = `${g.y + 20}px`;
    parcel.style.setProperty('--to-x', `${g.npc.x + 14 - (PLAYER_X + 40)}px`);
    parcel.style.setProperty('--to-y', `${GROUND_Y - 62 - (g.y + 20)}px`);
    entitiesLayer.appendChild(parcel);
    parcel.addEventListener('animationend', () => parcel.remove());
    dismissNpc(g.integrity >= 80 ? '¡Perfecto, gracias!' : g.integrity >= 40 ? 'Gracias…' : '¡Está todo aplastado!');
  }

  function completeOrder() {
    const o = currentOrder();
    const expected = o.meters / (o.speed / PX_PER_METER); // segundos sin frenadas
    const timeBonus = Math.max(0, Math.round((expected * 1.08 - g.orderTime) * 20));
    const integrityPay = Math.round(o.pay * (g.integrity / 100));
    const total = integrityPay + timeBonus;
    g.money += total;
    g.delivered += 1;
    g.integritySum += g.integrity;
    handOver(o);
    oneShot('is-delivered', 1000);
    floatText(PLAYER_X, g.y - 18, `+$${total}`, true);
    play('win');
    showToast(`¡${o.icon} Entregado! +$${total}`, `Pedido ${g.integrity}%: $${integrityPay} · Rapidez: $${timeBonus}`);
    nextOrder();
  }

  function nextOrder() {
    if (g.orderIndex + 1 >= ORDERS.length) {
      finish();
      return;
    }
    const idx = g.orderIndex + 1;
    startOrder(idx, false);
    setTimeout(() => {
      if ((state === 'playing' || state === 'paused') && g.orderIndex === idx) announceOrder(ORDERS[idx]);
    }, 2700);
  }

  function finish() {
    state = 'over';
    world.classList.remove('is-playing');
    sounds.music.pause();
    play('win');
    setPlayerClass('is-delivered');
    if (g.money > best) {
      best = g.money;
      try { localStorage.setItem('deliveryRushBest', String(best)); } catch (e) { /* sin storage */ 

      }
    }
    const avg = Math.round(g.integritySum / ORDERS.length);
    ui.endTitle.textContent = '¡Jornada completa!';
    ui.endText.textContent = avg >= 80
      ? 'Entregaste todos los pedidos casi intactos. ¡Los clientes te aman!'
      : avg >= 50
        ? 'Entregaste todos los pedidos, aunque algunos llegaron golpeados.'
        : 'Entregaste todo… pero los pedidos llegaron hechos un desastre. ¡Cuidado con los golpes!';
    ui.endMoney.textContent = `$${g.money}`;
    ui.endDelivered.textContent = `${avg}%`;
    ui.endMeters.textContent = `${Math.floor(g.distance / PX_PER_METER)} m`;
    ui.endBest.textContent = `$${best}`;
    showScreen(ui.end);
  }

  // ---------- Render ----------
  function render() {
    for (const l of LAYERS) l.el.style.backgroundPositionX = `${-((g.distance * l.factor) % 800)}px`;
    player.style.transform = `translate(${PLAYER_X}px, ${g.y}px)`;
    for (const o of g.obstacles) o.el.style.transform = `translateX(${o.x}px)`;
    for (const c of g.coins) c.el.style.transform = `translate(${c.x}px, ${c.y}px)`;
    for (const d of g.dogs) d.el.style.transform = `translate(${d.x}px, ${d.y}px)`;
    if (g.npc) g.npc.el.style.transform = `translate(${g.npc.x}px, ${GROUND_Y - 96}px)`;
    for (const n of g.leavingNpcs) n.el.style.transform = `translate(${n.x}px, ${GROUND_Y - 96}px)`;

    const o = currentOrder();
    const meters = Math.min(o.meters, Math.floor(g.orderDistance / PX_PER_METER));
    ui.meters.textContent = `${o.meters - meters} m`;
    ui.progress.style.width = `${(meters / o.meters) * 100}%`;
    ui.money.textContent = `$${g.money}`;
  }

  function updateIntegrity() {
    ui.integrity.style.width = `${g.integrity}%`;
    ui.integrity.style.backgroundPosition = `${100 - g.integrity}% 0`;
    ui.integrityText.textContent = `${g.integrity}%`;
  }

  function loop(time) {
    const dt = Math.min(0.033, (time - lastTime) / 1000 || 0);
    lastTime = time;
    if (state === 'playing') {
      update(dt);
      if (state === 'playing') render();
    }
    requestAnimationFrame(loop);
  }

  // ---------- Pantallas ----------
  let toastTimer = 0;
  function showToast(title, detail, bad = false) {
    ui.toast.innerHTML = '';
    ui.toast.append(title);
    if (detail) {
      const s = document.createElement('small');
      s.textContent = detail;
      ui.toast.appendChild(s);
    }
    ui.toast.className = `dr-toast${bad ? ' dr-toast--bad' : ''}`;
    void ui.toast.offsetWidth;
    ui.toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => ui.toast.classList.remove('is-visible'), 2700);
  }

  function showScreen(screen) {
    for (const s of [ui.menu, ui.help, ui.pause, ui.end]) s.hidden = s !== screen;
    const button = screen && screen.querySelector('button');
    if (button) button.focus({ preventScroll: true });
  }

  function startGame() {
    newGame();
    showScreen(null);
    state = 'playing';
    world.classList.add('is-playing');
    world.classList.remove('is-paused');
    lastTime = performance.now();
    announceOrder(currentOrder());
    frame.focus({ preventScroll: true });
    playMusic();
  }

  function togglePause() {
    if (state === 'playing') {
      state = 'paused';
      world.classList.add('is-paused');
      sounds.music.pause();
      showScreen(ui.pause);
    } else if (state === 'paused') {
      state = 'playing';
      world.classList.remove('is-paused');
      showScreen(null);
      lastTime = performance.now();
      frame.focus({ preventScroll: true });
      playMusic();
    }
  }

  function backToMenu() {
    state = 'menu';
    world.classList.remove('is-playing', 'is-paused');
    sounds.music.pause();
    newGame();
    setPlayerClass('is-idle');
    render();
    showScreen(ui.menu);
  }

  // ---------- Controles ----------
  const isTyping = () => {
    const el = document.activeElement;
    return el && (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT' || el.isContentEditable);
  };
  const JUMP_KEYS = ['Space', 'ArrowUp', 'KeyW'];
  const DOWN_KEYS = ['ArrowDown', 'KeyS'];

  document.addEventListener('keydown', (e) => {
    if (isTyping()) return;
    const inGame = state === 'playing' || state === 'paused';
    if (state === 'playing' && JUMP_KEYS.includes(e.code)) {
      e.preventDefault();
      if (!e.repeat) jump();
    } else if (state === 'playing' && DOWN_KEYS.includes(e.code)) {
      e.preventDefault();
      if (!e.repeat) slideOrDive(true);
    } else if (inGame && (e.code === 'KeyP' || e.code === 'Escape')) {
      e.preventDefault();
      togglePause();
    } else if (inGame && (JUMP_KEYS.includes(e.code) || DOWN_KEYS.includes(e.code))) {
      e.preventDefault();
    }
  });

  document.addEventListener('keyup', (e) => {
    if (DOWN_KEYS.includes(e.code)) slideOrDive(false);
  });

  world.addEventListener('pointerdown', (e) => {
    if (e.target.closest('button')) return;
    if (state === 'playing') {
      e.preventDefault();
      jump();
    }
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && state === 'playing') togglePause();
  });

  $('#dr-play').addEventListener('click', startGame);
  $('#dr-open-help').addEventListener('click', () => showScreen(ui.help));
  $('#dr-help-back').addEventListener('click', () => showScreen(ui.menu));
  $('#dr-help-play').addEventListener('click', startGame);
  $('#dr-resume').addEventListener('click', togglePause);
  $('#dr-pause-menu').addEventListener('click', backToMenu);
  $('#dr-retry').addEventListener('click', startGame);
  $('#dr-end-menu').addEventListener('click', backToMenu);
  ui.pauseBtn.addEventListener('click', togglePause);
  ui.sound.addEventListener('click', () => {
    soundOn = !soundOn;
    ui.sound.textContent = soundOn ? '♪' : '✕';
    ui.sound.setAttribute('aria-label', soundOn ? 'Silenciar sonido' : 'Activar sonido');
    if (!soundOn) sounds.music.pause();
    else if (state === 'playing') playMusic();
  });

  // ---------- Escalado: el mundo de 800x500 entra en el cuadro ----------
  const fit = () => { world.style.transform = `scale(${frame.clientWidth / WORLD_W})`; };
  new ResizeObserver(fit).observe(frame);
  fit();

  backToMenu();
  requestAnimationFrame(loop);

  // Solo para pruebas (?debug): avanzar la simulación manualmente
  if (new URLSearchParams(location.search).has('debug')) {
    window.deliveryRushDebug = {
      step(seconds, autopilot = false) {
        for (let t = 0; t < seconds && state === 'playing'; t += 1 / 60) {
          if (autopilot) autoplay();
          update(1 / 60);
        }
        if (state === 'playing') render();
        return {
          state, y: Math.round(g.y), money: g.money, integrity: g.integrity, order: g.orderIndex,
          delivered: g.delivered, meters: Math.floor(g.distance / PX_PER_METER), gap: Math.round(currentGap())
        };
      },
      get state() { return state; },
      set god(v) { godMode = v; },
      get game() { return g; },
      spawnDog: () => spawnDog(),
      pause: () => { if (state === 'playing') togglePause(); },
    };
    // Piloto automático para las pruebas: simula cada salto con la misma física
    let plannedDouble = -1;
    const survives = (o, speed, doubleAt) => {
      let y = g.y, vy = JUMP, x = o.x, t = 0, used = false;
      for (let k = 0; k < 120; k++) {
        const dt = 1 / 60;
        t += dt;
        if (!used && doubleAt >= 0 && t >= doubleAt) { vy = DOUBLE_JUMP; used = true; }
        vy += GRAVITY * dt; y = Math.min(groundTop(), y + vy * dt); x -= speed * dt;
        const box = { left: PLAYER_X + 22, right: PLAYER_X + 58, top: y + 8, bottom: y + 78 };
        for (const r of o.rects) {
          if (overlap(box, { left: x + r.dx + 5, right: x + r.dx + r.w - 5, top: r.top, bottom: r.bottom - 2 })) return false;
        }
        if (x + 120 < PLAYER_X) return true;
      }
      return true;
    };
    const autoplay = () => {
      if (plannedDouble >= 0) {
        plannedDouble -= 1 / 60;
        if (plannedDouble < 0) jump();
      }
      const next = g.obstacles.find((o) => o.x + 120 > PLAYER_X);
      if (!next) return;
      const dist = next.x - PLAYER_X;
      if (next.el.classList.contains('dr-sign')) {
        if (dist < 90 && g.onGround && !g.slideHeld) slideOrDive(true);
        if (dist < -100) slideOrDive(false);
        return;
      }
      if (!g.onGround || dist > 260 || dist < 0) return;
      const speed = currentOrder().speed * (g.slowTimer > 0 ? DOG_SLOW : 1);
      for (let d = -0.03; d < 0.5; d += 0.03) {
        if (survives(next, speed, d)) { jump(); plannedDouble = d; return; }
      }
    };
  }
})();
