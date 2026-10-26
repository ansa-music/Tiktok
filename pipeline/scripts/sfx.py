"""Procedural soundtrack + SFX library. No samples, no copyrighted audio.

usage: python3 -I sfx.py <cue_json> <out.wav>
cue json: {"duration": 17, "bpm": 140, "key": "A",
           "sections": [{"type": "ambient|tension|drop|outro", "start": 0, "end": 4.4}],
           "hits": [{"type": "shing|whoosh|impact|riser|boom|sparkle|swell", "at": 3.2, "len": 2.0}]}
"""
import json
import sys

import numpy as np
from scipy import signal

SR = 44100
rs = np.random.default_rng(7)
NOTE = {'C': -9, 'C#': -8, 'D': -7, 'D#': -6, 'E': -5, 'F': -4, 'F#': -3, 'G': -2, 'G#': -1, 'A': 0, 'A#': 1, 'B': 2}


def hz(semi, base=220.0):
    return base * 2 ** (semi / 12)


def t_(n):
    return np.arange(n) / SR


def env(n, a=0.01, r=0.2):
    e = np.ones(n)
    na, nr = int(a * SR), int(r * SR)
    if na: e[:na] = np.linspace(0, 1, na)
    if nr: e[-nr:] *= np.linspace(1, 0, nr)
    return e


def lp(x, fc, order=2):
    b, a = signal.butter(order, min(fc / (SR / 2), 0.99), 'low')
    return signal.lfilter(b, a, x)


def hp(x, fc, order=2):
    b, a = signal.butter(order, min(fc / (SR / 2), 0.99), 'high')
    return signal.lfilter(b, a, x)


def saw(f, n):
    return signal.sawtooth(2 * np.pi * f * t_(n))


# ---- instruments ----
def kick(n=int(0.45 * SR)):
    t = t_(n); f = 45 + 120 * np.exp(-t * 28)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 7) * 1.1


def snare(n=int(0.3 * SR)):
    t = t_(n)
    return (hp(rs.standard_normal(n), 1500) * 0.7 + np.sin(2 * np.pi * 190 * t) * 0.5) * np.exp(-t * 16)


def hat(n=int(0.06 * SR)):
    return hp(rs.standard_normal(n), 7000) * np.exp(-t_(n) * 60) * 0.35


def taiko(n=int(0.9 * SR)):
    t = t_(n); f = 70 + 60 * np.exp(-t * 18)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 4.5)
    return body * 1.2 + lp(rs.standard_normal(n), 400) * np.exp(-t * 25) * 0.6


def pad(freqs, n, bright=1800):
    x = sum(saw(f * d, n) for f in freqs for d in (0.997, 1.003))
    return lp(x, bright) / (len(freqs) * 2) * env(n, 0.8, 1.0)


def bell(f, n=int(1.6 * SR)):
    t = t_(n)
    return (np.sin(2 * np.pi * f * t) + 0.4 * np.sin(2 * np.pi * f * 2.76 * t) + 0.2 * np.sin(2 * np.pi * f * 5.4 * t)) * np.exp(-t * 3.2) * 0.3


# ---- sfx ----
def sfx_shing(L=1.4):
    n = int(L * SR); t = t_(n)
    ring = sum(np.sin(2 * np.pi * f * t) * a for f, a in ((2630, .5), (3950, .35), (5210, .25), (7400, .15)))
    return (ring * np.exp(-t * 3.5) + hp(rs.standard_normal(n), 4000) * np.exp(-t * 30) * 0.8) * 0.5


def sfx_whoosh(L=0.7):
    n = int(L * SR); x = rs.standard_normal(n); out = np.zeros(n); blk = 512
    for i in range(0, n, blk):
        k = i / n; fc = 300 + 5000 * np.sin(np.pi * k)
        out[i:i + blk] = lp(x[i:i + blk], fc)
    return out * np.sin(np.pi * np.linspace(0, 1, n)) ** 2 * 0.9


def sfx_impact(L=2.5):
    n = int(L * SR); t = t_(n); f = 30 + 90 * np.exp(-t * 6)
    sub = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 1.8)
    crack = hp(rs.standard_normal(n), 900) * np.exp(-t * 14)
    rumble = lp(rs.standard_normal(n), 150) * np.exp(-t * 1.5) * 1.5
    return (sub * 1.3 + crack * 0.8 + rumble) * 0.8


def sfx_riser(L=2.0):
    n = int(L * SR); t = t_(n); k = t / L
    x = rs.standard_normal(n); out = np.zeros(n); blk = 512
    for i in range(0, n, blk):
        out[i:i + blk] = lp(x[i:i + blk], 200 + 9000 * (i / n) ** 2)
    tone = saw(110 * 2 ** (k * 2), n) * 0.15
    return (out * 0.6 + lp(tone, 3000)) * k ** 1.5


def sfx_boom(L=1.6):
    n = int(L * SR); t = t_(n)
    return (np.sin(2 * np.pi * 38 * t) * np.exp(-t * 2.5) * 1.2 + lp(rs.standard_normal(n), 120) * np.exp(-t * 3)) * 0.8


def sfx_sparkle(L=1.5):
    n = int(L * SR); out = np.zeros(n)
    for i in range(14):
        s = int(rs.uniform(0, L * 0.7) * SR); b = bell(rs.choice([1760, 2093, 2349, 2637, 3136]), int(0.8 * SR)) * 0.35
        out[s:s + len(b)] += b[:max(0, n - s)]
    return out


