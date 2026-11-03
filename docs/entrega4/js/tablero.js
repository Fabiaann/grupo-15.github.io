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
  constructor(tablero = TABLERO, tiposFicha = ['tipoA', 'tipoB', 'tipoC']) {
    this.tablero = tablero;
    this.tiposFicha = tiposFicha;
    this.filas = tablero.length;
    this.cols = tablero[0].length;
    this.celdas = [];
    this.reiniciar();
  }

  


  esCeldaValida(f, c) {
    return ( (f >= 0 )&& 
    (f < this.filas && c >= 0) && 
    (c < this.cols )&&
    (this.tablero[f][c] === 1));
  }
  estaVacia(f, c) {
    return (this.esCeldaValida(f, c) && !this.celdas[f][c]);
  }
  getFicha(f, c) {
   if (this.esCeldaValida(f, c)) {
    return this.celdas[f][c] || null;
} else {
    return null;
}
  }
  mover(ficha, f, c) {
    this.celdas[ficha.fila][ficha.col] = undefined;
    this.celdas[f][c] = ficha;
    ficha.setPosicion(f, c);
  }

  quitar(f, c) {
    const ficha = this.celdas[f][c];
    this.celdas[f][c] = undefined;
    return ficha;
  }


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

reiniciar() {
  let id = 0;
  const cf = Math.floor(this.filas / 2);
  const cc = Math.floor(this.cols / 2);
  this.celdas = this.tablero.map((fila, f) =>
    fila.map((v, c) => {
      if (!v) return null;                      
      if (f === cf && c === cc) return undefined; 
      const tipo = this.tiposFicha[Math.floor(Math.random() * this.tiposFicha.length)];
      return new Ficha(id++, tipo, f, c);
    })
  );
}


  contarFichas() {
    return this.getFichas().length;
  }
}