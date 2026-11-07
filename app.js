/* app.js — המסע לכיתה א: מנוע אדפטיבי + משחקים + מסכים. בנוי על השלד של "האיים של Mia". Safari 15 תואם. */
"use strict";

/* ---------- state ---------- */
const KEY="masa-alef-v1";
const fresh=()=>({v:1,name:"",lv:{},hist:{},xp:0,coins:0,stickers:[],q:0,items:{},sessions:[],levels:{},best:0,sound:true,mapView:"saga",updatedAt:0,hint:0});
let S=fresh();
try{const r=JSON.parse(localStorage.getItem(KEY)||"null");if(r&&r.v===1)S=Object.assign(fresh(),r)}catch(e){}
function save(){S.updatedAt=Date.now();try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}

/* ---------- utils ---------- */
const sh=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));const t=a[i];a[i]=a[j];a[j]=t}return a};
const pick=a=>a[Math.floor(Math.random()*a.length)];
const rnd=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
const esc=s=>String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/"/g,"&quot;");
const strip=s=>s.replace(/[֑-ׇ]/g,"");
const others=(pool,excl,n)=>sh(pool.filter(x=>excl.indexOf(x)<0)).slice(0,n);
const opt=(v,html,cls)=>({v:String(v),html,cls:cls||""});
const PICS=window.PICS||{};
const picHtml=e=>{if(!e)return"";if(PICS[e])return`<img class="pic" src="${PICS[e]}" alt="">`;const parts=[];let cur="";for(const ch of Array.from(e)){const cp=ch.codePointAt(0);if(cur&&(cp===0xFE0F||cp===0x200D||(cp>=0x1F3FB&&cp<=0x1F3FF)||(cur.slice(-1)==="\u200D"))){cur+=ch}else{if(cur)parts.push(cur);cur=ch}}if(cur)parts.push(cur);
 if(parts.length<2)return e;return parts.map(p=>PICS[p]?`<img class="pic" src="${PICS[p]}" alt="">`:p).join("")};
const pic=e=>`<span class="emo">${picHtml(e)}</span>`;

/* ---------- mastery (per island, per level) ---------- */
const lvOf=sk=>S.lv[sk]||1;
const hist=sk=>S.hist[sk]||[];
function mastery(sk){const h=hist(sk);if(h.length<3)return null;const s=h.reduce((a,b)=>a+b,0);return (s+1)/(h.length+2)}
function stars(sk){const m=mastery(sk);if(m===null)return 0;return m<.6?1:m<.85?2:3}
function weakest(){let best=null,bm=2;Object.keys(SK).forEach(k=>{const m=mastery(k);if(m!==null&&m<bm){bm=m;best=k}});return bm<.85?best:null}
function untried(){return Object.keys(SK).filter(k=>hist(k).length<3)}
/* רישום תשובה; מחזיר "up"/"down"/null כשהרמה משתנה */
function record(sk,key,ok){S.q++;const st=S.items[key]||{c:0,w:0,t:0};if(ok)st.c++;else st.w++;st.t=S.q;S.items[key]=st;
 const h=hist(sk).concat(ok?1:0).slice(-12);S.hist[sk]=h;const lv=lvOf(sk),max=SK[sk].max;
 const last10=h.slice(-10),c10=last10.reduce((a,b)=>a+b,0);
 if(last10.length>=10&&c10>=8&&lv<max){S.lv[sk]=lv+1;S.hist[sk]=[];return "up"}
 const last8=h.slice(-8),c8=last8.reduce((a,b)=>a+b,0);
 if(last8.length>=8&&c8<=3&&lv>1){S.lv[sk]=lv-1;S.hist[sk]=[];return "down"}
 return null}

/* ---------- audio ---------- */
const AUDIO=window.AUDIO||{};
const isHe=t=>/[֐-׿]/.test(t);
let voices={he:null,en:null};
function pickVoices(){try{const v=speechSynthesis.getVoices();voices.he=v.find(x=>/^he/i.test(x.lang))||null;
 voices.en=v.find(x=>/en-US/i.test(x.lang)&&/Samantha|Allison|Ava|Google US/i.test(x.name))||v.find(x=>/^en/i.test(x.lang))||null}catch(e){}}
try{pickVoices();speechSynthesis.onvoiceschanged=pickVoices}catch(e){}
const P=new Audio();P.preload="auto";try{P.setAttribute("playsinline","")}catch(e){}
let unlocked=false;
let audioReady=false;
function unlock(){try{ac=ac||new (window.AudioContext||window.webkitAudioContext)();if(ac.state==="suspended")ac.resume()}catch(e){}
 if(audioReady||!P.paused)return;try{P.src=AUDIO["__silence"]||"";const pr=P.play();if(pr&&pr.then)pr.then(()=>{audioReady=true;unlocked=true},()=>{})}catch(e){}
}
document.addEventListener("touchstart",unlock,{capture:true,passive:true});document.addEventListener("touchend",unlock,{capture:true,passive:true});document.addEventListener("pointerdown",unlock,{capture:true});document.addEventListener("click",unlock,{capture:true});
let seqToken=0,lastAudioErr="",bufCache={};
function playViaCtx(src){return new Promise(res=>{const a=ctx();if(!a){res(false);return}const go=buf=>{try{const n=a.createBufferSource();n.buffer=buf;n.connect(a.destination);n.onended=()=>res(true);n.start();setTimeout(()=>res(true),(buf.duration+.3)*1000)}catch(e){lastAudioErr="ctx-play:"+e.name;res(false)}};
 if(bufCache[src]){go(bufCache[src]);return}
 fetch(src).then(r=>r.arrayBuffer()).then(ab=>{a.decodeAudioData(ab,buf=>{bufCache[src]=buf;go(buf)},e=>{lastAudioErr="decode:"+((e&&e.name)||e);res(false)})}).catch(e=>{lastAudioErr="fetch:"+e.name;res(false)})})}
function clipKey(it){return typeof it==="string"?"he:"+strip(it).replace(/[!?,.]/g,"").trim():"en:"+it.en.toLowerCase()}
function playOne(it){return new Promise(res=>{const key=clipKey(it),src=AUDIO[key];let done=false;const fin=()=>{if(!done){done=true;res()}};
 if(src){const alt=()=>playViaCtx(src).then(ok=>{if(!ok)tts(it).then(fin);else fin()});
  try{P.pause();P.onended=fin;P.onerror=()=>{lastAudioErr="media:"+(P.error&&P.error.code);alt()};P.src=src;const pr=P.play();if(pr&&pr.then)pr.then(()=>{audioReady=true},e=>{lastAudioErr="play:"+e.name;alt()});setTimeout(fin,7000);return}catch(e){lastAudioErr="throw:"+e.name;alt();return}}
 tts(it).then(fin)})}
function tts(it){if(!S.tts)return Promise.resolve();return new Promise(res=>{const text=typeof it==="string"?it:it.en;let started=false;
 try{if(!window.speechSynthesis)throw 0;speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);const he=typeof it==="string";
  u.lang=he?"he-IL":"en-US";u.rate=he?.85:.8;const v=he?voices.he:voices.en;if(v)u.voice=v;u.onstart=()=>started=true;u.onend=()=>res();u.onerror=()=>res();speechSynthesis.speak(u);
  setTimeout(()=>{if(!started)res()},1500);setTimeout(res,7000)}catch(e){res()}})}
/* מנגן רצף: פריטים עבריים (מחרוזת) או אנגליים ({en}) */
async function speak(list,gap){const tok=++seqToken;if(!Array.isArray(list))list=[list];
 for(let i=0;i<list.length;i++){if(tok!==seqToken)return;const it=list[i];if(!it)continue;await playOne(it);if(tok!==seqToken)return;await new Promise(r=>setTimeout(r,gap==null?220:gap))}
 return tok===seqToken}
function hush(){seqToken++;try{P.pause()}catch(e){}try{speechSynthesis.cancel()}catch(e){}}
let ac=null;
function tone(ok){if(!S.sound)return;try{ac=ac||new (window.AudioContext||window.webkitAudioContext)();if(ac.state==="suspended")ac.resume();const notes=ok?[660,880,1175]:[330,262];
 notes.forEach((f,i)=>{const o=ac.createOscillator(),g=ac.createGain();o.type=ok?"triangle":"sine";o.frequency.value=f;const t=ac.currentTime+i*.09;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(ok?.12:.05,t+.02);g.gain.exponentialRampToValueAtTime(.0001,t+.22);o.connect(g);g.connect(ac.destination);o.start(t);o.stop(t+.25)})}catch(e){}}
function tick(){if(!S.sound)return;try{ac=ac||new (window.AudioContext||window.webkitAudioContext)();const o=ac.createOscillator(),g=ac.createGain();o.frequency.value=520;g.gain.setValueAtTime(.08,ac.currentTime);g.gain.exponentialRampToValueAtTime(.0001,ac.currentTime+.08);o.connect(g);g.connect(ac.destination);o.start();o.stop(ac.currentTime+.09)}catch(e){}}

/* ---------- confetti ---------- */
const cv=document.getElementById("fx"),cx=cv.getContext("2d");let parts=[],raf=null;
const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
function confetti(n){if(reduce)return;n=n||40;cv.width=innerWidth;cv.height=innerHeight;const cols=["#ffc23d","#ff6f61","#3fbf6f","#ffffff","#1aa6b7","#c77dff"];
 for(let i=0;i<n;i++)parts.push({x:innerWidth/2,y:innerHeight*.45,vx:(Math.random()-.5)*12,vy:-Math.random()*12-4,c:cols[i%cols.length],r:Math.random()*6+4,l:70});
 if(!raf)loop()}
function loop(){cx.clearRect(0,0,cv.width,cv.height);parts.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.vy+=.45;p.l--;cx.fillStyle=p.c;cx.fillRect(p.x,p.y,p.r,p.r*.6)});parts=parts.filter(p=>p.l>0);
 if(parts.length)raf=requestAnimationFrame(loop);else{cx.clearRect(0,0,cv.width,cv.height);raf=null}}
let toastT=null;function toast(html,ms){let el=document.getElementById("toast");if(!el){el=document.createElement("div");el.id="toast";el.className="toast";el.setAttribute("role","status");document.body.appendChild(el)}el.innerHTML=html;el.hidden=false;clearTimeout(toastT);toastT=setTimeout(()=>el.hidden=true,ms||4000)}

/* ---------- mascot ---------- */
const TURTLE=`<svg viewBox="0 0 76 64" aria-hidden="true"><ellipse cx="38" cy="59" rx="26" ry="3" fill="#0003"/><ellipse cx="18" cy="52" rx="7" ry="5" fill="#3fbf6f" stroke="#1E1B3A" stroke-width="3"/><ellipse cx="54" cy="52" rx="7" ry="5" fill="#3fbf6f" stroke="#1E1B3A" stroke-width="3"/><ellipse cx="36" cy="40" rx="24" ry="17" fill="#2a8a4e" stroke="#1E1B3A" stroke-width="3"/><path d="M20 38 Q36 18 52 38" fill="#8fe39f" stroke="#1E1B3A" stroke-width="3"/><circle cx="30" cy="34" r="4" fill="#FFD93D"/><circle cx="42" cy="33" r="3" fill="#FFD93D"/><circle cx="64" cy="32" r="10" fill="#8fe39f" stroke="#1E1B3A" stroke-width="3"/><circle cx="67" cy="29" r="3" fill="#1E1B3A"/><circle cx="68" cy="28" r="1" fill="#fff"/><path d="M62 36 Q66 39 70 35" stroke="#1E1B3A" stroke-width="2" fill="none" stroke-linecap="round"/><circle cx="12" cy="30" r="9" fill="#FF9F43" stroke="#1E1B3A" stroke-width="3"/><line x1="12" y1="30" x2="26" y2="18" stroke="#1E1B3A" stroke-width="3" stroke-linecap="round"/></svg>`;
const COLORS={red:"#e53935",blue:"#1e88e5",green:"#43a047",yellow:"#fdd835",orange:"#fb8c00",purple:"#8e24aa",black:"#333333",white:"#ffffff",brown:"#8d6e63",pink:"#ec407a"};
function shapeSvg(k,fill){fill=fill||"#1aa6b7";const m={circle:`<circle cx="50" cy="50" r="40" fill="${fill}"/>`,triangle:`<polygon points="50,10 92,88 8,88" fill="${fill}"/>`,square:`<rect x="12" y="12" width="76" height="76" rx="6" fill="${fill}"/>`,
 rect:`<rect x="4" y="26" width="92" height="48" rx="6" fill="${fill}"/>`,star:`<polygon points="50,6 61,38 95,38 68,58 78,92 50,72 22,92 32,58 5,38 39,38" fill="${fill}"/>`,heart:`<path d="M50 88 L14 50 C2 36 14 12 34 16 C42 18 48 26 50 30 C52 26 58 18 66 16 C86 12 98 36 86 50 Z" fill="${fill}"/>`};
 return`<svg class="shape" viewBox="0 0 100 100" aria-hidden="true">${m[k]}</svg>`}

/* ---------- question generators: GEN[sk](lv) → q ---------- */
/* q={sk,key,tag,p,say:[...],opts:[{v,html,cls}],a,kind:"opts"|"spell"|"row",after:[...],info,wide} */
const bigHe=t=>`<span class="he-big">${t}</span>`;
(function aliasClips(){const A=AUDIO;const add=(nik,plain)=>{const k="he:"+strip(nik).replace(/[!?,.]/g,"").trim(),p="he:"+plain;if(!A[k]&&A[p])A[k]=A[p]};
 WORDS.forEach(w=>add(w.s,w.w));LET.forEach(l=>add(l.n,strip(l.n)));
 ["אפס","אחת","שתיים","שלוש","ארבע","חמש","שש","שבע","שמונה","תשע","עשר","אחת עשרה","שתים עשרה","שלוש עשרה","ארבע עשרה","חמש עשרה","שש עשרה","שבע עשרה","שמונה עשרה","תשע עשרה","עשרים"].forEach((p,i)=>add(NUMNAME[i],p));
 ["עיגול","משולש","ריבוע","מלבן","כוכב","לב"].forEach((p,i)=>add(SHAPES[i].n,p))})();