def sfx_swell(L=2.0):
    n = int(L * SR)
    return pad([220, 277.2, 329.6, 440], n, 2500) * np.linspace(0, 1, n) ** 2 * 1.2


SFX = {'shing': sfx_shing, 'whoosh': sfx_whoosh, 'impact': sfx_impact, 'riser': sfx_riser,
       'boom': sfx_boom, 'sparkle': sfx_sparkle, 'swell': sfx_swell}


# Real recorded SFX (Mixkit free license, see assets/sfx/LICENSES.md) layered over the synthetic ones
SAMPLE_DIR = __import__('os').path.join(__import__('os').path.dirname(__file__), '..', 'assets', 'sfx')
LAYER = {'impact': ('impact-cine-big', 0.9), 'boom': ('stomp-apocalyptic', 0.7), 'whoosh': ('air-woosh-quick', 0.9),
         'shing': ('sweep-metal-quick', 0.8), 'sparkle': ('stardust-swish', 0.7), 'swell': ('light-aura', 0.6)}
_cache = {}


def load_sample(name):
    if name not in _cache:
        import subprocess
        raw = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', f'{SAMPLE_DIR}/{name}.mp3', '-f', 'f32le', '-ac', '1', '-ar', str(SR), '-'],
                             capture_output=True, check=True).stdout
        x = np.frombuffer(raw, dtype=np.float32).astype(np.float64)
        _cache[name] = x / max(1e-9, np.max(np.abs(x)))
    return _cache[name]


def place(buf, x, at, gain=1.0):
    s = int(at * SR)
    if s >= len(buf): return
    e = min(len(buf), s + len(x)); buf[s:e] += x[:e - s] * gain


def build(cue):
    D = cue['duration']; bpm = cue.get('bpm', 140); beat = 60 / bpm
    root = NOTE[cue.get('key', 'A')]
    # minor progression i - VI - III - VII
    prog = [[0, 3, 7], [-4, 0, 3], [3, 7, 10], [-2, 2, 5]]
    music = np.zeros(int((D + 3) * SR)); fx = np.zeros_like(music)
    for sec in cue['sections']:
        a, b, kind = sec['start'], sec['end'], sec['type']
        n = int((b - a) * SR)
        if kind in ('ambient', 'outro'):
            chord = prog[0] if kind == 'ambient' else prog[1]
            place(music, pad([hz(root + c) for c in chord] + [hz(root - 12)], n + int(SR), 1200), a, 0.5)
            wind = lp(rs.standard_normal(n), 500) * (0.5 + 0.5 * np.sin(np.linspace(0, 6, n)))
            place(fx, wind * env(n, 0.5, 0.5), a, 0.18)
            bt = a
            while bt < b - 0.5:
                place(music, bell(hz(root + 12 + int(rs.choice([0, 3, 7, 10, 12])))), bt, 0.5); bt += beat * 2
        elif kind == 'tension':
            place(music, pad([hz(root - 12), hz(root - 11)], n, 600), a, 0.6)   # dissonant cluster
            bt = a
            while bt < b:
                place(music, taiko(), bt, 0.8); bt += beat * 2
            place(fx, sfx_boom(), a, 0.9)
        elif kind == 'drop':
            bars = int(np.ceil((b - a) / (beat * 4)))
            for i in range(bars):
                bar0 = a + i * beat * 4; ch = prog[i % 4]
                place(music, pad([hz(root + c) for c in ch], int(beat * 4 * SR) + int(0.3 * SR), 2600), bar0, 0.55)
                bass = lp(saw(hz(root + ch[0] - 24), int(beat * 4 * SR)), 400) * env(int(beat * 4 * SR), .01, .1)
                place(music, bass, bar0, 0.5)
                for j in range(8):
                    st = bar0 + j * beat / 2
                    if st >= b: break
                    if j % 4 == 0: place(music, kick(), st, 0.9)
                    if j % 4 == 2: place(music, snare(), st, 0.6)
                    place(music, hat(), st, 0.5)
                place(music, taiko(), bar0, 0.6)
    use_samples = cue.get('samples', True)
    for h in cue.get('hits', []):
        if h['type'] == 'file':
            place(fx, load_sample(h['file']), h['at'], h.get('gain', 1.0)); continue
        x = SFX[h['type']](h['len']) if 'len' in h else SFX[h['type']]()
        place(fx, x, h['at'], h.get('gain', 1.0) * (0.6 if use_samples and h['type'] in LAYER else 1.0))
        if use_samples and h['type'] in LAYER:
            name, g = LAYER[h['type']]
            place(fx, load_sample(name), h['at'], g * h.get('gain', 1.0))
    mix = music * 0.8 + fx
    mix = mix[:int(D * SR)]
    mix *= env(len(mix), 0.01, 0.25)
    # gentle limiter
    mix = np.tanh(mix * 1.4) / np.tanh(1.4)
    mix /= max(1e-9, np.max(np.abs(mix))) / 0.92
    # stereo widen with tiny delay on fx/pad
    left = mix; right = np.concatenate([np.zeros(220), mix[:-220]]) * 0.95 + mix * 0.05
    return np.stack([left, right], 1)


if __name__ == '__main__':
    from scipy.io import wavfile
    cue = json.load(open(sys.argv[1]))
    out = build(cue)
    wavfile.write(sys.argv[2], SR, (out * 32767).astype(np.int16))
    print('wrote', sys.argv[2], out.shape[0] / SR, 's')
