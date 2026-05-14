export function handleHealth(): Response {
  return new Response(
    JSON.stringify({
      ok: true,
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    }),
    { headers: { 'Content-Type': 'application/json' } },
  )
}
