/* AES Energy export inventory — UI logic. Data & logo live in assets.js */

const esc=s=>String(s||"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

/* Illustrated placeholder per category (SVG). Replace by giving a row a real `photo`. */
function catArt(r){
  const cat=r.category||"Solar Panels";
  const base=(typeof CATEGORY_COLORS!=="undefined"&&CATEGORY_COLORS[cat])||"#1B2C4A";
  const W=400,H=300,white="#EFF2F7",dark="#0E1A30",gold="#F5A800",win=base;
  let icon="";
  if(cat==="Cars"){
    icon=`<rect x="118" y="122" width="172" height="46" rx="16" fill="${white}"/>`
      +`<path d="M150 122 Q162 92 194 92 L214 92 Q246 92 260 122 Z" fill="${white}"/>`
      +`<rect x="168" y="100" width="30" height="22" rx="4" fill="${win}"/>`
      +`<rect x="210" y="100" width="30" height="22" rx="4" fill="${win}"/>`
      +`<circle cx="162" cy="172" r="21" fill="${dark}"/><circle cx="162" cy="172" r="7" fill="${gold}"/>`
      +`<circle cx="248" cy="172" r="21" fill="${dark}"/><circle cx="248" cy="172" r="7" fill="${gold}"/>`;
  } else if(cat==="Clothes"){
    icon=`<rect x="132" y="152" width="136" height="28" rx="7" fill="${white}"/>`
      +`<rect x="144" y="126" width="112" height="26" rx="7" fill="#D7DEEA"/>`
      +`<rect x="154" y="102" width="92" height="24" rx="7" fill="${white}"/>`
      +`<path d="M178 102 l10 -12 24 0 10 12" fill="none" stroke="${gold}" stroke-width="6" stroke-linejoin="round"/>`;
  } else if(cat==="Bicycles"){
    icon=`<g fill="none" stroke="${white}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round">`
      +`<circle cx="150" cy="176" r="34"/><circle cx="256" cy="176" r="34"/>`
      +`<path d="M150 176 L196 122 L236 122 M196 122 L216 176 M216 176 L256 176 M236 122 L248 110 M170 176 L204 176"/></g>`
      +`<circle cx="150" cy="176" r="6" fill="${gold}"/><circle cx="256" cy="176" r="6" fill="${gold}"/>`;
  } else if(cat==="Shoes"){
    icon=`<path d="M116 168 Q116 150 138 148 L176 144 Q190 128 212 131 Q238 134 252 150 L292 160 Q308 164 308 177 L308 183 Q308 189 298 189 L130 189 Q116 189 116 178 Z" fill="${white}"/>`
      +`<path d="M185 140 l6 11 M199 137 l6 11 M213 139 l6 11" stroke="${base}" stroke-width="4" stroke-linecap="round"/>`
      +`<path d="M116 178 L308 178 L308 184 Q308 189 298 189 L130 189 Q116 189 116 179 Z" fill="${gold}"/>`;
  } else {
    let cells="";const cols=6,rows=4,x0=122,y0=88,cw=26,ch=30;
    for(let y=0;y<rows;y++)for(let x=0;x<cols;x++)cells+=`<rect x="${x0+x*(cw+2)}" y="${y0+y*(ch+2)}" width="${cw}" height="${ch}" rx="2" fill="rgba(255,255,255,0.10)" stroke="rgba(255,255,255,0.16)"/>`;
    icon=`<rect x="${x0-6}" y="${y0-6}" width="${cols*(cw+2)+8}" height="${rows*(ch+2)+8}" rx="4" fill="none" stroke="${white}" stroke-width="4"/>${cells}`;
  }
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`
    +`<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${base}"/><stop offset="1" stop-color="#0C1526"/></linearGradient>`
    +`<radialGradient id="h" cx="0.5" cy="0.3" r="0.7"><stop offset="0" stop-color="rgba(255,255,255,0.16)"/><stop offset="1" stop-color="rgba(255,255,255,0)"/></radialGradient></defs>`
    +`<rect width="${W}" height="${H}" fill="url(#g)"/><rect width="${W}" height="${H}" fill="url(#h)"/>${icon}`
    +`<rect x="0" y="${H-40}" width="${W}" height="40" fill="rgba(8,14,26,0.55)"/>`
    +`<circle cx="24" cy="${H-20}" r="6" fill="${gold}"/>`
    +`<text x="40" y="${H-14}" fill="#EEF1F6" font-family="-apple-system,Segoe UI,sans-serif" font-size="16" font-weight="700">${esc(r.brand||cat)}</text></svg>`;
  return "data:image/svg+xml,"+encodeURIComponent(svg);
}

/* Fallback wordmark if the embedded logo image fails to decode */
function wordmarkSVG(){
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="240" height="60" viewBox="0 0 240 60">`
    +`<circle cx="26" cy="30" r="15" fill="none" stroke="#F5A800" stroke-width="3"/><circle cx="26" cy="30" r="5" fill="#F5A800"/>`
    +`<text x="52" y="27" fill="#1A2744" font-family="-apple-system,Segoe UI,sans-serif" font-size="21" font-weight="900" letter-spacing="1">AES ENERGY</text>`
    +`<text x="52" y="46" fill="#8A93A6" font-family="-apple-system,Segoe UI,sans-serif" font-size="10.5" font-weight="700" letter-spacing="2">GLOBAL TRADE &amp; SOLAR</text></svg>`;
  return "data:image/svg+xml,"+encodeURIComponent(svg);
}

const live=ROWS.filter(r=>!r.draft);
let q="",catF="All",condF="All";

/* ---------------- Language (EN / FR) ---------------- */
const T={
 en:{
   ebadge:"Global Export &amp; Wholesale Business",
   h1:"Used Goods, Shipped by the Container",
   sub:'We source and export bulk used <b>solar panels, cars, clothing (fripe), shoes &amp; bicycles</b> — full 40ft container loads to West Africa &amp; beyond.',
   web:"Visit our website",
   search:"Search cars, clothes, panels, location…",
   browse:"Browse by category", swipe:"swipe →",
   all:"All", available:"Available", location:"Location",
   add:"Add to cart", added:"Added ✓", enquire:"Enquire", buy:"Buy",
   listing:"listing", listings:"listings", inStock:"in stock",
   empty:"Nothing matches this search. Clear the filters to see everything.",
   footT:"Ready to order a container?",
   footD:"We ship full 40ft container loads — cars, solar panels, fripe, shoes and bikes — to Mali, Burkina Faso, Gambia, Nigeria, Togo and Guinea. Pickup and logistics handled by us.",
   waAll:"Message us on WhatsApp",
   payBig:"Buy by card (Visa / Mastercard)",
   payNote:"Secure checkout by Stripe · enter your amount. We never see your card details.",
   fine:"AES Energy Global Trade &amp; Solar LLC · Photos of actual stock",
   viewOrder:"View order", yourOrder:"Your order",
   cartEmpty:'Your order is empty.<br>Tap “Add to cart” on any listing to build an order.',
   cartNote:"Items are quoted per order. Send your list on WhatsApp for a price &amp; shipping quote — or pay an agreed amount / deposit securely by card.",
   sendWa:"Send order on WhatsApp", buyCard:"Buy with card (Stripe)", remove:"Remove", ask:"Ask",
   toOrder:"Export to order", models:"models",
   waGeneric:"Hello AES Energy, please send me your current export inventory (cars, solar panels, used clothes, shoes, bicycles).",
   waItem:(name,cat,qty,unit)=>`Hello AES Energy, I'm interested in: ${name} — ${cat}. Qty available: ${qty} ${unit}. Please send price & details.`,
   waCar:(name)=>`Hello AES Energy, I'd like to order this car for export: ${name}. Please send price, total landed cost and shipping to my port.`,
   waOrderHead:"Hello AES Energy, I'd like to order:",
   waOrderTail:"Please send me a quote and shipping details."
 },
 fr:{
   ebadge:"Entreprise d'export &amp; de gros à l'international",
   h1:"Marchandises d'occasion, expédiées par conteneur",
   sub:"Nous sourçons et exportons en gros des <b>panneaux solaires, voitures, vêtements (friperie), chaussures &amp; vélos</b> d'occasion — conteneurs complets de 40 pieds vers l'Afrique de l'Ouest et au-delà.",
   web:"Visitez notre site web",
   search:"Rechercher voitures, vêtements, panneaux, lieu…",
   browse:"Parcourir par catégorie", swipe:"glissez →",
   all:"Tout", available:"Disponible", location:"Lieu",
   add:"Ajouter au panier", added:"Ajouté ✓", enquire:"Demander", buy:"Acheter",
   listing:"annonce", listings:"annonces", inStock:"en stock",
   empty:"Aucun résultat. Effacez les filtres pour tout voir.",
   footT:"Prêt à commander un conteneur ?",
   footD:"Nous expédions des conteneurs complets de 40 pieds — voitures, panneaux solaires, friperie, chaussures et vélos — vers le Mali, le Burkina Faso, la Gambie, le Nigéria, le Togo et la Guinée. Ramassage et logistique gérés par nos soins.",
   waAll:"Écrivez-nous sur WhatsApp",
   payBig:"Payer par carte (Visa / Mastercard)",
   payNote:"Paiement sécurisé par Stripe · saisissez votre montant. Nous ne voyons jamais vos coordonnées de carte.",
   fine:"AES Energy Global Trade &amp; Solar LLC · Photos du stock réel",
   viewOrder:"Voir la commande", yourOrder:"Votre commande",
   cartEmpty:'Votre commande est vide.<br>Touchez « Ajouter au panier » sur une annonce pour composer une commande.',
   cartNote:"Les articles sont cotés par commande. Envoyez votre liste sur WhatsApp pour un devis prix &amp; expédition — ou payez un montant convenu / acompte en toute sécurité par carte.",
   sendWa:"Envoyer la commande sur WhatsApp", buyCard:"Acheter par carte (Stripe)", remove:"Retirer", ask:"Sur demande",
   toOrder:"Export sur commande", models:"modèles",
   waGeneric:"Bonjour AES Energy, merci de m'envoyer votre inventaire d'export actuel (voitures, panneaux solaires, vêtements d'occasion, chaussures, vélos).",
   waItem:(name,cat,qty,unit)=>`Bonjour AES Energy, je suis intéressé(e) par : ${name} — ${cat}. Quantité disponible : ${qty} ${unit}. Merci de m'envoyer le prix et les détails.`,
   waCar:(name)=>`Bonjour AES Energy, je souhaite commander cette voiture à l'export : ${name}. Merci de m'envoyer le prix, le coût rendu et l'expédition vers mon port.`,
   waOrderHead:"Bonjour AES Energy, je souhaite commander :",
   waOrderTail:"Merci de m'envoyer un devis et les détails d'expédition."
 }
};
let lang="en";
try{const sv=localStorage.getItem("aes_lang");if(sv==="en"||sv==="fr")lang=sv;else if((navigator.language||"").toLowerCase().startsWith("fr"))lang="fr";}catch(e){}
const L=()=>T[lang];
const I=(typeof I18N!=="undefined")?I18N:{categories:{},conditions:{},units:{},badges:{},rows:{}};
function dcat(c){return lang==="fr"&&I.categories[c]?I.categories[c]:c;}
function dcond(v){return lang==="fr"&&I.conditions[v]?I.conditions[v]:v;}
function dunit(u){return lang==="fr"&&I.units[u]?I.units[u]:u;}
function dbadge(b){return lang==="fr"&&I.badges[b]?I.badges[b]:b;}
function tr(r,f){const o=lang==="fr"&&I.rows[r.id];return (o&&o[f])?o[f]:r[f];}

