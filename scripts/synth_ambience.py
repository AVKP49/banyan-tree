#!/usr/bin/env python3
"""
Synthesize realistic ambient sound loops using numpy DSP.
Birds confirmed good. Improving all others.
"""
import numpy as np
import os
import subprocess
import wave

SAMPLE_RATE = 44100
DURATION = 15


def save_wav(filename, audio):
    audio = np.clip(audio, -1, 1)
    data = (audio * 32767).astype(np.int16)
    with wave.open(filename, 'w') as f:
        f.setnchannels(1)
        f.setsampwidth(2)
        f.setframerate(SAMPLE_RATE)
        f.writeframes(data.tobytes())


def to_mp3(wav_path, mp3_path):
    subprocess.run(['ffmpeg', '-y', '-i', wav_path, '-b:a', '128k', mp3_path], capture_output=True)
    os.remove(wav_path)


def gen_birds():
    """Bird chirps with FM synthesis - CONFIRMED GOOD."""
    n = SAMPLE_RATE * DURATION
    audio = np.zeros(n)

    noise = np.random.randn(n) * 0.02
    bed = np.cumsum(noise)
    bed = bed / (np.max(np.abs(bed)) + 1e-9) * 0.03
    audio += bed

    for _ in range(40):
        start = np.random.uniform(0, DURATION - 0.5)
        chirp_dur = np.random.uniform(0.08, 0.25)
        base_freq = np.random.uniform(2000, 5000)
        mod_freq = np.random.uniform(10, 30)
        mod_depth = np.random.uniform(200, 800)

        s = int(start * SAMPLE_RATE)
        e = min(s + int(chirp_dur * SAMPLE_RATE), n)
        ct = np.arange(e - s) / SAMPLE_RATE

        freq = base_freq + mod_depth * np.sin(2 * np.pi * mod_freq * ct)
        phase = np.cumsum(freq) / SAMPLE_RATE
        chirp = np.sin(2 * np.pi * phase)

        env_len = len(ct)
        attack = int(env_len * 0.1)
        decay = int(env_len * 0.3)
        env = np.ones(env_len)
        if attack > 0:
            env[:attack] = np.linspace(0, 1, attack)
        if decay > 0:
            env[-decay:] = np.linspace(1, 0, decay)

        vol = np.random.uniform(0.04, 0.10)
        chirp *= env * vol
        audio[s:e] += chirp

        if np.random.random() > 0.5:
            gap = int(np.random.uniform(0.1, 0.3) * SAMPLE_RATE)
            s2 = s + gap
            e2 = min(s2 + len(ct), n)
            if e2 > s2:
                audio[s2:e2] += chirp[:e2-s2] * 0.7

    return audio


def gen_river():
    """Flowing water using multiple layers of filtered noise with irregular modulation."""
    n = SAMPLE_RATE * DURATION
    t = np.linspace(0, DURATION, n)
    audio = np.zeros(n)

    # Layer 1: deep flow — very smooth brown noise
    white = np.random.randn(n)
    brown = np.cumsum(white)
    brown = brown - np.linspace(brown[0], brown[-1], n)  # detrend
    kernel = np.ones(400) / 400
    deep = np.convolve(brown, kernel, mode='same')
    deep = deep / (np.max(np.abs(deep)) + 1e-9) * 0.15
    audio += deep

    # Layer 2: mid-frequency ripples
    ripple_noise = np.random.randn(n)
    kernel2 = np.ones(50) / 50
    ripples = np.convolve(ripple_noise, kernel2, mode='same')
    # Irregular modulation
    mod = 0.3 + 0.7 * np.abs(np.sin(2 * np.pi * 0.2 * t) * np.sin(2 * np.pi * 0.07 * t + 0.5))
    audio += ripples * mod * 0.08

    # Layer 3: occasional splashy highlights
    for _ in range(25):
        pos = np.random.randint(0, n - 2000)
        length = np.random.randint(500, 2000)
        splash = np.random.randn(length) * 0.04
        kernel3 = np.ones(15) / 15
        splash = np.convolve(splash, kernel3, mode='same')
        decay = np.exp(-np.linspace(0, 4, length))
        audio[pos:pos+length] += splash * decay

    return audio


