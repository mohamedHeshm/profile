import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useReveal } from '../hooks/useReveal'
import { lines } from '../lib/format'
import { UUID, projectPath } from '../lib/projects'
import { setMeta } from '../lib/seo'
import { supabase } from '../lib/supabase'
import type { Project } from '../types'

interface Img { id: string; image_url: string }
interface Sib { id: string; slug: string | null; title: string }

function Block({ title, children }: { title: string; children?: ReactNode }) {
  if (!children) return null
  return <section className="cs-sec reveal"><h2 className="kicker">{title}</h2><div>{children}</div></section>
}
const Text = ({ v }: { v: string }) => (v ? <p className="prose">{v}</p> : null)

export default function ProjectPage() {
  const { slug = '' } = useParams<{ slug: string }>()
  const key = slug.toLowerCase() // slugs are stored lowercase (enforced by the database)
  const [p, setP] = useState<Project | null | undefined>(undefined)
  const [failed, setFailed] = useState(false)
  const [tries, setTries] = useState(0)
  const [imgs, setImgs] = useState<Img[]>([])
  const [sibs, setSibs] = useState<Sib[]>([])
  const [zoom, setZoom] = useState<string | null>(null)
  const dlg = useRef<HTMLDialogElement>(null)
  useReveal(p?.id)

  useEffect(() => {
    setP(undefined); setImgs([]); setFailed(false)
    void (async () => {
      // RLS returns published projects to visitors and drafts only to their owner.
      const [one, list] = await Promise.all([
        supabase.from('projects').select('*').eq(UUID.test(key) ? 'id' : 'slug', key).maybeSingle(),
        supabase.from('projects').select('id,slug,title').eq('published', true).order('sort_order'),
      ])
      if (one.error) { setFailed(true); setP(null); return }
      const proj = (one.data as Project | null) ?? null
      setP(proj); setSibs((list.data as Sib[] | null) ?? [])
      if (proj) {
        const g = await supabase.from('project_images').select('id,image_url').eq('project_id', proj.id).order('sort_order')
        setImgs((g.data as Img[] | null) ?? [])
      }
    })()
  }, [key, tries])
  useEffect(() => { if (p) setMeta({ title: `${p.title} — Case study`, description: p.summary, image: p.image_url }) }, [p])
  useEffect(() => { if (zoom) dlg.current?.showModal() }, [zoom])

  const i = p ? sibs.findIndex((s) => s.id === p.id) : -1
  const next = sibs.length > 1 && i >= 0 ? sibs[(i + 1) % sibs.length] : null
  return (
    <main className="wrap case-page">
      <p><Link to="/projects" className="back" viewTransition>← Back to all projects</Link></p>
      {p === undefined ? <div className="skeleton hero-skel" /> : p === null ? (
        failed
          ? <section className="empty"><h1>We couldn’t load this project</h1><p>Check your connection and try again.</p><button className="btn primary" onClick={() => setTries(tries + 1)}>Try again</button></section>
          : <section className="empty"><h1>Project not found</h1><p>It may have been unpublished or the link is wrong.</p><Link className="btn primary" to="/projects">Back to Projects</Link></section>
      ) : (
        <article>
          {!p.published && <p className="draft">Draft preview. Only you can see this page.</p>}
          <header className="cs-head">
            <p className="kicker">{p.category || 'Case study'}</p>
            <h1 className="display">{p.title}</h1>
            {p.summary && <p className="lead">{p.summary}</p>}
            <dl className="cs-meta">
              {p.role && <div><dt className="kicker">My role</dt><dd>{p.role}</dd></div>}
              {p.technologies.length > 0 && <div><dt className="kicker">Stack</dt><dd>{p.technologies.join(', ')}</dd></div>}
            </dl>
            <p className="case-links">
              {p.live_url && <a className="btn primary" href={p.live_url} target="_blank" rel="noreferrer noopener">Live demo</a>}
              {p.github_url && <a className="btn" href={p.github_url} target="_blank" rel="noreferrer noopener">Source code</a>}
            </p>
          </header>
          {p.image_url && <div className="shot big" style={{ viewTransitionName: 'project-image' }}><span className="chrome" aria-hidden="true"><i /><i /><i /></span><img src={p.image_url} alt={`${p.title} screenshot`} width={1600} height={1000} decoding="async" /></div>}
          <Block title="Overview"><Text v={p.description} /></Block>
          <Block title="What problem it solves"><Text v={p.problem} /></Block>
          <Block title="Solution"><Text v={p.solutions} /></Block>
          <Block title="Key features">{lines(p.features).length > 0 && <ul className="featlist">{lines(p.features).map((f) => <li key={f}>{f}</li>)}</ul>}</Block>
          <Block title="Tech stack">{p.technologies.length > 0 && <ul className="tags">{p.technologies.map((t) => <li key={t}>{t}</li>)}</ul>}</Block>
          <Block title="Architecture"><Text v={p.architecture} /></Block>
          <Block title="Challenges"><Text v={p.challenges} /></Block>
          <Block title="Engineering decisions"><Text v={p.decisions} /></Block>
          <Block title="Results"><Text v={p.results} /></Block>
          {imgs.length > 0 && (
            <section className="cs-sec"><h2 className="kicker">Screenshots</h2>
              <div className="shots">{imgs.map((g) => <button key={g.id} className="gal-btn" aria-label="Enlarge screenshot" onClick={() => setZoom(g.image_url)}><img src={g.image_url} alt={`${p.title} screenshot`} loading="lazy" decoding="async" /></button>)}</div>
            </section>
          )}
          {next && <Link className="next" to={projectPath(next)} viewTransition><span className="kicker">Next project</span><span className="display">{next.title}</span></Link>}
        </article>
      )}
      {zoom && <dialog ref={dlg} className="lightbox" onClose={() => setZoom(null)} onClick={() => dlg.current?.close()}><img src={zoom} alt="Enlarged screenshot" /></dialog>}
    </main>
  )
}
