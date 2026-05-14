import { useLocation } from 'wouter'
import type { EpisodeData } from '../content/episodes'

interface Props {
  episodes: EpisodeData[]
}

export function RegionalMap({ episodes }: Props) {
  const [, navigate] = useLocation()

  const mapPins = episodes.map((ep) => {
    const x = ((ep.regionCoords.lng - 68) / (98 - 68)) * 100
    const y = ((37 - ep.regionCoords.lat) / (37 - 8)) * 100
    return { ...ep, x: Math.max(5, Math.min(95, x)), y: Math.max(5, Math.min(95, y)) }
  })

  return (
    <div className="relative mx-auto w-full max-w-lg">
      <svg viewBox="0 0 400 500" className="w-full" aria-label="Map of the Indian subcontinent">
        <path
          d="M200 20 C120 40, 80 80, 60 120 C40 160, 50 200, 80 240 C90 260, 70 300, 100 340 C120 370, 140 390, 160 420 C170 440, 190 460, 200 480 C210 460, 230 440, 240 420 C260 390, 280 370, 300 340 C330 300, 310 260, 320 240 C350 200, 360 160, 340 120 C320 80, 280 40, 200 20Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-ink/20"
        />
        <path
          d="M200 20 C120 40, 80 80, 60 120 C40 160, 50 200, 80 240 C90 260, 70 300, 100 340 C120 370, 140 390, 160 420 C170 440, 190 460, 200 480 C210 460, 230 440, 240 420 C260 390, 280 370, 300 340 C330 300, 310 260, 320 240 C350 200, 360 160, 340 120 C320 80, 280 40, 200 20Z"
          fill="currentColor"
          className="text-monsoon/5"
        />
      </svg>

      {mapPins.map((pin) => (
        <button
          key={pin.slug}
          onClick={() => navigate(`/episode/${pin.slug}`)}
          className="absolute flex -translate-x-1/2 -translate-y-full flex-col items-center transition-transform hover:scale-110"
          style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
          aria-label={`Play ${pin.title}`}
        >
          <span className="rounded-lg bg-saffron px-2 py-1 font-sans text-xs font-medium text-white shadow-md whitespace-nowrap">
            {pin.title.length > 20 ? pin.title.slice(0, 20) + '...' : pin.title}
          </span>
          <svg width="12" height="8" className="text-saffron">
            <polygon points="0,0 12,0 6,8" fill="currentColor" />
          </svg>
          <div className="h-3 w-3 rounded-full border-2 border-white bg-terracotta shadow" />
        </button>
      ))}
    </div>
  )
}
