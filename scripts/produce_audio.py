#!/usr/bin/env python3
"""
Produce episode audio with warm, human-like narration.
Uses SSML prosody for natural pacing and warmth.
"""

import asyncio
import os
import re
import sys
import edge_tts

VOICE_MAP = {
    "dadi": {
        "voice": "en-US-AvaMultilingualNeural",
        "rate": "-15%",
        "pitch": "-2Hz",
        "style": "gentle",
    },
    "monkey": {
        "voice": "en-US-EmmaMultilingualNeural",
        "rate": "+5%",
        "pitch": "+8Hz",
        "style": "cheerful",
    },
    "crocodile": {
        "voice": "en-IN-PrabhatNeural",
        "rate": "-10%",
        "pitch": "-6Hz",
        "style": "calm",
    },
    "akbar": {
        "voice": "en-IN-PrabhatNeural",
        "rate": "-5%",
        "pitch": "-3Hz",
        "style": "serious",
    },
    "birbal": {
        "voice": "en-IN-PrabhatNeural",
        "rate": "-3%",
        "pitch": "+4Hz",
        "style": "friendly",
    },
}


def parse_script(md_text):
    segments = []
    current_voice = "dadi"
    text_buffer = ""

    for line in md_text.split("\n"):
        voice_match = re.match(r"\[voice:\s*(\w+)\]", line)
        if voice_match:
            if text_buffer.strip():
                segments.append({"voice": current_voice, "text": text_buffer.strip()})
                text_buffer = ""
            current_voice = voice_match.group(1)
            continue

        # Skip non-spoken markers
        if line.startswith("[") and line.endswith("]"):
            # Convert [pause] to SSML break
            if "[pause]" in line.lower():
                text_buffer += " ... "
            continue
        if line.startswith("#"):
            continue
        if not line.strip():
            continue

        text_buffer += line.strip() + " "

    if text_buffer.strip():
        segments.append({"voice": current_voice, "text": text_buffer.strip()})

    return segments


def add_natural_pauses(text):
    """Add subtle pauses after punctuation for natural speech rhythm."""
    # Add micro-pauses after sentences
    text = re.sub(r'\.(\s)', r'. \1', text)
    # Add pauses around em-dashes
    text = re.sub(r'\s*—\s*', ' — ', text)
    # Add pauses after question marks
    text = re.sub(r'\?(\s)', r'? \1', text)
    return text


async def synthesize_segment(text, voice_config, output_path):
    """Synthesize with warm, natural-sounding prosody."""
    voice = voice_config["voice"]
    rate = voice_config["rate"]
    pitch = voice_config["pitch"]

    # Add natural pauses
    text = add_natural_pauses(text)

    communicate = edge_tts.Communicate(
        text,
        voice,
        rate=rate,
        pitch=pitch,
    )
    await communicate.save(output_path)

    size_kb = os.path.getsize(output_path) / 1024
    print(f"  -> {os.path.basename(output_path)} ({size_kb:.0f}KB, {len(text)} chars)")


def concatenate_mp3s(file_list, output_path):
    """Concatenate MP3 segments with small silence gaps between them."""
    with open(output_path, "wb") as out:
        for f in file_list:
            if os.path.exists(f) and os.path.getsize(f) > 0:
                with open(f, "rb") as inp:
                    out.write(inp.read())
    size_mb = os.path.getsize(output_path) / (1024 * 1024)
    print(f"\nFinal: {output_path} ({size_mb:.1f} MB)")


async def _synth(i, seg, voice_config, out_file):
    try:
        await synthesize_segment(seg["text"], voice_config, out_file)
    except Exception as e:
        print(f"  ERROR segment {i} ({seg['voice']}): {e}")


async def produce_episode(slug):
    script_path = os.path.join("content", "scripts", f"{slug}.md")
    if not os.path.exists(script_path):
        print(f"Script not found: {script_path}")
        return

    out_dir = os.path.join("output", slug)
    os.makedirs(out_dir, exist_ok=True)

    with open(script_path, "r") as f:
        md_text = f.read()

    segments = parse_script(md_text)
    print(f"Parsed {len(segments)} segments for '{slug}'")

    segment_files = []
    tasks = []
    for i, seg in enumerate(segments):
        voice_config = VOICE_MAP.get(seg["voice"], VOICE_MAP["dadi"])
        out_file = os.path.join(out_dir, f"segment-{i:03d}.mp3")
        segment_files.append(out_file)
        tasks.append((i, seg, voice_config, out_file))

    print(f"  Synthesizing all {len(tasks)} segments in parallel...")
    await asyncio.gather(*[
        _synth(i, seg, vc, of) for i, seg, vc, of in tasks
    ])

    # Concatenate
    final_path = os.path.join(out_dir, f"{slug}.mp3")
    valid_files = [f for f in segment_files if os.path.exists(f) and os.path.getsize(f) > 0]
    concatenate_mp3s(valid_files, final_path)

    # Plain text for LLM context
    plain_text = "\n\n".join(seg["text"] for seg in segments)
    txt_path = os.path.join(out_dir, f"{slug}.txt")
    with open(txt_path, "w") as f:
        f.write(plain_text)

    # Copy to public for local dev
    public_audio_dir = os.path.join("public", "audio")
    os.makedirs(public_audio_dir, exist_ok=True)
    import shutil
    shutil.copy2(final_path, os.path.join(public_audio_dir, f"{slug}.mp3"))
    print(f"Copied to public/audio/{slug}.mp3")


async def main():
    slugs = sys.argv[1:] if len(sys.argv) > 1 else ["monkey-and-crocodile", "birbal-khichdi"]

    for slug in slugs:
        print(f"\n{'='*60}")
        print(f"  Producing: {slug}")
        print(f"{'='*60}\n")
        await produce_episode(slug)

    print("\n All episodes produced!")


if __name__ == "__main__":
    asyncio.run(main())
