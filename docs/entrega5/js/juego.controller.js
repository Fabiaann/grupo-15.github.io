import { Juego, ESTADO } from './juego.js';



export class JuegoController {
    // Vincula la lógica del juego con el estado de selección y los callbacks de la interfaz.
    constructor(juego = new Juego(), segundosLimite = 300) {
        this.juego = juego;

        this.fichaSeleccionada = null;
        this.hints = [];
        this.iniciado = false;


        this.onTick = () => { };
        this.onFin = () => { };
        this.onCambio = () => { };



    }

    // Devuelve la colección de fichas actualmente colocadas.
    getFichas() { return this.juego.tablero.getFichas(); }
    // Devuelve la matriz que describe las casillas jugables del tablero.
    getLayout() { return this.juego.tablero.tablero; }
    // Devuelve el estado actual de la partida.
    getEstado() { return this.juego.estado; }
    // Devuelve el total de movimientos realizados.
    getMovimientos() { return this.juego.movimientos; }
    // Devuelve cuántas fichas quedan en el tablero.
    getFichasRestantes() { return this.juego.tablero.contarFichas(); }

    // Selecciona la ficha de una casilla y devuelve sus destinos posibles.
    seleccionar(fila, col) {
        if (this.juego.estado !== ESTADO.JUGANDO) return [];
        const ficha = this.juego.tablero.getFicha(fila, col);
        if (!ficha) return [];
        if (!this.iniciado) { this.iniciado = true; }
        this.fichaSeleccionada = ficha;
        this.hints = this.juego.getMovimientosValidos(ficha);
        return this.hints;
    }

    // Intenta mover la ficha seleccionada y notifica el resultado a la interfaz.
    soltar(fila, col) {
        const ficha = this.fichaSeleccionada;
        if (!ficha) return { valido: false };
        const comida = this.juego.mover(ficha, fila, col);
        this.cancelarSeleccion();

        if (!comida) return { valido: false, ficha }; // vuelve a su lugar
        this.onCambio();
        if (this.juego.estado !== ESTADO.JUGANDO) {
            this.timer.detener();
            this.onFin(this.juego.estado);
        }
        return { valido: true, ficha, fichaComida: comida };
    }

    // Borra la ficha seleccionada y sus destinos destacados.
    cancelarSeleccion() {
        this.fichaSeleccionada = null;
        this.hints = [];
    }

    // Reinicia el temporizador, la selección y el estado de la partida.
    reiniciar() {
        this.timer.reiniciar();
        this.iniciado = false;
        this.cancelarSeleccion();
        this.juego.reiniciar();
        this.onTick(this.timer.restante);
        this.onCambio();
    }
}