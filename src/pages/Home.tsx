import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { setFavicon, setMeta } from '../lib/seo'
import { useProfile, useRows, useSettings } from '../hooks/useRows'
import { useAuth } from '../features/auth/AuthContext'
import { Contact, MoreSections } from './HomeSections'
import type { Project, Skill } from '../types'

function toggleTheme() {
  const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'
  document.documentElement.dataset.theme = next
  try { localStorage.setItem('theme', next) } catch { /* storage unavailable */ }
}

export default function Home() {
  const { session, ready } = useAuth()
  const { profile, loading } = useProfile()
  const skills = useRows<Skill>('skills', profile?.id, true)
  const projects = useRows<Project>('projects', profile?.id, true)
  const { settings } = useSettings(profile?.id)

  // Values are constrained by CHECK constraints in the database (hex color, known section ids).
  const css = settings ? [`:root:not([data-theme=dark]){--accent:${settings.accent}}`, ...settings.hidden_sections.map((s) => `#${s}{display:none}`), ...settings.section_order.map((s, i) => `#${s}{order:${i}}`)].join('') : ''

  useEffect(() => {
    if (!profile) return
    setMeta({ title: settings?.site_title || `${profile.full_name} — ${profile.job_title}`, description: settings?.hero_text || profile.short_bio, image: profile.avatar_url })
    if (settings?.favicon_url) setFavicon(settings.favicon_url)
  }, [profile, settings])
  useEffect(() => {
    if (!ready || session) return
    try { if (sessionStorage.getItem('viewed')) return; sessionStorage.setItem('viewed', '1') } catch { /* storage unavailable */ }
    void supabase.rpc('record_view', { p_path: '/' })
  }, [ready, session])

  const groups = skills.rows.reduce<Record<string, Skill[]>>((a, s) => { (a[s.category] ??= []).push(s); return a }, {})
  const [lead, ...rest] = [...projects.rows].sort((a, b) => Number(b.featured) - Number(a.featured))

  return (
    <>
      <header className="nav"><nav aria-label="Main">
        {settings?.logo_url && <img className="logo" src={settings.logo_url} alt={profile?.full_name ?? 'Logo'} />}<a href="#work">Work</a><a href="#about">About</a><a href="#stack">Stack</a><a href="#contact">Contact</a>
        <span className="grow" />
        <button className="link" onClick={toggleTheme}>Theme</button>
        {session && <Link className="btn small" to="/dashboard">Dashboard</Link>}
      </nav></header>
      <main className="wrap">
        {loading ? <div className="skeleton hero-skel" /> : !profile ? (
          <section className="empty"><h1>This portfolio is not set up yet</h1><p>Sign in and complete your profile to publish it.</p><Link className="btn primary" to="/login">Sign in</Link></section>
        ) : (
          <>
            <section className="hero">
              <div>
                <h1>{profile.full_name}</h1>
                <p className="role">{profile.job_title}</p>
                {(settings?.hero_text || profile.short_bio) && <p className="lead">{settings?.hero_text || profile.short_bio}</p>}
                <p className="meta">{[profile.location, profile.available ? 'Available for work' : null].filter(Boolean).join(' · ')}</p>
                <p className="actions"><a className="btn primary" href="#work">See my work</a>{profile.email && <a className="btn" href={`mailto:${profile.email}`}>Get in touch</a>}</p>
              </div>
              {profile.avatar_url
                ? <img className="portrait" src={profile.avatar_url} alt={`Portrait of ${profile.full_name}`} />
                : <div className="portrait ph" role="img" aria-label="No photo yet">{profile.full_name.slice(0, 1)}</div>}
            </section>
            <div className="sections">{css && <style>{css}</style>}
            <section id="work"><h2>Selected work</h2>
              {projects.loading ? <div className="skeleton" /> : !lead ? <p className="muted">No projects published yet.</p> : (
                <>
                  <ProjectItem p={lead} large />
                  <div className="rows">{rest.map((p) => <ProjectItem key={p.id} p={p} />)}</div>
                </>
              )}
            </section>
            {(profile.full_bio || profile.years_experience !== null) && (
              <section id="about"><h2>About</h2>
                {profile.full_bio && <p className="prose">{profile.full_bio}</p>}
                {profile.years_experience !== null && <p className="muted">{profile.years_experience} years of professional experience</p>}
              </section>
            )}
            <MoreSections ownerId={profile.id} />
            {Object.keys(groups).length > 0 && (
              <section id="stack"><h2>What I work with</h2>
                <dl className="stack-list">{Object.entries(groups).map(([cat, list]) => (
                  <div key={cat}><dt>{cat}</dt><dd>{list.map((s) => s.name).join(', ')}</dd></div>))}</dl>
              </section>
            )}
            <Contact ownerId={profile.id} email={profile.email} /></div>
          </>
        )}
      </main>
    </>
  )
}

function ProjectItem({ p, large }: { p: Project; large?: boolean }) {
  return (
    <article className={large ? 'project large' : 'project'}>
      {p.image_url && <div className="thumb"><img src={p.image_url} alt="" loading="lazy" /></div>}
      <div>
        <h3><Link to={`/projects/${p.id}`}>{p.title}</Link></h3>
        <p>{p.summary}</p>
        {p.technologies.length > 0 && <p className="meta">{p.technologies.join(', ')}</p>}
        <p className="links">{p.live_url && <a href={p.live_url} target="_blank" rel="noreferrer noopener">Live demo</a>}{p.github_url && <a href={p.github_url} target="_blank" rel="noreferrer noopener">Source</a>}</p>
      </div>
    </article>
  )
}