/* App icons (used when self-hosted and added to home screen) */
(function(){var a=document.getElementById("appleIcon"),f=document.getElementById("favIcon");if(a)a.href=LOGO;if(f)f.href=LOGO;})();

/* Logo, with graceful fallback */
(function(){var el=document.getElementById("logo");el.onerror=function(){el.onerror=null;el.src=wordmarkSVG();};el.src=LOGO;})();

/* Hero background */
document.getElementById("heroBg").src=(typeof PHOTOS!=="undefined"&&PHOTOS.pallets&&PHOTOS.pallets.src)||catArt({category:"Solar Panels",brand:"AES Energy"});

function wa(m){return "https://wa.me/"+WHATSAPP+"?text="+encodeURIComponent(m);}
function waLink(r){
  if(!r) return wa(L().waGeneric);
  const b=r.badge?(" ("+dbadge(r.badge)+")"):"";
  if(r.category==="Cars") return wa(L().waCar(tr(r,"brand")+b));
  return wa(L().waItem(tr(r,"brand")+b, dcat(r.category), r.qty, dunit(r.unit||"")));
}

/* Pay with card (Stripe secure checkout) — for any listing. Shows when PAY_URL is set. */
const PAY=(typeof PAY_URL!=="undefined"&&PAY_URL)?PAY_URL:"";
const cardIcon='<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>';
const plusIcon='<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>';
const waIconSm='<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 00-8.6 15L2 22l5.2-1.4A10 10 0 1012 2zm5.8 14.2c-.2.7-1.4 1.3-2 1.4-.5.1-1.1.1-1.8-.1-.4-.1-1-.3-1.7-.6-3-1.3-4.9-4.3-5-4.5-.2-.2-1.2-1.6-1.2-3s.7-2.1 1-2.4c.3-.3.6-.4.8-.4h.6c.2 0 .4 0 .7.5l.9 2.2c.1.2 0 .4-.1.5l-.4.5c-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.1 1 2.1 1.3 2.4 1.5.3.1.4.1.6-.1l.8-1c.2-.2.4-.2.6-.1l2.1 1c.3.1.5.2.5.3.1.2.1.7-.1 1.4z"/></svg>';
function buildPay(){
  if(!PAY)return; var w=document.getElementById("payWrap"); if(!w)return;
  w.innerHTML='<a class="pay" href="'+PAY+'" target="_blank" rel="noreferrer">'
    +'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>'
    +L().payBig+'</a>'
    +'<div class="paynote">'+L().payNote+'</div>';
}

