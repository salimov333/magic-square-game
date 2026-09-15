import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useShallow } from 'zustand/react/shallow'
import { ArrowLeft, CheckCircle2, Eraser, Eye, Lightbulb, RotateCcw, Sparkles } from 'lucide-react'
import { useGameStore } from '../store/useGameStore'
import { useTranslation } from '../i18n'
import { magicConstant } from '../game/generators'
import { formatTime } from '../utils/format'
import { useTimer } from '../hooks/useTimer'
import { LanguageSwitcher } from './LanguageSwitcher'
import { Logo } from './Logo'

export function GameBoard({ onBack }) {
  const { t } = useTranslation()
  const game = useGameStore(useShallow((state) => state.game ? {
    size: state.game.size,
    solution: state.game.solution,
    board: state.game.board,
    fixed: state.game.fixed,
    pool: state.game.pool,
    selected: state.game.selected,
    hints: state.game.hints,
    mistakes: state.game.mistakes,
    feedback: state.game.feedback,
    status: state.game.status,
    score: state.game.score,
  } : null))
  const { selectNumber, placeNumber, clearCell, clearPrefilled, revealHint, consumeRuleHint, checkSolution, resetGame } = useGameStore(useShallow((state) => ({
    selectNumber: state.selectNumber,
    placeNumber: state.placeNumber,
    clearCell: state.clearCell,
    clearPrefilled: state.clearPrefilled,
    revealHint: state.revealHint,
    consumeRuleHint: state.consumeRuleHint,
    checkSolution: state.checkSolution,
    resetGame: state.resetGame,
  })))
  const [hintCell, setHintCell] = useState(null)
  const [ruleOpen, setRuleOpen] = useState(false)
  const fixedSet = useMemo(() => new Set(game?.fixed ?? []), [game?.fixed])
  const lineSums = useMemo(() => game?.board.map((row) => row.reduce((sum, value) => sum + (value || 0), 0)) ?? [], [game?.board])
  const columnSums = useMemo(() => game ? Array.from({ length: game.size }, (_, col) =>
    game.board.reduce((sum, row) => sum + (row[col] || 0), 0)) : [], [game])
  if (!game) return null
  const cellSize = `clamp(1.65rem, ${Math.min(8.5, 72 / game.size)}vw, ${game.size <= 5 ? 4.8 : 3.8}rem)`
  const ruleKey = game.size % 2 ? 'ruleOdd' : game.size % 4 === 0 ? 'ruleDoubly' : 'ruleSingly'
  const drop = (event, row, col) => { event.preventDefault(); const value = Number(event.dataTransfer.getData('text/plain')); placeNumber(row, col, value) }
  const cellClick = (row, col, fixed) => {
    if (fixed) clearCell(row, col)
    else if (game.selected != null) placeNumber(row, col)
    else if (game.board[row][col] != null) clearCell(row, col)
    setHintCell([row, col])
  }
  return <main className="game-screen">
    <header><button className="back-button" onClick={onBack}><ArrowLeft size={19} /> {t('back')}</button><div className="brand brand-centered"><Logo compact /><span>{t('title')}</span></div><LanguageSwitcher /></header>
    <section className="game-stats"><div><small>{game.size} × {game.size}</small><strong>{t('grid')}</strong></div><div className="magic-stat"><span>Σ</span><div><small>{t('magicSum')}</small><strong>{magicConstant(game.size)}</strong></div></div><TimerStat label={t('time')} active={game.status === 'playing'} /><div><small>{t('hints')}</small><strong>{game.hints}</strong></div><div><small>{t('mistakes')}</small><strong>{game.mistakes}</strong></div></section>
    <div className="game-layout">
      <section className="board-wrap">
        <div className="board-and-sums"><div className="game-grid" style={{ '--n': game.size, '--cell': cellSize }} dir="ltr">
          {game.board.map((row, r) => row.map((value, c) => {
            const fixed = fixedSet.has(r * game.size + c)
            const selectedForHint = hintCell?.[0] === r && hintCell?.[1] === c
            return <motion.button key={`${r}-${c}`} className={`game-cell ${fixed ? 'prefilled' : ''} ${selectedForHint ? 'hint-selected' : ''}`} onClick={() => cellClick(r, c, fixed)} onDragOver={(e) => e.preventDefault()} onDrop={(e) => drop(e, r, c)} whileTap={{ scale: .92 }} aria-label={`cell ${r + 1}, ${c + 1}${value == null ? '' : `: ${value}`}`}>{value}</motion.button>
          }))}</div><div className="row-sums">{lineSums.map((sum, i) => <span className={validationClass(game.feedback, 'invalidRows', i)} key={i}>{sum}</span>)}</div></div>
        <div className="column-sums" style={{ '--n': game.size, '--cell': cellSize }}>{columnSums.map((sum, i) => <span className={validationClass(game.feedback, 'invalidColumns', i)} key={i}>{sum}</span>)}</div>
      </section>
      <aside className="game-panel"><div className="panel-heading"><div><span className="eyebrow">{t('available')}</span><p>{t('tapHint')}</p></div><div className="panel-tools"><button className="icon-button" onClick={clearPrefilled} title={t('emptyBoard')} aria-label={t('emptyBoard')} disabled={game.fixed.length === 0}><Eraser size={18} /></button><button className="icon-button" onClick={resetGame} title={t('reset')} aria-label={t('reset')}><RotateCcw size={18} /></button></div></div>
        <div className="number-pool" dir="ltr">{game.pool.map((number) => <motion.button layout key={number} draggable onDragStart={(e) => e.dataTransfer.setData('text/plain', number)} onClick={() => selectNumber(number)} className={game.selected === number ? 'selected' : ''}>{number}</motion.button>)}</div>
        <button className="primary-button check-button" onClick={checkSolution}><CheckCircle2 size={19} /> {t('check')}</button>
        <ValidationFeedback feedback={game.feedback} t={t} />
        <div className="hint-actions"><button onClick={() => revealHint(hintCell?.[0], hintCell?.[1])}><Eye size={18} /><span><strong>{t('reveal')}</strong><small>−300</small></span></button><button onClick={() => { consumeRuleHint(); setRuleOpen(true) }}><Lightbulb size={18} /><span><strong>{t('rule')}</strong><small>−300</small></span></button></div>
      </aside>
    </div>
    <AnimatePresence>{ruleOpen && <div className="modal-backdrop" onMouseDown={() => setRuleOpen(false)}><motion.div className="rule-modal" initial={{ scale: .95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(e) => e.stopPropagation()}><span className="rule-icon"><Lightbulb /></span><h2>{t('ruleTitle')}</h2><p>{t(ruleKey)}</p><button className="primary-button" onClick={() => setRuleOpen(false)}>{t('next')}</button></motion.div></div>}</AnimatePresence>
    {game.status === 'won' && <Victory t={t} game={game} onAgain={resetGame} onMenu={onBack} />}
  </main>
}

function validationClass(feedback, field, index) {
  if (feedback?.type !== 'invalid') return ''
  return feedback[field].includes(index) ? 'invalid' : 'valid'
}

function ValidationFeedback({ feedback, t }) {
  if (!feedback) return null
  if (feedback.type === 'incomplete') return <p className="validation-feedback incomplete" role="status">{t('fillAll')}</p>
  if (feedback.type !== 'invalid') return null
  return <div className="validation-feedback invalid" role="status" aria-live="polite">
    <strong>{t('checkFailed')}</strong>
    <span>{t('invalidRows')}: {feedback.invalidRows.length}</span>
    <span>{t('invalidColumns')}: {feedback.invalidColumns.length}</span>
    <span>{t('invalidDiagonals')}: {feedback.invalidDiagonals.length}</span>
  </div>
}

function TimerStat({ label, active }) {
  const elapsed = useGameStore((state) => state.game?.elapsed ?? 0)
  useTimer(active)
  return <div><small>{label}</small><strong>{formatTime(elapsed)}</strong></div>
}

function Victory({ t, game, onAgain, onMenu }) {
  return <div className="modal-backdrop victory-backdrop"><div className="confetti" aria-hidden="true">{Array.from({ length: 28 }, (_, i) => <i key={i} style={{ '--i': i, '--x': `${(i * 37) % 100}%` }} />)}</div><motion.section className="victory-card" initial={{ scale: .75, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring' }}><motion.div className="victory-icon" animate={{ rotate: [0, -8, 8, 0] }}><Sparkles /></motion.div><span className="eyebrow">{game.size} × {game.size}</span><h1>{t('victory')}</h1><p>{t('victoryText')}</p><div className="score-box"><small>{t('score')}</small><strong>{game.score.toLocaleString()}</strong><span>{t('formula')}</span></div><div className="victory-actions"><button className="primary-button" onClick={onAgain}>{t('playAgain')}</button><button className="secondary-button" onClick={onMenu}>{t('mainMenu')}</button></div></motion.section></div>
}
