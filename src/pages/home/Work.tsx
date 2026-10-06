import { useRef, type CSSProperties, type PointerEvent } from 'react'
import { Link, useViewTransitionState } from 'react-router-dom'
import { ArrowUpRight, GithubMark } from '../../components/Icons'
import { projectPath } from '../../lib/projects'
import type { Project } from '../../types'
import { SectionHead } from './Sections'

export type ProjectCard = Pick<Project, 'id' | 'slug' | 'title' | 'summary' | 'image_url' | 'technologies' | 'github_url' | 'live_url' | 'featured' | 'category' | 'role' | 'year'>
export const CARD_COLS = 'id,slug,title,summary,image_url,technologies,github_url,live_url,featured,category,role,year'

const clamp = (v: number) => Math.max(-0.5, Math.min(0.5, v))

function Card({ p, i }: { p: ProjectCard; i: number }) {
  const path = projectPath(p)
  const morphing = useViewTransitionState(path) // names the image only while navigating, so it can morph into the detail page
  const media = useRef<HTMLAnchorElement>(null)

  // Mouse-only image tilt: at most 3.5deg rotation and 6px travel. Touch pointers are ignored.
  const tilt = (e: PointerEvent<HTMLElement>) => {
    const el = media.current
    if (!el || e.pointerType !== 'mouse') return
    const r = el.getBoundingClientRect()
    const x = clamp((e.clientX - r.left) / r.width - 0.5)
    const y = clamp((e.clientY - r.top) / r.height - 0.5)
    el.style.setProperty('--ry', `${(x * 7).toFixed(2)}deg`)
    el.style.setProperty('--rx', `${(-y * 7).toFixed(2)}deg`)
    el.style.setProperty('--tx', `${(x * 12).toFixed(1)}px`)
    el.style.setProperty('--ty', `${(y * 12).toFixed(1)}px`)
  }
  const rest = () => ['--rx', '--ry', '--tx', '--ty'].forEach((k) => media.current?.style.removeProperty(k))

  return (
    <article className="pcard reveal" style={{ '--i': i % 3 } as CSSProperties} onPointerMove={tilt} onPointerLeave={rest}>
      <Link ref={media} to={path} viewTransition className="pimg" aria-hidden="true" tabIndex={-1}>
        {p.image_url
          ? <img src={p.image_url} alt="" width={1600} height={1000} loading={i < 3 ? 'eager' : 'lazy'} decoding="async" style={morphing ? { viewTransitionName: 'project-image' } : undefined} />
          : <span className="shot-empty">{p.title}</span>}
      </Link>
      <div className="pbody">
        <p className="kicker">{[p.category, p.year].filter(Boolean).join(' · ') || 'Project'}</p>
        <h3><Link to={path} viewTransition>{p.title}<span className="parrow"><ArrowUpRight /></span></Link></h3>
        {p.summary && <p className="pdesc">{p.summary}</p>}
        {p.technologies.length > 0 && <ul className="tags">{p.technologies.slice(0, 5).map((t) => <li key={t}>{t}</li>)}</ul>}
        {(p.live_url || p.github_url) && (
          <p className="pbtns">
            {p.live_url && <a className="pbtn" href={p.live_url} target="_blank" rel="noreferrer noopener">Live demo <ArrowUpRight /></a>}
            {p.github_url && <a className="pbtn" href={p.github_url} target="_blank" rel="noreferrer noopener">GitHub <GithubMark /></a>}
          </p>
        )}
      </div>
    </article>
  )
}

export default function Work({ projects }: { projects: ProjectCard[] }) {
  const list = [...projects].sort((a, b) => Number(b.featured) - Number(a.featured))
  return (
    <section id="work" className="sec" aria-labelledby="work-title">
      <SectionHead kicker="Selected work" title="Projects" />
      <div className="pgrid">{list.map((p, i) => <Card key={p.id} p={p} i={i} />)}</div>
    </section>
  )
}