const order=(typeof CATEGORY_ORDER!=="undefined")?CATEGORY_ORDER:[];
const cats=order.filter(c=>live.some(r=>r.category===c)).concat([...new Set(live.map(r=>r.category))].filter(c=>order.indexOf(c)<0));
function catColor(c){return (typeof CATEGORY_COLORS!=="undefined"&&CATEGORY_COLORS[c])||"#1B2C4A";}

const CAT_ICONS={"All":"🛍️","Cars":"🚗","Clothes":"👕","Bicycles":"🚲","Shoes":"👟","Solar Panels":"☀️"};
const catCount=c=>c==="All"?live.length:live.filter(r=>r.category===c).length;
function buildChips(){
  document.getElementById("catChips").innerHTML=["All",...cats].map(c=>{
    const label=c==="All"?L().all:dcat(c);
    return `<button class="chip" data-cat="${esc(c)}"><span class="ic">${CAT_ICONS[c]||"•"}</span>${esc(label)}<span class="ct">${catCount(c)}</span></button>`;
  }).join("");
}

function card(r){
  const ph=(typeof PHOTOS!=="undefined")?PHOTOS[r.photo]:null;
  const src=ph&&ph.src?ph.src:catArt(r);
  const brand=tr(r,"brand"),model=tr(r,"model"),notes=tr(r,"notes");
  const isCar=r.category==="Cars";
  const avail=isCar?L().toOrder:(r.qty?((+r.qty).toLocaleString()+(r.unit?" "+dunit(r.unit):"")):L().ask);
  return `<div class="card"><div class="shot" data-src="${src}">
 <img src="${src}" alt="${esc(brand)} — ${esc(dcat(r.category))}" loading="lazy">
 <div class="fade"></div><span class="tag" style="background:${COND_COLORS[r.condition]||"#8A93A6"}">${esc(dcond(r.condition))}</span>
 ${r.badge?`<span class="watt">${esc(dbadge(r.badge))}</span>`:""}</div>
 <div class="body"><div class="b">${esc(brand)}</div>${model?`<div class="m">${esc(model)}</div>`:""}
 <div class="facts"><div><div class="k">${L().available}</div><div class="v">${esc(avail)}</div></div>
 ${r.location?`<div><div class="k">${L().location}</div><div class="v" style="font-weight:700">${esc(r.location)}</div></div>`:""}</div>
 ${notes?`<div class="note">${esc(notes)}</div>`:""}
 <div class="acts">
 <button class="btn add" data-add="${esc(r.id)}">${plusIcon} ${L().add}</button>
 <div class="acts2"><a class="btn wa2" href="${waLink(r)}" target="_blank" rel="noreferrer">${waIconSm} ${L().enquire}</a>${PAY?`<a class="btn pc2" href="${PAY}" target="_blank" rel="noreferrer">${cardIcon} ${L().buy}</a>`:""}</div>
 </div></div></div>`;
}

