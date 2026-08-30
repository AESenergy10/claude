#!/usr/bin/env python3
"""
Build a PASSWORD-ENCRYPTED standalone dashboard for public hosting.

The transaction data is encrypted with AES-256-GCM using a key derived from a
password (PBKDF2-SHA256). The output HTML contains ONLY ciphertext — without the
password there is nothing readable in the page source. Decryption happens in the
browser via WebCrypto when the correct password is entered.

Usage:
    AESDASH_PW='your-password' python3 build_secure.py [output.html]

The password is read from the environment and is NEVER written into the file or
committed. Output defaults to ./secure.html.
"""
import os, sys, json, base64
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives import hashes

HERE = os.path.dirname(os.path.abspath(__file__))
PW = os.environ.get("AESDASH_PW")
if not PW:
    raise SystemExit("Set AESDASH_PW='your-password' in the environment.")
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "secure.html")
ITERS = 250000

# 1. encrypt embed.json
data = open(os.path.join(HERE, "embed.json"), "rb").read()
salt, iv = os.urandom(16), os.urandom(12)
key = PBKDF2HMAC(algorithm=hashes.SHA256(), length=32, salt=salt, iterations=ITERS).derive(PW.encode())
ct = AESGCM(key).encrypt(iv, data, None)
b64 = lambda b: base64.b64encode(b).decode()
cipher = {"s": b64(salt), "i": b64(iv), "c": b64(ct), "n": ITERS}

# 2. transform the widget template into a password-gated app
tpl = open(os.path.join(HERE, "widget.html")).read()
tpl = tpl.replace('<script id="data" type="application/json">__DATA__</script>\n', '')
tpl = tpl.replace(
    'const DATA = JSON.parse(document.getElementById(\'data\').textContent);',
    'function boot(){\nconst DATA = window.__AESDATA__;')
tpl = tpl.replace(
    "addEventListener('resize',()=>{clearTimeout(window._rz);window._rz=setTimeout(()=>RENDER[activeTab](),160);});\n</script>",
    "addEventListener('resize',()=>{clearTimeout(window._rz);window._rz=setTimeout(()=>RENDER[activeTab](),160);});\n} /* end boot */\n</script>")

