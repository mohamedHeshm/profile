import type { PointerEvent } from 'react'
import { Link } from 'react-router-dom'
import { projectPath } from '../../lib/projects'
import type { Project } from '../../types'
import { SectionHead } from './Sections'

export type ProjectCard = Pick<Project, 'id' | 'slug' | 'title' | 'summary' | 'image_url' | 'technologies' | 'github_url' | 'live_url' | 'featured' | 'category' | 'role' | 'year'>
export const CARD_COLS = 'id,slug,title,summary,image_url,technologies,github_url,live_url,featured,category,role,year'

const track = (e: PointerEvent<HTMLElement>) => {
  const r = e.currentTarget.getBoundingClientRect()
  e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`)
  e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`)
}

export default function Work({ projects }: { projects: ProjectCard[] }) {
  const sorted = [...projects].sort((a, b) => Number(b.featured) - Number(a.featured))
  return (
    <section id="work" className="sec">
      <SectionHead kicker="Selected work" title="Projects" />
      {sorted.map((p, i) => (
        <article key={p.id} className={`case l${i % 4} reveal`}>
          <Link to={projectPath(p)} className="shot" onPointerMove={track} aria-label={`Open case study: ${p.title}`}>
            <span className="chrome" aria-hidden="true"><i /><i /><i /></span>
            {p.image_url ? <img src={p.image_url} alt={`${p.title} screenshot`} width={1600} height={1000} loading={i === 0 ? 'eager' : 'lazy'} decoding="async" /> : <span className="shot-empty">{p.title}</span>}
            <span className="num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
          </Link>
          <div className="case-body">
            <p className="kicker">{[p.category, p.year].filter(Boolean).join(' / ') || 'Project'}</p>
            <h3><Link to={projectPath(p)}>{p.title}</Link></h3>
            {p.summary && <p>{p.summary}</p>}
            {p.role && <p className="role-line">Role: {p.role}</p>}
            {p.technologies.length > 0 && <ul className="tags">{p.technologies.map((t) => <li key={t}>{t}</li>)}</ul>}
            <p className="case-links">
              <Link to={projectPath(p)}>Case study</Link>
              {p.live_url && <a href={p.live_url} target="_blank" rel="noreferrer noopener">Live demo</a>}
              {p.github_url && <a href={p.github_url} target="_blank" rel="noreferrer noopener">Source code</a>}
            </p>
          </div>
        </article>
      ))}
    </section>
  )
}
