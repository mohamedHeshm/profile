import type { Profile, SocialLink } from '../../types'

interface Props { profile: Profile; lead: string; links: SocialLink[] }

export default function Hero({ profile, lead, links }: Props) {
  const y = profile.years_experience
  return (
    <section className="hero" aria-labelledby="name">
      <div className="hero-copy">
        {profile.available && <p className="status"><span className="dot" aria-hidden="true" />Available for work</p>}
        <h1 id="name" className="display">{profile.full_name}</h1>
        {profile.job_title && <p className="role">{profile.job_title}</p>}
        {lead && <p className="lead">{lead}</p>}
        <p className="cta-row">
          <a className="btn primary" href="#work">View projects</a>
          {profile.resume_url ? <a className="btn" href={profile.resume_url} target="_blank" rel="noreferrer noopener">Download CV</a> : <a className="btn" href="#contact">Contact me</a>}
        </p>
        <ul className="social">{links.map((l) => <li key={l.id}><a href={l.url} target="_blank" rel="noreferrer noopener">{l.platform}</a></li>)}</ul>
      </div>
      <figure className="frame" style={{ margin: 0 }}>
        {profile.avatar_url
          ? <img src={profile.avatar_url} alt={`Portrait of ${profile.full_name}`} width={800} height={1000} decoding="async" />
          : <div className="frame-ph" role="img" aria-label="No portrait yet">{profile.full_name.slice(0, 1)}</div>}
        {y !== null && <figcaption className="cap">{y}+ years of experience</figcaption>}
      </figure>
    </section>
  )
}
