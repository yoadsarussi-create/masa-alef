# מוזיקה ולמידה — "על הבמה" (07/11/2026)

## 1. המחקר
- קצב↔קריאה: Woodruff Carr/Kraus 2014, Bonacina 2021, Moritz 2012 — סנכרון לביט מנבא מודעות פונולוגית. Gordon 2015 מטא: אימון מוזיקלי → מודעות פונולוגית d≈0.2; אין העברה לשטף. **מוזיקה = מאיץ, לא תחליף.**
- שיר כמנמוניקה: Knott & Thaut 2018 +20% זכירה; Wallace 1994 — רק כש**אותה מנגינה חוזרת**. כלל: מנגינה אחת קבועה לכל תוכן.
- שיר א"ב: לא מבטיח זיהוי מחוץ לסדר → אחרי השיר מבחן זיהוי אקראי בלי מוזיקה.
- דילוגי-ספירה/כפל בשיר: פיגום בלבד, ואז שליפה ישירה.

## 2. מכניקות
- נתיב-קצב: 90–100 BPM; "מצוין" ±150ms, "טוב" ±250ms, פספוס בלי עונש; תו כל פעימה; offset קלט 50–80ms.
- מחיאות-להברות על ההקלטות; הברה מודגשת עם ניקוש.
- קריוקי: זמני-הברה (JSON ms), הדגשה לפי `AudioContext.currentTime`.
- זיהוי-גובה: ישים ב-iOS 15 (`AnalyserNode.getFloatTimeDomainData`, אוטוקורלציה 2048, טווח 180–700 Hz, ±100 סנט, חציון 5 פריימים, correlation>0.9); לתצוגה "חם/קר"; לסגור סטרים כשלא שרים.
- הקלטה: MediaRecorder `audio/mp4` בלבד; באג iOS 15 — `onstop` לא נורה ~40% → `ondataavailable`+timeslice, או WAV מ-ScriptProcessor; IndexedDB.
- "בונים שיר" מקוביות-אותיות (פנטטוני + הקלטת שם-האות).
- הפסקת-ריקוד: BPM מ-4 ניקושים אחרונים (70–140).

## 3. תאוריה למנוע
פדים: C פנטטוני (262/294/330/392/440). ליווי: C–G–Am–F, 4 פעימות/אקורד, 8 תיבות. טמפו: 90–110 למידה, 110–125 ריקוד. תזמור Web Audio: קיק סינוס 150→50Hz 120ms; סנר רעש bandpass 1.5kHz + סינוס 185Hz; קלאפ 3 פרצים 10ms; האט רעש highpass 7kHz; בס משולש lowpass 300; פד 2 משולשים ±7 סנט lowpass 1.2k. CPU: buffer-רעש אחד, ≤8 קולות, exponentialRamp. תזמון lookahead 25ms/100ms (Tale of Two Clocks); עצירה ב-visibilitychange.

## 4. צלילי-משוב
נכון C5→E5→G5 60ms; טעות סינוס 220→180 120ms −12dB; level-up ארפג'יו + נצנוץ; מותג: אותו גל ואותו סולם; SFX ≤−6 dBFS, ducking −3dB; CC0: Kenney Interface/UI Audio, Freesound CC0; `afconvert -f m4af -d aac -b 96000`.

## 5. זכויות
ציבורי: "יונתן הקטן", "הנה מה טוב", "מעוז צור", "הבה נגילה", Twinkle (=ABC), Frère Jacques, Old MacDonald, London Bridge → לחן ציבורי + **מילים שלנו**. חצי: "נומי נומי" (לחן מוגן). אסור: קיפניס, שמר, הירש, בן-דור, "הופ!", פופ עכשווי. "השירים האהובים": הורה מקליט לתוך ה-PWA (מקומי), קריוקי מעל ההקלטה הביתית; או "השיר שלה" על הפנטטוני.

## 6. סדר-יישום
1. מתזמן lookahead + תופים/בס/פד, לופ C–G–Am–F 96 BPM. 2. SFX ממותג + ducking. 3. מחיאות-להברות. 4. נתיב-קצב ±150/250. 5. שיר א"ב על Twinkle + שירי-ספירה. 6. "בונים שיר". 7. הקלטה-והשמעה. 8. זיהוי-גובה "חם/קר".

## מקורות
PNAS 2014 (25246562) · Bonacina 2021 · Moritz 2012 · Gordon 2015 · Knott & Thaut 2018 · frontiersin 2014 tempo · web.dev audio-scheduling · dev.to drum synthesis · alexanderell.is tuner · MDN getFloatTimeDomainData · webkit.org MediaRecorder · Apple forums 694207 · kenney.nl · percussionplay pentatonic · Hänschen klein · Commons copyright Israel · maariv
