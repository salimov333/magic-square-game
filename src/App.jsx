import { useEffect, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Intro } from './components/Intro'
import { Tutorial } from './components/Tutorial'
import { MainMenu } from './components/MainMenu'
import { GameBoard } from './components/GameBoard'
import { ProfileModal } from './components/ProfileModal'
import { useGameStore } from './store/useGameStore'

export default function App() {
  const finishTutorial = useGameStore((state) => state.finishTutorial)
  const addProfile = useGameStore((state) => state.addProfile)
  const startGame = useGameStore((state) => state.startGame)
  const leaveGame = useGameStore((state) => state.leaveGame)
  const language = useGameStore((state) => state.language)
  const profiles = useGameStore((state) => state.profiles)
  const selectProfile = useGameStore((state) => state.selectProfile)
  const [screen, setScreen] = useState('profiles')

  useEffect(() => {
    document.documentElement.lang = language
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr'
  }, [language])

  const enterMenu = () => { finishTutorial(); leaveGame(); setScreen('menu') }
  const enterProfile = (id) => {
    const profile = profiles.find((item) => item.id === id)
    selectProfile(id)
    setScreen(profile?.tutorialSeen ? 'menu' : 'intro')
  }
  const createProfile = (name) => {
    addProfile(name)
    setScreen('intro')
  }
  const play = (size) => { startGame(size); setScreen('game') }
  return <AnimatePresence mode="wait">
    {screen === 'profiles' && <ProfileModal key="profiles" required onSelect={enterProfile} onCreate={createProfile} />}
    {screen === 'intro' && <Intro key="intro" onContinue={() => setScreen('tutorial')} onSkip={enterMenu} />}
    {screen === 'tutorial' && <Tutorial key="tutorial" onStart={enterMenu} onSkip={enterMenu} />}
    {screen === 'menu' && <MainMenu key="menu" onStart={play} onSelectProfile={enterProfile} onCreateProfile={createProfile} />}
    {screen === 'game' && <GameBoard key="game" onBack={enterMenu} />}
  </AnimatePresence>
}
