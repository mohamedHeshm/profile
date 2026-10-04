import type { Profile, SocialLink } from '../../types'

interface Props { profile: Profile; lead: string; links: SocialLink[] }

export default function Hero({ profile, lead, links }: Props) {
  return (
    <section id="home" className={`hero${profile.avatar_url ? '' : ' solo'}`} aria-labelledby="name">
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
          {links.map((l) => <li key={l.id}><a href={l.url} target="_blank" rel="noreferrer noopener">{l.platform}</a></li>)}
          {profile.resume_url && <li><a href={profile.resume_url} target="_blank" rel="noreferrer noopener">Resume</a></li>}
        </ul>
      </div>
      {profile.avatar_url && (
        <figure className="portrait"><img src={profile.avatar_url} alt={`Portrait of ${profile.full_name}`} width={800} height={1000} decoding="async" /></figure>
      )}
    </section>
  )
}
