const fs=require('node:fs'), path=require('node:path');
const root=path.resolve('.'), target=path.join(root,'qa-output/mobile-app');
fs.mkdirSync(target,{recursive:true});
for(const file of ['app','components','lib','public','package.json','package-lock.json','tsconfig.json','next-env.d.ts','postcss.config.mjs']) fs.cpSync(path.join(root,file),path.join(target,file),{recursive:true});
fs.writeFileSync(path.join(target,'next.config.ts'),fs.readFileSync(path.join(root,'next.config.ts'),'utf8').replace('value: "DENY"','value: "SAMEORIGIN"'));
const analytics=path.join(target,'components/analytics.tsx');
fs.writeFileSync(analytics,fs.readFileSync(analytics,'utf8').replace('`https://www.googletagmanager.com/gtag/js?id=${gaId}`','"/qa-gtag.js"'));
fs.writeFileSync(path.join(target,'.env.local'), 'NEXT_PUBLIC_INDEXABLE=false\nNEXT_PUBLIC_GA_ID=G-QATEST1234\nHELLOFRESH_AFFILIATE_URL=https://adtr.co/qa-hellofresh\nGODTLEVERT_AFFILIATE_URL=https://adtr.co/qa-godtlevert\n');
fs.writeFileSync(path.join(target,'public/qa-gtag.js'), `(()=>{const panel=document.createElement('pre');panel.id='qa-events';panel.setAttribute('aria-label','QA målehendelser');panel.style.cssText='white-space:pre-wrap;overflow-wrap:anywhere;padding:12px;font-size:12px';document.body.append(panel);const records=[];const record=(...args)=>{records.push(args);sessionStorage.setItem("qa-events",JSON.stringify(records));panel.textContent=JSON.stringify(records,null,2)};for(const entry of window.dataLayer||[])record(...entry);window.gtag=record;})();`);
fs.writeFileSync(path.join(target,'public/responsive-qa.html'),`<!doctype html><html lang="nb"><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>QA 360 / 390 / 430</title><style>body{margin:0;background:#eee;font:16px Arial}main{display:flex;gap:12px;width:1260px;padding:8px}iframe{border:0;background:white;height:844px}h1{font-size:16px}section{flex:none}</style></head><body><main>${[360,390,430].map(w=>`<section><h1>${w} px</h1><iframe title="Mobil ${w}" width="${w}" src="/"></iframe></section>`).join('')}</main></body></html>`);
console.log('Isolated QA copy: mock GA transport and SAMEORIGIN only in '+target);

const outbound=path.join(target,'components/outbound.tsx');
fs.writeFileSync(outbound,fs.readFileSync(outbound,'utf8').replace('href={`/go/${id}?placement=${placement}`}', 'href={`/qa-exit.html?provider=${id}&placement=${placement}`}'));
const chrome=path.join(target,'components/chrome.tsx');fs.writeFileSync(chrome,fs.readFileSync(chrome,'utf8').replace('href="https://middagen.no/"','href="/qa-exit.html?sibling=middagen"'));
fs.writeFileSync(path.join(target,'public/qa-exit.html'),'<html lang="nb"><title>QA lenkeklikk</title><h1>Lokalt testmål</h1><pre id="qa-events" style="white-space:pre-wrap;overflow-wrap:anywhere"></pre><script>document.getElementById("qa-events").textContent=JSON.stringify(JSON.parse(sessionStorage.getItem("qa-events")||"[]"),null,2)</script></html>');
