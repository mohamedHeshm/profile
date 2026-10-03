import type { PointerEvent } from 'react'
import type { Profile, Skill, SocialLink } from '../../types'

interface Props { profile: Profile; lead: string; links: SocialLink[]; skills: Skill[] }

export default function Hero({ profile, lead, links, skills }: Props) {
  const chips = (skills.some((s) => s.featured) ? skills.filter((s) => s.featured) : skills).slice(0, 5)
  const move = (e: PointerEvent<HTMLDivElement>) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const r = e.currentTarget.getBoundingClientRect()
    e.currentTarget.style.setProperty('--px', String(((e.clientX - r.left) / r.width - 0.5) * 2))
    e.currentTarget.style.setProperty('--py', String(((e.clientY - r.top) / r.height - 0.5) * 2))
  }
  const reset = (e: PointerEvent<HTMLDivElement>) => { e.currentTarget.style.setProperty('--px', '0'); e.currentTarget.style.setProperty('--py', '0') }
  return (
    <section className="hero" aria-labelledby="name">
      <div className="hero-copy">
        {profile.available && <p className="status"><span className="dot" aria-hidden="true" />Available for new work</p>}
        <h1 id="name" className="display">{profile.full_name}</h1>
        {profile.job_title && <p className="role">{profile.job_title}</p>}
        {lead && <p className="lead">{lead}</p>}
        <p className="cta-row">
          <a className="btn primary" href="#work">View selected work</a>
          {(profile.email || links.length > 0) && <a className="btn" href="#contact">Contact me</a>}
        </p>
        <ul className="social">
          {links.map((l) => <li key={l.id}><a href={l.url} target="_blank" rel="noreferrer noopener">{l.platform}</a></li>)}
          {profile.resume_url && <li><a href={profile.resume_url} target="_blank" rel="noreferrer noopener">Resume</a></li>}
        </ul>
      </div>
      <div className="frame" onPointerMove={move} onPointerLeave={reset}>
        {profile.avatar_url
          ? <img src={profile.avatar_url} alt={`Portrait of ${profile.full_name}`} width={800} height={1000} decoding="async" />
          : <div className="frame-ph" role="img" aria-label="No portrait yet">{profile.full_name.slice(0, 1)}</div>}
        {profile.job_title && <span className="tag tl">{profile.job_title}</span>}
        {profile.location && <span className="tag tr">{profile.location}</span>}
        {chips.length > 0 && <ul className="chips" aria-label="Featured technologies">{chips.map((s) => <li key={s.id}>{s.name}</li>)}</ul>}
      </div>
    </section>
  )
}
