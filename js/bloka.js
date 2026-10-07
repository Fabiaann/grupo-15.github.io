const contenedorJuego = document.querySelector('.juego11');





contenedorJuego.addEventListener('mousedown', (event) => {
    

    const canvas = event.target.closest('canvas');

    if (!canvas) return;
  let grados = parseInt(canvas.dataset.grados || 0, 10);
    
    if (event.button === 0) {
        grados += 90; 
        canvas.style.transform = 'rotate(' + grados + 'deg)';
      
    }
    
   
    else if (event.button === 2) {
        event.preventDefault(); 
        grados -= 90; 
        
      
        canvas.style.transform = 'rotate(' + grados + 'deg)';
      
    }
canvas.dataset.grados = grados;
     let correcto = false;
    if (grados % 360 === 0) {
        correcto = true;
    } else {
        correcto = false;
    }
    
  
    canvas.dataset.correcto = correcto;


    
});

// Esto evita que el menú del clic derecho moleste en los canvas
contenedorJuego.addEventListener('contextmenu', (event) => {
    event.preventDefault();
});

function verificarGano() {
  
    if (canvas.dataset.correcto === "true") {
        alert("¡Ganaste!");
        console.log(correcto);
    }
}








const arribaIizquierda = document.querySelector('.top-left');
const arribaDerecha = document.querySelector('.top-right');
const abajoIzquierda = document.querySelector('.bottom-left');
const abajoDerecha = document.querySelector('.bottom-right');






let arribaCorrectoIzq = false;
let arribaCorrectoDer = false;


let abajoCorrecto = false;
let abajoCorrectoIzq = false;
let abajoCorrectoDer = false;











let mostrarTiempo = document.querySelector('.mostrarTiempo');

const inicio = document.querySelector('.inicio');

inicio.addEventListener('click', () => {

    let valor = parseFloat(mostrarTiempo.innerHTML);

    interval = setInterval(() => {
        valor += 0.1;
        mostrarTiempo.innerHTML = valor.toFixed(1);
    }, 100)

})
const pausa = document.querySelector('.pausa');
pausa.addEventListener('click', () => {

    clearInterval(interval);
})

const restablecer = document.querySelector('.restablecer');
restablecer.addEventListener('click', () => {
    clearInterval(interval);
    mostrarTiempo.innerHTML = '0';
})



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