import { GeminiProvider } from '../lib/llm/gemini'
import { GroqProvider } from '../lib/llm/groq'
import { EdgeTTSProvider, DADI_VOICE } from '../lib/tts/edgeTts'
import { isInputBlocked } from '../lib/safety/inputBlocklist'
import { checkOutputRegex } from '../lib/safety/outputRegex'
import { classifyOutput } from '../lib/safety/topicClassifier'
import { loadEpisodeScript, getStoryContext } from '../lib/episodeLoader'
import { checkRateLimit } from '../lib/rateLimit'
import type { LLMProvider } from '../lib/llm/index'

interface Env {
  GEMINI_API_KEY: string
  GROQ_API_KEY?: string
  R2_PUBLIC_URL: string
  RATE_LIMIT_PER_HOUR: string
  ASSETS: R2Bucket
  CACHE: KVNamespace
}

interface AskDadiRequest {
  episodeSlug: string
  currentPositionSeconds: number
  questionText: string
  recentTurns: { question: string; response: string }[]
  deviceId: string
}

const DADI_SYSTEM_PROMPT = `You are Dadi, a warm Indian grandmother in your late sixties, talking to your American grandchild who is between four and nine years old. You have just been telling them an Indian fable, and now they have asked you a question.

Your voice and manner: gentle, patient, slightly playful, never lecturing. You speak in short sentences a four-to-nine-year-old can easily follow. You ask the child questions back as often as you give answers — you teach by curiosity, not by instruction. You occasionally use a Hindi or other heritage-language word and explain its meaning in simple English. You reference small concrete details from your own life — your village's banyan tree, your dadi who told you stories when you were small, the smell of cardamom in chai, the monsoon rains, the green of paddy fields, the gramophone your father played. You never refer to yourself as an AI, a chatbot, or a program. You are simply Dadi.

Length and pacing: your response should be one to four short sentences. Never longer. If the child is asking many questions in a row, gently suggest returning to the story: "Shall we keep going with the story, beta? There's a wonderful part coming."

What you will talk about: the story you've been telling, characters in it, Indian culture and traditions, food, animals, geography, plants, basic morals, the child's feelings about the story, simple history that's appropriate for their age, and small bits of your own remembered life.

What you will not talk about: violence beyond what is in the story; anything sexual; drugs; politics; doctrinal religion (you can mention festivals and traditions but not religious instruction); current events; real adult people the child names; anything that asks the child for personal information; anything frightening or distressing.

When asked something outside your scope, gently redirect: "That's a big question for your mom or dad, beta. Let me tell you instead about the banyan tree in my village…" or similar. Never refuse coldly; always redirect warmly.

If you don't know something, say so: "You know what, beta — I'm not sure. That's a wonderful question to ask your dadi or your teacher." Never make up facts to a child.

If the child sounds upset or scared, acknowledge their feeling first, then offer comfort: "Oh, beta. That part was a little scary, wasn't it? Even brave children can feel that. Shall we take a small breath together?"`

const CANNED_REDIRECTS = [
  "That's a big question for your mom or dad, beta. Let me tell you instead about the banyan tree in my village — it was so big, ten children could sit in its shade!",
  "Oh beta, that's something your parents can tell you about. Shall we go back to the story? There's a wonderful part coming.",
  "Hmm, I think your teacher might know that better than Dadi. But you know what I do know? This story has a wonderful surprise coming — shall we hear it?",
]

const EPISODE_TITLES: Record<string, string> = {
  'monkey-and-crocodile': 'The Monkey and the Crocodile',
  'birbal-khichdi': "Birbal's Khichdi",
}

export async function handleAskDadi(request: Request, env: Env): Promise<Response> {
  const body = (await request.json()) as AskDadiRequest

  if (!body.questionText || !body.episodeSlug) {
    return jsonResponse({ error: 'Missing required fields' }, 400)
  }

  const withinLimit = await checkRateLimit(body.deviceId, env)
  if (!withinLimit) {
    return jsonResponse({ error: 'Rate limit exceeded' }, 429)
  }

  if (isInputBlocked(body.questionText)) {
    return jsonResponse({
      responseText: CANNED_REDIRECTS[0],
      responseAudioUrl: '',
      safetyFlag: true,
      suggestedFollowUps: ['What happens next in the story?', 'Tell me about India, Dadi.', 'What is your favorite story?'],
    })
  }

  const script = await loadEpisodeScript(body.episodeSlug, env)
  const storyContext = script ? getStoryContext(script, body.currentPositionSeconds) : 'A traditional Indian fable.'
  const storyTitle = EPISODE_TITLES[body.episodeSlug] ?? body.episodeSlug

  const recentTurnsText = body.recentTurns
    .map((t) => `Child: ${t.question}\nDadi: ${t.response}`)
    .join('\n')

  const userPrompt =
    `The current story is: ${storyTitle}\n` +
    `The story so far: ${storyContext}\n` +
    (recentTurnsText ? `Recent conversation:\n${recentTurnsText}\n\n` : '') +
    `The child has just asked: ${body.questionText}\n\n` +
    `Respond as Dadi, in one to four short sentences.`

  let responseText: string
  let llmProvider: LLMProvider

  try {
    llmProvider = new GeminiProvider(env.GEMINI_API_KEY)
    responseText = await llmProvider.generate(userPrompt, DADI_SYSTEM_PROMPT)
  } catch {
    if (env.GROQ_API_KEY) {
      try {
        llmProvider = new GroqProvider(env.GROQ_API_KEY)
        responseText = await llmProvider.generate(userPrompt, DADI_SYSTEM_PROMPT)
      } catch {
        responseText = CANNED_REDIRECTS[Math.floor(Math.random() * CANNED_REDIRECTS.length)]
      }
    } else {
      responseText = CANNED_REDIRECTS[Math.floor(Math.random() * CANNED_REDIRECTS.length)]
    }
  }

  let safetyFlag = false

  const regexCheck = checkOutputRegex(responseText)
  if (!regexCheck.safe) {
    console.log('[safety] Regex flag:', regexCheck.reason)
    responseText = CANNED_REDIRECTS[Math.floor(Math.random() * CANNED_REDIRECTS.length)]
    safetyFlag = true
  }

  if (!safetyFlag) {
    const classifierResult = await classifyOutput(responseText, env.GEMINI_API_KEY)
    if (!classifierResult.inScope) {
      console.log('[safety] Classifier flag:', classifierResult.reason)
      responseText = CANNED_REDIRECTS[Math.floor(Math.random() * CANNED_REDIRECTS.length)]
      safetyFlag = true
    }
  }

  let responseAudioUrl = ''
  try {
    const tts = new EdgeTTSProvider()
    const audioBuffer = await tts.synthesize(responseText, DADI_VOICE)

    if (audioBuffer.byteLength < 50000) {
      const base64 = arrayBufferToBase64(audioBuffer)
      responseAudioUrl = `data:audio/mp3;base64,${base64}`
    } else {
      const key = `audio-cache/${crypto.randomUUID()}.mp3`
      await env.ASSETS.put(key, audioBuffer, {
        httpMetadata: { contentType: 'audio/mpeg' },
      })
      responseAudioUrl = `${env.R2_PUBLIC_URL}/${key}`
    }
  } catch (err) {
    console.error('[tts] Error:', err)
  }

  const suggestedFollowUps = [
    'What happens next?',
    'Tell me more about that, Dadi.',
    'Did your dadi tell you this story?',
  ]

  return jsonResponse({
    responseText,
    responseAudioUrl,
    safetyFlag,
    suggestedFollowUps,
  })
}

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}
