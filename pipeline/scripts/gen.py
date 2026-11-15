"""Generate a list-style SCALE short (hook → N fact cards → payoff) from a JSON spec.
usage: python3 gen.py <spec.json>   → writes scripts/<id>.html and scripts/<id>_cue.json
"""
import json, sys, os
spec = json.load(open(sys.argv[1]))
here = os.path.dirname(os.path.abspath(__file__))
s = open(os.path.join(here, 'moontrip.html')).read()
J = lambda v: json.dumps(v, ensure_ascii=False)
n = len(spec['events'])
seg = spec.get('seg', 2.6)
ev = ',\n  '.join(J([e[0], e[1], e[2], e[3], e[4], (i + 1) / n]) for i, e in enumerate(spec['events']))
a = s.index('// SCALE #11'); b = s.index('const STARS')
s = s[:a] + f"""// {spec['tag']}: {spec['title']}
const LIME = '#C8FF2E', INK = '#F4F4F0', MUTED = '#9A9A92';
const EV = [
  {ev},
];
const T0 = 2.4, SEG = {seg};
window.DURATION = T0 + SEG * EV.length + 4.6;
function fit(s, x, y, size, col, weight, fam, a, maxW) {{   // shrink text until it fits the frame
  fam = fam || '"Inter Display", Inter, sans-serif'; maxW = maxW || 980;
  ctx.font = `${{weight}} ${{size}}px ${{fam}}`;
  while (size > 24 && ctx.measureText(s).width > maxW) {{ size -= 4; ctx.font = `${{weight}} ${{size}}px ${{fam}}`; }}
  txt(s, x, y, size, col, weight, fam, a);
}}
""" + s[b:]
h = spec['hook']; p = spec['payoff']
rep = {
 "txt('HOW LONG TO', W / 2, 640, 110, INK, 900, undefined, k);": f"fit({J(h[0])}, W / 2, 640, 110, INK, 900, undefined, k);",
 "txt('REACH THE MOON?', W / 2, 760, 110, INK, 900, undefined, k);": f"fit({J(h[1])}, W / 2, 760, 110, INK, 900, undefined, k);",
 "txt('🌕 384,400 km', W / 2, 900, 84, LIME, 900, undefined, k);": f"fit({J(h[2])}, W / 2, 900, 84, LIME, 900, undefined, k);",
 "txt('no stops, no sleep', W / 2, 1010, 44, MUTED, 500, '\"JetBrains Mono\", monospace', easeOut(seg(t, .7, 1.1)));": f"fit({J(h[3])}, W / 2, 1010, 44, MUTED, 500, '\"JetBrains Mono\", monospace', easeOut(seg(t, .7, 1.1)));",
 "ctx.textAlign = 'left'; ctx.fillText('FAST', x0, y + 70); ctx.textAlign = 'right'; ctx.fillText('SLOW', x1, y + 70);": f"ctx.textAlign = 'left'; ctx.fillText({J(spec['bar'][0])}, x0, y + 70); ctx.textAlign = 'right'; ctx.fillText({J(spec['bar'][1])}, x1, y + 70);",
 "txt('Walking there takes', W / 2, 560, 70, INK, 800, undefined, k);": f"fit({J(p[0])}, W / 2, 560, 70, INK, 800, undefined, k);",
 "txt('8.8 YEARS.', W / 2, 680, 120, LIME, 900, undefined, k);": f"fit({J(p[1])}, W / 2, 680, 120, LIME, 900, undefined, k);",
 "txt('Light makes the trip in 1.28 seconds.', W / 2, 790, 46, MUTED, 600, undefined, k2);": f"fit({J(p[2])}, W / 2, 790, 46, MUTED, 600, undefined, k2);",
 "AJENT21 · SCALE #11": f"AJENT21 · {spec['tag']}",
 "'SCALE #11', 40, 70": f"{J(spec['tag'])}, 40, 70",
}
for k_, v in rep.items():
    assert k_ in s, k_
    s = s.replace(k_, v)
# event card texts also auto-fit
s = s.replace("txt(ev[0], 0, 0, 180, LIME, 900, undefined, k);", "fit(ev[0], 0, 0, 180, LIME, 900, undefined, k);")
s = s.replace("txt(ev[2], W / 2, 680, 64, INK, 800, undefined, k);", "fit(ev[2], W / 2, 680, 64, INK, 800, undefined, k);")
s = s.replace("txt(ev[3], W / 2, 750, 40, MUTED, 600, '\"JetBrains Mono\", monospace', k);", "fit(ev[3], W / 2, 750, 40, MUTED, 600, '\"JetBrains Mono\", monospace', k);")
s = s.replace("txt(ev[1], 0, 90, 64, LIME, 800, '\"JetBrains Mono\", monospace', k);", "fit(ev[1], 0, 90, 64, LIME, 800, '\"JetBrains Mono\", monospace', k);")
open(os.path.join(here, spec['id'] + '.html'), 'w').write(s)
dur = 2.4 + seg * n + 4.6
hits = [{"type": "boom", "at": 0.0}]
for i in range(n):
    at = round(2.4 + i * seg, 2)
    hits.append({"type": "shing" if i % 2 == 0 else "whoosh", "at": at, "gain": 0.6, **({"len": 0.7} if i % 2 else {})})
hits += [{"type": "riser", "at": round(2.4 + seg * n - 2.0, 2), "len": 2.0}, {"type": "impact", "at": round(2.4 + seg * n, 2), "len": 2.2, "gain": 1.1}, {"type": "sparkle", "at": round(2.6 + seg * n, 2)}]
mid = round(2.4 + seg * (n // 2), 2)
cue = {"duration": round(dur, 2), "bpm": 120, "key": spec.get('key', 'A'),
       "sections": [{"type": "tension", "start": 0, "end": 2.4}, {"type": "ambient", "start": 2.4, "end": mid},
                    {"type": "tension", "start": mid, "end": round(2.4 + seg * n, 2)}, {"type": "drop", "start": round(2.4 + seg * n, 2), "end": round(dur - 1.2, 2)},
                    {"type": "outro", "start": round(dur - 1.2, 2), "end": round(dur, 2)}], "hits": hits}
json.dump(cue, open(os.path.join(here, spec['id'] + '_cue.json'), 'w'), indent=1)
print('ok', spec['id'], round(dur, 1), 's')
