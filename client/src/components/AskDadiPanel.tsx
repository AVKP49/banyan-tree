import { useState, useCallback } from 'react'
import { Mic, MessageCircle, ArrowLeft } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '../store'
import { askDadi, getSuggestedQuestions } from '../lib/api'
import { startListening, isSpeechSupported } from '../lib/speech'
import { isInputBlocked, BLOCKED_REDIRECT_TEXT } from '../lib/safety/input-blocklist'
import { DiyaLoader } from './DiyaLoader'
import { getAudioElement } from '../lib/audio'
import { useEffect } from 'react'

interface Props {
  episodeSlug: string
}

type PanelState = 'suggestions' | 'listening' | 'thinking' | 'response'

export function AskDadiPanel({ episodeSlug }: Props) {
  const { askDadiOpen, setAskDadiOpen, currentTime, recentTurns, addTurn, addQuestion } =
    useAppStore()

  const [panelState, setPanelState] = useState<PanelState>('suggestions')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [responseText, setResponseText] = useState('')
  const [followUps, setFollowUps] = useState<string[]>([])
  const [turnCount, setTurnCount] = useState(0)

  useEffect(() => {
    if (askDadiOpen) {
      setSuggestions(getSuggestedQuestions(episodeSlug, currentTime))
      setPanelState('suggestions')
    }
  }, [askDadiOpen, episodeSlug, currentTime])

  const handleQuestion = useCallback(
    async (questionText: string) => {
      if (isInputBlocked(questionText)) {
        setResponseText(BLOCKED_REDIRECT_TEXT)
        setFollowUps([])
        setPanelState('response')
        return
      }

      setPanelState('thinking')

      const result = await askDadi(questionText, episodeSlug, currentTime, recentTurns)

      setResponseText(result.responseText)
      setFollowUps(result.suggestedFollowUps)
      addTurn(questionText, result.responseText)
      setTurnCount((c) => c + 1)

      addQuestion({
        id: crypto.randomUUID(),
        episodeSlug,
        askedAt: new Date().toISOString(),
        questionText,
        dadiResponseText: result.responseText,
      })

      if (result.responseAudioUrl) {
        const dadiAudio = new Audio(result.responseAudioUrl)
        dadiAudio.play().catch(() => {})
      }

      setPanelState('response')
    },
    [episodeSlug, currentTime, recentTurns, addTurn, addQuestion],
  )

  const handleVoiceInput = useCallback(async () => {
    setPanelState('listening')
    try {
      const transcript = await startListening()
      await handleQuestion(transcript)
    } catch {
      setPanelState('suggestions')
    }
  }, [handleQuestion])

  const handleContinueStory = useCallback(() => {
    setAskDadiOpen(false)
    setTurnCount(0)
    const audio = getAudioElement()
    audio.play()
  }, [setAskDadiOpen])

  const handleAskAnother = useCallback(() => {
    const s = getSuggestedQuestions(episodeSlug, currentTime)
    setSuggestions(followUps.length ? followUps : s)
    setPanelState('suggestions')
  }, [episodeSlug, currentTime, followUps])

  if (!askDadiOpen) {
    return (
      <button
        onClick={() => {
          const audio = getAudioElement()
          audio.pause()
          setAskDadiOpen(true)
        }}
        className="flex w-full items-center justify-center gap-3 rounded-[12px] bg-monsoon p-5 font-serif text-lg font-semibold text-white shadow-lg transition-all hover:bg-monsoon/90 hover:shadow-xl"
      >
        <MessageCircle className="h-6 w-6" />
        Ask Dadi
      </button>
    )
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        className="rounded-[12px] border border-ink/10 bg-cream p-6 shadow-lg"
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-serif text-lg font-semibold text-monsoon">Talking to Dadi</h3>
          <button
            onClick={handleContinueStory}
            className="flex items-center gap-1 font-sans text-sm text-ink/50 hover:text-ink"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to story
          </button>
        </div>

        {panelState === 'suggestions' && (
          <div className="flex flex-col gap-3">
            {suggestions.map((q, i) => (
              <button
                key={i}
                onClick={() => handleQuestion(q)}
                className="rounded-lg border border-ink/10 bg-parchment p-4 text-left font-serif text-base text-ink transition-colors hover:border-saffron/30 hover:bg-saffron/5"
              >
                {q}
              </button>
            ))}
            {isSpeechSupported() && (
              <button
                onClick={handleVoiceInput}
                className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-saffron/10 p-4 font-sans text-sm font-medium text-saffron transition-colors hover:bg-saffron/20"
              >
                <Mic className="h-5 w-5" />
                Ask with your voice
              </button>
            )}
          </div>
        )}

        {panelState === 'listening' && (
          <div className="flex flex-col items-center gap-4 py-8">
            <motion.div
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <Mic className="h-10 w-10 text-saffron" />
            </motion.div>
            <p className="font-serif text-sm text-ink/60 italic">
              Dadi is listening, beta…
            </p>
          </div>
        )}

        {panelState === 'thinking' && <DiyaLoader />}

        {panelState === 'response' && (
          <div className="flex flex-col gap-4">
            <div className="rounded-lg bg-parchment p-4">
              <p className="font-serif text-base leading-relaxed text-ink">{responseText}</p>
            </div>

            {turnCount >= 3 && (
              <p className="text-center font-serif text-sm text-ink/50 italic">
                Shall we keep going with the story, beta? There's a wonderful part coming.
              </p>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleAskAnother}
                className="flex-1 rounded-lg border border-ink/10 bg-parchment p-3 font-sans text-sm font-medium text-ink/70 transition-colors hover:border-saffron/30"
              >
                Ask another question
              </button>
              <button
                onClick={handleContinueStory}
                className="flex-1 rounded-lg bg-saffron p-3 font-sans text-sm font-medium text-white transition-colors hover:bg-saffron/90"
              >
                Continue story
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
