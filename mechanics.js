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
const INSTR=[{k:"piano",n:"פסנתר 🎹",cost:0},{k:"marimba",n:"מרימבה 🪘",cost:40},{k:"synth",n:"סינתיסייזר 🎛️",cost:120},{k:"bell",n:"פעמונים 🔔",cost:250}];
function studio(){view="studio";hush();S.inst=S.inst||"piano";S.owned=S.owned||["piano"];const labels=S.padLabels==="num"?["1","2","3","4","5","6","7","8"]:["א","ב","ג","ד","ה","ו","ז","ח"];
 const cols=["#ff6f61","#ffc23d","#3fbf6f","#2ee6d6","#1e88e5","#8e24aa","#ff5fa2","#fb8c00"];
 app.innerHTML=`<div class="panel"><button class="back" id="b">→ למפה</button><h2>האולפן של ${KID()} 🎧</h2>
 <p>לוחצים על הפדים ומנגנים! כלים חדשים נפתחים עם מעריצים.</p>
 <div class="inst">${INSTR.map(it=>`<button data-i="${it.k}" aria-pressed="${S.inst===it.k}" class="${S.owned.indexOf(it.k)<0?"locked":""}">${it.n}${S.owned.indexOf(it.k)<0?` · 👥${it.cost}`:""}</button>`).join("")}</div>
 <div class="pads">${labels.map((l,i)=>`<button class="pad" data-n="${i}" style="background:${cols[i]}">${l}</button>`).join("")}</div>
 <div class="draw-tools"><button class="btn light" id="lab">${S.padLabels==="num"?"אותיות על הפדים":"מספרים על הפדים"}</button><button class="btn" id="song">🎵 נגני מנגינה</button></div>
 <div class="draw-tools"><button class="btn" id="singhe">🎤 שיר האלף-בית</button><button class="btn" id="singen">🎤 ABC song</button></div>
 <h3>לוח האותיות — נוגעים ושומעים</h3>
 <div class="abc-board">${LETTERS.map(l=>`<button data-l="${l}">${l}</button>`).join("")}</div>
 <p class="muted">מעריצים: 👥 ${S.coins}</p></div>`;
 app.querySelector("#b").onclick=home;
 app.querySelectorAll(".pad").forEach(b=>{const h=e=>{e.preventDefault();note(PENTA[+b.dataset.n],S.inst,0,.6);b.classList.add("hit");setTimeout(()=>b.classList.remove("hit"),150)};b.addEventListener("touchstart",h,{passive:false});b.addEventListener("mousedown",e=>{if(!("ontouchstart" in window))h(e)})});
 app.querySelectorAll("[data-i]").forEach(b=>b.onclick=()=>{const it=INSTR.find(x=>x.k===b.dataset.i);if(S.owned.indexOf(it.k)<0){if(S.coins<it.cost){toast(`צריך עוד ${it.cost-S.coins} מעריצים 👥 — משחקים ואוספים!`,2500);return}S.coins-=it.cost;S.owned.push(it.k);confetti(60);jingle("level")}S.inst=it.k;save();studio()});
 app.querySelector("#lab").onclick=()=>{S.padLabels=S.padLabels==="num"?"let":"num";save();studio()};
 app.querySelector("#singhe").onclick=()=>singAlong("he");app.querySelector("#singen").onclick=()=>singAlong("en");
 app.querySelector("#song").onclick=()=>{const m=[0,0,4,4,5,5,4,3,3,2,2,1,1,0];m.forEach((n,i)=>{note(PENTA[0]*Math.pow(2,[0,2,4,5,7,9,11][n]/12),S.inst,i*.32,.3);setTimeout(()=>{const p=app.querySelectorAll(".pad")[Math.min(7,n)];if(p){p.classList.add("hit");setTimeout(()=>p.classList.remove("hit"),150)}},i*320)})};
 app.querySelectorAll("[data-l]").forEach(b=>b.onclick=()=>{b.classList.remove("hit");void b.offsetWidth;b.classList.add("hit");note(PENTA[LETTERS.indexOf(b.dataset.l)%PENTA.length],"marimba",0,.4);speak([LETNAME[b.dataset.l]])});
 scrollTo(0,0)}

