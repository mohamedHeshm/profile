import { useState, type CSSProperties } from 'react'
import { Link, useViewTransitionState } from 'react-router-dom'
import { ArrowRight } from '../../components/Icons'
import { useMedia } from '../../hooks/useMedia'
import { featuredFirst, projectPath, type ProjectCard } from '../../lib/projects'

const R = 34 // orbit radius, in % of the square stage
// Every node sits on the orbit at angle = -90deg + index * (360 / count), so any count stays evenly spaced.
const polar = (i: number, n: number) => {
  const a = ((-90 + (i * 360) / n) * Math.PI) / 180
  return { x: 50 + R * Math.cos(a), y: 50 + R * Math.sin(a) }
}
const SECONDS = [8, 11, 7, 12, 9, 10]
const DELAYS = [-1, -4, -6, -2, -8, -5]

interface NodeProps { p: ProjectCard; i: number; x: number; y: number; hot: number | null; setHot: (i: number | null) => void }

function Node({ p, i, x, y, hot, setHot }: NodeProps) {
  const path = projectPath(p)
  const morphing = useViewTransitionState(path) // names the image only while navigating, so it expands into the detail page
  const tech = p.technologies.slice(0, 2).join(' · ')
  const state = hot === null ? '' : hot === i ? ' on' : ' dim'
  return (
    <div className={`rp-node${state}`} data-half={y < 52 ? 'top' : 'bottom'} style={{ '--x': `${x}%`, '--y': `${y}%`, '--d': `${SECONDS[i % 6]}s`, '--dl': `${DELAYS[i % 6]}s` } as CSSProperties}>
      <div className="rp-float">
        <Link to={path} viewTransition className="rp-link" aria-label={`Open project: ${p.title}`}
          onPointerEnter={() => setHot(i)} onPointerLeave={() => setHot(null)} onFocus={() => setHot(i)} onBlur={() => setHot(null)}>
          <span className="rp-shot">
            {p.image_url
              ? <img src={p.image_url} alt="" width={800} height={600} loading="eager" decoding="async" style={morphing ? { viewTransitionName: 'project-image' } : undefined} />
              : <span className="shot-empty">{p.title}</span>}
          </span>
          <span className="rp-cap"><span className="rp-name">{p.title}</span></span>
          <span className="rp-tip" aria-hidden="true">
            <strong>{p.title}</strong>
            {p.category && <span>{p.category}</span>}
            {tech && <span className="rp-tech">{tech}</span>}
          </span>
        </Link>
      </div>
    </div>
  )
}

/** Compact radial showcase for the Hero: featured projects evenly spaced on an orbit around a "Selected Work" core. */
export default function RadialProjects({ projects }: { projects: ProjectCard[] }) {
  const small = useMedia('(max-width: 700px)')
  const [hot, setHot] = useState<number | null>(null)
  const list = featuredFirst(projects).slice(0, small ? 4 : 6)
  if (list.length === 0) return null
  const pts = list.map((_, i) => polar(i, list.length))
  return (
    <div className="rp-col">
      <div className="rp-wrap">
        <div className="rp" role="group" aria-label="Featured projects">
          <svg className="rp-svg" viewBox="0 0 100 100" aria-hidden="true">
            <circle className="ring f" cx="50" cy="50" r="46" />
            <circle className="ring o" cx="50" cy="50" r={R} />
            <circle className="ring i" cx="50" cy="50" r="17" />
            {pts.map((pt, i) => <line key={list[i].id} className={`rl${hot === i ? ' on' : ''}`} x1="50" y1="50" x2={pt.x} y2={pt.y} />)}
          </svg>
          <div className="rp-core" aria-hidden="true"><span>Selected</span><span>Work</span><b>{String(list.length).padStart(2, '0')}</b></div>
          {list.map((p, i) => <Node key={p.id} p={p} i={i} x={pts[i].x} y={pts[i].y} hot={hot} setHot={setHot} />)}
        </div>
      </div>
      <p className="rp-cta"><Link to="/projects" viewTransition className="btn rp-all">View All Projects <span className="arr"><ArrowRight /></span></Link></p>
    </div>
  )
}