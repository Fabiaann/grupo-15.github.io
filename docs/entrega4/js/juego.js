import { Tablero } from './tablero.js';

export const ESTADO = {
  JUGANDO: 'jugando',
  GANADO: 'ganado',
  SIN_MOVIMIENTOS: 'sin_movimientos',
  TIEMPO_AGOTADO: 'tiempo_agotado',
};

const DIRECCIONES = [[-1, 0], [1, 0], [0, -1], [0, 1]];

export class Juego {
  constructor(tablero = new Tablero()) {
    this.tablero = tablero;
    this.estado = ESTADO.JUGANDO;
    this.movimientos = 0;
  }

  reiniciar() {
    this.tablero.reiniciar();
    this.estado = ESTADO.JUGANDO;
    this.movimientos = 0;
  }

  getMovimientosValidos(ficha) {
    if (!ficha) return [];

    const movimientosValidos = [];

    for (const [desplazamientoFila, desplazamientoColumna] of DIRECCIONES) {
      const filaMedia = ficha.fila + desplazamientoFila;
      const columnaMedia = ficha.col + desplazamientoColumna;

      const filaDestino = ficha.fila + desplazamientoFila * 2;
      const columnaDestino = ficha.col + desplazamientoColumna * 2;

      if (this.tablero.getFicha(filaMedia, columnaMedia) && this.tablero.estaVacia(filaDestino, columnaDestino)) {
        movimientosValidos.push({
          fila: filaDestino,
          col: columnaDestino,
          comidaFila: filaMedia,
          comidaCol: columnaMedia
        });
      }
    }

    return movimientosValidos;
  }

  esMovimientoValido(ficha, fila, col) {
    const movimientos = this.getMovimientosValidos(ficha);
    for (let i = 0; i < movimientos.length; i++) {
      const m = movimientos[i];
      if (m.fila === fila && m.col === col) return m;
    }
    return null;
  }

  mover(ficha, fila, col) {
    if (this.estado !== ESTADO.JUGANDO) return null;

    const movimiento = this.esMovimientoValido(ficha, fila, col);
    if (!movimiento) return null;

    const comida = this.tablero.quitar(movimiento.comidaFila, movimiento.comidaCol);
    this.tablero.mover(ficha, fila, col);
    this.movimientos++;
    this.actualizarEstado();
    return comida;
  }

  hayMovimientosPosibles() {
    const fichas = this.tablero.getFichas();
    for (let i = 0; i < fichas.length; i++) {
      if (this.getMovimientosValidos(fichas[i]).length > 0) return true;
    }
    return false;
  }

  actualizarEstado() {
    if (this.tablero.contarFichas() === 1) {
      this.estado = ESTADO.GANADO;
    } else if (!this.hayMovimientosPosibles()) {
      this.estado = ESTADO.SIN_MOVIMIENTOS;
    }
  }

  terminarPorTiempo() {
    if (this.estado === ESTADO.JUGANDO) this.estado = ESTADO.TIEMPO_AGOTADO;
  }
}