/* ---------- אווטאר-זמרת + ארון ---------- */
const AV_ITEMS=[
 {id:"hair:pony",cat:"שיער",n:"קוקו",cost:0},{id:"hair:curly",cat:"שיער",n:"מתולתל",cost:30},{id:"hair:long",cat:"שיער",n:"ארוך",cost:30},{id:"hair:bun",cat:"שיער",n:"קוקו גבוה",cost:40},
 {id:"hc:#5a3b1e",cat:"צבע שיער",n:"חום",cost:0,sw:"#5a3b1e"},{id:"hc:#1b1b1b",cat:"צבע שיער",n:"שחור",cost:0,sw:"#1b1b1b"},{id:"hc:#e9c46a",cat:"צבע שיער",n:"בלונד",cost:20,sw:"#e9c46a"},{id:"hc:#c0392b",cat:"צבע שיער",n:"ג'ינג'י",cost:20,sw:"#c0392b"},{id:"hc:#ff5fa2",cat:"צבע שיער",n:"ורוד",cost:80,sw:"#ff5fa2"},{id:"hc:#2ee6d6",cat:"צבע שיער",n:"טורקיז",cost:80,sw:"#2ee6d6"},
 {id:"dress:#ff5fa2",cat:"שמלה",n:"ורוד",cost:0,sw:"#ff5fa2"},{id:"dress:#8e24aa",cat:"שמלה",n:"סגול",cost:20,sw:"#8e24aa"},{id:"dress:#1aa6b7",cat:"שמלה",n:"טורקיז",cost:20,sw:"#1aa6b7"},{id:"dress:#ffc23d",cat:"שמלה",n:"זהב",cost:60,sw:"#ffc23d"},{id:"dress:rainbow",cat:"שמלה",n:"קשת 🌈",cost:120},
 {id:"pat:stars",cat:"דוגמה",n:"כוכבים ⭐",cost:50},{id:"pat:hearts",cat:"דוגמה",n:"לבבות ❤️",cost:50},{id:"pat:none",cat:"דוגמה",n:"חלק",cost:0},
 {id:"acc:mic",cat:"אביזרים",n:"מיקרופון 🎤",cost:0},{id:"acc:phones",cat:"אביזרים",n:"אוזניות 🎧",cost:40},{id:"acc:glasses",cat:"אביזרים",n:"משקפי-כוכב 🕶️",cost:70},{id:"acc:crown",cat:"אביזרים",n:"כתר 👑",cost:120},{id:"acc:guitar",cat:"אביזרים",n:"גיטרה 🎸",cost:150},{id:"acc:cape",cat:"אביזרים",n:"גלימה 🦸",cost:90},{id:"acc:wand",cat:"אביזרים",n:"שרביט ✨",cost:200}];
