
const juegos = [

  { titulo: '1', imagen: './img/tenis.jpg', precio: 120, categoria: 'Deportes' },
  { titulo: '2', imagen: './img/juego3.jpg', precio: 120, categoria: 'Deportes' },
  { titulo: '3', imagen: './img/juego4.jpg', precio: 120, categoria: 'Deportes' },
    { titulo: '4', imagen: './img/tenis.jpg', precio: 120, categoria: 'Deportes' },
  { titulo: '5', imagen: './img/juego3.jpg', precio: 120, categoria: 'Deportes' },
  { titulo: '6', imagen: './img/juego4.jpg', precio: 120, categoria: 'Deportes' },
  { titulo: '7', imagen: './img/juego5.jpg', precio: 120, categoria: 'Deportes' },
  { titulo: '8', imagen: './img/juegoAventura1.jpg', precio: 120, categoria: 'Deportes' },
  { titulo: '9', imagen: './img/juegoAventura2.jpg', precio: 120, categoria: 'Deportes' }



];

const porCategoria = {};

juegos.forEach(function (j) {
  if (!porCategoria[j.categoria]) {
    porCategoria[j.categoria] = [];
  }
  porCategoria[j.categoria].push(j);
});


const contenedor = document.querySelector('#contenedor-principal');

Object.keys(porCategoria).forEach(function (categoria) {

  let cardsHTML = '';


  porCategoria[categoria].forEach(function (j) {
    cardsHTML += `<div class="juego ">
                    <div class="card card-muestra" >
                      <div class="cards">
                        <div class="cara card-frente">
                            <img src="${j.imagen}" class="imagen-juego">
                            <p class="titulo-juego">${j.titulo}</p>
                          </div>

                        <div class="cara card-dorso">
                          <img src="${j.imagen}" class="imagen-juego">
                            <div class="card-alquilar" > 
                              <p >¿Por cuanto tiempo deseas alquilar?</p> 
                                <div class="btn-card-alquilar">  
                                  <div class="alq-1mes"> 
                                    <button class="btn-alquiler"  >1 mes </button>
                                  </div>

                                  <div class="alq-2mes"> 
                                    <button class="btn-alquiler"  >2 meses</button>             
                                    </div>
                                  <div class="alq-3mes"> 
                                    <button class="btn-alquiler ">3 meses</button>
                                   </div>
                   
                                </div>
                              </div>
                            </div>

                          </div>
                         </div>

                         <div class="card card-confirmacion ocultar-card">


                           <div class="cards">

                            <div class="cara card-frente">
                              <img src="${j.imagen}" class="imagen-juego">
                              <p class="titulo-juego">${j.titulo}juego</p>
                              </div>

                            <div class="cara card-dorso">
              
                              <img src="${j.imagen}" class="imagen-juego">
                              <div class="card-alquilar" > 
                                <p >Confirma tu alquiler</p> 

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
                      </div>
                    </div>
      `;
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

























const carruseles = document.querySelectorAll('.carrusel-juegos');


carruseles.forEach(carrusel => {

    const contenedor = carrusel.querySelector('.contenedor-cards');
    const btnIzq = carrusel.querySelector('.mover-izquierda');
    const btnDer = carrusel.querySelector('.mover-derecha');

    
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


const formularioRecargaCoins = document.querySelector(".recargar-coins-formulario");
const input = document.getElementById("cantidad-coins-comprar");
let cantidad = parseInt(input.value);

const totalPagar = document.getElementById("total-pago-coins");

input.addEventListener("input", () => {
    let cantidad = parseInt(input.value) || 0;
    totalPagar.innerHTML = cantidad * 1200;
});

const btnQr= document.getElementById("generar-qr");

btnQr.addEventListener('click' ,()=>{
  const mostrarQr=document.querySelector(".mostrar-qr");
  mostrarQr.classList.remove("ocultar-qr");
  formularioRecargaCoins.classList.add("ocultar-qr");



});
