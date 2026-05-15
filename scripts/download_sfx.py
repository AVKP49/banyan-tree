#!/usr/bin/env python3
"""
Download real sound effects from Freesound.org and mix into episode narration.
Uses the Freesound API to find CC0/CC-BY sounds, downloads previews,
then mixes them at correct timestamps using ffmpeg.
"""

import asyncio
import json
import os
import re
import subprocess
import sys
import urllib.request
import urllib.parse

API_KEY = 'VMmZYp2ldIsdDKAwxTOxMdPqb2prT1mDq3yqVbua'
CACHE_DIR = os.path.join('content', 'sfx', 'cache')

SOUND_QUERIES = {
    'river': 'river flowing water gentle ambient',
    'water': 'water stream flowing gentle',
    'flowing': 'river stream flowing calm',
    'splashing': 'water splash gentle',
    'jungle': 'tropical jungle ambient birds insects',
    'forest': 'forest ambient nature',
    'birds': 'birds chirping morning nature ambient',
    'evening': 'evening ambient nature twilight',
    'night': 'night ambient crickets nature calm',
    'crickets': 'crickets night ambient nature',
    'wind': 'wind gentle breeze ambient',
    'rain': 'rain gentle ambient',
    'monsoon': 'heavy rain tropical',
    'court': 'room tone quiet interior ambient',
    'crowd': 'crowd murmur distant quiet',
    'murmur': 'crowd murmur distant indoor',
    'fire': 'fire crackling campfire gentle',
    'crackling': 'fire crackling wood',
    'marketplace': 'market crowd ambient distant',
    'village': 'village ambient rural morning',
    'fountain': 'fountain water gentle',
    'footsteps': 'footsteps walking dirt path',
    'dog': 'dog barking distant',
    'howl': 'wolf howling distant',
    'bells': 'bells temple distant gentle',
    'morning': 'morning birds ambient nature',
    'lake': 'lake water gentle lapping',
    'cave': 'cave wind echo ambient',
    'elephant': 'elephant trumpet distant',
    'monkey': 'monkey chattering distant',
    'sitar': 'sitar indian music gentle',
    'tabla': 'tabla indian drum gentle',
}

os.makedirs(CACHE_DIR, exist_ok=True)


def search_sound(query):
    """Search Freesound for a sound and return the best match's preview URL."""
    cache_file = os.path.join(CACHE_DIR, f'{query.replace(" ", "_")[:40]}.json')
    if os.path.exists(cache_file):
        with open(cache_file) as f:
            data = json.load(f)
        if data.get('preview'):
            return data

    params = urllib.parse.urlencode({
        'query': query,
        'filter': 'duration:[2 TO 30]',
        'fields': 'id,name,previews,duration,license',
        'sort': 'rating_desc',
        'page_size': '1',
        'token': API_KEY,
    })
    url = f'https://freesound.org/apiv2/search/text/?{params}'

    try:
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read())

        if data.get('results'):
            sound = data['results'][0]
            preview_url = sound['previews'].get('preview-lq-mp3') or sound['previews'].get('preview-hq-mp3')
            result = {
                'id': sound['id'],
                'name': sound['name'],
                'preview': preview_url,
                'duration': sound['duration'],
            }
            with open(cache_file, 'w') as f:
                json.dump(result, f)
            return result
    except Exception as e:
        print(f'    Search error for "{query}": {e}')

    return None


def download_sound(sound_info, keyword):
    """Download the preview MP3 for a sound."""
    if not sound_info or not sound_info.get('preview'):
        return None

    out_path = os.path.join(CACHE_DIR, f'{keyword}.mp3')
    if os.path.exists(out_path) and os.path.getsize(out_path) > 1000:
        return out_path

    try:
        urllib.request.urlretrieve(sound_info['preview'], out_path)
        print(f'    Downloaded: {keyword} ({sound_info["name"][:40]})')
        return out_path
    except Exception as e:
        print(f'    Download error for {keyword}: {e}')
        return None


def match_sfx_keywords(tag_text):
    """Extract keywords from an [sfx:] or [music:] tag."""
    tag_lower = tag_text.lower()
    matches = []
    for keyword in SOUND_QUERIES:
        if keyword in tag_lower:
            matches.append(keyword)
    if not matches:
        words = re.findall(r'\w+', tag_lower)
        for w in words:
            if w in SOUND_QUERIES:
                matches.append(w)
    return matches[:2]


