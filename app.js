import {extraUI,localizeCatalog,locales,allergenWords} from './i18n.js';
import {initV4} from './v4.js';
import {initParticles} from './interactions.js';
import {initHeroInteraction} from './polish.js';
import { openingState, weeklyRows } from './hours.js';
import { initExperience } from './experience.js';

const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];
const icon = name => `<svg class="icon" aria-hidden="true"><use href="#i-${name}"/></svg>`;
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const storage = {get(k){try{return localStorage.getItem(k)}catch{return null}},set(k,v){try{localStorage.setItem(k,v)}catch{}}};
function updateHistory(method,state,url){try{history[method](state,'',url)}catch{/* Standalone previews can restrict History API writes. */}}
let lang = ['it','en','de','fr','es'].includes(storage.get('memento-food-language')) ? storage.get('memento-food-language') : 'it';
let data, config;
try {
  const result = await Promise.all(['catalog.json','config.json'].map(async path => {const r=await fetch(path);if(!r.ok)throw Error(path);return r.json()}));
  [data, config] = result;
} catch(error) {
  $('#catalog').innerHTML='<p class="shell loading">Il menù non è disponibile. Ricarica la pagina oppure contatta info@mementostudio.it.</p>';
  throw error;
}
localizeCatalog(data);
const {items,categories}=data;
const byId = new Map(items.map(item=>[item.id,item]));
const byCategory = Object.fromEntries(categories.map(cat=>[cat.id,items.filter(item=>item.category===cat.id)]));
const player=$('#player'),header=$('#topbar'),dock=$('#dock'),rail=$('#thumb-rail');
const cartDialog=$('#cart-dialog'),editDialog=$('#edit-dialog'),infoDialog=$('#info-dialog');
let group='food',currentCategory='panini',active=null,returnFocus=null,returnScroll=0,revealStamp=0;
let toastTimer,editKey=null;
const ui = {
  it:{menu:'Menù',venue:'Il locale',hero1:'Il gusto',hero2:'lascia il segno.',heroCaption:'Buon cibo. Incontri inattesi. Momenti da ricordare.',explore:'Esplora il menù',ourMenu:'LA NOSTRA CARTA',menuIntro:'Scegli ciò che ti ispira.<br>Scopri cosa c’è dentro.',possibilities:'modi di incontrarsi',space:'IL NOSTRO SPAZIO',venueTitle:'Resta ancora un po’.',venueCaption:'La luce giusta. Il tavolo giusto. Il tempo, finalmente, per te.',socialTitle:'Il gusto si condivide.',socialCaption:'Ispirazioni, dettagli e nuove esperienze dal mondo Memento.',follow:'Segui Memento',studio:'Entra nel nostro mondo',infoTitle:'Il tempo per stare bene.',infoCaption:'Dall’aperitivo all’ultimo calice. Ci piace immaginare serate che non hai fretta di finire.',demoNote:'Memento Food è un locale immaginario. Menù, prezzi e orari sono dimostrativi.',contactStudio:'Contatta Memento Studio',concept:'— concept experience',food:'Cibo',drinks:'Bevande',add:'Aggiungi',added:'Aggiunto alla selezione',allergens:'Allergeni',ingredients:'Ingredienti',profile:'Profilo',see:'Esplora',reveal:'Swipe su · scopri',closeReveal:'Swipe giù · ricomponi',loading:'Un istante…',previous:'Prodotto precedente',next:'Prodotto successivo',close:'Chiudi',back:'Torna al menù',cartTitle:'La tua selezione',empty:'La serata è ancora tutta da comporre.',browse:'Esplora il menù',total:'Totale',summary:'Riepilogo',cartDemo:'Selezione dimostrativa. Nessun ordine viene inviato al locale.',edit:'Personalizza',standard:'Standard',double:'Doppio manzo',without:'Senza',note:'Note',save:'Salva modifiche',cancel:'Annulla',removeIntro:'Togli un ingrediente. Prezzo e indicazione allergeni restano invariati.',allergenNote:'Ricette e allergeni sono esempi dimostrativi, da verificare per un locale reale. Non utilizzare questa demo per decisioni alimentari.',none:'Da verificare',contactTitle:'Parliamone.',contactBody:'Memento Food è un concept di Memento Studio: questo locale non ha una linea telefonica reale. Per creare un’esperienza per il tuo locale, scrivici.',copy:'Copia riepilogo',copied:'Riepilogo copiato',copyFailed:'Seleziona e copia il testo qui sopra.',download:'Scarica riepilogo',orderTitle:'La tua serata',noSend:'Questo riepilogo non è un ordine confermato.',pause:'Pausa slideshow',play:'Riprendi slideshow',photo:'Foto',variant:'Versione',notesPlaceholder:'Una preferenza da ricordare…',editingAll:'Le modifiche si applicano a tutte le unità di questa riga.',imageError:'Immagine non disponibile. Riprova.',demo:'DEMO',quantity:'Quantità',remove:'Rimuovi',noAllergens:'Associazioni da verificare',email:'Scrivi allo studio'},
  en:{menu:'Menu',venue:'The venue',hero1:'Good taste,',hero2:'stays with you.',heroCaption:'Good food. Unexpected encounters. Moments to remember.',explore:'Explore the menu',ourMenu:'OUR MENU',menuIntro:'Choose what inspires you.<br>Discover what is inside.',possibilities:'ways to come together',space:'OUR SPACE',venueTitle:'Stay a little longer.',venueCaption:'The right light. The right table. Time, finally, for you.',socialTitle:'Good taste is shared.',socialCaption:'Inspiration, details and new experiences from the world of Memento.',follow:'Follow Memento',studio:'Discover our world',infoTitle:'Time well spent.',infoCaption:'From the aperitif to the last glass. We like to imagine evenings you are in no hurry to end.',demoNote:'Memento Food is an imaginary venue. The menu, prices and opening hours are illustrative.',contactStudio:'Contact Memento Studio',concept:'— concept experience',food:'Food',drinks:'Drinks',add:'Add',added:'Added to your selection',allergens:'Allergens',ingredients:'Ingredients',profile:'Profile',see:'Explore',reveal:'Swipe up · discover',closeReveal:'Swipe down · reassemble',loading:'One moment…',previous:'Previous item',next:'Next item',close:'Close',back:'Back to menu',cartTitle:'Your selection',empty:'Your evening is yet to be composed.',browse:'Explore the menu',total:'Total',summary:'Summary',cartDemo:'Demonstration only. No order is sent to a venue.',edit:'Customise',standard:'Standard',double:'Double beef',without:'Without',note:'Notes',save:'Save changes',cancel:'Cancel',removeIntro:'Remove an ingredient. The price and allergen information remain unchanged.',allergenNote:'Recipes and allergens are illustrative examples that must be verified for a real venue. Do not use this demo to make dietary decisions.',none:'To be verified',contactTitle:'Let’s talk.',contactBody:'Memento Food is a concept by Memento Studio. This imaginary venue has no real phone line. Contact us to create an experience for your venue.',copy:'Copy summary',copied:'Summary copied',copyFailed:'Select and copy the text above.',download:'Download summary',orderTitle:'Your evening',noSend:'This summary is not a confirmed order.',pause:'Pause slideshow',play:'Resume slideshow',photo:'Photo',variant:'Version',notesPlaceholder:'A preference to remember…',editingAll:'Changes apply to every unit in this row.',imageError:'Image unavailable. Please try again.',demo:'DEMO',quantity:'Quantity',remove:'Remove',noAllergens:'Associations to be verified',email:'Email the studio'}
};
Object.assign(ui.it,{hero1:'Ci si trova',hero2:'da Memento.',heroCaption:'Burger, birre e buona compagnia.',menuIntro:'Scegli. Scopri. Assaggia.',venueTitle:'Il nostro posto.',venueCaption:'Un tavolo, due birre. E la serata comincia.',socialTitle:'Succede qui.',socialCaption:'Dal tavolo al feed.',infoTitle:'Quando vuoi.',infoCaption:'Gli orari della settimana.',cartTitle:'Il tuo ordine',empty:'Il carrello è vuoto.',reveal:'Swipe up',closeReveal:'Swipe down',contactTitle:'Memento Studio',contactBody:'Ti piace questa demo? Parliamone.',orderTitle:'Il tuo ordine'});
Object.assign(ui.en,{hero1:'Meet us',hero2:'at Memento.',heroCaption:'Burgers, beers and good company.',menuIntro:'Choose. Explore. Enjoy.',venueTitle:'Our place.',venueCaption:'A table, two beers. Let the evening begin.',socialTitle:'Happening here.',socialCaption:'From the table to your feed.',infoTitle:'Opening hours.',infoCaption:'Plan your visit.',cartTitle:'Your order',empty:'Your basket is empty.',reveal:'Swipe up',closeReveal:'Swipe down',contactTitle:'Memento Studio',contactBody:'Like this demo? Let’s talk.',orderTitle:'Your order'});
for(const l of ['de','fr','es'])ui[l]={...ui.en,...extraUI[l]};
const polishWords={
 it:{addToCart:'Aggiungi al carrello',bookTable:'Prenota un tavolo',call:'Chiama'},
 en:{addToCart:'Add to basket',bookTable:'Book a table',call:'Call'},
 de:{addToCart:'In den Warenkorb',bookTable:'Tisch reservieren',call:'Anrufen'},
 fr:{addToCart:'Ajouter au panier',bookTable:'Réserver une table',call:'Appeler'},
 es:{addToCart:'Añadir al carrito',bookTable:'Reserva una mesa',call:'Llamar'}
};
for(const l of Object.keys(polishWords))Object.assign(ui[l],polishWords[l]);
const t=key=>ui[lang][key]??key;
// Modal focus restoration must not leave a mouse-click outline on product photos.
document.documentElement.dataset.input='pointer';
document.addEventListener('pointerdown',()=>document.documentElement.dataset.input='pointer',{capture:true,passive:true});
document.addEventListener('keydown',e=>{if(e.key==='Tab')document.documentElement.dataset.input='keyboard';},true);
const name=item=>item.name[lang];
const money=cents=>new Intl.NumberFormat(locales[lang],{style:'currency',currency:'EUR'}).format(cents/100);
const catName=id=>categories.find(c=>c.id===id)?.[lang]??id;
const isDouble=item=>item.category==='panini'&&item.ingredients.en.some(i=>i.startsWith('Beef patty'));
const allergens={it:['Cereali con glutine','Crostacei','Uova','Pesce','Arachidi','Soia','Latte','Frutta a guscio','Sedano','Senape','Sesamo','Solfiti','Lupini','Molluschi'],en:['Cereals with gluten','Crustaceans','Eggs','Fish','Peanuts','Soy','Milk','Tree nuts','Celery','Mustard','Sesame','Sulphites','Lupin','Molluscs']};

