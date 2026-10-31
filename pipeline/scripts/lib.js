
const W = 1080, H = 1920;
const c = document.getElementById('c');
const ctx = c.getContext('2d');

// ---------- helpers ----------
function rng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, k) => a + (b - a) * k;
const ease = k => k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
const easeOut = k => 1 - Math.pow(1 - k, 3);
const seg = (t, a, b) => clamp((t - a) / (b - a));

function ridge(seed, baseY, amp, step) {
  const r = rng(seed), pts = [];
  for (let x = -400; x <= W + 400; x += step) pts.push([x, baseY - r() * amp - Math.sin(x * 0.004 + seed) * amp * 0.4]);
  return pts;
}
const RIDGES = [ridge(11, 1180, 260, 60), ridge(23, 1300, 200, 45), ridge(37, 1420, 150, 35)];

const PETALS = (() => { const r = rng(5); return Array.from({ length: 90 }, () => ({ x: r() * W, y: r() * H, s: 8 + r() * 14, v: 0.6 + r(), ph: r() * 6.28, sp: (r() - .5) * 4 })); })();
const SPARKS = (() => { const r = rng(9); return Array.from({ length: 260 }, () => ({ a: r() * 6.283, v: 200 + r() * 900, s: 2 + r() * 6, d: r() })); })();

