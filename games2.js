/* games2.js — מכניקות מהחוברות של אגם: סמני-את-כל, השלמה-לכמות, צבע-לפי-מספר, מילה-יוצאת-דופן. Safari 15. */
"use strict";
Object.assign(PROMPTS,{
 markNum:"סַמְּנִי אֶת כָּל הַמִּסְפָּרִים",markLet:"סַמְּנִי אֶת כָּל הָאוֹתִיּוֹת",markCat:"סַמְּנִי אֶת כָּל",
 addTo:"הוֹסִיפִי עַד שֶׁיִּהְיוּ",addEqual:"הוֹסִיפִי עַד שֶׁיִּהְיֶה אוֹתוֹ מִסְפָּר כְּמוֹ בַּקֻּפְסָה",check:"סִיַּמְתִּי",
 paint:"צִבְעִי לְפִי הַמִּסְפָּרִים. בּוֹחֲרִים צֶבַע וְלוֹחֲצִים עַל הַחֵלֶק",oddWord:"אֵיזוֹ מִלָּה שׁוֹנָה מִכֻּלָּן?"});
const CAT_SAY={animal:"הַחַיּוֹת",food:"הָאֹכֶל",vehicle:"כְּלֵי הַתַּחְבּוּרָה",nature:"הַדְּבָרִים מֵהַטֶּבַע",clothes:"הַבְּגָדִים",body:"חֶלְקֵי הַגּוּף"};
const CAT_SHOW={animal:"החיות",food:"האוכל",vehicle:"כלי התחבורה",nature:"הדברים מהטבע",clothes:"הבגדים",body:"חלקי הגוף"};

/* ---------- 1. סמני את כל… ---------- */
function multiQ(sk,lv,focus,mode){mode=mode||(focus?"let":pick(["num","cat"]));const n=lv>=2?10:8;let items=[],say,p,key,tag;
 if(mode==="num"){const t=rnd(1,lv>=2?9:5);const pool=Array.from({length:9},(_,i)=>i+1).filter(x=>x!==t);const k=rnd(2,4);
  for(let i=0;i<k;i++)items.push({v:String(t),html:`<span class="num-big">${t}</span>`,ok:true});while(items.length<n)items.push({v:"x",html:`<span class="num-big">${pick(pool)}</span>`,ok:false});
  key="mk:n"+t;tag="הקיפו את המספר";p=`${PROMPTS.markNum} <span class="num-big">${t}</span>`;say=[PROMPTS.markNum,NUMNAME[t]]}
 else if(mode==="let"){const t=focus||pick(LETTERS);const conf=((CONFUSE_SHAPE[t]||"")+(CONFUSE_SOUND[t]||"")).split("").filter(x=>x&&x!==t&&LETTERS.indexOf(x)>=0);const pool=conf.length?conf.concat(others(LETTERS,[t],2)):others(LETTERS,[t],4);const k=rnd(2,4);
  for(let i=0;i<k;i++)items.push({v:t,html:bigHe(t),ok:true});while(items.length<n)items.push({v:"x",html:bigHe(pick(pool)),ok:false});
  key="mk:l"+t;tag="מצאי את האות";p=`${PROMPTS.markLet} <span class="he-word">${t}</span>`;say=[PROMPTS.markLet,LETNAME[t]]}
 else{const cats=Object.keys(CAT_SAY).filter(c=>wordsBy(w=>w.c===c).length>=4);const c=pick(cats);const k=rnd(3,4);const yes=sh(wordsBy(w=>w.c===c)).slice(0,k);const no=sh(clearWords().filter(w=>w.c!==c)).slice(0,n-k);
  yes.forEach(w=>items.push({v:w.w,html:picHtml(w.e),ok:true,say:w.s}));no.forEach(w=>items.push({v:w.w,html:picHtml(w.e),ok:false,say:w.s}));
  key="mk:c"+c;tag="רק "+CAT_SHOW[c];p=`${PROMPTS.markCat} ${CAT_SHOW[c]}`;say=[PROMPTS.markCat,CAT_SAY[c]]}
 return{sk:sk,key:key,tag:tag,kind:"multi",p:p,say:say,items:sh(items),a:"done",after:[]}}
