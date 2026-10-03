import { useEffect, useState } from 'react'
import { useProfile, useRows } from '../../hooks/useRows'
import { shortDate } from '../../lib/format'
import { supabase } from '../../lib/supabase'
import type { Experience, Project, Skill } from '../../types'

type Target = 'Profile' | 'Skills' | 'Projects' | 'Experience' | 'Links'

export default function Overview({ uid, go }: { uid: string; go: (t: Target) => void }) {
  const { profile, loading } = useProfile(uid)
  const projects = useRows<Project>('projects', uid)
  const skills = useRows<Skill>('skills', uid)
  const jobs = useRows<Experience>('experiences', uid)
  const [views, setViews] = useState<number | null>(null)
  useEffect(() => { void supabase.from('portfolio_views').select('id', { count: 'exact', head: true }).then(({ count }) => setViews(count)) }, [])
  if (loading || projects.loading || skills.loading || jobs.loading) return <div className="skeleton" />

  const items: [string, unknown][] = profile ? [['name', profile.full_name], ['title', profile.job_title], ['short bio', profile.short_bio], ['full bio', profile.full_bio], ['location', profile.location], ['email', profile.email], ['portrait', profile.avatar_url], ['years of experience', profile.years_experience !== null]] : []
  const missing = items.filter(([, v]) => !v).map(([k]) => k)
  const pct = items.length ? Math.round(((items.length - missing.length) / items.length) * 100) : 0
  const h = new Date().getHours()
  const hello = `${h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'}${profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}.`
  const recent = [...projects.rows].sort((a, b) => b.updated_at.localeCompare(a.updated_at)).slice(0, 3)
  const stats: [string, number | string][] = [['Projects', projects.rows.length], ['Featured', projects.rows.filter((p) => p.featured).length], ['Skills', skills.rows.length], ['Experience', jobs.rows.length], ['Views', views ?? '—']]
  return (
    <>
      <p className="greet">{hello}</p>
      {!profile && <p className="empty">Your portfolio is not live yet. Start by creating your profile.</p>}
      <dl className="stats">{stats.map(([k, v]) => <div key={k}><dd>{v}</dd><dt className="kicker">{k}</dt></div>)}</dl>
      <div className="row"><button className="btn primary" onClick={() => go('Projects')}>Add project</button><button className="btn" onClick={() => go('Profile')}>Edit profile</button><button className="btn" onClick={() => go('Experience')}>Add experience</button><button className="btn" onClick={() => go('Skills')}>Update skills</button></div>
      {profile && (
        <section className="panel"><h2 className="kicker">Profile completeness</h2>
          <div className="bar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Profile completeness"><span style={{ width: `${pct}%` }} /></div>
          <p className="muted">{pct}%{missing.length > 0 && ` · Still missing: ${missing.join(', ')}`}</p></section>
      )}
      {recent.length > 0 && (
        <section className="panel"><h2 className="kicker">Recent projects</h2>
          <ul className="list">{recent.map((p) => <li key={p.id}><span className="proj-main">{p.image_url ? <img className="thumb-sm" src={p.image_url} alt="" loading="lazy" /> : <span className="thumb-sm ph" aria-hidden="true" />}<strong>{p.title}</strong></span><span className="muted">Updated {shortDate(p.updated_at)}</span></li>)}</ul></section>
      )}
    </>
  )
}
