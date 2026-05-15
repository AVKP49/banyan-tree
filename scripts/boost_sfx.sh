#!/bin/bash
cd ~/Desktop/banyan-tree
for f in content/sfx/cache/*.mp3; do
  ffmpeg -y -i "$f" -af "volume=8,loudnorm=I=-14" "${f}.tmp.mp3"
  mv "${f}.tmp.mp3" "$f"
  echo "Boosted: $f"
done
echo "All SFX boosted!"
