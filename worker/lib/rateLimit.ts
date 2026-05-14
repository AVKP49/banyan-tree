interface Env {
  CACHE: KVNamespace
  RATE_LIMIT_PER_HOUR: string
}

export async function checkRateLimit(deviceId: string, env: Env): Promise<boolean> {
  const limit = parseInt(env.RATE_LIMIT_PER_HOUR) || 30
  const key = `ratelimit:${deviceId}`

  const current = await env.CACHE.get(key)
  const count = current ? parseInt(current) : 0

  if (count >= limit) return false

  await env.CACHE.put(key, String(count + 1), { expirationTtl: 3600 })
  return true
}
