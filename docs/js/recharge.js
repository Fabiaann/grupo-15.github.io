(() => {
  const PESOS_PER_COIN = 1200;
  const dialog = document.querySelector('#coin-recharge');
  const formView = dialog.querySelector('[data-recharge-form-view]');
  const qrView = dialog.querySelector('[data-recharge-qr-view]');
  const form = dialog.querySelector('form');
  const input = dialog.querySelector('#recharge-amount');
  const total = dialog.querySelector('[data-recharge-total]');
  const error = dialog.querySelector('[data-recharge-error]');
  const generate = dialog.querySelector('[data-generate-qr]');
  const qrCoins = dialog.querySelector('[data-qr-coins]');
  const qrTotal = dialog.querySelector('[data-qr-total]');
  const headerTrigger = document.querySelector('.site-header__balance [data-open-recharge]');
  let opener = null;

  const formatPesos = (value) => `$ ${new Intl.NumberFormat('es-AR').format(value)}`;
  const readAmount = () => {
    const raw = input.value.trim();
    return /^\d+$/.test(raw) && Number(raw) > 0 ? Number(raw) : null;
  };

  function validate(showError = false) {
    const amount = readAmount();
    total.textContent = amount ? formatPesos(amount * PESOS_PER_COIN) : '$ 0';
    generate.disabled = !amount;
    input.setAttribute('aria-invalid', String(!amount && input.value !== ''));
    error.textContent = showError && !amount ? 'Ingresá una cantidad entera mayor que cero.' : '';
    return amount;
  }

  function reset() {
    form.reset();
    formView.hidden = false;
    qrView.hidden = true;
    error.textContent = '';
    total.textContent = '$ 0';
    generate.disabled = true;
    input.setAttribute('aria-invalid', 'false');
  }

  function closeOtherOverlays() {
    document.dispatchEvent(new CustomEvent('close-game-overlays'));
    document.querySelector('.site-header__menu-button[aria-expanded="true"]')?.click();
    document.querySelector('.site-header__profile[aria-expanded="true"]')?.click();
  }

  function positionPanel() {
    if (!dialog.open) return;
    const anchor = headerTrigger || opener;
    const rect = anchor.getBoundingClientRect();
    const width = dialog.offsetWidth;
    const gap = 9;
    const left = Math.min(Math.max(12, rect.left + rect.width / 2 - width / 2), window.innerWidth - width - 12);
    const top = Math.min(rect.bottom + gap, window.innerHeight - Math.min(dialog.scrollHeight, 420) - 12);
    dialog.style.setProperty('--recharge-left', `${Math.max(12, left)}px`);
    dialog.style.setProperty('--recharge-top', `${Math.max(12, top)}px`);
  }

  function close({ restoreFocus = true } = {}) {
    if (!dialog.open) return;
    dialog.close();
    document.querySelectorAll('[data-open-recharge]').forEach((trigger) => trigger.setAttribute('aria-expanded', 'false'));
    if (restoreFocus && opener?.isConnected) opener.focus();
    opener = null;
  }

  function open(trigger) {
    if (dialog.open) {
      close();
      return;
    }
    opener = trigger;
    closeOtherOverlays();
    reset();
    dialog.show();
    trigger.setAttribute('aria-expanded', 'true');
    positionPanel();
    input.focus();
  }

  document.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-open-recharge]');
    if (trigger) {
      event.preventDefault();
      open(trigger);
      return;
    }
    if (dialog.open && !dialog.contains(event.target)) close({ restoreFocus: false });
  });

  dialog.querySelectorAll('[data-close-recharge]').forEach((button) => button.addEventListener('click', () => close()));
  dialog.querySelector('[data-edit-recharge]').addEventListener('click', () => {
    qrView.hidden = true;
    formView.hidden = false;
    positionPanel();
    input.focus();
  });
  input.addEventListener('input', () => validate(false));
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const amount = validate(true);
    if (!amount) {
      input.focus();
      return;
    }
    qrCoins.textContent = `${amount} ${amount === 1 ? 'coin' : 'coins'}`;
    qrTotal.textContent = formatPesos(amount * PESOS_PER_COIN);
    formView.hidden = true;
    qrView.hidden = false;
    positionPanel();
    dialog.querySelector('[data-edit-recharge]').focus();
  });
  dialog.addEventListener('cancel', (event) => {
    event.preventDefault();
    close();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || !dialog.open) return;
    event.preventDefault();
    close();
  });
  dialog.addEventListener('close', reset);
  window.addEventListener('resize', positionPanel);

  if (location.hash === '#coin-recharge') {
    history.replaceState(null, '', `${location.pathname}${location.search}`);
    open(headerTrigger);
  }
})();
