#!/bin/bash
# Restore clean narration-only audio for all episodes
cd ~/Desktop/banyan-tree

for slug in monkey-and-crocodile birbal-khichdi blue-jackal thirsty-crow tenali-rama-brinjals cap-seller-monkeys lion-and-rabbit golden-swan talking-cave elephant-and-blind-men; do
  src="output/${slug}/${slug}.mp3"
  dst="public/audio/${slug}.mp3"
  if [ -f "$src" ]; then
    cp "$src" "$dst"
    echo "Restored: $slug"
  fi
done

echo "All episodes restored to clean narration."
