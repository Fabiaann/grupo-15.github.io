import { Tablero } from './tablero.js';

export const ESTADO = {
  JUGANDO: 'jugando',
  GANADO: 'ganado',              
  SIN_MOVIMIENTOS: 'sin_movimientos',

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
        const columnaMedia = ficha.columna + desplazamientoColumna;        
        

        const filaDestino = ficha.fila + desplazamientoFila * 2;
        const columnaDestino = ficha.columna + desplazamientoColumna * 2; 
        
       
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
    let movimientos = this.getMovimientosValidos(ficha);
    let movimientoEncontrado = null;

    for (let i = 0; i < movimientos.length; i++) {
        let m = movimientos[i];
        
        
        if (m.fila === fila && m.col === col) {
            movimientoEncontrado = m;
            break; 
        }
    }

    return movimientoEncontrado;
}

  mover(ficha, fila, col) {
    if (this.estado !== ESTADO.JUGANDO) {
        return null;
    }

    const movimiento = this.esMovimientoValido(ficha, fila, col);
    if (!movimiento){ 
         return null;
    }
    const comida = this.tablero.quitar(movimiento.comidaFila, movimiento.comidaCol);
    this.tablero.mover(ficha, fila, col);
    this.movimientos++;
    this.actualizarEstado();
    return comida;
  }

  hayMovimientosPosibles() {
   let fichas = this.tablero.getFichas();
    let hayMovimientos = false;

for (let i = 0; i < fichas.length; i++) {
    let f = fichas[i];
    let movimientos = this.getMovimientosValidos(f);
    if (movimientos.length > 0) {
        hayMovimientos = true;
        break; 
    }
}

return hayMovimientos;
  }


  actualizarEstado() {
    if (this.tablero.contarFichas() === 1){
         this.estado = ESTADO.GANADO;}
    else if 
    (!this.hayMovimientosPosibles()){ 
    this.estado = ESTADO.SIN_MOVIMIENTOS;}
  }

  terminarPorTiempo() {
    if (this.estado === ESTADO.JUGANDO) this.estado = ESTADO.TIEMPO_AGOTADO;
  }
}

