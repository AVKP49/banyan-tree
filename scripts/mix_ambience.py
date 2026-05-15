#!/usr/bin/env python3
"""
Smart ambient mixer: reads [sfx:] and [music:] tags from episode scripts,
generates matching ambient audio per segment, mixes beneath narration.
"""

import os
import re
import subprocess
import sys

SFX_FILTERS = {
    'river': 'anoisesrc=a=0.025:c=pink,lowpass=f=400,highpass=f=80',
    'water': 'anoisesrc=a=0.025:c=pink,lowpass=f=400,highpass=f=80',
    'flowing': 'anoisesrc=a=0.02:c=pink,lowpass=f=350,highpass=f=60',
    'splashing': 'anoisesrc=a=0.03:c=white,bandpass=f=800:w=400',
    'jungle': 'anoisesrc=a=0.02:c=pink,lowpass=f=500,highpass=f=100',
    'forest': 'anoisesrc=a=0.018:c=pink,lowpass=f=450,highpass=f=80',
    'birds': 'anoisesrc=a=0.015:c=pink,lowpass=f=600,highpass=f=200',
    'evening': 'anoisesrc=a=0.012:c=pink,lowpass=f=300,highpass=f=60',
    'night': 'anoisesrc=a=0.01:c=brown,lowpass=f=200,highpass=f=40',
    'crickets': 'anoisesrc=a=0.008:c=white,bandpass=f=4000:w=1000',
    'wind': 'anoisesrc=a=0.015:c=pink,lowpass=f=350,highpass=f=50',
    'rain': 'anoisesrc=a=0.03:c=white,lowpass=f=2000,highpass=f=200',
    'monsoon': 'anoisesrc=a=0.035:c=white,lowpass=f=2500,highpass=f=300',
    'court': 'anoisesrc=a=0.008:c=brown,lowpass=f=180,highpass=f=40',
    'crowd': 'anoisesrc=a=0.01:c=pink,lowpass=f=250,highpass=f=60',
    'murmur': 'anoisesrc=a=0.008:c=pink,lowpass=f=200,highpass=f=50',
    'fire': 'anoisesrc=a=0.012:c=white,bandpass=f=1200:w=800',
    'crackling': 'anoisesrc=a=0.012:c=white,bandpass=f=1200:w=800',
    'marketplace': 'anoisesrc=a=0.015:c=pink,lowpass=f=400,highpass=f=80',
    'village': 'anoisesrc=a=0.01:c=pink,lowpass=f=300,highpass=f=60',
    'fountain': 'anoisesrc=a=0.015:c=white,bandpass=f=600:w=300',
    'footsteps': 'anoisesrc=a=0.005:c=brown,lowpass=f=150,highpass=f=30',
    'silence': None,
    'fade': None,
}

MUSIC_FILTERS = {
    'sitar': 'anoisesrc=a=0.006:c=pink,bandpass=f=300:w=100',
    'tanpura': 'anoisesrc=a=0.005:c=brown,bandpass=f=200:w=80',
    'tabla': 'anoisesrc=a=0.005:c=brown,lowpass=f=250,highpass=f=60',
    'gentle': 'anoisesrc=a=0.005:c=brown,lowpass=f=200,highpass=f=40',
    'warm': 'anoisesrc=a=0.005:c=brown,lowpass=f=250,highpass=f=50',
    'regal': 'anoisesrc=a=0.006:c=brown,lowpass=f=180,highpass=f=30',
    'tension': 'anoisesrc=a=0.008:c=brown,bandpass=f=150:w=60',
    'dramatic': 'anoisesrc=a=0.01:c=brown,bandpass=f=120:w=50',
    'joyful': 'anoisesrc=a=0.006:c=pink,lowpass=f=350,highpass=f=80',
    'reflection': 'anoisesrc=a=0.004:c=brown,lowpass=f=200,highpass=f=40',
    'bittersweet': 'anoisesrc=a=0.005:c=brown,bandpass=f=180:w=70',
    'resolution': 'anoisesrc=a=0.005:c=pink,lowpass=f=300,highpass=f=60',
    'friendship': 'anoisesrc=a=0.005:c=pink,lowpass=f=280,highpass=f=50',
    'storytelling': 'anoisesrc=a=0.005:c=brown,lowpass=f=220,highpass=f=40',
    'transition': 'anoisesrc=a=0.004:c=brown,lowpass=f=200,highpass=f=40',
    'lighter': 'anoisesrc=a=0.004:c=pink,lowpass=f=300,highpass=f=60',
    'realization': 'anoisesrc=a=0.006:c=pink,lowpass=f=250,highpass=f=50',
}


def match_filter(tag_text):
    """Find the best matching ambient filter for a tag like [sfx: evening birds, river flowing]."""
    tag_lower = tag_text.lower()
    filters = []

    all_maps = {**SFX_FILTERS, **MUSIC_FILTERS}
    for keyword, filt in all_maps.items():
        if keyword in tag_lower and filt:
            filters.append(filt)

    if not filters:
        return None
    return filters[0]


