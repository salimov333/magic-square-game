// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render } from '@testing-library/react'
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
        feedback: null,
        elapsed: 0,
        startedAt: Date.now(),
        status: 'playing',
      },
    })

    const { container } = render(<GameBoard onBack={() => {}} />)
    expect(container.querySelectorAll('.game-cell')).toHaveLength(9)
    expect(container.querySelectorAll('.game-cell.prefilled')).toHaveLength(3)
    expect(container.querySelectorAll('.game-cell.fixed')).toHaveLength(0)
    expect(container.querySelector('.board-matrix').style.getPropertyValue('--n')).toBe('3')
    expect(container.querySelector('.board-matrix').getAttribute('dir')).toBe('ltr')
    expect(container.querySelector('.board-viewport').getAttribute('dir')).toBe('ltr')
    expect(container.querySelector('.check-button')).not.toBeNull()

    fireEvent.click(container.querySelector('.game-cell.prefilled'))
    expect(useGameStore.getState().game.fixed).toHaveLength(2)
    expect(useGameStore.getState().game.pool).toHaveLength(7)
  })

  it.each([3, 11, 12])('renders a unified responsive matrix for the %ix%i board', (size) => {
    const solution = generateMagicSquare(size)
    useGameStore.setState({
      language: 'ar',
      game: {
        size,
        solution,
        board: solution.map((row) => row.map(() => null)),
        fixed: [],
        pool: solution.flat(),
        selected: null,
        hints: 0,
        mistakes: 0,
        feedback: null,
        elapsed: 0,
        startedAt: Date.now(),
        status: 'playing',
      },
    })

    const { container } = render(<GameBoard onBack={() => {}} />)
    const matrix = container.querySelector('.board-matrix')
    expect(container.querySelectorAll('.game-cell')).toHaveLength(size * size)
    expect(container.querySelectorAll('.row-sums span')).toHaveLength(size)
    expect(container.querySelectorAll('.column-sums span')).toHaveLength(size)
    expect(matrix.style.getPropertyValue('--n')).toBe(String(size))
    expect(Number.parseFloat(matrix.style.getPropertyValue('--board-min'))).toBeGreaterThan(0)
    expect(Number.parseFloat(matrix.style.getPropertyValue('--board-max'))).toBeGreaterThan(0)
    expect(matrix.getAttribute('dir')).toBe('ltr')
  })
})