function multiHtml(q){return`<div class="multi-grid ${q.items.length>8?"five":""}">${q.items.map((it,i)=>`<button class="mcell ${/<img/.test(it.html)?"pic":""}" data-i="${i}">${it.html}</button>`).join("")}</div>`}
function multiSetup(q){let err=0,found=0;const need=q.items.filter(x=>x.ok).length;
 app.querySelectorAll(".mcell").forEach(b=>b.onclick=()=>{if(G.cur.done||b.classList.contains("picked"))return;const it=q.items[+b.dataset.i];
  if(it.ok){b.classList.add("picked");found++;speak([{sfx:"tick"}].concat(it.say?[it.say]:[]),40);if(found===need)finishQ(true,null,null,err===0?3:err===1?2:1)}
  else{err++;b.classList.remove("wiggle");void b.offsetWidth;b.classList.add("wiggle");speak([{sfx:"wrong"}].concat(it.say?[it.say]:[]),40);
   if(err>=3){app.querySelectorAll(".mcell").forEach((x,i)=>{if(q.items[i].ok&&!x.classList.contains("picked"))x.classList.add("hintblink")})}}})}

/* ---------- 2. השלמה לכמות / כמות שווה ---------- */
function addtoQ(sk,lv){const equal=lv>=2&&Math.random()<.5;const T=rnd(lv>=2?3:2,lv>=2?8:5);const start=equal?0:rnd(0,Math.max(0,T-2));const e=pick(COUNT_EMO);
 if(equal)return{sk:sk,key:"eq:"+T,tag:"כמות שווה",kind:"addto",equal:true,target:T,start:0,e:e,e2:pick(COUNT_EMO.filter(x=>x!==e)),p:PROMPTS.addEqual,say:[PROMPTS.addEqual],a:"done",after:[NUMNAME[T]]};
 return{sk:sk,key:"add2:"+T,tag:"משלימים לכמות",kind:"addto",target:T,start:start,e:e,p:`${PROMPTS.addTo} <span class="num-big">${T}</span>`,say:[PROMPTS.addTo,NUMNAME[T]],a:"done",after:[NUMNAME[T]]}}
function addtoHtml(q){return`${q.equal?`<div class="box ref">${Array.from({length:q.target},()=>`<span>${picHtml(q.e2)}</span>`).join("")}</div>`:""}
 <div class="box mine" id="mine"></div>
 <div class="row-btns"><button class="btn light addbtn" id="minus" aria-label="פחות">➖</button><button class="big addbtn" id="plus" aria-label="עוד">➕ ${picHtml(q.e)}</button><button class="next" id="chk">✓ ${PROMPTS.check.replace(/[֑-ׇ]/g,"")}</button></div>`}
function addtoSetup(q){let c=q.start,err=0;const box=app.querySelector("#mine");
 const render=()=>{box.innerHTML=Array.from({length:c},(_,i)=>`<span class="pop-in">${picHtml(q.e)}</span>`).join("")||`<i class="muted">ריק</i>`};render();
 app.querySelector("#plus").onclick=()=>{if(G.cur.done||c>=12)return;c++;render();speak([{sfx:"tick"},NUMNAME[c]],30)};
 app.querySelector("#minus").onclick=()=>{if(G.cur.done||c<=0)return;c--;render();speak([{sfx:"tick"},NUMNAME[c]],30)};
 box.onclick=()=>{if(G.cur.done)return;speak([NUMNAME[c]||"אֶפֶס"])};
 app.querySelector("#chk").onclick=()=>{if(G.cur.done)return;if(c===q.target){finishQ(true,null,null,err===0?3:2)}else{err++;box.classList.remove("wiggle");void box.offsetWidth;box.classList.add("wiggle");speak([{sfx:"wrong"},c<q.target?"עוֹד":"יוֹתֵר מִדַּי"]);if(err>=3)finishQ(false)}}}