function render(){const s=q.trim().toLowerCase();
  const shown=live.filter(r=>(condF==="All"||r.condition===condF)&&(catF==="All"||r.category===catF)&&(!s||[r.brand,r.model,r.category,r.badge,r.location,tr(r,"brand"),tr(r,"model"),dcat(r.category)].join(" ").toLowerCase().includes(s)));
  const groups=cats.filter(c=>shown.some(r=>r.category===c)).map(c=>[c,shown.filter(r=>r.category===c)]);
  document.getElementById("list").innerHTML= shown.length? groups.map(([c,items])=>{
    const isCar=c==="Cars";
    const u=items.reduce((a,r)=>a+(+r.qty||0),0);
    const rhtml=isCar?`<b>${items.length}</b><span>${L().models}</span>`:`<b>${u.toLocaleString()}</b><span>${L().inStock}</span>`;
    return `<div class="bsec"><div class="bhead"><div class="dot" style="background:${catColor(c)}"></div>
    <div style="min-width:0;flex:1"><div class="n">${esc(dcat(c))}</div><div class="w">${items.length} ${items.length>1?L().listings:L().listing}</div></div>
    <div class="r">${rhtml}</div></div>
    <div class="grid">${items.map(card).join("")}</div></div>`;}).join("")
   : `<div class="empty">${L().empty}</div>`;
  document.querySelectorAll(".chip").forEach(e=>e.classList.toggle("on",e.dataset.cat===catF));
}

