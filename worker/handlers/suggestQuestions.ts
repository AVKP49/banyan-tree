interface Env {
  ASSETS: R2Bucket
  CACHE: KVNamespace
}

interface Segment {
  fromSeconds: number
  toSeconds: number
  suggestions: string[]
}

export async function handleSuggestQuestions(request: Request, env: Env): Promise<Response> {
  const body = await request.json() as {
    episodeSlug: string
    currentPositionSeconds: number
  }

  const cacheKey = `suggestions:${body.episodeSlug}`
  let segments: Segment[]

  const cached = await env.CACHE.get(cacheKey)
  if (cached) {
    segments = JSON.parse(cached)
  } else {
    const obj = await env.ASSETS.get(`suggested-questions/${body.episodeSlug}.json`)
    if (!obj) {
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
    const text = await obj.text()
    segments = JSON.parse(text)
    await env.CACHE.put(cacheKey, text, { expirationTtl: 86400 })
  }

  const pos = body.currentPositionSeconds
  const segment = segments.find((s) => pos >= s.fromSeconds && pos < s.toSeconds)
  const suggestions = segment?.suggestions ?? segments[0]?.suggestions ?? []

  return new Response(JSON.stringify({ suggestions }), {
    headers: { 'Content-Type': 'application/json' },
  })
}
