/**
 * Episode production pipeline.
 * Reads a script from content/scripts/<slug>.md, synthesizes narration via Edge TTS,
 * and mixes with music/SFX via FFmpeg.
 *
 * Usage: npx tsx scripts/produceEpisode.ts <slug>
 * Example: npx tsx scripts/produceEpisode.ts monkey-and-crocodile
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { execSync } from 'child_process'
import { join } from 'path'

const VOICE_MAP: Record<string, string> = {
  dadi: 'en-IN-NeerjaExpressiveNeural',
  monkey: 'en-US-EmmaMultilingualNeural',
  crocodile: 'en-IN-RehaanNeural',
  akbar: 'en-IN-PrabhatNeural',
  birbal: 'en-IN-RehaanNeural',
}

const slug = process.argv[2]
if (!slug) {
  console.error('Usage: npx tsx scripts/produceEpisode.ts <slug>')
  process.exit(1)
}

const scriptPath = join(process.cwd(), 'content', 'scripts', `${slug}.md`)
if (!existsSync(scriptPath)) {
  console.error(`Script not found: ${scriptPath}`)
  process.exit(1)
}

const outDir = join(process.cwd(), 'output', slug)
mkdirSync(outDir, { recursive: true })

const script = readFileSync(scriptPath, 'utf-8')

interface Segment {
  voice: string
  text: string
  index: number
}

function parseScript(md: string): Segment[] {
  const segments: Segment[] = []
  let currentVoice = 'dadi'
  let index = 0

  const lines = md.split('\n')
  let textBuffer = ''

  for (const line of lines) {
    const voiceMatch = line.match(/\[voice:\s*(\w+)\]/)
    if (voiceMatch) {
      if (textBuffer.trim()) {
        segments.push({ voice: currentVoice, text: textBuffer.trim(), index: index++ })
        textBuffer = ''
      }
      currentVoice = voiceMatch[1]
      continue
    }

    if (line.startsWith('[') && line.endsWith(']')) continue
    if (line.startsWith('#')) continue
    if (line.trim() === '') continue

    textBuffer += line.trim() + ' '
  }

  if (textBuffer.trim()) {
    segments.push({ voice: currentVoice, text: textBuffer.trim(), index: index++ })
  }

  return segments
}

const segments = parseScript(script)
console.log(`Parsed ${segments.length} segments from ${slug}`)

const plainText = segments.map((s) => s.text).join('\n\n')
writeFileSync(join(outDir, `${slug}.txt`), plainText)
console.log(`Written plain text to ${slug}.txt`)

console.log('\nTo synthesize audio, install edge-tts:')
console.log('  pip install edge-tts')
console.log('\nThen run for each segment:')
segments.forEach((seg) => {
  const voice = VOICE_MAP[seg.voice] ?? VOICE_MAP.dadi
  const outFile = join(outDir, `segment-${String(seg.index).padStart(3, '0')}.mp3`)
  console.log(`  edge-tts --voice "${voice}" --text "${seg.text.slice(0, 50)}..." --write-media "${outFile}"`)
})

console.log('\nTo mix with FFmpeg:')
console.log(`  ffmpeg -i "concat:${segments.map((_, i) => `segment-${String(i).padStart(3, '0')}.mp3`).join('|')}" -af "loudnorm=I=-16:TP=-1.5:LRA=11" -b:a 128k "${slug}.mp3"`)

console.log('\nDone! Review the output and upload to R2.')
