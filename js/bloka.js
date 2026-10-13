

const contenedorJuego = document.querySelector('.juego11');
const juego = document.querySelector('.juego');

const contendorTiempo = document.querySelector(".time");
const pista = document.querySelector("#pista");

const menuPrincipal = document.querySelector(".menu-principal");
const mostrarBotones = document.querySelector(".menu-principal .mostrarBotones");
const btnComenzar = document.querySelector("#comenzar");
const btnIniciarPartida = document.querySelector("#iniciarPartida");
const modalAjustes = document.querySelector("#modalAjustes");
const abrirAjustes = document.querySelector("#abrirAjustes");
const cerrarAjustes = document.querySelector("#cerrarAjustes");
const menuVidas = document.querySelector("#vidasMenu");
const vidasPartida = document.querySelector("#vidasUsuario");
const relojVidas = document.querySelector("#relojVidas");
const menuEstrellas = document.querySelector("#estrellasMenu");

const MAX_VIDAS = 10;
const INTERVALO_VIDA_MS = 5 * 60 * 1000;
const STORAGE_VIDAS = "blocka.vidas.v2";
const STORAGE_PROXIMA_VIDA = "blocka.proximaVida.v2";
const STORAGE_ESTRELLAS = "blocka.estrellas";
const vidasGuardadas = localStorage.getItem(STORAGE_VIDAS);
let vidasActuales = vidasGuardadas === null ? 9 : Math.max(0, Math.min(MAX_VIDAS, Number(vidasGuardadas) || 0));
let proximaVidaEn = Number(localStorage.getItem(STORAGE_PROXIMA_VIDA)) || 0;
let estrellasGanadas = Math.max(0, Number(localStorage.getItem(STORAGE_ESTRELLAS)) || 0);

if (vidasActuales < MAX_VIDAS && proximaVidaEn <= Date.now()) {
    proximaVidaEn = Date.now() + INTERVALO_VIDA_MS;
}

const canvasOriginal = document.getElementById("canvas");
const ctxOriginal = canvasOriginal.getContext("2d");

const canvasRecortado = document.createElement("canvas");
const ctxRecortado = canvasRecortado.getContext("2d");

function guardarEstadoMenu() {
    localStorage.setItem(STORAGE_VIDAS, String(vidasActuales));
    localStorage.setItem(STORAGE_PROXIMA_VIDA, String(proximaVidaEn));
    localStorage.setItem(STORAGE_ESTRELLAS, String(estrellasGanadas));
}

function actualizarHudMenu() {
    const ahora = Date.now();
    while (vidasActuales < MAX_VIDAS && proximaVidaEn > 0 && ahora >= proximaVidaEn) {
        vidasActuales += 1;
        proximaVidaEn += INTERVALO_VIDA_MS;
    }
    if (vidasActuales >= MAX_VIDAS) proximaVidaEn = 0;

    menuVidas.textContent = vidasActuales;
    vidasPartida.textContent = vidasActuales;
    vidasPartida.parentElement.setAttribute("aria-label", `Vidas: ${vidasActuales}`);
    menuEstrellas.textContent = estrellasGanadas;
    relojVidas.textContent = vidasActuales >= MAX_VIDAS
        ? "Completo"
        : (() => {
            const restante = Math.max(0, proximaVidaEn - ahora);
            const minutos = Math.floor(restante / 60000).toString().padStart(2, "0");
            const segundos = Math.floor((restante % 60000) / 1000).toString().padStart(2, "0");
            return `${minutos}:${segundos}`;
        })();
    actualizarDisponibilidadBotones();
    guardarEstadoMenu();
}

let sonidoHabilitado = true;


let comenzar = false;
let cuadrados = 0;
let widthCuadrado = 0;
let heightCuadrado = 0;
let columna = 0;
let width = 0;
let height = 0;
let imagenCargada = false;
let imagenesPreparadas = 0;
let sorteoEnCurso = false;
let ultimaImagenAleatoria = -1;

