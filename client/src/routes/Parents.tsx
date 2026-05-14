import { useState, useCallback } from 'react'
import { Lock, Trash2, History, MessageSquare } from 'lucide-react'
import { useAppStore } from '../store'
import { QuestionLogList } from '../components/QuestionLogList'
import { resetAllData } from '../lib/storage'

export function Parents() {
  const { parentPinHash, setParentPin, questions, listenedSlugs } = useAppStore()
  const [authenticated, setAuthenticated] = useState(false)
  const [pinInput, setPinInput] = useState('')
  const [error, setError] = useState('')
  const [tab, setTab] = useState<'questions' | 'history'>('questions')

  const hashPin = useCallback(async (pin: string): Promise<string> => {
    const encoded = new TextEncoder().encode(pin)
    const hash = await crypto.subtle.digest('SHA-256', encoded)
    return Array.from(new Uint8Array(hash))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
  }, [])

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (pinInput.length !== 4 || !/^\d{4}$/.test(pinInput)) {
        setError('Please enter a 4-digit PIN')
        return
      }

      const hash = await hashPin(pinInput)

      if (!parentPinHash) {
        setParentPin(hash)
        setAuthenticated(true)
      } else if (hash === parentPinHash) {
        setAuthenticated(true)
      } else {
        setError('Incorrect PIN')
        setPinInput('')
      }
    },
    [pinInput, parentPinHash, setParentPin, hashPin],
  )

  if (!authenticated) {
    return (
      <div className="flex flex-col items-center py-20">
        <Lock className="h-12 w-12 text-ink/30" />
        <h1 className="mt-4 font-serif text-2xl font-bold text-ink">Parent Zone</h1>
        <p className="mt-2 font-sans text-sm text-ink/50">
          {parentPinHash ? 'Enter your 4-digit PIN' : 'Set a 4-digit PIN to protect this area'}
        </p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col items-center gap-4">
          <input
            type="password"
            inputMode="numeric"
            maxLength={4}
            value={pinInput}
            onChange={(e) => {
              setPinInput(e.target.value.replace(/\D/g, '').slice(0, 4))
              setError('')
            }}
            className="w-40 rounded-lg border border-ink/20 bg-cream px-4 py-3 text-center font-mono text-2xl tracking-[0.5em] text-ink focus:border-saffron focus:outline-none"
            placeholder="····"
            autoFocus
          />
          {error && <p className="font-sans text-sm text-terracotta">{error}</p>}
          <button
            type="submit"
            className="rounded-lg bg-saffron px-8 py-3 font-sans text-sm font-semibold text-white hover:bg-saffron/90"
          >
            {parentPinHash ? 'Enter' : 'Set PIN'}
          </button>
        </form>
      </div>
    )
  }

  return (
    <div>
      <h1 className="py-6 font-serif text-3xl font-bold text-ink">Parent Zone</h1>

      <div className="mb-6 flex gap-2 rounded-lg border border-ink/10 bg-cream p-1">
        <button
          onClick={() => setTab('questions')}
          className={`flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2.5 font-sans text-sm font-medium transition-colors ${
            tab === 'questions' ? 'bg-saffron text-white' : 'text-ink/60 hover:text-ink'
          }`}
        >
          <MessageSquare className="h-4 w-4" />
          Questions Log
        </button>
        <button
          onClick={() => setTab('history')}
          className={`flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2.5 font-sans text-sm font-medium transition-colors ${
            tab === 'history' ? 'bg-saffron text-white' : 'text-ink/60 hover:text-ink'
          }`}
        >
          <History className="h-4 w-4" />
          Listening History
        </button>
      </div>

      {tab === 'questions' && <QuestionLogList questions={questions} />}

      {tab === 'history' && (
        <div>
          {listenedSlugs.length === 0 ? (
            <p className="py-12 text-center font-serif text-base text-ink/50 italic">
              No episodes completed yet — they'll show up here.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {listenedSlugs.map((slug) => (
                <div
                  key={slug}
                  className="rounded-lg border border-ink/10 bg-cream px-4 py-3 font-sans text-sm text-ink"
                >
                  {slug.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="mt-12 border-t border-ink/10 pt-6">
        <button
          onClick={() => {
            if (confirm('This will erase all data on this device. Are you sure?')) {
              resetAllData()
              window.location.reload()
            }
          }}
          className="flex items-center gap-2 font-sans text-sm text-terracotta/70 hover:text-terracotta"
        >
          <Trash2 className="h-4 w-4" />
          Reset device
        </button>
      </div>
    </div>
  )
}
