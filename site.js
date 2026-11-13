document.addEventListener('DOMContentLoaded',()=>{
  const toggle=document.querySelector('.menu-toggle');
  const nav=document.querySelector('.site-header nav');
  if(toggle&&nav){
    toggle.setAttribute('aria-expanded','false');
    toggle.addEventListener('click',()=>{
      const open=nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded',String(open));
      toggle.setAttribute('aria-label',open?'Close menu':'Open menu');
      toggle.textContent=open?'×':'☰';
    });
  }

  // Native, dependency-free logo flight: the same visible mark travels from
  // the hero position into the fixed header as the page is scrolled.
  const source=document.querySelector('.big-logo');
  const target=document.querySelector('.mini-logo');
  const hero=document.querySelector('.hero');
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(source&&target&&hero&&!reduce){
    const flight=document.createElement('img');
    flight.className='logo-flight';
    flight.src=source.currentSrc||source.src;
    flight.alt='';
    document.body.appendChild(flight);
    source.style.visibility='hidden';
    target.style.visibility='hidden';
    let start=null,end=null,travel=0;
    const measure=()=>{
      const a=source.getBoundingClientRect(),b=target.getBoundingClientRect();
      start={left:a.left,top:a.top,width:a.width};
      end={left:b.left,top:b.top,width:b.width};
      travel=Math.max(360,window.innerHeight*.78);
      render();
    };
    const render=()=>{
      if(!start||!end)return;
      const p=Math.max(0,Math.min(1,window.scrollY/travel));
      const eased=p*p*(3-2*p);
      const lerp=(a,b)=>a+(b-a)*eased;
      flight.style.left=lerp(start.left,end.left)+'px';
      flight.style.top=lerp(start.top,end.top)+'px';
      flight.style.width=lerp(start.width,end.width)+'px';
    };
    if(source.complete)measure();else source.addEventListener('load',measure,{once:true});
    window.addEventListener('scroll',render,{passive:true});
    window.addEventListener('resize',()=>{measure();render()});
  }
  document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{
    const el=document.querySelector(a.getAttribute('href'));
    if(el){e.preventDefault();el.scrollIntoView({behavior:reduce?'auto':'smooth'});}
  }));
});


// CMS content binding: JSON files edited through Decap CMS.
(async function loadLimboContent(){
  const get=async(path)=>{try{const r=await fetch(path);return r.ok?await r.json():null;}catch(e){return null;}};
  const txt=(s,v)=>{const e=document.querySelector(s);if(e&&v!==undefined)e.textContent=v;};
  const html=(s,v)=>{const e=document.querySelector(s);if(e&&v!==undefined)e.innerHTML=v;};
  const home=await get('/content/pages/home.json');
  if(home){txt('.hero-copy > p',home.hero_intro);txt('.intro .eyebrow',home.workshop_eyebrow);txt('.intro h1',home.workshop_title);txt('.intro-text',home.workshop_text);txt('.contact-strip > p',home.contact_cta);}
  const page=location.pathname.split('/').pop().replace('.html','');
  if(['about','custom','contact'].includes(page)){const d=await get('/content/pages/'+page+'.json');if(d){txt('.page-main .eyebrow',d.eyebrow);txt('.page-main .page-title',d.title);txt('.page-main .page-lead',d.lead);html('.page-main .page-copy',d.body);const im=document.querySelector('.page-main .page-grid img');if(im&&d.image)im.src=d.image;const email=document.querySelector('.contact-email');if(email&&d.email)email.innerHTML='<a href="mailto:'+d.email+'">'+d.email+'</a>';}}
  const projectData=await get('/content/projects.json');
  const projects=projectData?.projects||[];
  if(page==='projects'){const grid=document.querySelector('.page-main .page-grid');if(grid&&projects.length){grid.innerHTML='';projects.forEach((d)=>{const a=document.createElement('a');a.href='project-japan.html?project='+encodeURIComponent(d.slug);const im=document.createElement('img');im.src=d.cover;im.alt=d.title;a.append(im);const meta=document.createElement('p');meta.className='project-meta';meta.innerHTML='<span>'+d.title.toUpperCase()+'</span><span>'+d.category+' ↗</span>';a.append(meta);grid.append(a);});}}
  if(page==='project-japan'){const slug=new URLSearchParams(location.search).get('project')||'japan-series';const d=projects.find(x=>x.slug===slug)||projects[0];if(d){txt('.page-main .page-title',d.title+'.');txt('.page-main .page-lead',d.description);const imgs=document.querySelectorAll('.detail-grid img');if(imgs[0])imgs[0].src=d.cover;if(imgs[1]&&d.gallery?.[0])imgs[1].src=d.gallery[0];}}
})();
