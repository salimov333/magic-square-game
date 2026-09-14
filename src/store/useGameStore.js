import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createPuzzle } from '../game/generators'
import { currentElapsed, isSolvedBoard, placementCreatesMistake } from '../game/rules'

const newProfile = (name) => ({
  id: crypto.randomUUID(), name: name.trim(), completedSizes: [], highScores: {}, totalTime: 0,
})

export const useGameStore = create(persist((set) => ({
  language: 'de',
  tutorialSeen: false,
  profiles: [newProfile('Spieler 1')],
  activeProfileId: null,
  game: null,

  setLanguage: (language) => set({ language }),
  finishTutorial: () => set({ tutorialSeen: true }),
  addProfile: (name) => set((state) => {
    const profile = newProfile(name)
    return { profiles: [...state.profiles, profile], activeProfileId: profile.id }
  }),
  selectProfile: (id) => set({ activeProfileId: id }),
  deleteProfile: (id) => set((state) => {
    if (state.profiles.length === 1) return state
    const profiles = state.profiles.filter((profile) => profile.id !== id)
    return { profiles, activeProfileId: state.activeProfileId === id ? profiles[0].id : state.activeProfileId }
  }),
  startGame: (size) => {
    const puzzle = createPuzzle(size)
    set({ game: { size, ...puzzle, selected: null, hints: 0, mistakes: 0, elapsed: 0, startedAt: Date.now(), status: 'playing' } })
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
    const mistakes = game.mistakes + (placementCreatesMistake(board, row, col) ? 1 : 0)
    const complete = isSolvedBoard(board, pool)
    const updated = { ...game, board, pool, mistakes, elapsed: currentElapsed(game), selected: null, status: complete ? 'won' : 'playing' }
    if (!complete) return { game: updated }
    return completeGameState(state, updated)
  }),
  clearCell: (row, col) => set((state) => {
    const game = state.game
    if (!game || game.fixed.includes(row * game.size + col) || game.board[row][col] == null) return state
    const board = game.board.map((line) => [...line])
    const value = board[row][col]
    board[row][col] = null
    return { game: { ...game, board, pool: [...game.pool, value], selected: value } }
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
    const complete = isSolvedBoard(board, pool)
    const updated = { ...game, board, pool, hints: game.hints + 1, elapsed: currentElapsed(game), selected: null, status: complete ? 'won' : 'playing' }
    return complete ? completeGameState(state, updated) : { game: updated }
  }),
  consumeRuleHint: () => set((state) => state.game?.status === 'playing'
    ? { game: { ...state.game, hints: state.game.hints + 1 } } : state),
  resetGame: () => set((state) => {
    if (!state.game) return state
    const profiles = recordAbandonedTime(state)
    const puzzle = createPuzzle(state.game.size)
    return { profiles, game: { size: state.game.size, ...puzzle, selected: null, hints: 0, mistakes: 0, elapsed: 0, startedAt: Date.now(), status: 'playing' } }
  }),
  leaveGame: () => set((state) => state.game
    ? { profiles: recordAbandonedTime(state), game: null } : state),
}), {
  name: 'magic-square-state',
  partialize: ({ language, tutorialSeen, profiles, activeProfileId }) => ({ language, tutorialSeen, profiles, activeProfileId }),
  onRehydrateStorage: () => (state) => {
    if (state && !state.activeProfileId && state.profiles[0]) state.activeProfileId = state.profiles[0].id
  },
}))

function completeGameState(state, game) {
  const score = Math.max(0, game.size * 1000 - game.elapsed * 2 - game.hints * 300 - game.mistakes * 100)
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
