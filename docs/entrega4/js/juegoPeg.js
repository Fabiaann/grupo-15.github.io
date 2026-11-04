import { Juego } from "./juego.js";

const juego = new Juego();
const tablero = juego.tablero;
const tableroHTML = document.getElementById("tablero");

// Solo los canvas de las fichas pueden iniciar un arrastre.
document.addEventListener("dragstart", (evento) => {
    if (!(evento.target instanceof HTMLCanvasElement)) {
        evento.preventDefault();
    }
});

let fichaSeleccionada = null;
let fichaArrastrada = null;
let ultimoPuntoArrastre = null;
let arrastrePointerActivo = false;
let arrastrePointerMovio = false;
let suprimirSiguienteClick = false;
let elementoFichaArrastrada = null;
const imagenHongo = new Image();
imagenHongo.src = "../assets/fungi-piece-reference.png";
const DURACION_PARTIDA = 300;
let segundosRestantes = DURACION_PARTIDA;
let temporizador = null;
let partidaIniciada = false;
let musicaActivada = true;
let efectosActivados = true;
const sonidoPickup = new Audio(new URL("../sound/pickup.mp3", import.meta.url));
const sonidosDrop = [
    new Audio(new URL("../sound/drop1.mp3", import.meta.url)),
    new Audio(new URL("../sound/drop2.mp3", import.meta.url))
];

const menuPrincipal = document.getElementById("fungi-main-menu");
setTimeout(() => menuPrincipal?.classList.add("is-ready"), 3000);
const sonidoBoton = new Audio(new URL("../sound/wood-fx.MP3", import.meta.url));
const sonidoTransicion = new Audio(new URL("../sound/woosh.MP3", import.meta.url));
const VOLUMEN_EFECTOS = 0.85;
sonidoPickup.volume = VOLUMEN_EFECTOS;
sonidosDrop.forEach((sonido) => sonido.volume = VOLUMEN_EFECTOS);
sonidoBoton.volume = VOLUMEN_EFECTOS;
sonidoTransicion.volume = VOLUMEN_EFECTOS;
const musicaFondo = new Audio(new URL("../sound/background-music.mp3", import.meta.url));
const VOLUMEN_MUSICA = 0.25;
musicaFondo.loop = true;
musicaFondo.volume = VOLUMEN_MUSICA;

function iniciarMusicaFondo() {
    if (!musicaActivada) return;
    if (musicaFondo.paused) {
        musicaFondo.play().catch(() => {
            // El navegador puede exigir una interacción antes de permitir autoplay.
        });
    }
}

// Intenta comenzar al cargar y vuelve a intentarlo con la primera interacción.
iniciarMusicaFondo();
document.addEventListener("pointerdown", iniciarMusicaFondo);
document.addEventListener("keydown", iniciarMusicaFondo);

function reproducirSonido(sonido) {
    if (!efectosActivados) return;
    sonido.currentTime = 0;
    sonido.play().catch(() => {
        // El navegador puede bloquear el audio si no proviene de una interacción.
    });
}

function reproducirSonidoBoton() {
    if (!efectosActivados) return;
    sonidoBoton.currentTime = 0;
    sonidoBoton.play().catch(() => { });
}

document.addEventListener("click", (evento) => {
    if (evento.target.closest("button")) {
        reproducirSonidoBoton();
    }
});

function reproducirDropAleatorio() {
    const sonido = sonidosDrop[Math.floor(Math.random() * sonidosDrop.length)];
    reproducirSonido(sonido);
}

function dibujarHongo(canvas, tipo) {
    const contexto = canvas.getContext("2d");
    contexto.clearRect(0, 0, canvas.width, canvas.height);
    contexto.save();
    if (tipo === "tipoB") contexto.filter = "sepia(1) saturate(1.35) brightness(.88) contrast(1.05)";
    if (tipo === "tipoC") contexto.filter = "hue-rotate(285deg) saturate(1.05)";
    // Recorta el margen transparente de la referencia para centrar el hongo
    // dentro del agujero, en lugar de dibujar el PNG completo desplazado.
    contexto.drawImage(imagenHongo, 180, 170, 900, 940, 2, 2, canvas.width - 4, canvas.height - 4);
    contexto.restore();
}

