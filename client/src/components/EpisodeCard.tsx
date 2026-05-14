import { Link } from 'wouter'
import { Play, Clock, MapPin } from 'lucide-react'
import type { EpisodeData } from '../content/episodes'
import { formatDuration } from '../content/episodes'

interface Props {
  episode: EpisodeData
}

export function EpisodeCard({ episode }: Props) {
  return (
    <Link
      href={`/episode/${episode.slug}`}
      className="group flex gap-4 rounded-[12px] bg-cream p-4 shadow-sm transition-all hover:shadow-md"
    >
      <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-ink/10 md:h-32 md:w-32">
        <img
          src={episode.artworkUrl}
          alt={episode.title}
          className="h-full w-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = 'none'
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center bg-ink/20 opacity-0 transition-opacity group-hover:opacity-100">
          <Play className="h-8 w-8 text-white" fill="white" />
        </div>
      </div>

      <div className="flex flex-col justify-center">
        <h3 className="font-serif text-lg font-semibold text-ink group-hover:text-saffron">
          {episode.title}
        </h3>
        <p className="mt-1 font-sans text-xs font-medium uppercase tracking-wider text-ink/50">
          From the {episode.sourceTradition}
        </p>
        <div className="mt-2 flex items-center gap-3">
          <span className="flex items-center gap-1 font-sans text-xs text-ink/50">
            <MapPin className="h-3 w-3" />
            {episode.region}
          </span>
          <span className="flex items-center gap-1 font-sans text-xs text-ink/50">
            <Clock className="h-3 w-3" />
            {formatDuration(episode.durationSeconds)}
          </span>
        </div>
        {episode.isFree && (
          <span className="mt-2 inline-block w-fit rounded-full bg-monsoon/10 px-2 py-0.5 font-sans text-xs font-medium text-monsoon">
            Free
          </span>
        )}
      </div>
    </Link>
  )
}
