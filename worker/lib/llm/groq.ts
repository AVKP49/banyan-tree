import type { LLMProvider } from './index'

export class GroqProvider implements LLMProvider {
  constructor(private apiKey: string) {}

  async generate(prompt: string, systemPrompt: string): Promise<string> {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        temperature: 0.4,
        max_tokens: 160,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      throw new Error(`Groq API error ${res.status}: ${err}`)
    }

    const data = await res.json() as {
      choices?: { message?: { content?: string } }[]
    }
    const text = data.choices?.[0]?.message?.content
    if (!text) throw new Error('Empty response from Groq')
    return text.trim()
  }
}
