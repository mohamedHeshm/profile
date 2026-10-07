import { Fragment, useEffect, useRef } from 'react'
import type { CSSProperties } from 'react'
import { FiFileText } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import SocialLink from '../../components/SocialLink'
import type { Profile, SocialLink as SocialLinkRow } from '../../types'
import type { ProjectCard } from '../../lib/projects'
import RadialProjects from './RadialProjects'

interface Props { profile: Profile; lead: string; links: SocialLinkRow[]; projects: ProjectCard[] }

export default function Hero({ profile, lead, links, projects }: Props) {
  const words = profile.full_name.trim().split(/\s+/)
  const name = useRef<HTMLHeadingElement>(null)

  // Very small parallax: the name trails the page by at most 20px.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let raf = 0
    const on = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => name.current?.style.setProperty('--pl', `${Math.min(20, window.scrollY * 0.05).toFixed(1)}px`))
    }
    window.addEventListener('scroll', on, { passive: true })
    return () => { window.removeEventListener('scroll', on); cancelAnimationFrame(raf) }
  }, [])

  return (
    <section id="home" className={`hero${projects.length ? '' : ' solo'}`} aria-labelledby="name">
      <div className="hero-copy">
        {profile.available && <p className="status"><span className="dot" aria-hidden="true" />Available for work</p>}
        <h1 id="name" ref={name} className="display">
          {words.map((w, i) => <Fragment key={i}>{i > 0 && ' '}<span className="nm-w"><span style={{ '--w': i } as CSSProperties}>{w}</span></span></Fragment>)}
        </h1>
        {profile.job_title && <p className="role">{profile.job_title}</p>}
        {lead && <p className="lead">{lead}</p>}
        <p className="cta-row">
          <Link className="btn primary" to="/projects" viewTransition>View Projects</Link>
          <a className="btn" href="#contact">Contact Me</a>
        </p>
        <ul className="social">
          {links.map((l) => <li key={l.id}><SocialLink name={l.platform} href={l.url} /></li>)}
          {profile.resume_url && <li><SocialLink name="View The CV" href={profile.resume_url} icon={FiFileText} /></li>}
        </ul>
      </div>
      <RadialProjects projects={projects} />
    </section>
  )
}