import { useState, type ChangeEvent } from 'react'
import { uploadImage } from '../../lib/upload'

interface Props { uid: string; label: string; value: string | null; onChange: (url: string | null) => void }

export default function ImageField({ uid, label, value, onChange }: Props) {
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  async function pick(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; e.target.value = ''
    if (!f) return
    setBusy(true); setErr(null)
    try { onChange(await uploadImage(uid, f)) } catch (x) { setErr(x instanceof Error ? x.message : 'Unable to upload image.') }
    setBusy(false)
  }
  return (
    <div className="avatar-row">
      {value && <img className="thumb-sm" src={value} alt={`${label} preview`} />}
      <label className="btn">{busy ? 'Uploading…' : value ? `Replace ${label}` : `Upload ${label}`}<input hidden type="file" disabled={busy} accept="image/jpeg,image/png,image/webp" onChange={pick} /></label>
      {value && <button type="button" className="link" onClick={() => onChange(null)}>Remove</button>}
      {err && <span role="alert" className="err">{err}</span>}
    </div>
  )
}
