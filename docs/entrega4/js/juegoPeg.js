import { Juego } from "./juego.js";

const juego = new Juego();
const tablero = juego.tablero;
const tableroHTML = document.getElementById("tablero");

let fichaSeleccionada = null;

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
                    const fichaHTML = document.createElement("div");
                    fichaHTML.classList.add("ficha", ficha.tipo); 
                    fichaHTML.draggable = true;

                  
                    fichaHTML.addEventListener("dragstart", e => {
                        fichaSeleccionada = ficha;
                        e.dataTransfer.effectAllowed = "move";
                       
                        mostrarHints(ficha);
                      
                        setTimeout(() => fichaHTML.classList.add("efectoFichaSeleccionada"), 0);
                    });

                 
                    fichaHTML.addEventListener("dragend", () => {
                        fichaHTML.classList.remove("efectoFichaSeleccionada");
                        limpiarHints();
                        fichaSeleccionada = null;
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
                        fichaSeleccionada = null;
                        dibujarTablero();
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