import { useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react'
import { Link } from 'react-router-dom'
import { projectPath } from '../../lib/projects'
import type { Project } from '../../types'

export type ProjectCard = Pick<Project, 'id' | 'slug' | 'title' | 'summary' | 'image_url' | 'technologies' | 'github_url' | 'live_url' | 'featured' | 'category' | 'role' | 'year'>
export const CARD_COLS = 'id,slug,title,summary,image_url,technologies,github_url,live_url,featured,category,role,year'

export default function Work({ projects }: { projects: ProjectCard[] }) {
  const list = [...projects].sort((a, b) => Number(b.featured) - Number(a.featured))
  const n = list.length
  const [active, setActive] = useState(0)
  const startX = useRef(0)
  const swiped = useRef(false)
  const go = (i: number) => setActive(Math.max(0, Math.min(n - 1, i)))
  const cur = list[Math.min(active, n - 1)]
  const techs = [...new Set(list.flatMap((p) => p.technologies))].slice(0, 3).join(' / ')

  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); go(active + 1) }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); go(active - 1) }
    else if (e.key === 'Home') go(0)
    else if (e.key === 'End') go(n - 1)
  }
  const down = (e: PointerEvent) => { startX.current = e.clientX; swiped.current = false }
  const up = (e: PointerEvent) => {
    const d = e.clientX - startX.current
    if (Math.abs(d) > 50) { swiped.current = true; go(active + (d < 0 ? 1 : -1)) }
  }

  return (
    <section id="work" className="sec" aria-labelledby="work-title">
      <header className="pc-head reveal">
        <div><p className="kicker">Featured work</p><h2 id="work-title">Selected <em>Projects</em></h2></div>
        <p className="pc-meta">{n} {n === 1 ? 'project' : 'projects'}{techs && ` · ${techs}`}</p>
      </header>
      <div className="pc reveal" role="region" aria-roledescription="carousel" aria-label="Selected projects">
        <div className="pc-stage" tabIndex={0} onKeyDown={onKey} onPointerDown={down} onPointerUp={up}>
          {list.map((p, i) => {
            const o = i - active
            const a = Math.abs(o)
            const on = o === 0
            const face = (
              <>
                <span className="chrome" aria-hidden="true"><i /><i /><i /></span>
                {p.image_url ? <img src={p.image_url} alt={on ? `${p.title} screenshot` : ''} width={1600} height={1000} loading={a < 2 ? 'eager' : 'lazy'} decoding="async" draggable={false} /> : <span className="shot-empty">{p.title}</span>}
              </>
            )
            return (
              <div key={p.id} role="group" aria-roledescription="slide" aria-label={`${i + 1} of ${n}`} aria-hidden={a > 2 || undefined}
                className={`pc-card${on ? ' on' : ''}`} data-far={a > 2 || undefined} style={{ '--o': o, '--a': a } as CSSProperties}>
                {on
                  ? <Link to={projectPath(p)} className="pc-shot" onClick={(e) => { if (swiped.current) e.preventDefault() }}>{face}<span className="pc-pill">View project</span></Link>
                  : <button type="button" className="pc-shot" tabIndex={a > 2 ? -1 : 0} aria-label={`Show project: ${p.title}`} onClick={() => { if (!swiped.current) go(i) }}>{face}</button>}
                <div className="pc-cap"><p className="kicker">{String(i + 1).padStart(2, '0')} / {p.category || 'Project'}</p><h3>{p.title}</h3></div>
              </div>
            )
          })}
        </div>
        {n > 1 && (
          <div className="pc-dots" role="group" aria-label="Choose a project">
            {list.map((p, i) => <button key={p.id} type="button" className="pc-dot" aria-label={`Show project: ${p.title}`} aria-current={i === active} onClick={() => go(i)} />)}
          </div>
        )}
        {n > 1 && (
          <div className="pc-nav">
            <button type="button" className="btn small" onClick={() => go(active - 1)} disabled={active === 0} aria-label="Previous project">←</button>
            <span className="mono">{String(active + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}</span>
            <button type="button" className="btn small" onClick={() => go(active + 1)} disabled={active === n - 1} aria-label="Next project">→</button>
          </div>
        )}
        {cur && (
          <div className="pc-info" aria-live="polite">
            {cur.summary && <p>{cur.summary}</p>}
            {(cur.year || cur.role) && <p className="role-line">{[cur.year, cur.role].filter(Boolean).join(' · ')}</p>}
            {cur.technologies.length > 0 && <ul className="tags">{cur.technologies.map((t) => <li key={t}>{t}</li>)}</ul>}
            <p className="case-links">
              <Link to={projectPath(cur)}>Case study</Link>
              {cur.live_url && <a href={cur.live_url} target="_blank" rel="noreferrer noopener">Live demo</a>}
              {cur.github_url && <a href={cur.github_url} target="_blank" rel="noreferrer noopener">Source code</a>}
            </p>
          </div>
        )}
      </div>
    </section>
  )
}