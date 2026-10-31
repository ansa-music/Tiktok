// Episode 4: the hero goes through the gate the audience picked. window.VARIANT = 'fire' | 'tide'.
// Needs lib.js and lib2.js loaded first.
const V = window.VARIANT || 'fire';
const FIRE = V === 'fire';
const PAL = FIRE
  ? { sky: ['#1a0402', '#5a1206', '#c2410c'], glow: '255,120,40', blade: '#ffb347', rim: '#ffb347', beast: '#2a0603', eye: '#ffd23f', part: 'rgba(255,170,60,', name: 'THE FIRE GATE' }
  : { sky: ['#020a1e', '#06306b', '#0e7490'], glow: '60,200,255', blade: '#7fe9ff', rim: '#7fe9ff', beast: '#02101f', eye: '#b8fff5', part: 'rgba(160,240,255,', name: 'THE TIDE GATE' };

function gate(x, y, r, t, hot) {
  const c = hot ? ['#fff1b0', '#ff8a1e', '#d1131f'] : ['#e6fbff', '#45d4ff', '#1450d6'];
  const g = ctx.createRadialGradient(x, y, 5, x, y, r * 1.8);
  g.addColorStop(0, hot ? 'rgba(255,120,40,.55)' : 'rgba(60,170,255,.55)'); g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g; ctx.fillRect(x - r * 2, y - r * 2, r * 4, r * 4);
  ctx.save(); ctx.translate(x, y); ctx.scale(.62, 1);
  const core = ctx.createRadialGradient(0, 0, 4, 0, 0, r); core.addColorStop(0, c[0]); core.addColorStop(.5, c[1]); core.addColorStop(1, c[2]);
  ctx.fillStyle = core; ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
  ctx.lineCap = 'round';
  for (let i = 0; i < 8; i++) { const rr = r * (.25 + i * .09), a0 = t * (hot ? 2.4 : -2.4) * (1 + i * .12) + i;
    ctx.strokeStyle = i % 2 ? c[0] : c[1]; ctx.globalAlpha = .75; ctx.lineWidth = 6 + i; ctx.beginPath(); ctx.arc(0, 0, rr, a0, a0 + 1.7); ctx.stroke(); }
  ctx.restore(); ctx.globalAlpha = 1;
}
function realm(t, shake = 0) {
  sky(...PAL.sky); camera(1.04, 0, 0, shake, t);
  if (FIRE) {                                   // volcanic ridges and lava rivers
    mountains(['#3a0a04', '#250602', '#140301'], t * 20, 0);
    for (let i = 0; i < 4; i++) { const y = 1500 + i * 90; ctx.strokeStyle = `rgba(255,${120 + i * 30},40,.8)`; ctx.lineWidth = 10 - i * 2;
      ctx.beginPath(); for (let x = -50; x <= W + 50; x += 30) ctx.lineTo(x, y + Math.sin(x * .01 + t * 2 + i) * 18); ctx.stroke(); }
  } else {                                      // underwater: light shafts and a sandy floor
    ctx.fillStyle = 'rgba(200,255,255,.07)';
    for (let i = 0; i < 6; i++) { const x = 80 + i * 170 + Math.sin(t + i) * 30; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + 60, 0); ctx.lineTo(x + 220, H); ctx.lineTo(x + 100, H); ctx.fill(); }
    mountains(['#062a4a', '#041d33', '#02101f'], t * 10, 60);
  }
}
function particles(t, k = 1) {
  const r = rng(77);
  for (let i = 0; i < 120; i++) {
    const x = (r() * W + Math.sin(t + i) * 30) % W, sp = 60 + r() * 160;
    const y = FIRE ? (H - ((r() * H + t * sp) % H)) : ((r() * H - t * sp * .5) % H + H) % H;   // embers rise, bubbles drift up slowly
    ctx.fillStyle = PAL.part + (.4 + .5 * r()) * k + ')';
    ctx.beginPath(); ctx.arc(x, y, FIRE ? 2 + r() * 4 : 3 + r() * 7, 0, Math.PI * 2); FIRE ? ctx.fill() : (ctx.strokeStyle = PAL.part + '.6)', ctx.lineWidth = 2, ctx.stroke());
  }
}
function beast(cx, y, s, t, a = 1, eyes = 1) {   // fire serpent or deep-sea leviathan, as a silhouette
  ctx.save(); ctx.globalAlpha = a; ctx.translate(cx, y); ctx.scale(s, s);
  ctx.fillStyle = PAL.beast;
  ctx.beginPath(); ctx.moveTo(-700, 700);
  for (let i = 0; i <= 20; i++) { const k = i / 20, x = -700 + k * 1000, yy = 400 - Math.sin(k * Math.PI) * 650 + Math.sin(t * 2 + k * 6) * 40; ctx.lineTo(x, yy); }
  ctx.quadraticCurveTo(420, -320, 520, -180);                  // head
  ctx.lineTo(440, -60); ctx.quadraticCurveTo(200, 120, 300, 700); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = `rgba(${PAL.glow},.85)`; ctx.lineWidth = 7; ctx.shadowColor = `rgb(${PAL.glow})`; ctx.shadowBlur = 30; ctx.stroke(); ctx.shadowBlur = 0;   // rim light so it reads on a dark sky
  if (FIRE) { ctx.beginPath(); ctx.moveTo(380, -300); ctx.lineTo(330, -460); ctx.lineTo(430, -320); ctx.fill(); }   // horn
  else { for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.moveTo(-500 + i * 180, 120 - Math.sin(i) * 60); ctx.lineTo(-460 + i * 180, -20 - Math.sin(i) * 60); ctx.lineTo(-420 + i * 180, 120 - Math.sin(i) * 60); ctx.fill(); } }   // fins
  const blink = Math.sin(t * 1.7) > .97 ? .15 : 1;
  const g = ctx.createRadialGradient(410, -200, 2, 410, -200, 90); g.addColorStop(0, `rgba(${PAL.glow},${.8 * eyes})`); g.addColorStop(1, `rgba(${PAL.glow},0)`);
  ctx.fillStyle = g; ctx.fillRect(320, -290, 180, 180);
  ctx.fillStyle = PAL.eye; ctx.globalAlpha = a * eyes; ctx.beginPath(); ctx.ellipse(410, -200, 34, 12 * blink, -.3, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}
