const contenedorJuego = document.querySelector('.juego11');
const piezas = [
    { elemento: document.querySelector('.canvas-a'), gradosIniciales: 90 },
    { elemento: document.querySelector('.canvas-b'), gradosIniciales: 180 },
    { elemento: document.querySelector('.canvas-c'), gradosIniciales: 270 },
    { elemento: document.querySelector('.canvas-d'), gradosIniciales: 180 }
];
let interval;
let juegoIniciado = false;
let juegoTerminado = false;

const mostrarTiempo = document.querySelector('.mostrarTiempo');
const inicio = document.querySelector('.inicio');
const pausa = document.querySelector('.pausa');
const restablecer = document.querySelector('.restablecer');

piezas.forEach(pieza => {
    pieza.elemento.dataset.grados = pieza.gradosIniciales;
    pieza.elemento.dataset.correcto = 'false';
});

contenedorJuego.addEventListener('mousedown', (event) => {
    const canvasPieza = event.target.closest('canvas');
    if (!canvasPieza || !juegoIniciado || juegoTerminado) return;

    let grados = parseInt(canvasPieza.dataset.grados, 10);
    if (event.button === 0) {
        grados += 90;
    } else if (event.button === 2) {
        event.preventDefault();
        grados -= 90;
    } else {
        return;
    }

    canvasPieza.dataset.grados = grados;
    const pieza = piezas.find(pieza => pieza.elemento === canvasPieza);
    canvasPieza.style.transform = 'rotate(' + (grados - pieza.gradosIniciales) + 'deg)';
    canvasPieza.dataset.correcto = grados % 360 === 0;
    verificarGano();
});

// Prevent the browser context menu on right-click.
contenedorJuego.addEventListener('contextmenu', (event) => {
    event.preventDefault();
});

function verificarGano() {
    if (!juegoTerminado && piezas.every(pieza => pieza.elemento.dataset.correcto === 'true')) {
        juegoTerminado = true;
        clearInterval(interval);
        alert('Ganaste! Tiempo: ' + mostrarTiempo.innerHTML + ' segundos.');
    }
}

inicio.addEventListener('click', () => {
    if (juegoIniciado || juegoTerminado) return;
    juegoIniciado = true;
    let valor = parseFloat(mostrarTiempo.innerHTML);
    interval = setInterval(() => {
        valor += 0.1;
        mostrarTiempo.innerHTML = valor.toFixed(1);
    }, 100);
});

pausa.addEventListener('click', () => {
    clearInterval(interval);
    juegoIniciado = false;
});

restablecer.addEventListener('click', () => {
    clearInterval(interval);
    mostrarTiempo.innerHTML = '0';
    juegoIniciado = false;
    juegoTerminado = false;
    piezas.forEach(pieza => {
        pieza.elemento.style.transform = 'rotate(0deg)';
        pieza.elemento.dataset.grados = pieza.gradosIniciales;
        pieza.elemento.dataset.correcto = 'false';
    });
});
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const canvasA = document.querySelector(".canvas-a");
const ctxA = canvasA.getContext("2d");


const canvasB = document.querySelector(".canvas-b");
const ctxB = canvasB.getContext("2d");

const canvasC = document.querySelector(".canvas-c");
const ctxC = canvasC.getContext("2d");

const canvasD = document.querySelector(".canvas-d");
const ctxD = canvasD.getContext("2d");

let image1 = new Image();

image1.src = "../img/monaLisa.jpg";

image1.onload = function () {

    dimensionImagen(this);
    ponerA();
    ponerB();
    ponerC();
    ponerD();





}
function ponerA() {
    dibujarImagen(0, 0);
    ctxA.drawImage(
        canvas,
        0, 0, 500, 500,
        0, 0, 500, 500
    );
}

function ponerB() {
    dibujarImagen(500, 0);
    ctxB.drawImage(
        canvas,
        500, 0, 500, 500,
        0, 0, 500, 500
    );
}

function ponerC() {
    dibujarImagen(0, 500);
    ctxC.drawImage(
        canvas,
        0, 500, 500, 500,
        0, 0, 500, 500
    );
}

function ponerD() {
    dibujarImagen(500, 500);
    ctxD.drawImage(
        canvas,
        500, 500, 500, 500,
        0, 0, 500, 500
    );
}





function dimensionImagen(Image) {

    let ancho = 1000;
    let alto = 1000;

    ctx.drawImage(
        Image,
        0, 0,
        ancho, alto
    );
}


function dibujarImagen(posX, posY) {

    const imageData = ctx.getImageData(posX, posY, 500, 500);
    const data = imageData.data;

    let width = 500;
    let height = 500;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {

            const i = (x + y * width) * 4;

            let gris = BT601(
                data[i],
                data[i + 1],
                data[i + 2]
            );

            data[i] = gris;
            data[i + 1] = gris;
            data[i + 2] = gris;
        }
    }

    ctx.putImageData(imageData, posX, posY);
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
