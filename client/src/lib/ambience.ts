const AMBIENCE_MAP: Record<string, AmbienceConfig> = {
  'monkey-and-crocodile': { layers: ['river', 'birds', 'jungle-hum'] },
  'birbal-khichdi': { layers: ['wind-gentle', 'court-hum'] },
  'blue-jackal': { layers: ['crickets', 'jungle-hum', 'wind-gentle'] },
  'thirsty-crow': { layers: ['wind-hot', 'insects'] },
  'tenali-rama-brinjals': { layers: ['birds', 'court-hum'] },
  'cap-seller-monkeys': { layers: ['birds', 'jungle-hum', 'insects'] },
  'lion-and-rabbit': { layers: ['jungle-hum', 'wind-gentle', 'birds'] },
  'golden-swan': { layers: ['river', 'birds', 'wind-gentle'] },
  'talking-cave': { layers: ['wind-cave', 'crickets'] },
  'elephant-and-blind-men': { layers: ['birds', 'village-hum', 'wind-gentle'] },
}

interface AmbienceConfig {
  layers: string[]
}

let audioCtx: AudioContext | null = null
let activeNodes: AudioNode[] = []
let isPlaying = false
let masterGain: GainNode | null = null

function ctx(): AudioContext {
  if (!audioCtx) audioCtx = new AudioContext()
  return audioCtx
}

function createNoiseBuffer(seconds: number): AudioBuffer {
  const c = ctx()
  const len = c.sampleRate * seconds
  const buf = c.createBuffer(2, len, c.sampleRate)
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch)
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1
  }
  return buf
}

function addNoise(dest: AudioNode, freq: number, q: number, vol: number, type: BiquadFilterType = 'lowpass') {
  const c = ctx()
  const src = c.createBufferSource()
  src.buffer = createNoiseBuffer(4)
  src.loop = true
  const filter = c.createBiquadFilter()
  filter.type = type
  filter.frequency.value = freq
  filter.Q.value = q
  const gain = c.createGain()
  gain.gain.value = vol
  src.connect(filter).connect(gain).connect(dest)
  src.start()
  activeNodes.push(src, filter, gain)
}

function addBirds(dest: AudioNode) {
  const c = ctx()
  const now = c.currentTime

  function chirp(startTime: number, baseFreq: number) {
    const osc = c.createOscillator()
    osc.type = 'sine'
    const gain = c.createGain()
    gain.gain.setValueAtTime(0, startTime)
    gain.gain.linearRampToValueAtTime(0.008, startTime + 0.05)
    gain.gain.linearRampToValueAtTime(0.012, startTime + 0.1)
    gain.gain.linearRampToValueAtTime(0, startTime + 0.2)
    osc.frequency.setValueAtTime(baseFreq, startTime)
    osc.frequency.linearRampToValueAtTime(baseFreq * 1.3, startTime + 0.1)
    osc.frequency.linearRampToValueAtTime(baseFreq * 0.9, startTime + 0.2)
    osc.connect(gain).connect(dest)
    osc.start(startTime)
    osc.stop(startTime + 0.25)
    activeNodes.push(osc, gain)
  }

  for (let i = 0; i < 200; i++) {
    const t = now + Math.random() * 120
    const freq = 2000 + Math.random() * 3000
    chirp(t, freq)
    if (Math.random() > 0.5) chirp(t + 0.25, freq * 1.1)
    if (Math.random() > 0.7) chirp(t + 0.5, freq * 0.95)
  }
}

function addCrickets(dest: AudioNode) {
  const c = ctx()
  const now = c.currentTime

  for (let i = 0; i < 80; i++) {
    const t = now + Math.random() * 120
    const dur = 0.5 + Math.random() * 1.5
    const osc = c.createOscillator()
    osc.type = 'square'
    osc.frequency.value = 4000 + Math.random() * 2000
    const gain = c.createGain()
    gain.gain.setValueAtTime(0, t)
    gain.gain.linearRampToValueAtTime(0.003, t + 0.05)
    gain.gain.setValueAtTime(0.003, t + dur - 0.05)
    gain.gain.linearRampToValueAtTime(0, t + dur)
    osc.connect(gain).connect(dest)
    osc.start(t)
    osc.stop(t + dur)
    activeNodes.push(osc, gain)
  }
}

function addInsects(dest: AudioNode) {
  const c = ctx()
  const now = c.currentTime

  for (let i = 0; i < 40; i++) {
    const t = now + Math.random() * 120
    const dur = 1 + Math.random() * 3
    const osc = c.createOscillator()
    osc.type = 'sine'
    osc.frequency.value = 300 + Math.random() * 200
    const gain = c.createGain()
    gain.gain.setValueAtTime(0, t)
    gain.gain.linearRampToValueAtTime(0.004, t + 0.2)
    gain.gain.setValueAtTime(0.004, t + dur - 0.2)
    gain.gain.linearRampToValueAtTime(0, t + dur)
    osc.connect(gain).connect(dest)
    osc.start(t)
    osc.stop(t + dur)
    activeNodes.push(osc, gain)
  }
}

function buildLayer(name: string, dest: AudioNode) {
  switch (name) {
    case 'river':
      addNoise(dest, 350, 1.5, 0.025, 'lowpass')
      addNoise(dest, 800, 0.5, 0.008, 'bandpass')
      break
    case 'birds':
      addBirds(dest)
      break
    case 'crickets':
      addCrickets(dest)
      break
    case 'insects':
      addInsects(dest)
      break
    case 'jungle-hum':
      addNoise(dest, 250, 0.8, 0.015, 'lowpass')
      break
    case 'wind-gentle':
      addNoise(dest, 400, 0.3, 0.012, 'lowpass')
      break
    case 'wind-hot':
      addNoise(dest, 600, 0.5, 0.01, 'highpass')
      break
    case 'wind-cave':
      addNoise(dest, 180, 3, 0.02, 'bandpass')
      break
    case 'court-hum':
      addNoise(dest, 150, 0.5, 0.008, 'lowpass')
      break
    case 'village-hum':
      addNoise(dest, 200, 0.5, 0.01, 'lowpass')
      break
  }
}

export function playAmbience(slug: string) {
  if (isPlaying) return
  const config = AMBIENCE_MAP[slug]
  if (!config) return

  const c = ctx()
  if (c.state === 'suspended') c.resume()

  masterGain = c.createGain()
  masterGain.gain.setValueAtTime(0, c.currentTime)
  masterGain.gain.linearRampToValueAtTime(1, c.currentTime + 3)
  masterGain.connect(c.destination)
  activeNodes.push(masterGain)

  for (const layer of config.layers) {
    buildLayer(layer, masterGain)
  }

  isPlaying = true
}

export function pauseAmbience() {
  if (!isPlaying || !audioCtx) return

  const c = audioCtx
  if (masterGain) {
    masterGain.gain.linearRampToValueAtTime(0, c.currentTime + 1.5)
  }

  setTimeout(() => {
    for (const node of activeNodes) {
      try {
        node.disconnect()
        if ('stop' in node && typeof (node as AudioBufferSourceNode).stop === 'function') {
          (node as AudioBufferSourceNode).stop()
        }
      } catch {}
    }
    activeNodes = []
    masterGain = null
    isPlaying = false
  }, 1600)
}
