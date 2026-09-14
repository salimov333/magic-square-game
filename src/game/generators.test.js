import { describe, expect, it } from 'vitest'
import { generateMagicSquare, isMagicSquare, magicConstant } from './generators'

describe('magic square generators', () => {
  for (let size = 3; size <= 12; size += 1) {
    it(`creates a valid ${size}x${size} normal magic square`, () => {
      const square = generateMagicSquare(size)
      const values = square.flat().sort((a, b) => a - b)
      expect(values).toEqual(Array.from({ length: size * size }, (_, index) => index + 1))
      expect(isMagicSquare(square)).toBe(true)
      expect(square[0].reduce((sum, value) => sum + value, 0)).toBe(magicConstant(size))
    })
  }
})