function avDefaults(){S.av=S.av||{hair:"pony",hc:"#5a3b1e",dress:"#ff5fa2",pat:"none",acc:["mic"]};S.wardrobe=S.wardrobe||["hair:pony","hc:#5a3b1e","hc:#1b1b1b","dress:#ff5fa2","pat:none","acc:mic"];return S.av}
function avatarSvg(av,cls){av=av||avDefaults();const hc=av.hc,skin="#f6d3b8",ol="#1E1B3A";const d=av.dress==="rainbow"?"url(#rb)":av.dress;const has=x=>av.acc.indexOf(x)>=0;
 const hairBack={pony:`<g class="av-hair"><path d="M30 40 Q18 60 26 92 Q34 96 40 90 Q30 70 36 46Z" fill="${hc}" stroke="${ol}" stroke-width="3"/></g>`,curly:`<circle cx="30" cy="48" r="12" fill="${hc}" stroke="${ol}" stroke-width="3"/><circle cx="70" cy="48" r="12" fill="${hc}" stroke="${ol}" stroke-width="3"/><circle cx="26" cy="64" r="10" fill="${hc}" stroke="${ol}" stroke-width="3"/><circle cx="74" cy="64" r="10" fill="${hc}" stroke="${ol}" stroke-width="3"/>`,long:`<path d="M26 40 Q20 70 24 100 L76 100 Q80 70 74 40Z" fill="${hc}" stroke="${ol}" stroke-width="3"/>`,bun:`<circle cx="50" cy="14" r="11" fill="${hc}" stroke="${ol}" stroke-width="3"/>`}[av.hair]||"";
 const pat=av.pat==="stars"?`<text x="42" y="92" font-size="10">⭐</text><text x="56" y="104" font-size="10">⭐</text>`:av.pat==="hearts"?`<text x="42" y="92" font-size="10">❤️</text><text x="56" y="104" font-size="10">❤️</text>`:"";
 return`<svg class="avatar ${cls||""}" viewBox="0 0 100 130" aria-hidden="true"><defs><linearGradient id="rb" x1="0" x2="1"><stop offset="0" stop-color="#ff6f61"/><stop offset=".5" stop-color="#ffc23d"/><stop offset="1" stop-color="#2ee6d6"/></linearGradient></defs>
 <g class="part">
 ${has("cape")?`<path d="M30 70 L20 125 L80 125 L70 70Z" fill="#8e24aa" stroke="${ol}" stroke-width="3" opacity=".95"/>`:""}
 ${hairBack}
 <path d="M34 72 L26 118 L74 118 L66 72Z" fill="${d}" stroke="${ol}" stroke-width="4" stroke-linejoin="round"/>${pat}
 <rect x="38" y="116" width="8" height="10" rx="3" fill="${skin}" stroke="${ol}" stroke-width="3"/><rect x="54" y="116" width="8" height="10" rx="3" fill="${skin}" stroke="${ol}" stroke-width="3"/>
 <rect x="35" y="123" width="14" height="6" rx="3" fill="${ol}"/><rect x="51" y="123" width="14" height="6" rx="3" fill="${ol}"/>
 <path d="M34 76 L22 98" stroke="${ol}" stroke-width="11" stroke-linecap="round"/><path d="M34 76 L22 98" stroke="${skin}" stroke-width="6" stroke-linecap="round"/>
 <g class="av-armR"><path d="M66 76 L80 60" stroke="${ol}" stroke-width="11" stroke-linecap="round"/><path d="M66 76 L80 60" stroke="${skin}" stroke-width="6" stroke-linecap="round"/>
 ${has("mic")?`<circle cx="85" cy="53" r="7" fill="#2ED8C3" stroke="${ol}" stroke-width="3"/><rect x="83" y="59" width="4" height="9" fill="${ol}"/>`:""}
 ${has("wand")?`<line x1="84" y1="56" x2="94" y2="40" stroke="#FFD93D" stroke-width="4" stroke-linecap="round"/><text x="88" y="42" font-size="12">✨</text>`:""}</g>
 <g class="av-head"><circle cx="50" cy="46" r="23" fill="${skin}" stroke="${ol}" stroke-width="4"/>
 <path d="M27 44 Q30 20 50 20 Q70 20 73 44 Q62 32 50 35 Q38 32 27 44Z" fill="${hc}" stroke="${ol}" stroke-width="3"/>
 <g class="av-eyes"><circle cx="42" cy="47" r="3.5" fill="${ol}"/><circle cx="58" cy="47" r="3.5" fill="${ol}"/><circle cx="43.5" cy="45.5" r="1.2" fill="#fff"/><circle cx="59.5" cy="45.5" r="1.2" fill="#fff"/></g>
 <circle cx="36" cy="54" r="3.5" fill="#FF5C8A" opacity=".5"/><circle cx="64" cy="54" r="3.5" fill="#FF5C8A" opacity=".5"/>
 <path class="av-mouth" d="M42 57 Q50 66 58 57" stroke="${ol}" stroke-width="3" fill="none" stroke-linecap="round"/>
 ${has("glasses")?`<text x="31" y="52" font-size="14">⭐</text><text x="52" y="52" font-size="14">⭐</text>`:""}
 ${has("phones")?`<path d="M28 44 Q28 26 50 26 Q72 26 72 44" stroke="${ol}" stroke-width="4" fill="none"/><rect x="24" y="40" width="9" height="14" rx="4" fill="#FF5C8A" stroke="${ol}" stroke-width="2"/><rect x="67" y="40" width="9" height="14" rx="4" fill="#FF5C8A" stroke="${ol}" stroke-width="2"/>`:""}
 ${has("crown")?`<path d="M34 24 L40 10 L50 20 L60 10 L66 24Z" fill="#FFD93D" stroke="${ol}" stroke-width="3" stroke-linejoin="round"/>`:""}</g>
 ${has("guitar")?`<g transform="rotate(-25 60 95)"><ellipse cx="62" cy="100" rx="13" ry="10" fill="#c0392b" stroke="${ol}" stroke-width="3"/><rect x="60" y="68" width="4" height="30" fill="#8d6e63" stroke="${ol}" stroke-width="2"/><circle cx="62" cy="100" r="4" fill="${ol}"/></g>`:""}
 </g></svg>`}
