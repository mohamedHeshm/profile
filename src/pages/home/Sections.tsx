import type { Profile, Service, Skill, SocialLink } from '../../types'

export function SectionHead({ kicker, title }: { kicker: string; title: string }) {
  return <header className="sec-head reveal"><p className="kicker">{kicker}</p><h2>{title}</h2></header>
}

export function Stack({ skills }: { skills: Skill[] }) {
  const groups = skills.reduce<Record<string, Skill[]>>((a, s) => { (a[s.category] ??= []).push(s); return a }, {})
  return (
    <section id="stack" className="sec">
      <SectionHead kicker="Engineering stack" title="What I work with" />
      <div className="stackgrid">{Object.entries(groups).map(([cat, list]) => (
        <div key={cat} className="reveal"><h3 className="kicker">{cat}</h3><ul>{list.map((s) => <li key={s.id} className={s.featured ? 'feat' : ''}>{s.name}</li>)}</ul></div>))}</div>
    </section>
  )
}

export function About({ profile }: { profile: Profile }) {
  const y = profile.years_experience
  const facts = [['Based in', profile.location], ['Experience', y === null ? '' : `${y} ${y === 1 ? 'year' : 'years'}`], ['Status', profile.available ? 'Open to new work' : 'Not currently available']].filter(([, v]) => v)
  return (
    <section id="about" className="sec">
      <SectionHead kicker="About" title="Who I am" />
      <div className="about reveal">
        <p className="statement">{profile.full_bio}</p>
        <dl className="facts">{facts.map(([k, v]) => <div key={k}><dt className="kicker">{k}</dt><dd>{v}</dd></div>)}</dl>
      </div>
    </section>
  )
}

export interface Entry { key: string; period: string; title: string; sub: string; text: string }
export function Timeline({ id, kicker, title, entries }: { id: string; kicker: string; title: string; entries: Entry[] }) {
  return (
    <section id={id} className="sec">
      <SectionHead kicker={kicker} title={title} />
      <ol className="timeline">{entries.map((e) => (
        <li key={e.key} className="reveal"><p className="period">{e.period}</p>
          <div><h3>{e.title}</h3>{e.sub && <p className="muted">{e.sub}</p>}{e.text && <p className="body">{e.text}</p>}</div></li>))}</ol>
    </section>
  )
}

export function Services({ services }: { services: Service[] }) {
  return (
    <section id="services" className="sec">
      <SectionHead kicker="Services" title="How I can help" />
      <ol className="services">{services.map((s, i) => (
        <li key={s.id} className="reveal"><span className="kicker">{String(i + 1).padStart(2, '0')}</span><h3>{s.title}</h3><p>{s.description}</p></li>))}</ol>
    </section>
  )
}

export function Contact({ email, links, resume }: { email: string; links: SocialLink[]; resume: string | null }) {
  if (!email && links.length === 0) return null
  return (
    <section id="contact" className="sec cta reveal">
      <p className="kicker">Contact</p>
      <h2 className="display">Have a product in mind?<br />Let’s build something thoughtful.</h2>
      {email && <p><a className="btn primary lg" href={`mailto:${email}`}>Get in touch</a> <span className="muted mail">{email}</span></p>}
      <ul className="social">
        {links.map((l) => <li key={l.id}><a href={l.url} target="_blank" rel="noreferrer noopener">{l.platform}</a></li>)}
        {resume && <li><a href={resume} target="_blank" rel="noreferrer noopener">Resume</a></li>}
      </ul>
    </section>
  )
}
