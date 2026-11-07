/* mechanics.js — מכניקות משחק: עקיבת-אותיות (כתיבה), חבר-את-הנקודות, נתיב-קצב, אולפן-מוזיקה, סינתזה. Safari 15. */
"use strict";

/* ---------- סינתזה: תווים, מעריצים, ג'ינגלים ---------- */
const PENTA=[261.63,293.66,329.63,392,440,523.25,587.33,659.25,783.99,880];
function ctx(){try{ac=ac||new (window.AudioContext||window.webkitAudioContext)();if(ac.state==="suspended")ac.resume();return ac}catch(e){return null}}
function note(freq,inst,when,dur){if(!S.sound)return;const a=ctx();if(!a)return;inst=inst||"piano";const t=(when||0)+a.currentTime;dur=dur||.5;
 const g=a.createGain();g.connect(a.destination);
 const osc=a.createOscillator();osc.frequency.value=freq;
 if(inst==="piano"){osc.type="triangle";g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.22,t+.01);g.gain.exponentialRampToValueAtTime(.0001,t+dur);osc.connect(g)}
 else if(inst==="marimba"){osc.type="sine";const o2=a.createOscillator();o2.type="sine";o2.frequency.value=freq*4;const g2=a.createGain();g2.gain.setValueAtTime(.06,t);g2.gain.exponentialRampToValueAtTime(.0001,t+.12);o2.connect(g2);g2.connect(a.destination);o2.start(t);o2.stop(t+.2);
  g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.3,t+.005);g.gain.exponentialRampToValueAtTime(.0001,t+dur*.7);osc.connect(g)}
 else if(inst==="synth"){osc.type="sawtooth";const f=a.createBiquadFilter();f.type="lowpass";f.frequency.setValueAtTime(freq*6,t);f.frequency.exponentialRampToValueAtTime(freq*1.5,t+dur);osc.connect(f);f.connect(g);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.14,t+.02);g.gain.exponentialRampToValueAtTime(.0001,t+dur)}
 else{/* bell */osc.type="sine";const o2=a.createOscillator();o2.type="sine";o2.frequency.value=freq*2.76;const g2=a.createGain();g2.gain.setValueAtTime(.08,t);g2.gain.exponentialRampToValueAtTime(.0001,t+dur*1.5);o2.connect(g2);g2.connect(a.destination);o2.start(t);o2.stop(t+dur*1.6);
  g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.22,t+.005);g.gain.exponentialRampToValueAtTime(.0001,t+dur*1.6);osc.connect(g)}
 osc.start(t);osc.stop(t+dur*1.7)}
function cheer(){if(!S.sound)return;const a=ctx();if(!a)return;const t=a.currentTime;const buf=a.createBuffer(1,a.sampleRate*1.2,a.sampleRate);const d=buf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/d.length,2);
 const src=a.createBufferSource();src.buffer=buf;const f=a.createBiquadFilter();f.type="bandpass";f.frequency.value=1800;f.Q.value=.6;const g=a.createGain();g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.25,t+.15);g.gain.exponentialRampToValueAtTime(.0001,t+1.1);src.connect(f);f.connect(g);g.connect(a.destination);src.start(t)}
function jingle(kind){if(!S.sound)return;const seq=kind==="win"?[0,2,4,7,9,7,9]:kind==="level"?[0,4,7,9,12]:[0,2,4];seq.forEach((n,i)=>note(PENTA[0]*Math.pow(2,n/12),"bell",i*.12,.5))}
function comboNote(n){note(PENTA[Math.min(PENTA.length-1,n)],"marimba",0,.45)}
function flyTo(fromEl,toEl,text){try{const a=fromEl.getBoundingClientRect(),b=toEl.getBoundingClientRect();const el=document.createElement("div");el.className="flyer";el.textContent=text;el.style.left=(a.left+a.width/2-20)+"px";el.style.top=(a.top+a.height/2-14)+"px";
 el.style.setProperty("--dx",(b.left+b.width/2-(a.left+a.width/2))+"px");el.style.setProperty("--dy",(b.top+b.height/2-(a.top+a.height/2))+"px");document.body.appendChild(el);setTimeout(()=>el.remove(),900)}catch(e){}}
function shakeScreen(){const el=document.getElementById("app");el.classList.remove("shake");void el.offsetWidth;el.classList.add("shake")}

