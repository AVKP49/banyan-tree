import episodesData from '../../../content/episodes.json'

export interface EpisodeData {
  slug: string
  title: string
  sourceTradition: string
  region: string
  regionCoords: { lat: number; lng: number }
  durationSeconds: number
  audioUrl: string
  artworkUrl: string
  scriptUrl: string
  wordOfEpisode: { word: string; meaning: string; pronunciationUrl: string }
  releaseDate: string
  isFree: boolean
}

const episodes: EpisodeData[] = episodesData.episodes

export function getAll(): EpisodeData[] {
  return episodes
}

export function getBySlug(slug: string): EpisodeData | undefined {
  return episodes.find((e) => e.slug === slug)
}

export function getByRegion(region: string): EpisodeData[] {
  return episodes.filter((e) => e.region === region)
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}
