import { useEffect } from 'react'
import { useParams, useLocation } from 'wouter'
import { Share2, BookOpen, MapPin, Clock } from 'lucide-react'
import { getBySlug, formatDuration } from '../content/episodes'
import { Player } from '../components/Player'
import { AskDadiPanel } from '../components/AskDadiPanel'
import { useAppStore } from '../store'

export function Episode() {
  const { slug } = useParams<{ slug: string }>()
  const [, navigate] = useLocation()
  const { setCurrentEpisode, clearTurns, askDadiOpen } = useAppStore()

  const episode = getBySlug(slug ?? '')

  useEffect(() => {
    if (slug) {
      setCurrentEpisode(slug)
      clearTurns()
    }
    return () => setCurrentEpisode(null)
  }, [slug, setCurrentEpisode, clearTurns])

  if (!episode) {
    return (
      <div className="py-20 text-center">
        <p className="font-serif text-xl text-ink/60">
          This story hasn't been told yet, beta.
        </p>
        <button
          onClick={() => navigate('/library')}
          className="mt-4 font-sans text-sm text-saffron hover:underline"
        >
          Back to Library
        </button>
      </div>
    )
  }

  const handleShare = async () => {
    const url = `${window.location.origin}/episode/${episode.slug}`
    if (navigator.share) {
      await navigator.share({ title: episode.title, text: `Listen to "${episode.title}" on The Banyan Tree`, url })
    } else {
      await navigator.clipboard.writeText(url)
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      <div
        className={`relative overflow-hidden rounded-2xl shadow-lg transition-all ${askDadiOpen ? 'opacity-60' : ''}`}
      >
        <div className="aspect-square bg-ink/10">
          <img
            src={episode.artworkUrl}
            alt={episode.title}
            className="h-full w-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
        </div>
        {askDadiOpen && (
          <div className="absolute inset-0 bg-warm-overlay" />
        )}
      </div>

      <div className="mt-6 text-center">
        <h1 className="font-serif text-2xl font-bold text-ink md:text-3xl">{episode.title}</h1>
        <p className="mt-1 font-sans text-xs font-medium uppercase tracking-wider text-ink/50">
          From the {episode.sourceTradition}
        </p>
        <div className="mt-2 flex items-center justify-center gap-4">
          <span className="flex items-center gap-1 font-sans text-xs text-ink/50">
            <MapPin className="h-3 w-3" />
            {episode.region}
          </span>
          <span className="flex items-center gap-1 font-sans text-xs text-ink/50">
            <Clock className="h-3 w-3" />
            {formatDuration(episode.durationSeconds)}
          </span>
        </div>
      </div>

      <div className="mt-8">
        <Player episode={episode} />
      </div>

      <div className="mt-6">
        <AskDadiPanel episodeSlug={episode.slug} />
      </div>

      <div className="mt-6 flex justify-center gap-4">
        <button
          onClick={handleShare}
          className="flex items-center gap-2 rounded-lg border border-ink/10 px-4 py-2 font-sans text-sm text-ink/60 transition-colors hover:border-ink/20 hover:text-ink"
        >
          <Share2 className="h-4 w-4" />
          Share
        </button>
        <button
          onClick={() => navigate('/about')}
          className="flex items-center gap-2 rounded-lg border border-ink/10 px-4 py-2 font-sans text-sm text-ink/60 transition-colors hover:border-ink/20 hover:text-ink"
        >
          <BookOpen className="h-4 w-4" />
          About this story
        </button>
      </div>

      {episode.wordOfEpisode && (
        <div className="mt-8 rounded-[12px] bg-cream p-6 text-center">
          <p className="font-sans text-xs font-medium uppercase tracking-wider text-gold">
            Word Dadi taught you
          </p>
          <p className="mt-2 font-display text-3xl text-monsoon">{episode.wordOfEpisode.word}</p>
          <p className="mt-1 font-serif text-sm text-ink/70 italic">
            {episode.wordOfEpisode.meaning}
          </p>
        </div>
      )}
    </div>
  )
}
