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
  const txt=(s,v)=>{const e=document.querySelector(s);if(e&&v!==undefined)e.textContent=v;};
  const html=(s,v)=>{const e=document.querySelector(s);if(e&&v!==undefined)e.innerHTML=v;};
  const page=location.pathname.split('/').pop().replace('.html','')||'index';
  const home=await get('/content/pages/home.json');
  if(home){txt('.hero-copy > p',home.hero_intro);txt('.intro .eyebrow',home.workshop_eyebrow);txt('.intro h1',home.workshop_title);txt('.intro-text',home.workshop_text);txt('.contact-strip > p',home.contact_cta);}
  const projectData=await get('/content/projects.json'),projects=projectData?.projects||[];
  if(page==='projects'){const grid=document.querySelector('.page-main .page-grid');if(grid&&projects.length){grid.innerHTML='';projects.forEach(d=>{const a=document.createElement('a');a.href='project-japan.html?project='+encodeURIComponent(d.slug);const im=document.createElement('img');im.src=d.cover;im.alt=d.title;a.append(im);const meta=document.createElement('p');meta.className='project-meta';meta.innerHTML='<span>'+d.title.toUpperCase()+'</span><span>'+d.category+' ↗</span>';a.append(meta);grid.append(a);});}}
  if(page==='project-japan'){const slug=new URLSearchParams(location.search).get('project')||'japan-series',d=projects.find(x=>x.slug===slug)||projects[0];if(d){txt('.page-main .page-title',d.title+'.');txt('.page-main .page-lead',d.description);const imgs=document.querySelectorAll('.detail-grid img');if(imgs[0])imgs[0].src=d.cover;if(imgs[1]&&d.gallery?.[0])imgs[1].src=d.gallery[0];}}
  const translations={
    index:{nav:['Progetti','Studio','Su misura','Contatti'],hero:'Realizziamo cornici e specchi rifiniti a mano, per trasformare ricordi e spazi in qualcosa di speciale.',eyebrow:'01 / IL LABORATORIO',title:'Cornici che danno<br>alle cose <em>un posto.</em>',intro:'Una cornice non è mai soltanto una cornice. È un modo per guardare più da vicino, dare valore a un’immagine, a un oggetto, a un ricordo. Progettata e realizzata a mano a Vicenza.',featured:'02 / PROGETTI SELEZIONATI',all:'Vedi tutti i progetti ↗',manifesto:'03 / SU MISURA',manifestotitle:'Ogni cornice<br>ha la <em>sua storia.</em>',cta:'Hai qualcosa<br>da incorniciare?',talk:'Parliamone'},
    about:{nav:['Progetti','Studio','Su misura','Contatti'],eyebrow:'02 / IL LABORATORIO',title:'Lo studio<br>Limbo.',lead:'Una cornice è un confine, ma anche un invito a guardare più da vicino.',body:'<p>Limbo Cornici è un laboratorio indipendente con sede a Vicenza. Unisce uno sguardo attento alle immagini, la passione per i materiali e la precisione del lavoro rifinito a mano.</p><p>Da una singola opera a uno spazio completo, ogni progetto nasce dall’ascolto. Studiamo proporzioni, colori, finiture e dettagli per creare una cornice che appartenga a ciò che custodisce.</p><p>Sono i piccoli dettagli a fare la differenza. Crediamo nel tempo necessario per curarli al meglio.</p>'},
    custom:{nav:['Progetti','Studio','Su misura','Contatti'],eyebrow:'03 / SU MISURA',title:'Cornici<br>su misura.',lead:'Una consulenza personale, una scelta attenta dei materiali, una cornice costruita intorno alla tua opera — mai il contrario.',body:'<p><strong>Per la tua casa.</strong><br>Cornici e specchi su misura, pensati per inserirsi naturalmente nel tuo spazio e valorizzare ciò che custodiscono.</p><p><strong>Per artisti e aziende.</strong><br>Soluzioni su misura per gallerie, studi, spazi ricettivi, uffici e progetti creativi.</p><p><strong>Fatte con cura.</strong><br>Lavoriamo con diverse essenze di legno, colori, profili e finiture. Ogni scelta viene condivisa, in relazione all’opera e al suo contesto.</p>'},
    contact:{nav:['Progetti','Studio','Su misura','Contatti'],eyebrow:'04 / CONTATTI',title:'Parliamone.',lead:'Hai un’opera, un’idea o uno spazio in mente? Raccontaci cosa stai immaginando. Saremo felici di ascoltarti.',contact:'Iniziamo una conversazione.',body:'<p>Limbo Cornici<br>Vicenza, Italia</p><p>Per cornici su misura, specchi, collaborazioni e richieste professionali.</p>'},
    projects:{nav:['Progetti','Studio','Su misura','Contatti'],eyebrow:'01 / PROGETTI SELEZIONATI',title:'Progetti',lead:'Una raccolta di cornici, oggetti e spazi. Ogni progetto è realizzato su misura, con attenzione all’immagine e alla materia.'},
    'project-japan':{nav:['Progetti','Studio','Su misura','Contatti'],eyebrow:'PROGETTO 001 / CORNICI SU MISURA',title:'Japan<br>Series.',lead:'Uno studio sul legno naturale, sul colore e sulla presenza discreta di una cornice progettata con cura.',body:'<p>Cornici su misura — Vicenza, Italia</p><p><a href="projects.html">← Torna a tutti i progetti</a></p>'}
  };
  const dict=translations[page]||translations.index;
  function apply(lang){
    document.documentElement.lang=lang;
    document.querySelectorAll('.language-toggle').forEach(b=>{b.textContent=lang.toUpperCase();b.setAttribute('aria-label','Change language');});
    const nav=document.querySelectorAll('.site-header nav a');dict.nav.forEach((v,i)=>{if(nav[i])nav[i].textContent=v;});
    if(lang==='it'){
      if(page==='index'){txt('.hero-copy > p',dict.hero);txt('.intro .eyebrow',dict.eyebrow);html('.intro h1',dict.title);txt('.intro-text',dict.intro);txt('.featured .eyebrow',dict.featured);txt('.section-heading .text-link',dict.all);txt('.manifesto .eyebrow',dict.manifesto);html('.manifesto h2',dict.manifestotitle);html('.contact-strip > p',dict.cta);const a=document.querySelector('.contact-strip a');if(a)a.innerHTML=dict.talk+' <span>↗</span>';}
      else {txt('.page-main .eyebrow',dict.eyebrow);html('.page-main .page-title',dict.title);txt('.page-main .page-lead',dict.lead);if(dict.body)html(page==='project-japan'?'.page-copy':'.page-main .page-copy',dict.body);if(dict.contact)txt('.contact-email',dict.contact);}
      if(page==='projects'){const cards=document.querySelectorAll('.page-main .project-meta span');cards.forEach((el,i)=>{if(i%2===1)el.textContent=(i===1?'Cornice su misura ↗':'Studio dei materiali ↗');});}
      document.querySelectorAll('.site-footer > div:first-of-type span').forEach((el,i)=>el.textContent=i?'Cornici e specchi su misura':'Vicenza, Italia');
      document.querySelectorAll('.footer-links a').forEach((el,i)=>el.textContent=dict.nav[i]);
    } else {location.reload();}
  }
  let lang=localStorage.getItem('limbo-language')||'en';
  document.querySelectorAll('.language-toggle').forEach(b=>b.addEventListener('click',()=>{lang=lang==='en'?'it':'en';localStorage.setItem('limbo-language',lang);if(lang==='en')location.reload();else apply(lang);}));
  if(lang==='it')apply('it');
})();