import { useState } from 'react'
import { List, Map } from 'lucide-react'
import { getAll } from '../content/episodes'
import { EpisodeCard } from '../components/EpisodeCard'
import { RegionalMap } from '../components/RegionalMap'

type View = 'feed' | 'map'

export function Library() {
  const [view, setView] = useState<View>('feed')
  const episodes = getAll()

  return (
    <div>
      <div className="flex items-center justify-between py-6">
        <h1 className="font-serif text-3xl font-bold text-ink">Stories</h1>
        <div className="flex rounded-lg border border-ink/10 bg-cream">
          <button
            onClick={() => setView('feed')}
            className={`flex items-center gap-1.5 rounded-l-lg px-4 py-2 font-sans text-sm font-medium transition-colors ${
              view === 'feed' ? 'bg-saffron text-white' : 'text-ink/60 hover:text-ink'
            }`}
          >
            <List className="h-4 w-4" />
            Feed
          </button>
          <button
            onClick={() => setView('map')}
            className={`flex items-center gap-1.5 rounded-r-lg px-4 py-2 font-sans text-sm font-medium transition-colors ${
              view === 'map' ? 'bg-saffron text-white' : 'text-ink/60 hover:text-ink'
            }`}
          >
            <Map className="h-4 w-4" />
            Map
          </button>
        </div>
      </div>

      {view === 'feed' ? (
        <div className="flex flex-col gap-4">
          {episodes.map((ep) => (
            <EpisodeCard key={ep.slug} episode={ep} />
          ))}
          {episodes.length === 0 && (
            <p className="py-20 text-center font-serif text-lg text-ink/50 italic">
              More stories are coming soon, beta.
            </p>
          )}
        </div>
      ) : (
        <RegionalMap episodes={episodes} />
      )}
    </div>
  )
}
