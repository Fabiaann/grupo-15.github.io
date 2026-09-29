document.addEventListener("DOMContentLoaded", function () {

    const formulario = document.querySelector(".formulario");
    const mail = document.querySelector("#mail");
    const password = document.querySelector("#password");
    const errorMail = document.querySelector("#error-mail");
    const errorPassword = document.querySelector("#error-password");

    formulario.addEventListener("submit", function (event) {
        event.preventDefault();
console.log("1. El evento submit del registro arrancó perfecto");
        errorMail.textContent = "";
        errorPassword.textContent = "";

        let formularioValido = true;

        if (mail.value.trim() === "") {
            errorMail.textContent = "El mail es obligatorio";
            formularioValido = false;
        } else if (!mail.checkValidity()) {
            errorMail.textContent = "Ingresá un mail válido";
            formularioValido = false;
        }

        if (password.value.trim() === "") {
            errorPassword.textContent = "La contraseña es obligatoria";
            formularioValido = false;
        } else if (password.value.length < 8) {
            errorPassword.textContent = "La contraseña debe tener al menos 8 caracteres";
            formularioValido = false;
        }

        if (!formularioValido) {
            return;
        }

        console.log("¡Todo válido, redirigiendo!");
        window.location.href = "../index.html";
    });

});
