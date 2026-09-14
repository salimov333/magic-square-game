import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Sparkles } from 'lucide-react'
import { LanguageSwitcher } from './LanguageSwitcher'
import { Logo } from './Logo'
import { useTranslation } from '../i18n'

export function Tutorial({ onStart, onSkip }) {
  const { t } = useTranslation()
  const [placed, setPlaced] = useState(false)
  const complete = () => setPlaced(true)
  const demo = [8, 1, 6, 3, 5, 7, 4, 9, placed ? 2 : null]
  return (
    <main className="tutorial-screen">
      <header><div className="brand"><Logo compact /><span>{t('title')}</span></div><div className="top-actions"><LanguageSwitcher /><button className="text-button" onClick={onSkip}>{t('skip')}</button></div></header>
      <section className="tutorial-card">
        <div className="tutorial-copy"><span className="step-pill">01</span><h1>{t('tutorialTitle')}</h1><p>{t('tutorialText')}</p><div className="target"><span>Σ</span><div><small>{t('magicSum')}</small><strong>15</strong></div></div></div>
        <div className="demo-area">
          <motion.div className={`demo-grid ${placed ? 'solved' : ''}`} animate={placed ? { scale: [1, 1.03, 1] } : {}}>
            {demo.map((value, index) => <div key={index} className={`demo-cell ${value ? '' : 'empty'}`} onDragOver={(e) => e.preventDefault()} onDrop={complete} onClick={!value ? complete : undefined}>{value || <span>{t('dragHere')}</span>}</div>)}
          </motion.div>
          {!placed ? <motion.button draggable onDragEnd={complete} onClick={complete} className="number-token" animate={{ y: [0, -7, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>2</motion.button> : <motion.div className="success-note" initial={{ scale: 0 }} animate={{ scale: 1 }}><Check size={18} /> {t('tutorialDone')} <Sparkles size={17} /></motion.div>}
        </div>
      </section>
      <button className="primary-button tutorial-start" onClick={onStart} disabled={!placed}>{t('start')} <span>→</span></button>
    </main>
  )
}
