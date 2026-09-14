import { describe, expect, it } from 'vitest'
import { generateMagicSquare } from './generators'
import { currentElapsed, isSolvedBoard, placementCreatesMistake } from './rules'

describe('game rules', () => {
  it('accepts a valid rotated magic square instead of one hidden arrangement only', () => {
    const solution = generateMagicSquare(3)
    const rotated = solution[0].map((_, col) => solution.map((row) => row[col]).reverse())
    expect(rotated).not.toEqual(solution)
    expect(isSolvedBoard(rotated, [])).toBe(true)
  })

  it('requires every number to be placed before the board can be solved', () => {
    expect(isSolvedBoard(generateMagicSquare(3), [2])).toBe(false)
  })

  it('counts a mistake only when a completed affected line has the wrong sum', () => {
    const partial = [[8, 1, null], [null, 5, null], [null, null, 2]]
    expect(placementCreatesMistake(partial, 0, 1)).toBe(false)
    partial[0][2] = 5
    expect(placementCreatesMistake(partial, 0, 2)).toBe(true)
  })

  it('derives elapsed time from the actual start timestamp', () => {
    expect(currentElapsed({ status: 'playing', startedAt: 10_000, elapsed: 2 }, 17_900)).toBe(7)
  })
})
