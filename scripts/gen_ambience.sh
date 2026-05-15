#!/bin/bash
# Generate high-quality ambient sound loops using ffmpeg synthesis
cd ~/Desktop/banyan-tree
mkdir -p content/sfx/gen

echo "Generating ambient sounds..."

# Birds - layered sine chirps over pink noise
ffmpeg -y -f lavfi -i "sine=f=3200:d=0.15,volume=0.3" -af "afade=t=in:d=0.02,afade=t=out:st=0.1:d=0.05" /tmp/chirp1.wav 2>/dev/null
ffmpeg -y -f lavfi -i "sine=f=4500:d=0.12,volume=0.25" -af "afade=t=in:d=0.02,afade=t=out:st=0.08:d=0.04" /tmp/chirp2.wav 2>/dev/null
ffmpeg -y -f lavfi -i "sine=f=2800:d=0.18,volume=0.2" -af "afade=t=in:d=0.03,afade=t=out:st=0.12:d=0.06" /tmp/chirp3.wav 2>/dev/null
ffmpeg -y \
  -f lavfi -i "anoisesrc=a=0.03:c=pink:d=10" \
  -i /tmp/chirp1.wav -i /tmp/chirp2.wav -i /tmp/chirp3.wav \
  -filter_complex "\
    [0:a]highpass=f=1500,lowpass=f=6000[bg];\
    [1:a]adelay=500|500[c1];[1:a]adelay=2200|2200[c2];[1:a]adelay=4800|4800[c3];[1:a]adelay=7100|7100[c4];\
    [2:a]adelay=1200|1200[c5];[2:a]adelay=3500|3500[c6];[2:a]adelay=6300|6300[c7];[2:a]adelay=8900|8900[c8];\
    [3:a]adelay=800|800[c9];[3:a]adelay=3000|3000[c10];[3:a]adelay=5500|5500[c11];[3:a]adelay=9200|9200[c12];\
    [bg][c1][c2][c3][c4][c5][c6][c7][c8][c9][c10][c11][c12]amix=inputs=13:normalize=0,loudnorm=I=-20[out]" \
  -map "[out]" -t 10 -b:a 128k content/sfx/gen/birds.mp3 2>/dev/null
echo "  birds.mp3"

# River/water - shaped brown+pink noise
ffmpeg -y -f lavfi -i "anoisesrc=a=0.15:c=brown:d=10" \
  -af "lowpass=f=800,highpass=f=60,volume=1.5,loudnorm=I=-18" \
  -t 10 -b:a 128k content/sfx/gen/river.mp3 2>/dev/null
echo "  river.mp3"

# Crickets - high frequency modulated noise
ffmpeg -y -f lavfi -i "anoisesrc=a=0.08:c=white:d=10" \
  -af "bandpass=f=5000:w=2000,tremolo=f=15:d=0.7,volume=2,loudnorm=I=-20" \
  -t 10 -b:a 128k content/sfx/gen/crickets.mp3 2>/dev/null
echo "  crickets.mp3"

# Wind
ffmpeg -y -f lavfi -i "anoisesrc=a=0.12:c=pink:d=10" \
  -af "lowpass=f=500,highpass=f=40,tremolo=f=0.3:d=0.4,volume=1.5,loudnorm=I=-20" \
  -t 10 -b:a 128k content/sfx/gen/wind.mp3 2>/dev/null
echo "  wind.mp3"

# Jungle - layered nature
ffmpeg -y -f lavfi -i "anoisesrc=a=0.08:c=pink:d=10" \
  -af "lowpass=f=2000,highpass=f=100,volume=1.2,loudnorm=I=-20" \
  -t 10 -b:a 128k content/sfx/gen/jungle.mp3 2>/dev/null
echo "  jungle.mp3"

# Fire crackling
ffmpeg -y -f lavfi -i "anoisesrc=a=0.1:c=white:d=10" \
  -af "bandpass=f=2000:w=1500,tremolo=f=8:d=0.9,volume=2,loudnorm=I=-20" \
  -t 10 -b:a 128k content/sfx/gen/fire.mp3 2>/dev/null
echo "  fire.mp3"

# Court/room ambience
ffmpeg -y -f lavfi -i "anoisesrc=a=0.06:c=brown:d=10" \
  -af "lowpass=f=300,highpass=f=30,volume=1.5,loudnorm=I=-22" \
  -t 10 -b:a 128k content/sfx/gen/court.mp3 2>/dev/null
echo "  court.mp3"

# Night ambience
ffmpeg -y -f lavfi -i "anoisesrc=a=0.04:c=brown:d=10" \
  -af "lowpass=f=200,highpass=f=20,volume=1.5,loudnorm=I=-24" \
  -t 10 -b:a 128k content/sfx/gen/night.mp3 2>/dev/null
echo "  night.mp3"

# Water/splashing
ffmpeg -y -f lavfi -i "anoisesrc=a=0.12:c=pink:d=10" \
  -af "bandpass=f=1200:w=800,tremolo=f=2:d=0.5,volume=1.5,loudnorm=I=-20" \
  -t 10 -b:a 128k content/sfx/gen/water.mp3 2>/dev/null
echo "  water.mp3"

echo ""
echo "All ambient sounds generated!"
echo "Now copying to sfx cache..."

# Replace the freesound cache with these better versions
cp content/sfx/gen/birds.mp3 content/sfx/cache/birds.mp3
cp content/sfx/gen/river.mp3 content/sfx/cache/river.mp3
cp content/sfx/gen/river.mp3 content/sfx/cache/flowing.mp3
cp content/sfx/gen/water.mp3 content/sfx/cache/water.mp3
cp content/sfx/gen/water.mp3 content/sfx/cache/splashing.mp3
cp content/sfx/gen/crickets.mp3 content/sfx/cache/crickets.mp3
cp content/sfx/gen/wind.mp3 content/sfx/cache/wind.mp3
cp content/sfx/gen/jungle.mp3 content/sfx/cache/jungle.mp3
cp content/sfx/gen/fire.mp3 content/sfx/cache/fire.mp3
cp content/sfx/gen/fire.mp3 content/sfx/cache/crackling.mp3
cp content/sfx/gen/court.mp3 content/sfx/cache/court.mp3
cp content/sfx/gen/court.mp3 content/sfx/cache/murmur.mp3
cp content/sfx/gen/court.mp3 content/sfx/cache/footsteps.mp3
cp content/sfx/gen/night.mp3 content/sfx/cache/night.mp3
cp content/sfx/gen/night.mp3 content/sfx/cache/evening.mp3
cp content/sfx/gen/jungle.mp3 content/sfx/cache/village.mp3
cp content/sfx/gen/jungle.mp3 content/sfx/cache/morning.mp3
cp content/sfx/gen/wind.mp3 content/sfx/cache/rain.mp3
cp content/sfx/gen/wind.mp3 content/sfx/cache/howl.mp3
cp content/sfx/gen/jungle.mp3 content/sfx/cache/dog.mp3
cp content/sfx/gen/water.mp3 content/sfx/cache/cave.mp3

echo "Done! Now run: python3 scripts/download_sfx.py"
