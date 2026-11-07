/* engine2.js — מנוע v2: גרף-שלבים (משרד החינוך), תת-מיומנויות, שליטה דו-קומתית, Leitner, בונה-סשן, מיקום. Safari 15. */
"use strict";

/* ---------- גרף-השלבים ---------- */
/* כל שלב: שם, תחום, תלויות (חוסמות), תת-מיומנויות (sub), מחוללים: רשימת [sk, lv] מהמחוללים הקיימים (GEN) */
const STEPS={
 he1:{n:"חרוזים והברות",d:"he",deps:[],subs:["rhyme","sylblend"],gens:[["rhyme",1]]},
 he2:{n:"מחיאות וצליל פותח",d:"he",deps:["he1"],subs:["sylcount","cvfirst"],gens:[["rhyme",2],["sound",1]]},
 he3:{n:"האותיות והצלילים",d:"he",deps:[],subs:LETTERS.map(l=>"L"+l),gens:[["let",1],["let",2],["sound",1],["sound",2],["write",1]]},
 he4:{n:"מצלילים למילה",d:"he",deps:["he3"],subs:["blend","pairs"],gens:[["sound",3],["sound",4],["let",3]]},
 he5:{n:"כותבים כמו ששומעים",d:"he",deps:["he3"],subs:["spell1","spell2"],gens:[["word",1],["word",2],["write",3]]},
 he6:{n:"ניקוד: קמץ, פתח, חיריק",d:"he",deps:["he3","he4"],subs:["nikA","nikI"],gens:[["nik",1],["nik",2]]},
 he7:{n:"ניקוד: סגול, חולם, שורוק",d:"he",deps:["he6"],subs:["nikE","nikO","nikU","syl1"],gens:[["nik",2],["nik",3],["word",3]]},
 he8:{n:"סופיות, דגש ומשפטים",d:"he",deps:["he7","he5"],subs:["finals","sentHe","wordRead"],gens:[["let",4],["word",4],["nik",4],["nik",5]]},
 he9:{n:"אותיות מבלבלות",d:"he",deps:["he8"],subs:["homo"],gens:[["word",5]]},
 he10:{n:"קוראים בשטף",d:"he",deps:["he8"],subs:["fluency"],gens:[["word",5]]},
 he11:{n:"זכר/נקבה, רבים, הפכים",d:"he",deps:["he8"],subs:["gender","plural","opp"],gens:[["word",6]]},
 he12:{n:"בלי ניקוד",d:"he",deps:["he10","he11"],subs:["unvoc"],gens:[["word",6]]},
 ma1:{n:"כמה יש? עד 10",d:"ma",deps:[],subs:["subit","count10"],gens:[["num",1]]},
 ma2:{n:"יותר, פחות, אחרי",d:"ma",deps:["ma1"],subs:["compare","order"],gens:[["num",2]]},
 ma3:{n:"ספרות ומסגרת-10",d:"ma",deps:["ma2"],subs:["digits","bonds10","writeDigit"],gens:[["num",2],["calc",3],["write",2]]},
 ma4:{n:"חיבור וחיסור עד 10",d:"ma",deps:["ma3"],subs:["add10","sub10"],gens:[["calc",1],["calc",2]]},
 ma5:{n:"עד 20 בתובנה",d:"ma",deps:["ma4"],subs:["add20","sub20","missing"],gens:[["calc",4],["calc",5]]},
 ma6:{n:"מספרים עד 100",d:"ma",deps:["ma5"],subs:["to100","skip","tensAdd"],gens:[["num",3],["num",4],["num",5]]},
 ma7:{n:"שעון ומדידה",d:"ma",deps:["ma3"],subs:["clock","shapes"],gens:[["think",4],["think",5]]},
 ma8:{n:"מבנה עשרוני עד 1,000",d:"ma",deps:["ma6"],subs:["place"],gens:[["num",5]]},
 ma9:{n:"חיבור וחיסור עד 100",d:"ma",deps:["ma8"],subs:["add100","sub100"],gens:[["calc",6]]},
 ma10:{n:"כפל ראשון",d:"ma",deps:["ma5"],subs:["mult2510","half"],gens:[["calc",6]]},
 ma11:{n:"צורות וגופים",d:"ma",deps:["ma7"],subs:["geo"],gens:[["think",4]]},
 ma12:{n:"לוח הכפל ושארית",d:"ma",deps:["ma10","ma9"],subs:["multAll","remainder"],gens:[["calc",6]]},
 ma13:{n:"עד 10,000",d:"ma",deps:["ma12"],subs:["big"],gens:[["num",6]]},
 ma14:{n:"שטח, זמן ונתונים",d:"ma",deps:["ma11","ma12"],subs:["area","minutes"],gens:[["think",6]]},
 en1:{n:"מילים באנגלית",d:"en",deps:[],subs:["vocab1","vocab2"],gens:[["en",1],["en",2]]},
 en2:{n:"הוראות וחרוזים",d:"en",deps:["en1"],subs:["tpr","rhymeEn"],gens:[["en",2]]},
 en3:{n:"משפטים קצרים",d:"en",deps:["en1"],subs:["sentHear"],gens:[["sent",1],["sent",2]]},
 en4:{n:"ABC: שמות וצורה",d:"en",deps:[],subs:"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map(l=>"E"+l),gens:[["abc",1],["abc",2],["abc",3],["write",4]]},
 en5:{n:"צלילי האותיות",d:"en",deps:["en4"],subs:["phonics"],gens:[["abc",4]]},
 en6:{n:"קוראים מילים קצרות",d:"en",deps:["en5"],subs:["cvc"],gens:[["en",3]]},
 en7:{n:"אות חסרה",d:"en",deps:["en6"],subs:["missEn"],gens:[["en",5]]},
 en8:{n:"מילים ומשפטים בקריאה",d:"en",deps:["en6","en3"],subs:["readEn","sentRead"],gens:[["en",4],["sent",2]]},
 en9:{n:"בונים משפט",d:"en",deps:["en8"],subs:["buildEn"],gens:[["sent",3],["sent",4]]},
 en10:{n:"סיפורים קצרים",d:"en",deps:["en9"],subs:["story"],gens:[["en",6],["sent",4]]}};
const DOMAIN_NAME={he:"עברית",ma:"חשבון",en:"אנגלית"};
/* אולמות: קיבוץ שלבים לתצוגה */
const HALLS=[
 {id:"jungle",n:"אולם הג'ונגל",e:"🌴",steps:["he1","he2","he3","ma1","ma2","ma3","en1","en4"]},
 {id:"space",n:"אולם החלל",e:"🚀",steps:["he4","he5","ma4","ma5","en2","en3","en5"]},
 {id:"sea",n:"אולם תת-המים",e:"🐠",steps:["he6","he7","ma6","ma7","en6"]},
 {id:"desert",n:"אולם המדבר",e:"🏜️",steps:["he8","he9","ma8","ma9","ma10","en7"]},
 {id:"polar",n:"אולם הקוטב",e:"🐧",steps:["he10","he11","ma11","ma12","en8","en9"]},
 {id:"city",n:"אולם עיר-הלילה",e:"🌃",steps:["he12","ma13","ma14","en10"]}];
const BOXES=[1,3,7,14,30];const DAY=864e5;

/* ---------- מצב ---------- */
/* S.e2 = {subs:{[step:sub]:{h:[],st:0,att:0,box:0,due:0,rt:[],sess:[],nh:0,n:0}}, placed:bool, sessions:n} */
function E2(){if(!S.e2)S.e2={subs:{},placed:false,day:""};return S.e2}
function subState(step,sub){const e=E2();const k=step+":"+sub;if(!e.subs[k])e.subs[k]={h:[],st:0,att:0,box:0,due:0,rt:[],sess:[],nh:0,n:0};return e.subs[k]}
function subKeys(step){return STEPS[step].subs}
const today=()=>new Date().toDateString();
function subPassed(step,sub){return subState(step,sub).box>=1}
function subMastered(step,sub){return subState(step,sub).box>=4}
function stepPassed(step){return subKeys(step).every(s=>subPassed(step,s))}
function stepProgress(step){const ks=subKeys(step);return ks.filter(s=>subPassed(step,s)).length/ks.length}
function stepOpen(step){return STEPS[step].deps.every(d=>stepPassed(d))}
function hallProgress(h){const ss=h.steps;return ss.reduce((a,s)=>a+stepProgress(s),0)/ss.length}
function hallOpen(i){return i===0||hallProgress(HALLS[i-1])>=.7}
/* רישום תשובה בתת-מיומנות. מחזיר: "pass" (תת-מיומנות עברה), "step" (שלב נסגר), "down" (ירידה), null */
function e2record(step,sub,ok,rt,hinted){const st=subState(step,sub);const sess=S.sessions.length;
 const first=st.n===0;st.n++;if(rt)st.rt=st.rt.concat(Math.min(rt,20000)).slice(-10);if(st.sess.indexOf(sess)<0)st.sess.push(sess);
 if(hinted||(first&&!ok)){st.att++;return null}/* רמז או טעות בחשיפה ראשונה — לא נספרים לשליטה ולא לירידה */
 st.h=st.h.concat(ok?1:0).slice(-12);st.att++;st.nh+=ok?1:0;st.st=ok?st.st+1:0;
 const l10=st.h.slice(-10),c10=l10.reduce((a,b)=>a+b,0);const multi=st.sess.length>=2;
 if(st.box===0){if((st.st>=4||(l10.length>=10&&c10>=8))&&multi){st.box=1;st.due=Date.now()+BOXES[0]*DAY;st.h=[];st.st=0;st.att=0;return stepPassed(step)?"step":"pass"}
  if(st.att>=10&&st.st<3&&!st.h.slice(-10).join("").includes("111")){st.att=0;return "down"}return null}
 /* בבדיקת-שימור: 2 פריטים */
 if(ok){st.rc=(st.rc||0)+1;if(st.rc>=2){st.rc=0;st.box=Math.min(5,st.box+1);st.due=Date.now()+(BOXES[st.box-1]||30)*DAY}}
 else{st.rc=0;st.box=Math.max(1,st.box-1);st.due=Date.now()+BOXES[st.box-1]*DAY;if(st.box===1&&st.h.slice(-2).join("")==="00"){st.box=0;st.due=0;return "down"}}
 return null}
function medianRT(step,sub){const r=subState(step,sub).rt.slice().sort((a,b)=>a-b);return r.length?r[Math.floor(r.length/2)]:0}

/* ---------- בונה-סשן ---------- */
/* פריט-תוכנית: {step, sub, sk, lv, role:"warm"|"focus"|"review"|"encore"|"place"} */
function openSubs(){const out=[];Object.keys(STEPS).forEach(step=>{if(!stepOpen(step))return;subKeys(step).forEach(sub=>{if(!subPassed(step,sub))out.push({step,sub})})});return out}
function dueSubs(){const out=[];Object.keys(STEPS).forEach(step=>subKeys(step).forEach(sub=>{const st=subState(step,sub);if(st.box>=1&&st.due&&st.due<=Date.now())out.push({step,sub})}));return out}
function passedSubs(){const out=[];Object.keys(STEPS).forEach(step=>subKeys(step).forEach(sub=>{if(subPassed(step,sub))out.push({step,sub})}));return out}
function genFor(step,sub){const g=STEPS[step].gens;const st=subState(step,sub);
 /* תת-מיומנויות של אותיות: מחולל ממוקד על האות */
 if(/^L./.test(sub)){const L=sub.slice(1);const r=Math.random();const sk=r<.35?"let":r<.7?"sound":r<.85?"write":"mark";return{sk:sk,lv:st.n<6?1:2,focus:L}}
 if(/^E[A-Z]$/.test(sub))return{sk:"abc",lv:st.n<6?1:2,focus:sub.slice(1)};
 const pick1=g[Math.min(g.length-1,Math.floor(Math.random()*g.length))];return{sk:pick1[0],lv:pick1[1]}}
function interleave(items){const out=[];let rest=items.slice();while(rest.length){const prev=out[out.length-1];let k=rest.findIndex(x=>!prev||x.step!==prev.step);if(k<0)k=0;out.push(rest.splice(k,1)[0])}return out}
/* כל הופעה = נושא אחד (יועד 07/11: מעבר עברית↔אנגלית מבלבל). סבב: עברית, חשבון, עברית, אנגלית.
   כל הופעה חמישית = "הופעת סיכום" מעורבת — רק אחרי שכל שלושת הנושאים עברו היכרות. */
const DOM_CYCLE=["he","ma","he","en"],MIX_EVERY=5,PLACE_ROOTS={he:["he1","he2","he3"],ma:["ma1","ma2","ma3","ma4"],en:["en1","en4"]};
const domOf=x=>STEPS[x.step].d;
function pickDomain(){const e=E2();e.sc=e.sc||0;e.pd=e.pd||{};if(e.placed)["he","ma","en"].forEach(d=>{if(!e.pd[d])e.pd[d]=1});
 const allPlaced=["he","ma","en"].every(d=>e.pd[d]);if(allPlaced)e.placed=true;const k=e.sc++;
 if(allPlaced&&k%MIX_EVERY===MIX_EVERY-1)return "mix";
 e.dc=e.dc||0;const d=DOM_CYCLE[e.dc%DOM_CYCLE.length];e.dc++;return d}
function buildSession(focusStep,n){n=n||8;const e=E2();let plan=[];
 if(!focusStep){const d=pickDomain();e.lastDom=d;if(d!=="mix"){const p=buildDomainSession(d,n);if(p&&p.length)return p;e.lastDom="mix"}}else e.lastDom=null;
 if(focusStep){const subs=subKeys(focusStep).map(sub=>({step:focusStep,sub}));const un=subs.filter(x=>!subPassed(x.step,x.sub));const pool=un.length?un:subs;
  for(let i=0;i<n;i++){const x=pool[i%pool.length];plan.push(Object.assign({role:"focus"},x,genFor(x.step,x.sub)))}return sh(plan)}
 /* מיקום: 3 הסשנים הראשונים דוגמים רחב */
 if(!e.placed){const roots=["he1","he3","ma1","ma2","ma3","en1","en4","he2","ma4"];roots.forEach(step=>{const sub=pick(subKeys(step));plan.push(Object.assign({role:"place",step,sub},genFor(step,sub)))});
  if(S.sessions.length>=2)e.placed=true;return interleave(sh(plan)).slice(0,n)}
 const due=sh(dueSubs()).slice(0,2).map(x=>Object.assign({role:"review"},x,genFor(x.step,x.sub)));
 const open=openSubs();const byDom={};open.forEach(x=>{(byDom[STEPS[x.step].d]=byDom[STEPS[x.step].d]||[]).push(x)});
 const weight=x=>{const st=subState(x.step,x.sub);const h=st.h.slice(-6);if(st.n===0)return 1.0+Math.random()*.4;const acc=h.length?h.reduce((a,b)=>a+b,0)/h.length:.5;return (acc>=.4&&acc<.85?2.2:acc<.4?1.6:.6)+Math.random()*.5};
 let newCount=0;
 const doms=sh(Object.keys(byDom));Object.keys(byDom).forEach(d=>byDom[d].sort((a,b)=>weight(b)-weight(a)));const focus=[];let i=0;while(focus.length<n-due.length-2&&doms.length){const d=doms[i%doms.length];const arr=byDom[d];if(arr.length){let idx=Math.random()<.7?0:Math.floor(Math.random()*arr.length);if(newCount>=2){const j=arr.findIndex(y=>subState(y.step,y.sub).n>0);if(j>=0)idx=j}const x=arr.splice(idx,1)[0];if(subState(x.step,x.sub).n===0)newCount++;focus.push(Object.assign({role:"focus"},x,genFor(x.step,x.sub)))}else doms.splice(i%doms.length,1);i++}
 const warmPool=sh(passedSubs());const warm=warmPool.slice(0,Math.max(1,n-due.length-focus.length)).map(x=>Object.assign({role:"warm"},x,genFor(x.step,x.sub)));
 plan=interleave(sh(warm.concat(due,focus)));
 while(plan.length<n&&open.length){const x=pick(open);plan.push(Object.assign({role:"focus"},x,genFor(x.step,x.sub)))}
 return plan.slice(0,n)}
function buildDomainSession(d,n){const e=E2();let plan=[];
 /* היכרות: הופעה ראשונה בכל נושא דוגמת את שורשי הנושא */
 if(!e.pd[d]){const roots=PLACE_ROOTS[d];let k=0;while(plan.length<n){const step=roots[k%roots.length];k++;const sub=pick(subKeys(step));plan.push(Object.assign({role:"place",step,sub},genFor(step,sub)))}
  e.pd[d]=1;return interleave(sh(plan)).slice(0,n)}
 const inD=x=>domOf(x)===d;
 const due=sh(dueSubs().filter(inD)).slice(0,2).map(x=>Object.assign({role:"review"},x,genFor(x.step,x.sub)));
 const open=openSubs().filter(inD);
 const weight=x=>{const st=subState(x.step,x.sub);const h=st.h.slice(-6);if(st.n===0)return 1.0+Math.random()*.4;const acc=h.length?h.reduce((a,b)=>a+b,0)/h.length:.5;return (acc>=.4&&acc<.85?2.2:acc<.4?1.6:.6)+Math.random()*.5};
 const arr=open.slice().sort((a,b)=>weight(b)-weight(a));const focus=[];let newCount=0;
 while(focus.length<n-due.length-2&&arr.length){let idx=Math.random()<.7?0:Math.floor(Math.random()*arr.length);if(newCount>=2){const j=arr.findIndex(y=>subState(y.step,y.sub).n>0);if(j>=0)idx=j}
  const x=arr.splice(idx,1)[0];if(subState(x.step,x.sub).n===0)newCount++;focus.push(Object.assign({role:"focus"},x,genFor(x.step,x.sub)))}
 const warm=sh(passedSubs().filter(inD)).slice(0,Math.max(1,n-due.length-focus.length)).map(x=>Object.assign({role:"warm"},x,genFor(x.step,x.sub)));
 plan=interleave(sh(warm.concat(due,focus)));
 /* חסר? משלימים מאותו נושא (גם תת-מיומנויות שכבר נפתחו), לא מנושא אחר */
 let guard=0;while(plan.length<n&&guard++<40){const pool=open.length?open:passedSubs().filter(inD);if(!pool.length)break;const x=pick(pool);plan.push(Object.assign({role:open.length?"focus":"warm"},x,genFor(x.step,x.sub)))}
 if(!plan.length){e.lastDom="mix";e.pd[d]=1;return null}
 return plan.slice(0,n)}
/* מה להציג להורה */
function parentLists(){const know=[],now=[],stuck=[];Object.keys(STEPS).forEach(step=>{subKeys(step).forEach(sub=>{const st=subState(step,sub);const name=STEPS[step].n+(/^[LE]./.test(sub)?" · "+sub.slice(1):"");
  if(st.box>=3)know.push(name);else if(st.att>=10&&st.st<3&&st.box===0)stuck.push(name);else if(st.n>=3&&st.box===0)now.push(name)})});return{know,now,stuck}}
