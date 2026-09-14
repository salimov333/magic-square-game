// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render } from '@testing-library/react'
import { GameBoard } from './GameBoard'
import { generateMagicSquare } from '../game/generators'
import { useGameStore } from '../store/useGameStore'

afterEach(cleanup)

describe('GameBoard', () => {
  it('keeps all nine cells in a 3x3 grid and avoids Tailwind fixed positioning', () => {
    const solution = generateMagicSquare(3)
    useGameStore.setState({
      language: 'de',
      game: {
        size: 3,
        solution,
        board: [[8, null, null], [null, 5, null], [null, null, 2]],
        fixed: [0, 4, 8],
        pool: [1, 3, 4, 6, 7, 9],
        selected: null,
        hints: 0,
        mistakes: 0,
        elapsed: 0,
        startedAt: Date.now(),
        status: 'playing',
      },
    })

    const { container } = render(<GameBoard onBack={() => {}} />)
    expect(container.querySelectorAll('.game-cell')).toHaveLength(9)
    expect(container.querySelectorAll('.game-cell.prefilled')).toHaveLength(3)
    expect(container.querySelectorAll('.game-cell.fixed')).toHaveLength(0)
    expect(container.querySelector('.game-grid').style.getPropertyValue('--n')).toBe('3')
  })
})
