(() => {
  const slides = [...document.querySelectorAll('.slide')];
  const progress = document.querySelector('.progress');
  const counter = document.querySelector('.slide-counter');
  const overview = document.querySelector('.overview');
  const note = document.querySelector('.speaker-note');
  let current = Math.max(0, Math.min(slides.length - 1, Number(location.hash.replace('#','')) - 1 || 0));
  let noteOpen = false;

  function render(pushHash = true) {
    slides.forEach((slide, i) => slide.classList.toggle('active', i === current));
    slides[current].scrollTop = 0;
    progress.style.width = `${((current + 1) / slides.length) * 100}%`;
    counter.textContent = `${current + 1} / ${slides.length}`;
    note.textContent = slides[current].dataset.notes || '강사 노트가 없습니다.';
    note.classList.toggle('open', noteOpen);
    document.title = `${current + 1}. ${slides[current].dataset.title} · 자료탐색방법론`;
    if (pushHash) history.replaceState(null, '', `#${current + 1}`);
  }
  function go(delta) { current = Math.max(0, Math.min(slides.length - 1, current + delta)); render(); }
  function openOverview() { overview.classList.toggle('open'); }

  slides.forEach((slide, i) => {
    const thumb = document.createElement('button');
    thumb.className = 'thumb';
    thumb.innerHTML = `<b>${String(i + 1).padStart(2,'0')}</b><strong>${slide.dataset.title || '슬라이드'}</strong>`;
    thumb.addEventListener('click', () => { current = i; overview.classList.remove('open'); render(); });
    overview.appendChild(thumb);
  });

  document.querySelectorAll('.control').forEach(button => button.addEventListener('click', async () => {
    const action = button.dataset.action;
    if (action === 'prev') go(-1);
    if (action === 'next') go(1);
    if (action === 'overview') openOverview();
    if (action === 'notes') { noteOpen = !noteOpen; render(false); }
    if (action === 'fullscreen') {
      if (!document.fullscreenElement) await document.documentElement.requestFullscreen?.();
      else await document.exitFullscreen?.();
    }
  }));

  document.addEventListener('keydown', e => {
    if (['ArrowRight','PageDown',' '].includes(e.key)) { e.preventDefault(); go(1); }
    if (['ArrowLeft','PageUp'].includes(e.key)) { e.preventDefault(); go(-1); }
    if (e.key === 'Home') { current = 0; render(); }
    if (e.key === 'End') { current = slides.length - 1; render(); }
    if (e.key.toLowerCase() === 'o') openOverview();
    if (e.key.toLowerCase() === 'n') { noteOpen = !noteOpen; render(false); }
    if (e.key === 'Escape') overview.classList.remove('open');
  });

  document.querySelectorAll('.timer-button').forEach(button => {
    let interval;
    button.addEventListener('click', () => {
      const slide = button.closest('.slide');
      const display = slide.querySelector('.timer-display');
      let remaining = Number(slide.dataset.duration || 0);
      clearInterval(interval);
      button.textContent = '다시 시작';
      const update = () => {
        const m = Math.floor(remaining / 60); const s = remaining % 60;
        display.textContent = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
        if (remaining <= 0) { clearInterval(interval); display.textContent = '종료'; return; }
        remaining -= 1;
      };
      update(); interval = setInterval(update, 1000);
    });
  });

  window.addEventListener('hashchange', () => { const n = Number(location.hash.replace('#','')); if (n) { current = Math.max(0, Math.min(slides.length - 1, n - 1)); render(false); } });
  render(false);
})();