let bancoImagen = [
    "../img/Juego1.jpg",
    "../img/JuegoAventura1.jpg",
    "../img/tenis.jpg",
    "../img/auto.jpg",
    "../img/deporte2.jpg"
];

let imgAleatoria = Math.floor(Math.random() * bancoImagen.length);

const bancoImagenes = document.querySelector(".banco-imagenes");
const pistaImagenes = document.querySelector(".pista-imagenes");
const contenedorPrincipal = document.querySelector(".contenedor");

let imagenesCreadas = [];
let image1;

function actualizarDisponibilidadBotones() {
    const imagenesListas = imagenesPreparadas >= bancoImagen.length;
    btnIniciarPartida.disabled = !imagenesListas;
    btnIniciarPartida.title = imagenesListas ? "Iniciar una partida" : "Preparando imagenes";
}

actualizarHudMenu();
window.setInterval(actualizarHudMenu, 1000);

function prepararImagenSeleccionada() {
    if (!image1 || !image1.complete || image1.naturalWidth === 0) return;
    try {
        dimensionImagen(image1);
        imagenCargada = true;
        actualizarDisponibilidadBotones();
    } catch (error) {
        console.error("No se pudo preparar la imagen de Blocka", error);
    }
}

actualizarDisponibilidadBotones();

for (let ruta of bancoImagen) {
    let img = document.createElement("img");
    img.addEventListener("load", () => {
        imagenesPreparadas += 1;
        actualizarDisponibilidadBotones();
        if (img === image1) prepararImagenSeleccionada();
    });
    img.addEventListener("error", () => {
        actualizarDisponibilidadBotones();
        if (img === image1) {
            imagenCargada = false;
            actualizarDisponibilidadBotones();
            console.error("No se pudo cargar la imagen de Blocka:", ruta);
        }
    });
    imagenesCreadas.push(img);
    img.src = ruta;
}

image1 = imagenesCreadas[imgAleatoria];
if (image1.complete && image1.naturalWidth > 0) prepararImagenSeleccionada();




function dimensionImagen(Image) {

    let ancho = 500;
    let alto = 500;

    ctxOriginal.drawImage(
        Image,
        0, 0,
        ancho, alto
    );


}



function dibujarImagen(posX, posY, ancho, alto, filtro) {

    const imageData = ctxRecortado.getImageData(posX, posY, ancho, alto);
    const data = imageData.data;

    let width = ancho;
    let height = alto;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {

            const i = (x + y * width) * 4;

            const valor = filtro(
                data[i],
                data[i + 1],
                data[i + 2]
            );

            if (Array.isArray(valor)) {
                data[i] = valor[0];
                data[i + 1] = valor[1];
                data[i + 2] = valor[2];
            } else {
                data[i] = valor;
                data[i + 1] = valor;
                data[i + 2] = valor;
            }
        }
    }

    ctxRecortado.putImageData(imageData, posX, posY);
}


/**INTENTO ESCALA GRRISSES */

function BT601(r, g, b) {

    let y = 0;
    r *= 0.299;
    g *= 0.587;
    b *= 0.114;

    y = r + g + b;

    return y;
}
//brillo al 30%
function brillo(r, g, b) {
    return [Math.min(255, r * 1.3), Math.min(255, g * 1.3), Math.min(255, b * 1.3)];
}

//negatiuviio
function negativo(r, g, b) {
    return [255 - r, 255 - g, 255 - b];
}



function recortarImagen(ancho, alto) {

    ancho = Math.round(ancho);
    alto = Math.round(alto);

    let x = canvasOriginal.width;
    let y = canvasOriginal.height;

    x = Math.round((x / 2) - (ancho / 2));
    y = Math.round((y / 2) - (alto / 2));

    // El auto queda demasiado abajo con el recorte centrado en los niveles
    // rectangulares. Desplazamos su ventana un poco hacia abajo para subir
    // el encuadre visible, sin modificar las demás imágenes.
    if (image1 === imagenesCreadas[3]) {
        y = Math.min(y + 18, canvasOriginal.height - alto);
    }

    let recorto = ctxOriginal.getImageData(
        x,
        y,
        ancho,
        alto
    );

    canvasRecortado.width = ancho;
    canvasRecortado.height = alto;

    ctxRecortado.putImageData(recorto, 0, 0);
}



