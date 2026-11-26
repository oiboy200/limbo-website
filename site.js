
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
    travel=Math.max(300,window.innerHeight*.58);
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
  const lang=new URLSearchParams(location.search).get('lang')||localStorage.getItem('limbo-language')||'it';
  document.documentElement.lang=lang;
  document.querySelectorAll('.language-option').forEach(b=>{b.classList.toggle('active',b.dataset.lang===lang);b.setAttribute('aria-pressed',String(b.dataset.lang===lang));b.addEventListener('click',()=>{if(b.dataset.lang!==lang){localStorage.setItem('limbo-language',b.dataset.lang);location.reload();}});});
  const field=(obj,key)=>obj?.[key]??'';
  const settings=await get('/content/shared-media.json');
  if(settings?.logo)document.querySelectorAll('.mini-logo img,.footer-logo img,.big-logo').forEach(img=>img.src=settings.logo);
  const home=await get('/content/'+lang+'/pages/home.json');
  const pages={};
  for(const name of ['about','custom','contact'])pages[name]=await get('/content/'+lang+'/pages/'+name+'.json');
  const projectData=await get('/content/'+lang+'/projects.json'),projects=projectData?.projects||[];
  const navLabels=lang==='it'?['Progetti','Studio','Su misura','Contatti']:['Projects','About','Custom','Contact'];
  document.querySelectorAll('.site-header nav a,.footer-links a').forEach((a,i)=>{if(navLabels[i])a.textContent=navLabels[i];});
  document.querySelectorAll('.site-footer > div:first-of-type span').forEach((el,i)=>el.textContent=lang==='it'?(i?'Cornici e specchi su misura':'Vicenza, Italia'):(i?'Custom frames & mirrors':'Vicenza, Italy'));
  if(home&&page==='index'){
    const image=(selector,path,alt)=>{const el=document.querySelector(selector);if(el&&path){el.src=path; if(alt)el.alt=alt;}};
    image('.home-image-section img',home.workshop_image||settings?.home_workshop,'LIMBO — workshop, hand-finished frames');
    image('.custom-feature-image img',home.custom_image||settings?.home_custom,'LIMBO — custom framing');
    image('.home-about .about-split img',home.about_image||settings?.home_about,'LIMBO — the workshop');
    const sections={workshop:document.querySelector('.workshop-image'),custom:document.querySelector('.home-custom'),featured:document.querySelector('.home-featured'),about:document.querySelector('.home-about'),contact:document.querySelector('.home-contact')};
    Object.entries(home.section_visibility||{}).forEach(([key,visible])=>{if(sections[key]){sections[key].hidden=visible===false;sections[key].style.display=visible===false?'none':'';}});
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
    setText('.home-about h2',field(home,'about_title')||'About LIMBO');
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
    const galleryData=await get('/content/'+lang+'/custom-gallery.json');
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

/* LIMBO CMS content bindings — keeps the public layout intact and exposes editable targets */
(async function initLimboCmsBindings(){
  const get=async p=>{try{const r=await fetch(p);return r.ok?await r.json():null}catch(e){return null}};
  const lang=new URLSearchParams(location.search).get('lang')||localStorage.getItem('limbo-language')||'it';
  const page=location.pathname.split('/').pop().replace('.html','')||'index';
  const home=await get('/content/'+lang+'/pages/home.json');
  const attr=(el,path,kind='text',label='')=>{if(!el)return;el.dataset.cmsPath=path;el.dataset.cmsKind=kind;if(label)el.dataset.cmsLabel=label};
  const text=(selector,value,path,label)=>{const el=document.querySelector(selector);if(el&&value!==undefined){el.textContent=value;attr(el,path,'text',label)}};
  const html=(selector,value,path,label)=>{const el=document.querySelector(selector);if(el&&value!==undefined){el.innerHTML=value;attr(el,path,'html',label)}};
  const image=(selector,value,path,label)=>{const el=document.querySelector(selector);if(el&&value){el.src=value;attr(el,path,'image',label)}};
  if(page==='index'&&home){
    text('.hero-copy > p',home.hero_intro,'hero_intro','Testo principale');
    image('.home-image-section .home-image-link img',home.workshop_image,'workshop_image','Immagine Workshop');
    text('.home-custom h2',home.custom_title||'Custom Frames','custom_title','Titolo Custom Frames');
    image('.custom-feature-image img',home.custom_image,'custom_image','Immagine Custom');
    text('.home-custom .home-section-label a',home.custom_link||'Explore custom ↗','custom_link','Link Custom');
    text('.home-featured .home-section-label span',home.featured_label||'03 / FEATURED PROJECTS','featured_label','Etichetta Progetti');
    text('.home-about .home-section-label span',home.about_eyebrow||'04 / ABOUT','about_eyebrow','Etichetta About');
    text('.home-about > h2',home.about_title||'About LIMBO','about_title','Titolo About LIMBO');
    html('.about-copy',home.about_text||'', 'about_text','Testo About');
    const aboutCopy=document.querySelector('.about-copy');
    if(aboutCopy){const link=document.createElement('a');link.href='about.html';link.textContent=home.about_link||'Discover the studio ↗';attr(link,'about_link','text','Link About');aboutCopy.append(link);}
    image('.about-split > img',home.about_image,'about_image','Immagine About');
    text('.home-contact h2',home.contact_title||'Get in touch.','contact_title','Titolo Contatti');
    text('.home-contact > div > span',home.contact_label||'Say Hello','contact_label','Etichetta Contatti');
    text('.home-contact > div > a',home.contact_link||'Contact LIMBO ↗','contact_link','Link Contatti');
    const visibility=home.section_visibility||{};
    const sections={workshop:document.querySelector('.workshop-image'),custom:document.querySelector('.home-custom'),featured:document.querySelector('.home-featured'),about:document.querySelector('.home-about'),contact:document.querySelector('.home-contact')};
    Object.entries(visibility).forEach(([k,v])=>{if(sections[k])sections[k].hidden=v===false;});
  }
  if(['about','custom','contact'].includes(page)){
    const d=await get('/content/'+lang+'/pages/'+page+'.json');
    if(d){
      text('.page-main .eyebrow',d.eyebrow,'eyebrow','Soprattitolo');
      text('.page-main .page-title',d.title,'title','Titolo pagina');
      text('.page-main .page-lead',d.lead,'lead','Introduzione');
      html('.page-main .page-copy',d.body,'body','Testo pagina');
      image('.page-main .page-grid img',d.image,'image','Immagine pagina');
      const email=document.querySelector('.contact-email');
      if(email&&d.email){email.innerHTML='<a href="mailto:'+d.email+'">'+d.email+'</a>';attr(email,'email','html','Email');}
    }
  }
  if(page==='projects'||page==='index'){
    const d=await get('/content/'+lang+'/projects.json');
    const projects=d?.projects||[];
    const cards=page==='projects'?document.querySelectorAll('.page-main .page-grid .project-card'):document.querySelectorAll('.home-projects .home-project');
    cards.forEach((card,i)=>{
      const project=projects.find(x=>x.slug===new URL(card.href).searchParams.get('project'))||projects[i];
      if(!project)return;
      const prefix='projects.'+projects.indexOf(project)+'.';
      const img=card.querySelector('img');if(img)attr(img,prefix+'cover','image','Copertina progetto');
      const title=card.querySelector('b,.project-meta span:first-child');if(title)attr(title,prefix+'title','text','Titolo progetto');
      const year=card.querySelector('div span');if(year)attr(year,prefix+'year','text','Anno progetto');
      const category=card.querySelector('.project-meta span:last-child');if(category)attr(category,prefix+'category','text','Categoria progetto');
    });
  }
  if(page==='custom'){
    const d=await get('/content/'+lang+'/custom-gallery.json');
    document.querySelectorAll('.custom-project').forEach((section,i)=>{
      const item=d?.collections?.[i];if(!item)return;
      const title=section.querySelector('.custom-project-heading h2');attr(title,'collections.'+i+'.title','text','Nome collezione');
      const hero=section.querySelector('.custom-project-hero-image');attr(hero,'collections.'+i+'.hero','image','Immagine principale collezione');
      section.querySelectorAll('.custom-project-detail img').forEach((img,j)=>attr(img,'collections.'+i+'.images.'+j,'image','Immagine collezione '+(j+1)));
    });
  }
  if(page==='project-japan'){
    const data=await get('/content/'+lang+'/projects.json'),projects=data?.projects||[];
    const slug=new URLSearchParams(location.search).get('project'),i=projects.findIndex(x=>x.slug===slug),p=projects[i];
    if(p){
      text('.case-title',p.title,'projects.'+i+'.title','Titolo progetto');
      text('.case-deck > p',p.description,'projects.'+i+'.description','Descrizione progetto');
      document.querySelectorAll('.case-image img').forEach((img,j)=>attr(img,'projects.'+i+'.gallery.'+j,'image','Immagine galleria '+(j+1)));
    }
  }
})();