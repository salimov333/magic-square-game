import { isMagicSquare, magicConstant } from './generators'

export function isSolvedBoard(board, pool) {
  return pool.length === 0
    && board.every((row) => row.every(Number.isInteger))
    && isMagicSquare(board)
}

export function validateBoard(board, pool) {
  if (pool.length > 0 || board.some((row) => row.some((value) => !Number.isInteger(value)))) {
    return { complete: false, valid: false, invalidRows: [], invalidColumns: [], invalidDiagonals: [], total: 0 }
  }

  const target = magicConstant(board.length)
  const hasWrongSum = (values) => values.reduce((sum, value) => sum + value, 0) !== target
  const invalidRows = board.map((row, index) => hasWrongSum(row) ? index : null).filter(Number.isInteger)
  const invalidColumns = Array.from({ length: board.length }, (_, col) =>
    hasWrongSum(board.map((row) => row[col])) ? col : null).filter(Number.isInteger)
  const invalidDiagonals = [
    hasWrongSum(board.map((row, index) => row[index])) ? 'main' : null,
    hasWrongSum(board.map((row, index) => row[board.length - 1 - index])) ? 'secondary' : null,
  ].filter(Boolean)
  const total = invalidRows.length + invalidColumns.length + invalidDiagonals.length

  return { complete: true, valid: total === 0 && isMagicSquare(board), invalidRows, invalidColumns, invalidDiagonals, total }
}

export function currentElapsed(game, now = Date.now()) {
  if (!game) return 0
  if (game.status !== 'playing' || !game.startedAt) return game.elapsed
  return Math.max(game.elapsed, Math.floor((now - game.startedAt) / 1000))
}
