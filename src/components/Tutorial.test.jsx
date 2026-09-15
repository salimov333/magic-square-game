// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { Tutorial } from './Tutorial'
import { useGameStore } from '../store/useGameStore'

afterEach(cleanup)

describe('Tutorial', () => {
  it('enables start only after checking the demo', () => {
    useGameStore.setState({ language: 'de' })
    const onStart = vi.fn()
    render(<Tutorial onStart={onStart} onSkip={() => {}} />)

    expect(screen.getByRole('button', { name: /^Spiel starten/ }).disabled).toBe(true)
    fireEvent.click(screen.getByText('Hierher ziehen'))
    fireEvent.click(screen.getByRole('button', { name: 'Quadrat prüfen' }))
    expect(screen.getByRole('button', { name: /^Spiel starten/ }).disabled).toBe(false)
  })
})
