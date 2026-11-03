import { Juego, ESTADO } from './juego.js';



export class JuegoController {
    constructor(juego = new Juego(), segundosLimite = 300) {
        this.juego = juego;

        this.fichaSeleccionada = null;
        this.hints = [];
        this.iniciado = false;


        this.onTick = () => { };
        this.onFin = () => { };
        this.onCambio = () => { };



    }


    getFichas() { return this.juego.tablero.getFichas(); }
    getLayout() { return this.juego.tablero.tablero; }
    getEstado() { return this.juego.estado; }
    getMovimientos() { return this.juego.movimientos; }
    getFichasRestantes() { return this.juego.tablero.contarFichas(); }


    seleccionar(fila, col) {
        if (this.juego.estado !== ESTADO.JUGANDO) return [];
        const ficha = this.juego.tablero.getFicha(fila, col);
        if (!ficha) return [];
        if (!this.iniciado) { this.iniciado = true; }
        this.fichaSeleccionada = ficha;
        this.hints = this.juego.getMovimientosValidos(ficha);
        return this.hints;
    }


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

    cancelarSeleccion() {
        this.fichaSeleccionada = null;
        this.hints = [];
    }

    reiniciar() {
        this.timer.reiniciar();
        this.iniciado = false;
        this.cancelarSeleccion();
        this.juego.reiniciar();
        this.onTick(this.timer.restante);
        this.onCambio();
    }
}