/* ---------- 3. צבע לפי מספר ---------- */
const PAINT_KEY={1:["#E53935","red","אָדֹם"],2:["#FDD835","yellow","צָהֹב"],3:["#FB8C00","orange","כָּתֹם"],4:["#43A047","green","יָרֹק"],5:["#1E88E5","blue","כָּחֹל"],6:["#8E24AA","purple","סָגֹל"],7:["#EC407A","pink","וָרֹד"],8:["#8D6E63","brown","חוּם"]};
const PICTURES=[
 {id:"house",n:"בית",r:[
  ["poly","20,200 200,200 200,170 0,170 0,200",4,100,186],["circle","168,34,20",2,168,34],["poly","36,92 100,40 164,92",1,100,74],
  ["rect","124,48,14,30",8,131,58],["rect","52,92,96,78",7,70,150],["rect","88,126,24,44",8,100,152],["rect","62,102,20,18",5,72,111],["rect","118,102,20,18",5,128,111]]},
 {id:"flower",n:"פרח",r:[
  ["rect","95,98,10,60",4,100,132],["ellipse","80,128,16,8",4,80,128],["ellipse","120,118,16,8",4,120,118],["poly","64,160 136,160 126,196 74,196",3,100,180],
  ["circle","100,46,18",7,100,46],["circle","132,66,18",6,132,66],["circle","122,100,18",7,122,100],["circle","78,100,18",6,78,100],["circle","68,66,18",7,68,66],["circle","100,72,14",2,100,72]]},
 {id:"fish",n:"דג",r:[
  ["poly","0,200 200,200 200,176 0,176",8,40,188],["path","M30 176 Q20 150 32 130 Q44 150 38 176Z",4,34,160],["path","M164 176 Q156 146 170 126 Q182 150 174 176Z",4,169,158],
  ["poly","142,96 186,66 186,126",1,170,96],["ellipse","96,96,56,36",3,92,104],["poly","80,64 110,40 116,66",1,104,58],["circle","40,40,9",5,40,40],["circle","56,20,7",5,56,20],["circle","28,64,6",5,28,64]]}];
function paintQ(sk,lv){const P=pick(PICTURES);const en=sk==="en";return{sk:sk,key:"paint:"+P.id+(en?":en":""),tag:en?"Colors":"צובעים לפי מספר",kind:"paint",pic:P,en:en,p:"צִבְעִי לְפִי הַמִּסְפָּרִים 🎨",say:[PROMPTS.paint],a:"done",after:[]}}
function shapeEl(t,a,attrs){if(t==="rect"){const v=a.split(",");return`<rect x="${v[0]}" y="${v[1]}" width="${v[2]}" height="${v[3]}" rx="3" ${attrs}/>`}
 if(t==="circle"){const v=a.split(",");return`<circle cx="${v[0]}" cy="${v[1]}" r="${v[2]}" ${attrs}/>`}if(t==="ellipse"){const v=a.split(",");return`<ellipse cx="${v[0]}" cy="${v[1]}" rx="${v[2]}" ry="${v[3]}" ${attrs}/>`}
 if(t==="poly")return`<polygon points="${a}" ${attrs}/>`;return`<path d="${a}" ${attrs}/>`}
function paintHtml(q){const used=[...new Set(q.pic.r.map(r=>r[2]))].sort();
 const svg=`<svg class="paint-svg" viewBox="0 0 200 200">${q.pic.r.map((r,i)=>shapeEl(r[0],r[1],`class="rg" data-i="${i}" fill="#fff" stroke="#1E1B3A" stroke-width="2.5"`)).join("")}
  ${q.pic.id==="fish"?`<circle cx="66" cy="92" r="5" fill="#1E1B3A" pointer-events="none"/>`:""}
  ${q.pic.r.map((r,i)=>`<text class="rgn" data-i="${i}" x="${r[3]}" y="${r[4]+5}" text-anchor="middle" font-size="13" font-weight="700" fill="#1E1B3A" pointer-events="none">${r[2]}</text>`).join("")}</svg>`;
 const pal=used.map(n=>`<button class="sw2" data-n="${n}" style="--c:${PAINT_KEY[n][0]}"><b>${n}</b>${q.en?`<small class="en">${PAINT_KEY[n][1]}</small>`:""}</button>`).join("");
 return`<div class="paint-wrap">${svg}</div><div class="palette">${pal}</div>`}