/* ---------- עקיבה (כתיבה) ---------- */
function setupTrace(q,wrap,onDone){const W=wrap.clientWidth||340,H=W;const dpr=Math.min(2,window.devicePixelRatio||1);
 const mk=()=>{const c=document.createElement("canvas");c.width=W*dpr;c.height=H*dpr;wrap.appendChild(c);const x=c.getContext("2d");x.scale(dpr,dpr);return[c,x]};
 const base=mk(),ink=mk(),glit=mk();const off=document.createElement("canvas");off.width=W;off.height=H;const ox=off.getContext("2d");
 const font=(q.font||"Arial Hebrew")+",Arial,sans-serif";const size=q.glyph.length>1?Math.min(H*.5,W*1.1/q.glyph.length):H*.8;
 const draw=(x,fill,stroke)=>{x.font="bold "+size+"px "+font;x.textAlign="center";x.textBaseline="middle";x.direction=q.dir||"rtl";if(fill){x.fillStyle=fill;x.fillText(q.glyph,W/2,H/2+size*.06)}if(stroke){x.lineWidth=stroke[1];x.strokeStyle=stroke[0];x.lineJoin="round";x.strokeText(q.glyph,W/2,H/2+size*.06)}};
 /* מסכה: הגליף + הרחבה (לסלחנות) */
 draw(ox,"#000",["#000",26]);const mask=ox.getImageData(0,0,W,H).data;const inMask=(x,y)=>{x|=0;y|=0;if(x<0||y<0||x>=W||y>=H)return false;return mask[(y*W+x)*4+3]>0};
 ox.clearRect(0,0,W,H);draw(ox,"#000",null);const core=ox.getImageData(0,0,W,H).data;const pts=[];for(let y=0;y<H;y+=7)for(let x=0;x<W;x+=7)if(core[(y*W+x)*4+3]>0)pts.push([x,y]);
 /* רקע: אות בהירה + קו מקווקו */
 base[1].setLineDash([8,8]);draw(base[1],"#efe9ff",["#b9a8ee",3]);base[1].setLineDash([]);
 /* נקודת התחלה (ימין-למעלה לעברית) */
 const first=pts.length?pts.reduce((a,b)=>(q.dir==="ltr"?(b[0]-b[1]*.6<a[0]-a[1]*.6):(b[0]+b[1]*-.6>a[0]+a[1]*-.6))?b:a):null;
 if(first){base[1].fillStyle="#3fbf6f";base[1].beginPath();base[1].arc(first[0],first[1],9,0,Math.PI*2);base[1].fill()}
 const ix=ink[1];ix.lineCap="round";ix.lineJoin="round";ix.lineWidth=26;ix.strokeStyle=q.color||"#ff5fa2";
 const gx=glit[1];let strokes=[],cur=null,down=false,ups=0,done=false,raf=null;
 const cover=()=>{if(!pts.length)return 0;const grid={};strokes.forEach(s=>s.forEach(p=>{const k=((p[0]/20)|0)+":"+((p[1]/20)|0);grid[k]=1}));let hit=0;pts.forEach(p=>{const gx0=(p[0]/20)|0,gy0=(p[1]/20)|0;for(let dx=-1;dx<=1&&!0;dx++)for(let dy=-1;dy<=1;dy++)if(grid[(gx0+dx)+":"+(gy0+dy)]){hit++;return}});return hit/pts.length};
 const outside=()=>{let n=0,o=0;strokes.forEach(s=>s.forEach(p=>{n++;if(!inMask(p[0],p[1]))o++}));return n?o/n:0};
 const pos=e=>{const r=wrap.getBoundingClientRect();const t=e.touches?e.touches[0]:e;return[(t.clientX-r.left)*W/r.width,(t.clientY-r.top)*H/r.height]};
 const sparkle=(p)=>{for(let i=0;i<3;i++){gx.fillStyle=["#ffc23d","#2ee6d6","#fff","#ff5fa2"][i%4];gx.globalAlpha=.9;gx.beginPath();gx.arc(p[0]+(Math.random()-.5)*34,p[1]+(Math.random()-.5)*34,Math.random()*3+1.5,0,Math.PI*2);gx.fill()}gx.globalAlpha=1;if(!raf)fade()};
 const fade=()=>{gx.globalCompositeOperation="destination-out";gx.globalAlpha=.08;gx.fillRect(0,0,W,H);gx.globalCompositeOperation="source-over";gx.globalAlpha=1;raf=requestAnimationFrame(fade)};
 const start=e=>{if(done)return;e.preventDefault();down=true;cur=[pos(e)];strokes.push(cur);ix.beginPath();ix.moveTo(cur[0][0],cur[0][1]);tick()};
 const move=e=>{if(!down||done)return;e.preventDefault();const p=pos(e);cur.push(p);ix.lineTo(p[0],p[1]);ix.stroke();ix.beginPath();ix.moveTo(p[0],p[1]);sparkle(p)};
 const end=e=>{if(!down)return;down=false;ups++;const c=cover(),o=outside();
  if(c>=.6&&o<=.45||(ups>=3&&c>=.35)){done=true;cancelAnimationFrame(raf);raf=null;ix.globalCompositeOperation="source-in";const g=ix.createLinearGradient(0,0,W,H);g.addColorStop(0,"#ffc23d");g.addColorStop(1,"#ff5fa2");ix.fillStyle=g;ix.fillRect(0,0,W,H);ix.globalCompositeOperation="source-over";onDone(true,c>=.8&&o<=.25?3:c>=.6?2:1)}
  else if(ups>=2){toast(c<.6?"עוד קצת! עברי על כל האות 💪":"נסי להישאר בתוך האות ✏️",1800)}};
 wrap.addEventListener("touchstart",start,{passive:false});wrap.addEventListener("touchmove",move,{passive:false});wrap.addEventListener("touchend",end);wrap.addEventListener("touchcancel",end);
 wrap.addEventListener("mousedown",start);wrap.addEventListener("mousemove",move);window.addEventListener("mouseup",end);
 return{clear(){if(done)return;strokes=[];ix.clearRect(0,0,W,H);gx.clearRect(0,0,W,H)}}}

