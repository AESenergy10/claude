/* AES Energy inventory — UI logic. Data & logo live in assets.js */

/* Brand tint for the section dot / placeholder accent */
function tint(b){if(TINT[b])return TINT[b];if(!b)return "#1B2C4A";let h=0;for(let i=0;i<b.length;i++)h=(h*31+b.charCodeAt(i))>>>0;return FALL[h%FALL.length];}

/* Branded placeholder image (SVG data URI). Not a photo — a panel motif with the brand name.
   Swap these for real photos by giving each row a `photo` URL (see README). */
function panelSVG(r,w,h){
  w=w||336;h=h||264;
  const bg=tint(r.brand),gold="#F5A800";
  const cols=6,rows=Math.round(cols*h/w);
  let cells="";
  for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){
    cells+=`<rect x="${x*(w/cols)+3}" y="${y*(h/rows)+3}" width="${w/cols-6}" height="${h/rows-6}" rx="2" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.09)"/>`;
  }
  const label=(r.brand||"AES Energy");
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">`
    +`<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${bg}"/><stop offset="1" stop-color="#0E1A30"/></linearGradient></defs>`
    +`<rect width="${w}" height="${h}" fill="url(#g)"/>${cells}`
    +`<rect x="0" y="${h-34}" width="${w}" height="34" fill="rgba(8,14,26,0.55)"/>`
    +`<circle cx="26" cy="${h-17}" r="7" fill="${gold}"/>`
    +`<text x="42" y="${h-12}" fill="#EEF1F6" font-family="-apple-system,Segoe UI,sans-serif" font-size="13" font-weight="700">${label.replace(/&/g,"&amp;").replace(/</g,"&lt;")}</text>`
    +`</svg>`;
  return "data:image/svg+xml,"+encodeURIComponent(svg);
}

