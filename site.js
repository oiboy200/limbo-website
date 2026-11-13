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
  const source=document.querySelector('.big-logo'),target=document.querySelector('.mini-logo'),hero=document.querySelector('.hero');
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(source&&target&&hero&&!reduce){
    const flight=document.createElement('img');flight.className='logo-flight';flight.src=source.currentSrc||source.src;flight.alt='';document.body.appendChild(flight);source.style.visibility='hidden';target.style.visibility='hidden';
    let start=null,end=null,travel=0;
    const measure=()=>{const a=source.getBoundingClientRect(),b=target.getBoundingClientRect();start={left:a.left,top:a.top,width:a.width};end={left:b.left,top:b.top,width:b.width};travel=Math.max(360,window.innerHeight*.78);render();};
    const render=()=>{if(!start||!end)return;const p=Math.max(0,Math.min(1,window.scrollY/travel)),e=p*p*(3-2*p),lerp=(a,b)=>a+(b-a)*e;flight.style.left=lerp(start.left,end.left)+'px';flight.style.top=lerp(start.top,end.top)+'px';flight.style.width=lerp(start.width,end.width)+'px';};
    if(source.complete)measure();else source.addEventListener('load',measure,{once:true});window.addEventListener('scroll',render,{passive:true});window.addEventListener('resize',()=>{measure();render()});
  }
  document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{const el=document.querySelector(a.getAttribute('href'));if(el){e.preventDefault();el.scrollIntoView({behavior:reduce?'auto':'smooth'});}}));
});

