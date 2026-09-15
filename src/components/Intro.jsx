import { motion } from 'framer-motion'
import { Logo } from './Logo'
import { LanguageSwitcher } from './LanguageSwitcher'
import { useTranslation } from '../i18n'

export function Intro({ onContinue, onSkip }) {
  const { t } = useTranslation()
  return (
    <motion.main className="intro-screen" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="top-actions"><LanguageSwitcher /><button className="text-button" onClick={onSkip}>{t('skip')}</button></div>
      <div className="ambient ambient-one" /><div className="ambient ambient-two" />
      <motion.div className="intro-content" initial={{ y: 24 }} animate={{ y: 0 }} transition={{ duration: .8 }}>
        <div className="intro-description"><strong>{t('magicSquareDefinitionTitle')}</strong><p>{t('magicSquareDefinition')}</p></div>
        <motion.div className="intro-logo" animate={{ rotate: [0, 3, -3, 0] }} transition={{ delay: .6, duration: 1.2 }}><Logo /></motion.div>
        <p className="eyebrow">LOGIC · FOCUS · BALANCE</p>
        <h1>{t('title')}</h1><p className="lead">{t('tagline')}</p>
        <button className="primary-button" onClick={onContinue}>{t('next')} <span>→</span></button>
      </motion.div>
    </motion.main>
  )
}
