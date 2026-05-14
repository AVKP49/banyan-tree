import type { TTSProvider } from './index'

const TRUSTED_CLIENT_TOKEN = '6A5AA1D4EAFF4E9FB37E23D68491D6F4'
const WSS_URL = `wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1?TrustedClientToken=${TRUSTED_CLIENT_TOKEN}`
const OUTPUT_FORMAT = 'audio-24khz-48kbitrate-mono-mp3'

export const DADI_VOICE = 'en-IN-NeerjaExpressiveNeural'

export class EdgeTTSProvider implements TTSProvider {
  async synthesize(text: string, voice: string = DADI_VOICE): Promise<ArrayBuffer> {
    const connectionId = crypto.randomUUID().replace(/-/g, '')
    const requestId = crypto.randomUUID().replace(/-/g, '')

    const wsUrl = `${WSS_URL}&ConnectionId=${connectionId}`

    const resp = await fetch(wsUrl, {
      headers: { Upgrade: 'websocket' },
    })

    const ws = (resp as unknown as { webSocket: WebSocket }).webSocket
    if (!ws) {
      throw new Error('Failed to establish WebSocket connection to Edge TTS')
    }

    ws.accept()

    return new Promise<ArrayBuffer>((resolve, reject) => {
      const audioChunks: ArrayBuffer[] = []
      let resolved = false

      const configMessage =
        `Content-Type:application/json; charset=utf-8\r\n` +
        `Path:speech.config\r\n\r\n` +
        JSON.stringify({
          context: {
            synthesis: {
              audio: {
                metadataoptions: { sentenceBoundaryEnabled: false, wordBoundaryEnabled: false },
                outputFormat: OUTPUT_FORMAT,
              },
            },
          },
        })

      const ssml =
        `<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='en-US'>` +
        `<voice name='${voice}'>` +
        `<prosody rate='+0%' pitch='+0Hz'>` +
        `${escapeXml(text)}` +
        `</prosody></voice></speak>`

      const synthesisMessage =
        `X-RequestId:${requestId}\r\n` +
        `Content-Type:application/ssml+xml\r\n` +
        `Path:ssml\r\n\r\n` +
        ssml

      ws.addEventListener('message', (event: MessageEvent) => {
        if (typeof event.data === 'string') {
          if (event.data.includes('turn.end')) {
            resolved = true
            ws.close()
            const totalLength = audioChunks.reduce((acc, chunk) => acc + chunk.byteLength, 0)
            const result = new Uint8Array(totalLength)
            let offset = 0
            for (const chunk of audioChunks) {
              result.set(new Uint8Array(chunk), offset)
              offset += chunk.byteLength
            }
            resolve(result.buffer)
          }
        } else if (event.data instanceof ArrayBuffer) {
          const headerEnd = findHeaderEnd(new Uint8Array(event.data))
          if (headerEnd >= 0) {
            audioChunks.push(event.data.slice(headerEnd))
          }
        }
      })

      ws.addEventListener('error', (err: Event) => {
        if (!resolved) reject(new Error(`WebSocket error: ${err}`))
      })

      ws.addEventListener('close', () => {
        if (!resolved) reject(new Error('WebSocket closed before turn.end'))
      })

      ws.send(configMessage)
      ws.send(synthesisMessage)

      setTimeout(() => {
        if (!resolved) {
          ws.close()
          reject(new Error('Edge TTS timeout'))
        }
      }, 15000)
    })
  }
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function findHeaderEnd(data: Uint8Array): number {
  const separator = new TextEncoder().encode('Path:audio\r\n')
  for (let i = 0; i <= data.length - separator.length; i++) {
    let match = true
    for (let j = 0; j < separator.length; j++) {
      if (data[i + j] !== separator[j]) {
        match = false
        break
      }
    }
    if (match) return i + separator.length
  }
  return -1
}
