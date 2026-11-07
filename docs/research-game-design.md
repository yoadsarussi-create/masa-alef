# מחקר עיצוב — משחק-לימוד מוזיקלי לבת 5.5, PWA על iOS 15 (07/11/2026)

## 1. מה הופך משחקי-לימוד לגילאי 5–7 ל"דביקים"
- **אוסף שמגדל דמות, לא נקודות** (Khan Academy Kids): כל פעילות מזכה בפריט לדמות אהובה. → זמרת-אווטאר שאוספת מיקרופונים, תלבושות ולהקה.
- **מדבקות לאלבום** (Lingokids): 5 פעילויות = חבילה שנפתחת ומודבקת על סצנה.
- **מפה צבעונית, עצירות של 3–5 דקות** (Duolingo ABC). כפתור "המשך" אחד גדול; קול מקריא כל כפתור.
- **סטריק בזהירות:** לוח-שנה של מדבקות שרק מתמלא ואף-פעם לא "נשבר".
- **בלי כישלון** (Toca Boca/Sago Mini/Pok Pok): אין Game Over, אין טיימר; טעות = הדמות מצחקקת ורומזת; אחרי 2 טעויות התשובה הנכונה מהבהבת.
- **"אות חיה"** (Endless Alphabet): כל אות שנוגעים בה משמיעה את הצליל ומזדעזעת.
- **דשבורד-הורים מאחורי שער** (שאלה חשבונית/החזקה ארוכה).

## 2. מכניקות מוזיקליות
- נתיב-קצב 2–3 נתיבים, חלון ±250ms, 70–90 BPM, פספוס לא מעניש.
- קריוקי-אותיות עם הדגשת-הברה בזמן (בלי זיהוי-קול).
- קסילופון/סאונד-בורד: כל אות = צליל (triangle + envelope). "נגני את המילה".
- הפסקת-ריקוד כל 3 פעילויות (20 שניות).
- ספירה מוזיקלית: 1–10 כסולם עולה; המספר הנכון "משלים" את המנגינה.

## 3. אנימציה זולה ל-iPhone 7 Plus / iPad mini 4
- CSS keyframes על `transform`/`opacity` בלבד; Canvas 2D לקונפטי/עקיבה; SVG סטטי לדמויות. בלי WebGL/Three/Rive-WebGL2.
- Spring: `cubic-bezier(.34,1.56,.64,1)`. Squash&stretch: `scale(1.15,.85)→scale(.9,1.1)→1` ב-250ms.
- רעידת-מסך ±4px ל-150ms. Idle bob ±3px/2s + מצמוץ.
- קונפטי ≤50 חלקיקים. Lottie רק לחגיגה אחת (renderer canvas), לא ל-UI.
- Web Audio: `resume()` ב-`touchend` הראשון; קונטקסט יחיד; מתג-רטט משתיק → רמז "הרימי את הצליל".
- להימנע: `filter`/`box-shadow` מונפשים, `backdrop-filter`, וידאו-רקע.

## 4. עקיבת-אותיות וחבר-את-הנקודות
- כל אות = מערך משיכות (polyline); התקדמות רק אם הנקודה הקרובה ≤ אינדקס+N ובתוך רדיוס 30–40px. סטייה = רמז פועם, לא מחיקה.
- שובל-נצנצים: עיגולים זעירים ב-canvas עליון עם alpha דועך; מתחת קו-מילוי lineWidth 28.
- כוכבים: 1 = סיום, 2 = בלי רמזים, 3 = מעט סטיות. לעולם לא 0.
- חבר-את-הנקודות: הנקודה הבאה פועמת; כל חיבור = צליל עולה בסולם.

## 5. נכסים חופשיים
- Kenney (CC0): UI Audio, Interface Sounds, Music Jingles, Toon Characters, Emotes, Animal Pack, UI Pack.
- OpenMoji (CC BY-SA 4.0), Twemoji (CC BY 4.0), game-icons.net (CC BY 3.0), Freesound (CC0 בלבד).
- פונטים עבריים (OFL): Varela Round, Rubik, Secular One; כותרות: Rubik Bubbles, Rubik Doodle Shadow.

## Top 10 ליישום
1. Spring + squash&stretch על כל אלמנט. 2. צליל-לכל-מגע. 3. אות-חיה. 4. עקיבת-אות ב-Canvas. 5. אווטאר + אוסף.
6. מפת-שביל + "המשך" אחד. 7. קונפטי + ג'ינגל-ניצחון. 8. נתיב-קצב סלחני. 9. קריוקי-אותיות. 10. אלבום-מדבקות + שער-הורים.

## מקורות
khankids.zendesk.com · screenwiseapp.com (Khan Kids, Pok Pok, Toca Boca, Endless Alphabet) · help.lingokids.com · screensdesign.com (Duolingo ABC) · sagomini.com · commonsense.org · lescapadou.com (Writing Wizard) · forum.lottiefiles.com · rive.app/docs · mattmontag.com (unlock Web Audio iOS) · itch.io juicy effects · kenney.nl · opengameart.org · fontsource.org · github.com/danielrosehill/Awesome-Hebrew-Fonts
