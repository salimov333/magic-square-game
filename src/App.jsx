import { useEffect, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Intro } from './components/Intro'
import { Tutorial } from './components/Tutorial'
import { MainMenu } from './components/MainMenu'
import { GameBoard } from './components/GameBoard'
import { useGameStore } from './store/useGameStore'

export default function App() {
  const tutorialSeen = useGameStore((state) => state.tutorialSeen)
  const finishTutorial = useGameStore((state) => state.finishTutorial)
  const startGame = useGameStore((state) => state.startGame)
  const leaveGame = useGameStore((state) => state.leaveGame)
  const language = useGameStore((state) => state.language)
  const profiles = useGameStore((state) => state.profiles)
  const activeProfileId = useGameStore((state) => state.activeProfileId)
  const selectProfile = useGameStore((state) => state.selectProfile)
  const [screen, setScreen] = useState(tutorialSeen ? 'menu' : 'intro')

  useEffect(() => {
    document.documentElement.lang = language
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr'
  }, [language])
  useEffect(() => { if (!activeProfileId && profiles[0]) selectProfile(profiles[0].id) }, [activeProfileId, profiles, selectProfile])

  const enterMenu = () => { finishTutorial(); leaveGame(); setScreen('menu') }
  const play = (size) => { startGame(size); setScreen('game') }
  return <AnimatePresence mode="wait">
    {screen === 'intro' && <Intro key="intro" onContinue={() => setScreen('tutorial')} onSkip={enterMenu} />}
    {screen === 'tutorial' && <Tutorial key="tutorial" onStart={enterMenu} onSkip={enterMenu} />}
    {screen === 'menu' && <MainMenu key="menu" onStart={play} />}
    {screen === 'game' && <GameBoard key="game" onBack={enterMenu} />}
  </AnimatePresence>
}