function rival(x, y, s, t, a) {                  // the next threat: a second swordsman, opposite colour scarf
  ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y); ctx.scale(-1, 1); ctx.translate(-x, -y);
  hero(x, y, s, t, { rim: FIRE ? '#7fd4ff' : '#ff6a4a', blade: 1, scarf: '#e9eef2' });
  ctx.restore();
}

// shots
function s1(t, lt) {                             // cold open: hero sprints into the chosen gate
  sky('#05020c', '#2a0716', '#4a0c1c'); camera(1 + lt * .25, 0, 0, 6 + lt * 20, t);
  gate(W / 2, 900, 260 + lt * 300, t, FIRE);
  rooftops('#050106', 0, 1820);
  const k = ease(seg(lt, 0, 1.4));
  hero(W / 2, lerp(1640, 1000, k), lerp(1.5, .4, k), t, { rim: PAL.rim, blade: 1, crouch: .6, lean: .2 });
  hLines(t, .5 * k, PAL.part);
  flash(clamp((lt - 1.2) * 4), FIRE ? '255,200,140' : '200,250,255');
}
function s2(t, lt) {                             // arrival in the new world
  realm(t); particles(t);
  const k = easeOut(seg(lt, 0, .8));
  hero(W / 2, 1640, lerp(2.4, 1.6, k), t, { rim: PAL.rim, blade: 1 });
  flash(clamp(1 - lt * 3), FIRE ? '255,200,140' : '200,250,255');
}
function s3(t, lt) {                             // the beast rises, shake builds
  const k = ease(seg(lt, 0, 2));
  realm(t, 8 + 24 * k); beast(W / 2 + 60, lerp(1500, 950, k), .85, t); particles(t, 1);
  hero(W / 2 + 180, 1680, 1.4, t, { rim: PAL.rim, blade: 1, crouch: seg(lt, 1.6, 2.4) * .7 });
  flash(.2 * Math.max(0, Math.sin(lt * 10)) * k, PAL.glow);
}
function s4(t, lt) {                             // charge: blade takes the gate's element
  ctx.fillStyle = PAL.sky[0]; ctx.fillRect(0, 0, W, H);
  const k = seg(lt, 0, .9); camera(1 + k * .2, 0, 0, 10 + 14 * k, t);
  const g = ctx.createRadialGradient(W / 2, 1100, 40, W / 2, 1100, 900); g.addColorStop(0, `rgba(${PAL.glow},${.6 * k})`); g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  radialLines(W / 2, 1000, .5 + .5 * k, t, PAL.part);
  hero(W / 2, 1760, 2.8, t, { crouch: .9, blade: 1, rim: PAL.rim });
}
function s5(t, lt) {                             // two impact frames + the slash
  if (lt < .3) { const on = Math.floor(lt * 20) % 2 === 0; ctx.fillStyle = on ? '#fff' : '#000'; ctx.fillRect(0, 0, W, H);
    radialLines(W / 2, H / 2, 1, t, on ? 'rgba(0,0,0,' : 'rgba(255,255,255,', 60);
    ctx.save(); ctx.filter = on ? 'none' : 'invert(1)'; hero(W / 2, 1500, 2.4, t, { crouch: .4, blade: 1, lean: -.3, rim: on ? '#000' : '#fff' }); ctx.restore(); return; }
  realm(t, 30 * (1 - seg(lt, .3, 1.6)));
  beast(W / 2 + 60, 950, .85, t, 1 - seg(lt, .5, 1.8), 1 - seg(lt, .3, .6));
  slash(-100, 1700, W + 100, 400, easeOut(seg(lt, .3, .5)), lerp(34, 0, seg(lt, .5, 1.6)));
  const r = rng(11); ctx.fillStyle = PAL.part + '1)';
  for (let i = 0; i < 160; i++) { const a = r() * 6.28, d = seg(lt, .4, 2) * (200 + r() * 900); ctx.globalAlpha = 1 - seg(lt, .8, 2); ctx.fillRect(W / 2 - 100 + Math.cos(a) * d, 800 + Math.sin(a) * d, 6, 6); }
  ctx.globalAlpha = 1; particles(t, .6);
  hero(W / 2 + 160, 1680, 1.4, t, { rim: PAL.rim, blade: 1 - seg(lt, 1.4, 2) });
}
function s6(t, lt) {                             // calm, then the rival steps out of the haze (cliffhanger)
  realm(t); particles(t, .7);
  hero(W / 2 - 230, 1680, 1.4, t, { rim: PAL.rim });
  const k = easeOut(seg(lt, .8, 1.8));
  rival(W / 2 + 300, 1680, 1.4 * (.85 + .15 * k), t, k);
  if (k > .9) flash(.25 * clamp(1 - (lt - 1.8) * 4), PAL.glow);
}
function s7(t, lt) {                             // title card, held so the loop restarts on the gate
  s6(t, 2 + lt);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const k = easeOut(seg(lt, .1, .6));
  ctx.save(); ctx.globalAlpha = k; ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(5,5,10,.6)'; ctx.fillRect(0, 230, W, 380);
  ctx.font = '900 140px "Inter Display", Inter, sans-serif'; ctx.fillStyle = '#F4F4F0'; ctx.fillText('AJENT21', W / 2, 410);
  ctx.font = '500 40px "JetBrains Mono", monospace'; ctx.fillStyle = '#C8FF2E'; ctx.fillText('EPISODE 4  ·  ' + PAL.name, W / 2, 490);
  ctx.font = '700 40px "JetBrains Mono", monospace'; ctx.fillStyle = '#ffffff'; ctx.fillText('WHO IS HE?  EP.5 →', W / 2, 560);
  ctx.restore();
}
const SHOTS = [[0, 1.6, s1], [1.6, 3.4, s2], [3.4, 6.2, s3], [6.2, 7.4, s4], [7.4, 9.8, s5], [9.8, 12.6, s6], [12.6, 16, s7]];
window.DURATION = 16;
window.draw = function (t) {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.filter = 'none'; ctx.globalAlpha = 1; ctx.shadowBlur = 0;
  const s = SHOTS.find(([a, b]) => t >= a && t < b) || SHOTS[SHOTS.length - 1];
  ctx.save(); s[2](t, t - s[0]); ctx.restore();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const sinceCut = t - s[0]; if (s[0] > 0 && sinceCut < .08) flash(.45 * (1 - sinceCut / .08));
  vignette(.55); grain(t); letterbox(t < 12.6 ? 1 : 1 - seg(t, 12.6, 13.1));
  ctaPill(t, 6.4, 2.4, 'FOLLOW FOR EP.5 →');
};
