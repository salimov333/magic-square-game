// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { generateMagicSquare } from '../game/generators'
import { useGameStore } from './useGameStore'

const profile = { id: 'player', name: 'Player', completedSizes: [], highScores: {}, totalTime: 0, tutorialSeen: true }

beforeEach(() => {
  localStorage.clear()
  vi.useRealTimers()
  useGameStore.setState({ profiles: [profile], activeProfileId: profile.id, game: null })
})

describe('game store', () => {
  it('creates a new profile with its own unseen tutorial state', () => {
    const id = useGameStore.getState().addProfile('New player')
    expect(useGameStore.getState().activeProfileId).toBe(id)
    expect(useGameStore.getState().profiles.find((item) => item.id === id)).toMatchObject({ name: 'New player', tutorialSeen: false })
    useGameStore.getState().finishTutorial()
    expect(useGameStore.getState().profiles.find((item) => item.id === id).tutorialSeen).toBe(true)
  })

  it('waits for the check button and then accepts a different valid orientation', () => {
    const solution = generateMagicSquare(3)
    const rotated = solution[0].map((_, col) => solution.map((row) => row[col]).reverse())
    const board = rotated.map((row) => [...row])
    const finalValue = board[2][2]
    board[2][2] = null
    useGameStore.setState({ game: {
      size: 3, solution, board, fixed: [], pool: [finalValue], selected: finalValue,
      hints: 0, mistakes: 0, feedback: null, elapsed: 0, startedAt: Date.now(), status: 'playing',
    } })

    useGameStore.getState().placeNumber(2, 2)
    expect(useGameStore.getState().game.status).toBe('playing')
    useGameStore.getState().checkSolution()
    expect(useGameStore.getState().game.status).toBe('won')
    expect(useGameStore.getState().profiles[0].completedSizes).toContain(3)
  })

  it('allows a prefilled cell to be cleared and returns its number to the pool', () => {
    const solution = generateMagicSquare(3)
    useGameStore.setState({ game: {
      size: 3, solution, board: solution.map((row) => [...row]), fixed: [0], pool: [], selected: null,
      hints: 0, mistakes: 0, feedback: null, elapsed: 0, startedAt: Date.now(), status: 'playing',
    } })

    useGameStore.getState().clearCell(0, 0)
    expect(useGameStore.getState().game.board[0][0]).toBeNull()
    expect(useGameStore.getState().game.fixed).toEqual([])
    expect(useGameStore.getState().game.pool).toContain(solution[0][0])
  })

  it('can clear every prefilled cell at once for a fully empty start', () => {
    const solution = generateMagicSquare(3)
    useGameStore.setState({ game: {
      size: 3, solution, board: solution.map((row) => [...row]), fixed: Array.from({ length: 9 }, (_, index) => index), pool: [], selected: null,
      hints: 0, mistakes: 0, feedback: null, elapsed: 0, startedAt: Date.now(), status: 'playing',
    } })

    useGameStore.getState().clearPrefilled()
    const game = useGameStore.getState().game
    expect(game.board.flat().every((value) => value == null)).toBe(true)
    expect(game.fixed).toEqual([])
    expect(game.pool).toHaveLength(9)
  })

  it('counts invalid rows, columns and diagonals only when checked', () => {
    const solution = generateMagicSquare(3)
    const invalid = [[8, 3, 6], [1, 5, 7], [4, 9, 2]]
    useGameStore.setState({ game: {
      size: 3, solution, board: invalid, fixed: [], pool: [], selected: null,
      hints: 0, mistakes: 0, feedback: null, elapsed: 0, startedAt: Date.now(), status: 'playing',
    } })

    expect(useGameStore.getState().game.mistakes).toBe(0)
    useGameStore.getState().checkSolution()
    expect(useGameStore.getState().game.mistakes).toBe(4)
    expect(useGameStore.getState().game.feedback).toMatchObject({ type: 'invalid', total: 4 })
  })

  it('redirects a reveal hint away from an already correct selected cell', () => {
    const solution = generateMagicSquare(3)
    const board = solution.map((row) => [...row])
    board[0][1] = null
    useGameStore.setState({ game: {
      size: 3, solution, board, fixed: [], pool: [solution[0][1]], selected: null,
      hints: 0, mistakes: 0, feedback: null, elapsed: 0, startedAt: Date.now(), status: 'playing',
    } })

    useGameStore.getState().revealHint(0, 0)
    expect(useGameStore.getState().game.board[0][1]).toBe(solution[0][1])
    expect(useGameStore.getState().game.hints).toBe(1)
  })

  it('records elapsed time when an unfinished game is left', () => {
    const solution = generateMagicSquare(3)
    useGameStore.setState({ game: {
      size: 3, solution, board: solution, fixed: [], pool: [], selected: null,
      hints: 0, mistakes: 0, feedback: null, elapsed: 12, startedAt: Date.now(), status: 'playing',
    } })
    useGameStore.getState().leaveGame()
    expect(useGameStore.getState().profiles[0].totalTime).toBe(12)
  })

  it('deducts one point for every elapsed second', () => {
    const solution = generateMagicSquare(3)
    useGameStore.setState({ game: {
      size: 3, solution, board: solution, fixed: [], pool: [], selected: null,
      hints: 0, mistakes: 0, feedback: null, elapsed: 100, startedAt: Date.now(), status: 'playing',
    } })
    useGameStore.getState().checkSolution()
    expect(useGameStore.getState().game.score).toBe(2900)
  })
})