// CREACIÓN DEL JUEGO

function poner() {
    if (sorteoEnCurso || imagenesPreparadas < bancoImagen.length) return;

    configurarDificultadNivel();
    sorteoEnCurso = true;
    mostrarBotones.classList.add("oculto");
    menuPrincipal.classList.remove("oculto");
    menuPrincipal.classList.add("seleccionando");
    contenedorPrincipal.classList.remove("en-menu");
    juego.classList.add("oculto");
    const opcionesImagen = bancoImagen.map((_, indice) => indice).filter((indice) => indice !== ultimaImagenAleatoria);
    imgAleatoria = opcionesImagen[Math.floor(Math.random() * opcionesImagen.length)];
    ultimaImagenAleatoria = imgAleatoria;
    image1 = imagenesCreadas[imgAleatoria];
    imagenCargada = false;
    prepararImagenSeleccionada();

    const cantidadVueltas = 7;
    const indiceObjetivo = (cantidadVueltas - 2) * bancoImagen.length + imgAleatoria;
    const tarjetas = [];
    for (let vuelta = 0; vuelta < cantidadVueltas; vuelta += 1) {
        for (let indice = 0; indice < bancoImagen.length; indice += 1) {
            const tarjeta = imagenesCreadas[indice].cloneNode();
            tarjeta.alt = `Imagen ${indice + 1} del sorteo`;
            if (vuelta === cantidadVueltas - 2 && indice === imgAleatoria) {
                tarjeta.classList.add("imagen-elegida");
            }
            tarjetas.push(tarjeta);
        }
    }

    pistaImagenes.replaceChildren(...tarjetas);
    bancoImagenes.classList.remove("oculto");
    contenedorPrincipal.classList.add("seleccionando");
    pistaImagenes.style.transition = "none";
    pistaImagenes.style.transform = "translateX(0)";
    void pistaImagenes.offsetWidth;

    const tarjetaElegida = pistaImagenes.children[indiceObjetivo];
    const desplazamiento = tarjetaElegida.offsetLeft + tarjetaElegida.offsetWidth / 2 - bancoImagenes.clientWidth / 2;
    requestAnimationFrame(() => {
        pistaImagenes.style.transition = "transform 5.2s cubic-bezier(.08,.68,.12,1)";
        pistaImagenes.style.transform = `translateX(-${desplazamiento}px)`;
    });

    window.setTimeout(() => {
        bancoImagenes.classList.add("oculto");
        menuPrincipal.classList.remove("seleccionando");
        contenedorPrincipal.classList.remove("seleccionando");
        sorteoEnCurso = false;
        comienzoJuego(filtroDelNivel(contadorNivel));
        iniciarReloj();
    }, 5350);
}

function comienzoJuego(filtro) {



    prepararJuego();

    let cantidadCuadros = cuadrados;
    let anchoCuadro = widthCuadrado;
    let altoCuadro = heightCuadrado;
    let columnas = columna;
    let ancho = width;
    let alto = height;

    configurarContenedor(ancho, alto);

    recortarImagen(ancho, alto);
    if (!filtro) {
        dibujarImagen(0, 0, ancho, alto, BT601);
    }
    else {
        dibujarImagen(0, 0, ancho, alto, filtro);
    }
    crearCuadrados(
        cantidadCuadros,
        anchoCuadro,
        altoCuadro,
        columnas
    );


        comenzar = false;
    btnComenzar.classList.remove("oculto");

    console.log("Se crearon las piezas");
console.log("Botón comenzar:", btnComenzar.className);
console.log("Comenzar visible:", btnComenzar.getBoundingClientRect());
}





