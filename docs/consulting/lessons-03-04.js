(() => {
  const data=[{t:1,c:80,y:1},{t:3,c:60,y:1},{t:5,c:40,y:0},{t:11,c:20,y:0},{t:12,c:100,y:1},{t:18,c:60,y:0},{t:24,c:40,y:0},{t:36,c:20,y:0}];
  document.querySelectorAll('[data-demo]').forEach(root=>{
    const low=root.querySelector('[data-min]'),high=root.querySelector('[data-max]');
    function update(){
      const a=Number(low.value),b=Number(high.value),valid=low.value!==''&&high.value!==''&&a>=0&&b<=60&&a<=b&&Number.isInteger(a)&&Number.isInteger(b);
      const rows=valid?data.filter(x=>x.t>=a&&x.t<=b):[],n=rows.length,k=rows.reduce((s,x)=>s+x.y,0),mean=n?rows.reduce((s,x)=>s+x.c,0)/n:null;
      root.querySelector('.demo-context').textContent=valid?`가입기간 ${a}–${b}개월 · 선택 ${n}명 / 전체 8명`:'0–60 범위의 정수로 최솟값과 최댓값을 확인하세요.';
      root.querySelector('[data-n]').textContent=n+'명';
      root.querySelector('[data-rate]').textContent=n?(100*k/n).toFixed(1)+'%':'계산 불가';
      root.querySelector('[data-ratio]').textContent=n?`${k}명 / ${n}명`:'';
      root.querySelector('[data-mean]').textContent=mean===null?'계산 불가':mean.toFixed(1)+' CU';
      const ranges=[[0,11,'0–11개월'],[12,23,'12–23개월'],[24,60,'24개월 이상']];
      root.querySelector('[data-groups]').innerHTML=n?'<div class="table-wrap"><table class="data-table"><thead><tr><th>가입기간</th><th>고객 수</th><th>이탈 수</th><th>이탈 비율</th></tr></thead><tbody>'+ranges.map(([l,h,label])=>{const group=rows.filter(x=>x.t>=l&&x.t<=h),y=group.reduce((s,x)=>s+x.y,0);return `<tr><td>${label}</td><td>${group.length}</td><td>${y}</td><td>${group.length?(100*y/group.length).toFixed(1)+'%':'계산 불가'}</td></tr>`;}).join('')+'</tbody></table></div>':'<p>분석 가능한 고객이 없습니다. 가입기간 조건을 넓혀보세요.</p>';
    }
    low.addEventListener('input',update);high.addEventListener('input',update);
    root.querySelector('[data-reset]').addEventListener('click',()=>{low.value=0;high.value=60;update();});update();
  });
  document.querySelectorAll('.copy-prompt').forEach(button=>button.addEventListener('click',async()=>{
    const head=button.closest('.prompt-head'),pre=head.nextElementSibling,status=pre.nextElementSibling;
    try {await navigator.clipboard.writeText(pre.innerText);status.textContent='요청문을 복사했습니다.';}
    catch {const selection=window.getSelection(),range=document.createRange();range.selectNodeContents(pre);selection.removeAllRanges();selection.addRange(range);status.textContent='요청문을 선택했습니다. 복사 단축키를 누르세요.';}
  }));
  let detailsState=[];
  window.addEventListener('beforeprint',()=>{detailsState=[...document.querySelectorAll('details.answer')].map(x=>[x,x.open]);detailsState.forEach(([x])=>x.open=true);});
  window.addEventListener('afterprint',()=>{detailsState.forEach(([x,state])=>x.open=state);});
})();
