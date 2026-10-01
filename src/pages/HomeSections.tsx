import { useRows } from '../hooks/useRows'
import type { Education, Experience, Service, SocialLink } from '../types'

const fmt = (d: string | null) => (d ? new Date(d).toLocaleDateString('en', { month: 'short', year: 'numeric' }) : '')
const range = (s: string | null, e: string | null, current = false) => [fmt(s), current ? 'Present' : fmt(e)].filter(Boolean).join(' – ')

export function MoreSections({ ownerId }: { ownerId: string }) {
  const services = useRows<Service>('services', ownerId, true).rows
  const jobs = useRows<Experience>('experiences', ownerId, true).rows
  const edu = useRows<Education>('education', ownerId, true).rows
  return (
    <>
      {services.length > 0 && <section id="services"><h2>What I build</h2>
        <dl className="stack-list">{services.map((s) => <div key={s.id}><dt>{s.title}</dt><dd>{s.description}</dd></div>)}</dl></section>}
      {jobs.length > 0 && <section id="experience"><h2>Experience</h2>
        <dl className="stack-list">{jobs.map((j) => <div key={j.id}><dt>{range(j.start_date, j.end_date, j.current)}</dt>
          <dd><strong>{j.position}</strong>, {j.company}{j.location && <span className="muted"> · {j.location}</span>}{j.description && <p className="muted">{j.description}</p>}</dd></div>)}</dl></section>}
      {edu.length > 0 && <section id="education"><h2>Education</h2>
        <dl className="stack-list">{edu.map((e) => <div key={e.id}><dt>{range(e.start_date, e.end_date)}</dt>
          <dd><strong>{e.institution}</strong>{[e.degree, e.field].filter(Boolean).length > 0 && <span className="muted"> · {[e.degree, e.field].filter(Boolean).join(', ')}</span>}{e.description && <p className="muted">{e.description}</p>}</dd></div>)}</dl></section>}
    </>
  )
}

export function Contact({ ownerId, email }: { ownerId: string; email: string }) {
  const links = useRows<SocialLink>('social_links', ownerId).rows
  if (!email && links.length === 0) return null
  return (
    <section id="contact"><h2>Let’s work together</h2>
      {email && <a className="mail" href={`mailto:${email}`}>{email}</a>}
      {links.length > 0 && <p className="links">{links.map((l) => <a key={l.id} href={l.url} target="_blank" rel="noreferrer noopener">{l.platform}</a>)}</p>}
    </section>
  )
}
