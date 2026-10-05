import { useEffect, useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { projectPath } from '../../lib/projects'
import type { ProjectCard } from './Work'

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** Hero visual: the owner's real projects in a browser frame, advancing gently every few seconds. */
export default function HeroShowcase({ projects }: { projects: ProjectCard[] }) {
  const list = [...projects].sort((a, b) => Number(b.featured) - Number(a.featured)).slice(0, 6)
  const n = list.length
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const [engaged, setEngaged] = useState(false)
  const [reduce] = useState(prefersReducedMotion)

  useEffect(() => {
    if (reduce || paused || engaged || n < 2) return
    const t = window.setInterval(() => setActive((a) => (a + 1) % n), 5200)
    return () => window.clearInterval(t)
  }, [reduce, paused, engaged, n])

  if (n === 0) return null
  const cur = list[Math.min(active, n - 1)]
  return (
    <div className="showcase" role="region" aria-roledescription="carousel" aria-label="Featured projects"
      onPointerEnter={() => setEngaged(true)} onPointerLeave={() => setEngaged(false)} onFocus={() => setEngaged(true)} onBlur={() => setEngaged(false)}>
      <p className="sc-label"><span>{cur.featured ? 'Featured project' : 'Selected work'}</span><span>{String(active + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}</span></p>
      <div className="sc-stage">
        {list.map((p, i) => {
          const o = (i - active + n) % n
          const front = o === 0
          return (
            <div key={p.id} className="sc-slide" data-hidden={o > 1 || undefined} aria-hidden={!front} style={{ '--o': Math.min(o, 2) } as CSSProperties}>
              <div className="sc-float">
                <Link to={projectPath(p)} className="sc-link" tabIndex={front ? 0 : -1}>
                  <span className="chrome" aria-hidden="true"><i /><i /><i /></span>
                  {p.image_url ? <img src={p.image_url} alt={front ? `${p.title} screenshot` : ''} width={1600} height={1000} loading={i < 2 ? 'eager' : 'lazy'} decoding="async" /> : <span className="shot-empty">{p.title}</span>}
                  <span className="sc-cap">
                    <span><span className="sc-title">{p.title}</span>{p.category && <span className="sc-cat">{p.category}</span>}</span>
                    {p.technologies.length > 0 && <span className="sc-tags">{p.technologies.slice(0, 3).map((t) => <span key={t}>{t}</span>)}</span>}
                  </span>
                </Link>
              </div>
            </div>
          )
        })}
      </div>
      {n > 1 && (
        <div className="sc-ctrl">
          {list.map((p, i) => <button key={p.id} type="button" className="sc-dot" aria-label={`Show project: ${p.title}`} aria-current={i === active} onClick={() => setActive(i)} />)}
          {!reduce && <button type="button" className="link sc-pause" aria-pressed={paused} onClick={() => setPaused(!paused)}>{paused ? 'Play' : 'Pause'}</button>}
        </div>
      )}
    </div>
  )
}
