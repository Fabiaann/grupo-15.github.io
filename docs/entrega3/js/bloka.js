

const contenedorJuego = document.querySelector('.juego11');
const juego = document.querySelector('.juego');

const contendorTiempo = document.querySelector(".time");
const pista = document.querySelector("#pista");

const mostrarBotones = document.querySelector(".mostrarBotones");
const btnComenzar = document.querySelector("#comenzar");

const canvasOriginal = document.getElementById("canvas");
const ctxOriginal = canvasOriginal.getContext("2d");

const canvasRecortado = document.createElement("canvas");
const ctxRecortado = canvasRecortado.getContext("2d");
const contadorAyudas = document.querySelector("#contadorAyudas");
const modalNivel = document.querySelector("#modalNivel");

const volverMenuButton= document.querySelector("#volverMenu");
 modalNivel.classList.add("oculto");
let sonidoHabilitado = true;

let ayudasDisponibles = 5;
let comenzar = false;
let cuadrados = 0;
let widthCuadrado = 0;
let heightCuadrado = 0;
let columna = 0;
let width = 0;
let height = 0;
let imagenCargada = false;


function actualizarContadorAyudas() {
    contadorAyudas.textContent = ayudasDisponibles;
    pista.disabled = ayudasDisponibles === 0;
    pista.title = `Ayudas disponibles: ${ayudasDisponibles}`;
    pista.setAttribute("aria-label", `Usar pista. Quedan ${ayudasDisponibles} ayudas`);
}

actualizarContadorAyudas();


let bancoImagen = [
    "../img/imagenPaisaje.jpg",
    "../img/imagenPaisaje2.jpg",
      "../img/imagenPaisaje3.jpg",
       "../img/imagenPaisaje4.jpg",
       "../img/imagenPaisaje5.jpg",
       "../img/imagenPaisaje6.jpg",
     
     
];

let imgAleatoria = Math.round(Math.random() * 2);

const gancho = document.querySelector(".gancho");
const bancoImagenes = document.querySelector(".banco-imagenes");

let imagenesCreadas = [];

for (let ruta of bancoImagen) {
    let img = document.createElement("img");
    img.style.width = "200px";
    img.style.height = "200px";
    img.src = ruta;
    bancoImagenes.appendChild(img);

    imagenesCreadas.push(img);
}

let image1 = imagenesCreadas[imgAleatoria];

image1.onload = function () {
   
 

    dimensionImagen(this);
    imagenCargada = true;
};




function dimensionImagen(Image) {

    let ancho = 500;
    let alto = 500;

    ctxOriginal.drawImage(
        Image,
        0, 0,
        ancho, alto
    );


}



function dibujarImagen(posX, posY, ancho, alto, filtro, opciones = {}) {

    const imageData = ctxRecortado.getImageData(posX, posY, ancho, alto);
    const data = imageData.data;

    const width = ancho;
    const height = alto;

    if (filtro === blur) {
        blur(data, width, height, opciones.radio, opciones.repeticiones);
    } else {
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {

                const i = (x + y * width) * 4;

                let valor = filtro(
                    data[i],
                    data[i + 1],
                    data[i + 2]
                );

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
    let y = 0;
    r *= 1.3;
    g *= 1.3;
    b *= 1.3;

    y = r + g + b;

    return y;
}

//negatiuviio
function negativo(r, g, b) {
    let y = 0;
    r = 255 - r;
    g = 255 - g;
    b = 255 - b;

    y = r + g + b;

    return y;
}

function blur(data, width, height, radio = 1, repeticiones = 1) {
    for (let repeticion = 0; repeticion < repeticiones; repeticion++) {

        const dataOriginal = new Uint8ClampedArray(data);

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let sumaR = 0;
                let sumaG = 0;
                let sumaB = 0;
                let contador = 0;

                for (let dy = -radio; dy <= radio; dy++) {
                    for (let dx = -radio; dx <= radio; dx++) {
                        const nx = x + dx;
                        const ny = y + dy;

                        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                            const iVecino = (nx + ny * width) * 4;
                            sumaR += dataOriginal[iVecino];
                            sumaG += dataOriginal[iVecino + 1];
                            sumaB += dataOriginal[iVecino + 2];
                            contador++;
                        }
                    }
                }

                const iActual = (x + y * width) * 4;
                data[iActual] = sumaR / contador;
                data[iActual + 1] = sumaG / contador;
                data[iActual + 2] = sumaB / contador;
            }
        }
    }
}