def gen_crickets():
    """Crickets using rapid on-off tonal bursts at high frequency."""
    n = SAMPLE_RATE * DURATION
    audio = np.zeros(n)

    # Multiple crickets at different positions, frequencies
    for _ in range(18):
        freq = np.random.uniform(3800, 5500)
        chirp_rate = np.random.uniform(12, 20)
        start = np.random.uniform(0, DURATION - 3)
        dur = np.random.uniform(1.0, 3.5)
        vol = np.random.uniform(0.03, 0.07)

        s = int(start * SAMPLE_RATE)
        e = min(s + int(dur * SAMPLE_RATE), n)
        ct = np.arange(e - s) / SAMPLE_RATE

        # Pure tone carrier
        carrier = np.sin(2 * np.pi * freq * ct)
        # Sharp on-off envelope at chirp rate
        pulse = (np.sin(2 * np.pi * chirp_rate * ct) > 0.3).astype(float)
        # Smooth the pulse edges slightly
        kernel = np.ones(30) / 30
        pulse = np.convolve(pulse, kernel, mode='same')

        # Overall fade in/out
        fade = min(int(0.15 * SAMPLE_RATE), len(ct) // 4)
        env = np.ones(len(ct))
        if fade > 0:
            env[:fade] = np.linspace(0, 1, fade)
            env[-fade:] = np.linspace(1, 0, fade)

        audio[s:e] += carrier * pulse * env * vol

    # Soft background hiss
    hiss = np.random.randn(n) * 0.008
    kernel_h = np.ones(10) / 10
    audio += np.convolve(hiss, kernel_h, mode='same')

    return audio


def gen_wind():
    """Wind using shaped noise with slow, breath-like volume swells."""
    n = SAMPLE_RATE * DURATION
    t = np.linspace(0, DURATION, n)

    # Multiple noise layers at different smoothness levels
    audio = np.zeros(n)

    # Layer 1: broad whoosh
    w1 = np.random.randn(n)
    k1 = np.hanning(600)
    k1 = k1 / k1.sum()
    layer1 = np.convolve(w1, k1, mode='same')
    # Slow breathing modulation
    breath1 = 0.3 + 0.7 * (0.5 + 0.5 * np.sin(2 * np.pi * 0.06 * t + np.random.uniform(0, 6)))
    breath2 = 0.5 + 0.5 * (0.5 + 0.5 * np.sin(2 * np.pi * 0.11 * t + np.random.uniform(0, 6)))
    audio += layer1 * breath1 * breath2 * 0.12

    # Layer 2: higher whistle
    w2 = np.random.randn(n)
    k2 = np.hanning(80)
    k2 = k2 / k2.sum()
    layer2 = np.convolve(w2, k2, mode='same')
    breath3 = 0.2 + 0.8 * (0.5 + 0.5 * np.sin(2 * np.pi * 0.04 * t + 2))
    audio += layer2 * breath3 * 0.04

    return audio


def gen_fire():
    """Crackling fire with random pops and warm undertone."""
    n = SAMPLE_RATE * DURATION
    audio = np.zeros(n)

    # Random crackle pops
    for _ in range(350):
        pos = np.random.randint(0, n - 800)
        pop_len = np.random.randint(20, 600)
        # Short burst of noise
        pop = np.random.randn(pop_len) * np.random.uniform(0.03, 0.12)
        # Exponential decay
        decay = np.exp(-np.linspace(0, np.random.uniform(3, 8), pop_len))
        audio[pos:pos+pop_len] += pop * decay

    # Warm low rumble underneath
    white = np.random.randn(n) * 0.015
    kernel = np.hanning(300)
    kernel = kernel / kernel.sum()
    rumble = np.convolve(white, kernel, mode='same')
    audio += rumble

    # Occasional louder pop
    for _ in range(15):
        pos = np.random.randint(0, n - 200)
        pop = np.random.randn(np.random.randint(30, 150)) * 0.15
        decay = np.exp(-np.linspace(0, 6, len(pop)))
        audio[pos:pos+len(pop)] += pop * decay

    return audio


def gen_night():
    """Night ambience: very soft bed with occasional lone cricket chirp."""
    n = SAMPLE_RATE * DURATION
    audio = np.zeros(n)

    # Super soft base
    white = np.random.randn(n)
    kernel = np.hanning(800)
    kernel = kernel / kernel.sum()
    base = np.convolve(white, kernel, mode='same') * 0.025
    audio += base

    # Sparse lone cricket chirps
    for _ in range(8):
        freq = np.random.uniform(4200, 5200)
        start = np.random.uniform(0, DURATION - 1)
        dur = np.random.uniform(0.3, 1.2)
        s = int(start * SAMPLE_RATE)
        e = min(s + int(dur * SAMPLE_RATE), n)
        ct = np.arange(e - s) / SAMPLE_RATE
        chirp = np.sin(2 * np.pi * freq * ct)
        pulse = (np.sin(2 * np.pi * 12 * ct) > 0.3).astype(float)
        fade = min(int(0.05 * SAMPLE_RATE), len(ct) // 4)
        env = np.ones(len(ct))
        if fade > 0:
            env[:fade] = np.linspace(0, 1, fade)
            env[-fade:] = np.linspace(1, 0, fade)
        audio[s:e] += chirp * pulse * env * 0.035

    return audio


def gen_court():
    """Court ambience: muffled murmur of distant voices."""
    n = SAMPLE_RATE * DURATION
    t = np.linspace(0, DURATION, n)
    audio = np.zeros(n)

    # Simulate distant crowd murmur using modulated filtered noise
    for _ in range(8):
        white = np.random.randn(n)
        # Bandpass around vocal frequencies
        kernel = np.hanning(np.random.randint(100, 250))
        kernel = kernel / kernel.sum()
        voice = np.convolve(white, kernel, mode='same')
        # Random slow volume modulation (like conversation ebb and flow)
        rate = np.random.uniform(0.3, 0.8)
        phase = np.random.uniform(0, 6.28)
        mod = 0.3 + 0.7 * (0.5 + 0.5 * np.sin(2 * np.pi * rate * t + phase))
        audio += voice * mod * np.random.uniform(0.008, 0.015)

    return audio


GENERATORS = {
    'birds': gen_birds,
    'river': gen_river,
    'crickets': gen_crickets,
    'wind': gen_wind,
    'fire': gen_fire,
    'court': gen_court,
    'night': gen_night,
}

ALIASES = {
    'flowing': 'river', 'water': 'river', 'splashing': 'river', 'lake': 'river',
    'cave': 'wind',
    'jungle': 'birds', 'forest': 'birds', 'morning': 'birds', 'village': 'birds',
    'evening': 'night',
    'crackling': 'fire',
    'murmur': 'court', 'crowd': 'court', 'fountain': 'court',
    'rain': 'wind', 'howl': 'wind',
    'dog': 'night', 'footsteps': 'night', 'bells': 'court',
}


def main():
    import shutil
    print("Generating ambient sounds...\n")

    for name, gen_fn in GENERATORS.items():
        print(f"  {name}...", end=' ', flush=True)
        audio = gen_fn()
        wav_path = f'content/sfx/gen/{name}.wav'
        mp3_path = f'content/sfx/gen/{name}.mp3'
        save_wav(wav_path, audio)
        to_mp3(wav_path, mp3_path)
        print("done")

    print("\nCopying to cache...")
    os.makedirs('content/sfx/cache', exist_ok=True)
    for name in GENERATORS:
        shutil.copy2(f'content/sfx/gen/{name}.mp3', f'content/sfx/cache/{name}.mp3')
    for alias, target in ALIASES.items():
        shutil.copy2(f'content/sfx/gen/{target}.mp3', f'content/sfx/cache/{alias}.mp3')

    print("\nDone! Test with:")
    print("  open content/sfx/gen/birds.mp3 content/sfx/gen/river.mp3 content/sfx/gen/crickets.mp3 content/sfx/gen/wind.mp3 content/sfx/gen/fire.mp3 content/sfx/gen/court.mp3 content/sfx/gen/night.mp3")


if __name__ == '__main__':
    main()
