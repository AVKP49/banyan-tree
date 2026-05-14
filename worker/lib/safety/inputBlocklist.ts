const BLOCKED_PATTERNS = [
  /\b(kill|murder|suicide|die|dead|death)\b/i,
  /\b(sex|porn|naked|nude|boob|penis|vagina)\b/i,
  /\b(fuck|shit|damn|hell|ass|bitch)\b/i,
  /\b(drug|cocaine|heroin|meth|weed|marijuana)\b/i,
  /\b(gun|shoot|bomb|weapon|knife|stab)\b/i,
  /\b(hate|racist|slur)\b/i,
  /\b(alcohol|beer|wine|vodka|whiskey)\b/i,
]

export function isInputBlocked(text: string): boolean {
  return BLOCKED_PATTERNS.some((p) => p.test(text))
}
