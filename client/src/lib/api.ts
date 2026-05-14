import { getDeviceId } from './storage'

const API_BASE = import.meta.env.VITE_PUBLIC_API_BASE || ''

interface AskDadiResponse {
  responseText: string
  responseAudioUrl: string
  safetyFlag: boolean
  suggestedFollowUps: string[]
}

export async function askDadi(
  questionText: string,
  episodeSlug: string,
  currentPositionSeconds: number,
  recentTurns: { question: string; response: string }[],
): Promise<AskDadiResponse> {
  const res = await fetch(`${API_BASE}/api/ask-dadi`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      episodeSlug,
      currentPositionSeconds: Math.floor(currentPositionSeconds),
      questionText,
      recentTurns,
      deviceId: getDeviceId(),
    }),
  })

  if (res.status === 429) {
    return {
      responseText:
        "Oh beta, Dadi's a little tired from answering so many wonderful questions! Let's go back to the story for now.",
      responseAudioUrl: '',
      safetyFlag: false,
      suggestedFollowUps: [],
    }
  }

  if (!res.ok) {
    return {
      responseText:
        "Hmm, Dadi's having a little trouble hearing right now. Let's try again in a moment.",
      responseAudioUrl: '',
      safetyFlag: false,
      suggestedFollowUps: [],
    }
  }

  return res.json()
}

export async function getSuggestedQuestions(
  episodeSlug: string,
  currentPositionSeconds: number,
): Promise<string[]> {
  try {
    const mod = await import(`../../../content/suggested-questions/${episodeSlug}.json`)
    const segments = mod.default as {
      fromSeconds: number
      toSeconds: number
      suggestions: string[]
    }[]
    const segment = segments.find(
      (s) => currentPositionSeconds >= s.fromSeconds && currentPositionSeconds < s.toSeconds,
    )
    return segment?.suggestions ?? segments[0]?.suggestions ?? []
  } catch {
    return [
      'What happens next, Dadi?',
      'Have you been to that place, Dadi?',
      'Why did that happen?',
    ]
  }
}

export async function reportIssue(
  questionLogId: string,
  reason: string,
  comment?: string,
): Promise<void> {
  await fetch(`${API_BASE}/api/report-issue`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ questionLogId, reason, comment }),
  })
}
