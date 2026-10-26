# Конвейер моушн-видео Ajent21

Бесплатный и без лимитов: canvas в Chromium (Playwright) → JPEG-кадры → ffmpeg. Музыку и SFX синтезирует Python, поверх кладутся реальные сэмплы Mixkit.

## Установка (один раз)
    npm i playwright && npx playwright install chromium
    pip install numpy scipy
    # плюс ffmpeg и шрифты: Inter Display, JetBrains Mono, Noto Color Emoji

## Сборка ролика
    node scripts/render.js scripts/<scene>.html frames/<scene> 30
    python3 scripts/sfx.py scripts/<scene>_cue.json out/<scene>.wav
    ffmpeg -y -framerate 30 -i frames/<scene>/f_%05d.jpg -i out/<scene>.wav -c:v libx264 -crf 20 -pix_fmt yuv420p -c:a aac -b:a 192k -shortest -movflags +faststart out/<scene>.mp4

## Проверочные кадры
    node scripts/render.js scripts/<scene>.html frames/check 30 "1.5,4,8,12"

## Как сделать новую сцену
1. Скопировать `cosmic.html` (инфографика) или `ep2.html` (аниме) и подключить `lib.js` (+ `lib2.js`).
2. Описать сцену функциями `sX(t, lt)` и таблицей `SHOTS = [[start, end, fn], ...]`, задать `window.DURATION`.
3. Сделать `<scene>_cue.json`: секции `ambient | tension | drop | outro` и удары `shing | whoosh | impact | riser | boom | sparkle | swell` (или `{"type":"file","file":"<имя mp3 без расширения>"}`).
4. Правила: действие с первого кадра, смена картинки каждые 2–3 с, CTA-плашка `ctaPill()` на 40–45% длины, без затемнения в конце, длина 13 с или до 30 с.
