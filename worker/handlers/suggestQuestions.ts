import monkeyQuestions from '../../content/suggested-questions/monkey-and-crocodile.json'
import birbalQuestions from '../../content/suggested-questions/birbal-khichdi.json'

interface Segment {
  fromSeconds: number
  toSeconds: number
  suggestions: string[]
}

const QUESTIONS_MAP: Record<string, Segment[]> = {
  'monkey-and-crocodile': monkeyQuestions as Segment[],
  'birbal-khichdi': birbalQuestions as Segment[],
}

export async function handleSuggestQuestions(request: Request): Promise<Response> {
  const body = await request.json() as {
    episodeSlug: string
    currentPositionSeconds: number
  }

  const segments = QUESTIONS_MAP[body.episodeSlug]
  if (!segments) {
    return new Response(
      JSON.stringify({
        suggestions: [
          'What happens next, Dadi?',
          'Have you been to that place, Dadi?',
          'Why did that happen?',
        ],
      }),
      { headers: { 'Content-Type': 'application/json' } },
    )
  }

  const pos = body.currentPositionSeconds
  const segment = segments.find((s) => pos >= s.fromSeconds && pos < s.toSeconds)
  const suggestions = segment?.suggestions ?? segments[0]?.suggestions ?? []

  return new Response(JSON.stringify({ suggestions }), {
    headers: { 'Content-Type': 'application/json' },
  })
}
