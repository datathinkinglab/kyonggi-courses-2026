(() => {
  document.querySelector('#print-assignment').addEventListener('click',()=>window.print());
  document.querySelector('#copy-email').addEventListener('click',async()=>{
    const email='lee.seungmook@gmail.com';
    const status=document.querySelector('#email-copy-status');
    try{
      await navigator.clipboard.writeText(email);
      status.textContent='이메일 주소를 복사했습니다.';
    }catch{
      status.textContent='받는 주소: '+email;
    }
  });
  if(new URLSearchParams(location.search).get('print')==='1')window.addEventListener('load',()=>window.setTimeout(()=>window.print(),250),{once:true});
})();
