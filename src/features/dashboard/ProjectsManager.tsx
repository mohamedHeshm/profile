import { useState, type ChangeEvent, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { shortDate } from '../../lib/format'
import { projectPath } from '../../lib/projects'
import { supabase } from '../../lib/supabase'
import { uploadImage } from '../../lib/upload'
import { useRows } from '../../hooks/useRows'
import type { Project } from '../../types'
import GalleryEditor from './GalleryEditor'

type Draft = Omit<Project, 'id' | 'owner_id' | 'sort_order' | 'updated_at'>
type TextKey = 'category' | 'role' | 'description' | 'problem' | 'solutions' | 'features' | 'architecture' | 'challenges' | 'decisions' | 'results'
const empty: Draft = { title: '', slug: null, category: '', summary: '', description: '', problem: '', solutions: '', features: '', architecture: '', challenges: '', decisions: '', results: '', role: '', image_url: null, logo_url: null, technologies: [], github_url: null, live_url: null, featured: false, published: false }
const TEXT: [TextKey, string, number][] = [['category', 'Category', 1], ['role', 'Your role', 1], ['problem', 'Problem it solves', 3], ['solutions', 'Solution', 3], ['features', 'Key features (one per line)', 4], ['architecture', 'Architecture', 3], ['challenges', 'Challenges', 3], ['decisions', 'Engineering decisions', 3], ['results', 'Results (real outcomes only)', 3], ['description', 'Extra description', 3]]

export default function ProjectsManager({ uid }: { uid: string }) {
  const { rows, loading, error, reload } = useRows<Project>('projects', uid)
  const [editing, setEditing] = useState<string | null>(null)
  const [d, setD] = useState<Draft>(empty)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((p) => ({ ...p, [k]: v }))

  function open(p?: Project) {
    if (p) { const { id, owner_id: _o, sort_order: _s, updated_at: _u, ...rest } = p; setD(rest); setEditing(id) } else { setD(empty); setEditing('new') }
    setErr(null)
  }
  async function save(e: FormEvent) {
    e.preventDefault(); setBusy(true); setErr(null)
    const payload = { ...d, slug: d.slug || null, github_url: d.github_url || null, live_url: d.live_url || null }
    const { error: er } = editing === 'new'
      ? await supabase.from('projects').insert({ ...payload, owner_id: uid, sort_order: rows.length })
      : await supabase.from('projects').update(payload).eq('id', editing as string)
    setBusy(false)
    if (er) return setErr('Unable to save this project. Check that the slug is unique (letters, numbers, hyphens) and that links start with http:// or https://.')
    setEditing(null); void reload()
  }
  async function cover(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; e.target.value = ''
    if (!f) return
    try { set('image_url', await uploadImage(uid, f)) } catch (x) { setErr(x instanceof Error ? x.message : 'Unable to upload image.') }
  }
  async function duplicate(p: Project) {
    const { id: _i, updated_at: _u, ...rest } = p
    const { error: er } = await supabase.from('projects').insert({ ...rest, title: `${p.title} (copy)`.slice(0, 120), slug: null, featured: false, published: false, sort_order: rows.length })
    if (er) setErr('Unable to duplicate this project.'); else void reload()
  }
  async function remove(p: Project) {
    if (!window.confirm(`Delete “${p.title}”? This action cannot be undone.`)) return
    const { error: er } = await supabase.from('projects').delete().eq('id', p.id)
    if (er) setErr('Unable to delete this project.'); else void reload()
  }

  if (editing) return (
    <form onSubmit={save} className="stack wide" aria-busy={busy}>
      <label>Project name<input required maxLength={120} value={d.title} onChange={(e) => set('title', e.target.value)} /></label>
      <label>URL slug (optional, e.g. clinic-platform)<input maxLength={60} value={d.slug ?? ''} onChange={(e) => set('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') || null)} /></label>
      <label>Short description<input maxLength={200} value={d.summary} onChange={(e) => set('summary', e.target.value)} /></label>
      {TEXT.map(([k, label, rowsN]) => <label key={k}>{label}<textarea rows={rowsN} value={d[k]} onChange={(e) => set(k, e.target.value)} /></label>)}
      <label>Technologies (comma separated)<input value={d.technologies.join(', ')} onChange={(e) => set('technologies', e.target.value.split(',').map((t) => t.trim()).filter(Boolean))} /></label>
      <label>Live demo URL<input type="url" value={d.live_url ?? ''} onChange={(e) => set('live_url', e.target.value)} /></label>
      <label>Source URL<input type="url" value={d.github_url ?? ''} onChange={(e) => set('github_url', e.target.value)} /></label>
      <div className="avatar-row">{d.image_url && <img className="thumb-sm" src={d.image_url} alt="Cover preview" />}<label className="btn">{d.image_url ? 'Replace cover' : 'Upload cover'}<input hidden type="file" accept="image/jpeg,image/png,image/webp" onChange={cover} /></label>{d.image_url && <button type="button" className="link" onClick={() => set('image_url', null)}>Remove</button>}</div>
      {editing === 'new' ? <p className="muted">Save the project first, then add gallery screenshots.</p> : <GalleryEditor uid={uid} projectId={editing} cover={d.image_url} onCover={(u) => set('image_url', u)} />}
      <label className="check"><input type="checkbox" checked={d.featured} onChange={(e) => set('featured', e.target.checked)} />Featured (shown first)</label>
      <label className="check"><input type="checkbox" checked={d.published} onChange={(e) => set('published', e.target.checked)} />Published</label>
      {err && <p role="alert" className="err">{err}</p>}
      <div className="row"><button className="btn primary" disabled={busy}>{busy ? 'Saving…' : 'Save project'}</button><button type="button" className="btn" onClick={() => setEditing(null)}>Cancel</button></div>
    </form>
  )
  return (
    <>
      <p><button className="btn primary" onClick={() => open()}>Add project</button></p>
      {(err || error) && <p role="alert" className="err">{err ?? error}</p>}
      {loading ? <div className="skeleton" /> : rows.length === 0 ? <p className="empty">No projects yet. Add your first project.</p> : (
        <ul className="list">{rows.map((p) => (
          <li key={p.id}>
            <span className="proj-main">
              {p.image_url ? <img className="thumb-sm" src={p.image_url} alt="" loading="lazy" /> : <span className="thumb-sm ph" aria-hidden="true" />}
              <span><strong>{p.title}</strong><br /><span className="muted">{p.technologies.slice(0, 4).join(', ') || 'No technologies yet'} · Updated {shortDate(p.updated_at)}</span><br />
                <span className={`badge${p.published ? ' on' : ''}`}>{p.published ? 'Published' : 'Draft'}</span>{p.featured && <span className="badge on">Featured</span>}</span>
            </span>
            <span className="row">
              <button className="link" onClick={() => open(p)}>Edit</button>
              <Link className="link" to={projectPath(p)}>Preview</Link>
              <button className="link" onClick={() => void duplicate(p)}>Duplicate</button>
              <button className="link danger" onClick={() => void remove(p)}>Delete</button>
            </span>
          </li>))}</ul>
      )}
    </>
  )
}
