
/* Smooth, inertial desktop wheel scrolling */
(function initInertialScroll(){
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const start=()=>{
    if(typeof window.Lenis!=='function'||window.__limboLenis)return;
    const lenis=new window.Lenis({
      lerp:0.085,
      wheelMultiplier:0.9,
      smoothWheel:true,
      syncTouch:false,
      touchMultiplier:1
    });
    window.__limboLenis=lenis;
    const raf=(time)=>{lenis.raf(time);requestAnimationFrame(raf);};
    requestAnimationFrame(raf);
  };
  if(typeof window.Lenis==='function'){start();return;}
  const script=document.createElement('script');
  script.src='https://unpkg.com/@studio-freight/lenis@1.0.42/dist/lenis.min.js';
  script.onload=start;
  document.head.appendChild(script);
})();

document.addEventListener('DOMContentLoaded',()=>{
  const source=document.querySelector('.big-logo');
  const target=document.querySelector('.mini-logo');
  const hero=document.querySelector('.hero');
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(!source||!target||!hero||reduce)return;
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
  window.addEventListener('resize',measure);
});

function initWorkshopImageMotion(){
  const firstWorkshop=document.querySelector('.home-image-section .home-image-link');
  if(!firstWorkshop)return;
  const section=firstWorkshop.closest('.home-image-section');
  let ticking=false;
  const update=()=>{
    const rect=section.getBoundingClientRect();
    const vh=window.innerHeight;
    const progress=Math.max(0,Math.min(1,(vh*.82-rect.top)/(vh*.62)));
    const scale=1.42-(.42*progress);
    firstWorkshop.style.setProperty('--workshop-frame-scale',scale.toFixed(3));
    ticking=false;
  };
  const onScroll=()=>{if(!ticking){ticking=true;requestAnimationFrame(update);}};
  window.addEventListener('scroll',onScroll,{passive:true});
  window.addEventListener('resize',onScroll);
  update();
}
document.addEventListener('DOMContentLoaded',initWorkshopImageMotion);

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
    const image=(selector,path,alt)=>{const el=document.querySelector(selector);if(el&&path){el.src=path; if(alt)el.alt=alt;}};
    image('.home-image-section img',home.workshop_image,'LIMBO — workshop, hand-finished frames');
    image('.custom-feature-image img',home.custom_image,'LIMBO — custom framing');
    image('.home-about .about-split img',home.about_image,'LIMBO — the workshop');
    const sections={workshop:document.querySelector('.workshop-image'),custom:document.querySelector('.home-custom'),featured:document.querySelector('.home-featured'),about:document.querySelector('.home-about'),contact:document.querySelector('.home-contact')};
    Object.entries(home.section_visibility||{}).forEach(([key,visible])=>{if(sections[key])sections[key].hidden=visible===false;});
    const order=Array.isArray(home.section_order)?home.section_order:['workshop','custom','featured','about','contact'];
    const main=document.querySelector('.limbo-home');
    if(main)order.forEach(key=>{if(sections[key])main.appendChild(sections[key]);});
    const featuredGrid=document.querySelector('.home-projects');
    const featuredProjects=projects.filter(project=>project.featured);
    if(featuredGrid&&featuredProjects.length){
      featuredGrid.innerHTML='';
      featuredProjects.forEach((project,index)=>{
        const a=document.createElement('a');a.className='home-project '+(index%2===0?'home-project-a':'home-project-b');
        a.href='project-japan.html?project='+encodeURIComponent(project.slug);
        const im=document.createElement('img');im.src=project.cover;im.alt=field(project,'title');im.loading='lazy';a.append(im);
        const meta=document.createElement('div'),name=document.createElement('b'),year=document.createElement('span');
        name.textContent=field(project,'title');year.textContent=project.year||'';meta.append(name,year);a.append(meta);featuredGrid.append(a);
      });
    }
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
    const galleryData=await get('/content/custom-gallery.json');
    const collections=galleryData?.collections||[];
    if(gallery){
      gallery.classList.add('custom-projects');
      for(const [index,item] of collections.entries()){
        const label=lang==='it'?(item.title_it||item.title):(item.title||item.title_it);
        const section=document.createElement('section');section.className='custom-project';
        const heading=document.createElement('div');heading.className='custom-project-heading';
        const title=document.createElement('h2');title.textContent=label;
        const number=document.createElement('span');number.textContent=String(index+1).padStart(2,'0');
        heading.append(title,number);section.append(heading);
        const heroFigure=document.createElement('figure');heroFigure.className='custom-project-hero';
        const heroImage=document.createElement('img');heroImage.className='custom-project-hero-image';heroImage.src=item.hero||item.images?.[0]||'';heroImage.alt=label+' — custom framing';heroFigure.append(heroImage);section.append(heroFigure);
        const details=document.createElement('div');details.className='custom-project-details';
        (item.images||[]).filter(src=>src&&src!==item.hero).forEach(src=>{
          const figure=document.createElement('figure');figure.className='custom-project-detail';
          const im=document.createElement('img');im.src=src;im.alt=label+' — custom framing detail';im.loading='lazy';figure.append(im);details.append(figure);
        });
        if(details.children.length)section.append(details);
        gallery.append(section);
      }
    }
    setText('.custom-main .page-main .page-title',lang==='it'?'Su misura.':'Custom frames.');
    setText('.custom-main .page-lead',lang==='it'?'Una cornice non è mai soltanto un bordo. Cambia il modo in cui guardiamo ciò che conta.':'A frame is never just a border. It changes the way we see what matters.');
    const ci=document.querySelector('.custom-intro');if(ci&&lang==='it')ci.innerHTML='<span>01 — MATERIA / COLORE / DETTAGLIO</span><p>Opere, spazi e modi diversi di incorniciare. Una selezione di lavori su misura, sperimentazioni e dettagli dall’archivio LIMBO.</p>';
    const ce=document.querySelector('.custom-end');if(ce&&lang==='it')ce.innerHTML='<span>SU MISURA A VICENZA, ITALIA</span><a href="contact.html">Inizia un progetto ↗</a>';
  }
  if(page==='project-japan'){
    const slug=new URLSearchParams(location.search).get('project')||'japan-series',d=projects.find(x=>x.slug===slug)||projects[0];
    if(d){
      const title=field(d,'title'),description=field(d,'description'),gallery=d.gallery?.length?d.gallery:[d.cover];
      document.title=title+' — LIMBO';
      const main=document.querySelector('.page-main');
      if(main){
        main.classList.add('case-study');
        main.innerHTML='';
        const top=document.createElement('div');top.className='case-topline';
        const eyebrow=document.createElement('p');eyebrow.className='eyebrow';eyebrow.textContent=lang==='it'?'PROGETTO / '+String(d.year||'2026'):'CASE STUDY / '+String(d.year||'2026');
        const index=document.createElement('span');index.textContent='LIMBO — VICENZA';top.append(eyebrow,index);main.append(top);
        const titleEl=document.createElement('h1');titleEl.className='case-title';titleEl.textContent=title;main.append(titleEl);
        const deck=document.createElement('div');deck.className='case-deck';
        const lead=document.createElement('p');lead.textContent=description;
        const facts=document.createElement('div');facts.className='case-facts';
        [[lang==='it'?'AMBITO':'SCOPE',field(d,'category')],[lang==='it'?'ANNO':'YEAR',String(d.year||'2026')],[lang==='it'?'LUOGO':'LOCATION','Vicenza, Italy']].forEach(([k,v])=>{const item=document.createElement('div');const small=document.createElement('span');small.textContent=k;const strong=document.createElement('b');strong.textContent=v;item.append(small,strong);facts.append(item);});
        deck.append(lead,facts);main.append(deck);
        const galleryWrap=document.createElement('div');galleryWrap.className='case-gallery';
        gallery.forEach((src,i)=>{
          const figure=document.createElement('figure');figure.className='case-image case-image-'+(i+1);
          const im=document.createElement('img');im.src=src;im.alt=title+' — '+(i+1);im.loading=i>1?'lazy':'eager';figure.append(im);
          const cap=document.createElement('figcaption');cap.innerHTML='<span>'+String(i+1).padStart(2,'0')+'</span><span>'+title.toUpperCase()+'</span>';figure.append(cap);galleryWrap.append(figure);
        });
        main.append(galleryWrap);
        const end=document.createElement('div');end.className='case-end';
        const back=document.createElement('a');back.href='projects.html';back.textContent=lang==='it'?'← Tutti i progetti':'← All projects';
        const contact=document.createElement('a');contact.href='contact.html';contact.textContent=lang==='it'?'Hai un progetto? ↗':'Have a project? ↗';end.append(back,contact);main.append(end);
      }
    }
    setText('.page-main .eyebrow',lang==='it'?'PROGETTO 001 / CORNICI SU MISURA':'PROJECT 001 / CUSTOM FRAMING');
    const back=document.querySelector('.page-copy a');if(back)back.textContent=lang==='it'?'← Torna a tutti i progetti':'← Back to all projects';
  }
if(lang==='it'){
    document.querySelectorAll('.site-footer small').forEach(el=>el.textContent='© LIMBO 2026');
    const round=document.querySelector('.round-link');if(round)round.innerHTML='Scopri le<br>cornici su misura <span>↗</span>';
  }
})();