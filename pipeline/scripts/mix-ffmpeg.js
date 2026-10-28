// usage: node mix-ffmpeg.js <cue.json> <out.wav>
// numpy-free fallback for sfx.py: a synthesized pad + pulse in ffmpeg, Mixkit samples placed at cue times.
// cue: {"duration": 28, "pad": [hz...], "pulse": {"start": 10.6, "end": 19.6, "bpm": 110, "hz": 55},
//       "hits": [{"file": "impact-cine-big", "at": 0, "gain": 0.8}]}
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const [cueFile, out] = process.argv.slice(2);
const cue = JSON.parse(fs.readFileSync(cueFile, 'utf8'));
const D = cue.duration, SFX = path.join(__dirname, '..', 'assets', 'sfx');
const args = ['-y', '-loglevel', 'error'];
const chains = [], labels = [];

// pad: detuned sines with a slow swell, darker in quiet sections
const pad = cue.pad.map(f => `sin(2*PI*${f}*t)+sin(2*PI*${(f * 1.004).toFixed(3)}*t)`).join('+');
args.push('-f', 'lavfi', '-i', `aevalsrc='(${pad})/${cue.pad.length * 2}*(0.7+0.3*sin(2*PI*t/7))':s=44100:d=${D}`);
chains.push(`[0]lowpass=f=900,volume=0.35[pad]`); labels.push('[pad]');

// pulse: a low taiko-like thump on every other beat
if (cue.pulse) {
  const { start, end, bpm, hz } = cue.pulse, p = (120 / bpm).toFixed(4);
  args.push('-f', 'lavfi', '-i', `aevalsrc='if(between(t,${start},${end}),sin(2*PI*${hz}*mod(t-${start},${p})*(1+2*exp(-30*mod(t-${start},${p}))))*exp(-7*mod(t-${start},${p})),0)':s=44100:d=${D}`);
  chains.push(`[1]lowpass=f=300,volume=0.9[pulse]`); labels.push('[pulse]');
}
cue.hits.forEach((h, i) => {
  const n = args.filter(a => a === '-i').length;
  args.push('-i', path.join(SFX, `${h.file}.mp3`));
  const ms = Math.round(h.at * 1000);
  chains.push(`[${n}]aformat=sample_rates=44100:channel_layouts=stereo,adelay=${ms}|${ms},volume=${h.gain ?? 1}[h${i}]`); labels.push(`[h${i}]`);
});
const graph = chains.join(';') + `;${labels.join('')}amix=inputs=${labels.length}:normalize=0,atrim=0:${D},alimiter=limit=0.9,aformat=channel_layouts=stereo[a]`;
args.push('-filter_complex', graph, '-map', '[a]', '-ar', '44100', out);
execFileSync('ffmpeg', args, { stdio: 'inherit' });
console.log('wrote', out);
