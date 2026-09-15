// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { ProfileModal } from './ProfileModal'
import { useGameStore } from '../store/useGameStore'

afterEach(cleanup)

beforeEach(() => {
  useGameStore.setState({
    language: 'de',
    profiles: [
      { id: 'one', name: 'Alice', completedSizes: [], highScores: {}, totalTime: 0, tutorialSeen: true },
      { id: 'two', name: 'Bob', completedSizes: [], highScores: {}, totalTime: 0, tutorialSeen: true },
    ],
    activeProfileId: 'one',
  })
})

describe('ProfileModal', () => {
  it('requires explicit confirmation before deleting a player', () => {
    render(<ProfileModal onClose={() => {}} />)

    fireEvent.click(screen.getByRole('button', { name: 'Löschen: Bob' }))
    expect(screen.getByRole('alertdialog')).not.toBeNull()
    expect(useGameStore.getState().profiles).toHaveLength(2)

    fireEvent.click(screen.getByRole('button', { name: 'Ja, löschen' }))
    expect(useGameStore.getState().profiles.map((profile) => profile.name)).toEqual(['Alice'])
  })

  it('keeps the player when deletion is cancelled', () => {
    render(<ProfileModal onClose={() => {}} />)
    fireEvent.click(screen.getByRole('button', { name: 'Löschen: Bob' }))
    fireEvent.click(screen.getAllByRole('button', { name: 'Abbrechen' }).at(-1))
    expect(useGameStore.getState().profiles).toHaveLength(2)
  })
})
