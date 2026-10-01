import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useProfile, useRows } from '../../hooks/useRows'
import type { Experience, Project, Skill } from '../../types'

type Target = 'Profile' | 'Skills' | 'Projects' | 'Links'

export default function Overview({ uid, go }: { uid: string; go: (t: Target) => void }) {
  const { profile, loading } = useProfile(uid)
  const projects = useRows<Project>('projects', uid)
  const skills = useRows<Skill>('skills', uid)
  const jobs = useRows<Experience>('experiences', uid)
  const [views, setViews] = useState<number | null>(null)
  useEffect(() => { void supabase.from('portfolio_views').select('id', { count: 'exact', head: true }).then(({ count }) => setViews(count)) }, [])
  if (loading || projects.loading || skills.loading || jobs.loading) return <div className="skeleton" />
  const checks = profile ? [profile.full_name, profile.job_title, profile.short_bio, profile.full_bio, profile.location, profile.email, profile.avatar_url, profile.years_experience !== null] : []
  const pct = checks.length ? Math.round((checks.filter(Boolean).length / checks.length) * 100) : 0
  const stats: [string, number | string][] = [['Projects', projects.rows.length], ['Featured projects', projects.rows.filter((p) => p.featured).length], ['Skills', skills.rows.length], ['Experience entries', jobs.rows.length], ['Profile completion', `${pct}%`], ['Portfolio views', views ?? '—']]
  return (
    <>
      {!profile && <p className="empty">Your portfolio is not live yet. Start by creating your profile.</p>}
      <dl className="stats">{stats.map(([k, v]) => <div key={k}><dd>{v}</dd><dt>{k}</dt></div>)}</dl>
      <div className="row">
        <button className="btn primary" onClick={() => go('Projects')}>Add project</button>
        <button className="btn" onClick={() => go('Skills')}>Add skill</button>
        <button className="btn" onClick={() => go('Profile')}>Edit profile</button>
        <button className="btn" onClick={() => go('Links')}>Update social links</button>
      </div>
    </>
  )
}