def parse_script_with_sfx(md_text):
    """Parse script into segments, tracking which SFX/music is active."""
    segments = []
    current_voice = 'dadi'
    current_ambient = None
    text_buffer = ''

    for line in md_text.split('\n'):
        voice_match = re.match(r'\[voice:\s*(\w+)\]', line)
        if voice_match:
            if text_buffer.strip():
                segments.append({
                    'voice': current_voice,
                    'text': text_buffer.strip(),
                    'ambient': current_ambient,
                })
                text_buffer = ''
            current_voice = voice_match[1]
            continue

        sfx_match = re.match(r'\[(sfx|music):\s*(.+?)\]', line)
        if sfx_match:
            if text_buffer.strip():
                segments.append({
                    'voice': current_voice,
                    'text': text_buffer.strip(),
                    'ambient': current_ambient,
                })
                text_buffer = ''
            new_filter = match_filter(sfx_match[2])
            if new_filter:
                current_ambient = new_filter
            continue

        if line.startswith('[') and line.endswith(']'):
            continue
        if line.startswith('#'):
            continue
        if not line.strip():
            continue

        text_buffer += line.strip() + ' '

    if text_buffer.strip():
        segments.append({
            'voice': current_voice,
            'text': text_buffer.strip(),
            'ambient': current_ambient,
        })

    return segments


def get_duration(filepath):
    result = subprocess.run(
        ['ffprobe', '-v', 'quiet', '-show_entries', 'format=duration',
         '-of', 'default=noprint_wrappers=1:nokey=1', filepath],
        capture_output=True, text=True
    )
    try:
        return float(result.stdout.strip())
    except:
        return 0


def mix_segment(segment_file, ambient_filter, output_file):
    """Mix a single narration segment with its ambient sound."""
    if not os.path.exists(segment_file) or os.path.getsize(segment_file) == 0:
        return False

    dur = get_duration(segment_file)
    if dur == 0:
        return False

    vol = '0.12'

    cmd = [
        'ffmpeg', '-y',
        '-i', segment_file,
        '-f', 'lavfi', '-t', str(dur),
        '-i', ambient_filter,
        '-filter_complex',
        f'[1:a]volume={vol},afade=t=in:d=1,afade=t=out:st={max(0, dur-1)}:d=1[amb];'
        f'[0:a][amb]amix=inputs=2:duration=first:dropout_transition=1[out]',
        '-map', '[out]',
        '-b:a', '128k',
        output_file
    ]

    result = subprocess.run(cmd, capture_output=True, text=True)
    return result.returncode == 0


def mix_episode(slug):
    script_path = os.path.join('content', 'scripts', f'{slug}.md')
    out_dir = os.path.join('output', slug)

    if not os.path.exists(script_path):
        print(f'  Script not found: {script_path}')
        return

    with open(script_path) as f:
        md_text = f.read()

    segments = parse_script_with_sfx(md_text)
    print(f'  {len(segments)} segments, mixing ambient sounds...')

    mixed_files = []
    for i, seg in enumerate(segments):
        seg_file = os.path.join(out_dir, f'segment-{i:03d}.mp3')
        if not os.path.exists(seg_file) or os.path.getsize(seg_file) == 0:
            mixed_files.append(seg_file)
            continue

        if seg['ambient']:
            mixed_file = os.path.join(out_dir, f'mixed-{i:03d}.mp3')
            ok = mix_segment(seg_file, seg['ambient'], mixed_file)
            if ok:
                mixed_files.append(mixed_file)
            else:
                mixed_files.append(seg_file)
        else:
            mixed_files.append(seg_file)

    # Concatenate all mixed segments
    valid = [f for f in mixed_files if os.path.exists(f) and os.path.getsize(f) > 0]
    list_file = os.path.join(out_dir, 'concat.txt')
    with open(list_file, 'w') as f:
        for v in valid:
            f.write(f"file '{os.path.abspath(v)}'\n")

    final = os.path.join('public', 'audio', f'{slug}.mp3')
    cmd = [
        'ffmpeg', '-y', '-f', 'concat', '-safe', '0',
        '-i', list_file,
        '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11',
        '-b:a', '128k', '-ar', '48000',
        final
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode == 0:
        size_mb = os.path.getsize(final) / (1024 * 1024)
        print(f'  -> {slug}.mp3 ({size_mb:.1f} MB)')
    else:
        print(f'  ERROR concatenating: {result.stderr[-200:]}')

    # Cleanup mixed files
    for f in mixed_files:
        if 'mixed-' in f and os.path.exists(f):
            os.remove(f)
    if os.path.exists(list_file):
        os.remove(list_file)


def main():
    slugs = sys.argv[1:] if len(sys.argv) > 1 else [
        'monkey-and-crocodile', 'birbal-khichdi',
        'blue-jackal', 'thirsty-crow',
        'tenali-rama-brinjals', 'cap-seller-monkeys',
        'lion-and-rabbit', 'golden-swan',
        'talking-cave', 'elephant-and-blind-men',
    ]

    print(f'Mixing ambient sounds into {len(slugs)} episodes...\n')
    for slug in slugs:
        print(f'\n  === {slug} ===')
        mix_episode(slug)

    print('\n  Done! Episodes now have scene-appropriate ambient sounds.')


if __name__ == '__main__':
    main()
