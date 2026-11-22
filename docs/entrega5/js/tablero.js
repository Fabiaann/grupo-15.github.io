import { Ficha } from './ficha.js' ;


export const TABLERO = [
  [0, 0, 1, 1, 1, 0, 0],
  [0, 0, 1, 1, 1, 0, 0],
  [1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1],
  [0, 0, 1, 1, 1, 0, 0],
  [0, 0, 1, 1, 1, 0, 0],
];

export class Tablero {
  // Configura la forma del tablero y crea el estado inicial con el centro vacío.
  constructor(tablero = TABLERO, tiposFicha = ['tipoA', 'tipoB', 'tipoC']) {
    this.tablero = tablero;
    this.tiposFicha = tiposFicha;
    this.filas = tablero.length;
    this.cols = tablero[0].length;
    this.celdas = [];
    this.reiniciar();
  }

  // Indica si las coordenadas corresponden a una casilla jugable del tablero.
  esCeldaValida(f, c) {
    return ( (f >= 0 )&& 
    (f < this.filas && c >= 0) && 
    (c < this.cols )&&
    (this.tablero[f][c] === 1));
  }

  // Comprueba que una casilla válida no contenga actualmente una ficha.
  estaVacia(f, c) {
    return (this.esCeldaValida(f, c) && !this.celdas[f][c]);
  }

  // Devuelve la ficha de una casilla válida o null si está vacía o fuera del tablero.
  getFicha(f, c) {
   if (this.esCeldaValida(f, c)) {
    return this.celdas[f][c] || null;
} else {
    return null;
}
  }

  // Traslada una ficha a otra casilla y actualiza sus coordenadas.
  mover(ficha, f, c) {
    this.celdas[ficha.fila][ficha.col] = undefined;
    this.celdas[f][c] = ficha;
    ficha.setPosicion(f, c);
  }

  // Quita y devuelve la ficha que ocupa las coordenadas indicadas.
  quitar(f, c) {
    const ficha = this.celdas[f][c];
    this.celdas[f][c] = undefined;
    return ficha;
  }

  // Reúne las fichas que actualmente están colocadas en las casillas jugables.
  getFichas() {
let resultados = [];
for (let f = 0; f < this.celdas.length; f++) {
    
    
    for (let c = 0; c < this.celdas[f].length; c++) {
        
       
        if (this.esCeldaValida(f, c)) {
            
       
            let valorCelda = this.celdas[f][c] || null;
            
            
            if (valorCelda !== null) {
                resultados.push(valorCelda);
            }
        }
    }
}
return resultados;
}

  // Crea una ficha en cada casilla jugable excepto en la casilla central.
  reiniciar() {
  let id = 0;
  const cf = Math.floor(this.filas / 2); //centro fila
  const cc = Math.floor(this.cols / 2); //centro columna
  this.celdas = this.tablero.map((fila, f) =>
    fila.map((v, c) => {
      if (!v) return null;                      
      if (f === cf && c === cc) return undefined; //ficha central vacía
      const tipo = this.tiposFicha[Math.floor(Math.random() * this.tiposFicha.length)];
      return new Ficha(id++, tipo, f, c);
    })
  );
}

  // Devuelve la cantidad actual de fichas sobre el tablero.
  contarFichas() {
    return this.getFichas().length;
  }
}