function recortarImagen(ancho, alto) {

    ancho = Math.round(ancho);
    alto = Math.round(alto);

    let x = canvasOriginal.width;
    let y = canvasOriginal.height;

    x = Math.round((x / 2) - (ancho / 2));
    y = Math.round((y / 2) - (alto / 2));

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
    mostrarBotones.classList.add("oculto");
    mostrarBancoImagenes();

    const primera = document.querySelector(".banco-imagenes > img");

   
    gancho.style.left = primera.offsetLeft + "px";
    gancho.style.top = primera.offsetTop + "px";

    
    gancho.style.setProperty("--x", (image1.offsetLeft - primera.offsetLeft) + "px");
    gancho.style.setProperty("--y", (image1.offsetTop - primera.offsetTop) + "px");
    calcularCentro();   

    gancho.classList.add("mover");

    setTimeout(() => {
        gancho.classList.remove("mover");
        gancho.classList.add("subir-gancho");
        image1.classList.add("subir-imagen");
    }, 3500); 

    
    setTimeout(() => {
        comienzoJuego();
      
    }, 7000); 
}


function calcularCentro() {
    const primera = document.querySelector(".banco-imagenes > img");

    
    const cx = bancoImagenes.clientWidth / 2;
    const cy = bancoImagenes.clientHeight / 2;

    const imgX = image1.offsetLeft + image1.offsetWidth / 2;
    const imgY = image1.offsetTop + image1.offsetHeight / 2;

   
    image1.style.setProperty("--ix", (cx - imgX) + "px");
    image1.style.setProperty("--iy", (cy - imgY) + "px");

   
    gancho.style.setProperty("--cx", (cx - gancho.offsetWidth / 2 - primera.offsetLeft) + "px");
    gancho.style.setProperty("--cy", (cy - gancho.offsetHeight / 2 - primera.offsetTop) + "px");
}

function comienzoJuego(filtro, opcionesFiltro = {}) {



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
        dibujarImagen(0, 0, ancho, alto, filtro, opcionesFiltro);
    }
    crearCuadrados(
        cantidadCuadros,
        anchoCuadro,
        altoCuadro,
        columnas
    );


        comenzar = false;
    btnComenzar.classList.remove("oculto");

   
}





function mostrarBancoImagenes() {
    bancoImagenes.classList.remove("oculto");
}

function prepararJuego() {
    bancoImagenes.classList.add("oculto");
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

    let x = Math.round((canvasOriginal.width / 2) - (width / 2));
    let y = Math.round((canvasOriginal.height / 2) - (height / 2));

    ctxFinal.drawImage(
        canvasOriginal,
        x, y, width, height,
        0, 0, width, height
    );

   contenedorJuego.querySelectorAll("canvas").forEach(canva => canva.remove());

    contenedorJuego.appendChild(imagenGanadora);

}


function verificarGano() {

    const canvas = document.querySelectorAll(".juego11 canvas");

    let todosCorrectos = true;

    canvas.forEach(canva => {

        if (canva.dataset.correcto !== "true") {
            todosCorrectos = false;
        }

    });



    if (todosCorrectos && canvas.length > 0) {
      

        comenzar=false;
        pausa();
        if(sonidoHabilitado){
        musicaAmbiente.pause();
        musicaAmbiente.currentTime = 0;

        audioGanar.play();}
        mostrarImagenOrginal();
  setTimeout(() => {
        

    mostrarModalNivel();

    }, 1100);
       


    }
}

