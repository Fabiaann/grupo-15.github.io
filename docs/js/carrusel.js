
const juegos = [
 
   { titulo: 'FIFA', imagen: './img/logo.jpg', precio: 120, categoria: 'biblioteca' , tiempo: '36:11:12' },
  { titulo: 'FIFA', imagen: './img/logo.jpg', precio: 120, categoria: 'biblioteca' , tiempo: '10 dias'  },
  { titulo: 'FIFA', imagen: './img/logo.jpg', precio: 120, categoria: 'biblioteca'  , tiempo: '4 dias' },
{ titulo: 'FIFA', imagen: './img/logo.jpg', precio: 120, categoria: 'biblioteca'  , tiempo: '4hs'  },
 { titulo: 'FIFA', imagen: './img/logo.jpg', precio: 120, categoria: 'biblioteca' , tiempo: '30min'  },
 { titulo: 'FIFA', imagen: './img/logo.jpg', precio: 120, categoria: 'biblioteca'  , tiempo: '10min' },
{ titulo: 'FIFA', imagen: './img/logo.jpg', precio: 120, categoria: 'biblioteca'  , tiempo: '5min'  },
  { titulo: 'Zelda', imagen: './img/tom.jpg', precio: 100, categoria: 'Aventura' },
  { titulo: 'Zelda', imagen: './img/tom.jpg', precio: 100, categoria: 'Aventura' },
   { titulo: 'Zelda', imagen: './img/tom.jpg', precio: 100, categoria: 'Aventura' },
   { titulo: 'Zelda', imagen: './img/tom.jpg', precio: 100, categoria: 'Aventura' },
 { titulo: 'Zelda', imagen: './img/tom.jpg', precio: 100, categoria: 'Aventura' },
    { titulo: 'Zelda', imagen: './img/tom.jpg', precio: 100, categoria: 'Aventura' },
  { titulo: 'Mario Kart', imagen: './img/juego1.jpg', precio: 80, categoria: 'Carreras' },
   { titulo: 'Assetto Corsa', imagen: './img/assetoCorsa.jpg', precio: 80, categoria: 'Carreras' },
    { titulo: 'Bream Ng Drive', imagen: './img/BeamNg.drive.jpg', precio: 80, categoria: 'Carreras' },
     { titulo: 'Proyects Cars 2', imagen: './img/proyectsCars2.jpg', precio: 80, categoria: 'Carreras' },
      { titulo: 'Moto Gp 2', imagen: './img/MotoGp24.jpg', precio: 80, categoria: 'Carreras' },
       { titulo: 'Moto Gp 2', imagen: './img/MotoGp24.jpg', precio: 80, categoria: 'Carreras' },
  { titulo: '1', imagen: './img/tenis.jpg', precio: 120, categoria: 'Deportes' },
  { titulo: '2', imagen: './img/juego3.jpg', precio: 120, categoria: 'Deportes' },
  { titulo: '3', imagen: './img/juego4.jpg', precio: 120, categoria: 'Deportes' },
  { titulo: '4', imagen: './img/juego5.jpg', precio: 120, categoria: 'Deportes' },
  { titulo: '5', imagen: './img/juegoAventura1.jpg', precio: 120, categoria: 'Deportes' },
  { titulo: '6', imagen: './img/juegoAventura2.jpg', precio: 120, categoria: 'Deportes' },
    { titulo: '5', imagen: './img/juegoAventura1.jpg', precio: 120, categoria: 'Deportes' },
  { titulo: '6', imagen: './img/juegoAventura2.jpg', precio: 120, categoria: 'Deportes' },
  
  { titulo: 'FIFA', imagen: './img/logo.jpg', precio: 120, categoria: 'Mas Jugados' },
  { titulo: 'FIFA', imagen: './img/logo.jpg', precio: 120, categoria: 'Mas Jugados' },
    { titulo: 'FIFA', imagen: './img/logo.jpg', precio: 120, categoria: 'Mas Jugados' },
      { titulo: 'FIFA', imagen: './img/logo.jpg', precio: 120, categoria: 'Mas Jugados' },
            { titulo: 'FIFA', imagen: './img/logo.jpg', precio: 120, categoria: 'Mas Jugados' },
                  { titulo: 'FIFA', imagen: './img/logo.jpg', precio: 120, categoria: 'Mas Jugados' }






];

const porCategoria = {};

juegos.forEach(function (j) {
  if (!porCategoria[j.categoria]) {
    porCategoria[j.categoria] = [];
  }
  porCategoria[j.categoria].push(j);
});

