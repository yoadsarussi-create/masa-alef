/* games4.js — קול ומוזיקה (S3): מחיאות-כפיים להברות.
   אגם שומעת מילה ורואה תמונה, ומוחאת כף (לחיצה על 👏) על כל הברה. כל מחיאה = חרוז צבעוני.
   טעות ראשונה → הדגמה: המילה, ואז מחיאות בקצב עם חרוזים, ושוב תורה (הצלחה אחרי הדגמה = חצי, לא נספרת לשליטה).
   רק מילים "לא-עמומות" (sylAmb) — בלי שווא בהתחלה, שגננות סופרות אחרת. */
"use strict";
SFX.clap="sfx/clap.m4a";
const CLAP_COL=["#FF5C8A","#2ED8C3","#FFD93D","#FF9F43","#9B7BFF","#22C55E"];
function clapQ(sk,lv){const max=lv>=2?4:3;const pool=wordsBy(w=>!w.amb&&w.syl>=1&&w.syl<=max);
 /* מאזנים בין מספרי-הברות — אחרת מילים של 2 הברות שולטות */
 const ns=[...new Set(pool.map(w=>w.syl))];const n=pick(lv>=2?ns:ns.filter(x=>x<=3));const w=pick(pool.filter(x=>x.syl===n));
 return{sk:sk,key:"clap:"+w.w,tag:"מחיאות",kind:"clap",w:w,p:PROMPTS.syl.split(".")[0],say:[PROMPTS.syl,w.s],a:String(w.syl),after:[w.s]}}
function clapHtml(q){return`<div class="clapw"><button class="clap-pic" id="cpic" aria-label="להשמיע שוב">${picHtml(q.w.e)}<span class="he-word">${q.w.s}</span></button>
 <div class="beads" id="beads"></div>
 <div class="row-btns"><button class="big clapbtn" id="clapb" aria-label="מחיאת כף">${picHtml("👏")}</button><button class="next" id="chk">✓ ${strip(PROMPTS.check)}</button></div></div>`}
function clapSetup(q){let c=0,err=0,timer=null,demo=false;const beads=app.querySelector("#beads"),btn=app.querySelector("#clapb");
 const bead=(k,cls)=>`<span class="bead pop-in ${cls||""}" style="background:${CLAP_COL[k%CLAP_COL.length]}"></span>`;
 const tap=()=>{if(G.cur.done||demo||c>=6)return;sfx("clap");beads.insertAdjacentHTML("beforeend",bead(c));c++;
  btn.classList.remove("bump");void btn.offsetWidth;btn.classList.add("bump");clearTimeout(timer);timer=setTimeout(check,2600)};
 const showDemo=()=>new Promise(res=>{demo=true;btn.disabled=true;c=0;beads.innerHTML="";
  speak([q.w.s],0).then(()=>{let k=0;const iv=setInterval(()=>{sfx("clap");beads.insertAdjacentHTML("beforeend",bead(k,"demo"));k++;
   if(k>=q.w.syl){clearInterval(iv);setTimeout(()=>{demo=false;btn.disabled=false;res()},1100)}},480)})});
 const check=()=>{clearTimeout(timer);if(G.cur.done||demo||!c)return;
  if(c===q.w.syl){beads.querySelectorAll(".bead").forEach(b=>b.classList.add("good"));finishQ(true,null,null,err===0?3:2,err>0);return}
  err++;beads.classList.remove("wiggle");void beads.offsetWidth;beads.classList.add("wiggle");
  if(err>=2){showDemo().then(()=>finishQ(false));return}
  speak([{sfx:"wrong"},"לֹא נוֹרָא, בּוֹאִי נִרְאֶה בְּיַחַד"]).then(showDemo).then(()=>{c=0;beads.innerHTML="";speak([q.w.s])})};
 btn.onclick=tap;app.querySelector("#chk").onclick=check;app.querySelector("#cpic").onclick=()=>{if(!demo)speak([q.w.s])}}
Object.assign(KINDS,{clap:{html:clapHtml,setup:clapSetup}});
Object.assign(GEN,{clap(lv){return clapQ("rhyme",lv)}});
(function wire(){const add=(st,g)=>{if(STEPS[st])STEPS[st].gens=STEPS[st].gens.concat(g)};
 add("he2",[["clap",1],["clap",2]]);add("he1",[["clap",1]]);})();
