import type { Profile, Service, Skill } from '../../types'

export function SectionHead({ kicker, title }: { kicker: string; title: string }) {
  return <header className="sec-head reveal"><p className="kicker">{kicker}</p><h2>{title}</h2></header>
}

const BUCKETS: [string, RegExp][] = [['Frontend', /front|client/i], ['Backend', /back|server|api/i], ['Database', /data ?base|sql/i], ['Tools', /tool|devops|ops/i]]
const bucket = (cat: string) => BUCKETS.find(([, re]) => re.test(cat))?.[0] ?? 'Other technologies'

export function Stack({ skills }: { skills: Skill[] }) {
  const groups: Record<string, Skill[]> = {}
  for (const s of skills) {
    const list = (groups[bucket(s.category)] ??= [])
    if (!list.some((x) => x.name.toLowerCase() === s.name.toLowerCase())) list.push(s)
  }
  const order = [...BUCKETS.map(([n]) => n), 'Other technologies'].filter((n) => groups[n])
  return (
    <section id="stack" className="sec">
      <SectionHead kicker="Skills" title="Technologies I work with" />
      <div className="stack-groups">{order.map((cat) => (
        <div key={cat} className="sg reveal"><h3 className="kicker">{cat}</h3>
          <ul>{groups[cat].map((s) => <li key={s.id} className={s.featured ? 'feat' : ''}><span className="nm">{s.name}</span>{s.description && <span className="ds">{s.description}</span>}</li>)}</ul></div>))}</div>
    </section>
  )
}

export function Statement({ text }: { text: string }) {
  return (
    <section className="statement-sec reveal" aria-label="Engineering statement">
      <p className="big">I build digital products where <em>engineering</em>, <em>performance</em> and <em>design</em> meet.</p>
      {text && <p className="muted">{text}</p>}
    </section>
  )
}

export function About({ profile, education, exploring }: { profile: Profile; education: string; exploring: string[] }) {
  const y = profile.years_experience
  const facts = [['Location', profile.location], ['Education', education], ['Role', profile.job_title], ['Experience', y === null ? '' : `${y} ${y === 1 ? 'year' : 'years'}`], ['Current focus', exploring.join(', ')]].filter(([, v]) => v)
  return (
    <section id="about" className="sec">
      <div className="about2 reveal">
        <figure className="about-ph">{profile.avatar_url ? <img src={profile.avatar_url} alt={`Portrait of ${profile.full_name}`} width={800} height={1000} loading="lazy" decoding="async" /> : <div className="frame-ph" role="img" aria-label="No portrait yet">{profile.full_name.slice(0, 1)}</div>}</figure>
        <div>
          <p className="kicker">About</p>
          <h2>Software Engineer<br />who cares about<br />the details.</h2>
          <ul className="pillars"><li>Software Engineer</li><li>Full Stack Developer</li><li>Problem Solver</li></ul>
          {profile.full_bio && <p className="statement">{profile.full_bio}</p>}
          <dl className="facts">{facts.map(([k, v]) => <div key={k}><dt className="kicker">{k}</dt><dd>{v}</dd></div>)}</dl>
        </div>
      </div>
    </section>
  )
}

const STEPS: [string, string][] = [
  ['Understand', 'Clarify the problem, the users and the constraints before writing code.'],
  ['Design', 'Plan the architecture, the data model and the interface together.'],
  ['Build', 'Implement in small, typed, reviewable pieces.'],
  ['Test', 'Check behavior, edge cases and failure states.'],
  ['Refine', 'Tighten performance, accessibility and the small details.'],
  ['Deploy', 'Ship it, watch how it behaves, and keep improving.'],
]
export function Process() {
  return (
    <section id="process" className="sec">
      <SectionHead kicker="How I work" title="From problem to product" />
      <ol className="process">{STEPS.map(([t, d], i) => <li key={t} className="reveal"><span className="kicker">{String(i + 1).padStart(2, '0')}</span><h3>{t}</h3><p>{d}</p></li>)}</ol>
    </section>
  )
}

export function Exploring({ items }: { items: string[] }) {
  return (
    <section id="exploring" className="sec">
      <SectionHead kicker="Engineering notes" title="Currently exploring" />
      <ul className="explore">{items.map((t, i) => <li key={t} className="reveal"><span className="kicker">Note {String(i + 1).padStart(2, '0')}</span><p>{t}</p></li>)}</ul>
    </section>
  )
}

export interface Entry { key: string; period: string; title: string; sub: string; text: string }
export function Timeline({ id, kicker, title, entries }: { id: string; kicker: string; title: string; entries: Entry[] }) {
  return (
    <section id={id} className="sec">
      <SectionHead kicker={kicker} title={title} />
      <ol className={`timeline${entries.every((e) => !e.period) ? ' flat' : ''}`}>{entries.map((e) => (
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