// A true n=4 superellipse, with a rounded-square fallback in CSS.
Object.assign(allergens,allergenWords);
const points=Array.from({length:96},(_,n)=>{const a=n/96*Math.PI*2;return `${50+50*Math.sign(Math.cos(a))*Math.sqrt(Math.abs(Math.cos(a)))}% ${50+50*Math.sign(Math.sin(a))*Math.sqrt(Math.abs(Math.sin(a)))}%`});
document.documentElement.style.setProperty('--squircle',`polygon(${points.join(',')})`);

function allergenBadges(item){return `<button class="allergen-badges" data-allergens="${item.id}" aria-label="${esc(t('allergens')+': '+name(item))}">${item.allergens.length?item.allergens.map(n=>`<span>${n}</span>`).join(''):icon('info')}</button>`;}
function renderCard(item){
 const serving=item.serving?`<p class="card-serving">${esc(item.serving)}${item.category==='vini'?' · '+({it:'al calice',en:'by the glass',de:'pro Glas',fr:'au verre',es:'por copa'}[lang]):''}</p>`:'';
 return `<article class="product-card" id="card-${item.id}">
   <button class="card-open" data-open="${item.id}" aria-label="${esc(t('see')+' '+name(item))}"><div class="card-photo"><img src="${item.image}" alt="${esc(name(item))}" loading="lazy" decoding="async" width="1254" height="1254"></div></button>
   <div class="card-details">
     <button class="card-title" data-open="${item.id}"><h3>${esc(name(item))}</h3></button>
     <div class="card-information">${allergenBadges(item)}<ul class="card-ingredients">${item.ingredients[lang].map(i=>`<li>${esc(i)}</li>`).join('')}</ul>${serving}</div>
     <div class="card-purchase"><span class="price">${money(item.priceCents)}</span><button class="add-button" data-add="${item.id}" aria-label="${esc(t('addToCart')+': '+name(item))}">${icon('plus')}<span>${t('addToCart')}</span></button></div>
   </div>
 </article>`;
}
function renderCatalog(){
 $('#catalog').innerHTML=categories.map(c=>`<section class="category-section" data-family="${c.group}" id="${c.id}" aria-labelledby="category-${c.id}"><div class="category-intro"><img class="category-image" src="assets/categories/${c.id}.webp" alt="" loading="lazy" width="1536" height="1024"><img class="category-blur" src="assets/categories/${c.id}.webp" alt="" loading="lazy" width="1536" height="1024"><div class="category-copy shell"><h2 id="category-${c.id}">${esc(c[lang])}</h2><p>${esc(c[lang==='it'?'headlineIt':lang==='en'?'headlineEn':'headline'+lang])}</p><a class="category-enter" href="#grid-${c.id}" aria-label="${esc(t('explore'))}">${icon('down')}</a></div></div><div class="product-grid shell" id="grid-${c.id}">${byCategory[c.id].map(renderCard).join('')}</div></section>`).join('');
}
function renderDock(){
 const buttons=list=>list.map(c=>`<button class="dock-category ${currentCategory===c.id?'active':''}" data-category="${c.id}" aria-label="${esc(c[lang])}" title="${esc(c[lang])}" ${currentCategory===c.id?'aria-current="true"':''}>${icon(c.icon)}</button>`).join('');
 $('#dock-nav').innerHTML=`<div class="dock-group" aria-label="${t('food')}">${buttons(categories.filter(c=>c.group==='food'))}</div><i class="dock-divider" aria-hidden="true"></i><div class="dock-group" aria-label="${t('drinks')}">${buttons(categories.filter(c=>c.group!=='food'))}</div><i class="dock-divider" aria-hidden="true"></i><div class="dock-tools"><a class="dock-venue ${currentCategory==='locale'?'active':''}" href="#locale" aria-label="${t('venue')}" title="${t('venue')}">${icon('venue')}</a><button class="dock-cart" data-cart aria-label="${t('cartTitle')}">${icon('bag')}<span class="cart-count" hidden>0</span></button></div>`;refreshBadge();
}
function goSection(id){
  if(active)closePlayer(false);
  updateHistory('replaceState',{},`#${id}`);
  const target=document.getElementById(id),behavior=reduced.matches?'instant':'smooth';if(target?.matches('.category-section,.venue-section'))window.scrollTo({top:target.getBoundingClientRect().top+scrollY,behavior});else target?.scrollIntoView({behavior,block:'start'});
}
let scrollPending=false;
function onScroll(){if(active||scrollPending)return;scrollPending=true;requestAnimationFrame(()=>{scrollPending=false;let found=categories[0];for(const c of categories){if(document.getElementById(c.id).getBoundingClientRect().top<innerHeight*.4)found=c;}if($('#locale').getBoundingClientRect().top<innerHeight*.4)found={id:'locale',group:'venue'};if(currentCategory!==found.id||group!==found.group){currentCategory=found.id;group=found.group;renderDock();}});}
window.addEventListener('scroll',onScroll,{passive:true});

