import { useCallback, useEffect, useState, type ChangeEvent } from 'react'
import { supabase } from '../../lib/supabase'
import { uploadImage } from '../../lib/upload'

interface Img { id: string; image_url: string }

export default function GalleryEditor({ uid, projectId }: { uid: string; projectId: string }) {
  const [imgs, setImgs] = useState<Img[]>([])
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const load = useCallback(async () => {
    const { data, error } = await supabase.from('project_images').select('id,image_url').eq('project_id', projectId).order('sort_order').order('created_at')
    if (error) setErr('Unable to load the gallery.'); else setImgs(data as Img[])
  }, [projectId])
  useEffect(() => { void load() }, [load])

  async function add(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; e.target.value = ''
    if (!f) return
    setBusy(true); setErr(null)
    try {
      const url = await uploadImage(uid, f)
      const { error } = await supabase.from('project_images').insert({ project_id: projectId, owner_id: uid, image_url: url, sort_order: imgs.length })
      if (error) throw new Error('Unable to save this image.')
      await load()
    } catch (x) { setErr(x instanceof Error ? x.message : 'Unable to upload image.') }
    setBusy(false)
  }
  async function remove(i: Img) {
    if (!window.confirm('Remove this image? This action cannot be undone.')) return
    const { error } = await supabase.from('project_images').delete().eq('id', i.id)
    if (error) return setErr('Unable to remove this image.')
    const path = i.image_url.split('/media/')[1]
    if (path) await supabase.storage.from('media').remove([path])
    await load()
  }
  return (
    <fieldset className="sections-edit"><legend>Gallery</legend>
      {imgs.length === 0 ? <p className="muted">No gallery images yet.</p> : (
        <div className="gallery">{imgs.map((i) => <figure key={i.id} className="gal-item"><img src={i.image_url} alt="Gallery preview" loading="lazy" /><button type="button" className="link danger" onClick={() => void remove(i)}>Remove</button></figure>)}</div>
      )}
      {err && <p role="alert" className="err">{err}</p>}
      <label className="btn">{busy ? 'Uploading…' : 'Add image'}<input hidden type="file" disabled={busy} accept="image/jpeg,image/png,image/webp" onChange={add} /></label>
    </fieldset>
  )
}
