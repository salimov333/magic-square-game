import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createPuzzle } from '../game/generators'
import { currentElapsed, validateBoard } from '../game/rules'

const newProfile = (name) => ({
  id: crypto.randomUUID(), name: name.trim(), completedSizes: [], highScores: {}, totalTime: 0, tutorialSeen: false,
})

export const useGameStore = create(persist((set) => ({
  language: 'de',
  profiles: [],
  activeProfileId: null,
  game: null,

  setLanguage: (language) => set({ language }),
  finishTutorial: () => set((state) => ({ profiles: state.profiles.map((profile) =>
    profile.id === state.activeProfileId ? { ...profile, tutorialSeen: true } : profile) })),
  addProfile: (name) => {
    const profile = newProfile(name)
    set((state) => ({ profiles: [...state.profiles, profile], activeProfileId: profile.id }))
    return profile.id
  },
  selectProfile: (id) => set({ activeProfileId: id }),
  deleteProfile: (id) => set((state) => {
    if (state.profiles.length === 1) return state
    const profiles = state.profiles.filter((profile) => profile.id !== id)
    return { profiles, activeProfileId: state.activeProfileId === id ? profiles[0].id : state.activeProfileId }
  }),
  startGame: (size) => {
    const puzzle = createPuzzle(size)
    set({ game: { size, ...puzzle, selected: null, hints: 0, mistakes: 0, feedback: null, elapsed: 0, startedAt: Date.now(), status: 'playing' } })
  },
  tick: () => set((state) => state.game?.status === 'playing'
    ? { game: { ...state.game, elapsed: currentElapsed(state.game) } } : state),
  selectNumber: (value) => set((state) => state.game
    ? { game: { ...state.game, selected: state.game.selected === value ? null : value } } : state),
  placeNumber: (row, col, explicitValue) => set((state) => {
    const game = state.game
    if (!game || game.fixed.includes(row * game.size + col) || game.status !== 'playing') return state
    const value = explicitValue ?? game.selected
    if (value == null || !game.pool.includes(value)) return state
    const board = game.board.map((line) => [...line])
    const previous = board[row][col]
    board[row][col] = value
    const pool = game.pool.filter((item) => item !== value)
    if (previous != null) pool.push(previous)
    return { game: { ...game, board, pool, feedback: null, selected: null } }
  }),
  clearCell: (row, col) => set((state) => {
    const game = state.game
    if (!game || game.status !== 'playing' || game.board[row][col] == null) return state
    const board = game.board.map((line) => [...line])
    const value = board[row][col]
    const index = row * game.size + col
    board[row][col] = null
    return { game: { ...game, board, fixed: game.fixed.filter((item) => item !== index), pool: [...game.pool, value], selected: value, feedback: null } }
  }),
  clearPrefilled: () => set((state) => {
    const game = state.game
    if (!game || game.status !== 'playing' || game.fixed.length === 0) return state
    const fixed = new Set(game.fixed)
    const returned = []
    const board = game.board.map((row, r) => row.map((value, c) => {
      if (!fixed.has(r * game.size + c)) return value
      returned.push(value)
      return null
    }))
    return { game: { ...game, board, fixed: [], pool: [...game.pool, ...returned], selected: null, feedback: null } }
  }),
  revealHint: (row, col) => set((state) => {
    const game = state.game
    if (!game || game.status !== 'playing') return state
    let targetRow = row
    let targetCol = col
    if (targetRow == null
      || game.fixed.includes(targetRow * game.size + targetCol)
      || game.board[targetRow][targetCol] === game.solution[targetRow][targetCol]) {
      const empty = []
      game.board.forEach((line, r) => line.forEach((value, c) => {
        if (!game.fixed.includes(r * game.size + c) && value !== game.solution[r][c]) empty.push([r, c])
      }))
      if (!empty.length) return state
      ;[targetRow, targetCol] = empty[0]
    }
    const correct = game.solution[targetRow][targetCol]
    const board = game.board.map((line) => [...line])
    const previous = board[targetRow][targetCol]
    // Move a misplaced value instead of duplicating it on the board.
    board.forEach((line, r) => line.forEach((value, c) => {
      if ((r !== targetRow || c !== targetCol) && value === correct && !game.fixed.includes(r * game.size + c)) {
        board[r][c] = null
      }
    }))
    board[targetRow][targetCol] = correct
    let pool = game.pool.filter((value) => value !== correct)
    if (previous != null && previous !== correct) pool = [...pool, previous]
    return { game: { ...game, board, pool, hints: game.hints + 1, feedback: null, selected: null } }
  }),
  consumeRuleHint: () => set((state) => state.game?.status === 'playing'
    ? { game: { ...state.game, hints: state.game.hints + 1 } } : state),
  checkSolution: () => set((state) => {
    const game = state.game
    if (!game || game.status !== 'playing') return state
    const result = validateBoard(game.board, game.pool)
    if (!result.complete) return { game: { ...game, feedback: { type: 'incomplete' } } }
    if (!result.valid) return { game: { ...game, mistakes: result.total, feedback: { type: 'invalid', ...result } } }
    const completed = { ...game, elapsed: currentElapsed(game), feedback: { type: 'success' }, status: 'won' }
    return completeGameState(state, completed)
  }),
  resetGame: () => set((state) => {
    if (!state.game) return state
    const profiles = recordAbandonedTime(state)
    const puzzle = createPuzzle(state.game.size)
    return { profiles, game: { size: state.game.size, ...puzzle, selected: null, hints: 0, mistakes: 0, feedback: null, elapsed: 0, startedAt: Date.now(), status: 'playing' } }
  }),
  leaveGame: () => set((state) => state.game
    ? { profiles: recordAbandonedTime(state), game: null } : state),
}), {
  name: 'magic-square-state',
  version: 2,
  partialize: ({ language, profiles, activeProfileId }) => ({ language, profiles, activeProfileId }),
  migrate: (persisted, version) => {
    if (version >= 2) return persisted
    const profiles = (persisted.profiles ?? [])
      .filter((profile) => !(profile.name === 'Spieler 1'
        && profile.completedSizes?.length === 0
        && Object.keys(profile.highScores ?? {}).length === 0
        && profile.totalTime === 0))
      .map((profile) => ({ ...profile, tutorialSeen: true }))
    return { ...persisted, profiles, activeProfileId: null }
  },
}))

function completeGameState(state, game) {
  const score = Math.max(0, game.size * 1000 - game.elapsed - game.hints * 300 - game.mistakes * 100)
  const activeId = state.activeProfileId || state.profiles[0]?.id
  const profiles = state.profiles.map((profile) => profile.id !== activeId ? profile : {
    ...profile,
    completedSizes: [...new Set([...profile.completedSizes, game.size])].sort((a, b) => a - b),
    highScores: { ...profile.highScores, [game.size]: Math.max(profile.highScores[game.size] || 0, score) },
    totalTime: profile.totalTime + game.elapsed,
  })
  return { game: { ...game, score }, profiles }
}

function recordAbandonedTime(state) {
  if (state.game.status !== 'playing') return state.profiles
  const elapsed = currentElapsed(state.game)
  const activeId = state.activeProfileId || state.profiles[0]?.id
  return state.profiles.map((profile) => profile.id === activeId
    ? { ...profile, totalTime: profile.totalTime + elapsed }
    : profile)
}
