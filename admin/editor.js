(() => {
'use strict';
const REPO='oiboy200/limbo-website';
const BRANCH='feature/limbo-visual-cms';
const API='https://api.github.com';
const WORKER='https://limbo-cms-auth.giovanniongaro86.workers.dev';
const pages=[
 {id:'home',label:'Homepage',num:'01',files:['content/it/pages/home.json','content/en/pages/home.json'],preview:'index.html'},
 {id:'projects',label:'Projects',num:'02',files:['content/it/projects.json','content/en/projects.json'],preview:'projects.html'},
 {id:'about',label:'About LIMBO',num:'03',files:['content/it/pages/about.json','content/en/pages/about.json'],preview:'about.html'},
 {id:'custom',label:'Custom',num:'04',files:['content/it/pages/custom.json','content/en/pages/custom.json'],preview:'custom.html'},
 {id:'gallery',label:'Custom archive',num:'05',files:['content/it/custom-gallery.json','content/en/custom-gallery.json'],preview:'custom.html'},
 {id:'contact',label:'Contact',num:'06',files:['content/it/pages/contact.json','content/en/pages/contact.json'],preview:'contact.html'}
];
let token='',active='home',lang='it',records={},dirty=new Set(),selected=null;
const $=s=>document.querySelector(s);
let fields=$('#fields');
const notice=$('#notice'), frame=$('#preview-frame');
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const current=()=>pages.find(p=>p.id===active);
const path=()=>current().files[lang==='it'?0:1];
const record=()=>records[path()];
const clone=o=>JSON.parse(JSON.stringify(o));
const headers=()=>({Authorization:'Bearer '+token,Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28','Content-Type':'application/json'});
function tell(s,t=''){notice.textContent=s;notice.className='notice '+t}
function status(s){$('#save-status').textContent=s;$('#save').disabled=!token||!dirty.size}
function getAt(o,p){return p.split('.').reduce((v,k)=>v==null?undefined:v[k],o)}
function setAt(o,p,v){const a=p.split('.'),k=a.pop();const parent=a.reduce((x,y)=>x[y],o);parent[k]=v}
function markDirty(){dirty.add(path());status('Modifiche da pubblicare');}
function nav(){
 $('#pages').innerHTML=pages.map(p=>'<button class="page-link '+(p.id===active?'active':'')+'" data-page="'+p.id+'"><span>'+p.label+'</span><small>'+p.num+'</small></button>').join('');
 document.querySelectorAll('[data-page]').forEach(b=>b.onclick=()=>loadPage(b.dataset.page));
}
function group(t){fields.insertAdjacentHTML('beforeend','<div class="group-title">'+esc(t)+'</div>')}
function field(label,p,v,o={}){
 const id='f'+Math.random().toString(36).slice(2), long=o.long||String(v??'').length>110;
 let html='';
 if(o.type==='boolean') html='<label class="check-row"><input type="checkbox" data-path="'+p+'" '+(v?'checked':'')+'> '+esc(label)+'</label>';
 else if(o.type==='image') html='<div class="field"><label>'+esc(label)+' <small>IMMAGINE</small></label><input data-path="'+p+'" value="'+esc(v||'')+'" placeholder="/uploads/immagine.webp"><div class="hint">Percorso immagine. Puoi anche caricare un nuovo file.</div><input type="file" accept="image/*" data-upload="'+p+'" style="margin-top:8px;font-size:10px"></div>';
 else html='<div class="field"><label for="'+id+'">'+esc(label)+'</label>'+(long?'<textarea id="'+id+'" data-path="'+p+'">'+esc(v||'')+'</textarea>':'<input id="'+id+'" data-path="'+p+'" value="'+esc(v||'')+'">')+'</div>';
 fields.insertAdjacentHTML('beforeend,html);
}
function renderHome(d){
 group('HERO');field('Testo principale','hero_intro',d.hero_intro,{long:true});
 group('VISIBILITÀ DELLE SEZIONI');
 const labels={workshop:'Workshop',custom:'Custom Frames',featured:'Featured Projects',about:'About LIMBO',contact:'Contact'};
 Object.entries(labels).forEach(([k,l])=>field('Mostra '+l,'section_visibility.'+k,d.section_visibility?.[k]!==false,{type:'boolean'}));
 group('ORDINE DELLE SEZIONI');
 const order=d.section_order||Object.keys(labels);
 order.forEach((k,i)=>fields.insertAdjacentHTML('beforeend','<div class="order-row"><span>'+esc(labels[k]||k)+'</span><span><button type="button" data-move="'+i+'" data-dir="-1">↑</button><button type="button" data-move="'+i+'" data-dir="1">↓</button></span></div>'));
 group('CUSTOM FRAMES');
 field('Titolo sezione','custom_title',d.custom_title);
 field('Link sezione','custom_link',d.custom_link);
 field('Immagine Custom','custom_image',d.custom_image,{type:'image'});
 group('PROGETTI IN EVIDENZA');field('Etichetta sezione','featured_label',d.featured_label);
 group('ABOUT LIMBO');
 field('Etichetta sezione','about_eyebrow',d.about_eyebrow);
 field('Titolo sezione','about_title',d.about_title);
 field('Testo About','about_text',d.about_text,{long:true});
 field('Link About','about_link',d.about_link);
 field('Immagine About','about_image',d.about_image,{type:'image'});
 group('CONTATTI');
 field('Titolo contatti','contact_title',d.contact_title);
 field('Etichetta contatti','contact_label',d.contact_label);
 field('Link contatti','contact_link',d.contact_link);
 group('WORKSHOP');
 field('Etichetta Workshop','workshop_eyebrow',d.workshop_eyebrow);
 field('Titolo Workshop','workshop_title',d.workshop_title);
 field('Testo Workshop','workshop_text',d.workshop_text,{long:true});
 field('Immagine Workshop','workshop_image',d.workshop_image,{type:'image'});
}
function renderArray(key,arr,kind){
 group(kind==='projects'?'PROGETTI':'COLLEZIONI ARCHIVIO');
 arr.forEach((item,i)=>{
  const box=document.createElement('div');box.className='object-card';
  box.innerHTML='<div class="object-head"><span>'+kind.toUpperCase()+' '+String(i+1).padStart(2,'0')+'</span><button type="button" class="small-actions" data-remove="'+key+'.'+i+'">Elimina</button></div>';
  fields.append(box);const previous=fields;fields=box;
  if(kind==='projects'){
   field('Titolo',key+'.'+i+'.title',item.title);field('Categoria',key+'.'+i+'.category',item.category);
   field('Anno',key+'.'+i+'.year',item.year);field('Slug URL',key+'.'+i+'.slug',item.slug);
   field('Copertina',key+'.'+i+'.cover',item.cover,{type:'image'});
   field('Descrizione',key+'.'+i+'.description',item.description,{long:true});
   field('In homepage',key+'.'+i+'.featured',item.featured,{type:'boolean'});
   field('Galleria (un percorso per riga)',key+'.'+i+'.gallery',(item.gallery||[]).join('\n'),{long:true});
  } else {
   field('Nome collezione',key+'.'+i+'.title',item.title);
   field('Immagine principale',key+'.'+i+'.hero',item.hero,{type:'image'});
   field('Immagini (un percorso per riga)',key+'.'+i+'.images',(item.images||[]).join('\n'),{long:true});
  }
  fields=previous;
 });
 fields.insertAdjacentHTML('beforeend','<button type="button" class="add-button" data-add="'+key+'">+ Aggiungi '+(kind==='projects'?'progetto':'collezione')+'</button>');
}
function renderPage(d){
 group('CONTENUTI DELLA PAGINA');
 [['Soprattitolo','eyebrow'],['Titolo pagina','title'],['Introduzione','lead'],['Testo pagina (HTML)','body'],['Email','email'],['Instagram','instagram']].forEach(([l,k])=>{if(d[k]!==undefined)field(l,k,d[k],{long:['title','lead','body'].includes(k)})});
 if(d.image!==undefined)field('Immagine','image',d.image,{type:'image'});
}
function renderSelected(){
 const box=$('#selected-editor');if(!box)return;
 if(!selected){box.innerHTML='<div class="selected-empty">Seleziona un testo o un’immagine nell’anteprima per modificarlo qui.</div>';return}
 const val=getAt(record().data,selected.path);
 const isImage=selected.kind==='image';
 box.innerHTML='<div class="selected-top"><div><small>ELEMENTO SELEZIONATO</small><strong>'+esc(selected.label||selected.path)+'</strong></div><button type="button" id="clear-selection">×</button></div>'+
 (isImage?'<label class="selected-label">Percorso immagine<input id="selected-value" value="'+esc(val||'')+'"></label><label class="selected-upload">Sostituisci immagine<input id="selected-file" type="file" accept="image/*"></label>':
 '<label class="selected-label">'+(selected.kind==='html'?'Contenuto HTML':'Testo')+(selected.kind==='html'?'<textarea id="selected-value">'+esc(val||'')+'</textarea>':'<textarea id="selected-value">'+esc(val||'')+'</textarea>')+'</label>')+
 '<div class="selected-help">Le modifiche si vedono subito nell’anteprima. Premi “Pubblica modifiche” per salvarle.</div>';
 $('#clear-selection').onclick=()=>{selected=null;renderSelected();};
 $('#selected-value').oninput=e=>{setAt(record().data,selected.path,e.target.value);markDirty();applyToPreview(selected,e.target.value);};
 const file=$('#selected-file');if(file)file.onchange=()=>upload(file.files?.[0],selected.path,selected);
}
function render(){
 fields.innerHTML='';
 const d=record()?.data;if(!d)return;
 if(active==='home')renderHome(d);
 else if(active==='projects')renderArray('projects',d.projects||[],'projects');
 else if(active==='gallery')renderArray('collections',d.collections||[],'gallery');
 else renderPage(d);
 fields.querySelectorAll('[data-path]').forEach(el=>el.addEventListener(el.type==='checkbox'?'change':'input',()=>{
  let v=el.type==='checkbox'?el.checked:el.value;
  if(el.dataset.path.endsWith('.gallery')||el.dataset.path.endsWith('.images'))v=v.split('\n').map(x=>x.trim()).filter(Boolean);
  setAt(record().data,el.dataset.path,v);markDirty();applyToPreview({path:el.dataset.path,kind:'text'},v);
 }));
 fields.querySelectorAll('[data-move]').forEach(b=>b.onclick=()=>{
  const a=record().data.section_order||['workshop','custom','featured','about','contact'],i=+b.dataset.move,j=i+(+b.dataset.dir);
  if(j<0||j>=a.length)return;[a[i],a[j]]=[a[j],a[i]];record().data.section_order=a;markDirty();render();
 });
 fields.querySelectorAll('[data-remove]').forEach(b=>b.onclick=()=>{
  const [k,i]=b.dataset.remove.split('.');if(!confirm('Eliminare questo elemento?'))return;
  record().data[k].splice(+i,1);markDirty();render();refreshPreview();
 });
 fields.querySelectorAll('[data-add]').forEach(b=>b.onclick=()=>{
  if(active==='projects')record().data.projects.push({slug:'nuovo-progetto',title:'Nuovo progetto',category:'',year:'2026',cover:'',gallery:[],description:'',featured:false});
  else record().data.collections.push({title:'Nuova collezione',hero:'',images:[]});
  markDirty();render();refreshPreview();
 });
 fields.querySelectorAll('[data-upload]').forEach(el=>el.onchange=()=>upload(el.files?.[0],el.dataset.upload));
 renderSelected();
}
async function loadRecord(file){
 if(records[file])return records[file];
 const response=await fetch(API+'/repos/'+REPO+'/contents/'+file+'?ref='+encodeURIComponent(BRANCH),{headers:headers()});
 if(!response.ok)throw Error('GitHub '+response.status+' — '+file);
 const json=await response.json();
 const raw=decodeURIComponent(escape(atob((json.content||'').replace(/\n/g,''))));
 return records[file]={sha:json.sha,data:JSON.parse(raw)};
}
async function loadPage(id=active){
 active=id;selected=null;nav();
 $('#page-title').textContent=current().label;
 $('#crumb').textContent=current().num+' / '+current().label.toUpperCase()+' — '+lang.toUpperCase();
 try{await loadRecord(path());render();tell('Contenuti caricati da GitHub.','good');refreshPreview();}
 catch(e){tell('Errore caricamento: '+e.message,'error');}
}
function previewPage(){return current().preview}
function refreshPreview(){
 try{frame.src=location.origin+'/'+previewPage()+'?cms-preview=1&lang='+lang+'&v='+Date.now();}
 catch(e){frame.src='/'+previewPage()+'?cms-preview=1&lang='+lang}
}
function applyToPreview(sel,value){
 try{
  const doc=frame.contentDocument;if(!doc)return;
  const el=doc.querySelector('[data-cms-path="'+CSS.escape(sel.path)+'"]');if(!el)return;
  if(sel.kind==='image'||el.tagName==='IMG'){el.src=value;el.setAttribute('src',value);}
  else if(sel.kind==='html'){el.innerHTML=value;}
  else el.textContent=value;
 }catch(e){}
}
function attachPreview(){
 try{
  const doc=frame.contentDocument;if(!doc||!doc.body)return;
  if(doc.getElementById('limbo-cms-overlay-style'))return;
  const style=doc.createElement('style');style.id='limbo-cms-overlay-style';
  style.textContent='[data-cms-path]{cursor:pointer!important;outline:1px dashed transparent!important;outline-offset:3px!important;transition:outline-color .15s!important}[data-cms-path]:hover{outline-color:#111!important}[data-cms-path].cms-selected{outline:2px solid #111!important;outline-offset:3px!important}body.cms-editing a{cursor:crosshair!important}';
  doc.head.append(style);doc.body.classList.add('cms-editing');
  doc.addEventListener('click',e=>{
   const el=e.target.closest('[data-cms-path]');if(!el)return;
   e.preventDefault();e.stopPropagation();
   doc.querySelectorAll('.cms-selected').forEach(x=>x.classList.remove('cms-selected'));el.classList.add('cms-selected');
   const kind=el.dataset.cmsKind||(el.tagName==='IMG'?'image':'text');
   const path=el.dataset.cmsPath;
   const label=el.dataset.cmsLabel||el.textContent?.trim().slice(0,48)||path;
   const file=el.dataset.cmsFile;
   if(file&&file!==path()){tell('Questo elemento appartiene a un altro contenuto. Apri la pagina corrispondente nel menu.');return}
   selected={path,kind,label,element:el};
   renderSelected();
   $('#selected-editor')?.scrollIntoView({behavior:'smooth',block:'nearest'});
  },true);
 }catch(e){tell('Anteprima non accessibile: verifica il dominio di preview Cloudflare.','error')}
}
function upload(file,p,sel=null){
 if(!file)return;
 (async()=>{
  try{
   tell('Caricamento immagine…');
   const safe=file.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9._-]/g,'-');
   const dest='uploads/'+Date.now()+'-'+safe;
   const bytes=new Uint8Array(await file.arrayBuffer());let binary='';
   for(let i=0;i<bytes.length;i+=0x8000)binary+=String.fromCharCode(...bytes.subarray(i,i+0x8000));
   const response=await fetch(API+'/repos/'+REPO+'/contents/'+dest,{method:'PUT',headers:headers(),body:JSON.stringify({message:'Upload '+file.name,branch:BRANCH,content:btoa(binary)})});
   if(!response.ok)throw Error(await response.text());
   const url='/'+dest;setAt(record().data,p,url);markDirty();
   if(sel)applyToPreview({...sel,kind:'image'},url);else applyToPreview({path:p,kind:'image'},url);
   render();tell('Immagine caricata. Pubblica per salvare i contenuti.','good');
  }catch(e){tell('Errore upload: '+e.message,'error')}
 })();
}
async function save(){
 if(!token||!dirty.size)return;
 $('#save').disabled=true;tell('Salvataggio contenuti su GitHub…');
 try{
  for(const file of [...dirty]){
   const rec=records[file];if(!rec?.sha)throw Error('SHA mancante per '+file);
   const content=JSON.stringify(rec.data,null,2)+'\n';
   const response=await fetch(API+'/repos/'+REPO+'/contents/'+file,{method:'PUT',headers:headers(),body:JSON.stringify({message:'Update LIMBO content — '+file,branch:BRANCH,sha:rec.sha,content:btoa(unescape(encodeURIComponent(content)))})});
   if(!response.ok)throw Error(await response.text());
   const result=await response.json();rec.sha=result.content.sha;dirty.delete(file);
  }
  status('Salvato su branch di anteprima');
  tell('Contenuti salvati su GitHub. Cloudflare avvierà il deploy del branch di anteprima.','good');
  refreshPreview();
 }catch(e){tell('Salvataggio non completato: '+e.message,'error');status('Errore di salvataggio');}
}
function connect(){
 const w=window.open(WORKER+'/login?origin='+encodeURIComponent(location.origin),'limbo-github-auth','width=600,height=720');
 if(!w)tell('Abilita i popup per collegare GitHub.','error');else tell('Completa l’accesso GitHub nella finestra che si è aperta.');
}
window.addEventListener('message',e=>{
 if(e.origin!==new URL(WORKER).origin||e.data?.type!=='LIMBO_GITHUB_TOKEN'||!e.data.token)return;
 token=e.data.token;$('#login').textContent='GitHub collegato';$('#login').disabled=true;
 tell('GitHub collegato. Carico i contenuti…','good');loadPage();
});
frame.addEventListener('load',()=>{attachPreview();});
document.querySelectorAll('[data-lang]').forEach(b=>b.onclick=async()=>{
 if(b.dataset.lang===lang)return;
 if(dirty.size&&!confirm('Hai modifiche non pubblicate. Cambiare lingua e perderle?'))return;
 lang=b.dataset.lang;document.querySelectorAll('[data-lang]').forEach(x=>x.classList.toggle('active',x===b));
 await loadPage(active);
});
$('#login').onclick=connect;$('#save').onclick=save;
nav();tell('Collega GitHub per caricare e modificare i contenuti.');
})();