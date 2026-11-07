/* service worker — אופליין מלא אחרי הטעינה הראשונה; גרסה חדשה מתעדכנת ברקע */
const VER="v0.8.1";
const CORE=["./","index.html","style.css","content.js","mechanics.js","strokes.js","engine2.js","app.js","games2.js","pics-manifest.js","audio-manifest.js","manifest.webmanifest","icons/icon-192.png","icons/icon-512.png","icons/icon-180.png","sfx/ok.m4a","sfx/wrong.m4a","sfx/level.m4a","sfx/coin.m4a","sfx/tick.m4a"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(VER).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==VER).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{const u=new URL(e.request.url);if(e.request.method!=="GET")return;
 if(u.origin!==location.origin){/* פונטים: רשת ואז מטמון */e.respondWith(caches.open(VER+"-ext").then(c=>fetch(e.request).then(r=>{c.put(e.request,r.clone());return r}).catch(()=>c.match(e.request))));return}
 /* קבצי אודיו: מטמון-תחילה ושמירה; קוד: רשת-תחילה עם נפילה למטמון */
 if(u.pathname.indexOf("/audio/")>=0){e.respondWith(caches.open(VER).then(c=>c.match(e.request).then(r=>r||fetch(e.request).then(x=>{c.put(e.request,x.clone());return x}))));return}
 e.respondWith(fetch(e.request).then(r=>{const cp=r.clone();caches.open(VER).then(c=>c.put(e.request,cp));return r}).catch(()=>caches.match(e.request).then(r=>r||caches.match("./"))))});
