// Episode 2: THE RED MOON
function moon(x, y, r, t, crack = 0, eye = 0) {
  const glow = ctx.createRadialGradient(x, y, r * .5, x, y, r * 2.6);
  glow.addColorStop(0, 'rgba(255,60,60,.45)'); glow.addColorStop(1, 'rgba(120,0,20,0)');
  ctx.fillStyle = glow; ctx.fillRect(x - r * 3, y - r * 3, r * 6, r * 6);
  const g = ctx.createRadialGradient(x - r * .3, y - r * .3, r * .1, x, y, r);
  g.addColorStop(0, '#ff9c8a'); g.addColorStop(.6, '#e8304a'); g.addColorStop(1, '#8c0f2a');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(120,10,30,.35)';
  [[-.3, -.2, .18], [.25, .1, .12], [-.05, .35, .1], [.35, -.35, .08]].forEach(([a, b, s]) => { ctx.beginPath(); ctx.arc(x + a * r, y + b * r, s * r, 0, Math.PI * 2); ctx.fill(); });
  if (crack > 0) {
    ctx.save(); ctx.strokeStyle = '#ffe9a8'; ctx.shadowColor = '#ffcf5a'; ctx.shadowBlur = 30; ctx.lineWidth = 6;
    const r2 = rng(3);
    for (let i = 0; i < 7; i++) {
      const a = r2() * Math.PI * 2; ctx.beginPath(); ctx.moveTo(x, y);
      let px = x, py = y;
      for (let j = 1; j <= 5; j++) { px = x + Math.cos(a + (r2() - .5) * .5) * r * j / 5 * crack; py = y + Math.sin(a + (r2() - .5) * .5) * r * j / 5 * crack; ctx.lineTo(px, py); }
      ctx.stroke();
    }
    ctx.restore();
  }
  if (eye > 0) {
    ctx.save(); ctx.translate(x, y);
    ctx.fillStyle = '#1a0006'; ctx.beginPath(); ctx.moveTo(-r * .8, 0); ctx.quadraticCurveTo(0, -r * .7 * eye, r * .8, 0); ctx.quadraticCurveTo(0, r * .7 * eye, -r * .8, 0); ctx.fill();
    ctx.save(); ctx.clip();
    const ig = ctx.createRadialGradient(0, 0, 5, 0, 0, r * .4); ig.addColorStop(0, '#fff7c2'); ig.addColorStop(.4, '#ffcc33'); ig.addColorStop(1, '#a33a00');
    ctx.fillStyle = ig; ctx.beginPath(); ctx.arc(Math.sin(t * 1.3) * r * .08, 0, r * .4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#0a0000'; ctx.beginPath(); ctx.ellipse(Math.sin(t * 1.3) * r * .08, 0, r * .06, r * .3, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore(); ctx.restore();
  }
}
function rooftops(col, off = 0, base = 1500) {
  ctx.fillStyle = col;
  const r = rng(21); let x = -300 - off % 400;
  while (x < W + 300) {
    const w = 220 + r() * 220, h = 120 + r() * 380, y = base - h;
    ctx.fillRect(x + w * .15, y, w * .7, H);                         // body
    ctx.beginPath(); ctx.moveTo(x - 40, y + 10); ctx.quadraticCurveTo(x + w * .5, y - 70, x + w + 40, y + 10);   // curved pagoda roof
    ctx.lineTo(x + w * .85, y + 40); ctx.lineTo(x + w * .15, y + 40); ctx.closePath(); ctx.fill();
    if (r() > .4) { ctx.beginPath(); ctx.moveTo(x + w * .1, y - 90); ctx.quadraticCurveTo(x + w * .5, y - 150, x + w * .9, y - 90); ctx.lineTo(x + w * .7, y - 60); ctx.lineTo(x + w * .3, y - 60); ctx.closePath(); ctx.fill(); ctx.fillRect(x + w * .3, y - 70, w * .4, 80); }
    x += w + 30;
  }
}
function lanterns(t, k = 1) {
  const r = rng(31);
  for (let i = 0; i < 14; i++) {
    const x = r() * W, y = 1150 + r() * 600, s = 10 + r() * 10, fl = .7 + .3 * Math.sin(t * 6 + i);
    const g = ctx.createRadialGradient(x, y, 1, x, y, s * 5); g.addColorStop(0, `rgba(255,170,80,${.8 * fl * k})`); g.addColorStop(1, 'rgba(255,90,40,0)');
    ctx.fillStyle = g; ctx.fillRect(x - s * 5, y - s * 5, s * 10, s * 10);
    ctx.fillStyle = `rgba(255,190,110,${fl * k})`; ctx.beginPath(); ctx.ellipse(x, y, s * .7, s, 0, 0, Math.PI * 2); ctx.fill();
  }
}
function ninja(x, y, s, rot, t) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.fillStyle = '#030306';
  ctx.beginPath(); ctx.ellipse(0, 0, 40, 70, 0, 0, Math.PI * 2); ctx.fill();                 // body tucked
  ctx.beginPath(); ctx.arc(0, -80, 28, 0, Math.PI * 2); ctx.fill();                         // head
  ctx.beginPath(); ctx.moveTo(-30, -20); ctx.lineTo(-110, -60); ctx.lineTo(-100, -40); ctx.lineTo(-30, 10); ctx.fill();   // arm
  ctx.beginPath(); ctx.moveTo(20, 40); ctx.lineTo(90, 110); ctx.lineTo(70, 120); ctx.lineTo(0, 60); ctx.fill();          // leg
  ctx.strokeStyle = '#030306'; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(20, -90);      // headband tails
  ctx.quadraticCurveTo(60, -100 + Math.sin(t * 20) * 10, 100, -80 + Math.sin(t * 20 + 1) * 14); ctx.stroke();
  ctx.fillStyle = '#ff2a44'; ctx.fillRect(-16, -86, 12, 4); ctx.fillRect(4, -86, 12, 4);    // eyes
  ctx.restore();
}
function nightSky(t) { sky('#05020c', '#2a0716', '#4a0c1c'); }