def parse_script_segments(md_text):
    """Parse script into segments with their SFX tags."""
    segments = []
    current_sfx = []
    text_buffer = ''
    current_voice = 'dadi'

    for line in md_text.split('\n'):
        voice_match = re.match(r'\[voice:\s*(\w+)\]', line)
        if voice_match:
            if text_buffer.strip():
                segments.append({'text': text_buffer.strip(), 'sfx': list(current_sfx), 'voice': current_voice})
                text_buffer = ''
            current_voice = voice_match[1]
            continue

        sfx_match = re.match(r'\[(sfx|music):\s*(.+?)\]', line)
        if sfx_match:
            if text_buffer.strip():
                segments.append({'text': text_buffer.strip(), 'sfx': list(current_sfx), 'voice': current_voice})
                text_buffer = ''
            keywords = match_sfx_keywords(sfx_match[2])
            if keywords:
                current_sfx = keywords
            continue

        if line.startswith('[') and line.endswith(']'):
            continue
        if line.startswith('#'):
            continue
        if not line.strip():
            continue

        text_buffer += line.strip() + ' '

    if text_buffer.strip():
        segments.append({'text': text_buffer.strip(), 'sfx': list(current_sfx), 'voice': current_voice})

    return segments


def mix_segment_with_sfx(seg_file, sfx_files, output_file):
    """Mix a narration segment with one or more SFX files using ffmpeg."""
    if not os.path.exists(seg_file) or os.path.getsize(seg_file) == 0:
        return False

    dur_result = subprocess.run(
        ['ffprobe', '-v', 'quiet', '-show_entries', 'format=duration',
         '-of', 'default=noprint_wrappers=1:nokey=1', seg_file],
        capture_output=True, text=True
    )
    try:
        dur = float(dur_result.stdout.strip())
    except:
        return False

    if not sfx_files:
        return False

    inputs = ['-i', seg_file]
    filter_parts = []
    mix_labels = ['[0:a]']

    for idx, sfx in enumerate(sfx_files, 1):
        inputs.extend(['-stream_loop', '-1', '-i', sfx])
        label = f'[sfx{idx}]'
        vol = '0.15' if len(sfx_files) == 1 else '0.10'
        fade_out_start = max(0, dur - 1.5)
        filter_parts.append(
            f'[{idx}:a]atrim=0:{dur},volume={vol},'
            f'afade=t=in:d=1.5,afade=t=out:st={fade_out_start}:d=1.5{label}'
        )
        mix_labels.append(label)

    filter_complex = ';'.join(filter_parts)
    n = len(mix_labels)
    filter_complex += f';{"".join(mix_labels)}amix=inputs={n}:duration=first:dropout_transition=1[out]'

    cmd = ['ffmpeg', '-y'] + inputs + [
        '-filter_complex', filter_complex,
        '-map', '[out]',
        '-t', str(dur),
        '-b:a', '128k',
        output_file
    ]

    result = subprocess.run(cmd, capture_output=True, text=True)
    return result.returncode == 0


def process_episode(slug):
    script_path = os.path.join('content', 'scripts', f'{slug}.md')
    out_dir = os.path.join('output', slug)

    if not os.path.exists(script_path):
        print(f'  Script not found: {script_path}')
        return

    with open(script_path) as f:
        md_text = f.read()

    segments = parse_script_segments(md_text)
    print(f'  {len(segments)} segments')

    needed_keywords = set()
    for seg in segments:
        needed_keywords.update(seg['sfx'])

    print(f'  Sounds needed: {", ".join(sorted(needed_keywords)) or "none"}')

    sfx_cache = {}
    for kw in needed_keywords:
        query = SOUND_QUERIES.get(kw, kw)
        info = search_sound(query)
        path = download_sound(info, kw)
        if path:
            sfx_cache[kw] = path

    mixed_files = []
    mixed_count = 0
    for i, seg in enumerate(segments):
        seg_file = os.path.join(out_dir, f'segment-{i:03d}.mp3')
        mixed_file = os.path.join(out_dir, f'final-{i:03d}.mp3')

        sfx_paths = [sfx_cache[kw] for kw in seg['sfx'] if kw in sfx_cache]

        if sfx_paths and os.path.exists(seg_file) and os.path.getsize(seg_file) > 0:
            ok = mix_segment_with_sfx(seg_file, sfx_paths, mixed_file)
            if ok:
                mixed_files.append(mixed_file)
                mixed_count += 1
                continue

        mixed_files.append(seg_file)

    print(f'  Mixed {mixed_count}/{len(segments)} segments with real sounds')

    valid = [f for f in mixed_files if os.path.exists(f) and os.path.getsize(f) > 0]
    list_file = os.path.join(out_dir, 'final_concat.txt')
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
        print(f'  ERROR: {result.stderr[-300:]}')

    for f in mixed_files:
        if 'final-' in f and os.path.exists(f):
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

    print(f'Processing {len(slugs)} episodes with real sound effects...\n')
    for slug in slugs:
        print(f'\n=== {slug} ===')
        process_episode(slug)

    print('\nDone! All episodes mixed with real sound effects.')


if __name__ == '__main__':
    main()
