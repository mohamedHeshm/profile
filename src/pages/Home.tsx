import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import Nav from '../components/Nav'
import SocialLink from '../components/SocialLink'
import { useAuth } from '../features/auth/AuthContext'
import { useProfile, useRows, useSettings } from '../hooks/useRows'
import { useReveal } from '../hooks/useReveal'
import { range } from '../lib/format'
import { fullOrder, sectionCss } from '../lib/sections'
import { setFavicon, setMeta } from '../lib/seo'
import { supabase } from '../lib/supabase'
import type { Education, Experience, Service, Skill, SocialLink as SocialLinkRow } from '../types'
import Contact from './home/Contact'
import Hero from './home/Hero'
import { About, Exploring, Process, Services, Stack, Statement, Timeline } from './home/Sections'
import Work, { CARD_COLS, type ProjectCard } from './home/Work'

export default function Home() {
  const { session, ready } = useAuth()
  const { profile, loading } = useProfile()
  const pid = profile?.id
  const projects = useRows<ProjectCard>('projects', pid, true, CARD_COLS).rows
  const skills = useRows<Skill>('skills', pid, true).rows
  const jobs = useRows<Experience>('experiences', pid, true).rows
  const edu = useRows<Education>('education', pid, true).rows
  const services = useRows<Service>('services', pid, true).rows
  const links = useRows<SocialLinkRow>('social_links', pid, true).rows
  const { settings } = useSettings(pid)
  useReveal(projects.length + skills.length + jobs.length + edu.length + services.length + (profile ? 1 : 0))

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

  const hidden = settings?.hidden_sections ?? []
  const exploring = settings?.exploring ?? []
  // Accent comes from a DB-validated hex color; it only applies to the light theme.
  const css = (settings ? `:root[data-theme=light]{--accent:${settings.accent}}` : '') + sectionCss(fullOrder(settings?.section_order), hidden)
  const present: Record<string, boolean> = { home: true, work: projects.length > 0, about: Boolean(profile?.full_bio || profile?.avatar_url), stack: skills.length > 0, contact: true }
  const nav = [['home', 'Home'], ['about', 'About'], ['stack', 'Skills'], ['work', 'Projects'], ['contact', 'Contact']].filter(([id]) => present[id] && !hidden.includes(id)).map(([id, label]) => ({ id, label }))
  const eduLine = edu[0] ? [edu[0].degree, edu[0].institution].filter(Boolean).join(', ') : ''

  return (
    <>
      <style>{css}</style>
      <Nav name={profile?.full_name ?? ''} logo={settings?.logo_url} items={nav} showDashboard={Boolean(session)} />
      <main id="main" className="wrap">
        {loading ? <div className="skeleton hero-skel" /> : !profile ? (
          <section className="empty"><h1>This portfolio is not set up yet</h1><p>Sign in and complete your profile to publish it.</p><Link className="btn primary" to="/login">Sign in</Link></section>
        ) : (
          <>
            <Hero profile={profile} lead={settings?.hero_text || profile.short_bio} links={links} projects={projects} />
            <Statement text={profile.short_bio} />
            <div className="sections">
              {projects.length > 0 && <Work projects={projects} />}
              {(profile.full_bio || profile.avatar_url) && <About profile={profile} education={eduLine} exploring={exploring} />}
              {skills.length > 0 && <Stack skills={skills} />}
              <Process />
              {jobs.length > 0 && <Timeline id="experience" kicker="Experience" title="Where I’ve worked" entries={jobs.map((j) => ({ key: j.id, period: range(j.start_date, j.end_date, j.current), title: j.position, sub: [j.company, j.location].filter(Boolean).join(' · '), text: j.description }))} />}
              {edu.length > 0 && <Timeline id="education" kicker="Education" title="Education" entries={edu.map((e) => ({ key: e.id, period: range(e.start_date, e.end_date), title: e.institution, sub: [e.degree, e.field].filter(Boolean).join(', '), text: e.description }))} />}
              {services.length > 0 && <Services services={services} />}
              {exploring.length > 0 && <Exploring items={exploring} />}
              <Contact email={profile.email} phone={profile.phone} links={links} />
            </div>
          </>
        )}
      </main>
      {profile && (
        <footer className="foot">
          <p><strong>{profile.full_name}</strong> · {profile.job_title} · © {new Date().getFullYear()}</p>
          <ul className="social">{links.filter((l) => /github|linkedin/i.test(l.platform)).map((l) => <li key={l.id}><SocialLink name={l.platform} href={l.url} /></li>)}{profile.email && <li><SocialLink name="Email" href={`mailto:${profile.email}`} /></li>}</ul>
          <p className="muted mono">Built with React · TypeScript · Supabase</p>
        </footer>
      )}
    </>
  )
}
