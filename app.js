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

/* App icons (used when self-hosted and added to home screen) */
(function(){var a=document.getElementById("appleIcon"),f=document.getElementById("favIcon");if(a)a.href=LOGO;if(f)f.href=LOGO;})();

/* Logo, with graceful fallback */
(function(){var el=document.getElementById("logo");el.onerror=function(){el.onerror=null;el.src=wordmarkSVG();};el.src=LOGO;})();

/* Hero background */
document.getElementById("heroBg").src=(typeof PHOTOS!=="undefined"&&PHOTOS.pallets&&PHOTOS.pallets.src)||catArt({category:"Solar Panels",brand:"AES Energy"});

function wa(m){return "https://wa.me/"+WHATSAPP+"?text="+encodeURIComponent(m);}
function waLink(r){
  if(!r) return wa("Hello AES Energy, please send me your current export inventory (cars, solar panels, used clothes, shoes, bicycles).");
  const b=r.badge?(" ("+r.badge+")"):"";
  return wa(`Hello AES Energy, I'm interested in: ${r.brand}${b} — ${r.category}. Qty available: ${r.qty} ${r.unit||""}. Please send price & details.`);
}
document.getElementById("waAll").href=waLink(null);

/* Pay with card (Stripe secure checkout) — for any listing. Shows when PAY_URL is set. */
const PAY=(typeof PAY_URL!=="undefined"&&PAY_URL)?PAY_URL:"";
const cardIcon='<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>';
(function(){
  if(!PAY)return; var w=document.getElementById("payWrap"); if(!w)return;
  w.innerHTML='<a class="pay" href="'+PAY+'" target="_blank" rel="noreferrer">'
    +'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>'
    +'Pay by card (Visa / Mastercard)</a>'
    +'<div class="paynote">Secure checkout by Stripe · enter your amount. We never see your card details.</div>';
})();

const order=(typeof CATEGORY_ORDER!=="undefined")?CATEGORY_ORDER:[];
const cats=order.filter(c=>live.some(r=>r.category===c)).concat([...new Set(live.map(r=>r.category))].filter(c=>order.indexOf(c)<0));
function catColor(c){return (typeof CATEGORY_COLORS!=="undefined"&&CATEGORY_COLORS[c])||"#1B2C4A";}

function stats(){
  const units=live.reduce((a,r)=>a+(+r.qty||0),0);
  const locs=new Set(live.map(r=>r.location).filter(Boolean)).size;
  return [[live.length,"Listings"],[cats.length,"Categories"],[units.toLocaleString(),"Units in stock"],[locs,"Locations"]];
}
document.getElementById("stats").innerHTML=stats().map(([v,l])=>`<div class="stat"><b>${v}</b><span>${l}</span></div>`).join("");

document.getElementById("catChips").innerHTML=["All",...cats].map(c=>`<button class="chip" data-cat="${esc(c)}">${esc(c)}</button>`).join("");

function card(r){
  const ph=(typeof PHOTOS!=="undefined")?PHOTOS[r.photo]:null;
  const src=ph&&ph.src?ph.src:catArt(r);
  const avail=r.qty?((+r.qty).toLocaleString()+(r.unit?" "+r.unit:"")):"Ask";
  return `<div class="card"><div class="shot" data-src="${src}">
 <img src="${src}" alt="${esc(r.brand)} — ${esc(r.category)}" loading="lazy">
 <div class="fade"></div><span class="tag" style="background:${COND_COLORS[r.condition]||"#8A93A6"}">${esc(r.condition)}</span>
 ${r.badge?`<span class="watt">${esc(r.badge)}</span>`:""}</div>
 <div class="body"><div class="b">${esc(r.brand)}</div>${r.model?`<div class="m">${esc(r.model)}</div>`:""}
 <div class="facts"><div><div class="k">Available</div><div class="v">${esc(avail)}</div></div>
 ${r.location?`<div><div class="k">Location</div><div class="v" style="font-weight:700">${esc(r.location)}</div></div>`:""}</div>
 ${r.notes?`<div class="note">${esc(r.notes)}</div>`:""}
 <div class="wa"><a href="${waLink(r)}" target="_blank" rel="noreferrer">
 <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 00-8.6 15L2 22l5.2-1.4A10 10 0 1012 2zm5.8 14.2c-.2.7-1.4 1.3-2 1.4-.5.1-1.1.1-1.8-.1-.4-.1-1-.3-1.7-.6-3-1.3-4.9-4.3-5-4.5-.2-.2-1.2-1.6-1.2-3s.7-2.1 1-2.4c.3-.3.6-.4.8-.4h.6c.2 0 .4 0 .7.5l.9 2.2c.1.2 0 .4-.1.5l-.4.5c-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.1 1 2.1 1.3 2.4 1.5.3.1.4.1.6-.1l.8-1c.2-.2.4-.2.6-.1l2.1 1c.3.1.5.2.5.3.1.2.1.7-.1 1.4z"/></svg>
 Enquire</a>${PAY?`<a class="pc" href="${PAY}" target="_blank" rel="noreferrer">${cardIcon} Pay with card</a>`:""}</div></div></div>`;
}

function render(){const s=q.trim().toLowerCase();
  const shown=live.filter(r=>(condF==="All"||r.condition===condF)&&(catF==="All"||r.category===catF)&&(!s||[r.brand,r.model,r.category,r.badge,r.location].join(" ").toLowerCase().includes(s)));
  const groups=cats.filter(c=>shown.some(r=>r.category===c)).map(c=>[c,shown.filter(r=>r.category===c)]);
  document.getElementById("list").innerHTML= shown.length? groups.map(([c,items])=>{
    const u=items.reduce((a,r)=>a+(+r.qty||0),0);
    return `<div class="bsec"><div class="bhead"><div class="dot" style="background:${catColor(c)}"></div>
    <div style="min-width:0;flex:1"><div class="n">${esc(c)}</div><div class="w">${items.length} listing${items.length>1?"s":""}</div></div>
    <div class="r"><b>${u.toLocaleString()}</b><span>in stock</span></div></div>
    <div class="grid">${items.map(card).join("")}</div></div>`;}).join("")
   : `<div class="empty">Nothing matches this search. Clear the filters to see everything.</div>`;
  document.querySelectorAll(".chip").forEach(e=>e.classList.toggle("on",e.dataset.cat===catF));
}

document.getElementById("q").addEventListener("input",e=>{q=e.target.value;render();});
document.getElementById("catChips").addEventListener("click",e=>{const b=e.target.closest(".chip");if(b){catF=b.dataset.cat;render();}});

const lb=document.getElementById("lb"),lbImg=document.getElementById("lbImg");
document.getElementById("list").addEventListener("click",e=>{const s=e.target.closest(".shot");if(s&&s.dataset.src){lbImg.src=s.dataset.src;lb.classList.add("on");}});
lb.addEventListener("click",()=>lb.classList.remove("on"));

render();
