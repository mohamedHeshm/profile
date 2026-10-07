import { useSyncExternalStore } from 'react'

/** Subscribes to a media query; re-renders only when it flips (never per frame). */
export function useMedia(query: string) {
  return useSyncExternalStore(
    (cb) => { const m = window.matchMedia(query); m.addEventListener('change', cb); return () => m.removeEventListener('change', cb) },
    () => window.matchMedia(query).matches,
    () => false,
  )
}