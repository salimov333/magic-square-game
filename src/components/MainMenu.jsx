import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronRight, Trophy, UserRound } from 'lucide-react'
import { Logo } from './Logo'
import { LanguageSwitcher } from './LanguageSwitcher'
import { ProfileModal } from './ProfileModal'
import { useGameStore } from '../store/useGameStore'
import { useTranslation } from '../i18n'

const difficulty = (n) => n <= 4 ? 'easy' : n <= 7 ? 'medium' : n <= 9 ? 'hard' : 'expert'

export function MainMenu({ onStart }) {
  const { t } = useTranslation()
  const [profilesOpen, setProfilesOpen] = useState(false)
  const profiles = useGameStore((state) => state.profiles)
  const activeId = useGameStore((state) => state.activeProfileId)
  const active = profiles.find((p) => p.id === activeId) || profiles[0]
  const completion = Math.round((active.completedSizes.length / 10) * 100)
  return <main className="menu-screen">
    <header><div className="brand"><Logo compact /><span>{t('title')}</span></div><div className="top-actions"><LanguageSwitcher /><button className="profile-button" onClick={() => setProfilesOpen(true)}><span className="avatar"><UserRound size={17} /></span>{active.name}<ChevronRight size={15} /></button></div></header>
    <section className="menu-hero"><div><p className="eyebrow">{t('menuGreeting')}, {active.name}</p><h1>{t('chooseSize')}</h1><p>{t('chooseSizeHint')}</p></div><div className="progress-card"><div className="progress-ring" style={{ '--progress': `${completion * 3.6}deg` }}><span>{completion}%</span></div><div><small>{t('progress')}</small><strong>{active.completedSizes.length} / 10</strong><span>{t('completed')}</span></div></div></section>
    <section className="size-grid">{Array.from({ length: 10 }, (_, i) => i + 3).map((size, index) => {
      const best = active.highScores[size]
      const done = active.completedSizes.includes(size)
      return <motion.button className={`size-card ${done ? 'done' : ''}`} key={size} onClick={() => onStart(size)} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * .035 }} whileHover={{ y: -4 }}>
        <div className="card-top"><span className={`difficulty ${difficulty(size)}`}>{t(difficulty(size))}</span>{done && <Trophy size={17} />}</div><div className="size-number"><strong>{size}</strong><span>×</span><strong>{size}</strong></div><span className="grid-label">{t('grid')}</span><div className="card-footer"><span>{best ? `${t('best')}: ${best}` : t('notPlayed')}</span><ChevronRight size={18} /></div>
      </motion.button>
    })}</section>
    <footer>SIAM · STRACHEY · DIAGONAL INVERSION</footer>
    {profilesOpen && <ProfileModal onClose={() => setProfilesOpen(false)} />}
  </main>
}