function prepararJuego() {
    bancoImagenes.classList.add("oculto");
    menuPrincipal.classList.add("oculto");
    juego.classList.remove("oculto");
}


function configurarContenedor(ancho, alto) {

    contenedorJuego.style.width = `${ancho}px`;
    contenedorJuego.style.height = `${alto}px`;
}


function crearCuadrados(
    cantidadCuadros,
    anchoCuadro,
    altoCuadro,
    columnas
) {

    for (let i = 0; i < cantidadCuadros; i++) {

        crearCanvas(
            i,
            anchoCuadro,
            altoCuadro,
            columnas
        );
    }
}


function crearCanvas(i, anchoCuadro, altoCuadro, columnas) {

    let randomDeg = (Math.floor(Math.random() * 3) + 1) * 90;

    const canvas = document.createElement("canvas");
    canvas.style.transform = `rotate(${randomDeg}deg)`;

    canvas.width = anchoCuadro;
    canvas.height = altoCuadro;
    canvas.dataset.grados = randomDeg;
    canvas.dataset.gradosCorrectos = 0;
    canvas.dataset.correcto = false;

    contenedorJuego.appendChild(canvas);

    dibujarCuadrado(canvas, i, anchoCuadro, altoCuadro, columnas);
}



function dibujarCuadrado(canvas, i, anchoCuadro, altoCuadro, columnas) {

    const ctx = canvas.getContext("2d");

    const columna = i % columnas;
    const fila = Math.floor(i / columnas);

    const x = columna * anchoCuadro;
    const y = fila * altoCuadro;

    ctx.drawImage(
        canvasRecortado,
        x, y, anchoCuadro, altoCuadro,
        0, 0, anchoCuadro, altoCuadro
    );
}



//gane?
function mostrarImagenOrginal() {
    const imagenGanadora = document.createElement("canvas");
    imagenGanadora.width = width;
    imagenGanadora.height = height;
    const ctxFinal = imagenGanadora.getContext("2d");
    const x = Math.round((canvasOriginal.width - width) / 2);
    const y = Math.round((canvasOriginal.height - height) / 2);
    ctxFinal.drawImage(canvasOriginal, x, y, width, height, 0, 0, width, height);
    imagenGanadora.className = "imagen-original-final";
    contenedorJuego.querySelectorAll("canvas").forEach((canvas) => canvas.classList.add("pieza-resuelta", "filtro-desapareciendo"));
    contenedorJuego.appendChild(imagenGanadora);
    requestAnimationFrame(() => imagenGanadora.classList.add("visible"));
    return imagenGanadora;
}
const modalNivel = document.querySelector("#modalNivel");
const cerrarNivel = document.querySelector("#cerrarNivel");
const siguienteNivel = document.querySelector("#siguienteNivel");
const volverMenuButton = document.querySelector("#volverMenu");
const contadorAyudas = document.querySelector("#contadorAyudas");
const descripcionNivel = document.querySelector("#descripcionNivel");
const audioGanar = new Audio("../sound/ganar.mp3");
const musicaAmbiente = new Audio("../sound/musica-ambiente.mp3");
let contadorNivel = 1;
let ayudasDisponibles = 5;
let victoriaEnCurso = false;
let temporizadorVictoria;

const mostrarNivel = document.querySelector(".mostrarNivel");
const actualizarEtiquetaNivel = () => {
    mostrarNivel.innerHTML = `<p>Nivel ${contadorNivel}</p>`;
};
actualizarEtiquetaNivel();

function actualizarContadorAyudas() {
    contadorAyudas.textContent = ayudasDisponibles;
    pista.disabled = ayudasDisponibles === 0;
    pista.title = `Ayudas disponibles: ${ayudasDisponibles}`;
    pista.setAttribute("aria-label", `Usar pista. Quedan ${ayudasDisponibles} ayudas`);
}

