import { Tablero } from './tablero.js';

export const ESTADO = {
  JUGANDO: 'jugando',
  GANADO: 'ganado',
  SIN_MOVIMIENTOS: 'sin_movimientos',
  TIEMPO_AGOTADO: 'tiempo_agotado',
};

const DIRECCIONES = [[-1, 0], [1, 0], [0, -1], [0, 1]];

export class Juego {
  // Inicializa el estado de la partida y recibe el tablero que contiene las fichas.
  constructor(tablero = new Tablero()) {
    this.tablero = tablero;
    this.estado = ESTADO.JUGANDO;
    this.movimientos = 0;
  }

  // Restablece el tablero, el estado de juego y el contador de movimientos.
  reiniciar() {
    this.tablero.reiniciar();
    this.estado = ESTADO.JUGANDO;
    this.movimientos = 0;
  }

  // Calcula los movimientos legales de una ficha en las cuatro direcciones ortogonales.
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

  // Devuelve el movimiento que llega a la fila y columna indicadas, o null si no es válido.
  esMovimientoValido(ficha, fila, col) {
    const movimientos = this.getMovimientosValidos(ficha);
    for (let i = 0; i < movimientos.length; i++) {
      const m = movimientos[i];
      if (m.fila === fila && m.col === col) return m;
    }
    return null;
  }

  // Ejecuta un salto legal y permite contar varios saltos encadenados como un solo movimiento.
  mover(ficha, fila, col, contarMovimiento = true) {
    if (this.estado !== ESTADO.JUGANDO) return null;

    const movimiento = this.esMovimientoValido(ficha, fila, col);
    if (!movimiento) return null;

    const comida = this.tablero.quitar(movimiento.comidaFila, movimiento.comidaCol);
    this.tablero.mover(ficha, fila, col);
    if (contarMovimiento) this.movimientos++;
    this.actualizarEstado();
    return comida;
  }

  // Comprueba si al menos una ficha todavía puede realizar un movimiento.
  hayMovimientosPosibles() {
    const fichas = this.tablero.getFichas();
    for (let i = 0; i < fichas.length; i++) {
      if (this.getMovimientosValidos(fichas[i]).length > 0) return true;
    }
    return false;
  }

  // Determina si se ganó al quedar una ficha o si ya no quedan movimientos.
  actualizarEstado() {
    if (this.tablero.contarFichas() === 1) {
      this.estado = ESTADO.GANADO;
    } else if (!this.hayMovimientosPosibles()) {
      this.estado = ESTADO.SIN_MOVIMIENTOS;
    }
  }

  // Finaliza la partida por tiempo si todavía estaba en curso.
  terminarPorTiempo() {
    if (this.estado === ESTADO.JUGANDO) this.estado = ESTADO.TIEMPO_AGOTADO;
  }
}