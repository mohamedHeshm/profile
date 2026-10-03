import { useCallback, useEffect, useState, type ChangeEvent, type DragEvent } from 'react'
import { supabase } from '../../lib/supabase'
import { uploadImage } from '../../lib/upload'

interface Img { id: string; image_url: string; sort_order: number }
interface Props { uid: string; projectId: string; cover: string | null; onCover: (url: string) => void }

export default function GalleryEditor({ uid, projectId, cover, onCover }: Props) {
  const [imgs, setImgs] = useState<Img[]>([])
  const [busy, setBusy] = useState(false)
  const [over, setOver] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const load = useCallback(async () => {
    const { data, error } = await supabase.from('project_images').select('id,image_url,sort_order').eq('project_id', projectId).order('sort_order').order('created_at')
    if (error) setErr('Unable to load the gallery.'); else setImgs(data as Img[])
  }, [projectId])
  useEffect(() => { void load() }, [load])

  async function upload(f: File) {
    setBusy(true); setErr(null)
    try {
      const url = await uploadImage(uid, f)
      const { error } = await supabase.from('project_images').insert({ project_id: projectId, owner_id: uid, image_url: url, sort_order: imgs.length })
      if (error) throw new Error('Unable to save this image.')
      await load()
    } catch (x) { setErr(x instanceof Error ? x.message : 'Unable to upload image.') }
    setBusy(false)
  }
  const pick = (e: ChangeEvent<HTMLInputElement>) => { const f = e.target.files?.[0]; e.target.value = ''; if (f) void upload(f) }
  const drop = (e: DragEvent<HTMLLabelElement>) => { e.preventDefault(); setOver(false); const f = e.dataTransfer.files[0]; if (f) void upload(f) }
  async function swap(i: number, dir: -1 | 1) {
    const a = imgs[i], b = imgs[i + dir]
    if (!a || !b) return
    const res = await Promise.all([supabase.from('project_images').update({ sort_order: b.sort_order }).eq('id', a.id), supabase.from('project_images').update({ sort_order: a.sort_order }).eq('id', b.id)])
    if (res.some((r) => r.error)) setErr('Unable to reorder.'); else await load()
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
      {imgs.length > 0 && (
        <div className="gallery">{imgs.map((i, n) => (
          <figure key={i.id} className="gal-item">
            <img src={i.image_url} alt="Gallery preview" loading="lazy" />
            <figcaption className="row">
              {cover === i.image_url ? <span className="badge">Cover</span> : <button type="button" className="link" onClick={() => onCover(i.image_url)}>Set as cover</button>}
              <button type="button" className="link" disabled={n === 0} onClick={() => void swap(n, -1)} aria-label="Move earlier">Earlier</button>
              <button type="button" className="link" disabled={n === imgs.length - 1} onClick={() => void swap(n, 1)} aria-label="Move later">Later</button>
              <button type="button" className="link danger" onClick={() => void remove(i)}>Remove</button>
            </figcaption>
          </figure>))}</div>
      )}
      {err && <p role="alert" className="err">{err}</p>}
      <label className={`drop${over ? ' over' : ''}`} onDragOver={(e) => { e.preventDefault(); setOver(true) }} onDragLeave={() => setOver(false)} onDrop={drop}>
        {busy ? 'Uploading…' : 'Drop a screenshot here, or click to choose'}
        <input hidden type="file" disabled={busy} accept="image/jpeg,image/png,image/webp" onChange={pick} />
      </label>
    </fieldset>
  )
}
