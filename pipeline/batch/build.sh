#!/bin/bash
# usage: batch/build.sh batch/<file>.json [max]   — renders every spec whose mp4 is missing, commits and pushes each one
set -e
cd "$(dirname "$0")/.."
F=$1; MAX=${2:-99}; S=${TMPDIR:-/tmp}; done=0
for id in $(python3 -c "import json,sys;[print(s['id']) for s in json.load(open('$F'))]"); do
  out=../ajent21-$id.mp4
  [ -f "$out" ] && continue
  [ $done -ge $MAX ] && break
  python3 -c "import json;s=[x for x in json.load(open('$F')) if x['id']=='$id'][0];json.dump(s,open('$S/$id.json','w'))"
  python3 scripts/gen.py $S/$id.json
  rm -rf frames/$id && node scripts/render.js scripts/$id.html frames/$id 30 >/dev/null
  python3 -I scripts/sfx.py scripts/${id}_cue.json $S/$id.wav >/dev/null
  ffmpeg -loglevel error -y -framerate 30 -i frames/$id/f_%05d.jpg -i $S/$id.wav -c:v libx264 -preset medium -crf 20 -pix_fmt yuv420p -c:a aac -b:a 192k -shortest -movflags +faststart $out
  rm -rf frames/$id
  (cd .. && git add -A && git -c user.name="Claude" -c user.email="noreply@anthropic.com" commit -qm "Add $id short

Co-Authored-By: Claude Fable 5.2 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Hc2BmSX9HNdP12dAdhyfzd" && git push -q origin ajent21-media 2>&1 | grep -v "moved\|location" || true)
  echo "built $id"; done=$((done+1))
done
