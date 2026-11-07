#!/usr/bin/env python3
"""מוריד איורי Twemoji (CC-BY 4.0) לכל האימוג׳י שבתוכן → pics/<codepoints>.svg + pics-manifest.js (emoji → path)."""
import re,os,json,urllib.request,time
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src=open(os.path.join(ROOT,"content.js"),encoding="utf-8").read()+open(os.path.join(ROOT,"app.js"),encoding="utf-8").read()+open(os.path.join(ROOT,"mechanics.js"),encoding="utf-8").read()
# אימוג׳י: טווחים נפוצים + משתני-צבע/ZWJ
pat=re.compile("(?:[\U0001F300-\U0001FAFF☀-➿\U0001F1E6-\U0001F1FF⬀-⯿⌀-⏿■-◿←-⇿〰〽㊗㊙©®‼⁉™ℹⓂ]|[0-9#*]️?⃣)(?:️|\U0001F3FB-\U0001F3FF)?(?:‍(?:[\U0001F300-\U0001FAFF☀-➿])(?:️)?)*")
emojis=sorted(set(m.group(0) for m in pat.finditer(src) if len(m.group(0).strip())))
def cps(e):
    # twemoji: drop FE0F unless needed; try full first then without FE0F
    full="-".join("%x"%ord(c) for c in e)
    nofe="-".join("%x"%ord(c) for c in e if ord(c)!=0xFE0F)
    return [nofe,full] if nofe!=full else [full]
man={};miss=[]
for e in emojis:
    ok=False
    for cp in cps(e):
        out=os.path.join(ROOT,"pics",cp+".svg")
        if os.path.exists(out): man[e]="pics/"+cp+".svg";ok=True;break
        url="https://cdn.jsdelivr.net/gh/jdecked/twemoji@15.1.0/assets/svg/%s.svg"%cp
        try:
            data=urllib.request.urlopen(urllib.request.Request(url,headers={"User-Agent":"MasaAlef/0.3"}),timeout=20).read()
            if b"<svg" in data[:200]:
                open(out,"wb").write(data);man[e]="pics/"+cp+".svg";ok=True;break
        except Exception as ex: pass
    if not ok: miss.append(e)
    time.sleep(0.05)
open(os.path.join(ROOT,"pics-manifest.js"),"w",encoding="utf-8").write("window.PICS="+json.dumps(man,ensure_ascii=False)+";\n")
print("emojis",len(emojis),"ok",len(man),"missing",miss)
