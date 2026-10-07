import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useProfile } from '../hooks/useRows'
import { useProjects } from '../hooks/useProjects'
import { setMeta } from '../lib/seo'
import Work from './home/Work'

export default function Projects() {
  const { profile, loading: loadingProfile } = useProfile()
  const { projects, loading, error, reload } = useProjects(profile?.id)
  useEffect(() => { setMeta({ title: `Projects${profile ? ` — ${profile.full_name}` : ''}`, description: profile?.short_bio }) }, [profile])

  let body
  if (loadingProfile || (profile && loading)) body = <div className="skeleton hero-skel" aria-busy="true" />
  else if (error) body = <section className="empty"><h1>We couldn’t load the projects</h1><p>{error}</p><button className="btn primary" onClick={() => void reload()}>Try again</button></section>
  else if (projects.length === 0) body = <section className="empty"><h1>No projects available.</h1><p>Published projects will appear here.</p></section>
  else body = <Work projects={projects} />

  return (
    <main className="wrap case-page">
      <p><Link to="/" className="back" viewTransition>← Home</Link></p>
      {body}
    </main>
  )
}