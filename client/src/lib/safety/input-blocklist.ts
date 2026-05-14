const BLOCKED_PATTERNS = [
  /\b(kill|murder|suicide|die|dead|death)\b/i,
  /\b(sex|porn|naked|nude|boob|penis|vagina)\b/i,
  /\b(fuck|shit|damn|hell|ass|bitch|crap)\b/i,
  /\b(drug|cocaine|heroin|meth|weed|marijuana)\b/i,
  /\b(gun|shoot|bomb|weapon|knife|stab)\b/i,
  /\b(hate|racist|slur)\b/i,
  /\b(alcohol|beer|wine|vodka|whiskey)\b/i,
]

export function isInputBlocked(text: string): boolean {
  return BLOCKED_PATTERNS.some((pattern) => pattern.test(text))
}

export const BLOCKED_REDIRECT_TEXT =
  "Let's try a different question, beta. Ask me about the story — there's so much to talk about!"
