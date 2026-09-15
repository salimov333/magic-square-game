import { describe, expect, it } from 'vitest'
import { generateMagicSquare } from './generators'
import { currentElapsed, isSolvedBoard, validateBoard } from './rules'

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

  it('waits until every number is placed before validating', () => {
    const partial = [[8, 1, null], [3, 5, 7], [4, 9, 2]]
    expect(validateBoard(partial, [6])).toMatchObject({ complete: false, total: 0 })
  })

  it('counts every invalid row, column and main diagonal', () => {
    const invalid = [[8, 3, 6], [1, 5, 7], [4, 9, 2]]
    expect(validateBoard(invalid, [])).toEqual({
      complete: true,
      valid: false,
      invalidRows: [0, 1],
      invalidColumns: [0, 1],
      invalidDiagonals: [],
      total: 4,
    })
  })

  it('derives elapsed time from the actual start timestamp', () => {
    expect(currentElapsed({ status: 'playing', startedAt: 10_000, elapsed: 2 }, 17_900)).toBe(7)
  })
})
