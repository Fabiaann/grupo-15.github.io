const personaje = document.getElementById("personaje");

document.addEventListener("keydown", (event) => {
  if (event.key.toLowerCase() === "w") {
    personaje.classList.remove("Salto");
   
    personaje.classList.add("Salto");
  }

  if(event.key.toLowerCase()==="s"){
    personaje.classList.remove("agachado");
    personaje.classList.add("agachado");
  }
});

personaje.addEventListener("animationend", () => {
  personaje.classList.remove("Salto");
  personaje.classList.remove("agachado");
});


document.getElementById('stage').classList.add('moving');