document.getElementById("q").addEventListener("input",e=>{q=e.target.value;render();});
document.getElementById("catChips").addEventListener("click",e=>{const b=e.target.closest(".chip");if(b){catF=b.dataset.cat;render();}});

/* ---------------- Cart & checkout ---------------- */
const rowById={};live.forEach(r=>rowById[r.id]=r);
let cart={};
try{cart=JSON.parse(localStorage.getItem("aes_cart")||"{}")||{};}catch(e){cart={};}
// drop any stale ids no longer in inventory
Object.keys(cart).forEach(id=>{if(!rowById[id]||!(cart[id]>0))delete cart[id];});
function saveCart(){try{localStorage.setItem("aes_cart",JSON.stringify(cart));}catch(e){}}
function cartCount(){return Object.values(cart).reduce((a,n)=>a+n,0);}
function addToCart(id){if(!rowById[id])return;cart[id]=(cart[id]||0)+1;saveCart();updateFab();if(sheet.classList.contains("on"))renderCart();}
function setQty(id,n){if(n<=0){delete cart[id];}else{cart[id]=n;}saveCart();updateFab();renderCart();}

const fab=document.getElementById("cartFab");
const sheet=document.getElementById("cartSheet");
const cartBody=document.getElementById("cartBody");
function updateFab(){const n=cartCount();if(n>0){fab.hidden=false;fab.innerHTML=`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1.6"/><circle cx="18" cy="21" r="1.6"/><path d="M2.5 3h2l2.2 12.3a1.6 1.6 0 001.6 1.3h8.8a1.6 1.6 0 001.6-1.3L21.5 7H6"/></svg> ${L().viewOrder} <span class="cbadge">${n}</span>`;}else{fab.hidden=true;if(sheet.classList.contains("on"))closeCart();}}

