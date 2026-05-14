import { useEffect, useRef, useCallback } from 'react'
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react'
import { useAppStore } from '../store'
import { getAudioElement, setupMediaSession, formatTime } from '../lib/audio'
import type { EpisodeData } from '../content/episodes'

interface Props {
  episode: EpisodeData
}

export function Player({ episode }: Props) {
  const audioRef = useRef(getAudioElement())
  const progressRef = useRef<HTMLDivElement>(null)

  const {
    isPlaying,
    currentTime,
    duration,
    setPlaying,
    setCurrentTime,
    setDuration,
    savePlaybackPosition,
    getPlaybackPosition,
    markListened,
    settings,
  } = useAppStore()

  useEffect(() => {
    const audio = audioRef.current
    audio.src = episode.audioUrl
    audio.playbackRate = settings.playbackSpeed
    audio.volume = settings.volume

    const savedPos = getPlaybackPosition(episode.slug)
    if (savedPos > 0) audio.currentTime = savedPos

    setupMediaSession(episode.title, 'Dadi', episode.artworkUrl)

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime)
      if (Math.floor(audio.currentTime) % 5 === 0) {
        savePlaybackPosition(episode.slug, audio.currentTime)
      }
    }
    const onLoadedMetadata = () => setDuration(audio.duration)
    const onEnded = () => {
      setPlaying(false)
      markListened(episode.slug)
    }
    const onPlay = () => setPlaying(true)
    const onPause = () => setPlaying(false)

    audio.addEventListener('timeupdate', onTimeUpdate)
    audio.addEventListener('loadedmetadata', onLoadedMetadata)
    audio.addEventListener('ended', onEnded)
    audio.addEventListener('play', onPlay)
    audio.addEventListener('pause', onPause)

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate)
      audio.removeEventListener('loadedmetadata', onLoadedMetadata)
      audio.removeEventListener('ended', onEnded)
      audio.removeEventListener('play', onPlay)
      audio.removeEventListener('pause', onPause)
      audio.pause()
      savePlaybackPosition(episode.slug, audio.currentTime)
    }
  }, [episode.slug, episode.audioUrl, episode.artworkUrl, episode.title, settings.playbackSpeed, settings.volume, setCurrentTime, setDuration, setPlaying, savePlaybackPosition, getPlaybackPosition, markListened])

  const togglePlay = useCallback(() => {
    const audio = audioRef.current
    if (audio.paused) {
      audio.play()
    } else {
      audio.pause()
    }
  }, [])

  const skip = useCallback((seconds: number) => {
    const audio = audioRef.current
    audio.currentTime = Math.max(0, Math.min(audio.duration, audio.currentTime + seconds))
  }, [])

  const handleProgressClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect()
      const fraction = (e.clientX - rect.left) / rect.width
      audioRef.current.currentTime = fraction * duration
    },
    [duration],
  )

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div className="flex flex-col items-center gap-6">
      <div
        ref={progressRef}
        onClick={handleProgressClick}
        className="relative h-2 w-full cursor-pointer rounded-full bg-ink/10"
        role="slider"
        aria-valuenow={currentTime}
        aria-valuemin={0}
        aria-valuemax={duration}
        aria-label="Playback progress"
      >
        <div
          className="absolute left-0 top-0 h-full rounded-full bg-saffron transition-[width] duration-100"
          style={{ width: `${progress}%` }}
        />
        <div
          className="absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-saffron shadow-md"
          style={{ left: `${progress}%` }}
        />
      </div>

      <div className="flex w-full justify-between font-mono text-xs text-ink/50">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>

      <div className="flex items-center gap-8">
        <button
          onClick={() => skip(-15)}
          className="rounded-full p-3 text-ink/60 transition-colors hover:bg-ink/5 hover:text-ink"
          aria-label="Skip back 15 seconds"
        >
          <SkipBack className="h-6 w-6" />
        </button>

        <button
          onClick={togglePlay}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-saffron text-white shadow-lg transition-all hover:bg-saffron/90 hover:shadow-xl"
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause className="h-7 w-7" fill="white" /> : <Play className="ml-1 h-7 w-7" fill="white" />}
        </button>

        <button
          onClick={() => skip(15)}
          className="rounded-full p-3 text-ink/60 transition-colors hover:bg-ink/5 hover:text-ink"
          aria-label="Skip forward 15 seconds"
        >
          <SkipForward className="h-6 w-6" />
        </button>
      </div>
    </div>
  )
}
