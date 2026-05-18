(function(){
  'use strict';

  /* Cursor */
  
  const cursor = document.getElementById('cursor');
  const dot    = document.getElementById('cursor-dot');
  let mx=-100,my=-100,cx=-100,cy=-100,dx=-100,dy=-100;
  document.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY});
  document.addEventListener('mouseleave',()=>{if(cursor)cursor.style.opacity='0';if(dot)dot.style.opacity='0'});
  document.addEventListener('mouseenter',()=>{if(cursor)cursor.style.opacity='1';if(dot)dot.style.opacity='1'});
  (function loop(){
    dx+=(mx-dx)*.85; dy+=(my-dy)*.85;
    cx+=(mx-cx)*.1;  cy+=(my-cy)*.1;
    if(dot){dot.style.left=dx+'px';dot.style.top=dy+'px'}
    if(cursor){cursor.style.left=cx+'px';cursor.style.top=cy+'px'}
    requestAnimationFrame(loop);
  })();

  /* Progress */
  const bar = document.getElementById('progress-bar');
  const nav = document.querySelector('nav');
  window.addEventListener('scroll',()=>{
    const s=document.documentElement.scrollTop||document.body.scrollTop;
    const h=document.documentElement.scrollHeight-document.documentElement.clientHeight;
    if(bar) bar.style.width=(h>0?(s/h*100):0)+'%';
    if(nav) nav.classList.toggle('scrolled',window.scrollY>60);
  },{passive:true});

  /* Reveal */
  const observer=new IntersectionObserver(entries=>{
    entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');observer.unobserve(e.target)}});
  },{threshold:.12,rootMargin:'0px 0px -40px 0px'});
  document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));

  /* Active nav */
  const sections=document.querySelectorAll('section[id]');
  const navAs=document.querySelectorAll('.nav-links a');
  const secObs=new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(e.isIntersecting) navAs.forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='#'+e.target.id));
    });
  },{threshold:.4});
  sections.forEach(s=>secObs.observe(s));

  /* Mobile nav */
  const toggle=document.querySelector('.nav-toggle');
  const links=document.querySelector('.nav-links');
  if(toggle&&links){
    toggle.addEventListener('click',()=>{
      const o=links.classList.toggle('open');
      toggle.classList.toggle('open',o);
      toggle.setAttribute('aria-expanded',o);
    });
    links.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{
      links.classList.remove('open');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded',false);
    }));
  }

  /* Nav theme toggle */
  const themeToggle=document.querySelector('.theme-toggle');
  const root=document.body;
  const savedTheme=localStorage.getItem('theme')||'dark';
  function applyNavTheme(theme){
    root.setAttribute('data-theme',theme);
    if(themeToggle){
      themeToggle.innerHTML=theme==='dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
      themeToggle.setAttribute('aria-label', theme==='dark' ? 'Switch to light mode' : 'Switch to dark mode');
    }
  }
  applyNavTheme(savedTheme);
  if(themeToggle){
    themeToggle.addEventListener('click',()=>{
      const next= root.getAttribute('data-theme')==='dark' ? 'light' : 'dark';
      applyNavTheme(next);
      localStorage.setItem('theme',next);
    });
  }

  /* Stat counters */
  function countUp(el,target,suffix){
    const dur=1800,start=performance.now();
    (function step(now){
      const p=Math.min((now-start)/dur,1);
      const e=1-Math.pow(1-p,4);
      el.textContent=Math.floor(e*target)+suffix;
      if(p<1) requestAnimationFrame(step);
    })(start);
  }
  const statObs=new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        const el=e.target;
        const raw=el.textContent.trim();
        const num=parseFloat(raw.replace(/[^0-9.]/g,''));
        const sfx=raw.replace(/[0-9.]/g,'');
        if(!isNaN(num)) countUp(el,num,sfx);
        statObs.unobserve(el);
      }
    });
  },{threshold:.5});
  document.querySelectorAll('.stat-number').forEach(el=>statObs.observe(el));

  /* 3D card mouse tilt */
  document.querySelectorAll('.project-card,.stat-card').forEach(card=>{
    card.addEventListener('mousemove',e=>{
      const r=card.getBoundingClientRect();
      const x=(e.clientX-r.left)/r.width-.5;
      const y=(e.clientY-r.top)/r.height-.5;
      card.style.transform=`perspective(700px) translateY(-8px) rotateX(${-y*7}deg) rotateY(${x*7}deg)`;
    });
    card.addEventListener('mouseleave',()=>{card.style.transform=''});
  });

  /* Hero card tilt */
  const hCard=document.querySelector('.hero-3d-card');
  if(hCard){
    document.addEventListener('mousemove',e=>{
      const cx=window.innerWidth/2, cy=window.innerHeight/2;
      const dx=(e.clientX-cx)/cx*6, dy=(e.clientY-cy)/cy*4;
      hCard.style.transform=`perspective(800px) rotateY(${-12+dx}deg) rotateX(${4-dy}deg)`;
    });
  }

  /* Ripple on skill tags */
  document.querySelectorAll('.skill-tag').forEach(tag=>{
    tag.addEventListener('click',e=>{
      const r=document.createElement('span');
      const rect=tag.getBoundingClientRect();
      const size=Math.max(rect.width,rect.height);
      r.style.cssText=`position:absolute;width:${size}px;height:${size}px;left:${e.clientX-rect.left-size/2}px;top:${e.clientY-rect.top-size/2}px;background:rgba(249,161,169,.25);border-radius:50%;transform:scale(0);animation:ripple .5s ease-out forwards;pointer-events:none`;
      tag.style.position='relative';tag.style.overflow='hidden';
      tag.appendChild(r);
      setTimeout(()=>r.remove(),500);
    });
  });

  /* Footer message form */
  const form=document.querySelector('.footer-col form');
  if(form){
    form.addEventListener('submit',e=>{
      e.preventDefault();
      const btn=form.querySelector('button');
      const messageField=form.querySelector('textarea');
      const message = messageField ? messageField.value.trim() : '';
      if(!message){
        if(btn){btn.textContent='Please write a message';}
        setTimeout(()=>{if(btn){btn.textContent='Send Message';}},2000);
        return;
      }
      const subject = 'New message from website';
      const body = encodeURIComponent(message);
      const mailto = `mailto:akpuroseline8@gmail.com?subject=${encodeURIComponent(subject)}&body=${body}`;
      if(btn){btn.textContent='Opening email client...';btn.style.background='rgba(74,222,128,.35)'}
      window.location.href = mailto;
      setTimeout(()=>{if(btn){btn.textContent='Send Message';btn.style.background=''}},3000);
    });
  }

  /* Service card details */
  document.querySelectorAll('.service-toggle').forEach(button=>{
    button.addEventListener('click',()=>{
      const card=button.closest('.service-card');
      if(!card) return;
      const expanded=!card.classList.contains('expanded');
      card.classList.toggle('expanded',expanded);
      button.setAttribute('aria-expanded',expanded);
      button.textContent=expanded ? 'Hide details' : 'View details';
    });
  });

  /* Inject keyframes */
  const s=document.createElement('style');
  s.textContent=`@keyframes ripple{to{transform:scale(2.5);opacity:0}}`;
  document.head.appendChild(s);

})();