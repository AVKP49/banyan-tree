#!/usr/bin/env python3
"""
Produce episode audio from scripts using Edge TTS.
Synthesizes each voice segment and concatenates into a final MP3.
"""

import asyncio
import os
import re
import sys
import struct

VOICE_MAP = {
    "dadi": "en-IN-NeerjaExpressiveNeural",
    "monkey": "en-US-EmmaMultilingualNeural",
    "crocodile": "en-IN-RehaanNeural",
    "akbar": "en-IN-PrabhatNeural",
    "birbal": "en-IN-RehaanNeural",
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

        if line.startswith("[") and line.endswith("]"):
            continue
        if line.startswith("#"):
            continue
        if not line.strip():
            continue

        text_buffer += line.strip() + " "

    if text_buffer.strip():
        segments.append({"voice": current_voice, "text": text_buffer.strip()})

    return segments


async def synthesize_segment(text, voice, output_path):
    import edge_tts
    communicate = edge_tts.Communicate(text, voice)
    await communicate.save(output_path)
    print(f"  -> {output_path} ({len(text)} chars)")


def concatenate_mp3s(file_list, output_path):
    """Simple MP3 concatenation by appending raw bytes."""
    with open(output_path, "wb") as out:
        for f in file_list:
            if os.path.exists(f):
                with open(f, "rb") as inp:
                    out.write(inp.read())
    print(f"\nFinal MP3: {output_path}")
    size_mb = os.path.getsize(output_path) / (1024 * 1024)
    print(f"Size: {size_mb:.1f} MB")


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
    for i, seg in enumerate(segments):
        voice = VOICE_MAP.get(seg["voice"], VOICE_MAP["dadi"])
        out_file = os.path.join(out_dir, f"segment-{i:03d}.mp3")
        segment_files.append(out_file)

        if os.path.exists(out_file) and os.path.getsize(out_file) > 0:
            print(f"  [cached] segment-{i:03d}.mp3")
            continue

        print(f"  Synthesizing segment {i}: voice={seg['voice']} ({voice}), {len(seg['text'])} chars")
        try:
            await synthesize_segment(seg["text"], voice, out_file)
        except Exception as e:
            print(f"  ERROR on segment {i}: {e}")
            # Write silence placeholder
            with open(out_file, "wb") as f:
                f.write(b"")

    # Concatenate all segments
    final_path = os.path.join(out_dir, f"{slug}.mp3")
    concatenate_mp3s(segment_files, final_path)

    # Also write plain text for LLM context
    plain_text = "\n\n".join(seg["text"] for seg in segments)
    txt_path = os.path.join(out_dir, f"{slug}.txt")
    with open(txt_path, "w") as f:
        f.write(plain_text)
    print(f"Plain text: {txt_path}")

    # Copy to public dir for local dev
    public_audio_dir = os.path.join("public", "audio")
    os.makedirs(public_audio_dir, exist_ok=True)
    import shutil
    shutil.copy2(final_path, os.path.join(public_audio_dir, f"{slug}.mp3"))
    print(f"Copied to public/audio/{slug}.mp3 for local dev")


async def main():
    slugs = sys.argv[1:] if len(sys.argv) > 1 else ["monkey-and-crocodile", "birbal-khichdi"]

    for slug in slugs:
        print(f"\n{'='*60}")
        print(f"Producing: {slug}")
        print(f"{'='*60}")
        await produce_episode(slug)

    print("\n✅ All episodes produced!")


if __name__ == "__main__":
    asyncio.run(main())
