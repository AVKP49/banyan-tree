import { BookOpen } from 'lucide-react'
import { useAppStore } from '../store'
import { getAll } from '../content/episodes'

export function Words() {
  const { wordsLearned } = useAppStore()
  const allEpisodes = getAll()

  const allWords = wordsLearned.length > 0
    ? wordsLearned
    : allEpisodes.map((ep) => ({
        word: ep.wordOfEpisode.word,
        meaning: ep.wordOfEpisode.meaning,
        pronunciationAudioUrl: ep.wordOfEpisode.pronunciationUrl,
        learnedAt: '',
        sourceEpisodeSlug: ep.slug,
      }))

  return (
    <div>
      <div className="flex items-center gap-3 py-6">
        <BookOpen className="h-7 w-7 text-gold" />
        <h1 className="font-serif text-3xl font-bold text-ink">Words Dadi Taught You</h1>
      </div>

      {allWords.length === 0 ? (
        <p className="py-12 text-center font-serif text-base text-ink/50 italic">
          Listen to a story and Dadi will teach you a new word at the end.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {allWords.map((w) => (
            <div key={w.word} className="rounded-[12px] bg-cream p-6 shadow-sm">
              <p className="font-display text-3xl text-monsoon">{w.word}</p>
              <p className="mt-2 font-serif text-sm leading-relaxed text-ink/70 italic">
                {w.meaning}
              </p>
              <p className="mt-3 font-sans text-xs text-ink/40">
                From: {w.sourceEpisodeSlug.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