(async function(){
  const get=async(path)=>{try{const r=await fetch(path);return r.ok?await r.json():null;}catch(e){return null;}};
  const setText=(selector,value)=>{const el=document.querySelector(selector);if(el&&value!==undefined&&value!==null)el.textContent=value;};
  const setHTML=(selector,value)=>{const el=document.querySelector(selector);if(el&&value!==undefined&&value!==null)el.innerHTML=value;};
  const page=location.pathname.split('/').pop().replace('.html','')||'index';
  const lang=localStorage.getItem('limbo-language')||'en';
  document.documentElement.lang=lang;
  document.querySelectorAll('.language-option').forEach(b=>{b.classList.toggle('active',b.dataset.lang===lang);b.setAttribute('aria-pressed',String(b.dataset.lang===lang));b.addEventListener('click',()=>{if(b.dataset.lang!==lang){localStorage.setItem('limbo-language',b.dataset.lang);location.reload();}});});
  const field=(obj,key)=>obj?.[lang==='it'?key+'_it':key]||obj?.[key]||'';
  const home=await get('/content/pages/home.json');
  const pages={};
  for(const name of ['about','custom','contact'])pages[name]=await get('/content/pages/'+name+'.json');
  const projectData=await get('/content/projects.json'),projects=projectData?.projects||[];
  const navLabels=lang==='it'?['Progetti','Studio','Su misura','Contatti']:['Projects','About','Custom','Contact'];
  document.querySelectorAll('.site-header nav a,.footer-links a').forEach((a,i)=>{if(navLabels[i])a.textContent=navLabels[i];});
  document.querySelectorAll('.site-footer > div:first-of-type span').forEach((el,i)=>el.textContent=lang==='it'?(i?'Cornici e specchi su misura':'Vicenza, Italia'):(i?'Custom frames & mirrors':'Vicenza, Italy'));
  if(home&&page==='index'){
    setText('.hero-copy > p',field(home,'hero_intro'));
    setText('.intro .eyebrow',field(home,'workshop_eyebrow'));
    setText('.intro h1',field(home,'workshop_title'));
    setText('.intro-text',field(home,'workshop_text'));
    setText('.manifesto .eyebrow',lang==='it'?'03 / SU MISURA':'03 / MADE TO MEASURE');
    setText('.manifesto h2',field(home,'manifesto_title'));
    setText('.contact-strip > p',field(home,'contact_cta'));
    const cta=document.querySelector('.contact-strip a');if(cta)cta.innerHTML=(lang==='it'?'Parliamone':'Let’s talk')+' <span>↗</span>';
    setText('.featured .eyebrow',lang==='it'?'02 / PROGETTI SELEZIONATI':'02 / SELECTED WORK');
    setText('.section-heading .text-link',lang==='it'?'Vedi tutti i progetti ↗':'View all projects ↗');
  }
  if(['about','custom','contact'].includes(page)){
    const d=pages[page];
    if(d){
      setText('.page-main .eyebrow',field(d,'eyebrow'));
      setText('.page-main .page-title',field(d,'title'));
      setText('.page-main .page-lead',field(d,'lead'));
      setHTML('.page-main .page-copy',field(d,'body'));
      const im=document.querySelector('.page-main .page-grid img');if(im&&d.image)im.src=d.image;
      const email=document.querySelector('.contact-email');
      if(email&&d.email)email.innerHTML='<a href="mailto:'+d.email+'">'+d.email+'</a>';
      if(page==='contact'&&!d.email)setText('.contact-email',lang==='it'?'Iniziamo una conversazione.':'Let’s start a conversation.');
    }
  }
  if(page==='projects'){
    setText('.page-main .eyebrow',lang==='it'?'01 / PROGETTI SELEZIONATI':'01 / SELECTED WORK');
    setText('.page-main .page-lead',lang==='it'?'Una raccolta di cornici, oggetti e spazi. Ogni progetto è realizzato su misura, con attenzione all’immagine e alla materia.':'A collection of frames, objects and spaces. Each one made to measure, with care for the image and the material.');
    const grid=document.querySelector('.page-main .page-grid');
    if(grid&&projects.length){grid.innerHTML='';projects.forEach((d,i)=>{
      const title=field(d,'title'),category=field(d,'category');
      const a=document.createElement('a');a.className='project-card';a.href='project-japan.html?project='+encodeURIComponent(d.slug);
      const im=document.createElement('img');im.src=d.cover;im.alt=title;a.append(im);
      const meta=document.createElement('p');meta.className='project-meta';
      const left=document.createElement('span'),right=document.createElement('span');
      left.textContent=title.toUpperCase();right.textContent=category+' ↗';meta.append(left,right);a.append(meta);grid.append(a);
    });}
  }
  if(page==='custom'){
    const gallery=document.querySelector('#custom-gallery');
    const collections=[
      ['GREEN','/limbo_web_assets/green/',5],['GREEN / ORANGE','/limbo_web_assets/green-orange/',4],
      ['JACK','/limbo_web_assets/jack/',5],['RED','/limbo_web_assets/red/',6],
      ['NIC FRAMES','/limbo_web_assets/nic-frames/',8],['BLUE / ORANGE','/limbo_web_assets/blue-orange/',5],
      ['BICYCLE','/limbo_web_assets/bicycle/',3],['PINK HOUSE','/limbo_web_assets/pink-house/',5],
      ['COLOUR STUDIES','/limbo_web_assets/colour-studies/',8],['JAPAN PRINTS','/limbo_web_assets/japan-prints/',9],
      ['TURQUOISE ARCHIVE','/limbo_web_assets/turquoise-archive/',5]
    ];
    if(gallery){let n=0;collections.forEach(([label,base,count],group)=>{for(let i=1;i<=count;i++){const figure=document.createElement('figure');figure.className='custom-item item-'+(n%7);const im=document.createElement('img');im.src=base+String(i).padStart(2,'0')+'.webp';im.alt=label+' — custom framing detail';im.loading='lazy';const classify=()=>{figure.classList.toggle('is-landscape',im.naturalWidth>im.naturalHeight);figure.classList.toggle('is-portrait',im.naturalHeight>=im.naturalWidth);};if(im.complete&&im.naturalWidth)classify();else im.addEventListener('load',classify,{once:true});figure.append(im);if(i===1){const cap=document.createElement('figcaption');cap.textContent=label;figure.append(cap);}gallery.append(figure);n++;}});}
    setText('.custom-main .page-main .page-title',lang==='it'?'Su misura.':'Custom frames.');
    setText('.custom-main .page-lead',lang==='it'?'Una cornice non è mai soltanto un bordo. Cambia il modo in cui guardiamo ciò che conta.':'A frame is never just a border. It changes the way we see what matters.');
    const ci=document.querySelector('.custom-intro');if(ci&&lang==='it')ci.innerHTML='<span>01 — MATERIA / COLORE / DETTAGLIO</span><p>Opere, spazi e modi diversi di incorniciare. Una selezione di lavori su misura, sperimentazioni e dettagli dall’archivio LIMBO.</p>';
    const ce=document.querySelector('.custom-end');if(ce&&lang==='it')ce.innerHTML='<span>SU MISURA A VICENZA, ITALIA</span><a href="contact.html">Inizia un progetto ↗</a>';
  }
  if(page==='project-japan'){
    const slug=new URLSearchParams(location.search).get('project')||'japan-series',d=projects.find(x=>x.slug===slug)||projects[0];
    if(d){document.title=field(d,'title')+' — LIMBO';setText('.page-main .page-title',field(d,'title')+'.');setText('.page-main .page-lead',field(d,'description'));const grid=document.querySelector('.project-gallery');if(grid){grid.innerHTML='';(d.gallery?.length?d.gallery:[d.cover]).forEach((src,i)=>{const im=document.createElement('img');im.src=src;im.alt=field(d,'title')+' — '+(i+1);im.loading=i>1?'lazy':'eager';grid.append(im);});}}
    setText('.page-main .eyebrow',lang==='it'?'PROGETTO 001 / CORNICI SU MISURA':'PROJECT 001 / CUSTOM FRAMING');
    const back=document.querySelector('.page-copy a');if(back)back.textContent=lang==='it'?'← Torna a tutti i progetti':'← Back to all projects';
  }
  if(lang==='it'){
    document.querySelectorAll('.site-footer small').forEach(el=>el.textContent='© LIMBO 2026');
    const round=document.querySelector('.round-link');if(round)round.innerHTML='Scopri le<br>cornici su misura <span>↗</span>';
  }
})();