/* ---------- חבר-את-הנקודות ---------- */
const DOT_SHAPES={
 star:{e:"⭐",p:[[.5,.05],[.62,.37],[.95,.38],[.68,.58],[.78,.92],[.5,.72],[.22,.92],[.32,.58],[.05,.38],[.38,.37]]},
 heart:{e:"❤️",p:[[.5,.3],[.62,.15],[.8,.12],[.93,.28],[.9,.5],[.72,.72],[.5,.92],[.28,.72],[.1,.5],[.07,.28],[.2,.12],[.38,.15]]},
 house:{e:"🏠",p:[[.5,.08],[.9,.42],[.78,.42],[.78,.9],[.22,.9],[.22,.42],[.1,.42]]},
 fish:{e:"🐟",p:[[.1,.5],[.3,.28],[.55,.22],[.75,.35],[.78,.5],[.75,.65],[.55,.78],[.3,.72],[.1,.5],[.92,.3],[.92,.7]]},
 boat:{e:"⛵",p:[[.5,.08],[.52,.6],[.85,.6],[.92,.7],[.8,.9],[.2,.9],[.08,.7],[.15,.6],[.48,.6]]},
 tree:{e:"🌳",p:[[.5,.06],[.78,.38],[.66,.38],[.88,.66],[.58,.66],[.58,.92],[.42,.92],[.42,.66],[.12,.66],[.34,.38],[.22,.38]]},
 mic:{e:"🎤",p:[[.42,.08],[.58,.08],[.66,.2],[.66,.42],[.58,.52],[.52,.56],[.52,.8],[.68,.9],[.32,.9],[.48,.8],[.48,.56],[.42,.52],[.34,.42],[.34,.2]]}};
function setupDots(q,wrap,onDone){const W=wrap.clientWidth||340,H=W;const dpr=Math.min(2,window.devicePixelRatio||1);
 const c=document.createElement("canvas");c.width=W*dpr;c.height=H*dpr;wrap.appendChild(c);const x=c.getContext("2d");x.scale(dpr,dpr);
 const shp=DOT_SHAPES[q.shape];const P=shp.p.slice(0,q.labels.length).map(p=>[p[0]*(W-40)+20,p[1]*(H-40)+20]);let i=0,done=false,pulse=0,raf=null;
 const render=()=>{x.clearRect(0,0,W,H);
  if(done){const g=x.createLinearGradient(0,0,W,H);g.addColorStop(0,"#ffd45e");g.addColorStop(1,"#ff8ac0");x.fillStyle=g;x.beginPath();P.forEach((p,k)=>k?x.lineTo(p[0],p[1]):x.moveTo(p[0],p[1]));x.closePath();x.fill()}
  x.lineWidth=6;x.strokeStyle="#3b1d8f";x.lineCap="round";x.beginPath();for(let k=0;k<i;k++){k?x.lineTo(P[k][0],P[k][1]):x.moveTo(P[k][0],P[k][1])}if(done)x.closePath();x.stroke();
  P.forEach((p,k)=>{const nxt=k===i&&!done;const r=nxt?16+Math.sin(pulse)*3:13;x.beginPath();x.arc(p[0],p[1],r,0,Math.PI*2);x.fillStyle=k<i||done?"#3fbf6f":nxt?"#ffc23d":"#fff";x.fill();x.lineWidth=3;x.strokeStyle=k<i||done?"#2a8a4e":"#3b1d8f";x.stroke();
   x.fillStyle=k<i||done?"#fff":"#1b1140";x.font="bold 15px Fredoka,Arial";x.textAlign="center";x.textBaseline="middle";x.fillText(q.labels[k],p[0],p[1]+1)});
  if(done){x.font="64px sans-serif";x.textAlign="center";x.textBaseline="middle";x.fillText(shp.e,W/2,H/2)}
  pulse+=.15;if(!done)raf=requestAnimationFrame(render)};
 const tap=e=>{if(done)return;e.preventDefault();const r=wrap.getBoundingClientRect();const t=e.changedTouches?e.changedTouches[0]:e;const px=(t.clientX-r.left)*W/r.width,py=(t.clientY-r.top)*H/r.height;
  let hit=-1;P.forEach((p,k)=>{if(Math.hypot(p[0]-px,p[1]-py)<30)hit=k});if(hit<0)return;
  if(hit===i){i++;comboNote(i-1);speak([q.labels[i-1].length>2?q.labels[i-1]:q.sayLabel?q.sayLabel(i-1):""].filter(Boolean));if(i===P.length){done=true;cancelAnimationFrame(raf);render();onDone(true,3)}}
  else{tone(false);toast("לא זה — חפשי את "+q.labels[i]+" ✨",1200)}};
 wrap.addEventListener("touchend",tap);wrap.addEventListener("click",e=>{if(!("ontouchstart" in window))tap(e)});render();
 return{}}

