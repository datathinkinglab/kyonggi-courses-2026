/* Adapter for standalone decks using .viewport, .slide and goToSlide(index).
   Native eda-detailed.js decks already provide reading mode; do not load both. */
(() => {
  const button = document.getElementById('reading-toggle');
  const slides = [...document.querySelectorAll('.viewport > .slide')];
  if (!button || !slides.length) return;
  const fullscreenButton = document.getElementById('fullscreen-toggle');
  if (fullscreenButton) {
    fullscreenButton.addEventListener('click', async () => {
      try {
        if (document.fullscreenElement) await document.exitFullscreen();
        else await document.documentElement.requestFullscreen();
      } catch (error) {
        fullscreenButton.textContent = '전체화면 전환 실패 · 다시 시도';
        console.warn('Fullscreen request failed', error);
      }
    });
    document.addEventListener('fullscreenchange', () => {
      const open = Boolean(document.fullscreenElement);
      fullscreenButton.textContent = open ? '전체화면 해제' : '화면 전체보기';
      fullscreenButton.setAttribute('aria-pressed', String(open));
    });
  }
  let savedIndex = 0;
  const reading = () => document.body.classList.contains('lecture-reading');
  function setReading(open) {
    if (open) savedIndex = Math.max(0, slides.findIndex(s => s.classList.contains('active')));
    else {
      const line = document.querySelector('.top-bar')?.getBoundingClientRect().bottom || 0;
      savedIndex = slides.reduce((best, s, i) => Math.abs(s.getBoundingClientRect().top - line) < Math.abs(slides[best].getBoundingClientRect().top - line) ? i : best, 0);
    }
    document.body.classList.toggle('lecture-reading', open);
    button.textContent = open ? '슬라이드로 보기' : '전체 읽기';
    button.setAttribute('aria-pressed', String(open));
    const url = new URL(location.href);
    if (open) url.searchParams.set('read', '1'); else url.searchParams.delete('read');
    history.replaceState(null, '', url);
    if (open) slides[savedIndex].scrollIntoView({block: 'start'});
    else { window.goToSlide(savedIndex); window.scrollTo(0, 0); }
  }
  button.addEventListener('click', () => setReading(!reading()));
  // Reading uses native document scrolling; keep M and Escape for the original modals.
  document.addEventListener('keydown', e => {
    if (!reading() || document.querySelector('.modal-overlay.open')) return;
    if (['ArrowRight','ArrowLeft','ArrowDown','ArrowUp','PageDown','PageUp','Home','End',' '].includes(e.key)) e.stopImmediatePropagation();
  }, true);
  const observer = new MutationObserver(records => {
    if (reading() && records.some(r => r.target.classList.contains('active'))) slides.find(s => s.classList.contains('active'))?.scrollIntoView({block:'start'});
  });
  slides.forEach(s => observer.observe(s, {attributes:true, attributeFilter:['class']}));
  if (new URLSearchParams(location.search).get('read') === '1') setReading(true);
})();