function wardrobe(){view="ward";hush();const av=avDefaults();const cats=[...new Set(AV_ITEMS.map(x=>x.cat))];
 const eq=id=>{const [k,v]=id.split(":");if(k==="acc")return av.acc.indexOf(v)>=0;return av[k]===v};
 app.innerHTML=`<div class="panel"><button class="back" id="b">→ למפה</button><h2>הארון של ${KID()} 👗</h2>
 <div class="av-preview">${avatarSvg(av,"lg dance")}</div>
 <p class="muted" style="text-align:center">מעריצים: 👥 ${S.coins}</p>
 ${cats.map(c=>`<h3>${c}</h3><div class="inst">${AV_ITEMS.filter(x=>x.cat===c).map(it=>{const own=S.wardrobe.indexOf(it.id)>=0;return`<button data-id="${it.id}" aria-pressed="${eq(it.id)}" class="${own?"":"locked"}">${it.sw?`<i class="sw" style="background:${it.sw}"></i>`:""}${it.n}${own?"":` · 👥${it.cost}`}</button>`}).join("")}</div>`).join("")}</div>`;
 app.querySelector("#b").onclick=home;
 app.querySelectorAll("[data-id]").forEach(b=>b.onclick=()=>{const id=b.dataset.id;const it=AV_ITEMS.find(x=>x.id===id);const [k,v]=id.split(":");
  if(S.wardrobe.indexOf(id)<0){if(S.coins<it.cost){toast(`צריך עוד ${it.cost-S.coins} מעריצים 👥 — משחקים ואוספים!`,2500);tone(false);return}S.coins-=it.cost;S.wardrobe.push(id);confetti(50);jingle("level")}
  if(k==="acc"){const i=av.acc.indexOf(v);if(i>=0)av.acc.splice(i,1);else av.acc.push(v)}else av[k]=v;
  save();note(PENTA[5],"bell",0,.4);wardrobe()});
 scrollTo(0,0)}

/* ---------- הפסקת-ריקוד ---------- */
let beatTimer=null;
function beat(bpm,secs){const a=ctx();if(!a||!S.sound)return;const step=60/bpm/2;let i=0;const n=Math.floor(secs/step);clearInterval(beatTimer);
 const kick=t=>{const o=a.createOscillator(),g=a.createGain();o.frequency.setValueAtTime(150,t);o.frequency.exponentialRampToValueAtTime(40,t+.12);g.gain.setValueAtTime(.5,t);g.gain.exponentialRampToValueAtTime(.001,t+.25);o.connect(g);g.connect(a.destination);o.start(t);o.stop(t+.3)};
 const hat=t=>{const b=a.createBuffer(1,a.sampleRate*.05,a.sampleRate);const d=b.getChannelData(0);for(let k=0;k<d.length;k++)d[k]=(Math.random()*2-1)*(1-k/d.length);const s=a.createBufferSource();s.buffer=b;const f=a.createBiquadFilter();f.type="highpass";f.frequency.value=6000;const g=a.createGain();g.gain.value=.15;s.connect(f);f.connect(g);g.connect(a.destination);s.start(t)};
 const bass=[0,0,7,7,5,5,3,3];
 beatTimer=setInterval(()=>{if(i>=n||view!=="dance"){clearInterval(beatTimer);return}const t=a.currentTime+.05;if(i%2===0)kick(t);hat(t);if(i%4===0)note(PENTA[0]/2*Math.pow(2,bass[(i/4)%8]/12),"synth",.05,.3);i++},step*1000)}
