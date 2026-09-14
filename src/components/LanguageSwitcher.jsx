import { Languages } from 'lucide-react'
import { useGameStore } from '../store/useGameStore'
import { useTranslation } from '../i18n'

export function LanguageSwitcher() {
  const { language, t } = useTranslation()
  const setLanguage = useGameStore((state) => state.setLanguage)
  return (
    <label className="language-switcher" aria-label={t('language')}>
      <Languages size={17} />
      <select value={language} onChange={(event) => setLanguage(event.target.value)}>
        <option value="de">DE</option><option value="en">EN</option><option value="ar">AR</option>
      </select>
    </label>
  )
}
