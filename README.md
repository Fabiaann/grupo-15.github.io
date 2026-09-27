# JuegosOnline — Trabajo práctico de Interfaces de Usuario

Sitio estático hecho con HTML5, CSS3 y JavaScript nativo. No requiere instalar paquetes ni iniciar un backend.

## Estructura

```text
entrega-juegosonline/
├── README.md
└── docs/
    ├── index.html                 Home mobile-first
    ├── pages/
    │   ├── game.html             Página de Fungi Solitaire
    │   ├── login.html            Inicio de sesión de prueba
    │   └── register.html         Registro simulado
    ├── css/
    │   ├── style.css             Estilos generales y loader
    │   ├── header.css            Cabecera y menú
    │   ├── footer.css            Pie de página
    │   ├── cards.css             Tarjetas, carruseles y ficha de juego
    │   ├── game.css              Página del juego
    │   └── auth.css              Formularios
    ├── js/
    │   ├── main.js               Menú, sesión visible y loader del Home
    │   ├── catalog.js            API, tarjetas, carruseles y ficha de juego
    │   ├── catalog-fallback.js   Catálogo local de respaldo
    │   ├── game.js               Interacciones de la página del juego
    │   └── auth.js               Validación y sesión de prueba
    └── assets/                   Logo, imagen de Fungi e imágenes locales
```

## Probar el sitio

Abrí una terminal en `entrega-juegosonline/` y ejecutá:

```powershell
py -m http.server 8000 --directory docs
```

Después abrí `http://localhost:8000/` en el navegador. Si no tenés el lanzador `py`, podés usar `python -m http.server 8000 --directory docs`. Las rutas entre páginas son relativas a `docs/`; conviene probarlas por HTTP y no abriendo los archivos con `file://`.

El Home muestra durante cinco segundos una carga simulada con porcentaje y tres pelotitas animadas. Incluye tres carruseles de 12 juegos, tarjetas que giran al pasar el cursor o recibir foco y fichas informativas. La tarjeta destacada de Fungi Solitaire abre `pages/game.html`. Esa página muestra una imagen de ejemplo del juego; no hay motor de juego ni backend.

El catálogo solicita datos a la [API de videojuegos propuesta por la cátedra](https://github.com/jimartinezabadias/api-vj-interfaces). Si la API falla o no devuelve suficientes juegos, `catalog-fallback.js` permite seguir mostrando los carruseles. Las imágenes de los juegos, las fuentes de Google y los íconos sociales de Font Awesome dependen de servicios externos; el sitio tiene recursos locales de respaldo para las tarjetas.

## Formularios de demostración

En el login aparece el usuario de prueba:

- Usuario: `root`
- Contraseña: `1234`

Es el único acceso aceptado por el formulario de prueba. El estado se guarda solo en `sessionStorage` del navegador durante la sesión; no se envían credenciales a un servidor. El registro valida campos y muestra una confirmación animada, pero no crea cuentas ni persiste los datos.

## Pasar al repositorio de entrega

Esta carpeta es una copia independiente y **no contiene historial Git**. Copiá **`docs/` y `README.md`**, no la carpeta `entrega-juegosonline/` completa, a la raíz del repositorio de tu compañero. El resultado debe quedar así:

```text
repositorio-del-grupo/
├── README.md
└── docs/
    ├── index.html
    ├── pages/
    ├── css/
    ├── js/
    └── assets/
```

Si allí ya existen archivos con los mismos nombres, revisá las diferencias con tu compañero antes de reemplazarlos. Comprobá que `docs/index.html` y las otras tres páginas abran correctamente desde el repositorio copiado. La consigna exige entregar desde la rama `gh-pages`: prepará esa rama y la publicación en el **repositorio de destino**, revisá `git status` y agregá también los archivos nuevos de `docs/` antes de confirmar y subir los cambios.

Esta carpeta es una instantánea del sitio al momento de prepararla. Si se modifica el proyecto original después, habrá que actualizar esta copia antes de entregarla.
