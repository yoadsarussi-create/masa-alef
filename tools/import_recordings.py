#!/usr/bin/env python3
"""ממיר recordings-agam.json (מדף ההקלטה) לקליפי m4a ומעדכן את audio-manifest.js. שימוש: python3 -I tools/import_recordings.py ~/Downloads/recordings-agam.json"""
import json,sys,os,base64,subprocess,hashlib,tempfile
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src=sys.argv[1];d=json.load(open(src,encoding="utf-8"))
mp=os.path.join(ROOT,"audio-manifest.json");man=json.load(open(mp,encoding="utf-8")) if os.path.exists(mp) else {}
n=0
for it in d["items"]:
    key=it["key"];h=hashlib.md5(key.encode()).hexdigest()[:10];out="audio/r_%s.m4a"%h
    ext=".webm" if "webm" in it["mime"] else ".mp4"
    with tempfile.NamedTemporaryFile(suffix=ext,delete=False) as f: f.write(base64.b64decode(it["b64"]));tmp=f.name
    subprocess.run(["ffmpeg","-y","-loglevel","error","-i",tmp,"-af","silenceremove=start_periods=1:start_threshold=-40dB:stop_periods=1:stop_threshold=-40dB,loudnorm=I=-16:TP=-1.5,apad=pad_dur=0.15","-ac","1","-ar","32000","-c:a","aac","-b:a","48k",os.path.join(ROOT,out)],check=True)
    os.unlink(tmp);man[key]=out;n+=1
json.dump(man,open(mp,"w",encoding="utf-8"),ensure_ascii=False,indent=0)
open(os.path.join(ROOT,"audio-manifest.js"),"w",encoding="utf-8").write("window.AUDIO="+json.dumps(man,ensure_ascii=False)+";\n")
print("imported",n,"clips; manifest now",len(man))
