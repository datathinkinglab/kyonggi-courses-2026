(() => {
  const slides = [...document.querySelectorAll('.slide')];
  const find = (id) => document.getElementById(id);
  const toc = find('toc');
  const resources = find('resources');
  const notes = find('notes');
  const reading = find('reading');
  const fullscreen = find('fullscreen');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let readAll = false;
  let index = 0;

  const tocButtons = slides.map((slide, position) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = `${position + 1}. ${slide.querySelector('h1, h2').textContent}`;
    button.addEventListener('click', () => {
      toc.close();
      show(position);
      if (readAll) slide.scrollIntoView();
    });
    find('toc-list').append(button);
    return button;
  });

  function show(position, updateHash = true, animate = true) {
    index = Math.max(0, Math.min(position, slides.length - 1));
    slides.forEach((slide, i) => {
      slide.hidden = !readAll && i !== index;
      slide.classList.remove('enter');
      if (i === index) tocButtons[i].setAttribute('aria-current', 'page');
      else tocButtons[i].removeAttribute('aria-current');
    });
    const current = slides[index];
    if (animate && !readAll && !reduced.matches) current.classList.add('enter');
    find('counter').textContent = readAll ? `전체 ${slides.length}장` : `${index + 1} / ${slides.length}`;
    find('progress').style.width = `${(readAll ? 1 : (index + 1) / slides.length) * 100}%`;
    find('prev').disabled = index === 0;
    find('next').disabled = index === slides.length - 1;
    find('note-text').textContent = current.dataset.note;
    document.title = `${document.body.dataset.title} · ${index + 1} / ${slides.length}`;
    if (updateHash && location.hash !== `#${index + 1}`) {
      history.replaceState(null, '', `#${index + 1}`);
    }
    if (!readAll) window.scrollTo(0, 0);
  }

  function fromHash() {
    const number = /^#(\d+)$/.exec(location.hash);
    return number ? Number(number[1]) - 1 : 0;
  }

  function toggleReading() {
    if (readAll) {
      const firstVisible = slides.findIndex((slide) => slide.getBoundingClientRect().bottom > 150);
      if (firstVisible !== -1) index = firstVisible;
    }
    readAll = !readAll;
    document.body.classList.toggle('read-mode', readAll);
    reading.setAttribute('aria-pressed', String(readAll));
    reading.textContent = readAll ? '슬라이드 보기' : '전체 읽기';
    find('nav-controls').hidden = readAll;
    find('notes-button').disabled = readAll;
    if (readAll && !notes.hidden) toggleNotes();
    show(index, true, false);
    if (readAll && index > 0) slides[index].scrollIntoView();
  }

  function toggleNotes() {
    notes.hidden = !notes.hidden;
    find('notes-button').setAttribute('aria-pressed', String(!notes.hidden));
  }

  find('prev').addEventListener('click', () => show(index - 1));
  find('next').addEventListener('click', () => show(index + 1));
  find('toc-button').addEventListener('click', () => toc.showModal());
  find('resources-button').addEventListener('click', () => resources.showModal());
  find('notes-button').addEventListener('click', toggleNotes);
  reading.addEventListener('click', toggleReading);
  find('print').addEventListener('click', () => window.print());
  fullscreen.hidden = !document.fullscreenEnabled;
  fullscreen.addEventListener('click', async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch {
      fullscreen.textContent = '전체 화면 사용 불가';
    }
  });
  document.addEventListener('fullscreenchange', () => {
    fullscreen.textContent = document.fullscreenElement ? '전체 화면 해제' : '전체 화면';
  });

  addEventListener('hashchange', () => show(fromHash(), false));
  addEventListener('keydown', (event) => {
    if (toc.open || resources.open || event.altKey || event.ctrlKey || event.metaKey
      || event.target.closest('input,textarea,select,button,a,[contenteditable]')) return;
    const key = event.key.toLowerCase();
    if (key === 'm' || key === 'o') toc.showModal();
    else if (key === 'n' && !readAll) toggleNotes();
    else if (key === 'escape' && !notes.hidden) toggleNotes();
    else if (!readAll && ['arrowright', 'pagedown', ' '].includes(key)) show(index + 1);
    else if (!readAll && ['arrowleft', 'pageup'].includes(key)) show(index - 1);
    else if (!readAll && key === 'home') show(0);
    else if (!readAll && key === 'end') show(slides.length - 1);
    else return;
    event.preventDefault();
  });

  document.querySelectorAll('[data-hover]').forEach((element) => {
    element.addEventListener('pointermove', (event) => {
      if (event.pointerType !== 'mouse' || reduced.matches) return;
      const rect = element.getBoundingClientRect();
      element.style.setProperty('--rx', `${(0.5 - (event.clientY - rect.top) / rect.height) * 6}deg`);
      element.style.setProperty('--ry', `${((event.clientX - rect.left) / rect.width - 0.5) * 8}deg`);
    });
    element.addEventListener('pointerleave', () => {
      element.style.removeProperty('--rx');
      element.style.removeProperty('--ry');
    });
  });

  const mix = find('mix');
  if (mix) {
    const renderMix = () => {
      const b = Number(mix.value);
      find('mix-output').textContent = `A ${100 - b}% · B ${b}% → 전체 원가율 ${(60 + 0.2 * b).toFixed(1)}%`;
    };
    mix.addEventListener('input', renderMix);
    renderMix();
  }
  index = fromHash();
  const params = new URLSearchParams(location.search);
  if (params.get('read') === '1') {
    show(index, false, false);
    toggleReading();
  } else {
    show(index, false);
  }
  if (params.get('print') === '1') {
    const printWhenReady = () => document.fonts.ready.then(() => window.print());
    if (document.readyState === 'complete') printWhenReady();
    else addEventListener('load', printWhenReady, {once: true});
  }
})();
