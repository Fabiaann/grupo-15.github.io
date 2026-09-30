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
  let opener = null;

  const formatPesos = (value) => `${new Intl.NumberFormat('es-AR').format(value)} pesos`;
  const readAmount = () => { const raw = input.value.trim(); return /^\d+$/.test(raw) && Number(raw) > 0 ? Number(raw) : null; };
  function validate(showError = false) {
    const amount = readAmount();
    total.textContent = amount ? formatPesos(amount * PESOS_PER_COIN) : '0 pesos';
    generate.disabled = !amount;
    input.setAttribute('aria-invalid', String(!amount && input.value !== ''));
    error.textContent = showError && !amount ? 'Ingresá una cantidad entera mayor que cero.' : '';
    return amount;
  }
  function reset() {
    form.reset(); formView.hidden = false; qrView.hidden = true; error.textContent = ''; total.textContent = '0 pesos'; generate.disabled = true; input.setAttribute('aria-invalid', 'false');
  }
  function closeOtherOverlays() {
    document.dispatchEvent(new CustomEvent('close-game-overlays'));
    document.querySelector('.site-header__menu-button[aria-expanded="true"]')?.click();
    document.querySelector('.site-header__profile[aria-expanded="true"]')?.click();
  }
  function open(trigger) { opener = trigger; closeOtherOverlays(); reset(); dialog.showModal(); input.focus(); }

  document.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-open-recharge]');
    if (!trigger) return;
    event.preventDefault(); open(trigger);
  });
  dialog.querySelectorAll('[data-close-recharge]').forEach((button) => button.addEventListener('click', () => dialog.close()));
  dialog.querySelector('[data-edit-recharge]').addEventListener('click', () => { qrView.hidden = true; formView.hidden = false; input.focus(); });
  input.addEventListener('input', () => validate(false));
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const amount = validate(true);
    if (!amount) { input.focus(); return; }
    qrCoins.textContent = `${amount} ${amount === 1 ? 'coin' : 'coins'}`;
    qrTotal.textContent = formatPesos(amount * PESOS_PER_COIN);
    formView.hidden = true; qrView.hidden = false; dialog.querySelector('[data-edit-recharge]').focus();
  });
  dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener('close', () => { reset(); opener?.focus(); opener = null; });
  if (location.hash === '#coin-recharge') {
    history.replaceState(null, '', `${location.pathname}${location.search}`);
    open(document.querySelector('[data-open-recharge]'));
  }
})();