function preload(src){const im=new Image();im.src=src;return im.decode().then(()=>im);}
function openPlayer(id,push=true){
  const item=byId.get(id);if(!item)return;
  const first=!player.open;
  if(first){returnFocus=document.activeElement;returnScroll=scrollY;player.showModal();player.append($('#ambient-particles'),header,dock);}
  active=item;currentCategory=item.category;group=categories.find(c=>c.id===item.category).group;
  player.classList.remove('revealed');revealStamp++;
  const list=items,index=list.indexOf(item);
  const transform=item.revealTransform||{scale:1,x:0,y:0};
  $('#player-content').innerHTML=`<div class="player-copy"><aside class="player-ingredients">${allergenBadges(item)}<ul>${item.ingredients[lang].map(i=>`<li>${esc(i)}</li>`).join('')}</ul></aside><div class="player-heading"><h2 id="player-title">${esc(name(item))}</h2><div class="player-purchase"><span class="price">${money(item.priceCents)}</span><button class="add-button" data-add="${item.id}" aria-label="${esc(t('add')+' '+name(item))}">${icon('plus')}${t('add')}</button></div>${item.serving?`<p class="serving">${esc(item.serving)}${item.category==='vini'?' · '+({it:'al calice',en:'by the glass',de:'pro Glas',fr:'au verre',es:'por copa'}[lang]):''}</p>`:''}</div></div><div class="player-stage ${item.motionOnly?'motion-only':''}" style="--motion-cut:${item.motionCut||0}%;--motion-left:${item.motionLeft||0}%;--anchor:${item.anchorY||85}%;--anchor-clip:${item.anchorClip||78.5714}%;--reveal-scale:${transform.scale};--reveal-scale-y:${transform.scaleY||transform.scale};--reveal-x:${transform.x}%;--reveal-y:${transform.y}%"><div class="stage-images"><img class="player-a" src="${item.image}" alt="${esc(name(item))}" width="1024" height="1024" fetchpriority="high"><img class="player-b" src="${item.reveal}" alt="${esc(name(item))} — ${lang==='it'?'ingredienti in sospensione':'floating ingredients'}" width="1024" height="1024" aria-hidden="true"><img class="player-anchor" src="${item.image}" alt="" aria-hidden="true" width="1024" height="1024"></div><button class="stage-arrow stage-prev" data-product-step="-1" aria-label="${t('previous')}">${icon('left')}</button><button class="stage-arrow stage-next" data-product-step="1" aria-label="${t('next')}">${icon('right')}</button></div>`;
  rail.innerHTML=Array.from({length:7},(_,n)=>{if(n===3)return `<button class="reveal-control thumb-center" id="reveal-control" aria-label="${esc(t('reveal'))}" aria-pressed="false">${icon('up')}<span class="sr-only">${t('reveal')}</span></button>`;const i=list[(index+n-3+list.length)%list.length];return `<button class="thumb-button" data-thumb="${i.id}" aria-label="${esc(name(i))}"><img src="${i.thumbnail}" alt="" width="128" height="128" draggable="false"></button>`}).join('');
  player.classList.toggle('legacy-b',['pulled','straccetti','pepite'].includes(item.id));
  if(first){player.classList.remove('has-interacted');clearTimeout(window.handTimer);window.handTimer=setTimeout(()=>player.classList.add('has-interacted'),4200);}
  renderDock();requestAnimationFrame(fitPlayer);
  $('#player-announcement').textContent=`${name(item)}, ${index+1} ${lang==='it'?'di':'of'} ${list.length}`;
  document.title=`${name(item)} — Memento Food`;
  if(push){const url=`#item/${id}`;updateHistory(first?'pushState':'replaceState',{player:true},url);}
  if(first)$('#player-close').focus({preventScroll:true});
  if(!navigator.connection?.saveData)[list[(index+1)%list.length],list[(index-1+list.length)%list.length]].forEach(x=>preload(x.image).catch(()=>{}));
  preload(item.reveal).catch(()=>{});
}
function fitPlayer(){if(active)player.classList.toggle('compact-height',innerHeight<600);}
window.addEventListener('resize',()=>{if(active){requestAnimationFrame(fitPlayer);}},{passive:true});
document.fonts?.ready.then(()=>{if(active)fitPlayer();});
function closePlayer(back=true){
  if(!active)return;
  if(back&&history.state?.player){history.back();return;}
  active=null;revealStamp++;player.close();$('#header-home').append(header);$('#dock-home').append(dock);document.body.prepend($('#ambient-particles'));document.title='Memento Food — Burgers · Beer · Good times';
  updateHistory('replaceState',{},`#${currentCategory}`);window.scrollTo({top:returnScroll,behavior:'instant'});returnFocus?.focus({preventScroll:true});onScroll();
}
function stepProduct(step){if(!active)return;player.classList.add('has-interacted');const list=items,i=list.indexOf(active);openPlayer(list[(i+step+list.length)%list.length].id);}
async function setReveal(value){
  player.classList.add('has-interacted');
  if(!active)return;
  const button=$('#reveal-control'),token=++revealStamp,id=active.id;
  if(value){button.disabled=true;$('span',button).textContent=t('loading');try{await $('.player-b',player).decode()}catch{if(token===revealStamp){button.disabled=false;$('span',button).textContent=t('reveal');toast(t('imageError'));}return;}}
  if(token!==revealStamp||active?.id!==id)return;
  player.classList.toggle('revealed',value);$('.player-b',player).setAttribute('aria-hidden',String(!value));$('.player-a',player).setAttribute('aria-hidden',String(value));button.disabled=false;button.setAttribute('aria-pressed',String(value));button.setAttribute('aria-label',t(value?'closeReveal':'reveal'));$('span',button).textContent=t(value?'closeReveal':'reveal');
}
$('#player-close').addEventListener('click',()=>closePlayer());
player.addEventListener('cancel',e=>{e.preventDefault();closePlayer();});
window.addEventListener('popstate',()=>{const id=location.hash.match(/^#item\/(.+)$/)?.[1];if(id&&byId.has(id))openPlayer(id,false);else closePlayer(false);});
document.addEventListener('keydown',e=>{if(!active||cartDialog.open||editDialog.open||infoDialog.open||/INPUT|TEXTAREA|SELECT/.test(e.target.tagName))return;if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();if(e.key==='ArrowLeft')stepProduct(-1);if(e.key==='ArrowRight')stepProduct(1);if(e.key==='ArrowUp')setReveal(true);if(e.key==='ArrowDown')setReveal(false);}});
function attachSwipe(el,onSwipe){let start=null,moved=false;el.addEventListener('pointerdown',e=>{if(e.button!==0||e.target.closest('button,a,input,textarea,select,label'))return;start={x:e.clientX,y:e.clientY,id:e.pointerId};moved=false;el.setPointerCapture(e.pointerId);});el.addEventListener('pointermove',e=>{if(start&&Math.hypot(e.clientX-start.x,e.clientY-start.y)>10)moved=true;});el.addEventListener('pointerup',e=>{if(!start)return;const dx=e.clientX-start.x,dy=e.clientY-start.y;start=null;if(Math.abs(dx)>42&&Math.abs(dx)>Math.abs(dy)*1.2)onSwipe(dx>0?'right':'left');else if(Math.abs(dy)>42&&Math.abs(dy)>Math.abs(dx)*1.2)onSwipe(dy>0?'down':'up');});el.addEventListener('pointercancel',()=>{start=null;moved=false});el.addEventListener('lostpointercapture',()=>{start=null});el.addEventListener('click',e=>{if(moved){e.preventDefault();e.stopPropagation();moved=false;}},true);}
attachSwipe($('#player-content'),direction=>{if(direction==='left')stepProduct(1);if(direction==='right')stepProduct(-1);if(direction==='up')setReveal(true);if(direction==='down')setReveal(false);});
// The seven-position rail always crosses category boundaries.
let railDrag=null;
rail.addEventListener('pointerdown',e=>{railDrag={x:e.clientX,y:e.clientY};});
rail.addEventListener('pointerup',e=>{if(!railDrag)return;const dx=e.clientX-railDrag.x,dy=e.clientY-railDrag.y;railDrag=null;if(Math.abs(dx)>35&&Math.abs(dx)>Math.abs(dy)){e.preventDefault();e.stopPropagation();stepProduct(dx<0?1:-1);}},true);
rail.addEventListener('pointercancel',()=>railDrag=null);

function toast(message){const el=$('#toast');if(player.open)player.append(el);else document.body.append(el);el.textContent=message;el.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('visible'),2300);}
const rowKey=row=>JSON.stringify([row.id,row.variant||'standard',[...row.removed].sort((a,b)=>a-b),row.note.trim()]);
let cart=[];
try{const saved=JSON.parse(storage.get('memento-food-cart-v1')||'[]');if(Array.isArray(saved))cart=saved.filter(r=>byId.has(r.id)&&Number.isInteger(r.qty)&&r.qty>0&&r.qty<=99).map(r=>({id:r.id,qty:r.qty,variant:r.variant==='double'&&isDouble(byId.get(r.id))?'double':'standard',removed:Array.isArray(r.removed)?[...new Set(r.removed.filter(i=>Number.isInteger(i)&&i>=0&&i<byId.get(r.id).ingredients.it.length))]:[],note:typeof r.note==='string'?r.note.slice(0,180):''}));}catch{}
function priceOf(row){return byId.get(row.id).priceCents+(row.variant==='double'?400:0);}
function saveCart(){storage.set('memento-food-cart-v1',JSON.stringify(cart));refreshBadge();}
function refreshBadge(){const count=cart.reduce((n,r)=>n+r.qty,0);$$('.cart-count').forEach(el=>{el.textContent=count;el.hidden=!count});$$('[data-cart]').forEach(el=>el.setAttribute('aria-label',`${t('cartTitle')}, ${count}`));}
function addItem(id){const row={id,qty:1,variant:'standard',removed:[],note:''};const found=cart.find(r=>rowKey(r)===rowKey(row));if(found)found.qty=Math.min(99,found.qty+1);else cart.push(row);saveCart();toast(t('added'));}
function dialogHeading(title,id){return `<div class="sheet-heading"><h2 id="${id}">${esc(title)}</h2><button class="icon-button" data-close-dialog aria-label="${t('close')}">${icon('close')}</button></div>`;}
function openCart(){renderCart();cartDialog.showModal();}
function rowDescription(row){const i=byId.get(row.id),parts=[];if(row.variant==='double')parts.push(t('double'));if(row.removed.length)parts.push(`${t('without')} ${row.removed.map(index=>i.ingredients[lang][index]).join(', ')}`);if(row.note)parts.push(row.note);return parts.join(' · ');}
function renderCart(){cartDialog.innerHTML=dialogHeading(t('cartTitle'),'cart-title')+(cart.length?`<div>${cart.map((row,index)=>{const item=byId.get(row.id);return `<article class="cart-row"><img src="${item.thumbnail}" alt="" width="96" height="96"><div class="cart-row-main"><h3>${esc(name(item))}</h3><button class="edit-row" data-edit="${index}">${t('edit')}</button>${rowDescription(row)?`<p class="row-options">${esc(rowDescription(row))}</p>`:''}<div class="quantity"><button data-quantity="${index}" data-delta="-1" aria-label="${t('remove')} ${esc(name(item))}">${icon('minus')}</button><output aria-label="${t('quantity')}">${row.qty}</output><button data-quantity="${index}" data-delta="1" aria-label="${t('add')} ${esc(name(item))}">${icon('plus')}</button></div></div><div class="cart-row-price"><span class="price">${money(priceOf(row)*row.qty)}</span><button class="icon-button" data-remove-row="${index}" aria-label="${t('remove')} ${esc(name(item))}">${icon('trash')}</button></div></article>`}).join('')}</div><div class="cart-total"><span>${t('total')}</span><strong>${money(cart.reduce((n,r)=>n+priceOf(r)*r.qty,0))}</strong></div><button class="primary-button" data-summary>${t('summary')}</button><button class="secondary-button" data-close-dialog>${({it:'Continua a scegliere',en:'Keep browsing',de:'Weiter auswählen',fr:'Continuer à choisir',es:'Seguir eligiendo'})[lang]}</button><p class="cart-note">${t('cartDemo')}</p>`:`<div class="cart-empty"><p>${t('empty')}</p></div><button class="primary-button" data-browse>${t('browse')}</button>`);}
function editRow(index){const row=cart[index];if(!row)return;editKey=rowKey(row);const item=byId.get(row.id);editDialog.innerHTML=dialogHeading(name(item),'edit-title')+`<form id="edit-form"><p>${t('editingAll')}</p>${isDouble(item)?`<label class="field-label" for="variant">${t('variant')}</label><select id="variant" name="variant"><option value="standard" ${row.variant==='standard'?'selected':''}>${t('standard')} · ${money(item.priceCents)}</option><option value="double" ${row.variant==='double'?'selected':''}>${t('double')} · ${money(item.priceCents+400)}</option></select>`:''}<h3>${t('ingredients')}</h3><p>${t('removeIntro')}</p><div class="editor-list">${item.ingredients[lang].map((v,i)=>`<label><input type="checkbox" name="ingredient" value="${i}" ${row.removed.includes(i)?'':'checked'}>${esc(v)}</label>`).join('')}</div><label class="field-label" for="item-note">${t('note')}</label><textarea id="item-note" name="note" maxlength="180" placeholder="${t('notesPlaceholder')}">${esc(row.note)}</textarea><div class="cart-total"><span>${t('quantity')}</span><strong>${row.qty}</strong></div><button class="primary-button" type="submit">${t('save')}</button><button class="secondary-button" type="button" data-close-dialog>${t('cancel')}</button></form>`;editDialog.showModal();}
editDialog.addEventListener('submit',e=>{e.preventDefault();const index=cart.findIndex(r=>rowKey(r)===editKey);if(index<0){editDialog.close();return;}const row=cart[index],item=byId.get(row.id),form=new FormData(e.target),keep=form.getAll('ingredient').map(Number);const updated={...row,variant:form.get('variant')==='double'&&isDouble(item)?'double':'standard',removed:item.ingredients.it.map((_,i)=>i).filter(i=>!keep.includes(i)),note:String(form.get('note')||'').trim().slice(0,180)};cart.splice(index,1);const same=cart.find(r=>rowKey(r)===rowKey(updated));if(same)same.qty=Math.min(99,same.qty+updated.qty);else cart.splice(index,0,updated);saveCart();editDialog.close();renderCart();});
function summaryText(){return ['MEMENTO FOOD — '+t('demo'),'',...cart.map(row=>`${row.qty} × ${name(byId.get(row.id))} — ${money(priceOf(row)*row.qty)}${rowDescription(row)?'\n  '+rowDescription(row):''}`),'',`${t('total')}: ${money(cart.reduce((n,r)=>n+priceOf(r)*r.qty,0))}`,t('noSend')].join('\n');}
function showSummary(){infoDialog.classList.remove('allergen-modal');infoDialog.innerHTML=dialogHeading(t('orderTitle'),'modal-title')+`<p>${t('noSend')}</p><label class="field-label" for="order-summary">${t('summary')}</label><textarea id="order-summary" readonly rows="10">${esc(summaryText())}</textarea><button class="primary-button" style="margin-top:20px" data-copy-summary>${t('copy')}</button><button class="secondary-button" data-download-summary>${t('download')}</button><p id="copy-status" role="status" style="margin-top:12px"></p>`;infoDialog.showModal();}
const allergenDetail={it:['Grano, segale, orzo, avena e derivati contenenti glutine.','Gamberi, scampi, granchi e altri crostacei.','Uova e preparazioni che le contengono.','Pesce e ingredienti a base di pesce.','Arachidi e prodotti a base di arachidi.','Soia, salse e preparati che la contengono.','Latte e derivati, incluso il lattosio.','Mandorle, nocciole, noci e altra frutta a guscio.','Sedano e preparazioni che lo contengono.','Senape in semi, salse e derivati.','Semi e prodotti a base di sesamo.','Solfiti oltre 10 mg/kg o 10 mg/l di SO₂.','Lupini, farine e prodotti derivati.','Cozze, vongole, calamari e altri molluschi.'],en:['Wheat, rye, barley, oats and derivatives.','Shrimp, prawns, crab and other crustaceans.','Eggs and preparations containing them.','Fish and fish-based ingredients.','Peanuts and peanut products.','Soy and preparations containing soy.','Milk products, including lactose.','Almonds, hazelnuts, walnuts and other nuts.','Celery and preparations containing it.','Mustard seeds, sauces and derivatives.','Sesame seeds and sesame products.','Above 10 mg/kg or 10 mg/l of SO₂.','Lupins, flours and derivatives.','Mussels, clams, squid and other molluscs.']};
Object.assign(allergenDetail,{
 de:['Weizen, Roggen, Gerste, Hafer und glutenhaltige Erzeugnisse.','Garnelen, Krabben und andere Krebstiere.','Eier und daraus hergestellte Erzeugnisse.','Fisch und daraus hergestellte Erzeugnisse.','Erdnüsse und Erdnusserzeugnisse.','Soja und daraus hergestellte Erzeugnisse.','Milch und Milcherzeugnisse, einschließlich Laktose.','Mandeln, Haselnüsse, Walnüsse und andere Schalenfrüchte.','Sellerie und daraus hergestellte Erzeugnisse.','Senfsamen, Saucen und Erzeugnisse.','Sesamsamen und Sesamerzeugnisse.','Über 10 mg/kg oder 10 mg/l SO₂.','Lupinen, Mehl und daraus hergestellte Erzeugnisse.','Muscheln, Tintenfische und andere Weichtiere.'],
 fr:['Blé, seigle, orge, avoine et produits contenant du gluten.','Crevettes, langoustines, crabes et autres crustacés.','Œufs et préparations qui en contiennent.','Poisson et ingrédients à base de poisson.','Arachides et produits à base d’arachides.','Soja et préparations qui en contiennent.','Lait et produits laitiers, y compris le lactose.','Amandes, noisettes, noix et autres fruits à coque.','Céleri et préparations qui en contiennent.','Graines de moutarde, sauces et dérivés.','Graines et produits à base de sésame.','Au-delà de 10 mg/kg ou 10 mg/l de SO₂.','Lupins, farines et produits dérivés.','Moules, palourdes, calmars et autres mollusques.'],
 es:['Trigo, centeno, cebada, avena y derivados con gluten.','Gambas, langostinos, cangrejos y otros crustáceos.','Huevos y preparaciones que los contienen.','Pescado e ingredientes a base de pescado.','Cacahuetes y productos derivados.','Soja y preparaciones que la contienen.','Leche y derivados, incluida la lactosa.','Almendras, avellanas, nueces y otros frutos de cáscara.','Apio y preparaciones que lo contienen.','Semillas de mostaza, salsas y derivados.','Semillas de sésamo y productos derivados.','Más de 10 mg/kg o 10 mg/l de SO₂.','Altramuces, harinas y productos derivados.','Mejillones, almejas, calamares y otros moluscos.']
});
function showAllergens(id){
 const item=byId.get(id),frozen={it:['Prodotti surgelati','Prodotto surgelato all’origine.','Per ulteriori informazioni, chiedere al personale'],en:['Frozen products','Product frozen at source.','For further information, please ask our staff'],de:['Tiefkühlprodukte','Bei der Herstellung tiefgefroren.','Für weitere Informationen fragen Sie bitte unser Personal'],fr:['Produits surgelés','Produit surgelé à l’origine.','Pour plus d’informations, veuillez vous adresser au personnel'],es:['Productos congelados','Producto congelado en origen.','Para más información, consulte al personal']}[lang];
 infoDialog.classList.add('allergen-modal');infoDialog.innerHTML=dialogHeading(name(item),'modal-title')+`<ol class="allergen-legend">${allergens[lang].map((label,index)=>`<li class="${item.allergens.includes(index+1)?'present':''}"><b>${index+1}</b><strong>${esc(lang==='it'&&index===0?'Cereali':label)}</strong><span>${allergenDetail[lang]?.[index]||allergenDetail.en[index]||''}</span>${item.allergens.includes(index+1)?'<i class="sr-only">'+(lang==='it'?'Presente':'Present')+'</i>':''}</li>`).join('')}<li class="frozen-legend"><b>*</b><strong>${frozen[0]}</strong><span>${frozen[1]}</span></li></ol><p class="allergen-footnote">${frozen[2]}</p>`;infoDialog.showModal();
}
function showContact(){
 infoDialog.classList.remove('allergen-modal');
 const phone=config.phone&&/^\+\d{7,15}$/.test(config.phone)?`<a class="contact-phone" href="tel:${esc(config.phone)}">${icon('phone')}<span>${esc(config.phoneDisplay||config.phone)}</span></a>`:'';
 infoDialog.innerHTML=dialogHeading(t('contactTitle'),'modal-title')+`<p>${t('contactBody')}</p>${phone}<a class="primary-button" style="margin-top:24px" href="mailto:${esc(config.email)}">${t('email')}</a><p style="margin-top:16px;text-align:center">${esc(config.email)}</p>`;
 infoDialog.showModal();
}
[cartDialog,editDialog,infoDialog].forEach(dialog=>{dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});});