/* Fallback wordmark if the embedded logo image fails to decode */
function wordmarkSVG(){
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="240" height="60" viewBox="0 0 240 60">`
    +`<circle cx="26" cy="30" r="15" fill="none" stroke="#F5A800" stroke-width="3"/>`
    +`<circle cx="26" cy="30" r="5" fill="#F5A800"/>`
    +`<text x="52" y="27" fill="#1A2744" font-family="-apple-system,Segoe UI,sans-serif" font-size="21" font-weight="900" letter-spacing="1">AES ENERGY</text>`
    +`<text x="52" y="46" fill="#8A93A6" font-family="-apple-system,Segoe UI,sans-serif" font-size="10.5" font-weight="700" letter-spacing="2">GLOBAL TRADE &amp; SOLAR</text></svg>`;
  return "data:image/svg+xml,"+encodeURIComponent(svg);
}

const live=ROWS.filter(r=>!r.draft);
let q="",brandF="All",condF="All";

/* App icons (used when self-hosted and added to home screen) */
(function(){var a=document.getElementById("appleIcon"),f=document.getElementById("favIcon");if(a)a.href=LOGO;if(f)f.href=LOGO;})();

/* Logo, with graceful fallback */
(function(){
  var el=document.getElementById("logo");
  el.onerror=function(){el.onerror=null;el.src=wordmarkSVG();};
  el.src=LOGO;
})();

/* Hero background — real yard photo, SVG fallback */
document.getElementById("heroBg").src=(typeof PHOTOS!=="undefined"&&PHOTOS.pallets&&PHOTOS.pallets.src)||panelSVG({brand:"AES Energy"},720,320);

const esc=s=>String(s||"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
function waLink(r){const m=r?`Hello AES Energy, I am interested in the ${r.brand} ${r.wattage}W used panels${r.model?" ("+r.model+")":""} from your inventory. Please send me the details.`:"Hello AES Energy, I would like to receive your current used solar panel inventory.";return "https://wa.me/"+WHATSAPP+"?text="+encodeURIComponent(m);}
document.getElementById("waAll").href=waLink(null);

const brands=[...new Set(live.map(r=>r.brand))].sort((a,b)=>a===PINNED?-1:b===PINNED?1:a.localeCompare(b));

function stats(){const u=live.reduce((a,r)=>a+(+r.qty||0),0);const kw=live.reduce((a,r)=>a+(+r.qty||0)*(+r.wattage||0),0)/1000;
 return [[u.toLocaleString(),"Panels"],[Math.round(kw).toLocaleString()+" kW","Capacity"],["~"+Math.floor(u/PER_CONTAINER),"Containers"],[brands.length,"Brands"]];}
document.getElementById("stats").innerHTML=stats().map(([v,l])=>`<div class="stat"><b>${v}</b><span>${l}</span></div>`).join("");

document.getElementById("brandChips").innerHTML=["All",...brands].map(b=>`<button class="chip" data-b="${esc(b)}">${esc(b)}</button>`).join("");
document.getElementById("condChips").innerHTML=["All","Used","New"].map(c=>`<button class="cond" data-c="${c}">${c}</button>`).join("");

function card(r){const ph=(typeof PHOTOS!=="undefined")?PHOTOS[r.photo]:null;const src=ph&&ph.src?ph.src:panelSVG(r);
 return `<div class="card"><div class="shot" data-src="${src}">
 <img src="${src}" alt="${esc(r.brand)} ${esc(r.wattage)}W used solar panel" loading="lazy">
 <div class="fade"></div><span class="tag" style="background:${COND_COLORS[r.condition]||"#8A93A6"}">${esc(r.condition)}</span>
 ${r.wattage?`<span class="watt">${esc(r.wattage)}W</span>`:""}</div>
 <div class="body"><div class="b">${esc(r.brand)}</div>${r.model?`<div class="m">${esc(r.model)}</div>`:""}
 <div class="facts"><div><div class="k">Available</div><div class="v">${r.qty?(+r.qty).toLocaleString():"Ask"}</div></div>
 ${r.location?`<div><div class="k">Location</div><div class="v" style="font-weight:700">${esc(r.location)}</div></div>`:""}</div>
 ${r.notes?`<div class="note">${esc(r.notes)}</div>`:""}
 <div class="wa"><a href="${waLink(r)}" target="_blank" rel="noreferrer">
 <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 00-8.6 15L2 22l5.2-1.4A10 10 0 1012 2zm5.8 14.2c-.2.7-1.4 1.3-2 1.4-.5.1-1.1.1-1.8-.1-.4-.1-1-.3-1.7-.6-3-1.3-4.9-4.3-5-4.5-.2-.2-1.2-1.6-1.2-3s.7-2.1 1-2.4c.3-.3.6-.4.8-.4h.6c.2 0 .4 0 .7.5l.9 2.2c.1.2 0 .4-.1.5l-.4.5c-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.1 1 2.1 1.3 2.4 1.5.3.1.4.1.6-.1l.8-1c.2-.2.4-.2.6-.1l2.1 1c.3.1.5.2.5.3.1.2.1.7-.1 1.4z"/></svg>
 Enquire</a></div></div></div>`;}

function render(){const s=q.trim().toLowerCase();
 const shown=live.filter(r=>(condF==="All"||r.condition===condF)&&(brandF==="All"||r.brand===brandF)&&(!s||[r.brand,r.model,r.wattage,r.location,r.condition].join(" ").toLowerCase().includes(s)));
 const m={};shown.forEach(r=>{(m[r.brand]=m[r.brand]||[]).push(r);});
 const groups=Object.entries(m).sort((a,b)=>a[0]===PINNED?-1:b[0]===PINNED?1:a[0].localeCompare(b[0]));
 document.getElementById("list").innerHTML= shown.length? groups.map(([b,items])=>{
   const u=items.reduce((a,r)=>a+(+r.qty||0),0);
   const w=items.map(r=>+r.wattage||0).filter(Boolean).sort((x,y)=>y-x);
   return `<div class="bsec"><div class="bhead"><div class="dot" style="background:${tint(b)}"></div>
   <div style="min-width:0;flex:1"><div class="n">${esc(b)}</div><div class="w">${w.length?w.join("W · ")+"W":"Wattage on request"}</div></div>
   <div class="r"><b>${u?u.toLocaleString():items.length}</b><span>${u?"panels":"models"}</span></div></div>
   <div class="grid">${items.sort((x,y)=>(+y.wattage||0)-(+x.wattage||0)).map(card).join("")}</div></div>`;}).join("")
  : `<div class="empty">No panels match this search. Clear the filters to see everything.</div>`;
 document.querySelectorAll(".chip").forEach(e=>e.classList.toggle("on",e.dataset.b===brandF));
 document.querySelectorAll(".cond").forEach(e=>e.classList.toggle("on",e.dataset.c===condF));
}

document.getElementById("q").addEventListener("input",e=>{q=e.target.value;render();});
document.getElementById("brandChips").addEventListener("click",e=>{const b=e.target.closest(".chip");if(b){brandF=b.dataset.b;render();}});
document.getElementById("condChips").addEventListener("click",e=>{const b=e.target.closest(".cond");if(b){condF=b.dataset.c;render();}});

const lb=document.getElementById("lb"),lbImg=document.getElementById("lbImg");
document.getElementById("list").addEventListener("click",e=>{const s=e.target.closest(".shot");if(s&&s.dataset.src){lbImg.src=s.dataset.src;lb.classList.add("on");}});
lb.addEventListener("click",()=>lb.classList.remove("on"));

render();