function waOrderLink(){
  const items=Object.keys(cart).map(id=>{const r=rowById[id];const b=r.badge?` (${dbadge(r.badge)})`:"";return `• ${tr(r,"brand")}${b} — ${dcat(r.category)} × ${cart[id]}`;});
  const msg=L().waOrderHead+"\n"+items.join("\n")+"\n\n"+L().waOrderTail;
  return wa(msg);
}
function renderCart(){
  const ids=Object.keys(cart);
  if(!ids.length){cartBody.innerHTML=`<div class="cempty">${L().cartEmpty}</div>`;return;}
  const rows=ids.map(id=>{const r=rowById[id];const ph=(typeof PHOTOS!=="undefined")?PHOTOS[r.photo]:null;const src=ph&&ph.src?ph.src:catArt(r);
    return `<div class="crow"><img src="${src}" alt=""><div class="ci"><div class="cn">${esc(tr(r,"brand"))}</div><div class="cc">${esc(dcat(r.category))}${r.badge?" · "+esc(dbadge(r.badge)):""}</div></div>
    <div class="step"><button data-dec="${esc(id)}" aria-label="Decrease">−</button><span>${cart[id]}</span><button data-inc="${esc(id)}" aria-label="Increase">+</button></div>
    <button class="rm" data-rm="${esc(id)}">${L().remove}</button></div>`;}).join("");
  cartBody.innerHTML=`<div class="clist">${rows}
    <div class="cnote">${L().cartNote}</div></div>
    <div class="cfoot">
      <a class="btn wa2" href="${waOrderLink()}" target="_blank" rel="noreferrer">${waIconSm} ${L().sendWa}</a>
      ${PAY?`<a class="btn pc2" href="${PAY}" target="_blank" rel="noreferrer">${cardIcon} ${L().buyCard}</a>`:""}
    </div>`;
}
function openCart(){renderCart();sheet.classList.add("on");}
function closeCart(){sheet.classList.remove("on");}

fab.addEventListener("click",openCart);
sheet.addEventListener("click",e=>{
  if(e.target.closest("[data-close]")){closeCart();return;}
  const inc=e.target.closest("[data-inc]"),dec=e.target.closest("[data-dec]"),rm=e.target.closest("[data-rm]");
  if(inc){setQty(inc.dataset.inc,(cart[inc.dataset.inc]||0)+1);}
  else if(dec){setQty(dec.dataset.dec,(cart[dec.dataset.dec]||0)-1);}
  else if(rm){setQty(rm.dataset.rm,0);}
});

const lb=document.getElementById("lb"),lbImg=document.getElementById("lbImg");
document.getElementById("list").addEventListener("click",e=>{
  const add=e.target.closest("[data-add]");
  if(add){addToCart(add.dataset.add);add.classList.add("in");const t=add.innerHTML;add.innerHTML=plusIcon+" Added ✓";setTimeout(()=>{add.classList.remove("in");add.innerHTML=t;},900);return;}
  const s=e.target.closest(".shot");if(s&&s.dataset.src){lbImg.src=s.dataset.src;lb.classList.add("on");}
});
lb.addEventListener("click",()=>lb.classList.remove("on"));

/* ---------------- Owner books: income & expenses (private, on this device) ---------------- */
const booksSheet=document.getElementById("booksSheet");
const booksBody=document.getElementById("booksBody");
let books=[];try{books=JSON.parse(localStorage.getItem("aes_books")||"[]")||[];}catch(e){books=[];}
let bookCur="$";try{bookCur=localStorage.getItem("aes_books_cur")||"$";}catch(e){bookCur="$";}
let bookUnlocked=false, bKind="in";
function saveBooks(){try{localStorage.setItem("aes_books",JSON.stringify(books));}catch(e){}}
function bGetPin(){try{return localStorage.getItem("aes_books_pin")||"";}catch(e){return "";}}
function bSetPin(p){try{localStorage.setItem("aes_books_pin",p);}catch(e){}}
function money(n){return bookCur+" "+(+n||0).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2});}

