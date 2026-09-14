import { isMagicSquare, magicConstant } from './generators'

export function isSolvedBoard(board, pool) {
  return pool.length === 0
    && board.every((row) => row.every(Number.isInteger))
    && isMagicSquare(board)
}

export function placementCreatesMistake(board, row, col) {
  const target = magicConstant(board.length)
  const isInvalidCompleteLine = (values) => values.every(Number.isInteger)
    && values.reduce((sum, value) => sum + value, 0) !== target

  if (isInvalidCompleteLine(board[row])) return true
  if (isInvalidCompleteLine(board.map((line) => line[col]))) return true
  if (row === col && isInvalidCompleteLine(board.map((line, index) => line[index]))) return true
  if (row + col === board.length - 1
    && isInvalidCompleteLine(board.map((line, index) => line[board.length - 1 - index]))) return true
  return false
}

export function currentElapsed(game, now = Date.now()) {
  if (!game) return 0
  if (game.status !== 'playing' || !game.startedAt) return game.elapsed
  return Math.max(game.elapsed, Math.floor((now - game.startedAt) / 1000))
}