function updateHours(){const state=openingState(config,new Date(),lang);$$('[data-status]').forEach(el=>el.textContent=state.label);$$('[data-status-detail]').forEach(el=>el.textContent=state.detail);$$('.status-light').forEach(el=>{el.classList.toggle('open',state.open);el.classList.toggle('closed',!state.open)});$('#hours').innerHTML=weeklyRows(config,new Date(),lang).map(row=>`<div class="hours-row ${row.today?'today':''}"><span>${row.day}</span><span>${row.hours}</span></div>`).join('');}
setInterval(()=>{if(!document.hidden)updateHours()},30000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)updateHours()});

const slides=[{"image": "assets/venue/v5/exterior-v5.png", "it": "La serata comincia fuori.", "en": "Your evening begins here.", "de": "Hier beginnt dein Abend.", "fr": "La soirée commence ici.", "es": "La noche empieza aquí."}, {"image": "assets/venue/venue-01.webp", "it": "Il nostro bancone.", "en": "Our bar.", "de": "Unsere Bar.", "fr": "Notre comptoir.", "es": "Nuestra barra."}, {"image": "assets/venue/v4/communal-v4.png", "it": "C’è posto per tutti.", "en": "Room for everyone.", "de": "Platz für alle.", "fr": "De la place pour tous.", "es": "Hay sitio para todos."}, {"image": "assets/venue/venue-06.png", "it": "Il tuo solito. Fatto bene.", "en": "Your usual. Done right.", "de": "Dein Lieblingsdrink.", "fr": "Comme d’habitude.", "es": "Lo de siempre."}, {"image": "assets/venue/v4/welcome-v4.png", "it": "Entra, sei nel posto giusto.", "en": "Come in. You belong here.", "de": "Komm rein.", "fr": "Entrez, vous êtes chez vous.", "es": "Entra, estás en tu sitio."}, {"image": "assets/venue/venue-05.png", "it": "La compagnia giusta.", "en": "Good company.", "de": "Gute Gesellschaft.", "fr": "En bonne compagnie.", "es": "Buena compañía."}, {"image": "assets/venue/v4/kitchen-v4.png", "it": "Dove tutto prende gusto.", "en": "Where the flavour begins.", "de": "Hier beginnt der Geschmack.", "fr": "Là où le goût prend vie.", "es": "Donde nace el sabor."}, {"image": "assets/venue/v4/details-v4.png", "it": "I dettagli fanno la serata.", "en": "It’s all in the details.", "de": "Die kleinen Details.", "fr": "Le sens du détail.", "es": "Todo está en los detalles."}, {"image": "assets/venue/venue-04.webp", "it": "Ancora un po’.", "en": "A little longer.", "de": "Noch ein bisschen.", "fr": "Encore un peu.", "es": "Un rato más."}];
let slide=0,elapsed=0,lastTick=0,galleryVisible=false,galleryPaused=reduced.matches,galleryToken=0;
const duration=6500;
function renderDots(){$('#gallery-dots').innerHTML=slides.map((_,index)=>`<button class="gallery-dot ${index===slide?'active':''}" data-gallery="${index}" aria-label="${t('photo')} ${index+1}" ${index===slide?'aria-current="true"':''}><span class="dot-fill"></span></button>`).join('');}
async function setSlide(index){const token=++galleryToken;const next=(index+slides.length)%slides.length;try{await preload(slides[next].image)}catch{return;}if(token!==galleryToken)return;slide=next;elapsed=0;$('#venue-image').src=slides[slide].image;$('#venue-image').alt=slides[slide][lang];$('#venue-title').textContent=slides[slide][lang];renderDots();}
new IntersectionObserver(entries=>{galleryVisible=entries[0].isIntersecting;},{threshold:.1}).observe($('#venue-gallery'));
function galleryTick(now){const dt=lastTick?Math.min(now-lastTick,100):0;lastTick=now;if(galleryVisible&&!galleryPaused&&!document.hidden&&!active&&!cartDialog.open&&!infoDialog.open&&!editDialog.open){elapsed+=dt;const fill=$('.gallery-dot.active .dot-fill');if(fill)fill.style.transform=`scaleX(${Math.min(1,elapsed/duration)})`;if(elapsed>=duration){elapsed=0;setSlide(slide+1);}}requestAnimationFrame(galleryTick);}
requestAnimationFrame(galleryTick);
reduced.addEventListener('change',()=>{galleryPaused=reduced.matches;});
attachSwipe($('#venue-gallery'),direction=>{if(direction==='left')setSlide(slide+1);if(direction==='right')setSlide(slide-1);});

