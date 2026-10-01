import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { setMeta } from '../lib/seo'
import type { Project } from '../types'

export default function ProjectPage() {
  const { id } = useParams()
  const [imgs, setImgs] = useState<{ id: string; image_url: string }[]>([])
  const [p, setP] = useState<Project | null | undefined>(undefined)
  useEffect(() => {
    setP(undefined)
    void supabase.from('projects').select('*').eq('id', id ?? '').eq('published', true).maybeSingle()
      .then(({ data }) => setP((data as Project | null) ?? null))
  }, [id])
  useEffect(() => {
    if (!p) return
    setMeta({ title: p.title, description: p.summary, image: p.image_url })
  }, [p])

  useEffect(() => {
    if (!p) return
    void supabase.from('project_images').select('id,image_url').eq('project_id', p.id).order('sort_order').then(({ data }) => setImgs((data as { id: string; image_url: string }[] | null) ?? []))
  }, [p])

  return (
    <main className="wrap detail">
      <p><Link to="/">Back to portfolio</Link></p>
      {p === undefined ? <div className="skeleton hero-skel" /> : p === null ? (
        <section className="empty"><h1>Project not found</h1><p>It may have been unpublished or the link is wrong.</p></section>
      ) : (
        <article>
          <h1>{p.title}</h1>
          <p className="lead">{p.summary}</p>
          {p.image_url && <img className="cover" src={p.image_url} alt={`Screenshot of ${p.title}`} />}
          {p.description && <p className="prose">{p.description}</p>}
          {imgs.length > 0 && <div className="gallery">{imgs.map((i) => <img key={i.id} src={i.image_url} alt={`${p.title} screenshot`} loading="lazy" />)}</div>}
          {([['My role', p.role], ['Challenges', p.challenges], ['Solutions', p.solutions], ['Results', p.results]] as const).filter(([, v]) => v).map(([h, v]) => <section key={h}><h2>{h}</h2><p className="prose">{v}</p></section>)}
          {p.technologies.length > 0 && <p className="meta">Built with {p.technologies.join(', ')}</p>}
          <p className="links">{p.live_url && <a href={p.live_url} target="_blank" rel="noreferrer noopener">Live demo</a>}{p.github_url && <a href={p.github_url} target="_blank" rel="noreferrer noopener">Source code</a>}</p>
        </article>
      )}
    </main>
  )
}
