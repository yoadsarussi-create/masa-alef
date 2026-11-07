#!/usr/bin/env python3
"""מוריד הקלטות אנושיות של מילים מ-Wikimedia Commons (Lingua Libre + En-us) — לא TTS.
שימוש: python3 -I tools/audio_fetch.py [--dry] [--limit N]
קורא רשימת מילים מ-tools/wordlist.json ({he:[...], en:[...]}), כותב audio/*.m4a, audio-manifest.js, CREDITS.md"""
import json,sys,os,re,subprocess,urllib.parse,urllib.request,hashlib,time
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UA={"User-Agent":"MasaAlefKidsApp/0.2 (https://github.com/yoadsarussi-create/masa-alef; educational)"}
API="https://commons.wikimedia.org/w/api.php"
DRY="--dry" in sys.argv
LIM=int(sys.argv[sys.argv.index("--limit")+1]) if "--limit" in sys.argv else 10**9
def api(params):
    params["format"]="json";url=API+"?"+urllib.parse.urlencode(params)
    for i in range(3):
        try:
            req=urllib.request.Request(url,headers=UA);return json.load(urllib.request.urlopen(req,timeout=30))
        except Exception as e:
            time.sleep(1+i)
    return {}
def search(q,limit=10):
    d=api({"action":"query","list":"search","srsearch":q,"srnamespace":6,"srlimit":limit})
    return [x["title"] for x in d.get("query",{}).get("search",[])]
def fileinfo(title):
    d=api({"action":"query","titles":title,"prop":"imageinfo","iiprop":"url|extmetadata|user"})
    for p in d.get("query",{}).get("pages",{}).values():
        if "imageinfo" in p:
            ii=p["imageinfo"][0];em=ii.get("extmetadata",{})
            return {"url":ii["url"],"user":ii.get("user",""),"license":em.get("LicenseShortName",{}).get("value",""),"title":title}
    return None
def find_he(word):
    # Lingua Libre: "LL-Q9288 (heb)-<speaker>-<word>.wav"
    for t in search('intitle:"LL-Q9288 (heb)" intitle:"%s.wav"'%word,20):
        if re.search(r"-%s\.wav$"%re.escape(word),t): return t
    t="File:He-%s.ogg"%word
    if fileinfo(t): return t
    return None
def find_en(word):
    t="File:En-us-%s.ogg"%word.replace(" ","_")
    if fileinfo(t): return t
    for t in search('intitle:"LL-Q1860 (eng)" intitle:"%s.wav"'%word,20):
        if re.search(r"-%s\.wav$"%re.escape(word),t): return t
    t="File:En-%s.ogg"%word.replace(" ","_")
    if fileinfo(t): return t
    return None
def main():
    wl=json.load(open(os.path.join(ROOT,"tools","wordlist.json"),encoding="utf-8"))
    man_path=os.path.join(ROOT,"audio-manifest.json")
    man=json.load(open(man_path,encoding="utf-8")) if os.path.exists(man_path) else {}
    credits=[];miss={"he":[],"en":[]};n=0
    for lang,words in (("he",wl["he"]),("en",wl["en"])):
        for w in words:
            key=lang+":"+w
            if key in man: continue
            if n>=LIM: break
            time.sleep(0.8);t=find_he(w) if lang=="he" else find_en(w)
            if not t: miss[lang].append(w);print("MISS",key);continue
            info=fileinfo(t)
            if not info: miss[lang].append(w);continue
            h=hashlib.md5(key.encode()).hexdigest()[:10];out="audio/%s.m4a"%h
            print("OK  ",key,"<-",t,info["license"])
            if not DRY:
                raw=os.path.join(ROOT,"tools","raw",os.path.basename(urllib.parse.unquote(info["url"])).split("?")[0])
                os.makedirs(os.path.dirname(raw),exist_ok=True)
                if not os.path.exists(raw):
                    urllib.request.urlretrieve(urllib.request.Request(info["url"],headers=UA).full_url,raw) if False else open(raw,"wb").write(urllib.request.urlopen(urllib.request.Request(info["url"],headers=UA),timeout=60).read())
                # normalize loudness, trim silence, mono 32kbps AAC
                subprocess.run(["ffmpeg","-y","-loglevel","error","-i",raw,"-af","highpass=f=60,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.08,areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.15,areverse,loudnorm=I=-16:TP=-1.5:LRA=11,adelay=150,apad=pad_dur=0.12","-ac","1","-ar","32000","-c:a","aac","-b:a","40k",os.path.join(ROOT,out)],check=True)
                man[key]=out;credits.append((key,t,info["user"],info["license"]))
                json.dump(man,open(man_path,"w",encoding="utf-8"),ensure_ascii=False,indent=0)
            n+=1
    print("missing he:",len(miss["he"]),miss["he"]);print("missing en:",len(miss["en"]),miss["en"])
    if not DRY:
        with open(os.path.join(ROOT,"audio-manifest.js"),"w",encoding="utf-8") as f:
            f.write("window.AUDIO="+json.dumps(man,ensure_ascii=False)+";\n")
        cp=os.path.join(ROOT,"CREDITS.md")
        with open(cp,"a",encoding="utf-8") as f:
            for key,t,user,lic in credits: f.write("- %s — %s — by %s — %s (Wikimedia Commons)\n"%(key,t,user,lic))
if __name__=="__main__": main()