function translate(){document.documentElement.lang=lang;$$('[data-copy]').forEach(el=>{if(el.dataset.copy==='menuIntro')el.innerHTML=t('menuIntro');else el.textContent=t(el.dataset.copy)});syncLanguageSwitch();$('#player-close').setAttribute('aria-label',t('back'));$('[data-product-step="-1"]')?.setAttribute('aria-label',t('previous'));$('[data-product-step="1"]')?.setAttribute('aria-label',t('next'));$$('[data-call]').forEach(el=>el.setAttribute('aria-label',t('call')));$('#venue-title').textContent=slides[slide][lang];renderCatalog();renderDock();refreshBadge();updateHours();renderDots();if(active)openPlayer(active.id,false);document.dispatchEvent(new CustomEvent('memento-language',{detail:lang}));}
function syncLanguageSwitch(){
 const buttons=$$('[data-language]');
 buttons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.language===lang)));
 $('#language').style.setProperty('--language-index',buttons.findIndex(button=>button.dataset.language===lang));
}
$('#language').addEventListener('click',e=>{
 const button=e.target.closest('[data-language]');
 if(!button||button.dataset.language===lang)return;
 const top=scrollY;lang=button.dataset.language;storage.set('memento-food-language',lang);translate();
 if(!active)scrollTo({top,behavior:'instant'});
});
$('#language').addEventListener('keydown',e=>{
 const buttons=$$('[data-language]'),index=buttons.indexOf(e.target);
 if(index<0||!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;
 e.preventDefault();e.stopPropagation();
 const next=e.key==='Home'?0:e.key==='End'?buttons.length-1:(index+(e.key==='ArrowRight'?1:-1)+buttons.length)%buttons.length;
 buttons[next].focus();buttons[next].click();
});
document.addEventListener('click',async e=>{
  const close=e.target.closest('[data-close-dialog]');if(close){close.closest('dialog').close();return;}
  const open=e.target.closest('[data-open]');if(open){openPlayer(open.dataset.open);return;}
  const add=e.target.closest('[data-add]');if(add){addItem(add.dataset.add);return;}
  const allergen=e.target.closest('[data-allergens]');if(allergen){showAllergens(allergen.dataset.allergens);return;}
  if(e.target.closest('[data-cart]')){openCart();return;}
  if(e.target.closest('[data-call]')){showContact();return;}
  const groupButton=e.target.closest('[data-group]');if(groupButton){group=groupButton.dataset.group;const category=categories.find(c=>c.group===group);if(active)openPlayer(byCategory[category.id][0].id);else goSection(category.id);currentCategory=category.id;renderDock();return;}
  const category=e.target.closest('[data-category]');if(category){currentCategory=category.dataset.category;if(active)openPlayer(byCategory[currentCategory][0].id);else goSection(currentCategory);renderDock();return;}
  const thumb=e.target.closest('[data-thumb]');if(thumb){openPlayer(thumb.dataset.thumb);return;}
  const step=e.target.closest('[data-product-step]');if(step){stepProduct(Number(step.dataset.productStep));return;}
  if(e.target.closest('#reveal-control')){setReveal(!player.classList.contains('revealed'));return;}
  const quantity=e.target.closest('[data-quantity]');if(quantity){const index=Number(quantity.dataset.quantity),row=cart[index];row.qty=Math.min(99,row.qty+Number(quantity.dataset.delta));if(row.qty<=0)cart.splice(index,1);saveCart();renderCart();return;}
  const remove=e.target.closest('[data-remove-row]');if(remove){cart.splice(Number(remove.dataset.removeRow),1);saveCart();renderCart();return;}
  const edit=e.target.closest('[data-edit]');if(edit){editRow(Number(edit.dataset.edit));return;}
  if(e.target.closest('[data-browse]')){cartDialog.close();if(!active)goSection('panini');return;}
  if(e.target.closest('[data-summary]')){showSummary();return;}
  if(e.target.closest('[data-copy-summary]')){try{await navigator.clipboard.writeText(summaryText());$('#copy-status').textContent=t('copied')}catch{$('#order-summary').focus();$('#order-summary').select();$('#copy-status').textContent=t('copyFailed')}return;}
  if(e.target.closest('[data-download-summary]')){const url=URL.createObjectURL(new Blob([summaryText()],{type:'text/plain;charset=utf-8'}));const link=document.createElement('a');link.href=url;link.download='Memento-Food-selezione.txt';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);return;}
  const galleryStep=e.target.closest('[data-gallery-step]');if(galleryStep){setSlide(slide+Number(galleryStep.dataset.galleryStep));return;}
  const galleryDot=e.target.closest('[data-gallery]');if(galleryDot){setSlide(Number(galleryDot.dataset.gallery));return;}
  const anchor=e.target.closest('a[href^="#"]');if(anchor){const id=anchor.getAttribute('href').slice(1);if(document.getElementById(id)){e.preventDefault();goSection(id);}}
});
translate();
const directItem=location.hash.match(/^#item\/(.+)$/)?.[1];if(directItem&&byId.has(directItem))openPlayer(directItem,false);

initExperience({config,lang,openBooking:()=>goSection('prenota')});
initV4({config,lang});
initParticles();
initHeroInteraction();
document.addEventListener('contextmenu',e=>e.preventDefault());
document.addEventListener('dragstart',e=>{if(e.target.closest('img'))e.preventDefault()});

document.addEventListener('memento-clear-local',()=>{cart=[];refreshBadge();if(cartDialog.open)renderCart()});
