
const contenedor = document.querySelector('.contenedor-cards');
const btnNext = document.querySelector('.mover-izquierda');
const btnDer = document.querySelector('.mover-derecha');



btnNext.addEventListener('click', () => {
  const cards = contenedor.querySelectorAll('.card'); 

 cards.forEach(card => {
    card.classList.add('animar');
  });
  
  setTimeout(() => {
    const primeraCard = cards[0];
    

    contenedor.appendChild(primeraCard);


    cards.forEach(card => {
      card.classList.remove('animar');
    });
  }, 1900);



});






btnDer.addEventListener('click', () => {
  const cards = contenedor.querySelectorAll('.card');
  const ultimaCard = cards[cards.length - 1];
  

 cards.forEach(card => {
    card.classList.add('animar-derecha');
  });
  
  setTimeout(() => {
    const primeraCard = cards[0];
    
  
    contenedor.appendChild(primeraCard);

    
    cards.forEach(card => {
      card.classList.remove('animar-derecha');
    });
  }, 1900);




  contenedor.prepend(ultimaCard);
});




const cardMuestra= document.querySelector('.card-muestra');
const cardConfirmacion= document.querySelector('.card-confirmacion');
document.querySelector('#btn-alquilo-1').addEventListener('click',function(){

    cardMuestra.classList.add('ocultar-card');
    cardConfirmacion.classList.remove('ocultar-card');
    
})


document.querySelector('#btn-alquilo-2').addEventListener('click',function(){

    cardMuestra.classList.add('ocultar-card');
    cardConfirmacion.classList.remove('ocultar-card');
    
})

document.querySelector('#btn-alquilo-3').addEventListener('click',function(){

    cardMuestra.classList.add('ocultar-card');
    cardConfirmacion.classList.remove('ocultar-card');
    
})



document.querySelector('.cancelar-confirmacion').addEventListener('click',function(){

cardConfirmacion.classList.add('ocultar-card');
  cardMuestra.classList.remove('ocultar-card');


})













