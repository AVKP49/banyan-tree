interface Env {
  GEMINI_API_KEY: string
  GROQ_API_KEY?: string
  R2_PUBLIC_URL: string
  RATE_LIMIT_PER_HOUR: string
  ENVIRONMENT: string
  ASSETS: R2Bucket
  CACHE: KVNamespace
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    const path = url.pathname

    const corsHeaders: Record<string, string> = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders })
    }

    try {
      let response: Response

      if (path === '/api/ask-dadi' && request.method === 'POST') {
        const { handleAskDadi } = await import('./handlers/askDadi')
        response = await handleAskDadi(request, env)
      } else if (path === '/api/suggest-questions' && request.method === 'POST') {
        const { handleSuggestQuestions } = await import('./handlers/suggestQuestions')
        response = await handleSuggestQuestions(request, env)
      } else if (path === '/api/report-issue' && request.method === 'POST') {
        const { handleReportIssue } = await import('./handlers/reportIssue')
        response = await handleReportIssue(request)
      } else if (path === '/api/health') {
        const { handleHealth } = await import('./handlers/health')
        response = handleHealth()
      } else {
        response = new Response(JSON.stringify({ error: 'Not found' }), { status: 404 })
      }

      const newHeaders = new Headers(response.headers)
      Object.entries(corsHeaders).forEach(([k, v]) => newHeaders.set(k, v))

      return new Response(response.body, {
        status: response.status,
        headers: newHeaders,
      })
    } catch (err) {
      console.error('Worker error:', err)
      return new Response(
        JSON.stringify({ error: 'Internal server error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }
  },
}
