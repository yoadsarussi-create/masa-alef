/* games3.js — עוד מכניקות מהחוברת: מבוך, מבוך-אותיות, רכבת-מספרים, > < =, סודרים, ארוך/קצר. הקשה בלבד (בלי גרירה). */
"use strict";
Object.assign(PROMPTS,{
 maze:"עִזְרִי לַצָּב לְהַגִּיעַ הַבַּיְתָה. לוֹחֲצִים עַל הַמִּשְׁבֶּצֶת הַבָּאָה",letMaze:"לְכִי בַּדֶּרֶךְ לְפִי סֵדֶר הָאוֹתִיּוֹת",
 train:"סַדְּרִי אֶת הַקְּרוֹנוֹת לְפִי הַסֵּדֶר",cmpSign:"אֵיפֹה יוֹתֵר? בַּחֲרִי סִימָן",
 ordinal:"לַחֲצִי עַל",ordFromLeft:"מִשְּׂמֹאל",ordFromRight:"מִיָּמִין",longest:"לַחֲצִי עַל הֲכִי אָרֹךְ",shortest:"לַחֲצִי עַל הֲכִי קָצָר"});
const ORD=["הָרִאשׁוֹן","הַשֵּׁנִי","הַשְּׁלִישִׁי","הָרְבִיעִי","הַחֲמִישִׁי"],ORD_SHOW=["הראשון","השני","השלישי","הרביעי","החמישי"];

/* ---------- מבוך (DFS על רשת), הקשה על משבצת שכנה ---------- */
function makeMaze(W,H){const cells=Array.from({length:W*H},()=>({w:[1,1,1,1],v:0}));/* N E S W */const st=[0];cells[0].v=1;
 while(st.length){const c=st[st.length-1],x=c%W,y=(c/W)|0;const nb=[[0,-1,0,2],[1,0,1,3],[0,1,2,0],[-1,0,3,1]].map(([dx,dy,a,b])=>[x+dx,y+dy,a,b]).filter(([nx,ny])=>nx>=0&&ny>=0&&nx<W&&ny<H&&!cells[ny*W+nx].v);
  if(!nb.length){st.pop();continue}const [nx,ny,a,b]=pick(nb);const n=ny*W+nx;cells[c].w[a]=0;cells[n].w[b]=0;cells[n].v=1;st.push(n)}return cells}
function mazeQ(sk,lv){const W=lv>=2?6:5,H=lv>=2?6:5;return{sk:sk,key:"maze:"+W+":"+rnd(1,999),tag:"איך מגיעים?",kind:"maze",W:W,H:H,cells:makeMaze(W,H),p:"עִזְרִי לַצָּב לְהַגִּיעַ הַבַּיְתָה 🏠",say:[PROMPTS.maze],a:"done",after:[]}}
function mazeHtml(q){const W=q.W,H=q.H;let html=`<div class="maze" dir="ltr" style="grid-template-columns:repeat(${W},1fr)">`;
 q.cells.forEach((c,i)=>{const s=["n","e","s","w"].filter((_,k)=>c.w[k]).map(x=>"w"+x).join(" ");html+=`<button class="mz ${s}" data-i="${i}">${i===0?'<span class="who">'+picHtml("🐢")+'</span>':i===W*H-1?picHtml("🏠"):""}</button>`});return html+"</div>"}
function mazeSetup(q){const W=q.W,H=q.H;let pos=0,steps=0,bumps=0;const els=app.querySelectorAll(".mz");els[0].classList.add("trail");
 const canMove=(a,b)=>{const ax=a%W,ay=(a/W)|0,bx=b%W,by=(b/W)|0;const dx=bx-ax,dy=by-ay;if(Math.abs(dx)+Math.abs(dy)!==1)return false;const k=dy===-1?0:dx===1?1:dy===1?2:3;return !q.cells[a].w[k]};
 els.forEach(b=>b.onclick=()=>{if(G.cur.done)return;const t=+b.dataset.i;if(t===pos)return;
  if(canMove(pos,t)){const who=els[pos].querySelector(".who");els[pos].innerHTML="";pos=t;steps++;els[t].classList.add("trail");
   if(t===W*H-1){els[t].innerHTML='<span class="who">'+picHtml("🐢")+'</span>'+picHtml("🏠");speak([{sfx:"level"}]);finishQ(true,null,null,bumps<=2?3:bumps<=5?2:1)}else{els[t].innerHTML='<span class="who">'+picHtml("🐢")+'</span>';speak([{sfx:"tick"}],0)}}
  else{bumps++;b.classList.remove("wiggle");void b.offsetWidth;b.classList.add("wiggle");speak([{sfx:"wrong"}],0)}})}

