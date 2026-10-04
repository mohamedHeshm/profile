import type { Profile, SocialLink } from '../../types'
import HeroVisual from './HeroVisual'
import type { ProjectCard } from './Work'

interface Props { profile: Profile; lead: string; links: SocialLink[]; stack: string[]; projects: ProjectCard[] }

export default function Hero({ profile, lead, links, stack, projects }: Props) {
  const [first, ...rest] = profile.full_name.trim().split(/\s+/)
  const labels = [profile.available && 'Available for work', profile.job_title, profile.location && `Based in ${profile.location}`].filter(Boolean) as string[]
  return (
    <section id="home" className="hero" aria-labelledby="name">
      <div className="hero-copy">
        <ul className="tech-labels">{labels.map((l, i) => <li key={l}>{i === 0 && profile.available && <span className="dot" aria-hidden="true" />}{l}</li>)}</ul>
        <h1 id="name" className="display"><span className="pre">I’m</span><span>{first}</span>{rest.length > 0 && <span>{rest.join(' ')}<i>.</i></span>}</h1>
        {lead && <p className="lead">{lead}</p>}
        <p className="cta-row"><a className="btn primary" href="#work">View selected work</a><a className="btn" href="#contact">Let’s talk</a></p>
        <ul className="social">
          {links.map((l) => <li key={l.id}><a href={l.url} target="_blank" rel="noreferrer noopener">{l.platform}</a></li>)}
          {profile.resume_url && <li><a href={profile.resume_url} target="_blank" rel="noreferrer noopener">Resume</a></li>}
        </ul>
      </div>
      <HeroVisual profile={profile} projects={projects} stack={stack} />
    </section>
  )
}
