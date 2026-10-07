// Subtle magnetic pull (max 5px) on key CTAs. Mouse only; skipped on touch and for reduced motion.
const SELECTOR = '.hero .btn, .pbtn, .cs-head .btn'
const MAX = 5

export function initMagnetic() {
  if (!window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)').matches) return
  const active = new Set<HTMLElement>()
  let raf = 0
  let x = 0
  let y = 0
  const frame = () => {
    raf = 0
    document.querySelectorAll<HTMLElement>(SELECTOR).forEach((el) => {
      const r = el.getBoundingClientRect()
      const dx = x - (r.left + r.width / 2)
      const dy = y - (r.top + r.height / 2)
      const reach = Math.max(r.width, r.height) / 2 + 36
      if (Math.hypot(dx, dy) < reach) {
        const k = (MAX / reach) * 1.3
        el.style.setProperty('--mx', `${Math.max(-MAX, Math.min(MAX, dx * k)).toFixed(1)}px`)
        el.style.setProperty('--my', `${Math.max(-MAX, Math.min(MAX, dy * k)).toFixed(1)}px`)
        active.add(el)
      } else if (active.delete(el)) {
        el.style.removeProperty('--mx')
        el.style.removeProperty('--my')
      }
    })
  }
  document.addEventListener('pointermove', (e) => { x = e.clientX; y = e.clientY; if (!raf) raf = requestAnimationFrame(frame) }, { passive: true })
}