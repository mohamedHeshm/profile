import { Link } from 'react-router-dom'
import { projectPath } from '../../lib/projects'
import type { Project } from '../../types'
import { SectionHead } from './Sections'

export type ProjectCard = Pick<Project, 'id' | 'slug' | 'title' | 'summary' | 'image_url' | 'technologies' | 'github_url' | 'live_url' | 'featured' | 'category'>
export const CARD_COLS = 'id,slug,title,summary,image_url,technologies,github_url,live_url,featured,category'

export default function Work({ projects }: { projects: ProjectCard[] }) {
  const sorted = [...projects].sort((a, b) => Number(b.featured) - Number(a.featured))
  return (
    <section id="work" className="sec">
      <SectionHead kicker="Projects" title="Selected work" />
      {sorted.map((p, i) => (
        <article key={p.id} className={`case reveal${i === 0 ? ' lead-case' : ''}${i % 2 ? ' flip' : ''}`}>
          <Link to={projectPath(p)} className="shot" aria-label={`Open case study: ${p.title}`}>
            <span className="chrome" aria-hidden="true"><i /><i /><i /></span>
            {p.image_url ? <img src={p.image_url} alt={`${p.title} screenshot`} width={1600} height={1000} loading={i === 0 ? 'eager' : 'lazy'} decoding="async" /> : <span className="shot-empty">{p.title}</span>}
          </Link>
          <div className="case-body">
            <p className="kicker">{String(i + 1).padStart(2, '0')}{p.category && ` / ${p.category}`}</p>
            <h3><Link to={projectPath(p)}>{p.title}</Link></h3>
            {p.summary && <p>{p.summary}</p>}
            {p.technologies.length > 0 && <ul className="tags">{p.technologies.map((t) => <li key={t}>{t}</li>)}</ul>}
            <p className="case-links">
              <Link to={projectPath(p)}>View case study</Link>
              {p.live_url && <a href={p.live_url} target="_blank" rel="noreferrer noopener">Live demo</a>}
              {p.github_url && <a href={p.github_url} target="_blank" rel="noreferrer noopener">Source</a>}
            </p>
          </div>
        </article>
      ))}
    </section>
  )
}