const contenedor = document.querySelector('#contenedor-principal');


function opcionesAlquiler(extraClase = "") {
  return `<div class="card-alquilar ${extraClase}">
            <p>¿Por cuanto tiempo deseas alquilar?</p>
            <div class="btn-card-alquilar">
              <div class="alq-1mes"><button class="btn-alquiler">1 mes</button></div>
              <div class="alq-2mes"><button class="btn-alquiler">2 meses</button></div>
              <div class="alq-3mes"><button class="btn-alquiler">3 meses</button></div>
            </div>
               <button class="" >cerrar</button>
          </div>`;
}

function cardConfirmacion(j) {
  return `<div class="card card-confirmacion ocultar-card">
            <div class="cards">
              <div class="cara card-frente">
                <img src="${j.imagen}" class="imagen-juego">
                <p class="titulo-juego">${j.titulo}</p>
              </div>
              <div class="cara card-dorso">
                <img src="${j.imagen}" class="imagen-juego">
                <div class="card-alquilar">
                  <p>Confirma tu alquiler</p>
                  <div class="mostrar-info-alquiler">
                    <div class="fila-dato">
                      <p>Precio:</p>
                      <p class="mostrar-precio"></p>
                      <p class="colocacion-precio">${j.precio}</p>
                    </div>
                    <div class="fila-dato">
                      <p>Tiempo alquiler:</p>
                      <p class="mostrar-tiempo"></p>
                    </div>
                  </div>
                  <div class="btn-card-confirmacion">
                    <button class="cancelar-confirmacion">Cancelar</button>
                    <button class="confirmar-confirmacion">Confirmar</button>
                  </div>
                </div>
              </div>
            </div>
          </div>`;
}



function cardAlquiler(j) {
  return `<div class="juego">
            <div class="card card-muestra">
              <div class="cards">
                <div class="cara card-frente">
                  <img src="${j.imagen}" class="imagen-juego">
                  <p class="titulo-juego">${j.titulo}</p>
                </div>
                <div class="cara card-dorso">
                  <img src="${j.imagen}" class="imagen-juego">
                  ${opcionesAlquiler()}
                </div>
              </div>
            </div>
            ${cardConfirmacion(j)}
          </div>`;
}

function cardBiblioteca(j) {
  return `<div class="juego">
            <div class="card card-muestra ">
               
              <div class="cards">
          
              <div class="cara card-frente ">
              <div class="tiempo-de-alquiler">  <img src="./svg/time.svg" >
               <p> ${j.tiempo}</p>  </div>
             
              <img src="${j.imagen}" class="imagen-juego">
                  <p class="titulo-juego">${j.titulo}</p>
              
                </div>
                <div class="cara card-dorso">
                  <img src="${j.imagen}" class="imagen-juego">

                  <div class="card-alquilar acciones-biblioteca">
                    <div class="btn-card-alquilar">
                      <button class="btn-jugar">Jugar</button>
                      <button class="btn-extender">Extender</button>
                    </div>
                  </div>

                  ${opcionesAlquiler("opciones-alquiler ocultar-card")}
               
                </div>
              </div>
            </div>
            ${cardConfirmacion(j)}
          </div>`;
}



Object.keys(porCategoria).forEach(function (categoria) {
  let cardsHTML = '';

  porCategoria[categoria].forEach(function (j) {
    cardsHTML += categoria.toLowerCase() === "biblioteca"
      ? cardBiblioteca(j)
      : cardAlquiler(j);
  });

  contenedor.insertAdjacentHTML('beforeend', `
    <div class="carrusel-juegos">
      <h2 class="titulo-carrusel">${categoria}</h2>
      <div class="carrusel-scroll">
        <button class="mover-izquierda">&lt;</button>
        <div class="contenedor-cards">
          ${cardsHTML}
        </div>
        <button class="mover-derecha">&gt;</button>
      </div>
    </div>
  `);
});



document.addEventListener("click", function (e) {
  if (e.target.classList.contains("btn-extender")) {
    const dorso = e.target.closest(".card-dorso");
    dorso.querySelector(".acciones-biblioteca").classList.add("ocultar-card");
    dorso.querySelector(".opciones-alquiler").classList.remove("ocultar-card");
  }
});
















const carruseles = document.querySelectorAll('.carrusel-juegos');

