import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../features/auth/AuthContext'
import EntityManager from '../features/dashboard/EntityManager'
import { ENTITIES } from '../features/dashboard/entities'
import Overview from '../features/dashboard/Overview'
import ProfileForm from '../features/dashboard/ProfileForm'
import ProjectsManager from '../features/dashboard/ProjectsManager'
import SettingsForm from '../features/dashboard/SettingsForm'

const TABS = ['Overview', 'Profile', 'Skills', 'Projects', 'Experience', 'Education', 'Services', 'Links', 'Settings'] as const
const DESC: Record<string, string> = { Overview: 'A snapshot of your portfolio.', Profile: 'How visitors first meet you.', Skills: 'The technologies you work with, grouped by category.', Projects: 'Your case studies: the centerpiece of the portfolio.', Experience: 'Roles and responsibilities, newest first.', Education: 'Degrees and relevant study.', Services: 'What you offer clients.', Links: 'GitHub, LinkedIn and other places to reach you.', Settings: 'Title, color, logo and section order.' }
type Tab = (typeof TABS)[number]

export default function Dashboard() {
  const { session, ready } = useAuth()
  const [tab, setTab] = useState<Tab>('Overview')
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  if (!ready) return <div className="skeleton" />
  if (!session) return <Navigate to="/login" replace />
  const uid = session.user.id
  const choose = (t: Tab) => { setTab(t); setOpen(false); window.scrollTo(0, 0) }

  return (
    <div className="dash">
      <header className="dash-bar">
        <button className="btn small" aria-label="Open menu" aria-expanded={open} aria-controls="dash-menu" onClick={() => setOpen(true)}>Menu</button>
        <strong>Dashboard</strong>
      </header>
      {open && <div className="backdrop" onClick={() => setOpen(false)} aria-hidden="true" />}
      <aside id="dash-menu" className={open ? 'open' : ''}>
        <p className="brand">Portfolio CMS</p>
        <nav aria-label="Dashboard">{TABS.map((t) => <button key={t} className={t === tab ? 'active' : ''} aria-current={t === tab ? 'page' : undefined} onClick={() => choose(t)}>{t}</button>)}</nav>
        <Link to="/">Preview portfolio</Link>
        <button className="link" onClick={() => void supabase.auth.signOut()}>Sign out</button>
      </aside>
      <main>
        <header className="page-head"><h1>{tab}</h1><p className="muted">{DESC[tab]}</p></header>
        {tab === 'Overview' && <Overview uid={uid} go={choose} />}
        {tab === 'Profile' && <ProfileForm uid={uid} email={session.user.email ?? ''} />}
        {tab === 'Projects' && <ProjectsManager uid={uid} />}
        {tab === 'Settings' && <SettingsForm uid={uid} />}
        {ENTITIES[tab] && <EntityManager key={tab} uid={uid} config={ENTITIES[tab]} />}
      </main>
    </div>
  )
}
