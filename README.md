# AES Energy — Solar Panel Inventory (phone widget)

A mobile-friendly catalog of the used-panel inventory: browse by brand, search,
filter by condition, and tap **Enquire** to open WhatsApp with a pre-filled message.

## Add it to your phone home screen
1. Open the published link in **Safari** (iPhone) or **Chrome** (Android).
2. **iPhone:** tap Share → *Add to Home Screen*. **Android:** menu (⋮) → *Add to Home screen*.
3. It opens full-screen like an app, with the AES icon.

## Files
- `index.html` — page shell (for self-hosting, e.g. GitHub Pages).
- `assets.js` — inventory data (`ROWS`) + logo.
- `app.js` — rendering, search, filters, WhatsApp links.
- `aes-widget.html` — everything inlined into one file (this is what gets published).

## Editing the inventory
Open `assets.js` and edit the `ROWS` array. Each entry:
```js
{ brand, model, wattage, qty, condition, location, photo, notes, draft }
```
Set `draft: true` to hide a row. After editing, rebuild the single file:
```
node -e 'const fs=require("fs");const h=fs.readFileSync("index.html","utf8");
let b=(h.match(/<body>([\s\S]*?)<\/body>/)||["",""])[1].replace(/<script src="[^"]*"><\/script>\s*/g,"");
fs.writeFileSync("aes-widget.html",(h.match(/<style>[\s\S]*?<\/style>/)||[""])[0]+"\n"+b.trim()+
"\n<script>\n"+fs.readFileSync("assets.js")+"\n"+fs.readFileSync("app.js")+"\n</script>\n");'
```

## About the photos
The product images are currently **branded placeholders** (a navy panel motif with the
brand name) rather than real photos. To use real photos, give each row a `photo` value
that is an image URL or a `data:` URI, and update `panelSVG()` in `app.js` to return
`r.photo` when present. The simplest route is to host small image files next to these
files and reference them, e.g. `photo:"assets/rooftop.jpg"`.
