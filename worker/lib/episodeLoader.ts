interface Env {
  ASSETS: R2Bucket
  CACHE: KVNamespace
}

export async function loadEpisodeScript(slug: string, env: Env): Promise<string | null> {
  const cacheKey = `script:${slug}`
  const cached = await env.CACHE.get(cacheKey)
  if (cached) return cached

  const obj = await env.ASSETS.get(`scripts/${slug}.txt`)
  if (!obj) return null

  const text = await obj.text()
  await env.CACHE.put(cacheKey, text, { expirationTtl: 86400 })
  return text
}

export function getStoryContext(fullScript: string, positionSeconds: number): string {
  const wordsPerSecond = 2.5
  const wordsToInclude = Math.floor(positionSeconds * wordsPerSecond)
  const words = fullScript.split(/\s+/)

  if (wordsToInclude >= words.length) return fullScript

  const told = words.slice(0, wordsToInclude).join(' ')
  const remaining = words.slice(wordsToInclude)
  const summary = remaining.slice(0, 50).join(' ') + '...'

  return `${told}\n\n[The rest of the story continues: ${summary}]`
}
