

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

let sonidoHabilitado = true;


let comenzar = false;
let cuadrados = 0;
let widthCuadrado = 0;
let heightCuadrado = 0;
let columna = 0;
let width = 0;
let height = 0;
let imagenCargada = false;



let bancoImagen = [
    "../img/burns.jpg",
    "../img/homero.jpg",
    "../img/im1.jpg",
    "../img/moe.jpg",
    "../img/ned.jpg",
    "../img/martin.jpg",
     
     
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



function dibujarImagen(posX, posY, ancho, alto, filtro) {

    const imageData = ctxRecortado.getImageData(posX, posY, ancho, alto);
    const data = imageData.data;

    let width = ancho;
    let height = alto;

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
   let posicion = image1.getBoundingClientRect();



    gancho.style.setProperty('--posicion-x', `${posicion.left}px`);
 gancho.classList.add("usarGancho");
    setTimeout(() => {
         gancho.classList.remove("usarGancho");
        gancho.classList.add("subirGancho")
        image1.classList.add("meLLevoTdo");
       
   
         
      
        
            
    }, 3500);
    setTimeout(() => {
        comienzoJuego();


    }, 4500);
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
        

btnSiguienteNivel.classList.remove("oculto");

    }, 1100);
       


    }
}
const btnSiguienteNivel = document.querySelector(".siguienteNivel");
const audioGanar = new Audio();
const musicaAmbiente = new Audio();
audioGanar.src = "../sound/ganar.mp3";
musicaAmbiente.src = "../sound/musica-ambiente.mp3"
let contadorNivel = 1;

const mostrarNivel = document.querySelector(".mostrarNivel");
  mostrarNivel.innerHTML = `<p>Nivel ${contadorNivel}</p>`;
const ganoElJuegoCompleto = document.querySelector(".ganoElJuegoCompleto");
btnSiguienteNivel.addEventListener("click", () => {
    
    comenzar = false;
          btnSiguienteNivel.classList.add("oculto");

contenedorJuego.querySelectorAll("canvas").forEach(canva => canva.remove());

  contadorNivel += 1;
  mostrarNivel.innerHTML = `<p>Nivel ${contadorNivel}</p>`;
    if (contadorNivel === 2) {
        comienzoJuego(brillo);
   
      

    }
    else if (contadorNivel === 3) {
        comienzoJuego(negativo);
        
        
    }
    else {
       
        juego.classList.add("oculto");
        ganoElJuegoCompleto.classList.remove("oculto");
    }



})



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

    const canvas = contenedorJuego.querySelectorAll('canvas');

    for (let c of canvas) {

        const gradosActuales = Number(c.dataset.grados);

        if (gradosActuales < 0 || gradosActuales > 0) {
            c.style.transform = "rotate(0deg)";

            c.dataset.grados = "0";
            minutos += 10;

            verificarOrientacion(c);

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