function paintSetup(q){let sel=null,err=0,left=q.pic.r.length;
 app.querySelectorAll(".sw2").forEach(b=>b.onclick=()=>{app.querySelectorAll(".sw2").forEach(x=>x.classList.remove("on"));b.classList.add("on");sel=+b.dataset.n;speak(q.en?[{en:PAINT_KEY[sel][1]}]:[NUMNAME[sel]],30)});
 app.querySelectorAll(".rg").forEach(el=>el.addEventListener("click",()=>{if(G.cur.done)return;const r=q.pic.r[+el.dataset.i];if(el.getAttribute("data-done"))return;
  if(sel==null){toast("קודם בוחרים צבע למטה 🎨",1500);const p=app.querySelector(".palette");p.classList.remove("wiggle");void p.offsetWidth;p.classList.add("wiggle");return}
  if(r[2]===sel){el.setAttribute("fill",PAINT_KEY[sel][0]);el.setAttribute("data-done","1");const t=app.querySelector(`.rgn[data-i="${el.dataset.i}"]`);if(t)t.setAttribute("opacity",".25");left--;speak([{sfx:"tick"}],0);
   if(left===0){confetti(30);finishQ(true,null,null,err===0?3:err<=2?2:1)}}
  else{err++;speak([{sfx:"wrong"}].concat(q.en?[{en:PAINT_KEY[r[2]][1]}]:[NUMNAME[r[2]]]),40);const t=app.querySelector(`.rgn[data-i="${el.dataset.i}"]`);if(t){t.classList.remove("blinkt");void t.getBBox();t.classList.add("blinkt")}}}))}

/* ---------- 4. מילה יוצאת דופן ---------- */
function oddWordQ(sk,lv){const base=pick(wordsBy(w=>w.w.length>=2&&w.w.length<=4&&w.w.indexOf("'")<0));const letters=base.w.split("");
 let odd=null;for(let t=0;t<20&&!odd;t++){const i=rnd(0,letters.length-1);const c=FINAL_TO_BASE[letters[i]]||letters[i];const conf=((CONFUSE_SHAPE[c]||"")+(lv>=2?(CONFUSE_SOUND[c]||""):"")).split("").filter(x=>x&&LETTERS.indexOf(x)>=0);
  if(!conf.length)continue;let nl=pick(conf);if(i===letters.length-1&&FINALS[nl])nl=FINALS[nl];const w=letters.slice();w[i]=nl;const s=w.join("");if(s!==base.w)odd=s}
 if(!odd)return GEN.let(lv);const n=lv>=2?5:4;const pos=rnd(0,n-1);const words=Array.from({length:n},(_,i)=>i===pos?odd:base.w);
 return{sk:sk,key:"odd:"+base.w,tag:"מילה יוצאת דופן",p:`${PROMPTS.oddWord}${pic(base.e)}`,say:[PROMPTS.oddWord],opts:words.map((w,i)=>opt("o"+i,`<span class="he-word plain">${w}</span>`,"he")),a:"o"+pos,after:[base.s],info:`<span class="he-word">${base.w}</span> ≠ <span class="he-word">${odd}</span>`}}

const KINDS={multi:{html:multiHtml,setup:multiSetup},addto:{html:addtoHtml,setup:addtoSetup},paint:{html:paintHtml,setup:paintSetup}};
Object.assign(GEN,{
 mark(lv,focus){return multiQ(focus&&/[֐-׿]/.test(focus)?"let":"num",lv,focus,focus?"let":(lv>=3?"cat":"num"))},
 markcat(lv){return multiQ("think",lv,null,"cat")},
 addto(lv){return addtoQ("num",lv)},
 paint(lv){return paintQ(lv>=2?"en":"num",lv)},
 oddword(lv){return oddWordQ("word",lv)}});
/* חיבור למסלול: מוסיף את המכניקות לשלבים המתאימים */
(function wire(){const add=(st,g)=>{if(STEPS[st])STEPS[st].gens=STEPS[st].gens.concat(g)};
 add("ma1",[["mark",1],["addto",1],["paint",1]]);add("ma2",[["addto",2]]);add("ma3",[["mark",2],["paint",1]]);add("he1",[["markcat",1]]);add("he4",[["oddword",1],["oddword",2]]);add("he5",[["oddword",2]]);add("en1",[["paint",2]]);})();
