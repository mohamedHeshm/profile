import type { CSSProperties } from 'react'
import { Link, useViewTransitionState } from 'react-router-dom'
import { ArrowRight } from '../../components/Icons'
import { projectPath } from '../../lib/projects'
import type { ProjectCard } from './Work'

// Slot per project; the featured one is always the centre. Layouts stay symmetrical for every count.
const LAYOUT: Record<number, string[]> = { 1: ['c'], 2: ['c', 'r'], 3: ['c', 'l', 'r'], 4: ['c', 'l', 'r', 't'], 5: ['c', 'l', 'r', 'tl', 'tr'] }
const FLOAT = [4, 3, 2, 4, 3] // px of vertical travel per card
const SECONDS = [8, 7, 9, 6, 10]
const DELAY = [-1, -3, -5, -2, -4]

function Tile({ p, pos, i }: { p: ProjectCard; pos: string; i: number }) {
  const path = projectPath(p)
  const morphing = useViewTransitionState(path) // names the image only while navigating, so it expands into the detail page
  const label = p.category || p.technologies[0]
  return (
    <div className="fp-card" data-pos={pos} style={{ '--f': `${FLOAT[i]}px`, '--d': `${SECONDS[i]}s`, '--dl': `${DELAY[i]}s` } as CSSProperties}>
      <div className="fp-float">
        <Link to={path} viewTransition className="fp-link" aria-label={`Open project: ${p.title}`}>
          <span className="fp-shot">
            {p.image_url
              ? <img src={p.image_url} alt="" width={1600} height={1000} loading="eager" decoding="async" style={morphing ? { viewTransitionName: 'project-image' } : undefined} />
              : <span className="shot-empty">{p.title}</span>}
          </span>
          <span className="fp-cap"><span className="fp-name">{p.title}</span>{label && <span className="fp-tag">{label}</span>}</span>
        </Link>
      </div>
    </div>
  )
}

/** Compact "floating gallery" of featured projects for the Hero, plus the link to the full /projects gallery. */
export default function FeaturedShowcase({ projects }: { projects: ProjectCard[] }) {
  const list = [...projects].sort((a, b) => Number(b.featured) - Number(a.featured)).slice(0, 5)
  if (list.length === 0) return null
  const slots = LAYOUT[list.length]
  return (
    <div className="fp-col">
      <div className="fp-wrap">
        <div className="fp" role="group" aria-label="Featured projects">{list.map((p, i) => <Tile key={p.id} p={p} pos={slots[i]} i={i} />)}</div>
      </div>
      <p className="fp-cta"><Link to="/projects" viewTransition className="btn fp-all">View All Projects <span className="arr"><ArrowRight /></span></Link></p>
    </div>
  )
}