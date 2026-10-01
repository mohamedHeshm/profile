import { useState, type ChangeEvent, type FormEvent } from 'react'
import { supabase } from '../../lib/supabase'
import { useRows } from '../../hooks/useRows'
import { uploadImage } from '../../lib/upload'
import GalleryEditor from './GalleryEditor'
import type { Project } from '../../types'

type Draft = Omit<Project, 'id' | 'owner_id' | 'sort_order'>
const empty: Draft = { title: '', summary: '', description: '', image_url: null, technologies: [], github_url: null, live_url: null, featured: false, published: false, role: '', challenges: '', solutions: '', results: '' }

export default function ProjectsManager({ uid }: { uid: string }) {
  const { rows, loading, error, reload } = useRows<Project>('projects', uid)
  const [editing, setEditing] = useState<string | null>(null)
  const [d, setD] = useState<Draft>(empty)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((p) => ({ ...p, [k]: v }))

  function open(p?: Project) {
    if (p) { const { id: _i, owner_id: _o, sort_order: _s, ...rest } = p; setD(rest); setEditing(p.id) } else { setD(empty); setEditing('new') }
    setErr(null)
  }
  async function save(e: FormEvent) {
    e.preventDefault(); setBusy(true); setErr(null)
    const payload = { ...d, github_url: d.github_url || null, live_url: d.live_url || null }
    const { error: er } = editing === 'new'
      ? await supabase.from('projects').insert({ ...payload, owner_id: uid, sort_order: rows.length })
      : await supabase.from('projects').update(payload).eq('id', editing as string)
    setBusy(false)
    if (er) return setErr('Unable to save this project. Links must start with http:// or https://.')
    setEditing(null); void reload()
  }
  async function pick(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; e.target.value = ''
    if (!f) return
    try { set('image_url', await uploadImage(uid, f)) } catch (x) { setErr(x instanceof Error ? x.message : 'Unable to upload image.') }
  }
  async function remove(p: Project) {
    if (!window.confirm(`Delete “${p.title}”? This action cannot be undone.`)) return
    const { error: er } = await supabase.from('projects').delete().eq('id', p.id)
    if (er) setErr('Unable to delete this project.'); else void reload()
  }

  if (editing) return (
    <form onSubmit={save} className="stack" aria-busy={busy}>
      <label>Project name<input required maxLength={120} value={d.title} onChange={(e) => set('title', e.target.value)} /></label>
      <label>Short description<input maxLength={200} value={d.summary} onChange={(e) => set('summary', e.target.value)} /></label>
      <label>Full description<textarea rows={5} value={d.description} onChange={(e) => set('description', e.target.value)} /></label>
      {(['role', 'challenges', 'solutions', 'results'] as const).map((k) => <label key={k}>{k[0].toUpperCase() + k.slice(1)}<textarea rows={k === 'role' ? 1 : 3} value={d[k]} onChange={(e) => set(k, e.target.value)} /></label>)}
      <label>Technologies (comma separated)<input value={d.technologies.join(', ')} onChange={(e) => set('technologies', e.target.value.split(',').map((t) => t.trim()).filter(Boolean))} /></label>
      <label>GitHub URL<input type="url" value={d.github_url ?? ''} onChange={(e) => set('github_url', e.target.value)} /></label>
      <label>Live demo URL<input type="url" value={d.live_url ?? ''} onChange={(e) => set('live_url', e.target.value)} /></label>
      <div className="avatar-row">{d.image_url && <img className="thumb-sm" src={d.image_url} alt="Cover preview" />}<label className="btn">{d.image_url ? 'Replace cover' : 'Upload cover'}<input hidden type="file" accept="image/jpeg,image/png,image/webp" onChange={pick} /></label>{d.image_url && <button type="button" className="link" onClick={() => set('image_url', null)}>Remove</button>}</div>
      <label className="check"><input type="checkbox" checked={d.featured} onChange={(e) => set('featured', e.target.checked)} />Featured</label>
      <label className="check"><input type="checkbox" checked={d.published} onChange={(e) => set('published', e.target.checked)} />Published</label>
      {editing === 'new' ? <p className="muted">Save the project first, then add gallery images.</p> : <GalleryEditor uid={uid} projectId={editing} />}
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
          <li key={p.id}><span><strong>{p.title}</strong> <span className="muted">{p.published ? 'Published' : 'Draft'}{p.featured ? ' · Featured' : ''}</span></span>
            <span className="row"><button className="link" onClick={() => open(p)}>Edit</button><button className="link danger" onClick={() => void remove(p)}>Delete</button></span></li>))}</ul>
      )}
    </>
  )
}