const hasClip=w=>!!(AUDIO["he:"+w.w]||AUDIO["he:"+strip(w.s)]);
function clipCoverage(){let n=0,k=0;LET.forEach(l=>{n++;if(AUDIO["he:"+strip(l.n)])k++});return k+"/"+n}
const clearWords=()=>{const a=WORDS.filter(w=>w.w.indexOf("'")<0&&hasClip(w));return a.length>40?a:WORDS.filter(w=>w.w.indexOf("'")<0)};
const wordsBy=f=>clearWords().filter(f);
function letterOpts(t,n,confuse){let pool=LETTERS.filter(x=>x!==t);let o=[];
 if(confuse){const c=((CONFUSE_SHAPE[t]||"")+(CONFUSE_SOUND[t]||"")).split("").filter(x=>x&&x!==t);o=sh(c).slice(0,Math.min(2,n-1))}
 o=o.concat(others(pool,o.concat([t]),n-1-o.length));return sh([t].concat(o))}
function dotsQ(sk,labels,sayLabel){const shape=pick(Object.keys(DOT_SHAPES).filter(k=>DOT_SHAPES[k].p.length>=labels.length));const lab=labels.slice(0,DOT_SHAPES[shape].p.length);
 return{sk:sk,key:"dots:"+shape,tag:"חבר את הנקודות",p:PROMPTS.dots,say:[PROMPTS.dots],kind:"dots",shape:shape,labels:lab,sayLabel:sayLabel,a:"done",after:[]}}