actualizarContadorAyudas();

function configurarDificultadNivel() {
    const dificultad = {
        1: { cuadrados: 4, pieza: 250, columnas: 2, width: 500, height: 500 },
        2: { cuadrados: 6, pieza: 165, columnas: 3, width: 495, height: 330 },
        3: { cuadrados: 8, pieza: 125, columnas: 4, width: 500, height: 250 }
    }[contadorNivel];
    cuadrados = dificultad.cuadrados;
    widthCuadrado = dificultad.pieza;
    heightCuadrado = dificultad.pieza;
    columna = dificultad.columnas;
    width = dificultad.width;
    height = dificultad.height;
}

function filtroDelNivel(nivel) {
    if (nivel === 1) return BT601;
    if (nivel === 2) return brillo;
    if (nivel === 3) return negativo;
    return BT601;
}

function mostrarModalNivel() {
    descripcionNivel.textContent = contadorNivel === 3
        ? "Completaste los tres niveles."
        : `Superaste el nivel ${contadorNivel}.`;
    siguienteNivel.textContent = contadorNivel === 3 ? "Terminar juego" : "Siguiente nivel";
    modalNivel.classList.remove("oculto");
    siguienteNivel.focus();
}

function volverAlMenu() {
    window.clearTimeout(temporizadorVictoria);
    window.clearInterval(interval);
    interval = null;
    comenzar = false;
    victoriaEnCurso = false;
    sorteoEnCurso = false;
    contadorNivel = 1;
    ultimaImagenAleatoria = -1;
    actualizarEtiquetaNivel();
    restablecerTiempo();
    musicaAmbiente.pause();
    musicaAmbiente.currentTime = 0;
    audioGanar.pause();
    audioGanar.currentTime = 0;
    juego.classList.add("oculto");
    menuPrincipal.classList.remove("oculto", "seleccionando");
    bancoImagenes.classList.add("oculto");
    contenedorPrincipal.classList.add("en-menu");
    contenedorPrincipal.classList.remove("seleccionando");
    contenedorJuego.querySelectorAll("canvas").forEach((canvas) => canvas.remove());
    modalNivel.classList.add("oculto");
    mostrarBotones.classList.remove("oculto");
    btnIniciarPartida.focus();
}

function comenzarSiguienteNivel() {
    if (contadorNivel >= 3) {
        ayudasDisponibles = 5;
        actualizarContadorAyudas();
        volverAlMenu();
        return;
    }
    window.clearTimeout(temporizadorVictoria);
    modalNivel.classList.add("oculto");
    audioGanar.pause();
    audioGanar.currentTime = 0;
    contenedorJuego.querySelectorAll("canvas").forEach((canvas) => canvas.remove());
    contadorNivel += 1;
    victoriaEnCurso = false;
    actualizarEtiquetaNivel();
    poner();
}

cerrarNivel.addEventListener("click", volverAlMenu);
volverMenuButton.addEventListener("click", volverAlMenu);
siguienteNivel.addEventListener("click", comenzarSiguienteNivel);
abrirAjustes.addEventListener("click", () => {
    modalAjustes.classList.remove("oculto");
    cerrarAjustes.focus();
});
cerrarAjustes.addEventListener("click", () => {
    modalAjustes.classList.add("oculto");
    abrirAjustes.focus();
});
modalAjustes.addEventListener("click", (event) => {
    if (event.target === modalAjustes) cerrarAjustes.click();
});
document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !modalAjustes.classList.contains("oculto")) cerrarAjustes.click();
});

