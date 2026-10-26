// usage: node render.js <scene.html> <outDir> [fps] [onlyTimes comma-separated]
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const [scene, outDir, fpsArg, only] = process.argv.slice(2);
  const fps = Number(fpsArg || 30);
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  await page.goto('file://' + path.resolve(scene));
  await page.evaluate(() => document.fonts.ready);
  const duration = await page.evaluate(() => window.DURATION);
  const times = only ? only.split(',').map(Number) : Array.from({ length: Math.round(duration * fps) }, (_, i) => i / fps);
  for (let i = 0; i < times.length; i++) {
    const data = await page.evaluate(t => { window.draw(t); return document.getElementById('c').toDataURL('image/jpeg', 0.93); }, times[i]);
    const name = only ? `t_${times[i]}.jpg` : `f_${String(i).padStart(5, '0')}.jpg`;
    fs.writeFileSync(path.join(outDir, name), Buffer.from(data.split(',')[1], 'base64'));
  }
  await browser.close();
  console.log(`rendered ${times.length} frames (duration ${duration}s)`);
})();
