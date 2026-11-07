/* strokes.js — מסלולי-כתיבה (סדר וכיוון משיכות) לספרות, אותיות-דפוס עבריות ואותיות אנגליות גדולות. קופסה 0–100, y כלפי מטה.
   עברית: מתחילים למעלה-ימין, קווים אופקיים מימין לשמאל, אנכיים מלמעלה למטה (לפי ההנחיה המקובלת בכיתה א). */
"use strict";
const STROKES={
 /* ספרות */
 "0":[[[50,18],[36,26],[30,50],[36,74],[50,82],[64,74],[70,50],[64,26],[50,18]]],
 "1":[[[38,34],[52,18],[52,82]]],
 "2":[[[32,34],[40,20],[60,20],[68,34],[62,50],[32,80],[70,80]]],
 "3":[[[32,24],[48,18],[66,30],[52,48],[68,64],[54,82],[32,74]]],
 "4":[[[60,18],[30,62],[72,62]],[[60,18],[60,84]]],
 "5":[[[68,18],[36,18],[33,48],[52,44],[68,58],[58,80],[32,76]]],
 "6":[[[62,20],[42,38],[32,60],[42,80],[62,78],[68,60],[52,50],[34,58]]],
 "7":[[[30,20],[70,20],[44,82]]],
 "8":[[[50,48],[34,34],[50,18],[66,34],[50,48],[32,66],[50,82],[68,66],[50,48]]],
 "9":[[[66,42],[50,52],[34,42],[38,22],[58,18],[68,34],[64,58],[54,82]]],
 /* עברית — דפוס */
 "א":[[[74,18],[28,84]],[[28,22],[50,50]],[[52,52],[74,84]]],
 "ב":[[[28,22],[72,22],[72,78]],[[82,78],[24,78]]],
 "ג":[[[40,20],[62,20],[62,78]],[[62,52],[32,82]]],
 "ד":[[[24,22],[74,22]],[[66,22],[66,82]]],
 "ה":[[[26,22],[74,22],[74,82]],[[30,42],[30,82]]],
 "ו":[[[58,18],[58,82]]],
 "ז":[[[36,20],[64,20]],[[52,20],[48,82]]],
 "ח":[[[28,22],[72,22],[72,82]],[[28,22],[28,82]]],
 "ט":[[[26,24],[26,70],[36,80],[66,80],[74,70],[74,30],[64,22]]],
 "י":[[[48,24],[56,30],[56,52]]],
 "כ":[[[26,22],[66,22],[74,30],[74,70],[66,78],[26,78]]],
 "ל":[[[48,6],[62,20],[62,52],[52,68],[28,82]]],
 "מ":[[[28,30],[40,22],[52,30],[52,78]],[[70,20],[76,30],[76,78],[30,78]]],
 "נ":[[[40,22],[60,22],[64,30],[64,78],[30,78]]],
 "ס":[[[26,30],[34,22],[66,22],[74,30],[74,70],[66,78],[34,78],[26,70],[26,30]]],
 "ע":[[[28,22],[40,62]],[[72,22],[60,62],[46,80],[26,80]]],
 "פ":[[[26,22],[66,22],[74,30],[74,70],[66,78],[26,78]],[[60,40],[50,48],[50,58]]],
 "צ":[[[28,22],[36,58],[40,78],[72,78]],[[72,22],[52,62]]],
 "ק":[[[26,22],[68,22],[74,30],[74,58],[66,66],[40,66]],[[28,30],[28,96]]],
 "ר":[[[26,22],[68,22],[74,30],[74,82]]],
 "ש":[[[26,24],[26,70],[34,80],[66,80],[74,70],[74,24]],[[50,28],[48,74]]],
 "ת":[[[26,22],[68,22],[74,30],[74,82]],[[32,22],[32,70],[22,82]]],
 /* אותיות סופיות */
 "ך":[[[26,22],[66,22],[74,30],[74,96]]],
 "ם":[[[26,22],[74,22],[74,78],[26,78],[26,22]]],
 "ן":[[[58,18],[58,96]]],
 "ף":[[[26,22],[66,22],[74,30],[74,96]],[[60,40],[50,48],[50,58]]],
 "ץ":[[[28,22],[40,60],[40,96]],[[72,22],[52,62]]],
 /* אנגלית — גדולות (מתחילים למעלה-שמאל) */
 "A":[[[50,16],[26,84]],[[50,16],[74,84]],[[36,60],[64,60]]],
 "B":[[[30,16],[30,84]],[[30,16],[60,16],[70,26],[70,40],[60,50],[30,50]],[[30,50],[64,50],[74,62],[74,74],[64,84],[30,84]]],
 "C":[[[72,28],[58,16],[40,16],[28,30],[28,70],[40,84],[58,84],[72,72]]],
 "D":[[[30,16],[30,84]],[[30,16],[56,16],[72,32],[72,68],[56,84],[30,84]]],
 "E":[[[70,16],[30,16],[30,84],[70,84]],[[30,50],[62,50]]],
 "F":[[[70,16],[30,16],[30,84]],[[30,50],[62,50]]],
 "G":[[[72,28],[58,16],[40,16],[28,30],[28,70],[40,84],[60,84],[72,72],[72,54],[54,54]]],
 "H":[[[30,16],[30,84]],[[70,16],[70,84]],[[30,50],[70,50]]],
 "I":[[[36,16],[64,16]],[[50,16],[50,84]],[[36,84],[64,84]]],
 "J":[[[40,16],[70,16]],[[58,16],[58,70],[48,84],[32,80]]],
 "K":[[[30,16],[30,84]],[[68,16],[30,54]],[[40,46],[70,84]]],
 "L":[[[30,16],[30,84],[70,84]]],
 "M":[[[28,84],[28,16],[50,60],[72,16],[72,84]]],
 "N":[[[30,84],[30,16],[70,84],[70,16]]],
 "O":[[[50,16],[32,28],[26,50],[32,72],[50,84],[68,72],[74,50],[68,28],[50,16]]],
 "P":[[[30,84],[30,16],[62,16],[72,28],[72,42],[62,52],[30,52]]],
 "Q":[[[50,16],[32,28],[26,50],[32,72],[50,84],[68,72],[74,50],[68,28],[50,16]],[[58,66],[76,86]]],
 "R":[[[30,84],[30,16],[62,16],[72,28],[72,42],[62,52],[30,52]],[[48,52],[72,84]]],
 "S":[[[70,26],[56,16],[40,16],[28,28],[36,46],[62,54],[72,68],[60,84],[40,84],[28,74]]],
 "T":[[[26,16],[74,16]],[[50,16],[50,84]]],
 "U":[[[30,16],[30,66],[42,84],[58,84],[70,66],[70,16]]],
 "V":[[[28,16],[50,84],[72,16]]],
 "W":[[[22,16],[36,84],[50,36],[64,84],[78,16]]],
 "X":[[[28,16],[72,84]],[[72,16],[28,84]]],
 "Y":[[[28,16],[50,50],[72,16]],[[50,50],[50,84]]],
 "Z":[[[28,16],[72,16],[28,84],[72,84]]]};