const GEN={
 write(lv,focus){if(focus||lv===1||(lv>=3&&Math.random()<.3)){const t=focus||pick(LETTERS);return{sk:"write",key:"wr:"+t,tag:"כותבים אות",p:`${PROMPTS.trace} הָאוֹת <span class="he-word">${t}׳</span>`,say:[PROMPTS.trace,LETNAME[t]],kind:"trace",glyph:t,dir:"rtl",a:"done",after:[LETNAME[t]]}}
  if(lv===2){const n=rnd(0,9);return{sk:"write",key:"wrn:"+n,tag:"כותבים ספרה",p:`${PROMPTS.trace} <span class="num-big">${n}</span>`,say:[PROMPTS.trace,NUMNAME[n]],kind:"trace",glyph:String(n),font:"Fredoka",dir:"ltr",a:"done",after:[NUMNAME[n]]}}
  if(lv===3){const w=WORD_BY(pick(SPELL_L1));return{sk:"write",key:"wrw:"+w.w,tag:"כותבים מילה",p:`${PROMPTS.traceWord}${pic(w.e)}<span class="he-word">${w.s}</span>`,say:[PROMPTS.traceWord,w.s],kind:"trace",glyph:w.w,dir:"rtl",a:"done",after:[w.s]}}
  const L=pick("ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""));const g=Math.random()<.5?L:L.toLowerCase();return{sk:"write",key:"wre:"+g,tag:"כותבים באנגלית",p:`${PROMPTS.trace} <span class="en-big">${g}</span>`,say:[PROMPTS.trace,{en:L}],kind:"trace",glyph:g,font:"Andika",dir:"ltr",a:"done",after:[{en:L}]}},
 let(lv,focus){if(!focus&&lv>=3&&Math.random()<.22){const i=rnd(0,12);return dotsQ("let",LETTERS.slice(i,i+10),k=>LETNAME[LETTERS[i+k]])}
  const t=focus||pick(LETTERS);
  if(lv>=3&&Math.random()<(lv===4?.4:.5)){const base=pick(Object.keys(FINALS));const fins=Object.keys(FINALS).map(k=>FINALS[k]);
   return{sk:"let",key:"let:fin:"+base,tag:"אות סופית",p:`${PROMPTS.letFinal} <span class="he-word">${base}׳</span>`,say:[PROMPTS.letFinal,LETNAME[base]],opts:sh(fins).map(x=>opt(x,bigHe(x),"he")),a:FINALS[base],after:[LETNAME[base]+" סוֹפִית"]}}
  if(lv===4&&Math.random()<.5){const i=rnd(1,20);const seq=[LETTERS[i-1],"_",LETTERS[i+1]];const o=sh([LETTERS[i]].concat(others(LETTERS,[LETTERS[i]],2)));
   return{sk:"let",key:"let:seq:"+LETTERS[i],tag:"סדר הא״ב",p:`${PROMPTS.letNext}<span class="he-seq">${seq.join(" ")}</span>`,say:[PROMPTS.letNext],opts:o.map(x=>opt(x,bigHe(x),"he")),a:LETTERS[i],after:[LETNAME[LETTERS[i-1]],LETNAME[LETTERS[i]],LETNAME[LETTERS[i+1]]]}}
  const lane=lv>=2&&Math.random()<.4;const n=lane?3:lv===1?3:4;const o=letterOpts(t,n,lv>=2);
  return{sk:"let",key:"let:"+t,tag:lane?"תפסי את האות":"שמות האותיות",p:lane?`${PROMPTS.lane} הָאוֹת <span class="he-word">${t}׳</span>`:PROMPTS.letHear,say:[lane?PROMPTS.lane:PROMPTS.letHear,LETNAME[t]],kind:lane?"lane":"opts",opts:o.map(x=>opt(x,bigHe(x),"he")),a:t,after:[LETNAME[t]]}},
 sound(lv,focus){if(focus?Math.random()<.5:Math.random()<.35){const t=focus||pick(LETTERS.filter(l=>wordsBy(w=>w.w[0]===l).length>=1));if(!wordsBy(x=>x.w[0]===t).length)return GEN.let(lv,focus);const w=pick(wordsBy(x=>x.w[0]===t));const n=lv>=3?4:3;
   const dis=others(wordsBy(x=>x.w[0]!==t&&(lv<2||!(CONFUSE_SOUND[t]||"").includes(x.w[0]))),[],n-1);const o=sh([w].concat(dis)).map(x=>Object.assign(opt(x.w,picHtml(x.e),"pic"),{say:x.s}));
   return{sk:"sound",key:"l2w:"+t,tag:"האות והצליל",p:`${PROMPTS.letterWord} ${bigHe(t)}`,say:[PROMPTS.letterWord,LETNAME[t]],playOpts:true,opts:o,a:w.w,after:[w.s,LETNAME[t]],info:`<span class="he-word">${w.s}</span>`}}
  const last=!focus&&(lv===3||(lv===4&&Math.random()<.5));const pool0=wordsBy(w=>last?true:w.syl<=3);const pool=focus?pool0.filter(w=>w.w[0]===focus):pool0;if(!pool.length)return GEN.let(lv,focus);const w=pick(pool);
  const t=last?w.w[w.w.length-1]:w.w[0];const base=FINAL_TO_BASE[t]||t;const n=lv===1?3:4;
  let o=letterOpts(base,n,lv>=2);if(FINAL_TO_BASE[t])o=o.map(x=>x===base?t:x);
  const pr=last?PROMPTS.soundLast:PROMPTS.soundFirst;
  return{sk:"sound",key:"sound:"+(last?"L:":"F:")+w.w,tag:last?"צליל סוגר":"צליל פותח",p:`${pr}${pic(w.e)}`,say:[pr,w.s],opts:o.map(x=>opt(x,bigHe(x),"he")),a:t,after:[w.s,LETNAME[base]],info:`<span class="he-word">${w.s}</span>`}},
 rhyme(lv){if(lv>=2&&Math.random()<(lv===2?.55:.4)){const w=pick(wordsBy(x=>x.syl<=(lv===2?3:4)));const o=[1,2,3,4].slice(0,lv===2?3:4).map(k=>opt(k,`${k} <span class="clap">${"👏".repeat(k)}</span>`,"num"));
   return{sk:"rhyme",key:"syl:"+w.w,tag:"הברות",p:`${PROMPTS.syl}${pic(w.e)}<span class="he-word">${w.s}</span>`,say:[PROMPTS.syl,w.s],opts:o,a:String(w.syl),after:[w.s]}}
  const pr=pick(RHYMES);const a=WORD_BY(pr[0]),b=WORD_BY(pr[1]);const n=lv>=3?4:3;
  const end=b.w.slice(-1);const dis=others(clearWords().filter(x=>x.w!==a.w&&x.w!==b.w&&x.w.slice(-1)!==end&&x.w.slice(-2)!==b.w.slice(-2)),[],n-1);
  return{sk:"rhyme",key:"rhyme:"+a.w,tag:"חרוזים",p:`${PROMPTS.rhyme} <span class="he-word">${a.s}</span>?${pic(a.e)}`,say:[PROMPTS.rhyme,a.s],opts:sh([b].concat(dis)).map(x=>opt(x.w,picHtml(x.e),"pic")),a:b.w,after:[a.s,b.s]}},
 word(lv){const build=lv===2||lv===3||(lv===4&&Math.random()<.5);
  if(build){const list=lv===2?SPELL_L1.concat(SPELL_L2):lv===3?SPELL_L2.concat(SPELL_L3):SPELL_L3;const w=WORD_BY(pick(list));const letters=w.w.split("");
   const dn=lv===2?1:2;const dis=others(LETTERS.concat(Object.keys(FINAL_TO_BASE)),letters.map(x=>FINAL_TO_BASE[x]||x).concat(letters),dn);
   return{sk:"word",key:"build:"+w.w,tag:"בניית מילה",p:`${PROMPTS.wordBuild}${pic(w.e)}`,say:[PROMPTS.wordBuild,w.s],kind:"spell",tiles:sh(letters.concat(dis)),ans:letters,dir:"rtl",a:w.w,after:[w.s],info:`<span class="he-word">${w.s}</span>`}}
  const list=lv===1?SPELL_L1:SPELL_L2.concat(SPELL_L3);const w=WORD_BY(pick(list));const n=lv===1?3:4;
  const dis=others(clearWords().filter(x=>x.w!==w.w&&(lv===1||x.w[0]===w.w[0]||x.w.length===w.w.length)),[],n-1);
  return{sk:"word",key:"read:"+w.w,tag:"קריאת מילה",p:`${PROMPTS.wordRead}<span class="he-word big">${w.s}</span>`,say:[PROMPTS.wordRead],opts:sh([w].concat(dis)).map(x=>opt(x.w,picHtml(x.e),"pic")),a:w.w,after:[w.s]}},
 nik(lv){if(lv===3||(lv===4&&Math.random()<.5)){const it=pick(SYL1);const w=WORD_BY(it[0]);
   return{sk:"nik",key:"nsyl:"+w.w,tag:"הברה פותחת",p:`${PROMPTS.nikSyl} <span class="he-word">${w.s}</span>?${pic(w.e)}`,say:[PROMPTS.nikSyl,w.s],opts:sh([it[1]].concat(it[2])).map(x=>opt(x,bigHe(x),"he")),a:it[1],after:[w.s]}}
  const pool=NIK.filter(x=>lv===1?x.w.length===2:lv===2?x.w.length===3:x.w.length>=4);const it=pick(pool);const w=WORD_BY(it.w);
  return{sk:"nik",key:"nik:"+it.w,tag:"ניקוד",p:`${PROMPTS.nikRead} <span class="he-word">${it.ok}</span>?${pic(w.e)}`,say:[PROMPTS.nikRead,w.s],opts:sh([it.ok].concat(it.bad)).map(x=>opt(x,bigHe(x),"he")),a:it.ok,after:[w.s],info:`${VOWEL_NAMES[it.v]}`}},
 num(lv){const max=lv===1?5:lv===2?10:20;const r=Math.random();const e=pick(COUNT_EMO);
  if(lv<=2&&r<.2){const n=lv===1?7:10;return dotsQ("num",Array.from({length:n},(_,i)=>String(i+1)),k=>NUMNAME[k+1])}
  const numOpts=(a,n,lo,hi)=>sh([a].concat(others(Array.from({length:hi-lo+1},(_,i)=>lo+i),[a],n-1))).map(x=>opt(x,String(x),"num"));
  const grid=(n,em)=>`<div class="count ${n>10?"tens":""}">${Array.from({length:n},()=>`<span>${picHtml(em)}</span>`).join("")}</div>`;
  if(lv===4&&r<.35){const step=pick([1,1,2,10]);const start=step===10?10:step===2?pick([2,4]):rnd(1,15);const seq=[0,1,2,3].map(i=>start+i*step).filter(x=>x<=20);if(seq.length<4)return GEN.num(3);const hole=rnd(1,3);const a=seq[hole];
   return{sk:"num",key:"seq:"+step+":"+start,tag:"סדרה",p:`${PROMPTS.numSeq}<span class="num-seq" dir="ltr">${seq.map((x,i)=>i===hole?"_":x).join(" , ")}</span>`,say:[PROMPTS.numSeq],opts:numOpts(a,3,Math.max(1,a-3),Math.min(20,a+3)),a:String(a)}}
  if(lv>=2&&r<.55){const n=lv>=4?pick([1,2,3]):lv===3?pick([1,2]):1;const k=rnd(2,max-1);
   if(n===3){const a=k;return{sk:"num",key:"between:"+k,tag:"בין",p:`${PROMPTS.numBetween} ${k-1} ל-${k+1}?`,say:[PROMPTS.numBetween,NUMNAME[k-1],"וְ",NUMNAME[k+1]],opts:numOpts(a,3,Math.max(1,a-3),Math.min(20,a+3)),a:String(a)}}
   const after=n===1;const a=after?k+1:k-1;const pr=after?PROMPTS.numAfter:PROMPTS.numBefore;
   return{sk:"num",key:(after?"after:":"before:")+k,tag:after?"אחרי":"לפני",p:`${pr} <span class="num-big">${k}</span>?`,say:[pr,NUMNAME[k]],opts:numOpts(a,3,Math.max(1,a-3),Math.min(20,a+3)),a:String(a),after:[NUMNAME[a]]}}
  if(lv>=2&&r<.75){if(lv>=3&&Math.random()<.5){let a=rnd(1,20),b=rnd(1,20);while(b===a)b=rnd(1,20);const big=Math.max(a,b);
    return{sk:"num",key:"cmpn:"+a+":"+b,tag:"גדול יותר",p:PROMPTS.compareNum,say:[PROMPTS.compareNum,NUMNAME[a],"אוֹ",NUMNAME[b]],opts:[a,b].map(x=>opt(x,String(x),"num")),a:String(big),after:[NUMNAME[big]]}}
   let a=rnd(1,max),b=rnd(1,max);while(b===a)b=rnd(1,max);const e2=pick(COUNT_EMO.filter(x=>x!==e));const big=Math.max(a,b);
   return{sk:"num",key:"cmp:"+a+":"+b,tag:"יותר",p:PROMPTS.compare,say:[PROMPTS.compare],opts:[[a,e],[b,e2]].map(x=>opt(x[0],grid(x[0],x[1]),"grp")),a:String(big),after:[NUMNAME[big]],wide:true}}
  if(r<.85){const a=rnd(1,max);const lane=lv>=2&&Math.random()<.4;return{sk:"num",key:"hear:"+a,tag:lane?"תפסי את המספר":"מספרים",p:lane?`${PROMPTS.lane} <span class="num-big">${a}</span>`:PROMPTS.numHear,say:[lane?PROMPTS.lane:PROMPTS.numHear,NUMNAME[a]],kind:lane?"lane":"opts",opts:numOpts(a,lane?3:lv===1?3:4,Math.max(1,a-4),Math.min(max,a+4)),a:String(a),after:[NUMNAME[a]]}}
  const a=rnd(1,max);return{sk:"num",key:"count:"+a,tag:"ספירה",p:`${PROMPTS.count}${grid(a,e)}`,say:[PROMPTS.count],opts:numOpts(a,lv===1?3:4,Math.max(1,a-3),Math.min(max,a+3)),a:String(a),after:[NUMNAME[a]]}},
 calc(lv){const e=pick(COUNT_EMO);const r=Math.random();const max=lv===1?5:lv===2?10:lv===3?10:20;
  const numOpts=(a,n,lo,hi)=>sh([a].concat(others(Array.from({length:hi-lo+1},(_,i)=>lo+i),[a],n-1))).map(x=>opt(x,String(x),"num"));
  const grp=(n,fade)=>`<span class="grp${fade?" fade":""}">${Array.from({length:n},()=>picHtml(e)).join("")}</span>`;
  if(lv===3&&r<.3){const a=rnd(1,9);const ans=10-a;
   return{sk:"calc",key:"ten:"+a,tag:"השלמה ל-10",p:`${PROMPTS.ten}<span class="eq" dir="ltr">${a} + ? = 10</span>`,say:[PROMPTS.ten,NUMNAME[a],"וְעוֹד כַּמָּה"],opts:numOpts(ans,4,1,9),a:String(ans),after:[NUMNAME[a],"וְעוֹד",NUMNAME[ans],"זֶה עֶשֶׂר"]}}
  const sub=lv>=2&&Math.random()<.45;const digitsOnly=lv>=3;
  let a,b,ans;if(sub){a=rnd(2,max);b=rnd(1,a-1);ans=a-b}else{a=rnd(1,max-1);b=rnd(1,max-a);ans=a+b}
  const eq=digitsOnly?`<span class="eq" dir="ltr">${a} ${sub?"−":"+"} ${b} = ?</span>`:sub?`<div class="calc-pic">${grp(a-b)}${grp(b,true)}</div><span class="eq" dir="ltr">${a} − ${b} = ?</span>`:`<div class="calc-pic">${grp(a)}<b>+</b>${grp(b)}</div><span class="eq" dir="ltr">${a} + ${b} = ?</span>`;
  const pr=sub?PROMPTS.sub:PROMPTS.add;const say=[pr,NUMNAME[a],sub?"פָּחוֹת":"וְעוֹד",NUMNAME[b]];
  return{sk:"calc",key:(sub?"sub:":"add:")+a+":"+b,tag:sub?"חיסור":"חיבור",p:`${pr}${eq}`,say:say,opts:numOpts(ans,lv===1?3:4,Math.max(0,ans-3),Math.min(20,ans+3)),a:String(ans),after:[NUMNAME[a],sub?"פָּחוֹת":"וְעוֹד",NUMNAME[b],"זֶה",NUMNAME[ans]]}},
 think(lv){const r=Math.random();
  if(lv===4&&r<.6){const s=pick(SHAPES);if(Math.random()<.5){const o=sh([s].concat(others(SHAPES,[s],3)));
    return{sk:"think",key:"shape:"+s.k,tag:"צורות",p:`${PROMPTS.shapeHear} <span class="he-word">${s.n}</span>`,say:[PROMPTS.shapeHear,s.n],opts:o.map(x=>opt(x.k,shapeSvg(x.k),"pic")),a:s.k,after:[s.n]}}
   const sp=pick(SHAPES.filter(x=>x.sides));return{sk:"think",key:"sides:"+sp.k,tag:"צלעות",p:`${PROMPTS.sides}<div class="shape-big">${shapeSvg(sp.k,"#ff6f61")}</div>`,say:[PROMPTS.sides],opts:[3,4,5].map(x=>opt(x,String(x),"num")),a:String(sp.sides),after:[sp.n]}}
  if(lv>=2&&r<(lv===2?.4:.35)){const kinds=lv===2?["ABAB"]:["ABAB","ABC","AAB"];const k=pick(kinds);const em=sh(COUNT_EMO).slice(0,3);const pat=k==="ABAB"?[0,1]:k==="ABC"?[0,1,2]:[0,0,1];
   const len=lv===2?5:6;const seq=Array.from({length:len+1},(_,i)=>em[pat[i%pat.length]]);const a=seq[len];
   return{sk:"think",key:"pat:"+k,tag:"מה בא אחר כך?",p:`${PROMPTS.pattern}<div class="pattern" dir="ltr">${seq.slice(0,len).map(x=>`<span>${picHtml(x)}</span>`).join("")}<span class="q">?</span></div>`,say:[PROMPTS.pattern],opts:sh(em).map(x=>opt(x,picHtml(x),"pic")),a:a}}
  if(lv>=2&&r<(lv===2?.75:.7)){const n=lv===2?3:4;const ws=sh(clearWords()).slice(0,n);let idx,pr,sayx=[];
   if(lv===2){const dir=Math.random()<.5?"R":"L";let x=dir==="R"?rnd(0,n-2):rnd(1,n-1);idx=dir==="R"?x+1:x-1;pr=dir==="R"?PROMPTS.dirRight:PROMPTS.dirLeft;sayx=[pr,ws[x].s];
    return{sk:"think",key:"dir:"+dir,tag:"ימין ושמאל",p:`${pr}<span class="he-word" style="padding-right:0">${ws[x].s}</span>`,say:sayx,kind:"row",opts:ws.map((w,i)=>opt(i,picHtml(w.e),"pic")),a:String(idx),after:[ws[idx].s]}}
   const kind=pick(["mid","firstR","firstL","secondR"]);if(kind==="mid"&&n%2===0)return GEN.think(2);
   idx=kind==="mid"?Math.floor(n/2):kind==="firstR"?n-1:kind==="firstL"?0:n-2;pr=kind==="mid"?PROMPTS.dirMid:kind==="firstR"?PROMPTS.dirFirstR:kind==="firstL"?PROMPTS.dirFirstL:PROMPTS.dirSecondR;
   return{sk:"think",key:"dir:"+kind,tag:"ימין ושמאל",p:pr,say:[pr],kind:"row",opts:ws.map((w,i)=>opt(i,picHtml(w.e),"pic")),a:String(idx),after:[ws[idx].s]}}
  if(r<.5||lv===1&&r<.6){const big=Math.random()<.5;const w=pick(clearWords());const sizes=sh([1,1.7,2.6]);const a=sizes.indexOf(big?2.6:1);
   return{sk:"think",key:"size:"+(big?"B":"S"),tag:"גדול וקטן",p:`${big?PROMPTS.sizeBig:PROMPTS.sizeSmall}`,say:[big?PROMPTS.sizeBig:PROMPTS.sizeSmall],kind:"row",opts:sizes.map((s,i)=>opt(i,`<span style="font-size:${s}em">${picHtml(w.e)}</span>`,"pic")),a:String(a),after:[big?"הֲכִי גָּדוֹל":"הֲכִי קָטָן"]}}
  const cats=sh(["animal","food","vehicle","home","clothes","nature","body"]);const A=sh(wordsBy(w=>w.c===cats[0])).slice(0,3),B=pick(wordsBy(w=>w.c===cats[1]));
  return{sk:"think",key:"odd:"+cats[1],tag:"מה לא שייך?",p:PROMPTS.odd,say:[PROMPTS.odd],opts:sh(A.concat([B])).map(x=>opt(x.w,picHtml(x.e),"pic")),a:B.w,after:[B.s]}},
 abc(lv,focus){const U="ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");const L=focus||pick(U),low=L.toLowerCase();const r=Math.random();
  const conf=n=>{const c=(EN_CONFUSE[low]||"").split("").filter(Boolean);const o=sh(c).slice(0,Math.min(2,n-1));return sh([low].concat(o,others(U.map(x=>x.toLowerCase()),o.concat([low]),n-1-o.length)))};
  if(lv===4&&r<.5){const keys=Object.keys(PHONICS);const k=pick(keys);const w=EN_BY(PHONICS[k]);const o=sh([k].concat(others(keys,[k],3)));
   return{sk:"abc",key:"phon:"+k,tag:"פוניקס",p:`${PROMPTS.abcPhon}${pic(w.e)}<span class="en-word">${w.w}</span>`,say:[PROMPTS.abcPhon,{en:w.w}],opts:o.map(x=>opt(x,`<span class="en-big">${x}</span>`,"en")),a:k,after:[{en:k},{en:w.w}]}}
  if(lv>=3&&r<.6){const up=Math.random()<.5;const n=4;
   if(up){const o=sh([L].concat(others(U,[L],3)));return{sk:"abc",key:"up:"+L,tag:"גדולה וקטנה",p:`${PROMPTS.abcUpper}<span class="en-big">${low}</span>`,say:[PROMPTS.abcUpper,{en:L}],opts:o.map(x=>opt(x,`<span class="en-big">${x}</span>`,"en")),a:L,after:[{en:L}]}}
   return{sk:"abc",key:"low:"+L,tag:"גדולה וקטנה",p:`${PROMPTS.abcLower}<span class="en-big">${L}</span>`,say:[PROMPTS.abcLower,{en:L}],opts:conf(n).map(x=>opt(x,`<span class="en-big">${x}</span>`,"en")),a:low,after:[{en:L}]}}
  const n=lv===1?3:4;let o;if(lv>=2){const c=(EN_CONFUSE[low]||"").toUpperCase().split("").filter(Boolean);const cc=sh(c).slice(0,Math.min(2,n-1));o=sh([L].concat(cc,others(U,cc.concat([L]),n-1-cc.length)))}else o=sh([L].concat(others(U,[L],n-1)));
  const lane=lv>=2&&Math.random()<.4;if(lane)o=o.filter(x=>x===L).concat(o.filter(x=>x!==L).slice(0,2));
  return{sk:"abc",key:"abc:"+L,tag:lane?"תפסי את האות":"ABC",p:lane?`${PROMPTS.lane} <span class="en-big">${L}</span>`:PROMPTS.abcHear,say:[lane?PROMPTS.lane:PROMPTS.abcHear,{en:L}],kind:lane?"lane":"opts",opts:sh(o).map(x=>opt(x,`<span class="en-big">${x}${lv>=3&&!lane?" "+x.toLowerCase():""}</span>`,"en")),a:L,after:[{en:L}],info:`<span class="en-word">${L} ${low}</span> · ${EN_LETTER_NAMES[L]}`}},
 en(lv){const cats=lv===1?["animal","food","color","thing"]:["animal","food","color","body","thing","family","number","adj"];const c=pick(cats);const pool=EN.filter(x=>x.c===c&&x.w!=="orange"||x.c===c&&c==="food");
  const w=pick(pool);const n=lv===1?3:4;const dis=others(EN.filter(x=>x.c===(lv===1?c:pick([c,c,pick(cats)]))&&x.e!==w.e&&x.w!==w.w),[],n-1);const o=sh([w].concat(dis));
  const r=Math.random();
  if(lv===4||lv===3&&r<.5){const prod=lv===4&&r<.6;
   if(prod)return{sk:"en",key:"enprod:"+w.w,tag:"אנגלית",p:`${PROMPTS.enWord} <span class="he-word">${w.h}</span>?`,say:[PROMPTS.enWord,WORD_BY(w.h)?WORD_BY(w.h).s:w.h],opts:o.map(x=>opt(x.w,`<span class="en-word">${x.w}</span>`,"en")),a:w.w,after:[{en:w.w}],info:`${w.e} <span class="en-word">${w.w}</span> · ${w.h}`};
   return{sk:"en",key:"enread:"+w.w,tag:"קריאה באנגלית",p:`${PROMPTS.enRead}<span class="en-word big">${w.w}</span>`,say:[PROMPTS.enRead,{en:w.w}],opts:o.map(x=>opt(x.w,picHtml(x.e),"pic")),a:w.w,after:[{en:w.w},w.h],info:`<span class="en-word">${w.w}</span> · ${w.h}`}}
  if(lv===3)return{sk:"en",key:"enword:"+w.w,tag:"אנגלית",p:`${PROMPTS.enWord} <span class="he-word">${w.h}</span>?${pic(w.e)}`,say:[PROMPTS.enWord,WORD_BY(w.h)?WORD_BY(w.h).s:w.h],opts:o.map(x=>opt(x.w,`<span class="en-word">${x.w}</span>`,"en")),a:w.w,after:[{en:w.w}],info:`<span class="en-word">${w.w}</span> · ${w.h}`};
  return{sk:"en",key:"en:"+w.w,tag:"אנגלית",p:PROMPTS.enHear,say:[PROMPTS.enHear,{en:w.w}],opts:o.map(x=>opt(x.w,picHtml(x.e),"pic")),a:w.w,after:[{en:w.w},w.h],info:`<span class="en-word">${w.w}</span> · ${w.h}`}},
 sent(lv){const build=lv===3||(lv===4&&Math.random()<.5);const tl=build?(lv===3?2:4):lv;const T=pick(SENT.filter(s=>s.lvl===Math.min(tl,4)));
  const poolW=T.pool==="colorable"?EN.filter(x=>COLORABLE.indexOf(x.w)>=0):EN.filter(x=>x.c===T.pool&&x.w!=="orange");const w=pick(poolW);
  const col=T.t.indexOf("{c}")>=0?pick(EN.filter(x=>x.c==="color"&&x.w!=="white")):null;const sz=T.t.indexOf("{sz}")>=0?pick(SIZES):null;
  const text=T.t.replace("{x}",w.w).replace("{c}",col?col.w:"").replace("{sz}",sz?sz[0]:"");
  const render=(ww,cc,ss)=>`<span class="scene ${ss?ss[0]:""}" style="${cc?"background:"+COLORS[cc.w]+"33;border-color:"+COLORS[cc.w]:""}"><span class="emo">${picHtml(ww.e)}</span>${cc?`<i class="dot" style="background:${COLORS[cc.w]}"></i>`:""}</span>`;
  if(build){const words=text.split(" ");const dis=lv===4?sh(["big","red","cat","is","the","my"].filter(x=>words.indexOf(x)<0)).slice(0,1):[];
   return{sk:"sent",key:"sb:"+T.t,tag:"בניית משפט",p:`${PROMPTS.sentBuild}<div class="scene-wrap">${render(w,col,sz)}</div>`,say:[PROMPTS.sentBuild,{en:text}],kind:"spell",tiles:sh(words.concat(dis)),ans:words,dir:"ltr",a:text,after:[{en:text}],info:`<span class="en-word">${text}</span>`}}
  const n=lv>=2?3:3;let o;
  if(col&&Math.random()<.6){const cols=sh([col].concat(others(EN.filter(x=>x.c==="color"&&x.w!=="white"),[col],n-1)));o=cols.map(cc=>opt(w.w+":"+cc.w,render(w,cc,sz),"pic"));return fin(w.w+":"+col.w)}
  if(sz&&!col&&Math.random()<.6){o=sh(SIZES.map(ss=>opt(w.w+":"+ss[0],render(w,null,ss),"pic")));return fin(w.w+":"+sz[0])}
  const dis=others(poolW.filter(x=>x.e!==w.e),[],n-1);o=sh([w].concat(dis)).map(x=>opt(x.w,render(x,col,sz),"pic"));return fin(w.w);
  function fin(a){return{sk:"sent",key:"sh:"+T.t,tag:"משפט",p:`${PROMPTS.sentHear}<span class="en-word sent">${text}</span>`,say:[PROMPTS.sentHear,{en:text}],opts:o,a:a,after:[{en:text}],info:`<span class="en-word">${text}</span>`}}}
};
function makeQ(sk,lv,focus){let q=null;for(let i=0;i<6&&!q;i++){try{q=GEN[sk](lv,focus)}catch(e){q=null;console.error(sk,lv,e)}}return q}

/* ---------- views ---------- */
const app=document.getElementById("app");let view="home";
const KID=()=>S.name||"אלופה";
function starHtml(n){return [0,1,2].map(i=>`<span class="${i<n?"on":""}">★</span>`).join("")}
const lvStars=i=>S.levels[i]||0;
const lvOpen=i=>i===0||lvStars(i-1)>0;
const curLevel=()=>{for(let i=0;i<LEVELS.length;i++)if(!lvStars(i))return i;return LEVELS.length-1};
function lvIcon(L){if(L.boss)return L.boss==="all"?"🏆":"👑";return SK[L.sk].ic}
const isEnIc=ic=>/^[A-Za-z0-9+ ]+$/.test(ic);

function onboarding(){view="onb";app.innerHTML=`<div class="card end">
 <div class="dancers"><div class="bounce">${avatarSvg(avDefaults(),"lg")}</div><div class="bounce" style="animation-delay:.4s">${TURTLE.replace("viewBox",'width="110" height="92" viewBox')}</div></div>
 <h2>איך קוראים לך?</h2>
 <input type="text" id="nm" placeholder="השם שלך" maxlength="20" autocomplete="off" aria-label="השם שלך" style="font-size:1.5rem;text-align:center">
 <button class="big" id="go">בואי נתחיל! 🚀</button>
 <p class="muted">הורים: אפשר לשנות את השם ואת ההגדרות בפינת ההורים.</p></div>`;
 const inp=app.querySelector("#nm");inp.value=S.name||"";
 app.querySelector("#go").onclick=()=>{S.name=inp.value.trim().slice(0,20)||S.name;save();home()}}

function buddyLine(cur){const L=LEVELS[cur];if(!S.q)return`היי ${KID()}! אני טיקי הצב 🐢 בואי נצא למסע עד כיתה א!`;
 if(Object.keys(S.levels).length===LEVELS.length)return`עברת את כל השלבים! 🏆 אפשר לשחק שוב, להשיג 3 כוכבים בכל שלב, או לעשות אימון חכם.`;
 const w=weakest();return`הבא בתור: <b>שלב ${cur+1} · ${L.t}</b>${w?`<br><span class="muted">באימון החכם נחזק את ${SK[w].n}</span>`:""}`}
function firstName(){return (S.name||"").split(" ")[0]||"אלופה"}
function home(){if(!S.name&&!S.q){onboarding();return}view="home";hush();const totalStars=Object.keys(S.levels).reduce((a,k)=>a+S.levels[k],0);
 const hall=HALLS[curHallIndex()];const prog=hallProgress(hall);
 app.innerHTML=`
 <div class="top"><h1>🎤 ${firstName()} על הבמה</h1><span class="pill">⭐ ${totalStars}</span><span class="pill" aria-label="מעריצים">👥 ${S.coins}</span></div>
 <div class="hero"><div class="bounce">${avatarSvg(avDefaults(),"hero")}</div><div class="bounce" style="animation-delay:.4s">${TURTLE.replace("viewBox",'width="120" height="100" viewBox')}</div><div class="crowd"></div></div>
 <button class="big pink xl" id="smart">🎤 הופעה!</button>
 <div class="icons">
  <button class="ic" id="map"><span>${hall.e}</span><b>מפה</b></button>
  <button class="ic" id="stu"><span>🎧</span><b>אולפן</b></button>
  <button class="ic" id="ward"><span>👗</span><b>ארון</b></button>
  <button class="ic" id="col"><span>🎁</span><b>מדבקות</b></button>
 </div>
 <div class="hall mini"><div class="hall-head"><span class="hall-e">${hall.e}</span><b>${hall.n}</b><span class="meter"><i style="width:${Math.round(prog*100)}%"></i></span><span class="fans">👥 ${Math.round(prog*50)}/50</span></div></div>
 <button class="back" id="par" style="align-self:center;background:#ffffff22;color:#fff;border-color:#ffffff44;box-shadow:none;font-size:.9rem">👨‍👧 הורים</button>`;
 app.querySelector("#smart").onclick=()=>start(null);
 app.querySelector("#map").onclick=()=>mapScreen(curHallIndex());
 app.querySelector("#col").onclick=collection;app.querySelector("#par").onclick=parentGate;app.querySelector("#stu").onclick=studio;app.querySelector("#ward").onclick=wardrobe;
 installHint();scrollTo(0,0)}
function curHallIndex(){let idx=0;HALLS.forEach((h,i)=>{if(hallOpen(i))idx=i});return idx}
function mapScreen(hi){view="map";hush();hi=Math.max(0,Math.min(HALLS.length-1,hi));const h=HALLS[hi];const open=hallOpen(hi);const prog=hallProgress(h);
 const ICON={he:"🅰️",ma:"🔢",en:"🔤"};const STEP_ICON={he1:"🎵",he2:"👏",he3:"🔤",he4:"🧩",he5:"✏️",he6:"אָ",he7:"אֹ",he8:"📖",he9:"🔍",he10:"📚",he11:"👫",he12:"🏁",ma1:"🍎",ma2:"⚖️",ma3:"🔟",ma4:"➕",ma5:"🧮",ma6:"💯",ma7:"⏰",ma8:"🏛️",ma9:"➗",ma10:"✖️",ma11:"🔺",ma12:"📐",ma13:"🚀",ma14:"📊",en1:"🐱",en2:"🙌",en3:"💬",en4:"🔡",en5:"🔊",en6:"📘",en7:"❓",en8:"📗",en9:"🧱",en10:"📙"};
 const tiles=h.steps.map(st=>{const o=open&&stepOpen(st);const p=stepProgress(st);const done=stepPassed(st);const d=STEPS[st].d;const ic=STEP_ICON[st]||ICON[d];
  return`<button class="tile2 ${d} ${o?"":"locked"} ${done?"done":""}" data-step="${st}" aria-label="${STEPS[st].n}"><span class="t-ic ${/^[\u0590-\u05FF]/.test(ic)?"he":""}">${o?(done?"🏆":picHtml(ic)):"🔒"}</span><span class="t-n">${STEPS[st].n}</span><span class="stg-bar"><i style="width:${Math.round(p*100)}%"></i></span></button>`}).join("");
 app.innerHTML=`<div class="top"><button class="x" id="home" aria-label="חזרה">✕</button><h1 style="text-align:center">${h.e} ${h.n}</h1><span class="pill">👥 ${Math.round(prog*50)}/50</span></div>
 <div class="hall ${open?"":"locked"}"><div class="meter big"><i style="width:${Math.round(prog*100)}%"></i></div>
 ${open?`<div class="tiles2">${tiles}</div>`:`<p style="color:#fff;text-align:center;font-size:1.1rem;margin:20px 0">🔒 ייפתח כשהאולם הקודם יתמלא במעריצים 👥</p>`}</div>
 <div class="nav2"><button class="btn light" id="prev" ${hi===0?"disabled":""}>◀ ${hi>0?HALLS[hi-1].e+" "+HALLS[hi-1].n:""}</button><button class="btn light" id="next" ${hi===HALLS.length-1?"disabled":""}>${hi<HALLS.length-1?HALLS[hi+1].e+" "+HALLS[hi+1].n:""} ▶</button></div>`;
 app.querySelector("#home").onclick=home;app.querySelector("#prev").onclick=()=>mapScreen(hi-1);app.querySelector("#next").onclick=()=>mapScreen(hi+1);
 app.querySelectorAll("[data-step]").forEach(b=>b.onclick=()=>{const st=b.dataset.step;if(!stepOpen(st)||b.classList.contains("locked")){b.classList.add("wiggle");setTimeout(()=>b.classList.remove("wiggle"),400);const deps=STEPS[st].deps.filter(d=>!stepPassed(d)).map(d=>STEPS[d].n);toast("עוד נעול 🔒 קודם: "+deps.join(" · "),2600);return}levelIntro(st)});
 scrollTo(0,0)}
function installHint(){const standalone=navigator.standalone||matchMedia("(display-mode: standalone)").matches;if(standalone||S.hint>=2)return;
 const ios=/iPhone|iPad|iPod/.test(navigator.userAgent)||(navigator.platform==="MacIntel"&&navigator.maxTouchPoints>1);
 if(!ios||S.q<5)return;S.hint++;save();toast("📲 להורים: כדי להתקין כאפליקציה — לוחצים על שיתוף ⬆️ ואז ״הוסף למסך הבית״",7000)}

function levelIntro(step){const T=STEPS[step];const st=S.levels[step]||0;view="intro";hush();const p=stepProgress(step);const ic={he:"א",ma:"123",en:"ABC"}[T.d];
 app.innerHTML=`<div class="card end">
  <span class="tag">${DOMAIN_NAME[T.d]}</span>
  <div class="lv-big"><span class="${T.d==="en"?"en":""}">${ic}</span></div>
  <h2>${T.n}</h2>
  <p style="margin:0;font-size:1.15rem">${Math.round(p*100)}% מהשלב כבר שלך · 8 משימות</p>
  <div class="bigstars" style="font-size:2.2rem">${[0,1,2].map(k=>`<span style="color:${k<st?"var(--sun)":"#d9e3e7"}">★</span>`).join("")}</div>
  <button class="big" id="play">${st?"עוד הופעה כאן":"יאללה!"}</button>
  <button class="back" id="home" style="align-self:center">→ למפה</button></div>`;
 speak([T.n]);app.querySelector("#play").onclick=()=>start(step);app.querySelector("#home").onclick=()=>mapScreen(HALLS.findIndex(h=>h.steps.indexOf(step)>=0));scrollTo(0,0)}

/* ---------- game loop ---------- */
let G=null,advT=null,quitArm=false;
const ROUND=8,CAP=11;
function planSkills(focus,n){if(typeof focus==="string")return Array.from({length:n},()=>focus);
 const keys=Array.isArray(focus)?focus:Object.keys(SK);
 const w=keys.map(k=>{const m=mastery(k);const u=hist(k).length<3?1.2:0;return{k,s:(m===null?.5:1-m)*2+u+Math.random()*.6}}).sort((a,b)=>b.s-a.s);
 const out=[];let i=0;while(out.length<n){out.push(w[i%w.length].k);i++;if(i%w.length===0)w.sort((a,b)=>b.s+Math.random()*.8-(a.s+Math.random()*.8))}
 const res=[];let rest=out.slice();while(rest.length){const prev=res[res.length-1];let k=rest.findIndex(x=>!prev||x!==prev);if(k<0)k=0;res.push(rest.splice(k,1)[0])}return res}
function start(step){const plan=buildSession(step||null,ROUND);G={step:step||null,plan,list:plan.map(x=>x.sk),i:0,res:[],combo:0,gain:0,retried:0,wrongRow:0,easy:false,ups:[],pendingUp:null,encore:false,hints:0};ask()}
function ask(){view="play";quitArm=false;clearTimeout(advT);
 if(G.pendingUp){const sk=G.pendingUp;G.pendingUp=null;levelUp(sk);return}
 const item=G.plan[G.i];const sk=item.sk;let lv=item.lv;const easy=G.easy;G.easy=false;if(easy)lv=Math.max(1,lv-1);
 if(item.focus&&!item.introDone){const st=subState(item.step,item.sub);const h=st.h;const last2=h.slice(-2).join("")==="00";const acc=h.length>=4?h.slice(-6).reduce((a,b)=>a+b,0)/Math.min(6,h.length):1;
  if(st.n===0||last2||acc<.5){item.introDone=true;item.reteach=st.n>0;introCard(item);return}}
 let q=G.retryQ||makeQ(sk,lv,item.focus);G.retryQ=null;if(!q){G.i++;G.i<G.plan.length?ask():finish();return}q.item=item;
 if(easy&&q.kind!=="spell"&&q.kind!=="row"&&q.opts.length>2){q.opts=sh([q.opts.find(o=>o.v===q.a),q.opts.find(o=>o.v!==q.a)])}
 G.cur={q,done:false,t0:Date.now(),retry:q._retry||0};
 const dots=G.plan.map((_,k)=>`<i class="${k<G.res.length?(G.res[k]===1?"ok":G.res[k]?"half":"no"):k===G.i?"now":""}"></i>`).join("");
 const optHtml=o=>`<button class="ans ${o.cls}" data-o="${esc(o.v)}">${o.html}</button>`;
 app.innerHTML=`
 <div class="hud"><button class="x" id="quit" aria-label="חזרה למפה">✕</button><div class="dots">${dots}</div><span class="pill" id="hc">👥 ${S.coins}</span></div>
 <div class="card play">
  <div class="row-tag"><span class="tag">${q.tag}</span>${G.combo>=2?`<span class="combo">🔥 ${G.combo}</span>`:""}</div>
  ${easy?`<div class="feedback good" style="padding:8px 12px">זה בסדר! גם טיקי טועה לפעמים. הנה אחת קלה 💪</div>`:G.cur.retry?`<div class="feedback good" style="padding:8px 12px">עוד ניסיון — הקשיבי שוב 👂</div>`:""}
  <div class="pz">${(q.kind==="trace"||q.kind==="dots"||/class="(emo|he-word|en-word|he-big|en-big|num-big|num-seq|eq|count|calc-pic|pattern|shape|scene|clock|he-seq)/.test(q.p))?"":`<div class="listen">${avatarSvg(avDefaults(),"sing")}<span class="note n1">🎵</span><span class="note n2">🎶</span></div>`}<div class="prompt">${q.p}</div>
  <button class="ear" id="ear">🔊 עוד פעם</button></div>
  ${q.kind==="spell"?`<div class="slots" dir="${q.dir}">${q.ans.map((_,k)=>`<button class="slot ${q.dir==="ltr"?"wordslot":""}" data-k="${k}" aria-label="מקום ${k+1}"></button>`).join("")}</div>
     <div class="tiles" dir="${q.dir}">${q.tiles.map((c,k)=>`<button class="tile ${q.dir==="ltr"?"wordtile":""}" data-t="${k}">${c}</button>`).join("")}</div>`
  :q.kind==="row"?`<div class="row-opts" dir="ltr">${q.opts.map(optHtml).join("")}</div>`
  :q.kind==="lane"?`<div class="lane-wrap" id="lane"><div class="lines"></div><div class="hit"></div><span class="lane-note" style="left:12%">🎵</span><span class="lane-note" style="left:70%;animation-delay:1.2s">🎶</span><div class="fall" style="--dur:${lv===2?6:lv===3?5:4.2}s">${sh(q.opts).map(optHtml).join("")}</div></div>`
  :q.kind==="trace"||q.kind==="dots"?`${q.kind==="trace"?`<div class="draw-tools"><button class="btn light" id="clr">🧽 מהתחלה</button></div>`:""}<div class="draw-wrap" id="draw"></div>`
  :`<div class="answers ${q.wide?"one":""} ${q.opts.length===3?"three":""}">${q.opts.map(optHtml).join("")}</div>`}
  <div id="fb"></div>
 </div>`;
 app.querySelector("#quit").onclick=()=>{if(!quitArm){quitArm=true;toast("לצאת? ההתקדמות נשמרת. לחצי שוב על ✕",2500);return}home()};
 app.querySelector("#ear").onclick=()=>speak(q.say).then(done=>{if(done&&q.playOpts)playOptions(q)});
 app.querySelectorAll(".ans").forEach(b=>b.onclick=()=>answer(b));
 if(q.kind==="spell")setupSpell(q);
 if(q.kind==="lane"){const f=app.querySelector(".fall");let loops=0;f.addEventListener("animationend",()=>{if(G.cur.done)return;loops++;if(loops===1){f.style.animation="none";void f.offsetWidth;f.style.animation="";speak(q.say)}else{f.classList.add("paused");f.style.transform="translateY(200px)";f.style.animation="none"}})}
 if(q.kind==="trace"){const wrap=app.querySelector("#draw");const fn=(typeof STROKES!=="undefined"&&STROKES[q.glyph])?setupTraceStrokes:setupTrace;const t=fn(q,wrap,(ok,st)=>{jingle("level");finishQ(true,null,null,st)});app.querySelector("#clr").onclick=()=>t.clear()}
 if(q.kind==="dots"){setupDots(q,app.querySelector("#draw"),(ok,st)=>{finishQ(true,null,null,st)})}
 scrollTo(0,0);setTimeout(()=>{if(view==="play"&&G.cur&&G.cur.q===q)speak(q.say).then(done=>{if(done&&q.playOpts)playOptions(q)})},150);
 clearTimeout(attractT);attractT=setTimeout(()=>{if(view==="play"&&G.cur&&G.cur.q===q&&!G.cur.done){const e=app.querySelector("#ear");if(e)e.classList.add("attract");speak(q.say)}},9000)}
let attractT=null;
async function playOptions(q){const tok=seqToken;const els=Array.prototype.slice.call(app.querySelectorAll(".ans"));
 for(let i=0;i<els.length;i++){if(tok!==seqToken||!G.cur||G.cur.q!==q||G.cur.done)return;const o=q.opts.find(x=>x.v===els[i].dataset.o);els[i].classList.add("hl");await playOne(o&&o.say?o.say:"");els[i].classList.remove("hl");await new Promise(r=>setTimeout(r,150))}}
/* הצגה לפני שאלה: אות חדשה — רואים, שומעים, נוגעים */
function introCard(item){view="play";const L=item.focus;const he=/[\u0590-\u05FF]/.test(L);const w=he?pick(wordsBy(x=>x.w[0]===L)||[]):null;const ew=!he?EN.find(x=>x.w[0]===L.toLowerCase()&&x.c!=="color"):null;
 const nameSay=he?[LETNAME[L]]:[{en:L}];const exSay=he&&w?[w.s]:(ew?[{en:ew.w}]:[]);
 app.innerHTML=`<div class="hud"><button class="x" id="quit" aria-label="חזרה">✕</button><div class="dots"></div><span class="pill" id="hc">👥 ${S.coins}</span></div>
 <div class="card play"><div class="row-tag"><span class="tag">${item.reteach?"נלמד שוב ביחד 🤝":"אות חדשה ✨"}</span></div>
 <div class="pz"><button class="live ${he?"":"en"}" id="live">${L}${he?"":"<small>"+L.toLowerCase()+"</small>"}</button>
 <div class="prompt">${he?"הָאוֹת "+L+"׳":L}</div>
 ${(w||ew)?`<button class="ans pic ex" id="ex">${picHtml((w||ew).e)}<span class="${he?"he-word":"en-word"}">${he?w.s:ew.w}</span></button>`:""}
 <p class="muted">נוגעים באות ושומעים אותה</p></div>
 <button class="next" id="nx">הבנתי, שואלים! ←</button></div>`;
 const liveTap=()=>{const b=app.querySelector("#live");b.classList.remove("hit");void b.offsetWidth;b.classList.add("hit");note(PENTA[3],"marimba",0,.4);speak(nameSay)};
 app.querySelector("#live").onclick=liveTap;const ex=app.querySelector("#ex");if(ex)ex.onclick=()=>speak(exSay);
 app.querySelector("#quit").onclick=home;app.querySelector("#nx").onclick=()=>{G.easy=true;ask()};
 setTimeout(()=>speak(["זֹאת הָאוֹת"].concat(nameSay,exSay)),200);scrollTo(0,0)}
function setupSpell(q){const slots=Array.prototype.slice.call(app.querySelectorAll(".slot")),tiles=Array.prototype.slice.call(app.querySelectorAll(".tile"));const fill=[];
 const render=()=>{slots.forEach((sl,k)=>{const t=fill[k];sl.textContent=t!=null?q.tiles[t]:"";sl.classList.toggle("on",t!=null)});tiles.forEach((t,k)=>t.disabled=fill.indexOf(k)>=0||G.cur.done)};
 tiles.forEach((t,k)=>t.onclick=()=>{if(G.cur.done)return;let pos=-1;for(let i=0;i<slots.length;i++)if(fill[i]==null){pos=i;break}if(pos<0)return;fill[pos]=k;tick();render();
  if(q.dir==="rtl")speak([LETNAME[FINAL_TO_BASE[q.tiles[k]]||q.tiles[k]]]);else speak([{en:q.tiles[k]}]);
  if(fill.filter(x=>x!=null).length===slots.length){const got=fill.map(i=>q.tiles[i]);const ok=got.join("|")===q.ans.join("|");finishQ(ok,null,got)}});
 slots.forEach((sl,k)=>sl.onclick=()=>{if(G.cur.done||fill[k]==null)return;fill[k]=null;render()});render()}
function bumpCoins(){const el=document.getElementById("hc");if(el){el.textContent="👥 "+S.coins;el.classList.remove("pop");void el.offsetWidth;el.classList.add("pop")}}
function answer(b){if(G.cur.done)return;const ok=b.dataset.o===G.cur.q.a;finishQ(ok,b)}
function finishQ(ok,b,typed,st){if(G.cur.done)return;const q=G.cur.q;
 /* סולם-רמזים: טעות ראשונה בשאלת-בחירה → אותה שאלה ב-2 אפשרויות */
 if(!ok&&!G.cur.retry&&(q.kind==="opts"||!q.kind||q.kind==="lane"||q.kind==="row")&&q.opts&&q.opts.length>2){G.cur.done=true;hush();if(b)b.classList.add("wrong");tone(false);G.hints++;
  const q2=Object.assign({},q);q2.opts=sh([q.opts.find(o=>o.v===q.a),q.opts.find(o=>o.v!==q.a&&(!b||o.v!==b.dataset.o))||q.opts.find(o=>o.v!==q.a)]);if(q2.kind==="lane")q2.kind="opts";q2._retry=1;
  speak([pick(ENCOURAGE)]).then(()=>{if(view==="play"&&G.cur.q===q){G.retryQ=q2;ask()}});return}
 /* טעות שנייה → ביצוע-מתקן: הנכון מהבהב והילדה לוחצת עליו */
 if(!ok&&G.cur.retry===1&&!G.cur.corrective&&q.opts){G.cur.corrective=true;if(b)b.classList.add("wrong");tone(false);
  app.querySelectorAll(".ans").forEach(x=>{if(x.dataset.o===q.a){x.classList.add("hintblink");x.disabled=false;x.onclick=()=>{x.classList.remove("hintblink");finishQ(false,null,null,null,true)}}else x.disabled=true});
  speak(["לַחֲצִי עַל הַתְּשׁוּבָה הַנְּכוֹנָה"].concat(q.after||[]));return}
 G.cur.done=true;hush();const hinted=arguments[4]||G.cur.retry>0;
 if(q.kind==="lane"){const f=app.querySelector(".fall");if(f){f.classList.add("paused")}}
 app.querySelectorAll(".ans").forEach(x=>{x.disabled=true;if(x.dataset.o===q.a)x.classList.add("right")});
 if(b&&!ok)b.classList.add("wrong");
 if(q.kind==="spell"){const sl=app.querySelector(".slots");sl.classList.add(ok?"right":"wrong");app.querySelectorAll(".tile").forEach(t=>t.disabled=true);
  if(!ok)sl.insertAdjacentHTML("afterend",`<div class="slots fix" dir="${q.dir}">${q.ans.map((c,k)=>`<span class="slot on ${q.dir==="ltr"?"wordslot":""} ${typed&&typed[k]!==c?"bad":""}">${c}</span>`).join("")}</div>`)}
 const rt=Date.now()-G.cur.t0;const change=e2record(q.item.step,q.item.sub,ok,rt,hinted);record(q.sk,q.key,ok);G.res.push(ok?(hinted?.5:1):0);
 let gain=0;
 if(ok&&hinted){G.wrongRow=0;gain=5;S.xp+=gain;S.coins+=gain;G.gain+=gain;confetti(16);comboNote(0);const hc=document.getElementById("hc");if(hc)flyTo(b||app.querySelector(".card"),hc,"👥+"+gain)}
 else if(ok){G.combo++;G.wrongRow=0;gain=10+(G.combo>=3?5:0);S.xp+=gain;S.coins+=gain;G.gain+=gain;S.best=Math.max(S.best,G.combo);confetti(G.combo>=3?50:26);comboNote(G.combo-1);if(G.combo>=3)cheer();const hc=document.getElementById("hc");if(hc)flyTo(b||app.querySelector(".card"),hc,"👥+"+gain)}
 else{G.combo=0;G.wrongRow++;S.xp+=2;S.coins+=2;G.gain+=2;
  if(G.retried<2&&G.plan.length<CAP){G.retried++;G.plan.splice(Math.min(G.i+3,G.plan.length),0,Object.assign({},q.item))}
  if(G.wrongRow>=2){G.easy=true;G.wrongRow=0}}
 if(change==="step"){G.pendingUp=q.item.step;G.ups.push(q.item.step)}else if(change==="pass"){toast("✨ "+STEPS[q.item.step].n+": עוד חלק נסגר!",1800);jingle("level")}else if(change==="down"){G.easy=true}
 if(!ok)tone(false);save();bumpCoins();
 const praise=pick(PRAISE);const enc=pick(ENCOURAGE);
 const last=G.i>=G.plan.length-1&&!G.easy;
 const ansHtml=q.opts?(q.opts.find(o=>o.v===q.a)||{}).html||q.a:q.a;const starsTxt=st?` ${"⭐".repeat(st)}`:"";
 if(ok){const f=document.createElement("div");f.className="flash";document.body.appendChild(f);setTimeout(()=>f.remove(),250)}
 document.getElementById("fb").innerHTML=ok
  ?`<div class="feedback good">${Math.random()<.5?avatarSvg(avDefaults(),"small cheer"):TURTLE.replace('viewBox','width="54" height="46" viewBox')}<div><b>${PRAISE_SHOW[praise]||praise}${starsTxt} +${gain} 👥</b>${G.combo>=3?"רצף של "+G.combo+"! בונוס!":""}${q.info?"<br>"+q.info:""}</div></div><button class="next" id="nx">${last?"לסיום ⭐":"הבא ←"}</button>`
  :`<div class="feedback bad">${avatarSvg(avDefaults(),"small sad")}<div><b>כמעט! זאת התשובה: <span class="ans-mini">${ansHtml}</span></b>${q.info?"<br>"+q.info:""}<br><span class="muted">+2 👥 על הניסיון</span></div></div><button class="next" id="nx">${last?"לסיום ⭐":"הבא ←"}</button>`;
 const go=()=>{clearTimeout(advT);if(view!=="play"||G.cur.q!==q)return;G.i++;(G.i<G.plan.length||G.easy)?ask():finish()};
 const nx=document.getElementById("nx");const tAns=Date.now();
 nx.onclick=()=>{if(Date.now()-tAns<400)return;go()};
 const seq=ok?[praise].concat(q.after||[]):[enc].concat(q.after||[]);
 const tFb=Date.now();speak(seq).then(done=>{if(done&&view==="play"&&G.cur.q===q){clearTimeout(advT);const minMs=ok?2200:3400;advT=setTimeout(go,Math.max(300,minMs-(Date.now()-tFb)))}});
 advT=setTimeout(go,ok?7000:10000);
 nx.scrollIntoView({behavior:reduce?"auto":"smooth",block:"nearest"})}
function levelUp(step){view="up";const f=document.createElement("div");f.className="flash";document.body.appendChild(f);setTimeout(()=>f.remove(),250);jingle("win");setTimeout(()=>{confetti(50);cheer()},500);const nxt=Object.keys(STEPS).filter(k=>STEPS[k].deps.indexOf(step)>=0&&stepOpen(k));
 app.innerHTML=`<div class="card end"><div class="sticker-new">🏆</div><div class="dancers" style="margin-top:4px"><div class="dance">${avatarSvg(avDefaults(),"lg cheer")}</div></div><h2>סיימת את "${STEPS[step].n}"!</h2>
 <p style="margin:0;font-size:1.15rem">${nxt.length?"נפתח: "+nxt.map(k=>STEPS[k].n).join(" · "):"כל הכבוד! ממשיכים הלאה"} 💪</p>
 <button class="big" id="go">יאללה, ממשיכים!</button></div>`;
 speak([SAY_LEVELUP]);app.querySelector("#go").onclick=()=>ask();scrollTo(0,0)}
function bonus(){view="bonus";hush();const pool=sh(wordsBy(w=>w.w.length<=4)).slice(0,4);const L=sh(pool),Rr=sh(pool);let sel=null,done=0;
 app.innerHTML=`<div class="hud"><span class="pill" id="hc">👥 ${S.coins}</span></div>
 <div class="card"><span class="tag">שלב בונוס ⭐</span><div class="prompt">חברי כל מילה לתמונה שלה!</div>
 <div class="match"><div class="col">${L.map(w=>`<button class="mt he-word" data-w="${w.w}">${w.s}</button>`).join("")}</div><div class="col">${Rr.map(w=>`<button class="mt pic" data-p="${w.w}">${picHtml(w.e)}</button>`).join("")}</div></div>
 <button class="back" id="skip" style="align-self:center">דלגי על הבונוס</button></div>`;
 speak(["חַבְּרִי כָּל מִלָּה לַתְּמוּנָה שֶׁלָּהּ"]);
 const end=()=>{G.bonus=true;finish()};app.querySelector("#skip").onclick=end;
 app.querySelectorAll(".mt").forEach(b=>b.onclick=()=>{if(b.classList.contains("done"))return;
  if(b.dataset.w){speak([WORD_BY(b.dataset.w).s]);app.querySelectorAll("[data-w]").forEach(x=>x.classList.remove("sel"));b.classList.add("sel");sel=b.dataset.w;return}
  if(!sel){b.classList.add("wiggle");setTimeout(()=>b.classList.remove("wiggle"),400);toast("קודם בוחרים מילה, ואז את התמונה שלה",2000);return}
  const lw=app.querySelector(`[data-w="${sel}"]`);
  if(b.dataset.p===sel){[lw,b].forEach(x=>{x.classList.remove("sel");x.classList.add("done")});done++;S.coins+=5;S.xp+=5;G.gain+=5;bumpCoins();tone(true);confetti(20);sel=null;
   if(done===4){save();setTimeout(end,900)}}
  else{tone(false);b.classList.add("wiggle");setTimeout(()=>b.classList.remove("wiggle"),400)}})}
function finish(){
 if(!G.encore){G.encore=true;const okItems=G.plan.filter((it,k)=>G.res[k]===1&&(it.role==="focus"||it.role==="place"));if(okItems.length){const it=Object.assign({},pick(okItems),{role:"encore"});G.plan.push(it);toast("🎤 הדרן! עוד פעם אחת, את כבר יודעת אותה",1800);ask();return}}
 if(!G.bonus){if(S.sessions.length%2===1)danceBreak();else bonus();return}view="end";hush();const right=G.res.reduce((a,b)=>a+b,0),tot=G.res.length,pct=tot?right/tot:0;
 const st=pct>=.85?3:pct>=.6?2:Math.max(1,pct>=.5?1:0);const lv=G.step;let firstClear=false;
 if(lv!=null){firstClear=!S.levels[lv]&&st>0;if(st>(S.levels[lv]||0))S.levels[lv]=st;if(firstClear){S.coins+=20;G.gain+=20}}
 S.sessions.push({d:Date.now(),r:right,t:tot,f:G.step||"",h:G.hints});
 let newSticker=null;const earned=Math.min(STICKERS.length,S.sessions.length);
 while(S.stickers.length<earned){newSticker=STICKERS[S.stickers.length];S.stickers.push(newSticker)}
 save();
 const by={};G.plan.forEach((it,k)=>{if(k>=G.res.length)return;(by[it.step]=by[it.step]||[]).push(G.res[k])});
 const good=Object.keys(by).filter(k=>by[k].every(x=>x)),work=Object.keys(by).filter(k=>by[k].some(x=>!x));const NM=k=>STEPS[k].n;
 app.innerHTML=`<div class="card end">
  <div class="bigstars">${[0,1,2].map(i=>`<span style="color:${i<st?"var(--sun)":"#d9e3e7"}">★</span>`).join("")}</div>
  ${lv?`<span class="tag">${STEPS[lv].n}</span>`:`<span class="tag">הופעה</span>`}
  <h2>${st===3?"מושלם! הקהל משתגע!":st===2?"כל הכבוד, "+KID()+"!":"עברת! הקהל מריע 👏"}</h2>
  ${firstClear?`<p style="margin:0">+20 👥 בונוס על הופעה חדשה</p>`:""}
  <p style="font-size:1.2rem;margin:0">${right} נכונות מתוך ${tot} · ${G.gain} מעריצים חדשים 👥</p>
  ${G.ups.length?`<p style="margin:0">🏆 סיימת: ${G.ups.map(k=>STEPS[k].n).join(", ")}</p>`:""}
  ${newSticker?`<div class="sticker-new">${newSticker}</div><p style="margin:0">קיבלת מדבקה חדשה לאוסף!</p>`:""}
  ${good.length?`<div><p class="muted" style="margin:0 0 6px">הצלחת בגדול:</p><div class="chips">${good.map(k=>`<span class="chip g">${NM(k)}</span>`).join("")}</div></div>`:""}
  ${work.length?`<div><p class="muted" style="margin:0 0 6px">טיקי יחזק איתך בפעם הבאה:</p><div class="chips">${work.map(k=>`<span class="chip r">${NM(k)}</span>`).join("")}</div></div>`:""}
  <button class="big" id="again" style="margin-top:6px">עוד הופעה! 🎤</button>
  <button class="back" id="home" style="align-self:center">→ למפה</button></div>`;
 if(st>0){confetti(st===3||firstClear?50:40);jingle("win");cheer();speak([st===3?"מֻשְׁלָם! שְׁלוֹשָׁה כּוֹכָבִים!":st===2?"כָּל הַכָּבוֹד! שְׁנֵי כּוֹכָבִים!":"עָבַרְתְּ! כּוֹכָב אֶחָד!"].concat(newSticker?["וְקִבַּלְתְּ מַדְבֵּקָה חֲדָשָׁה!"]:[]))}
 else speak(["כִּמְעַט! בּוֹאִי נְנַסֶּה שׁוּב"]);
 app.querySelector("#again").onclick=()=>start(null);app.querySelector("#home").onclick=home;scrollTo(0,0)}

/* ---------- stickers ---------- */
function collection(){view="col";hush();app.innerHTML=`<div class="panel"><button class="back" id="b">→ למפה</button><h2>המדבקות של ${KID()}</h2>
 <p>כל הופעה שמסיימים = מדבקה חדשה. יש לך ${S.stickers.length} מתוך ${STICKERS.length}.</p>
 <div class="stickers">${STICKERS.map((s,i)=>`<div class="stk ${i<S.stickers.length?"":"locked"}">${i<S.stickers.length?s:"?"}</div>`).join("")}</div>
 <p class="muted">הרצף הכי ארוך שלך: ${S.best} תשובות נכונות ברצף 🔥</p></div>`;
 app.querySelector("#b").onclick=home;scrollTo(0,0)}

/* ---------- אבחון קול ---------- */
function soundDiag(){view="diag";hush();const w=WORDS.filter(hasClip)[0];const src=w?AUDIO["he:"+w.w]:"";const standalone=!!(navigator.standalone||matchMedia("(display-mode: standalone)").matches);
 const info=()=>`גרסה ${window.APP_VER} · קליפים ${Object.keys(AUDIO).length} · ${standalone?"מותקן במסך הבית":"בדפדפן"} · נגן משוחרר: ${audioReady?"כן":"לא"} · AudioContext: ${ac?ac.state:"אין"} · שגיאה אחרונה: ${lastAudioErr||"אין"}`;
 app.innerHTML=`<div class="panel"><button class="back" id="b">→ להורים</button><h2>אבחון קול 🔧</h2><p>לוחצים על כל כפתור ומסמנים מה נשמע. הסטטוס מתעדכן אחרי כל ניסיון.</p>
 <p class="muted" id="st">${info()}</p>
 <button class="btn" id="t1">1️⃣ נגן &lt;audio&gt; — המילה "${w?w.w:""}"</button>
 <button class="btn" id="t2">2️⃣ Web Audio (פענוח) — אותה מילה</button>
 <button class="btn" id="t3">3️⃣ צליל סינתטי (ביפ)</button>
 <button class="btn light" id="t4">4️⃣ רענון מלא של האפליקציה</button></div>`;
 const upd=()=>{const el=document.getElementById("st");if(el)el.textContent=info()};
 app.querySelector("#b").onclick=parents;
 app.querySelector("#t1").onclick=()=>{lastAudioErr="";try{P.pause();P.src=src;const pr=P.play();if(pr&&pr.then)pr.then(()=>{audioReady=true;toast("נגן: הצליח ✓",1500);upd()},e=>{lastAudioErr="play:"+e.name+" "+e.message;toast("נגן נכשל: "+e.name,3000);upd()})}catch(e){lastAudioErr="throw:"+e.name;upd()}};
 app.querySelector("#t2").onclick=()=>{lastAudioErr="";playViaCtx(src).then(ok=>{toast(ok?"Web Audio: הצליח ✓":"Web Audio נכשל: "+lastAudioErr,3000);upd()})};
 app.querySelector("#t3").onclick=()=>{try{ctx();note(PENTA[4],"bell",0,.6);toast("ביפ נשלח · AudioContext: "+(ac?ac.state:"אין"),2000)}catch(e){toast("ביפ נכשל: "+e.name,2000)}upd()};
 app.querySelector("#t4").onclick=()=>{if("serviceWorker" in navigator)navigator.serviceWorker.getRegistrations().then(rs=>rs.forEach(r=>r.unregister()));if(window.caches)caches.keys().then(ks=>Promise.all(ks.map(k=>caches.delete(k)))).then(()=>location.reload(true));else location.reload(true)};
 scrollTo(0,0)}

/* ---------- parents (מאחורי שער) ---------- */
let confirmReset=false;
function parentGate(){view="gate";hush();const a=rnd(3,9),b=rnd(2,9);
 app.innerHTML=`<div class="card end"><span class="tag">להורים</span><h2>כמה זה ${a} × ${b}?</h2><input type="text" id="g" inputmode="numeric" pattern="[0-9]*" style="font-size:1.6rem;text-align:center;max-width:160px" aria-label="תשובה"><button class="big" id="ok">כניסה</button><button class="back" id="h" style="align-self:center">→ למפה</button></div>`;
 const chk=()=>{if(+app.querySelector("#g").value===a*b)parents();else{toast("לא נכון 🙂",1200)}};app.querySelector("#ok").onclick=chk;app.querySelector("#g").onkeydown=e=>{if(e.key==="Enter")chk()};app.querySelector("#h").onclick=home;app.querySelector("#g").focus()}
function parents(){view="par";hush();const L=parentLists();const days=new Set(S.sessions.map(s=>new Date(s.d).toDateString())).size;
 const rows=Object.keys(STEPS).map(k=>{const T=STEPS[k];const p=stepProgress(k);const open=stepOpen(k);const subs=subKeys(k);let n=0,c=0,hint=0,rts=[];subs.forEach(sb=>{const st=subState(k,sb);n+=st.n;c+=st.h.reduce((a,b)=>a+b,0)+(st.box?0:0);hint+=st.nh;rts=rts.concat(st.rt)});rts.sort((a,b)=>a-b);const med=rts.length?Math.round(rts[Math.floor(rts.length/2)]/100)/10:0;
  const lab=stepPassed(k)?["var(--leaf)","עברה"]:!open?["#c3ced3","נעול"]:p>0?["var(--sun)","בתהליך"]:n?["var(--coral)","לומדת"]:["#c3ced3","טרם"];
  return`<tr><td>${DOMAIN_NAME[T.d]}</td><td>${T.n}</td><td><span class="lvl-dot" style="background:${lab[0]}"></span>${lab[1]}</td><td style="font-variant-numeric:tabular-nums">${Math.round(p*100)}%</td><td style="font-variant-numeric:tabular-nums">${n}</td><td style="font-variant-numeric:tabular-nums">${med?med+" ש'":"–"}</td></tr>`}).join("");
 const lst=(arr,cls)=>arr.length?`<div class="chips" style="justify-content:flex-start">${arr.slice(0,24).map(x=>`<span class="chip ${cls}">${x}</span>`).join("")}${arr.length>24?`<span class="muted">+${arr.length-24}</span>`:""}</div>`:`<p class="muted">עדיין אין.</p>`;
 app.innerHTML=`<div class="panel"><button class="back" id="b">→ למפה</button><h2>פינת הורים</h2>
 <p>${S.sessions.length} הופעות ב-${days} ימים · ${S.q} משימות.</p>
 <p class="muted">שלב נסגר כשכל חלקיו עברו: 4 נכונות ברצף או 8 מתוך 10, בשני ימים שונים. אחר-כך הוא נבדק שוב אחרי יום, 3 ימים, שבוע, שבועיים וחודש.</p>
 <h3>✅ יודעת (נזכרה גם אחרי שבוע)</h3>${lst(L.know,"g")}
 <h3>📚 לומדת עכשיו</h3>${lst(L.now,"")}
 <h3>🤝 כדאי לעשות יחד (נתקע)</h3>${lst(L.stuck,"r")}
 <h3>כל השלבים</h3>
 <div class="tbl"><table><tr><th>תחום</th><th>שלב</th><th>מצב</th><th>התקדמות</th><th>משימות</th><th>זמן חציוני</th></tr>${rows}</table></div>
 <h3>התקנה על המכשיר 📲</h3>
 <p>ב-Safari: שיתוף ⬆️ ואז ״הוסף למסך הבית״. אחרי הפעם הראשונה עובד גם בלי אינטרנט.</p>
 <h3>הגדרות</h3>
 <div class="form2"><input type="text" id="nm" value="${esc(S.name)}" placeholder="שם הילדה" maxlength="20" aria-label="שם"><button class="btn" id="svn">שמירת שם</button></div>
 <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn light" id="snd">צלילי משחק: ${S.sound?"פועלים":"כבויים"}</button>
 <button class="btn light" id="tts">קול מלאכותי כשאין הקלטה: ${S.tts?"פועל":"כבוי"}</button>
 <button class="btn light" id="xfer">📲 העברת התקדמות למכשיר אחר</button>
 <button class="btn light" id="diag">🔧 אבחון קול</button>
 <button class="btn ${confirmReset?"red":"light"}" id="rst">${confirmReset?"לחצו שוב כדי למחוק הכול":"איפוס ההתקדמות"}</button></div>
 <p class="muted">גרסה ${window.APP_VER||"dev"} · הקלטות: ${Object.keys(AUDIO).length} קליפים · שמות-אותיות מוקלטים ${clipCoverage()} · ההתקדמות נשמרת במכשיר הזה.</p></div>`;
 app.querySelector("#b").onclick=()=>{confirmReset=false;home()};
 app.querySelector("#svn").onclick=()=>{S.name=app.querySelector("#nm").value.trim().slice(0,20);save();toast("נשמר ✓",1500)};
 app.querySelector("#snd").onclick=()=>{S.sound=!S.sound;save();parents()};
 app.querySelector("#tts").onclick=()=>{S.tts=!S.tts;save();parents()};
 app.querySelector("#xfer").onclick=transfer;app.querySelector("#diag").onclick=soundDiag;
 app.querySelector("#rst").onclick=()=>{if(!confirmReset){confirmReset=true;parents();return}const nm=S.name;S=fresh();S.name=nm;confirmReset=false;save();parents()};
 scrollTo(0,0)}
function keySk(key){const p=key.split(":")[0];const map={let:"let",sound:"sound",syl:"rhyme",rhyme:"rhyme",build:"word",read:"word",nsyl:"nik",nik:"nik",seq:"num",between:"num",after:"num",before:"num",cmpn:"num",cmp:"num",hear:"num",count:"num",ten:"calc",sub:"calc",add:"calc",shape:"think",sides:"think",pat:"think",dir:"think",size:"think",odd:"think",wr:"write",wrn:"write",wrw:"write",wre:"write",dots:"num",phon:"abc",up:"abc",low:"abc",abc:"abc",enprod:"en",enread:"en",enword:"en",en:"en",sb:"sent",sh:"sent"};return map[p]||p}

/* ---------- transfer between devices (no sign-in) ---------- */
const b64u=u=>{let s="";for(let i=0;i<u.length;i+=32768)s+=String.fromCharCode.apply(null,u.subarray(i,i+32768));return btoa(s).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"")};
const ub64=t=>{t=t.replace(/-/g,"+").replace(/_/g,"/");while(t.length%4)t+="=";const b=atob(t);const u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);return u};
function packState(){const json=JSON.stringify(Object.assign({},S,{updatedAt:0}));return "pj-"+b64u(new TextEncoder().encode(json))}
function unpackState(code){code=(code||"").trim();const m=code.match(/pj-([A-Za-z0-9_-]+)/);if(!m)throw 0;const r=JSON.parse(new TextDecoder().decode(ub64(m[1])));if(!r||r.v!==1)throw 0;return r}
function applyState(r){if((r.q||0)>=(S.q||0))S=Object.assign(fresh(),r);else{Object.keys(r.levels||{}).forEach(k=>{if(r.levels[k]>(S.levels[k]||0))S.levels[k]=r.levels[k]});S.coins=Math.max(S.coins,r.coins||0);S.xp=Math.max(S.xp,r.xp||0)}save()}
function transfer(){view="xfer";const code=packState();const link=location.origin+location.pathname+"#"+code;
 app.innerHTML=`<div class="panel"><button class="back" id="b">→ להורים</button><h2>המשך במכשיר אחר 📲</h2>
 <p>ההתקדמות נשמרת בכל מכשיר בנפרד. שולחים את הקישור הזה למכשיר השני (למשל בוואטסאפ) ופותחים אותו שם:</p>
 <textarea id="lnk" readonly dir="ltr" rows="3" aria-label="קישור העברה">${link}</textarea>
 <button class="btn" id="cp">העתקת הקישור</button>
 <h3>או: מדביקים כאן קישור מהמכשיר השני</h3>
 <textarea id="inp" dir="ltr" rows="3" placeholder="הדביקו כאן את הקישור" aria-label="קוד העברה"></textarea>
 <button class="btn" id="imp">טעינת ההתקדמות</button><p class="fbk" id="msg" role="status"></p></div>`;
 app.querySelector("#b").onclick=parents;
 app.querySelector("#cp").onclick=()=>{const t=app.querySelector("#lnk");try{navigator.clipboard.writeText(link).then(()=>toast("הקישור הועתק ✓",2000),()=>{t.select();toast("סמנו והעתיקו את הקישור",2500)})}catch(e){t.select()}};
 app.querySelector("#imp").onclick=()=>{const m=app.querySelector("#msg");try{applyState(unpackState(app.querySelector("#inp").value));m.textContent="ההתקדמות נטענה! ✓";setTimeout(home,900)}catch(e){m.textContent="הקוד לא תקין. העתיקו שוב את כל הקישור."}};
 scrollTo(0,0)}
function importFromHash(){try{const h=decodeURIComponent((location.hash||"").slice(1));if(!/^pj-/.test(h))return false;const r=unpackState(h);
 view="ximp";app.innerHTML=`<div class="card end"><div class="lv-big">📲</div><h2>להמשיך מאיפה שהפסקת?</h2>
  <p style="margin:0;font-size:1.15rem">בקישור יש התקדמות: ${Object.keys(r.levels||{}).length} שלבים · ${r.coins||0} 👥 · ${(r.stickers||[]).length} מדבקות</p>
  <button class="big" id="yes">כן, להמשיך!</button><button class="back" id="no" style="align-self:center">לא, להישאר עם מה שיש כאן</button></div>`;
 const clr=()=>{try{history.replaceState(null,"",location.pathname)}catch(e){}};
 app.querySelector("#yes").onclick=()=>{applyState(r);clr();toast("ההתקדמות נטענה ✓",2000);home()};app.querySelector("#no").onclick=()=>{clr();home()};return true}catch(e){return false}}

/* ---------- boot ---------- */
if(!importFromHash())home();
if("serviceWorker" in navigator){try{navigator.serviceWorker.register("sw.js")}catch(e){}}

/* ---------- רמות 5–6 (כיתות ב–ג) — עוטף את המחוללים הקיימים ---------- */
function numOpts2(a,n,lo,hi){return sh([a].concat(others(Array.from({length:hi-lo+1},(_,i)=>lo+i),[a],n-1))).map(x=>opt(x,String(x),"num"))}
function sayNum(n){if(n<=20)return [NUMNAME[n]];const t=Math.floor(n/10),u=n%10;if(n===100)return [TENS_NAME[10]];return u?[TENS_NAME[t],"וְ",NUMNAME[u]]:[TENS_NAME[t]]}
function clockSvg(h,m){const ha=(h%12)*30+m*.5,ma=m*6;const hand=(a,len,w,c)=>{const r=a*Math.PI/180;return`<line x1="50" y1="50" x2="${50+len*Math.sin(r)}" y2="${50-len*Math.cos(r)}" stroke="${c}" stroke-width="${w}" stroke-linecap="round"/>`};
 return`<svg class="clock" viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="46" fill="#fff" stroke="#3b1d8f" stroke-width="4"/>${[...Array(12)].map((_,i)=>{const r=i*30*Math.PI/180;return`<text x="${50+36*Math.sin(r)}" y="${50-36*Math.cos(r)+4}" font-size="11" font-weight="700" text-anchor="middle" fill="#1b1140">${i===0?12:i}</text>`}).join("")}${hand(ha,22,6,"#1b1140")}${hand(ma,32,4,"#ff5fa2")}<circle cx="50" cy="50" r="3.5" fill="#1b1140"/></svg>`}
const GEN2={
 calc(lv){if(lv<5||Math.random()<.2)return null;const r=Math.random();
  if(lv===5){if(r<.5){const sub=Math.random()<.5;let a,b,ans;if(sub){a=rnd(5,20);b=rnd(1,a-1);ans=a-b}else{a=rnd(2,18);b=rnd(1,20-a);ans=a+b}
    return{sk:"calc",key:(sub?"sub:":"add:")+a+":"+b,tag:"עד 20",p:`${sub?PROMPTS.sub:PROMPTS.add}<span class="eq" dir="ltr">${a} ${sub?"−":"+"} ${b} = ?</span>`,say:[sub?PROMPTS.sub:PROMPTS.add].concat(sayNum(a),[sub?"פָּחוֹת":"וְעוֹד"],sayNum(b)),opts:numOpts2(ans,4,Math.max(0,ans-4),Math.min(20,ans+4)),a:String(ans),after:sayNum(ans)}}
   const a=rnd(1,9),ans=rnd(1,10-a);return{sk:"calc",key:"miss:"+a+":"+ans,tag:"נעלם",p:`${PROMPTS.missing}<span class="eq" dir="ltr">${a} + ? = ${a+ans}</span>`,say:[PROMPTS.missing].concat(sayNum(a),["וְעוֹד כַּמָּה זֶה"],sayNum(a+ans)),opts:numOpts2(ans,4,1,10),a:String(ans),after:sayNum(ans)}}
  if(r<.45){const t=pick([2,5,10,3,4]);const b=rnd(1,10);const ans=t*b;return{sk:"calc",key:"mul:"+t+":"+b,tag:"כפל",p:`${PROMPTS.mult}<span class="eq" dir="ltr">${t} × ${b} = ?</span><div class="calc-pic">${Array.from({length:b},()=>`<span class="grp">${"🔵".repeat(t)}</span>`).join("")}</div>`,say:[PROMPTS.mult].concat(sayNum(t),["כָּפוּל"],sayNum(b)),opts:numOpts2(ans,4,Math.max(0,ans-t*2),Math.min(100,ans+t*2)).filter(o=>+o.v>=0),a:String(ans),after:sayNum(ans)}}
  const sub=Math.random()<.4;let a,b,ans;if(sub){a=rnd(20,99);b=Math.random()<.5?rnd(1,9):rnd(1,Math.floor(a/10))*10;ans=a-b}else{a=rnd(10,80);b=Math.random()<.5?rnd(1,9):rnd(1,Math.floor((99-a)/10))*10;ans=a+b}
  if(ans<0||ans>100)return GEN2.calc(6);
  return{sk:"calc",key:(sub?"sub100:":"add100:")+a+":"+b,tag:"עד 100",p:`${sub?PROMPTS.sub:PROMPTS.add}<span class="eq" dir="ltr">${a} ${sub?"−":"+"} ${b} = ?</span>`,say:[sub?PROMPTS.sub:PROMPTS.add].concat(sayNum(a),[sub?"פָּחוֹת":"וְעוֹד"],sayNum(b)),opts:numOpts2(ans,4,Math.max(0,ans-10),Math.min(100,ans+10)),a:String(ans),after:sayNum(ans)}},
 num(lv){if(lv<5||Math.random()<.2)return null;const r=Math.random();
  if(lv===5){if(r<.4){const n=rnd(11,99);const t=Math.floor(n/10),u=n%10;const mk=(a,b)=>`${a} עשרות ו-${b} אחדות`;const o=sh([[t,u],[u,t],[t,u+1>9?u-1:u+1],[t-1<1?t+1:t-1,u]].filter((x,i,arr)=>arr.findIndex(y=>y[0]===x[0]&&y[1]===x[1])===i).slice(0,4).map(x=>opt(x.join(":"),mk(x[0],x[1]),"")));
    return{sk:"num",key:"tens:"+n,tag:"עשרות ואחדות",p:`${PROMPTS.tens}<span class="num-big">${n}</span>`,say:[PROMPTS.tens].concat(sayNum(n)),opts:o,a:t+":"+u,after:sayNum(n)}}
   if(r<.7){let a=rnd(10,99),b=rnd(10,99);while(b===a)b=rnd(10,99);const big=Math.max(a,b);return{sk:"num",key:"cmp100:"+a+":"+b,tag:"גדול יותר",p:PROMPTS.compareNum,say:[PROMPTS.compareNum].concat(sayNum(a),["אוֹ"],sayNum(b)),opts:[a,b].map(x=>opt(x,String(x),"num")),a:String(big),after:sayNum(big)}}
   const step=pick([5,10,2]);const start=step===10?10:step===5?pick([5,10,15]):rnd(10,40);const seq=[0,1,2,3,4].map(i=>start+i*step);const hole=rnd(1,4);const a=seq[hole];
   return{sk:"num",key:"skip:"+step+":"+start,tag:"קפיצות",p:`${PROMPTS.skip}<span class="num-seq" dir="ltr">${seq.map((x,i)=>i===hole?"_":x).join(" , ")}</span>`,say:[PROMPTS.skip],opts:numOpts2(a,4,Math.max(1,a-step*2),Math.min(100,a+step*2)),a:String(a),after:sayNum(a)}}
  if(r<.35){const n=rnd(1,30);const even=n%2===0;return{sk:"num",key:"eo:"+n,tag:"זוגי / אי-זוגי",p:`${PROMPTS.evenOdd}<span class="num-big">${n}</span><div class="count">${Array.from({length:n},(_,i)=>`<span>${i%2?"🟣":"🟡"}</span>`).join("")}</div>`,say:[PROMPTS.evenOdd].concat(sayNum(n)),opts:[opt("even","זוגי","" ),opt("odd","אי-זוגי","")],a:even?"even":"odd",after:[even?"זוּגִי":"אִי־זוּגִי"]}}
  if(r<.7){const small=Math.random()<.5;const arr=sh(Array.from({length:90},(_,i)=>i+10)).slice(0,3);const a=small?Math.min.apply(null,arr):Math.max.apply(null,arr);return{sk:"num",key:(small?"min:":"max:")+arr.join("-"),tag:small?"הכי קטן":"הכי גדול",p:small?PROMPTS.smallest:PROMPTS.biggest,say:[small?PROMPTS.smallest:PROMPTS.biggest],opts:arr.map(x=>opt(x,String(x),"num")),a:String(a),after:sayNum(a)}}
  const k=rnd(20,98);const after=Math.random()<.5;const a=after?k+1:k-1;return{sk:"num",key:(after?"after100:":"before100:")+k,tag:after?"אחרי":"לפני",p:`${after?PROMPTS.numAfter:PROMPTS.numBefore} <span class="num-big">${k}</span>?`,say:[after?PROMPTS.numAfter:PROMPTS.numBefore].concat(sayNum(k)),opts:numOpts2(a,4,Math.max(1,a-5),Math.min(100,a+5)),a:String(a),after:sayNum(a)}},
 word(lv){if(lv<5||Math.random()<.2)return null;const r=Math.random();
  if(lv===5||r<.4){const sub=pick(HE_SUBJ),vb=pick(HE_VERB);const pool=wordsBy(w=>w.c===vb.c);const ob=pick(pool);const text=`${sub.s} ${sub.g==="m"?vb.m:vb.f} ${ob.s}`;
   const dis=others(pool.filter(x=>x.w!==ob.w),[],2);const mk=(o)=>`<span class="scene"><span class="emo">${picHtml(sub.e)}${picHtml(vb.e)}${picHtml(o.e)}</span></span>`;
   return{sk:"word",key:"sent:"+ob.w,tag:"קריאת משפט",p:`${PROMPTS.sentHe}<span class="he-word big" style="font-size:2rem">${text}</span>`,say:[PROMPTS.sentHe],opts:sh([ob].concat(dis)).map(o=>opt(o.w,mk(o),"pic")),a:ob.w,after:[ob.s]}}
  if(r<.7){const it=pick(OPPOSITES);const flip=Math.random()<.5;const q=flip?it[1]:it[0],a=flip?it[0]:it[1],qe=flip?it[3]:it[2],ae=flip?it[2]:it[3];const dis=sh(OPPOSITES.filter(x=>x!==it)).slice(0,2).map(x=>[x[Math.random()<.5?0:1]]);
   const o=sh([[a,ae]].concat(dis.map(d=>[d[0],""]))).map(x=>opt(x[0],`<span class="he-word">${x[0]}</span>${x[1]?`<span class="emo" style="font-size:2rem">${picHtml(x[1])}</span>`:""}`,"he"));
   return{sk:"word",key:"opp:"+strip(q),tag:"הפכים",p:`${PROMPTS.opp} <span class="he-word">${q}</span>?<span class="emo">${picHtml(qe)}</span>`,say:[PROMPTS.opp,q],opts:o.map(x=>{x.html=x.html.replace(/<span class="emo"[^>]*>[^<]*<\/span>/,"");return x}),a:a,after:[q,"—",a]}}
  const it=pick(PLURALS);const dis=sh(PLURALS.filter(x=>x!==it)).slice(0,2);return{sk:"word",key:"pl:"+strip(it[0]),tag:"יחיד ורבים",p:`${PROMPTS.plural} <span class="he-word">${it[0]}</span>?<span class="emo">${picHtml(it[3])}</span>`,say:[PROMPTS.plural,it[0]],opts:sh([it].concat(dis)).map(x=>opt(x[1],`<span class="he-word">${x[1]}</span>`,"he")),a:it[1],after:[it[1]]}},
 en(lv){if(lv<5||Math.random()<.2)return null;const r=Math.random();
  if(lv===5||r<.5){const w=pick(EN_CVC);const i=rnd(0,2);const miss=w[i];const shown=w.slice(0,i)+"_"+w.slice(i+1);const o=sh([miss].concat(others("abcdefghijklmnopqrstuvwxyz".split(""),[miss],3)));
   return{sk:"en",key:"enmiss:"+w,tag:"אות חסרה",p:`${PROMPTS.enMissing}<span class="emo">${picHtml(EN_CVC_PIC[w])}</span><span class="en-word big">${shown}</span>`,say:[PROMPTS.enMissing,{en:w}],opts:o.map(x=>opt(x,`<span class="en-big">${x}</span>`,"en")),a:miss,after:[{en:w}],info:`<span class="en-word">${w}</span>`}}
  if(r<.8){const it=pick(EN_OPP);const flip=Math.random()<.5;const q=flip?it[1]:it[0],a=flip?it[0]:it[1],qe=flip?it[3]:it[2];const dis=sh(EN_OPP.filter(x=>x!==it)).slice(0,2).map(x=>x[Math.random()<.5?0:1]);
   return{sk:"en",key:"enopp:"+q,tag:"הפכים באנגלית",p:`${PROMPTS.enOpp} <span class="en-word">${q}</span>?<span class="emo">${picHtml(qe)}</span>`,say:[PROMPTS.enOpp,{en:q}],opts:sh([a].concat(dis)).map(x=>opt(x,`<span class="en-word">${x}</span>`,"en")),a:a,after:[{en:q},{en:a}]}}
  const w=pick(EN.filter(x=>x.c==="animal"||x.c==="thing"&&x.w!=="bus"));const pl=w.w+"s";const dis=others(EN.filter(x=>(x.c==="animal"||x.c==="thing")&&x.w!==w.w),[],2).map(x=>x.w+"s");
  return{sk:"en",key:"enpl:"+w.w,tag:"רבים באנגלית",p:`${PROMPTS.enPlural} <span class="en-word">${w.w}</span>?<span class="emo">${picHtml(w.e)}${picHtml(w.e)}</span>`,say:[PROMPTS.enPlural,{en:w.w}],opts:sh([pl].concat(dis)).map(x=>opt(x,`<span class="en-word">${x}</span>`,"en")),a:pl,after:[{en:pl}]}},
 think(lv){if(lv<5||Math.random()<.25)return null;const h=rnd(1,12);const m=lv===5?0:pick([0,30]);const fmt=(hh,mm)=>`${hh}:${mm?"30":"00"}`;const say=m?["הַשָּׁעָה"].concat(sayNum(h),["וָחֵצִי"]):["הַשָּׁעָה"].concat(sayNum(h));
  const alts=[[h,m],[h%12+1,m],[h===1?12:h-1,m],[h,m?0:30]];const o=sh(alts.filter((x,i,a)=>a.findIndex(y=>y[0]===x[0]&&y[1]===x[1])===i)).map(x=>opt(fmt(x[0],x[1]),`<span class="num-big">${fmt(x[0],x[1])}</span>`,"num"));
  return{sk:"think",key:"clock:"+fmt(h,m),tag:"שעון",p:`${PROMPTS.clock}<div class="shape-big">${clockSvg(h,m)}</div>`,say:[PROMPTS.clock],opts:o,a:fmt(h,m),after:say}},
 nik(lv){if(lv<5||Math.random()<.3)return null;const sub=pick(HE_SUBJ),vb=pick(HE_VERB);const pool=wordsBy(w=>w.c===vb.c);const ob=pick(pool);const text=`${sub.s} ${sub.g==="m"?vb.m:vb.f} ${ob.s}`;const dis=others(pool.filter(x=>x.w!==ob.w),[],2);
  return{sk:"nik",key:"nsent:"+ob.w,tag:"קריאה מנוקדת",p:`${PROMPTS.nikPhrase}<span class="he-word big" style="font-size:2rem">${text}</span>`,say:[PROMPTS.nikPhrase],opts:sh([ob].concat(dis)).map(o=>opt(o.w,`<span class="emo">${picHtml(sub.e)}${picHtml(vb.e)}${picHtml(o.e)}</span>`,"pic")),a:ob.w,after:[ob.s]}},
 abc(lv){if(lv<5||Math.random()<.4)return null;const U="ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");const i=rnd(0,24);const a=U[i+1];
  return{sk:"abc",key:"abcafter:"+U[i],tag:"סדר האלפבית",p:`${PROMPTS.abcAfter} <span class="en-big">${U[i]}</span>?`,say:[PROMPTS.abcAfter,{en:U[i]}],opts:sh([a].concat(others(U,[a,U[i]],3))).map(x=>opt(x,`<span class="en-big">${x}</span>`,"en")),a:a,after:[{en:U[i]},{en:a}]}}
};
Object.keys(GEN2).forEach(k=>{const orig=GEN[k];GEN[k]=(lv,focus)=>GEN2[k](lv)||orig(Math.min(lv,4),focus)});