function mostrarHints(ficha) {
    for (const m of juego.getMovimientosValidos(ficha)) {
        const destino = tableroHTML.querySelector(
            `.casilla[data-fila="${m.fila}"][data-col="${m.col}"]`
        );
        if (destino) destino.classList.add("movimientoValido");
    }
}

function limpiarHints() {
    tableroHTML.querySelectorAll(".movimientoValido")
        .forEach(c => c.classList.remove("movimientoValido"));
}

function actualizarEstadoVisual() {
    const movimientos = document.getElementById("peg-movimientos");
    const fichas = document.getElementById("peg-fichas");
    if (movimientos) movimientos.textContent = juego.movimientos;
    if (fichas) fichas.textContent = tablero.contarFichas();
}

function formatoTiempo(segundos) {
    const minutos = Math.floor(segundos / 60).toString().padStart(2, "0");
    const resto = (segundos % 60).toString().padStart(2, "0");
    return `${minutos}:${resto}`;
}

function actualizarTiempo() {
    const tiempo = document.getElementById("peg-tiempo");
    if (tiempo) tiempo.textContent = formatoTiempo(segundosRestantes);
}

function detenerTemporizador() {
    clearInterval(temporizador);
    temporizador = null;
}

function mostrarFinPartida() {
    const modal = document.getElementById("peg-fin");
    const titulo = document.getElementById("peg-fin-titulo");
    const mensaje = document.getElementById("peg-fin-mensaje");
    if (!modal) return;

    if (juego.estado === "sin_movimientos") {
        titulo.textContent = "DERROTA.";
        mensaje.textContent = "Te quedaste sin movimientos.";
    } else if (juego.estado === "ganado") {
        titulo.textContent = "¡Felicidades!";
        mensaje.textContent = "Has completado el juego";
    } else if (juego.estado === "tiempo_agotado") {
        titulo.textContent = "Se acabó el tiempo";
        mensaje.textContent = "Volver a intentar";
    } else {
        modal.hidden = true;
        return;
    }

    modal.hidden = false;
}

function iniciarTemporizador() {
    detenerTemporizador();
    temporizador = setInterval(() => {
        segundosRestantes -= 1;
        actualizarTiempo();
        if (segundosRestantes <= 0) {
            detenerTemporizador();
            tableroHTML.setAttribute("aria-label", "Tiempo agotado");
            juego.terminarPorTiempo();
            mostrarFinPartida();
        }
    }, 1000);
}

function comenzarPartida() {
    const menu = document.getElementById("fungi-main-menu");
    const etapa = document.getElementById("peg-stage");
    fichaSeleccionada = null;
    partidaIniciada = true;
    reproducirSonido(sonidoTransicion);
    etapa?.classList.add("partida-iniciada");
    document.getElementById("peg-fin")?.setAttribute("hidden", "");
    actualizarTiempo();
    actualizarEstadoVisual();
    dibujarTablero();
    menu?.classList.add("is-leaving");
    iniciarTemporizador();
}

function volverAlMenu() {
    const menu = document.getElementById("fungi-main-menu");
    const etapa = document.getElementById("peg-stage");
    reproducirSonido(sonidoTransicion);
    detenerTemporizador();
    partidaIniciada = false;
    etapa?.classList.remove("partida-iniciada");
    document.getElementById("peg-config")?.setAttribute("hidden", "");
    fichaSeleccionada = null;
    actualizarEstadoVisual();
    dibujarTablero();
    menu?.classList.remove("is-leaving");
}

function seleccionarFicha(ficha) {
    fichaSeleccionada = ficha;
    limpiarHints();
    mostrarHints(ficha);
    reproducirSonido(sonidoPickup);
}

