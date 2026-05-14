export interface LLMProvider {
  generate(prompt: string, systemPrompt: string): Promise<string>
}
