let audioElement: HTMLAudioElement | null = null

export function getAudioElement(): HTMLAudioElement {
  if (!audioElement) {
    audioElement = new Audio()
    audioElement.preload = 'auto'
  }
  return audioElement
}

export function setupMediaSession(title: string, artist: string, artworkUrl: string) {
  if ('mediaSession' in navigator) {
    navigator.mediaSession.metadata = new MediaMetadata({
      title,
      artist,
      album: 'The Banyan Tree',
      artwork: [{ src: artworkUrl, sizes: '512x512', type: 'image/png' }],
    })
  }
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}
