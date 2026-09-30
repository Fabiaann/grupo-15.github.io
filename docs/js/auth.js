const menuButton = document.querySelector('.site-header__menu-button');
const siteMenu = document.querySelector('#site-menu');
const categoriesButton = document.querySelector('.site-menu__categories');
const categoriesList = document.querySelector('#site-categories');

if (menuButton && siteMenu && categoriesButton && categoriesList) {
  function closeMenu(restoreFocus = false) {
    siteMenu.hidden = true;
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Abrir menú');
    categoriesList.hidden = true;
    categoriesButton.setAttribute('aria-expanded', 'false');
    if (restoreFocus) menuButton.focus();
  }

  menuButton.addEventListener('click', () => {
    if (!siteMenu.hidden) return closeMenu();
    siteMenu.hidden = false;
    menuButton.setAttribute('aria-expanded', 'true');
    menuButton.setAttribute('aria-label', 'Cerrar menú');
  });
  categoriesButton.addEventListener('click', () => {
    categoriesList.hidden = !categoriesList.hidden;
    categoriesButton.setAttribute('aria-expanded', String(!categoriesList.hidden));
  });
  siteMenu.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => closeMenu()));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !siteMenu.hidden) closeMenu(true);
  });
}

const form = document.querySelector('.auth-form');
const message = document.querySelector('#auth-message');

function setError(field, text) {
  field.setAttribute('aria-invalid', String(Boolean(text)));
  const error = document.querySelector(`#${field.id}-error`);
  if (error) error.textContent = text;
}

if (form) {
  form.querySelectorAll('input').forEach((field) => field.addEventListener('input', () => {
    setError(field, '');
    message.textContent = '';
    message.classList.remove('is-success');
  }));
}

const loginForm = document.querySelector('#login-form');
if (loginForm) {
  loginForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const username = document.querySelector('#username');
    const password = document.querySelector('#password');
    let valid = true;

    if (!username.value.trim()) { setError(username, 'Ingresá el usuario.'); valid = false; }
    if (!password.value) { setError(password, 'Ingresá la contraseña.'); valid = false; }
    if (!valid) {
      message.textContent = 'Completá los campos indicados.';
      loginForm.querySelector('[aria-invalid="true"]').focus();
      return;
    }

    if (username.value !== 'root' || password.value !== '1234') {
      message.textContent = 'Usuario o contraseña incorrectos. Usá las credenciales de prueba indicadas arriba.';
      return;
    }

    sessionStorage.setItem('juegosonline-demo-user', 'root');
    message.textContent = '¡Acceso correcto! Entrando al Home…';
    message.classList.add('is-success');
    loginForm.querySelector('button[type="submit"]').disabled = true;
    window.setTimeout(() => { window.location.href = '../index.html'; }, 950);
  });
}

const registerForm = document.querySelector('#register-form');
if (registerForm) {
  registerForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const name = document.querySelector('#full-name');
    const birth = document.querySelector('#birth-date');
    const email = document.querySelector('#email');
    const password = document.querySelector('#new-password');
    const confirm = document.querySelector('#confirm-password');
    let valid = true;
    const fail = (field, text) => { setError(field, text); valid = false; };

    if (name.value.trim().split(/\s+/).length < 2) fail(name, 'Ingresá nombre y apellido.');
    if (!birth.value) {
      fail(birth, 'Ingresá tu fecha de nacimiento.');
    } else {
      const date = new Date(`${birth.value}T00:00:00`);
      const limit = new Date();
      limit.setFullYear(limit.getFullYear() - 13);
      if (Number.isNaN(date.getTime()) || date > limit) fail(birth, 'Debés tener al menos 13 años.');
    }
    if (!email.value.trim() || !email.checkValidity()) fail(email, 'Ingresá un correo válido.');
    if (password.value.length < 8) fail(password, 'La contraseña debe tener al menos 8 caracteres.');
    if (!confirm.value || confirm.value !== password.value) fail(confirm, 'Las contraseñas no coinciden.');

    if (!valid) {
      message.textContent = 'Revisá los campos indicados.';
      registerForm.querySelector('[aria-invalid="true"]').focus();
      return;
    }

    registerForm.hidden = true;
    document.querySelector('#register-success').hidden = false;
    document.querySelector('#register-success a').focus();
  });
}