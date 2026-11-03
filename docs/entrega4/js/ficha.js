export class Ficha {
  constructor(id, tipo, fila, col) {
    this.id = id;
    this.tipo = tipo;   
    this.fila = fila;
    this.col = col;
  }
  setPosicion(fila, col) {
    this.fila = fila;
    this.col = col;
  }
}