function actualizarHongoArrastrado(x, y) {
    if (!fichaArrastrada) return;
    const anterior = ultimoPuntoArrastre || { x, y };
    const inclinacion = Math.max(-12, Math.min(12, (x - anterior.x) * 0.35));
    fichaArrastrada.style.left = `${x}px`;
    fichaArrastrada.style.top = `${y}px`;
    fichaArrastrada.style.setProperty("--drag-angle", `${inclinacion}deg`);
    ultimoPuntoArrastre = { x, y };
}

function crearHongoArrastrado(fichaHTML, ficha) {
    fichaArrastrada = document.createElement("canvas");
    fichaArrastrada.className = `ficha-drag-ghost ${ficha.tipo}`;
    fichaArrastrada.width = 96;
    fichaArrastrada.height = 96;
    dibujarHongo(fichaArrastrada, ficha.tipo);
    document.body.appendChild(fichaArrastrada);

    const imagenTransparente = document.createElement("canvas");
    imagenTransparente.width = 1;
    imagenTransparente.height = 1;
    return imagenTransparente;
}

function crearEsporas(rectangulo) {
    const cantidad = 9;
    const centroX = rectangulo.left + rectangulo.width / 2;
    const centroY = rectangulo.top + rectangulo.height / 2;

    for (let i = 0; i < cantidad; i += 1) {
        const espora = document.createElement("span");
        espora.className = "hongo-espora";
        espora.style.left = `${centroX}px`;
        espora.style.top = `${centroY}px`;
        espora.style.setProperty("--espora-x", `${(Math.random() - .5) * 46}px`);
        espora.style.setProperty("--espora-y", `${-12 - Math.random() * 34}px`);
        espora.style.animationDelay = `${Math.random() * .12}s`;
        document.body.appendChild(espora);
        setTimeout(() => espora.remove(), 900);
    }
}

function crearPolvo(rectangulo) {
    const cantidad = 12;
    const centroX = rectangulo.left + rectangulo.width / 2;
    const centroY = rectangulo.top + rectangulo.height * .72;

    for (let i = 0; i < cantidad; i += 1) {
        const particula = document.createElement("span");
        particula.className = "hongo-polvo";
        particula.style.left = `${centroX}px`;
        particula.style.top = `${centroY}px`;
        particula.style.setProperty("--polvo-x", `${(Math.random() - .5) * 48}px`);
        particula.style.setProperty("--polvo-y", `${-8 - Math.random() * 22}px`);
        particula.style.animationDelay = `${Math.random() * .1}s`;
        document.body.appendChild(particula);
        setTimeout(() => particula.remove(), 850);
    }
}

function eliminarHongoArrastrado() {
    fichaArrastrada?.remove();
    fichaArrastrada = null;
    ultimoPuntoArrastre = null;
}

function terminarArrastrePointer() {
    document.body.classList.remove("arrastrando");
    elementoFichaArrastrada?.classList.remove("ficha-levantada");
    elementoFichaArrastrada = null;
    eliminarHongoArrastrado();
    arrastrePointerActivo = false;
}

document.addEventListener("pointermove", (evento) => {
    if (!arrastrePointerActivo) return;
    if (Math.abs(evento.movementX) > 0 || Math.abs(evento.movementY) > 0) {
        arrastrePointerMovio = true;
    }
    actualizarHongoArrastrado(evento.clientX, evento.clientY);
});

document.addEventListener("pointerup", (evento) => {
    if (!arrastrePointerActivo) return;
    suprimirSiguienteClick = true;

    if (arrastrePointerMovio && fichaSeleccionada) {
        const destino = document.elementFromPoint(evento.clientX, evento.clientY)?.closest(".casilla");
        const fila = destino ? Number(destino.dataset.fila) : NaN;
        const col = destino ? Number(destino.dataset.col) : NaN;

        if (destino && tableroHTML.contains(destino) && juego.esMovimientoValido(fichaSeleccionada, fila, col)) {
            const resultado = juego.mover(fichaSeleccionada, fila, col);
            if (resultado !== null) {
                reproducirDropAleatorio();
                crearPolvo(destino.getBoundingClientRect());
                finalizarMovimiento();
            }
        } else {
            fichaSeleccionada = null;
            limpiarHints();
        }
    }

    terminarArrastrePointer();
});

