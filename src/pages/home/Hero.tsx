import { FiFileText } from 'react-icons/fi'
import SocialLink from '../../components/SocialLink'
import type { Profile, SocialLink as SocialLinkRow } from '../../types'
import HeroShowcase from './HeroShowcase'
import type { ProjectCard } from './Work'

interface Props { profile: Profile; lead: string; links: SocialLinkRow[]; projects: ProjectCard[] }

export default function Hero({ profile, lead, links, projects }: Props) {
  return (
    <section id="home" className={`hero${projects.length ? '' : ' solo'}`} aria-labelledby="name">
      <div className="hero-copy">
        {profile.available && <p className="status"><span className="dot" aria-hidden="true" />Available for work</p>}
        <h1 id="name" className="display">{profile.full_name}</h1>
        {profile.job_title && <p className="role">{profile.job_title}</p>}
        {lead && <p className="lead">{lead}</p>}
        <p className="cta-row">
          <a className="btn primary" href="#work">View Projects</a>
          <a className="btn" href="#contact">Contact Me</a>
        </p>
        <ul className="social">
          {links.map((l) => <li key={l.id}><SocialLink name={l.platform} href={l.url} /></li>)}
          {profile.resume_url && <li><SocialLink name="Resume" href={profile.resume_url} icon={FiFileText} /></li>}
        </ul>
      </div>
      <HeroShowcase projects={projects} />
    </section>
  )
}
