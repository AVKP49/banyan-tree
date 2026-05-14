interface SpeechRecognitionEvent {
  results: { [index: number]: { [index: number]: { transcript: string } } }
}

export function isSpeechSupported(): boolean {
  return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window
}

export function startListening(): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!isSpeechSupported()) {
      reject(new Error('Speech recognition not supported'))
      return
    }

    const SpeechRecognition =
      (window as unknown as Record<string, unknown>).SpeechRecognition ||
      (window as unknown as Record<string, unknown>).webkitSpeechRecognition

    const recognition = new (SpeechRecognition as new () => {
      lang: string
      interimResults: boolean
      maxAlternatives: number
      onresult: (e: SpeechRecognitionEvent) => void
      onerror: (e: { error: string }) => void
      onend: () => void
      start: () => void
      stop: () => void
    })()

    recognition.lang = 'en-US'
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    let resolved = false

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript
      resolved = true
      resolve(transcript)
    }

    recognition.onerror = (event: { error: string }) => {
      if (!resolved) reject(new Error(event.error))
    }

    recognition.onend = () => {
      if (!resolved) reject(new Error('No speech detected'))
    }

    recognition.start()

    setTimeout(() => {
      if (!resolved) {
        recognition.stop()
      }
    }, 10000)
  })
}
