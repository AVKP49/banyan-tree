const UNSAFE_PATTERNS = [
  /https?:\/\/\S+/i,
  /\S+@\S+\.\S+/,
  /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/,
  /\b(trump|biden|obama|modi|putin)\b/i,
  /\b(kill yourself|hurt yourself|run away from home)\b/i,
]

export function checkOutputRegex(text: string): { safe: boolean; reason: string } {
  for (const pattern of UNSAFE_PATTERNS) {
    if (pattern.test(text)) {
      return { safe: false, reason: `Matched unsafe pattern: ${pattern.source}` }
    }
  }

  const sentences = text.split(/[.!?]+/).filter(Boolean)
  if (sentences.length > 5) {
    return { safe: false, reason: 'Response too long (>5 sentences)' }
  }

  const words = text.split(/\s+/).length
  if (words > 120) {
    return { safe: false, reason: `Response too long (${words} words)` }
  }

  if (words < 3) {
    return { safe: false, reason: 'Response too short' }
  }

  return { safe: true, reason: '' }
}