// ---------- scene pieces ----------
function sky(top, mid, bot) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, top); g.addColorStop(.55, mid); g.addColorStop(1, bot);
  ctx.fillStyle = g; ctx.fillRect(-400, -400, W + 800, H + 800);
}
function sun(x, y, r, t) {
  const glow = ctx.createRadialGradient(x, y, r * .2, x, y, r * 3);
  glow.addColorStop(0, 'rgba(255,200,120,.55)'); glow.addColorStop(1, 'rgba(255,120,80,0)');
  ctx.fillStyle = glow; ctx.fillRect(x - r * 3, y - r * 3, r * 6, r * 6);
  ctx.save(); ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.clip();
  const g = ctx.createLinearGradient(0, y - r, 0, y + r);
  g.addColorStop(0, '#fff3b0'); g.addColorStop(.5, '#ffb35c'); g.addColorStop(1, '#ff4f6d');
  ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2);
  // retro bands
  ctx.fillStyle = 'rgba(70,20,70,.9)';
  for (let i = 0; i < 7; i++) { const by = y + r * 0.15 + i * r * 0.13 + ((t * 30) % (r * .13)); ctx.fillRect(x - r, by, r * 2, 4 + i * 2.2); }
  ctx.restore();
}
function mountains(cols, camX, rise) {
  RIDGES.forEach((pts, i) => {
    const px = camX * (0.15 + i * 0.2);
    ctx.fillStyle = cols[i]; ctx.beginPath(); ctx.moveTo(-400, H + 400);
    pts.forEach(([x, y]) => ctx.lineTo(x - px, y + rise * (1 - i * .2)));
    ctx.lineTo(W + 400, H + 400); ctx.closePath(); ctx.fill();
  });
}
function cliff(col) {
  ctx.fillStyle = col; ctx.beginPath();
  ctx.moveTo(-400, H + 400); ctx.lineTo(-400, 1560); ctx.lineTo(120, 1520); ctx.lineTo(420, 1500);
  ctx.lineTo(640, 1515); ctx.lineTo(720, 1560); ctx.lineTo(760, 1700); ctx.lineTo(820, H + 400); ctx.closePath(); ctx.fill();
}
// hero silhouette: feet at (x,y), scale s. pose: crouch 0..1, blade 0..1 (drawn), lean
function hero(x, y, s, t, o = {}) {
  const crouch = o.crouch || 0, blade = o.blade || 0, lean = o.lean || 0, rim = o.rim || '#ffb35c';
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(lean);
  const h = 1 - crouch * .25;
  // scarf
  ctx.strokeStyle = o.scarf || '#e8263e'; ctx.lineWidth = 14; ctx.lineCap = 'round'; ctx.beginPath();
  ctx.moveTo(0, -300 * h);
  for (let i = 1; i <= 8; i++) ctx.lineTo(-i * 34, -300 * h + Math.sin(t * 9 + i * .8) * (6 + i * 3) + i * 4);
  ctx.stroke();
  ctx.fillStyle = '#05050a';
  // legs / coat
  ctx.beginPath();
  ctx.moveTo(-60 - crouch * 40, 0); ctx.lineTo(-22, -150 * h); ctx.lineTo(22, -150 * h); ctx.lineTo(70 + crouch * 50, 0);
  ctx.lineTo(48 + crouch * 50, 0); ctx.lineTo(4, -110 * h); ctx.lineTo(-38 - crouch * 40, 0); ctx.closePath(); ctx.fill();
  // coat tails flowing
  ctx.beginPath(); ctx.moveTo(-40, -170 * h); ctx.quadraticCurveTo(-90, -90 * h, -120 + Math.sin(t * 7) * 18, -40 * h);
  ctx.lineTo(-30, -120 * h); ctx.closePath(); ctx.fill();
  // torso
  ctx.beginPath(); ctx.moveTo(-46, -290 * h); ctx.lineTo(46, -290 * h); ctx.lineTo(34, -150 * h); ctx.lineTo(-34, -150 * h); ctx.closePath(); ctx.fill();
  // head + hair spikes
  ctx.beginPath(); ctx.arc(0, -330 * h, 34, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-34, -340 * h);
  [[-60, -360], [-30, -372], [-48, -400], [-6, -384], [0, -420], [18, -384], [44, -398], [34, -350]].forEach(([a, b]) => ctx.lineTo(a + Math.sin(t * 6 + a) * 3, b * h));
  ctx.closePath(); ctx.fill();
  // rim light
  ctx.strokeStyle = rim; ctx.lineWidth = 4; ctx.globalAlpha = .9;
  ctx.beginPath(); ctx.arc(0, -330 * h, 34, -1.2, 0.6); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(46, -290 * h); ctx.lineTo(34, -150 * h); ctx.stroke();
  ctx.globalAlpha = 1;
  // katana
  ctx.save(); ctx.translate(30, -200 * h); ctx.rotate(lerp(1.9, -0.5, blade));
  ctx.fillStyle = '#05050a'; ctx.fillRect(-6, -10, 12, 70);
  if (blade > 0) {
    const L = 260 * blade; const g = ctx.createLinearGradient(0, 0, 0, -L);
    g.addColorStop(0, '#cfe9ff'); g.addColorStop(1, '#ffffff');
    ctx.shadowColor = '#7fd4ff'; ctx.shadowBlur = 30 * blade; ctx.fillStyle = g;
    ctx.beginPath(); ctx.moveTo(-5, -8); ctx.lineTo(5, -8); ctx.lineTo(2, -L); ctx.lineTo(-6, -L + 30); ctx.closePath(); ctx.fill();
  }
  ctx.restore();
  ctx.restore();
}
function petals(t, col, wind = 1) {
  ctx.fillStyle = col;
  PETALS.forEach(p => {
    const x = ((p.x + t * 120 * p.v * wind + Math.sin(t + p.ph) * 40) % (W + 100) + W + 100) % (W + 100) - 50;
    const y = ((p.y + t * 90 * p.v) % (H + 100)) - 50;
    ctx.save(); ctx.translate(x, y); ctx.rotate(t * p.sp + p.ph); ctx.scale(1, .55 + .45 * Math.sin(t * 3 + p.ph));
    ctx.beginPath(); ctx.ellipse(0, 0, p.s, p.s * .55, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  });
}
function creature(cx, baseY, rise, t, alpha = 1, crack = 0) {
  if (alpha <= 0) return;
  ctx.save(); ctx.globalAlpha = alpha;
  const y = baseY - rise;
  const r = rng(77);
  ctx.fillStyle = '#12051a';
  ctx.beginPath(); ctx.moveTo(cx - 700, baseY + 400);
  ctx.bezierCurveTo(cx - 620, y + 200, cx - 420, y - 60, cx - 250, y - 120);
  ctx.lineTo(cx - 330, y - 420); ctx.lineTo(cx - 160, y - 200);            // left horn
  ctx.quadraticCurveTo(cx, y - 260, cx + 160, y - 200);
  ctx.lineTo(cx + 330, y - 420); ctx.lineTo(cx + 250, y - 120);            // right horn
  ctx.bezierCurveTo(cx + 420, y - 60, cx + 620, y + 200, cx + 700, baseY + 400);
  ctx.closePath(); ctx.fill();
  // eyes
  const blink = Math.sin(t * 2) > .97 ? .2 : 1;
  [[-110, -60], [110, -60]].forEach(([ex, ey]) => {
    const g = ctx.createRadialGradient(cx + ex, y + ey, 2, cx + ex, y + ey, 120);
    g.addColorStop(0, 'rgba(255,40,60,.9)'); g.addColorStop(1, 'rgba(255,0,40,0)');
    ctx.fillStyle = g; ctx.fillRect(cx + ex - 120, y + ey - 120, 240, 240);
    ctx.fillStyle = '#ff2a44'; ctx.beginPath(); ctx.ellipse(cx + ex, y + ey, 46, 14 * blink, ex < 0 ? .25 : -.25, 0, Math.PI * 2); ctx.fill();
  });
  ctx.restore();
}
function radialLines(cx, cy, k, t, col = 'rgba(255,255,255,', n = 70) {
  const r = rng(Math.floor(t * 24));
  for (let i = 0; i < n; i++) {
    const a = r() * Math.PI * 2, inner = lerp(900, 260, k) + r() * 160, w = 0.006 + r() * 0.012;
    ctx.fillStyle = col + (0.25 + r() * 0.5) * k + ')';
    ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * 2200, cy + Math.sin(a) * 2200);
    ctx.lineTo(cx + Math.cos(a + w) * 2200, cy + Math.sin(a + w) * 2200);
    ctx.lineTo(cx + Math.cos(a) * inner, cy + Math.sin(a) * inner); ctx.closePath(); ctx.fill();
  }
}
function hLines(t, k, col = 'rgba(255,255,255,') {
  const r = rng(Math.floor(t * 30));
  for (let i = 0; i < 60; i++) { ctx.fillStyle = col + (r() * .7 * k) + ')'; ctx.fillRect(r() * W - 300, r() * H, 300 + r() * 900, 2 + r() * 6); }
}
function slash(x1, y1, x2, y2, k, width) {
  const x = lerp(x1, x2, k), y = lerp(y1, y2, k);
  ctx.save(); ctx.lineCap = 'round';
  ctx.shadowColor = '#7fd4ff'; ctx.shadowBlur = 60;
  ctx.strokeStyle = 'rgba(160,225,255,.85)'; ctx.lineWidth = width * 2.4; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x, y); ctx.stroke();
  ctx.strokeStyle = '#ffffff'; ctx.lineWidth = width; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x, y); ctx.stroke();
  ctx.restore();
}
function vignette(a = .55) {
  const g = ctx.createRadialGradient(W / 2, H / 2, H * .25, W / 2, H / 2, H * .75);
  g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(0,0,0,${a})`);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}
function grain(t) {
  const r = rng(Math.floor(t * 30) + 1); ctx.fillStyle = 'rgba(255,255,255,.035)';
  for (let i = 0; i < 900; i++) ctx.fillRect(r() * W, r() * H, 2, 2);
}
function letterbox(k) { if (k <= 0) return; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, 160 * k); ctx.fillRect(0, H - 160 * k, W, 160 * k); }
function flash(a, col = '255,255,255') { if (a > 0) { ctx.fillStyle = `rgba(${col},${a})`; ctx.fillRect(0, 0, W, H); } }
function camera(scale, dx, dy, shake, t) {
  const r = rng(Math.floor(t * 60) + 3);
  ctx.translate(W / 2 + dx + (r() - .5) * shake, H / 2 + dy + (r() - .5) * shake); ctx.scale(scale, scale); ctx.translate(-W / 2, -H / 2);
}


// Mid-video call to action pill (shown early: most viewers never reach the end card)
function ctaPill(t, start, dur, text) {
  const k = clamp(Math.min(seg(t, start, start + .3), 1 - seg(t, start + dur - .3, start + dur)));
  if (k <= 0) return;
  ctx.save(); ctx.globalAlpha = k; ctx.textAlign = 'center';
  ctx.font = '800 40px "JetBrains Mono", monospace';
  const w = ctx.measureText(text).width + 70, x = W / 2 - w / 2, y = 1700 + (1 - k) * 30;
  ctx.fillStyle = '#C8FF2E'; ctx.beginPath(); ctx.roundRect(x, y, w, 84, 42); ctx.fill();
  ctx.fillStyle = '#0A0A0C'; ctx.fillText(text, W / 2, y + 56);
  ctx.restore();
}