document.addEventListener("dragover", (evento) => {
    if (fichaArrastrada) actualizarHongoArrastrado(evento.clientX, evento.clientY);
});

function finalizarMovimiento() {
    fichaSeleccionada = null;
    limpiarHints();
    dibujarTablero();
    actualizarEstadoVisual();
    if (juego.estado !== "jugando") {
        detenerTemporizador();
        mostrarFinPartida();
    }
}

function dibujarTablero() {

    tableroHTML.innerHTML = "";

    for (let f = 0; f < tablero.filas; f++) {
        for (let c = 0; c < tablero.cols; c++) {

            const casilla = document.createElement("div");

            if (tablero.esCeldaValida(f, c)) {

                casilla.classList.add("casilla");
                casilla.dataset.fila = f;
                casilla.dataset.col = c;

                const ficha = tablero.getFicha(f, c);

                if (ficha) {
                    const fichaHTML = document.createElement("canvas");
                    fichaHTML.classList.add("ficha", ficha.tipo); 
                    fichaHTML.width = 96;
                    fichaHTML.height = 96;
                    fichaHTML.setAttribute("role", "img");
                    fichaHTML.setAttribute("aria-label", "Hongo seleccionable");
                    fichaHTML.draggable = false;
                    if (imagenHongo.complete) dibujarHongo(fichaHTML, ficha.tipo);
                    else imagenHongo.addEventListener("load", () => dibujarHongo(fichaHTML, ficha.tipo), { once: true });

                  
                    fichaHTML.addEventListener("dragstart", e => {
                        seleccionarFicha(ficha);
                        document.body.classList.add("arrastrando");
                        const imagenTransparente = crearHongoArrastrado(fichaHTML, ficha);
                        crearEsporas(fichaHTML.getBoundingClientRect());
                        e.dataTransfer.setDragImage(imagenTransparente, 0, 0);
                        e.dataTransfer.effectAllowed = "move";
                       
                        mostrarHints(ficha);
                      
                        setTimeout(() => fichaHTML.classList.add("efectoFichaSeleccionada"), 0);
                    });

                 
                    fichaHTML.addEventListener("dragend", () => {
                        document.body.classList.remove("arrastrando");
                        eliminarHongoArrastrado();
                        fichaHTML.classList.remove("efectoFichaSeleccionada");
                        limpiarHints();
                        fichaSeleccionada = null;
                    });

                    fichaHTML.addEventListener("click", (evento) => {
                        evento.stopPropagation();
                        if (suprimirSiguienteClick) {
                            suprimirSiguienteClick = false;
                            return;
                        }
                        seleccionarFicha(ficha);
                    });

                    fichaHTML.addEventListener("pointerdown", (evento) => {
                        if (evento.button !== 0) return;
                        evento.preventDefault();
                        evento.stopPropagation();
                        seleccionarFicha(ficha);
                        arrastrePointerActivo = true;
                        arrastrePointerMovio = false;
                        elementoFichaArrastrada = fichaHTML;
                        fichaHTML.classList.add("ficha-levantada");
                        document.body.classList.add("arrastrando");
                        crearHongoArrastrado(fichaHTML, ficha);
                        crearEsporas(fichaHTML.getBoundingClientRect());
                        actualizarHongoArrastrado(evento.clientX, evento.clientY);
                    });

                    casilla.appendChild(fichaHTML);
                }

                casilla.addEventListener("dragover", e => {
                    if (fichaSeleccionada && juego.esMovimientoValido(fichaSeleccionada, f, c)) {
                        e.preventDefault();
                     
    e.dataTransfer.dropEffect = "move";
                    }
                });

                casilla.addEventListener("drop", e => {
                    e.preventDefault();
                    
                    if (!fichaSeleccionada) return;

                    const resultado = juego.mover(fichaSeleccionada, f, c);
                    if (resultado !== null) {
                        reproducirDropAleatorio();
                        crearPolvo(casilla.getBoundingClientRect());
                        finalizarMovimiento();
                    }
                });

                casilla.addEventListener("click", () => {
                    if (fichaSeleccionada && juego.esMovimientoValido(fichaSeleccionada, f, c)) {
                        const resultado = juego.mover(fichaSeleccionada, f, c);
                        if (resultado !== null) {
                            reproducirDropAleatorio();
                            crearPolvo(casilla.getBoundingClientRect());
                            finalizarMovimiento();
                        }
                    }
                });

            } else {
                casilla.classList.add("invalida");
            }

            tableroHTML.appendChild(casilla);
        }
    }
}