# 3. lock screen markup + WebCrypto unlock logic
lock = '''<div id="lockscreen">
  <form id="lockform" autocomplete="off">
    <div class="lk-logo" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="#2a1c04" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17l5-6 4 4 5-7 4 5"/><path d="M3 21h18"/></svg></div>
    <h1>AESENERGY Ledger</h1>
    <p>This financial dashboard is protected. Enter the password to view it.</p>
    <input id="lockpw" type="password" placeholder="Password" autocomplete="current-password" aria-label="Password">
    <button type="submit" id="lockbtn">Unlock</button>
    <div id="lockerr" role="alert"></div>
  </form>
</div>
<style>
#lockscreen{position:fixed;inset:0;z-index:9999;display:grid;place-items:center;padding:24px;
  background:#f4f2ec;color:#1b1c19;font-family:"IBM Plex Sans",system-ui,sans-serif}
@media (prefers-color-scheme:dark){#lockscreen{background:#0e0e0c;color:#f5f3ea}}
#lockform{width:min(360px,100%);text-align:center;display:flex;flex-direction:column;gap:12px;align-items:center}
#lockscreen .lk-logo{width:52px;height:52px;border-radius:14px;display:grid;place-items:center;
  background:linear-gradient(150deg,#b5720b,#e0a53a);margin-bottom:4px}
#lockscreen .lk-logo svg{width:30px;height:30px}
#lockscreen h1{font-family:"Fraunces",Georgia,serif;font-weight:600;font-size:24px;margin:0}
#lockscreen p{font-size:13.5px;color:#5b5a52;margin:0 0 6px;line-height:1.5}
@media (prefers-color-scheme:dark){#lockscreen p{color:#c3c1b6}}
#lockpw{width:100%;padding:12px 14px;font-size:16px;border:1px solid #d9d5c8;border-radius:10px;
  background:#fffdf8;color:#1b1c19;font-family:inherit}
@media (prefers-color-scheme:dark){#lockpw{background:#1a1a17;border-color:#302f2a;color:#f5f3ea}}
#lockpw:focus{outline:2px solid #b5720b;outline-offset:1px;border-color:#b5720b}
#lockbtn{width:100%;padding:12px;font-size:15px;font-weight:700;border:0;border-radius:10px;
  background:#b5720b;color:#2a1c04;cursor:pointer;font-family:inherit}
#lockbtn:hover{filter:brightness(1.05)} #lockbtn:disabled{opacity:.6;cursor:default}
#lockerr{font-size:13px;color:#d6522b;min-height:18px;font-weight:600}
</style>
<script>
const CIPHER = __CIPHER__;
const b64d = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
async function tryUnlock(pw){
  const enc = new TextEncoder();
  const km = await crypto.subtle.importKey('raw', enc.encode(pw), 'PBKDF2', false, ['deriveKey']);
  const key = await crypto.subtle.deriveKey(
    {name:'PBKDF2', salt:b64d(CIPHER.s), iterations:CIPHER.n, hash:'SHA-256'},
    km, {name:'AES-GCM', length:256}, false, ['decrypt']);
  const pt = await crypto.subtle.decrypt({name:'AES-GCM', iv:b64d(CIPHER.i)}, key, b64d(CIPHER.c));
  return JSON.parse(new TextDecoder().decode(pt));   // throws if wrong password
}
function reveal(data){
  window.__AESDATA__ = data;
  const ls = document.getElementById('lockscreen'); if(ls) ls.remove();
  boot();
}
async function attempt(pw, silent){
  const err = document.getElementById('lockerr'), btn = document.getElementById('lockbtn');
  if(btn){btn.disabled = true; btn.textContent = 'Unlocking…';}
  try{
    const data = await tryUnlock(pw);
    try{ sessionStorage.setItem('aes_pw', pw); }catch(e){}
    reveal(data);
  }catch(e){
    if(!silent && err) err.textContent = 'Incorrect password.';
    if(btn){btn.disabled = false; btn.textContent = 'Unlock';}
    const pwi = document.getElementById('lockpw'); if(pwi && !silent){ pwi.select(); }
  }
}
document.getElementById('lockform').addEventListener('submit', e=>{
  e.preventDefault(); attempt(document.getElementById('lockpw').value, false);
});
// convenience: stay unlocked within the same browser session
(function(){ try{ const p = sessionStorage.getItem('aes_pw'); if(p) attempt(p, true); }catch(e){} })();
</script>
'''
lock = lock.replace("__CIPHER__", json.dumps(cipher))
tpl = tpl.replace('<div class="top">', lock + '<div class="top">', 1)

# 4. wrap as a standalone HTML document (charset + mobile viewport)
i = tpl.index('<div id="lockscreen">')
head, body = tpl[:i].rstrip(), tpl[i:]
icons = (
  '<link rel="apple-touch-icon" href="apple-touch-icon.png">\n'
  '<link rel="icon" type="image/png" sizes="512x512" href="icon-512.png">\n'
  '<link rel="icon" type="image/png" sizes="32x32" href="favicon-32.png">\n'
  '<link rel="manifest" href="manifest.webmanifest">\n'
  '<meta name="apple-mobile-web-app-capable" content="yes">\n'
  '<meta name="mobile-web-app-capable" content="yes">\n'
  '<meta name="apple-mobile-web-app-status-bar-style" content="default">\n'
  '<meta name="apple-mobile-web-app-title" content="AES Ledger">\n'
  '<meta name="application-name" content="AES Ledger">\n'
  '<meta name="theme-color" content="#b5720b">\n')
doc = ("<!doctype html>\n<html lang=\"en\">\n<head>\n"
       "<meta charset=\"utf-8\">\n"
       "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1, viewport-fit=cover\">\n"
       + icons +
       "<style>*{box-sizing:border-box}html{-webkit-text-size-adjust:100%}img{max-width:100%}[hidden]{display:none!important}</style>\n"
       + head + "\n</head>\n<body>\n" + body + "\n</body>\n</html>\n")
open(OUT, "w").write(doc)
print(f"Wrote {OUT} ({len(doc):,} bytes) — encrypted, PBKDF2 iters={ITERS}")
