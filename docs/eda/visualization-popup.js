(() => {
  const trigger = document.querySelector('[data-viz-guide]');
  const dialog = document.querySelector('#visualization-guide-dialog');
  if (!trigger || !dialog || typeof dialog.showModal !== 'function') return;
  const frame = dialog.querySelector('iframe');
  const close = dialog.querySelector('[data-viz-close]');
  let previousFocus;
  trigger.addEventListener('click', event => {
    event.preventDefault();
    previousFocus = document.activeElement;
    if (!frame.getAttribute('src')) frame.src = trigger.href;
    dialog.showModal();
    close.focus();
  });
  close.addEventListener('click', () => dialog.close());
  dialog.addEventListener('keydown', event => event.stopPropagation());
  dialog.addEventListener('close', () => previousFocus?.focus());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
  window.addEventListener('message', event => {
    if (event.origin === location.origin && event.source === frame.contentWindow && event.data === 'eda-viz-guide-close') dialog.close();
  });
})();
