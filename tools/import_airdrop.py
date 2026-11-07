#!/usr/bin/env python3
"""צופה ב-~/Downloads: כל קובץ agam_NNN.(m4a|webm|mp4) → מנורמל ל-audio/r_NNN.m4a, נכנס למניפסט, ונדחף לאתר."""
import os,sys,json,time,subprocess,shutil,glob
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DL=os.path.expanduser("~/Downloads");DONE=os.path.join(ROOT,"tools","raw","imported");os.makedirs(DONE,exist_ok=True)
items={x["id"]:x for x in json.load(open(os.path.join(ROOT,"tools/recpage/items.json"),encoding="utf-8"))}
def run_once():
    files=sorted(glob.glob(os.path.join(DL,"agam_[0-9][0-9][0-9]*.*")))
    if not files:return 0
    mp=os.path.join(ROOT,"audio-manifest.json");man=json.load(open(mp,encoding="utf-8"));n=0
    for f in files:
        iid=os.path.basename(f)[6:9];it=items.get(iid)
        if not it:continue
        out="audio/r_%s.m4a"%iid
        subprocess.run(["ffmpeg","-y","-loglevel","error","-i",f,"-af","highpass=f=70,loudnorm=I=-16:TP=-1.5,silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.06:stop_periods=1:stop_threshold=-50dB:stop_silence=0.15,adelay=150,apad=pad_dur=0.12","-ac","1","-ar","32000","-c:a","aac","-b:a","56k",os.path.join(ROOT,out)],check=True)
        man[it["k"]]=out;shutil.move(f,os.path.join(DONE,os.path.basename(f)));n+=1;print("imported",iid,it["t"])
    json.dump(man,open(mp,"w",encoding="utf-8"),ensure_ascii=False,indent=0)
    open(os.path.join(ROOT,"audio-manifest.js"),"w",encoding="utf-8").write("window.AUDIO="+json.dumps(man,ensure_ascii=False)+";\n")
    if n:
        subprocess.run(["git","-C",ROOT,"add","audio","audio-manifest.js","audio-manifest.json"],check=True)
        subprocess.run(["git","-C",ROOT,"-c","user.name=Yoad Sarussi","-c","user.email=yoad@maya-tour.co.il","commit","-qm","הקלטות אגם: %d קליפים בקול ההורים\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"%n],check=True)
        subprocess.run(["git","-C",ROOT,"push","-q","origin","main"],check=True);print("pushed",n)
    return n
if __name__=="__main__":
    loop="--watch" in sys.argv;end=time.time()+6*3600
    while True:
        try:run_once()
        except Exception as e:print("err",e)
        if not loop or time.time()>end:break
        time.sleep(15)