carruseles.forEach(carrusel => {

    const contenedor = carrusel.querySelector('.contenedor-cards');
    const btnIzq = carrusel.querySelector('.mover-izquierda');
    const btnDer = carrusel.querySelector('.mover-derecha');

    // IZQUIERDA
    btnIzq.addEventListener('click', () => {

        const juegos = contenedor.querySelectorAll('.juego');

        juegos.forEach(juego => {
            juego.classList.add('animar');
        });

        setTimeout(() => {

            const primerJuego = contenedor.querySelector('.juego');

            contenedor.appendChild(primerJuego);

            juegos.forEach(juego => {
                juego.classList.remove('animar');
            });

        }, 1900);
    });


   btnDer.addEventListener('click', () => {

    const juegos = contenedor.querySelectorAll('.juego');
    const ultimoJuego = juegos[juegos.length - 1];

    
    juegos.forEach(juego => {

        if (juego !== ultimoJuego) {
            juego.classList.add('animar-derecha');
        }

    });

  


    setTimeout(() => {

      
        contenedor.prepend(ultimoJuego);

        juegos.forEach(juego => {
            juego.classList.remove('animar-derecha');
            juego.classList.remove('entrar-desde-izquierda');
        });

    }, 1900);
});

});

document.querySelectorAll('.juego').forEach(function (juego) {


  



  document.querySelectorAll('.juego').forEach(function (juego) {

    const cardMuestra = juego.querySelector('.card-muestra');
    const cardConfirmacion = juego.querySelector('.card-confirmacion');
    const mostrarPrecio = juego.querySelector('.mostrar-precio');
    const mostrarTiempo = juego.querySelector('.mostrar-tiempo');
    const precioBase = Number(juego.querySelector('.colocacion-precio').textContent);

    juego.querySelector('.alq-1mes .btn-alquiler').addEventListener('click', function () {
      cardMuestra.classList.add('ocultar-card');
      mostrarPrecio.textContent = precioBase;
      mostrarTiempo.textContent = '1 mes';
      cardConfirmacion.classList.remove('ocultar-card');
    });

    juego.querySelector('.alq-2mes .btn-alquiler').addEventListener('click', function () {
      cardMuestra.classList.add('ocultar-card');
      mostrarPrecio.textContent = precioBase * 2;
      mostrarTiempo.textContent = '2 meses';
      cardConfirmacion.classList.remove('ocultar-card');
    });

    juego.querySelector('.alq-3mes .btn-alquiler').addEventListener('click', function () {
      cardMuestra.classList.add('ocultar-card');
      mostrarPrecio.textContent = precioBase * 3;
      mostrarTiempo.textContent = '3 meses';
      cardConfirmacion.classList.remove('ocultar-card');
    });

    juego.querySelector('.cancelar-confirmacion').addEventListener('click', function () {
      cardConfirmacion.classList.add('ocultar-card');
      cardMuestra.classList.remove('ocultar-card');
    });

  });

  juego.querySelector('.cancelar-confirmacion').addEventListener('click', function () {
    cardConfirmacion.classList.add('ocultar-card');
    cardMuestra.classList.remove('ocultar-card');
  });

});

const recargarCoins = document.querySelector(".recargar-coins");
const btnRecargarCoins = document.querySelector("#recargarCoins");

const formularioRecargaCoins = document.querySelector(".recargar-coins-formulario");
const mostrarQr = document.querySelector(".mostrar-qr");

const input = document.getElementById("cantidad-coins-comprar");

const btnQr = document.getElementById("generar-qr");
const cerrarQr = document.querySelector(".cerrar-qr");
const cerrarBtnQr = document.getElementById("cerrar-generar-qr");

const totalPagar = document.querySelectorAll(".total-pago-coins");

btnRecargarCoins.addEventListener("click", () => {

    recargarCoins.classList.remove("ocultar-qr");

    
    formularioRecargaCoins.classList.remove("ocultar-qr");


    mostrarQr.classList.add("ocultar-qr");

});



input.addEventListener("input", () => {

    const cantidad = parseInt(input.value) || 0;
    const total = cantidad * 1200;

    totalPagar.forEach((elemento) => {
        elemento.innerHTML = total;
    });

});



btnQr.addEventListener("click", () => {

    formularioRecargaCoins.classList.add("ocultar-qr");

    mostrarQr.classList.remove("ocultar-qr");

});




cerrarQr.addEventListener("click", () => {

    mostrarQr.classList.add("ocultar-qr");

    formularioRecargaCoins.classList.remove("ocultar-qr");

});


cerrarBtnQr.addEventListener("click", () => {

    formularioRecargaCoins.classList.add("ocultar-qr");

    mostrarQr.classList.add("ocultar-qr");

    recargarCoins.classList.add("ocultar-qr");

});