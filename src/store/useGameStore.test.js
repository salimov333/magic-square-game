// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { generateMagicSquare } from '../game/generators'
import { useGameStore } from './useGameStore'

const profile = { id: 'player', name: 'Player', completedSizes: [], highScores: {}, totalTime: 0 }

beforeEach(() => {
  localStorage.clear()
  vi.useRealTimers()
  useGameStore.setState({ profiles: [profile], activeProfileId: profile.id, game: null })
})

describe('game store', () => {
  it('wins with a different valid magic-square orientation', () => {
    const solution = generateMagicSquare(3)
    const rotated = solution[0].map((_, col) => solution.map((row) => row[col]).reverse())
    const board = rotated.map((row) => [...row])
    const finalValue = board[2][2]
    board[2][2] = null
    useGameStore.setState({ game: {
      size: 3, solution, board, fixed: [], pool: [finalValue], selected: finalValue,
      hints: 0, mistakes: 0, elapsed: 0, startedAt: Date.now(), status: 'playing',
    } })

    useGameStore.getState().placeNumber(2, 2)
    expect(useGameStore.getState().game.status).toBe('won')
    expect(useGameStore.getState().profiles[0].completedSizes).toContain(3)
  })

  it('redirects a reveal hint away from an already correct selected cell', () => {
    const solution = generateMagicSquare(3)
    const board = solution.map((row) => [...row])
    board[0][1] = null
    useGameStore.setState({ game: {
      size: 3, solution, board, fixed: [], pool: [solution[0][1]], selected: null,
      hints: 0, mistakes: 0, elapsed: 0, startedAt: Date.now(), status: 'playing',
    } })

    useGameStore.getState().revealHint(0, 0)
    expect(useGameStore.getState().game.board[0][1]).toBe(solution[0][1])
    expect(useGameStore.getState().game.hints).toBe(1)
  })

  it('records elapsed time when an unfinished game is left', () => {
    const solution = generateMagicSquare(3)
    useGameStore.setState({ game: {
      size: 3, solution, board: solution, fixed: [], pool: [], selected: null,
      hints: 0, mistakes: 0, elapsed: 12, startedAt: Date.now(), status: 'playing',
    } })
    useGameStore.getState().leaveGame()
    expect(useGameStore.getState().profiles[0].totalTime).toBe(12)
  })
})
