(() => {
  const slides = [...document.querySelectorAll('.slide')];
  const overview = document.querySelector('.overview');
  const note = document.querySelector('.speaker-note');
  const overviewButton = document.querySelector('[data-action="overview"]');
  const notesButton = document.querySelector('[data-action="notes"]');
  let current = 0, noteOpen = false;
  const fromHash = () => { const n = Number(location.hash.slice(1)); return Number.isFinite(n) ? Math.max(0, Math.min(slides.length - 1, Math.floor(n) - 1)) : 0; };
  const render = (hash = true) => {
    slides.forEach((s,i) => {s.classList.toggle('active',i===current);s.inert=i!==current;s.setAttribute('aria-hidden',String(i!==current));});
    slides[current].scrollTop=0;
    document.querySelector('.progress').style.width=((current+1)/slides.length*100)+'%';
    document.querySelector('.slide-counter').textContent=(current+1)+' / '+slides.length;
    note.textContent=slides[current].dataset.notes;
    note.classList.toggle('open',noteOpen);
    notesButton.setAttribute('aria-expanded',String(noteOpen));
    document.querySelector('[data-action="prev"]').disabled=current===0;
    document.querySelector('[data-action="next"]').disabled=current===slides.length-1;
    document.title=(current+1)+'. '+slides[current].dataset.title+' · 통계컨설팅의 이해';
    if(hash) history.replaceState(null,'','#'+(current+1));
  };
  const go = n => {current=Math.max(0,Math.min(slides.length-1,n));render();};
  const setOverview = open => {
    overview.hidden=!open;overview.classList.toggle('open',open);overviewButton.setAttribute('aria-expanded',String(open));
    document.querySelector('.deck-stage').inert=open;document.querySelector('.deck-controls').inert=open;
    if(open) overview.querySelectorAll('.thumb')[current].focus(); else overviewButton.focus();
  };
  const close=document.createElement('button');close.className='button overview-close';close.textContent='목록 닫기 · Esc';close.addEventListener('click',()=>setOverview(false));overview.append(close);
  slides.forEach((s,i)=>{const b=document.createElement('button');b.className='thumb';const num=document.createElement('b');num.textContent=String(i+1).padStart(2,'0');const title=document.createElement('strong');title.textContent=s.dataset.title;b.append(num,title);b.addEventListener('click',()=>{go(i);setOverview(false);});overview.append(b);});
  document.querySelectorAll('[data-action]').forEach(b=>b.addEventListener('click',async()=>{
    const a=b.dataset.action;
    if(a==='prev')go(current-1);if(a==='next')go(current+1);
    if(a==='overview')setOverview(overview.hidden);
    if(a==='notes'){noteOpen=!noteOpen;render(false);}
    if(a==='fullscreen'){try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{note.textContent='브라우저에서 전체 화면을 지원하지 않습니다. 브라우저의 전체 화면 메뉴를 이용하세요.';note.classList.add('open');}}
  }));
  document.addEventListener('keydown',e=>{
    if(!overview.hidden){
      if(e.key==='Escape'){e.preventDefault();setOverview(false);}
      if(e.key==='Tab'){const bs=[...overview.querySelectorAll('button')];if(e.shiftKey&&document.activeElement===bs[0]){e.preventDefault();bs.at(-1).focus();}else if(!e.shiftKey&&document.activeElement===bs.at(-1)){e.preventDefault();bs[0].focus();}}
      return;
    }
    if(e.target.closest('input,textarea,select,[contenteditable="true"]'))return;
    if(e.key===' '&&e.target.closest('button,a'))return;
    if(['ArrowRight','PageDown',' '].includes(e.key)){e.preventDefault();go(current+1);}
    if(['ArrowLeft','PageUp'].includes(e.key)){e.preventDefault();go(current-1);}
    if(e.key==='Home'){e.preventDefault();go(0);}if(e.key==='End'){e.preventDefault();go(slides.length-1);}
    if(e.key.toLowerCase()==='o')setOverview(true);
    if(e.key.toLowerCase()==='n'){noteOpen=!noteOpen;render(false);}
    if(e.key==='Escape'){noteOpen=false;render(false);}
  });
  window.addEventListener('hashchange',()=>{current=fromHash();render(false);});
  current=fromHash();render(false);
})();

