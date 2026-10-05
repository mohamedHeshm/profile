import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useProfile, useRows } from '../hooks/useRows'
import { setMeta } from '../lib/seo'
import Work, { CARD_COLS, type ProjectCard } from './home/Work'

export default function Projects() {
  const { profile, loading: loadingProfile } = useProfile()
  const { rows, loading } = useRows<ProjectCard>('projects', profile?.id, true, CARD_COLS)
  useEffect(() => { setMeta({ title: `Projects${profile ? ` — ${profile.full_name}` : ''}`, description: profile?.short_bio }) }, [profile])
  return (
    <main className="wrap case-page">
      <p><Link to="/" className="back">← Home</Link></p>
      {loadingProfile || (profile && loading) ? <div className="skeleton hero-skel" /> : rows.length === 0 ? <p className="empty">No projects have been published yet.</p> : <Work projects={rows} />}
    </main>
  )
}
