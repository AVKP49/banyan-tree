/**
 * Pre-warm KV cache with episode scripts and suggested questions.
 * Run after deploying the Worker.
 *
 * Usage: npx tsx scripts/prewarmCache.ts
 */

const BASE_URL = process.env.API_BASE || 'http://localhost:8787'

const episodes = ['monkey-and-crocodile', 'birbal-khichdi']

async function prewarm() {
  console.log(`Pre-warming cache at ${BASE_URL}...\n`)

  const healthRes = await fetch(`${BASE_URL}/api/health`)
  const health = await healthRes.json()
  console.log('Health check:', health)

  for (const slug of episodes) {
    console.log(`\nPre-warming: ${slug}`)

    const suggestRes = await fetch(`${BASE_URL}/api/suggest-questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ episodeSlug: slug, currentPositionSeconds: 0 }),
    })
    const suggestions = await suggestRes.json()
    console.log(`  Suggestions: ${JSON.stringify(suggestions)}`)
  }

  console.log('\nCache pre-warmed!')
}

prewarm().catch(console.error)
