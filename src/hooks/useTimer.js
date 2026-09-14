import { useEffect } from 'react'
import { useGameStore } from '../store/useGameStore'

export function useTimer(active) {
  const tick = useGameStore((state) => state.tick)
  useEffect(() => {
    if (!active) return undefined
    const timer = window.setInterval(tick, 1000)
    return () => window.clearInterval(timer)
  }, [active, tick])
}
