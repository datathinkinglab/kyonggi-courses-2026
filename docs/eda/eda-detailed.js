(() => {
  const slides=[...document.querySelectorAll('.slide')];
  const counter=document.querySelector('.slide-counter');
  const progress=document.querySelector('.progress');
  const overview=document.querySelector('.overview');
  const readingButton=document.querySelector('#reading-toggle');
  let current=Math.max(0,Math.min(slides.length-1,(Number(location.hash.slice(1))||1)-1));
  let previousFocus=null;
  const reading=()=>document.body.classList.contains('reading-mode');
  function render(hash=true){
    slides.forEach((s,i)=>{s.classList.toggle('active',i===current);if(!reading())s.setAttribute('aria-hidden',String(i!==current));else s.removeAttribute('aria-hidden');});
    slides[current].scrollTop=0;
    counter.textContent=`${current+1} / ${slides.length}`;
    progress.style.width=`${(current+1)/slides.length*100}%`;
    document.title=`${document.body.dataset.week}차수 ${current+1}. ${slides[current].dataset.title} · 자료탐색방법론`;
    if(hash)history.replaceState(null,'',`#${current+1}`);
  }
  function go(delta){current=Math.max(0,Math.min(slides.length-1,current+delta));render();}
  function setReading(open){
    document.body.classList.toggle('reading-mode',open);
    readingButton.textContent=open?'슬라이드로 보기':'전체 읽기';
    readingButton.setAttribute('aria-pressed',String(open));
    render(false);
    if(open)slides[current].scrollIntoView({block:'start'});else window.scrollTo(0,0);
  }
  function closeOverview(){overview.classList.remove('open');overview.setAttribute('aria-hidden','true');previousFocus?.focus();}
  function openOverview(){previousFocus=document.activeElement;overview.classList.add('open');overview.setAttribute('aria-hidden','false');overview.querySelector('.overview-close').focus();}
  slides.forEach((slide,i)=>{
    const b=document.createElement('button');b.className='thumb';b.type='button';
    const n=document.createElement('b');n.textContent=String(i+1).padStart(2,'0');
    const t=document.createElement('strong');t.textContent=slide.dataset.title;b.append(n,t);
    b.addEventListener('click',()=>{current=i;closeOverview();render();});overview.append(b);
  });
  overview.setAttribute('aria-hidden','true');
  overview.querySelector('.overview-close').addEventListener('click',closeOverview);
  document.querySelectorAll('[data-action]').forEach(b=>b.addEventListener('click',async()=>{
    const a=b.dataset.action;if(a==='prev')go(-1);if(a==='next')go(1);if(a==='overview')openOverview();
    if(a==='fullscreen'){try{if(!document.fullscreenElement)await document.documentElement.requestFullscreen();else await document.exitFullscreen();}catch{b.title='브라우저에서 전체 화면을 지원하지 않습니다.';}}
  }));
  readingButton.addEventListener('click',()=>setReading(!reading()));
  document.querySelector('#print-deck').addEventListener('click',()=>window.print());
  document.querySelectorAll('.copy-button').forEach(b=>b.addEventListener('click',async()=>{
    const pre=b.parentElement.nextElementSibling;
    const text=pre.querySelector('code').textContent;
    const status=pre.nextElementSibling;
    const label=b.textContent;
    try{
      if(navigator.clipboard&&window.isSecureContext)await navigator.clipboard.writeText(text);
      else{
        const area=document.createElement('textarea');area.value=text;area.style.cssText='position:fixed;top:0;left:-9999px';document.body.append(area);area.select();
        const ok=document.execCommand('copy');area.remove();if(!ok)throw Error('copy');b.focus();
      }
      b.textContent='복사 완료';status.textContent='내용 전체를 복사했습니다. Colab 또는 AI 대화에 붙여넣으세요.';
      window.setTimeout(()=>b.textContent=label,1800);
    }catch{
      const range=document.createRange();range.selectNodeContents(pre);const selection=window.getSelection();selection.removeAllRanges();selection.addRange(range);
      status.textContent='내용을 선택했습니다. Ctrl+C 또는 복사 메뉴로 복사하세요.';
    }
  }));
  document.addEventListener('keydown',e=>{
    if(e.ctrlKey||e.metaKey||e.altKey)return;
    if(overview.classList.contains('open')){
      if(e.key==='Escape'){e.preventDefault();closeOverview();}
      if(e.key==='Tab'){const focusable=[...overview.querySelectorAll('button')];const first=focusable[0],last=focusable.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}
      return;
    }
    if(reading()){if(e.key==='Escape')setReading(false);return;}
    if(e.target.closest('input,textarea,select,pre,[contenteditable="true"]')||window.getSelection()?.toString())return;
    if(e.target.closest('button,a')&&[' ','Enter'].includes(e.key))return;
    if(['ArrowRight','PageDown',' '].includes(e.key)){e.preventDefault();go(1);}
    if(['ArrowLeft','PageUp'].includes(e.key)){e.preventDefault();go(-1);}
    if(e.key==='Home'){e.preventDefault();current=0;render();}
    if(e.key==='End'){e.preventDefault();current=slides.length-1;render();}
    if(e.key.toLowerCase()==='o')openOverview();
  });
  window.addEventListener('hashchange',()=>{current=Math.max(0,Math.min(slides.length-1,(Number(location.hash.slice(1))||1)-1));render(false);});
  render(false);
  const query=new URLSearchParams(location.search);
  if(query.get('read')==='1')setReading(true);
  if(query.get('print')==='1')window.addEventListener('load',()=>window.setTimeout(()=>window.print(),250),{once:true});
})();