/* ---------- מבוך-אותיות: רשת אותיות, לוחצים על האות הבאה בסדר (שכנה) ---------- */
function letMazeQ(sk,lv){const len=lv>=2?10:6;const start=rnd(0,LETTERS.length-len);const seq=LETTERS.slice(start,start+len);const W=lv>=2?5:4,H=lv>=2?5:4;
 /* מסלול אקראי של len משבצות שכנות */let path=null;for(let t=0;t<200&&!path;t++){const p=[rnd(0,W*H-1)];while(p.length<len){const c=p[p.length-1],x=c%W,y=(c/W)|0;const nb=[[1,0],[-1,0],[0,1],[0,-1]].map(([dx,dy])=>[x+dx,y+dy]).filter(([a,b])=>a>=0&&b>=0&&a<W&&b<H).map(([a,b])=>b*W+a).filter(n=>p.indexOf(n)<0);if(!nb.length)break;p.push(pick(nb))}if(p.length===len)path=p}
 const grid=Array.from({length:W*H},()=>pick(LETTERS.filter(l=>seq.indexOf(l)<0)));path.forEach((c,i)=>grid[c]=seq[i]);
 return{sk:sk,key:"lmaze:"+seq[0],tag:"מבוך האותיות",kind:"lmaze",W:W,grid:grid,path:path,seq:seq,p:`${PROMPTS.letMaze}: ${seq[0]} ← ${seq[seq.length-1]}`,say:[PROMPTS.letMaze],a:"done",after:[]}}
function lmazeHtml(q){return`<div class="maze lm" style="grid-template-columns:repeat(${q.W},1fr)">${q.grid.map((l,i)=>`<button class="mz lmz ${i===q.path[0]?"trail start":""}" data-i="${i}">${l}</button>`).join("")}</div>`}
function lmazeSetup(q){let k=0,err=0;const W=q.W;const els=app.querySelectorAll(".lmz");speak([LETNAME[q.seq[0]]]);
 els.forEach(b=>b.onclick=()=>{if(G.cur.done)return;const i=+b.dataset.i;const next=q.path[k+1];const cur=q.path[k];const adj=Math.abs(i%W-cur%W)+Math.abs(((i/W)|0)-((cur/W)|0))===1;
  if(i===next&&adj){k++;b.classList.add("trail");speak([{sfx:"tick"},LETNAME[q.seq[k]]],0);if(k===q.path.length-1)finishQ(true,null,null,err===0?3:err<=2?2:1)}
  else if(!b.classList.contains("trail")){err++;b.classList.remove("wiggle");void b.offsetWidth;b.classList.add("wiggle");speak([{sfx:"wrong"}],0);if(err>=3)els[next].classList.add("hintblink")}})}

/* ---------- רכבת-מספרים: לוחצים על הקרונות לפי הסדר ---------- */
function trainQ(sk,lv){const n=lv>=2?6:4;const step=lv>=3?pick([1,2]):1;const start=lv>=2?rnd(1,20-(n-1)*step):1;const nums=Array.from({length:n},(_,i)=>start+i*step);
 return{sk:sk,key:"train:"+start+":"+step,tag:"רכבת מספרים",kind:"train",nums:nums,shuf:sh(nums),p:"סַדְּרִי אֶת הַקְּרוֹנוֹת לְפִי הַסֵּדֶר 🚂",say:[PROMPTS.train],a:"done",after:nums.map(x=>NUMNAME[x]||String(x))}}
function trainHtml(q){return`<div class="train" dir="ltr"><span class="loco">${picHtml("🚂")}</span>${q.nums.map((_,i)=>`<span class="car empty" data-k="${i}"></span>`).join("")}</div>
 <div class="cars">${q.shuf.map(x=>`<button class="car src" data-v="${x}">${x}</button>`).join("")}</div>`}
function trainSetup(q){let k=0,err=0;const slots=app.querySelectorAll(".train .car");
 app.querySelectorAll(".car.src").forEach(b=>b.onclick=()=>{if(G.cur.done||b.disabled)return;const v=+b.dataset.v;
  if(v===q.nums[k]){slots[k].textContent=v;slots[k].classList.remove("empty");slots[k].classList.add("pop-in");b.disabled=true;k++;speak([{sfx:"tick"},NUMNAME[v]||String(v)],0);
   if(k===q.nums.length){const t=app.querySelector(".train");t.classList.add("go");finishQ(true,null,null,err===0?3:err<=1?2:1)}}
  else{err++;b.classList.remove("wiggle");void b.offsetWidth;b.classList.add("wiggle");speak([{sfx:"wrong"}],0)}})}