function verificarGano() {
    const canvas = document.querySelectorAll(".juego11 canvas");
    const todosCorrectos = [...canvas].every((pieza) => pieza.dataset.correcto === "true");
    if (!todosCorrectos || canvas.length === 0 || victoriaEnCurso) return;

    victoriaEnCurso = true;
    comenzar = false;
    estrellasGanadas += 3;
    actualizarHudMenu();
    pausa();
    if (sonidoHabilitado) {
        musicaAmbiente.pause();
        musicaAmbiente.currentTime = 0;
        audioGanar.play().catch(() => {});
    }
    mostrarImagenOrginal();
    temporizadorVictoria = window.setTimeout(mostrarModalNivel, 1000);
}
function verificarOrientacion(canvas) {

    let grados = parseInt(canvas.dataset.grados);
    let gradosCorrectos = parseInt(canvas.dataset.gradosCorrectos);

    if (grados % 360 === gradosCorrectos) {
        canvas.dataset.correcto = true;
    } else {
        canvas.dataset.correcto = false;
    }
}


btnIniciarPartida.addEventListener("click", () => {
    contadorNivel = 1;
    ultimaImagenAleatoria = -1;
    victoriaEnCurso = false;
    actualizarEtiquetaNivel();
    contenedorJuego.querySelectorAll("canvas").forEach((canvas) => canvas.remove());
    poner();
});

//CRONÓMETRO:


let mostrarTiempo = document.querySelector('.mostrarTiempo');

let interval;
let minutos = 0;
let segundos = 0;
let milesimas = 0;


function inicio() {
    if (interval) return;

    let valor = parseFloat(mostrarTiempo.innerHTML);

    interval = setInterval(() => {
        valor += 0.1;
        valor.toFixed(1);

        if (milesimas <= 99) {
            milesimas += 1;

            if (segundos === 60) {
                minutos += 1;
                segundos = 0;
            }

        }
        else {
            milesimas = 0;
            segundos += 1;

            if (segundos === 60) {
                minutos += 1;
                segundos = 0;
            }
        }

        mostrarTiempo.innerHTML = `${minutos}:${segundos}:${milesimas}`;

    }, 10);
}


function pausa() {
    clearInterval(interval);
    interval = null;
    mostrarTiempo.classList.add("record");
}






function restablecerTiempo(){
    clearInterval(interval);


       milesimas = 0;
    segundos = 0;
    minutos = 0;

    mostrarTiempo.innerHTML = '0:0:0';
    mostrarTiempo.classList.remove("record");
}


function iniciarReloj() {
    btnComenzar.classList.add("oculto");
    comenzar = true;
    restablecerTiempo();

    inicio();
    if (sonidoHabilitado) {
    musicaAmbiente.loop = true;
    musicaAmbiente.play().catch(() => {});
    }
}

btnComenzar.addEventListener("click", iniciarReloj);





pista.addEventListener("click", () => {

    if (comenzar) {
        if (ayuda()) verificarGano();
    }
});


function ayuda() {
    if (ayudasDisponibles === 0) return false;

    const canvas = contenedorJuego.querySelectorAll('canvas');

    for (let c of canvas) {

        const gradosActuales = Number(c.dataset.grados);

        if (gradosActuales < 0 || gradosActuales > 0) {
            c.style.transform = "rotate(0deg)";

            c.dataset.grados = "0";
            minutos += 10;

            verificarOrientacion(c);
            ayudasDisponibles -= 1;
            actualizarContadorAyudas();

            return true;
        }
    }
    return false;
}


contenedorJuego.addEventListener('mousedown', (event) => {

    const canvas = event.target.closest('canvas');
    if (!canvas) return;

    if (comenzar) {
        let grados = parseInt(canvas.dataset.grados || 0, 10);

        if (event.button === 0) {
            grados += 90;
        } else if (event.button === 2) {
            event.preventDefault();
            grados -= 90;
        } else {
            return;
        }

        grados = (grados % 360 + 360) % 360;

        canvas.style.transform = 'rotate(' + grados + 'deg)';
        canvas.dataset.grados = grados;

        verificarOrientacion(canvas);
        verificarGano();
    }
});


contenedorJuego.addEventListener('contextmenu', (event) => {
    event.preventDefault();
});


