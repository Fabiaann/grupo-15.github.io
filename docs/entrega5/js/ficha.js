export class Ficha {
  // Guarda el identificador, la variante visual y la posición inicial de la ficha.
  constructor(id, tipo, fila, col) {
    this.id = id;
    this.tipo = tipo;   
    this.fila = fila;
    this.col = col;
  }

  // Actualiza la fila y columna de la ficha después de moverla.
  setPosicion(fila, col) {
    this.fila = fila;
    this.col = col;
  }
}