/* אותיות קטנות — מיפוי פשוט לגדולות כשאין מסלול ייעודי */
"abcdefghijklmnopqrstuvwxyz".split("").forEach(c=>{if(!STROKES[c])STROKES[c]=STROKES[c.toUpperCase()]});

/* עקיבה לפי מסלול: הילדה עוקבת אחרי נקודות המשיכה בסדר; סלחנות ברדיוס; רמז פועם; כוכבים לפי סטיות */
function setupTraceStrokes(q,wrap,onDone){const strokes=STROKES[q.glyph];const W=wrap.clientWidth||340,H=W;const dpr=Math.min(2,window.devicePixelRatio||1);
 const mk=()=>{const c=document.createElement("canvas");c.width=W*dpr;c.height=H*dpr;wrap.appendChild(c);const x=c.getContext("2d");x.scale(dpr,dpr);return x};
 const gx=mk(),ix=mk(),fx=mk();const S2=p=>[p[0]*W/100,p[1]*H/100];
 /* דגימת כל משיכה לנקודות במרחק ~3% */
 const paths=strokes.map(st=>{const pts=[];for(let i=0;i<st.length-1;i++){const a=S2(st[i]),b=S2(st[i+1]);const n=Math.max(2,Math.round(Math.hypot(b[0]-a[0],b[1]-a[1])/(W*.03)));for(let k=0;k<n;k++)pts.push([a[0]+(b[0]-a[0])*k/n,a[1]+(b[1]-a[1])*k/n])}pts.push(S2(st[st.length-1]));return pts});
 let si=0,pi=0,done=false,down=false,dev=0,hint=0,pulse=0,raf=null,last=null;const R=W*.11;
 const drawGuide=()=>{gx.clearRect(0,0,W,H);gx.lineCap="round";gx.lineJoin="round";
  paths.forEach((p,k)=>{gx.beginPath();p.forEach((pt,i)=>i?gx.lineTo(pt[0],pt[1]):gx.moveTo(pt[0],pt[1]));gx.lineWidth=W*.13;gx.strokeStyle=k<si?"#dcfce7":"#efe9ff";gx.stroke();
   if(k===si&&!done){gx.setLineDash([8,10]);gx.lineWidth=3;gx.strokeStyle="#b9a8ee";gx.stroke();gx.setLineDash([])}});
  if(paths.length>1)paths.forEach((p,k)=>{if(k<si&&!done)return;const s0=p[0];gx.fillStyle=k===si?"#FFD93D":"#fff";gx.strokeStyle="#1E1B3A";gx.lineWidth=2.5;gx.beginPath();gx.arc(s0[0]-W*.06,s0[1]-W*.06,W*.045,0,Math.PI*2);gx.fill();gx.stroke();
   gx.fillStyle="#1E1B3A";gx.font="bold "+Math.round(W*.055)+"px Fredoka,Arial";gx.textAlign="center";gx.textBaseline="middle";gx.fillText(String(k+1),s0[0]-W*.06,s0[1]-W*.06+1)});
  if(!done){const p=paths[si];const s=p[Math.min(pi,p.length-1)];const r=12+Math.sin(pulse)*3;gx.fillStyle="#22C55E";gx.beginPath();gx.arc(s[0],s[1],r,0,Math.PI*2);gx.fill();
   /* חץ-כיוון */const nx=p[Math.min(pi+4,p.length-1)];const ang=Math.atan2(nx[1]-s[1],nx[0]-s[0]);gx.save();gx.translate(s[0],s[1]);gx.rotate(ang);gx.fillStyle="#fff";gx.beginPath();gx.moveTo(4,-6);gx.lineTo(12,0);gx.lineTo(4,6);gx.closePath();gx.fill();gx.restore()}
  pulse+=.15;if(!done)raf=requestAnimationFrame(drawGuide)};
 ix.lineCap="round";ix.lineJoin="round";ix.lineWidth=W*.09;ix.strokeStyle=q.color||"#FF5C8A";
 const sparkle=p=>{for(let i=0;i<3;i++){fx.fillStyle=["#FFD93D","#2ED8C3","#fff","#FF5C8A"][i%4];fx.globalAlpha=.9;fx.beginPath();fx.arc(p[0]+(Math.random()-.5)*30,p[1]+(Math.random()-.5)*30,Math.random()*3+1.5,0,Math.PI*2);fx.fill()}fx.globalAlpha=1};
 const fade=()=>{fx.globalCompositeOperation="destination-out";fx.globalAlpha=.08;fx.fillRect(0,0,W,H);fx.globalCompositeOperation="source-over";fx.globalAlpha=1;if(!done)setTimeout(()=>requestAnimationFrame(fade),40)};fade();
 const pos=e=>{const r=wrap.getBoundingClientRect();const t=e.touches?e.touches[0]:(e.changedTouches?e.changedTouches[0]:e);return[(t.clientX-r.left)*W/r.width,(t.clientY-r.top)*H/r.height]};
 const advance=p=>{const path=paths[si];let best=-1,bd=1e9;for(let k=pi;k<Math.min(path.length,pi+8);k++){const d=Math.hypot(path[k][0]-p[0],path[k][1]-p[1]);if(d<bd){bd=d;best=k}}
  if(bd<=R){if(best>pi){ix.beginPath();ix.moveTo(path[pi][0],path[pi][1]);for(let k=pi+1;k<=best;k++)ix.lineTo(path[k][0],path[k][1]);ix.stroke();pi=best;sparkle(p)}
   if(pi>=path.length-1){si++;pi=0;note(PENTA[Math.min(si,PENTA.length-1)],"marimba",0,.3);if(si>=paths.length){finish()}}}
  else{dev++;if(dev%12===0){hint++;toast("עקבי אחרי הנקודה הירוקה 🟢",1200)}}};
 const finish=()=>{done=true;cancelAnimationFrame(raf);drawGuide();ix.globalCompositeOperation="source-in";const g=ix.createLinearGradient(0,0,W,H);g.addColorStop(0,"#FFD93D");g.addColorStop(1,"#FF5C8A");ix.fillStyle=g;ix.fillRect(0,0,W,H);ix.globalCompositeOperation="source-over";
  const st=hint===0&&dev<20?3:hint<=1?2:1;onDone(true,st)};
 const start=e=>{if(done)return;e.preventDefault();down=true;advance(pos(e))};const move=e=>{if(!down||done)return;e.preventDefault();advance(pos(e))};const end=()=>{down=false};
 wrap.addEventListener("touchstart",start,{passive:false});wrap.addEventListener("touchmove",move,{passive:false});wrap.addEventListener("touchend",end);wrap.addEventListener("touchcancel",end);
 wrap.addEventListener("mousedown",start);wrap.addEventListener("mousemove",move);window.addEventListener("mouseup",end);
 drawGuide();
 return{clear(){if(done)return;si=0;pi=0;dev=0;ix.clearRect(0,0,W,H);fx.clearRect(0,0,W,H)}}}
