// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import App from './App'
import { MainMenu } from './components/MainMenu'
import { useGameStore } from './store/useGameStore'

afterEach(cleanup)

beforeEach(() => {
  localStorage.clear()
  useGameStore.setState({ language: 'de', profiles: [], activeProfileId: null, game: null })
})

describe('player entry flow', () => {
  it('asks for a username instead of entering with a default profile', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: 'Wer spielt?' })).not.toBeNull()
    expect(screen.queryByText('Spieler 1')).toBeNull()

    fireEvent.change(screen.getByPlaceholderText('Benutzername'), { target: { value: 'Salem' } })
    fireEvent.click(screen.getByRole('button', { name: 'Hinzufügen' }))

    expect(screen.getByRole('heading', { name: 'Magisches Quadrat' })).not.toBeNull()
    expect(screen.getByText('Was ist ein magisches Quadrat?')).not.toBeNull()
    expect(useGameStore.getState().profiles[0]).toMatchObject({ name: 'Salem', tutorialSeen: false })
  })

  it('opens the main menu when a saved player name is selected', () => {
    useGameStore.setState({
      profiles: [{ id: 'saved', name: 'Alice', completedSizes: [], highScores: {}, totalTime: 0, tutorialSeen: true }],
      activeProfileId: null,
    })
    render(<App />)
    fireEvent.click(screen.getByText('Alice').closest('button'))
    expect(screen.getByRole('heading', { name: 'Wähle deine Herausforderung' })).not.toBeNull()
  })
})

describe('main menu scores', () => {
  it('shows the sum of the best scores across all grid sizes', () => {
    useGameStore.setState({
      profiles: [{ id: 'saved', name: 'Alice', completedSizes: [3, 4], highScores: { 3: 2500, 4: 3600 }, totalTime: 90, tutorialSeen: true }],
      activeProfileId: 'saved',
    })
    render(<MainMenu onStart={() => {}} onSelectProfile={() => {}} onCreateProfile={() => {}} />)
    expect(screen.getByText('Gesamtpunktzahl')).not.toBeNull()
    expect(screen.getByText('6,100')).not.toBeNull()
  })
})
