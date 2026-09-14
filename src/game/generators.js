/** Generate a normal magic square for every valid size from 3 onward. */
export function generateMagicSquare(n) {
  if (!Number.isInteger(n) || n < 3) throw new Error('Size must be an integer of at least 3')
  if (n % 2 === 1) return generateOdd(n)
  if (n % 4 === 0) return generateDoublyEven(n)
  return generateSinglyEven(n)
}

// Siamese method: move up/right, wrapping around; move down when occupied.
export function generateOdd(n) {
  const square = Array.from({ length: n }, () => Array(n).fill(0))
  let row = 0
  let col = Math.floor(n / 2)

  for (let value = 1; value <= n * n; value += 1) {
    square[row][col] = value
    const nextRow = (row - 1 + n) % n
    const nextCol = (col + 1) % n
    if (square[nextRow][nextCol]) row = (row + 1) % n
    else { row = nextRow; col = nextCol }
  }
  return square
}

// Fill in order, then complement cells outside the 4x4 diagonal pattern.
export function generateDoublyEven(n) {
  const max = n * n + 1
  return Array.from({ length: n }, (_, row) =>
    Array.from({ length: n }, (_, col) => {
      const value = row * n + col + 1
      const keep = row % 4 === col % 4 || (row % 4) + (col % 4) === 3
      return keep ? value : max - value
    }),
  )
}

// Strachey construction: four odd sub-squares plus prescribed column swaps.
export function generateSinglyEven(n) {
  const half = n / 2
  const sub = generateOdd(half)
  const quadrant = half * half
  const square = Array.from({ length: n }, () => Array(n).fill(0))

  for (let row = 0; row < half; row += 1) {
    for (let col = 0; col < half; col += 1) {
      const value = sub[row][col]
      square[row][col] = value
      square[row][col + half] = value + 2 * quadrant
      square[row + half][col] = value + 3 * quadrant
      square[row + half][col + half] = value + quadrant
    }
  }

  const leftColumns = (half - 1) / 2
  const rightColumns = leftColumns - 1
  for (let row = 0; row < half; row += 1) {
    for (let col = 0; col < leftColumns; col += 1) swap(square, row, col, row + half, col)
    for (let col = n - rightColumns; col < n; col += 1) swap(square, row, col, row + half, col)
  }

  const middle = Math.floor(half / 2)
  swap(square, middle, 0, middle + half, 0)
  swap(square, middle, middle, middle + half, middle)
  return square
}

function swap(square, rowA, colA, rowB, colB) {
  ;[square[rowA][colA], square[rowB][colB]] = [square[rowB][colB], square[rowA][colA]]
}

export const magicConstant = (n) => (n * (n * n + 1)) / 2

export function isMagicSquare(square) {
  const n = square.length
  const target = magicConstant(n)
  const rows = square.every((row) => row.reduce((sum, value) => sum + value, 0) === target)
  const cols = Array.from({ length: n }, (_, col) => square.reduce((sum, row) => sum + row[col], 0)).every((sum) => sum === target)
  const diagonalA = square.reduce((sum, row, i) => sum + row[i], 0)
  const diagonalB = square.reduce((sum, row, i) => sum + row[n - 1 - i], 0)
  return rows && cols && diagonalA === target && diagonalB === target
}

export function createPuzzle(n, revealRatio = 0.32) {
  const solution = generateMagicSquare(n)
  const total = n * n
  const fixedCount = Math.max(n, Math.floor(total * revealRatio))
  const indices = shuffle(Array.from({ length: total }, (_, index) => index)).slice(0, fixedCount)
  const fixed = new Set(indices)
  const board = solution.map((row, r) => row.map((value, c) => fixed.has(r * n + c) ? value : null))
  const pool = shuffle(solution.flat().filter((_, index) => !fixed.has(index)))
  return { solution, board, fixed: [...fixed], pool }
}

export function shuffle(items) {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}
