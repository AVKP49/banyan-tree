const AMBIENCE_MAP: Record<string, { freq: number; vol: number }> = {
  'monkey-and-crocodile': { freq: 300, vol: 0.018 },
  'birbal-khichdi': { freq: 180, vol: 0.012 },
  'blue-jackal': { freq: 250, vol: 0.015 },
  'thirsty-crow': { freq: 350, vol: 0.010 },
  'tenali-rama-brinjals': { freq: 200, vol: 0.012 },
  'cap-seller-monkeys': { freq: 280, vol: 0.015 },
  'lion-and-rabbit': { freq: 260, vol: 0.015 },
  'golden-swan': { freq: 300, vol: 0.016 },
  'talking-cave': { freq: 150, vol: 0.018 },
  'elephant-and-blind-men': { freq: 220, vol: 0.012 },
}

let audioCtx: AudioContext | null = null
let source: AudioBufferSourceNode | null = null
let filter: BiquadFilterNode | null = null
let gain: GainNode | null = null
let isPlaying = false

export function playAmbience(slug: string) {
  if (isPlaying) return
  const config = AMBIENCE_MAP[slug]
  if (!config) return

  if (!audioCtx) audioCtx = new AudioContext()
  const ctx = audioCtx
  if (ctx.state === 'suspended') ctx.resume()

  const len = ctx.sampleRate * 4
  const buf = ctx.createBuffer(2, len, ctx.sampleRate)
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch)
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1
  }

  source = ctx.createBufferSource()
  source.buffer = buf
  source.loop = true

  filter = ctx.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = config.freq
  filter.Q.value = 0.7

  gain = ctx.createGain()
  gain.gain.setValueAtTime(0, ctx.currentTime)
  gain.gain.linearRampToValueAtTime(config.vol, ctx.currentTime + 3)

  source.connect(filter).connect(gain).connect(ctx.destination)
  source.start()
  isPlaying = true
}

export function pauseAmbience() {
  if (!isPlaying || !audioCtx || !gain || !source) return

  gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 1.5)

  setTimeout(() => {
    try {
      source?.stop()
      source?.disconnect()
      filter?.disconnect()
      gain?.disconnect()
    } catch {}
    source = null
    filter = null
    gain = null
    isPlaying = false
  }, 1600)
}