/* ---------- > < = בין שתי קבוצות ---------- */
function signQ(sk,lv){const max=lv>=2?10:6;let a=rnd(1,max),b=rnd(1,max);if(Math.random()<.25)b=a;const e=pick(COUNT_EMO),e2=pick(COUNT_EMO.filter(x=>x!==e));const ans=a>b?">":a<b?"<":"=";
 const grp=(n,em)=>`<div class="sgrp">${Array.from({length:n},()=>`<span>${picHtml(em)}</span>`).join("")}</div>`;
 return{sk:sk,key:"sign:"+a+":"+b,tag:"יותר / פחות / שווה",p:`${PROMPTS.cmpSign}<div class="signrow" dir="ltr">${grp(a,e)}<span class="slotsign">?</span>${grp(b,e2)}</div>`,say:[PROMPTS.cmpSign],
  opts:[">","=","<"].map(s=>opt(s,`<span class="num-big">${s}</span>`,"num")),a:ans,after:[NUMNAME[a],ans==="="?"שָׁוֶה לְ":ans===">"?"יוֹתֵר מִ":"פָּחוֹת מִ",NUMNAME[b]]}}

/* ---------- סודרים: "לחצי על השלישי משמאל" עם חץ ---------- */
function ordQ(sk,lv){const n=5;const fromLeft=lv>=2?Math.random()<.6:true;const k=rnd(0,lv>=2?4:2);const w=pick(clearWords());const idx=fromLeft?k:n-1-k;
 const dirSay=fromLeft?PROMPTS.ordFromLeft:PROMPTS.ordFromRight;
 return{sk:sk,key:"ord:"+(fromLeft?"L":"R")+k,tag:"מי בתור?",kind:"row",p:`${PROMPTS.ordinal} ${ORD_SHOW[k]} ${fromLeft?"משמאל":"מימין"} <span class="ordarrow">${fromLeft?"➡️":"⬅️"}</span>`,
  say:[PROMPTS.ordinal,ORD[k],dirSay],opts:Array.from({length:n},(_,i)=>opt(i,picHtml(w.e),"pic")),a:String(idx),after:[ORD[k]],arrow:fromLeft?"L":"R"}}

/* ---------- ארוך/קצר ---------- */
function lenQ(sk,lv){const long=Math.random()<.5;const n=lv>=2?4:3;const lens=sh([40,58,76,94].slice(0,n));const ans=long?Math.max.apply(null,lens):Math.min.apply(null,lens);const col=pick(["#FF5C8A","#2ED8C3","#FFD93D","#FF9F43"]);
 const bar=l=>`<svg viewBox="0 0 100 24" class="lenbar"><rect x="${(100-l)/2}" y="4" width="${l}" height="16" rx="8" fill="${col}" stroke="#1E1B3A" stroke-width="2.5"/><polygon points="${(100+l)/2},4 ${(100+l)/2+8},12 ${(100+l)/2},20" fill="#1E1B3A"/></svg>`;
 return{sk:sk,key:"len:"+(long?"L":"S"),tag:long?"הכי ארוך":"הכי קצר",p:long?PROMPTS.longest:PROMPTS.shortest,say:[long?PROMPTS.longest:PROMPTS.shortest],
  opts:lens.map(l=>opt(l,bar(l),"wide")),a:String(ans),after:[long?"הֲכִי אָרֹךְ":"הֲכִי קָצָר"],wide:true}}

Object.assign(KINDS,{maze:{html:mazeHtml,setup:mazeSetup},lmaze:{html:lmazeHtml,setup:lmazeSetup},train:{html:trainHtml,setup:trainSetup}});
Object.assign(GEN,{maze(lv){return mazeQ("think",lv)},lmaze(lv){return letMazeQ("let",lv)},train(lv){return trainQ("num",lv)},sign(lv){return signQ("num",lv)},ord(lv){return ordQ("num",lv)},len(lv){return lenQ("think",lv)}});
(function wire(){const add=(st,g)=>{if(STEPS[st])STEPS[st].gens=STEPS[st].gens.concat(g)};
 add("ma2",[["train",1],["ord",1],["len",1]]);add("ma3",[["train",2],["sign",1]]);add("ma5",[["sign",2],["train",3]]);add("ma7",[["maze",1],["len",2],["ord",2]]);add("he1",[["maze",1]]);add("he4",[["lmaze",1]]);add("he6",[["lmaze",2]]);})();
