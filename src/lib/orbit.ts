const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

/** One-time intro: cards circle a point, then settle into their grid slots. Transform and opacity only. */
export function playOrbit(box: HTMLElement) {
  const cards = [...box.querySelectorAll<HTMLElement>('.pcard')]
  const b = box.getBoundingClientRect()
  const cx = b.left + b.width / 2
  const cy = Math.min(Math.max(b.top + b.height / 2, window.innerHeight * 0.4), window.innerHeight * 0.62)
  const R = Math.min(b.width * 0.3, 320)
  const N = 36
  cards.forEach((el, i) => {
    const r = el.getBoundingClientRect()
    const px = r.left + r.width / 2
    const py = r.top + r.height / 2
    const base = (i / cards.length) * Math.PI * 2 - Math.PI / 2
    const frames: Keyframe[] = []
    for (let k = 0; k <= N; k++) {
      const t = k / N
      const ang = base + ease(Math.min(t / 0.62, 1)) * Math.PI
      const e = 1 - Math.pow(1 - Math.max((t - 0.62) / 0.38, 0), 3)
      const ox = cx + Math.cos(ang) * R
      const oy = cy + Math.sin(ang) * R
      const s = 0.5 + 0.5 * Math.min(1, t / 0.7)
      frames.push({ transform: `translate(${(ox + (px - ox) * e - px).toFixed(1)}px, ${(oy + (py - oy) * e - py).toFixed(1)}px) scale(${s.toFixed(3)})`, opacity: Math.min(1, t * 5), offset: t })
    }
    el.animate(frames, { duration: 1900, delay: i * 45, easing: 'linear', fill: 'backwards' })
  })
}
