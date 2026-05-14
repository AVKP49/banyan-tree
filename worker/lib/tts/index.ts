export interface TTSProvider {
  synthesize(text: string, voice: string): Promise<ArrayBuffer>
}
