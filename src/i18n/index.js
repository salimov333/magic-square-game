import de from './de.json'
import en from './en.json'
import ar from './ar.json'
import { useGameStore } from '../store/useGameStore'

const dictionaries = { de, en, ar }

export function useTranslation() {
  const language = useGameStore((state) => state.language)
  return { language, t: (key) => dictionaries[language]?.[key] ?? key }
}
