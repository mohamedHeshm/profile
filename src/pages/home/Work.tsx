import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, GithubMark } from '../../components/Icons'
import { playOrbit } from '../../lib/orbit'
import { projectPath } from '../../lib/projects'
import type { Project } from '../../types'
import { SectionHead } from './Sections'

export type ProjectCard = Pick<Project, 'id' | 'slug' | 'title' | 'summary' | 'image_url' | 'technologies' | 'github_url' | 'live_url' | 'featured' | 'category' | 'role' | 'year'>
export const CARD_COLS = 'id,slug,title,summary,image_url,technologies,github_url,live_url,featured,category,role,year'

// The orbit intro is desktop-only; small screens and reduced-motion users get a staggered reveal instead.
const canOrbit = () => window.matchMedia('(min-width: 860px) and (prefers-reduced-motion: no-preference)').matches && 'IntersectionObserver' in window && typeof Element.prototype.animate === 'function'

export default function Work({ projects }: { projects: ProjectCard[] }) {
  const list = [...projects].sort((a, b) => Number(b.featured) - Number(a.featured))
  const box = useRef<HTMLDivElement>(null)
  const [orbit] = useState(canOrbit)
  const [pending, setPending] = useState(orbit)

  useEffect(() => {
    const el = box.current
    if (!orbit || !el) return
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      io.disconnect()
      playOrbit(el)
      setPending(false)
    }, { rootMargin: '0px 0px -25% 0px' })
    io.observe(el)
    return () => io.disconnect()
  }, [orbit, list.length])

  return (
    <section id="work" className="sec" aria-labelledby="work-title">
      <SectionHead kicker="Selected work" title="Projects" />
      <div ref={box} className="pgrid" data-orbit={pending ? 'pending' : undefined}>
        {list.map((p, i) => {
          const path = projectPath(p)
          return (
            <article key={p.id} className={`pcard${orbit ? '' : ' reveal'}`} style={{ '--i': i } as CSSProperties}>
              <Link to={path} className="pimg" aria-hidden="true" tabIndex={-1}>
                {p.image_url ? <img src={p.image_url} alt="" width={1600} height={1000} loading={i < 3 ? 'eager' : 'lazy'} decoding="async" /> : <span className="shot-empty">{p.title}</span>}
              </Link>
              <div className="pbody">
                <p className="kicker">{[p.category, p.year].filter(Boolean).join(' · ') || 'Project'}</p>
                <h3><Link to={path}>{p.title}<span className="parrow"><ArrowUpRight /></span></Link></h3>
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
        })}
      </div>
    </section>
  )
}