function danceBreak(){view="dance";hush();let claps=0;const t0=Date.now();
 app.innerHTML=`<div class="card end dance-card"><span class="tag">הפסקת ריקוד 🎶</span><h2>רוקדים! ${KID()} והלהקה</h2>
 <div class="dancers"><div class="dance">${avatarSvg(null,"lg")}</div><div class="dance" style="animation-delay:.25s">${TURTLE.replace("viewBox",'width="110" height="92" viewBox')}</div></div>
 <button class="big pink" id="clap">👏 מחיאת כף!</button><p class="muted" id="cnt">מוחאים כפיים בקצב</p>
 <button class="next" id="go" style="width:100%;opacity:.4" disabled>ממשיכים! ←</button></div>`;
 beat(104,14);
 app.querySelector("#clap").onclick=e=>{claps++;cheer();note(PENTA[claps%PENTA.length],"marimba",0,.3);const el=document.createElement("div");el.className="flyer";el.textContent=pick(["🎵","🎶","⭐","💖"]);el.style.left=(e.clientX||200)+"px";el.style.top=(e.clientY||300)+"px";el.style.setProperty("--dx",(Math.random()*160-80)+"px");el.style.setProperty("--dy","-180px");document.body.appendChild(el);setTimeout(()=>el.remove(),900);app.querySelector("#cnt").textContent=claps+" מחיאות כפיים 👏";if(claps===10){S.coins+=5;save();toast("+5 מעריצים על הריקוד! 👥",1500)}};
 setTimeout(()=>{const g=app.querySelector("#go");if(g){g.disabled=false;g.style.opacity=1}},6000);
 app.querySelector("#go").onclick=()=>{clearInterval(beatTimer);G.bonus=true;finish()};scrollTo(0,0)}

/* ---------- שרים את האלף-בית / ABC ---------- */
const TWINKLE=[0,0,7,7,9,9,7, 5,5,4,4,2,2,0, 7,7,5,5,4,4,2, 7,7,5,5,4,4,2];
function singAlong(lang){view="sing";hush();const letters=lang==="he"?LETTERS:"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
 const plan=lang==="he"?[[0,.5],[0,.5],[7,.5],[7,.5],[9,.5],[9,.5],[7,1],[5,.5],[5,.5],[4,.5],[4,.5],[2,.5],[2,.5],[0,1],[7,.5],[7,.5],[5,.5],[5,1],[7,.5],[7,.5],[5,.5],[5,1]]
  :[[0,.5],[0,.5],[7,.5],[7,.5],[9,.5],[9,.5],[7,1],[5,.5],[5,.5],[4,.5],[4,.5],[2,.25],[2,.25],[2,.25],[2,.25],[0,1],[7,.5],[7,.5],[5,1],[5,.5],[4,.5],[4,1],[7,.5],[7,1],[5,.5],[5,.5]];
 app.innerHTML=`<div class="card end"><span class="tag">${lang==="he"?"שיר האלף-בית":"ABC song"} 🎤</span><h2>שרים ביחד!</h2>
 <div class="sing-big ${lang==="en"?"en":""}" id="sbig">🎤</div>
 <div class="sing-row ${lang==="en"?"en":""}" id="srow">${letters.map((l,i)=>`<span data-i="${i}">${l}</span>`).join("")}</div>
 <button class="big" id="start">▶️ להתחיל</button><button class="back" id="b" style="align-self:center">→ לאולפן</button></div>`;
 app.querySelector("#b").onclick=studio;
 app.querySelector("#start").onclick=()=>{const a=ctx();let t=0;const bt=.55;app.querySelector("#start").disabled=true;
  letters.forEach((l,i)=>{const p=plan[i]||[0,.5];const when=t;note(PENTA[0]*Math.pow(2,p[0]/12),"bell",when+.05,p[1]*bt*1.4);
   setTimeout(()=>{if(view!=="sing")return;const big=document.getElementById("sbig");big.textContent=l;big.classList.remove("pop");void big.offsetWidth;big.classList.add("pop");document.querySelectorAll("#srow span").forEach(s=>s.classList.toggle("on",+s.dataset.i<=i));
    if(lang==="he"&&AUDIO["he:"+strip(LETNAME[l])])playOne(LETNAME[l]);else if(lang==="en"&&AUDIO["en:"+l.toLowerCase()])playOne({en:l})},when*1000);
   t+=p[1]*bt});
  setTimeout(()=>{if(view!=="sing")return;confetti(50);jingle("win");document.getElementById("sbig").textContent="🌟";app.querySelector("#start").disabled=false;S.coins+=5;save();toast("שרת יפה! +5 מעריצים 👥",2000)},t*1000+300)};
 scrollTo(0,0)}