function volverAlMenu() {
       modalNivel.classList.add("oculto");
   
    interval = null;
    comenzar = false;
    victoriaEnCurso = false;
    sorteoEnCurso = false;
    contadorNivel = 1;
    ultimaImagenAleatoria = -1;
  
    
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


const siguienteNivel = document.querySelector("#siguienteNivel");
siguienteNivel.addEventListener("click", comenzarSiguienteNivel);
const audioGanar = new Audio();
const musicaAmbiente = new Audio();
const audioGameOver = new Audio();
audioGameOver.src ="../sound/gameOver.mp3";
audioGanar.src = "../sound/ganar.mp3";
musicaAmbiente.src = "../sound/musica-ambiente.mp3"
let contadorNivel = 1;

const mostrarNivel = document.querySelector(".mostrarNivel");
  mostrarNivel.innerHTML = `<p>Nivel ${contadorNivel}</p>`;
const ganoElJuegoCompleto = document.querySelector(".ganoElJuegoCompleto");
const utlimoNivel= document.querySelector("#ultimoNivel");
function comenzarSiguienteNivel() {

    if (contadorNivel >= 3) {
        ayudasDisponibles = 5;
        actualizarContadorAyudas();
      location.reload();
    }
    
         
    

    modalNivel.classList.add("oculto");

    audioGanar.pause();
    audioGanar.currentTime = 0;

    contenedorJuego.querySelectorAll("canvas").forEach((canvas) => canvas.remove());

    contadorNivel += 1;

    mostrarNivel.innerHTML = `<p>Nivel ${contadorNivel}</p>`;

    victoriaEnCurso = false;

    if (contadorNivel === 1) {
        comienzoJuego(negativo);
    } else if (contadorNivel === 2) {
        comienzoJuego(blur, { radio: 1, repeticiones: 3 });
    } else if (contadorNivel === 3) {
          utlimoNivel.classList.remove("oculto");
    setTimeout(()=>{
    utlimoNivel.classList.add("oculto");
        comienzoJuego(blur, { radio: 1, repeticiones: 6 });
    },3500)
        
    }
}

function mostrarModalNivel() {
    descripcionNivel.textContent = contadorNivel === 3
        ? "Completaste los tres niveles."
        : `Superaste el nivel ${contadorNivel}.`;
    siguienteNivel.textContent = contadorNivel === 3 ? "Terminar juego" : "Siguiente nivel";
    modalNivel.classList.remove("oculto");
    siguienteNivel.focus();
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


//cantidad de piezass

const btn4 = document.querySelector("#btn4");

btn4.addEventListener("click", () => {
    if (imagenCargada === false) {
        alert("Esperá a que cargue la imagen");
        return;
    }

    cuadrados = 4;
    widthCuadrado = 250;
    heightCuadrado = 250;
    columna = 4 / 2;
    width = 500;
    height = 500;



    poner();
});


const btn6 = document.querySelector("#btn6");

btn6.addEventListener("click", () => {
    if (imagenCargada === false) {
        alert("Esperá a que cargue la imagen");
        return;
    }

    cuadrados = 6;
    widthCuadrado = 165;
    heightCuadrado = 165;
    columna = 6 / 3;
    width = 330;
    height = 495;

    poner();

    
});


const btn8 = document.querySelector("#btn8");

btn8.addEventListener("click", () => {
    if (imagenCargada === false) {
        
        return;
    }

    cuadrados = 8;
    widthCuadrado = 125;
    heightCuadrado = 125;
    columna = 8 / 4;
    width = 250;
    height = 500;

    poner();

    btn8.style = "display:none;";
});



//CRONÓMETRO:




const mostrarTiempos = document.querySelectorAll('.mostrarTiempo');

function pintarTiempo(texto) {
    mostrarTiempos.forEach(el => el.innerHTML = texto);
}


let interval;
let minutos = 0;
let segundos = 0;
let milesimas = 0;


function inicio() {
    if (interval) return;

   

   interval = setInterval(() => {

    milesimas += 1;

    if (milesimas > 99) {
        milesimas = 0;
        segundos += 1;
    }

    if (segundos >= 60) {
        minutos += 1;
        segundos -= 60;
    }

    pintarTiempo(`${minutos}:${segundos}:${milesimas}`);

    if (minutos * 60 + segundos >= 30 && contadorNivel === 3) {
        perder();0
    }

}, 10);
}


function pausa() {
    clearInterval(interval);
    interval = null;
mostrarTiempos.forEach(el => el.classList.add("record"));
}






function restablecerTiempo(){
    clearInterval(interval);


       milesimas = 0;
    segundos = 0;
    minutos = 0;
pintarTiempo('0:0:0');
mostrarTiempos.forEach(el => el.classList.remove("record"));

}



const gamerOver = document.querySelector("#gameOver");

function perder() {

   
    audioGameOver.play();
    comenzar = false;         
    pausa();                  
    musicaAmbiente.pause();
    musicaAmbiente.currentTime = 0;
    gamerOver.classList.remove("oculto");
}


btnComenzar.addEventListener("click", () => {

    btnComenzar.classList.add("oculto");
    comenzar = true;
            restablecerTiempo();

    inicio();
    if(sonidoHabilitado){ 
    musicaAmbiente.loop = true;
    musicaAmbiente.play();}

});




pista.addEventListener("click", () => {

    if (comenzar) {
        ayuda();

        verificarGano();
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
           
            segundos += 15;
     


            verificarOrientacion(c);
            ayudasDisponibles -= 1;
               actualizarContadorAyudas();

            return;
        }
    }
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


const sonidoOff = document.querySelector(".sonidoOff");
const sonidoOn = document.querySelector(".sonidoOn");

sonidoOff.addEventListener("click", () => {
    sonidoHabilitado = false;

    sonidoOff.classList.add("oculto");
    sonidoOn.classList.remove("oculto");

    musicaAmbiente.pause();
    musicaAmbiente.currentTime = 0;
    audioGanar.pause();
    audioGanar.currentTime = 0;
});

sonidoOn.addEventListener("click", () => {
    sonidoHabilitado = true;

    sonidoOn.classList.add("oculto");
    sonidoOff.classList.remove("oculto");


    if (comenzar) {
        musicaAmbiente.loop = true;
        musicaAmbiente.play();
    }
});