dibujarTablero();
actualizarEstadoVisual();
actualizarTiempo();

document.getElementById("comenzar-juego")?.addEventListener("click", comenzarPartida);
document.getElementById("peg-volver-menu")?.addEventListener("click", volverAlMenu);
function alternarConfiguracion() {
    document.getElementById("peg-config")?.toggleAttribute("hidden");
}

document.getElementById("peg-abrir-config")?.addEventListener("click", alternarConfiguracion);
document.getElementById("abrir-config-menu")?.addEventListener("click", alternarConfiguracion);
document.getElementById("peg-cerrar-config")?.addEventListener("click", () => {
    document.getElementById("peg-config")?.setAttribute("hidden", "");
});

document.getElementById("boton-supervivencia")?.addEventListener("click", () => {
    const mensaje = document.getElementById("mensaje-supervivencia");
    if (!mensaje) return;
    mensaje.removeAttribute("hidden");
    mensaje.classList.remove("is-hiding");
    requestAnimationFrame(() => mensaje.classList.add("is-visible"));
    setTimeout(() => {
        mensaje.classList.remove("is-visible");
        mensaje.classList.add("is-hiding");
        setTimeout(() => {
            mensaje.setAttribute("hidden", "");
            mensaje.classList.remove("is-hiding");
        }, 400);
    }, 3100);
});

document.getElementById("peg-toggle-music")?.addEventListener("click", (evento) => {
    musicaActivada = !musicaActivada;
    if (musicaActivada) {
        musicaFondo.volume = VOLUMEN_MUSICA;
        iniciarMusicaFondo();
        evento.currentTarget.querySelector("img").src = "../img/Elementos/music-on.png";
        evento.currentTarget.querySelector("img").alt = "Música activada";
    } else {
        musicaFondo.volume = 0;
        evento.currentTarget.querySelector("img").src = "../img/Elementos/music-off.png";
        evento.currentTarget.querySelector("img").alt = "Música desactivada";
    }
});

document.getElementById("peg-toggle-fx")?.addEventListener("click", (evento) => {
    efectosActivados = !efectosActivados;
    const imagen = evento.currentTarget.querySelector("img");
    imagen.src = efectosActivados ? "../img/Elementos/fx-on.png" : "../img/Elementos/fx-off.png";
    imagen.alt = efectosActivados ? "Efectos activados" : "Efectos desactivados";
});

function reiniciarPartida() {
    juego.reiniciar();
    segundosRestantes = DURACION_PARTIDA;
    actualizarTiempo();
    actualizarEstadoVisual();
    fichaSeleccionada = null;
    document.getElementById("peg-fin")?.setAttribute("hidden", "");
    dibujarTablero();
    iniciarTemporizador();
}

document.getElementById("peg-fin-reiniciar")?.addEventListener("click", () => {
    const modal = document.getElementById("peg-fin");
    const etapa = document.getElementById("peg-stage");
    reproducirSonido(sonidoTransicion);
    modal?.classList.add("is-closing");
    etapa?.classList.add("juego-transicionando");

    setTimeout(() => {
        modal?.setAttribute("hidden", "");
        modal?.classList.remove("is-closing");
        etapa?.classList.remove("juego-transicionando");
        reiniciarPartida();
    }, 450);
});

document.getElementById("peg-reiniciar-esquina")?.addEventListener("click", () => {
    reiniciarPartida();
});