/* ---------- אולפן ---------- */
const INSTR=[{k:"piano",n:"פסנתר 🎹",cost:0},{k:"marimba",n:"מרימבה 🪘",cost:40},{k:"synth",n:"סינת׳ 🎛️",cost:120},{k:"bell",n:"פעמונים 🔔",cost:250}];
function studio(){view="studio";hush();S.inst=S.inst||"piano";S.owned=S.owned||["piano"];const labels=S.padLabels==="num"?["1","2","3","4","5","6","7","8"]:["א","ב","ג","ד","ה","ו","ז","ח"];
 const cols=["#ff6f61","#ffc23d","#3fbf6f","#2ee6d6","#1e88e5","#8e24aa","#ff5fa2","#fb8c00"];
 app.innerHTML=`<div class="panel"><button class="back" id="b">→ למפה</button><h2>האולפן של ${KID()} 🎧</h2>
 <p>לוחצים על הפדים ומנגנים! כלים חדשים נפתחים עם מעריצים.</p>
 <div class="inst">${INSTR.map(it=>`<button data-i="${it.k}" aria-pressed="${S.inst===it.k}" class="${S.owned.indexOf(it.k)<0?"locked":""}">${it.n}${S.owned.indexOf(it.k)<0?` · 👥${it.cost}`:""}</button>`).join("")}</div>
 <div class="pads">${labels.map((l,i)=>`<button class="pad" data-n="${i}" style="background:${cols[i]}">${l}</button>`).join("")}</div>
 <div class="draw-tools"><button class="btn light" id="lab">${S.padLabels==="num"?"אותיות על הפדים":"מספרים על הפדים"}</button><button class="btn" id="song">🎵 נגני מנגינה</button></div>
 <h3>לוח האותיות — נוגעים ושומעים</h3>
 <div class="abc-board">${LETTERS.map(l=>`<button data-l="${l}">${l}</button>`).join("")}</div>
 <p class="muted">מעריצים: 👥 ${S.coins}</p></div>`;
 app.querySelector("#b").onclick=home;
 app.querySelectorAll(".pad").forEach(b=>{const h=e=>{e.preventDefault();note(PENTA[+b.dataset.n],S.inst,0,.6);b.classList.add("hit");setTimeout(()=>b.classList.remove("hit"),150)};b.addEventListener("touchstart",h,{passive:false});b.addEventListener("mousedown",e=>{if(!("ontouchstart" in window))h(e)})});
 app.querySelectorAll("[data-i]").forEach(b=>b.onclick=()=>{const it=INSTR.find(x=>x.k===b.dataset.i);if(S.owned.indexOf(it.k)<0){if(S.coins<it.cost){toast(`צריך עוד ${it.cost-S.coins} מעריצים 👥 — משחקים ואוספים!`,2500);return}S.coins-=it.cost;S.owned.push(it.k);confetti(60);jingle("level")}S.inst=it.k;save();studio()});
 app.querySelector("#lab").onclick=()=>{S.padLabels=S.padLabels==="num"?"let":"num";save();studio()};
 app.querySelector("#song").onclick=()=>{const m=[0,0,4,4,5,5,4,3,3,2,2,1,1,0];m.forEach((n,i)=>{note(PENTA[0]*Math.pow(2,[0,2,4,5,7,9,11][n]/12),S.inst,i*.32,.3);setTimeout(()=>{const p=app.querySelectorAll(".pad")[Math.min(7,n)];if(p){p.classList.add("hit");setTimeout(()=>p.classList.remove("hit"),150)}},i*320)})};
 app.querySelectorAll("[data-l]").forEach(b=>b.onclick=()=>{b.classList.remove("hit");void b.offsetWidth;b.classList.add("hit");note(PENTA[LETTERS.indexOf(b.dataset.l)%PENTA.length],"marimba",0,.4);speak([LETNAME[b.dataset.l]])});
 scrollTo(0,0)}
