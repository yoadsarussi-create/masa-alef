# אמנות + הנדסת-אנימציה — iOS 15, A8/A10 (07/11/2026)

## 1. כיוון חזותי
**סגנון:** פלאט-מעוגל עם קו-מתאר (Toca/Sago): צורות בסיסיות, בלי גרדיאנטים (אחד עדין לרקע), צל קשה אחד, קו-מתאר כהה עבה. אפס `filter: blur/drop-shadow`.
**פלטה:** רקע `#2B1B5A` / קצוות `#1A1140`; זרקור `#FFD93D`; ורוד-פופ `#FF5C8A`; טורקיז `#2ED8C3`; כתום `#FF9F43`; קו-מתאר/טקסט `#1E1B3A`; כרטיס `#FFFFFF`; קרם-קריאה `#FFF8E7`; נכון `#22C55E`; לא-נכון `#FF9F43` (לא אדום).
**ניגודיות:** אותיות-לימוד רק על רקע בהיר (≥7:1); לעולם לא על גרדיאנט/זרקור.
**טיפוגרפיה:** פונט-אותיות ראשי **Noto Sans Hebrew** (ניקוד מלא, GPOS); חלופות Alef, Assistant, Rubik. Fredoka/Varela Round ל-UI ומספרים בלבד. מסחריים: Hebrew Rinat Kids. בדיקת-ניקוד ב-Safari 15: `שָׁלוֹם בֹּקֶר תּוֹדָה וּבֵן`; בלי `letter-spacing` על מנוקד; `font-synthesis:none`.
**גדלים:** אות בודדת ≥64px (96–140), מילה מנוקדת ≥40px, line-height ≥1.6, כפתורים ≥64×64 + רווח 12.
**Style tile:** רדיוס כרטיס 24 / כפתור 20 או קפסולה; קו-מתאר 4px (דמויות 5–6, אייקונים 3); צל קשה `0 6px 0 #1E1B3A`; כפתור = צבע + צל-קשה שמתקצר בלחיצה.

## 2. אנימציית דמויות
**ריג-SVG + CSS:** `<g>` עם `transform-box:fill-box` (חובה ב-Safari) + `transform-origin`; רק transform/opacity. Idle bob 2.4s ±4px; Blink scaleY 150ms כל 3–5s; Cheer ידיים rotate -20→-70 300ms + קפיצה -24px; Dance rotate ±6 + translateX ±8 ב-60/BPM; Sad ראש rotate 8°, עיניים +2px, חזרה 1.2s.
**ספרייט PNG + steps():** 8–12 פריימים 256px, PNG-8 ≤300KB, בלי סקיילינג.
**Lottie:** לא (A8 20–30fps, קריסות). APNG ✔ (אלפא), WebP סטטי ✔, GIF ✘.
**תקציב:** will-change רק על מה שזז (≤10); rAF גלובלי אחד; קונפטי 30fps; DPR ≤2 לעקיבה, 1 לקונפטי; `canvas.width=0` בסגירה; זיכרון תמונות ≤40MB (iPad mini 4 = 2GB).

## 3. Juice
לחיצה scale(.94)+צל 6→2 120ms, חזרה spring 220ms · נכון 24–40 חלקיקים 700ms + cheer + 3 תווים · מעריצים 5 אייקונים 450ms stagger 60 + מונה scale 1.3 · הבזק לבן 0→.35→0 180ms · שגיאה ±6px ×3 320ms כתום · Level-up ≤3s (הבזק+פנפרה → כוכב 500ms → קונפטי 1.2s → "כל הכבוד" → ריקוד → כפתור) · מעבר-מסך יוצא 200ms / נכנס 300ms (RTL משמאל) · Attract-loop אחרי 8s · אין haptics ב-iOS 15 → tick 30ms + squash.

## 4. אימוג'י → איורים
בעיות: עמימות, סגנון אפל, Unicode 14+ חסר, לא ניתן לצבוע/לאנפש. תוכנית: **Twemoji (CC-BY 4.0)** או **Noto Emoji (Apache 2.0)** (מותר שינוי); OpenMoji = CC-BY-SA (רק כפי-שהוא). Kenney CC0 ל-UI. ~120 תמונות → svgo → sprite `<symbol>` (~250–400KB), lazy per אולם; precache ≤15MB.

## 5. נגישות/UX
כפתורי-פעולה ב-40% התחתונים, סימטריים; הורים/יציאה למעלה בלחיצה-ארוכה; iPad landscape, טלפון portrait; RTL להתקדמות; משוב לעולם לא בצבע בלבד; אודיו-ראשון + 🔊 ≥64px במקום קבוע; reduced-motion.

## 6. ייחוס
Toca (פלאט+קו, מכשירים ישנים) · Sago (3 הבעות, הכול מגיב) · Khan Kids · Duolingo ABC · Lingokids · Pok Pok · Endless Alphabet · Homer · Dr. Panda (attract) · LetterSchool/Writing Wizard (הראה→עקוב→כתוב).

## יישום לפי עדיפות
1. Noto Sans Hebrew + בדיקת-ניקוד + גדלים. 2. squash + צל-קשה + מעברים + שגיאה כתומה. 3. ריג-SVG לזמרת. 4. DPR cap + rAF יחיד. 5. attract-loop + הוראה-קולית. 6. 120 תמונות sprite. 7. level-up רצף + ספרייט-ריקוד. 8. reduced-motion + אזורי-הגעה.

## מקורות
caniuse apng/webp · Apple forums 112218 · lottiefiles performance · bugs.webkit.org 190290 · googlefonts-discuss Rubik · Awesome-Hebrew-Fonts · myfonts Rinat Kids · ios-haptics · twemoji LICENSE · UXPA · gapsystudio · deque target-size · motionographer Toca · phys.org 2018