function openBooks(){booksSheet.classList.add("on");if(bookUnlocked)renderBooks();else renderPinGate();}
function closeBooks(){booksSheet.classList.remove("on");}

function renderPinGate(){
  const isSet=!bGetPin();
  booksBody.innerHTML=`<div class="bpingate">
    <div style="font-size:36px">🔒</div>
    <div style="font-weight:900;font-size:16px;margin-top:6px">${isSet?"Set a PIN":"Enter your PIN"}</div>
    <div class="msg">${isSet?"Create a 4-digit PIN to keep your books private on this phone.":"Keeps your income &amp; expenses private on this device."}</div>
    <input id="bpin" type="tel" inputmode="numeric" maxlength="4" placeholder="••••" autocomplete="off">
    <div class="msg" id="bpinErr" style="color:#C0546A;min-height:16px"></div>
    <button class="badd" id="bpinBtn" style="width:160px;margin:6px auto 0">${isSet?"Set PIN":"Unlock"}</button>
  </div>`;
  const inp=document.getElementById("bpin");if(inp)inp.focus();
  document.getElementById("bpinBtn").onclick=()=>{
    const v=((document.getElementById("bpin")||{}).value||"").trim();
    if(!/^\d{4}$/.test(v)){document.getElementById("bpinErr").textContent="Enter 4 digits.";return;}
    if(isSet){bSetPin(v);bookUnlocked=true;renderBooks();}
    else if(v===bGetPin()){bookUnlocked=true;renderBooks();}
    else document.getElementById("bpinErr").textContent="Wrong PIN. Try again.";
  };
}
function renderBooks(){
  const income=books.filter(b=>b.kind==="in").reduce((a,b)=>a+(+b.amount||0),0);
  const expense=books.filter(b=>b.kind==="out").reduce((a,b)=>a+(+b.amount||0),0);
  const net=income-expense;
  const today=new Date().toISOString().slice(0,10);
  const cats=["Sale","Deposit","Vehicle purchase","Goods purchase","Shipping","Customs","Transport","Fees","Refund","Other"];
  const list=[...books].sort((a,b)=>(b.date+b.id).localeCompare(a.date+a.id)).map(b=>`
    <div class="brow"><div class="bi"><div class="bd">${esc(b.desc||b.cat||"—")}</div><div class="bm">${esc(b.date)}${b.cat?" · "+esc(b.cat):""}</div></div>
    <div class="ba ${b.kind}">${b.kind==="out"?"−":"+"}${esc(money(b.amount))}</div>
    <button class="del" data-bdel="${esc(b.id)}" aria-label="Delete">×</button></div>`).join("")
    || `<div class="cempty" style="padding:22px">No entries yet. Record your first income or expense above.</div>`;
  booksBody.innerHTML=`<div class="bscroll">
   <div class="bsum">
     <div class="t in"><b>${esc(money(income))}</b><span>Income</span></div>
     <div class="t out"><b>${esc(money(expense))}</b><span>Expenses</span></div>
     <div class="t net"><b>${esc(money(net))}</b><span>Net profit</span></div>
   </div>
   <div class="bform">
     <div class="seg"><button class="in ${bKind==="in"?"on":""}" data-bkind="in">＋ Income</button><button class="out ${bKind==="out"?"on":""}" data-bkind="out">－ Expense</button></div>
     <div class="row">
       <label>Date<input id="bDate" type="date" value="${today}"></label>
       <label>Amount<input id="bAmt" type="number" inputmode="decimal" min="0" step="0.01" placeholder="0.00"></label>
     </div>
     <div class="row">
       <label>Category<select id="bCat">${cats.map(c=>`<option>${c}</option>`).join("")}</select></label>
       <label>Currency<select id="bCur">${["$","€","CFA","₦","£","GH₵"].map(c=>`<option ${c===bookCur?"selected":""}>${c}</option>`).join("")}</select></label>
     </div>
     <label>Note<input id="bDesc" type="text" placeholder="e.g. Corolla deposit from Amadou"></label>
     <button class="badd" id="bAdd">Add entry</button>
   </div>
   <div class="blist">${list}</div>
   </div>
   <div class="cfoot"><button class="bexport" id="bExport">⬇ Export CSV (for accountant)</button></div>`;
  booksBody.querySelectorAll("[data-bkind]").forEach(x=>x.onclick=()=>{bKind=x.dataset.bkind;renderBooks();});
  const cur=document.getElementById("bCur");if(cur)cur.onchange=e=>{bookCur=e.target.value;try{localStorage.setItem("aes_books_cur",bookCur);}catch(_){}renderBooks();};
  document.getElementById("bAdd").onclick=addBookEntry;
  document.getElementById("bExport").onclick=exportBooksCSV;
  booksBody.querySelectorAll("[data-bdel]").forEach(x=>x.onclick=()=>{books=books.filter(b=>b.id!==x.dataset.bdel);saveBooks();renderBooks();});
}
function addBookEntry(){
  const amt=parseFloat((document.getElementById("bAmt")||{}).value);
  if(!(amt>0)){const a=document.getElementById("bAmt");if(a)a.focus();return;}
  books.push({id:Date.now().toString(36)+Math.random().toString(36).slice(2,6),
    date:(document.getElementById("bDate")||{}).value||new Date().toISOString().slice(0,10),
    kind:bKind,cat:(document.getElementById("bCat")||{}).value||"",
    desc:((document.getElementById("bDesc")||{}).value||"").trim(),amount:amt});
  saveBooks();renderBooks();
}
function exportBooksCSV(){
  const rows=[["Date","Type","Category","Note","Amount","Currency"]].concat(
    [...books].sort((a,b)=>a.date.localeCompare(b.date)).map(b=>[b.date,b.kind==="in"?"Income":"Expense",b.cat||"",b.desc||"",(+b.amount||0).toFixed(2),bookCur]));
  const csv=rows.map(r=>r.map(c=>/[",\n]/.test(String(c))?'"'+String(c).replace(/"/g,'""')+'"':c).join(",")).join("\n");
  try{const blob=new Blob([csv],{type:"text/csv"});const url=URL.createObjectURL(blob);
    const a=document.createElement("a");a.href=url;a.download="aes-books.csv";document.body.appendChild(a);a.click();
    setTimeout(()=>{URL.revokeObjectURL(url);a.remove();},600);}catch(e){}
}
var booksBtn=document.getElementById("booksBtn");
if(booksBtn)booksBtn.addEventListener("click",openBooks);
if(booksSheet)booksSheet.addEventListener("click",e=>{if(e.target.closest("[data-bclose]"))closeBooks();});
if(typeof location!=="undefined"&&location.hash==="#books")openBooks();

/* ---------------- Apply language across the page ---------------- */
function setText(id,txt){const el=document.getElementById(id);if(el)el.textContent=txt;}
function setHTML(id,html){const el=document.getElementById(id);if(el)el.innerHTML=html;}
function applyLang(l){
  lang=(l==="fr")?"fr":"en";
  try{localStorage.setItem("aes_lang",lang);}catch(e){}
  if(document.documentElement)document.documentElement.lang=lang;
  setHTML("ebadge",L().ebadge);
  setText("h1",L().h1);
  setHTML("sub",L().sub);
  setText("webCta",L().web);
  const qi=document.getElementById("q");if(qi)qi.placeholder=L().search;
  setText("browseLbl",L().browse);
  setText("swipeCue",L().swipe);
  setText("footT",L().footT);
  setText("footD",L().footD);
  setText("waAllTxt",L().waAll);
  setHTML("fineTxt",L().fine);
  setText("cartTitle",L().yourOrder);
  const wl=document.getElementById("waAll");if(wl)wl.href=waLink(null);
  buildPay();
  buildChips();
  render();
  updateFab();
  if(sheet.classList.contains("on"))renderCart();
  var tg=document.getElementById("langTog");
  if(tg)tg.querySelectorAll("button").forEach(b=>b.classList.toggle("on",b.dataset.lang===lang));
}
var langTog=document.getElementById("langTog");
if(langTog)langTog.addEventListener("click",e=>{const b=e.target.closest("button[data-lang]");if(b)applyLang(b.dataset.lang);});
applyLang(lang);
