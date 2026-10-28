// usage: node render-edge.js <scene.html> <outDir> [fps] [onlyTimes comma-separated]
// Same output as render.js, but drives the locally installed Microsoft Edge over CDP (no Playwright needed).
const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const EDGE = process.env.EDGE_PATH || 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const PORT = 9333;
const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const [scene, outDir, fpsArg, only] = process.argv.slice(2);
  const fps = Number(fpsArg || 30);
  fs.mkdirSync(outDir, { recursive: true });
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'edge-render-'));
  const url = 'file:///' + path.resolve(scene).replace(/\\/g, '/');
  const edge = spawn(EDGE, ['--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`,
    '--window-size=1080,1920', '--hide-scrollbars', '--no-first-run', url], { stdio: 'ignore' });

  let target;
  for (let i = 0; i < 50 && !target; i++) {
    await sleep(200);
    try { target = (await (await fetch(`http://127.0.0.1:${PORT}/json`)).json()).find(t => t.type === 'page'); } catch {}
  }
  if (!target) throw new Error('Edge did not start');

  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  let id = 0; const pending = new Map();
  ws.onmessage = e => { const m = JSON.parse(e.data); if (pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } };
  const evaluate = expression => new Promise((res, rej) => {
    const n = ++id; pending.set(n, m => m.result?.exceptionDetails ? rej(new Error(m.result.exceptionDetails.exception?.description || 'eval error')) : res(m.result?.result?.value));
    ws.send(JSON.stringify({ id: n, method: 'Runtime.evaluate', params: { expression, awaitPromise: true, returnByValue: true } }));
  });

  for (let i = 0; i < 50 && !(await evaluate('typeof window.draw === "function"')); i++) await sleep(200);
  // canvas text does not trigger webfont loading by itself, so load the faces explicitly
  await evaluate(`Promise.all(['900 100px Inter', '800 100px Inter', '600 100px "JetBrains Mono"', '800 100px "JetBrains Mono"'].map(f => document.fonts.load(f))).then(() => document.fonts.ready).then(() => 1)`);
  const duration = await evaluate('window.DURATION');
  const times = only ? only.split(',').map(Number) : Array.from({ length: Math.round(duration * fps) }, (_, i) => i / fps);
  for (let i = 0; i < times.length; i++) {
    const data = await evaluate(`(window.draw(${times[i]}), document.getElementById('c').toDataURL('image/jpeg', 0.93))`);
    const name = only ? `t_${times[i]}.jpg` : `f_${String(i).padStart(5, '0')}.jpg`;
    fs.writeFileSync(path.join(outDir, name), Buffer.from(data.split(',')[1], 'base64'));
  }
  ws.close(); edge.kill();
  console.log(`rendered ${times.length} frames (duration ${duration}s)`);
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
