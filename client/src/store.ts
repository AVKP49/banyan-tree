import { create } from 'zustand'
import { getStorage, setStorage } from './lib/storage'

export interface QuestionLogEntry {
  id: string
  episodeSlug: string
  askedAt: string
  questionText: string
  dadiResponseText: string
}

export interface WordEntry {
  word: string
  meaning: string
  pronunciationAudioUrl: string
  learnedAt: string
  sourceEpisodeSlug: string
}

interface UserSettings {
  volume: number
  playbackSpeed: 0.75 | 1.0 | 1.25 | 1.5
  theme: 'light' | 'dark'
}

interface AppState {
  currentEpisodeSlug: string | null
  isPlaying: boolean
  currentTime: number
  duration: number
  askDadiOpen: boolean
  recentTurns: { question: string; response: string }[]
  questions: QuestionLogEntry[]
  wordsLearned: WordEntry[]
  listenedSlugs: string[]
  settings: UserSettings
  parentPinHash: string | null

  setCurrentEpisode: (slug: string | null) => void
  setPlaying: (playing: boolean) => void
  setCurrentTime: (time: number) => void
  setDuration: (duration: number) => void
  setAskDadiOpen: (open: boolean) => void
  addTurn: (question: string, response: string) => void
  clearTurns: () => void
  addQuestion: (entry: QuestionLogEntry) => void
  addWord: (entry: WordEntry) => void
  markListened: (slug: string) => void
  updateSettings: (settings: Partial<UserSettings>) => void
  setParentPin: (hash: string) => void
  loadFromStorage: () => void
  savePlaybackPosition: (slug: string, position: number) => void
  getPlaybackPosition: (slug: string) => number
}

export const useAppStore = create<AppState>((set, get) => ({
  currentEpisodeSlug: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  askDadiOpen: false,
  recentTurns: [],
  questions: [],
  wordsLearned: [],
  listenedSlugs: [],
  settings: { volume: 1, playbackSpeed: 1.0, theme: 'light' },
  parentPinHash: null,

  setCurrentEpisode: (slug) => set({ currentEpisodeSlug: slug }),
  setPlaying: (playing) => set({ isPlaying: playing }),
  setCurrentTime: (time) => set({ currentTime: time }),
  setDuration: (duration) => set({ duration }),
  setAskDadiOpen: (open) => set({ askDadiOpen: open }),

  addTurn: (question, response) =>
    set((s) => ({
      recentTurns: [...s.recentTurns.slice(-1), { question, response }],
    })),

  clearTurns: () => set({ recentTurns: [] }),

  addQuestion: (entry) => {
    const questions = [...get().questions, entry]
    setStorage('questions', questions)
    set({ questions })
  },

  addWord: (entry) => {
    const wordsLearned = [...get().wordsLearned, entry]
    setStorage('wordsLearned', wordsLearned)
    set({ wordsLearned })
  },

  markListened: (slug) => {
    const current = get().listenedSlugs
    if (!current.includes(slug)) {
      const updated = [...current, slug]
      setStorage('listened', updated)
      set({ listenedSlugs: updated })
    }
  },

  updateSettings: (partial) => {
    const settings = { ...get().settings, ...partial }
    setStorage('settings', settings)
    set({ settings })
  },

  setParentPin: (hash) => {
    setStorage('parentPinHash', hash)
    set({ parentPinHash: hash })
  },

  loadFromStorage: () => {
    set({
      questions: getStorage('questions') ?? [],
      wordsLearned: getStorage('wordsLearned') ?? [],
      listenedSlugs: getStorage('listened') ?? [],
      settings: getStorage('settings') ?? { volume: 1, playbackSpeed: 1.0, theme: 'light' },
      parentPinHash: getStorage('parentPinHash') ?? null,
    })
  },

  savePlaybackPosition: (slug, position) => {
    setStorage(`playback:${slug}`, position)
  },

  getPlaybackPosition: (slug) => {
    return getStorage(`playback:${slug}`) ?? 0
  },
}))
