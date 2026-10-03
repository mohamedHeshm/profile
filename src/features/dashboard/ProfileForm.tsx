import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import { supabase } from '../../lib/supabase'
import { useProfile } from '../../hooks/useRows'
import { uploadImage } from '../../lib/upload'
import type { Profile } from '../../types'

type Draft = Omit<Profile, 'id'>
const blank = (email: string): Draft => ({ full_name: '', username: null, job_title: '', short_bio: '', full_bio: '', location: '', email, avatar_url: null, resume_url: null, years_experience: null, available: true })

export default function ProfileForm({ uid, email }: { uid: string; email: string }) {
  const { profile, loading, reload } = useProfile(uid)
  const [d, setD] = useState<Draft>(blank(email))
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null)
  const [busy, setBusy] = useState(false)
  useEffect(() => { if (profile) { const { id: _id, ...rest } = profile; setD(rest) } }, [profile])
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((p) => ({ ...p, [k]: v }))

  async function save(e: FormEvent) {
    e.preventDefault()
    if (!d.full_name.trim()) return setStatus({ ok: false, text: 'Full name is required.' })
    setBusy(true); setStatus(null)
    const { error } = await supabase.from('profiles').upsert({ id: uid, ...d, username: d.username?.trim() || null })
    setBusy(false)
    if (error) setStatus({ ok: false, text: error.code === '23505' ? 'That username is taken.' : 'Unable to save your profile. Try again.' })
    else { setStatus({ ok: true, text: 'Profile saved.' }); void reload() }
  }
  async function pick(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; e.target.value = ''
    if (!file) return
    setStatus({ ok: true, text: 'Uploading…' })
    try { set('avatar_url', await uploadImage(uid, file)); setStatus({ ok: true, text: 'Uploaded. Save to apply.' }) }
    catch (err) { setStatus({ ok: false, text: err instanceof Error ? err.message : 'Unable to upload image.' }) }
  }
  if (loading) return <div className="skeleton" />
  return (
    <form onSubmit={save} className="stack" aria-busy={busy}>
      <div className="avatar-row">
        {d.avatar_url ? <img className="avatar" src={d.avatar_url} alt="Profile preview" /> : <div className="avatar ph" aria-hidden>?</div>}
        <label className="btn">Upload photo<input hidden type="file" accept="image/jpeg,image/png,image/webp" onChange={pick} /></label>
        {d.avatar_url && <button type="button" className="link" onClick={() => set('avatar_url', null)}>Remove</button>}
      </div>
      <label>Full name<input value={d.full_name} onChange={(e) => set('full_name', e.target.value)} required maxLength={80} /></label>
      <label>Job title<input value={d.job_title} onChange={(e) => set('job_title', e.target.value)} maxLength={80} /></label>
      <label>Short bio<textarea rows={2} maxLength={200} value={d.short_bio} onChange={(e) => set('short_bio', e.target.value)} /></label>
      <label>Full bio<textarea rows={6} maxLength={2000} value={d.full_bio} onChange={(e) => set('full_bio', e.target.value)} /></label>
      <label>Location<input value={d.location} onChange={(e) => set('location', e.target.value)} maxLength={80} /></label>
      <label>Public email<input type="email" value={d.email} onChange={(e) => set('email', e.target.value)} /></label>
      <label>Resume link (URL to your CV)<input type="url" value={d.resume_url ?? ''} onChange={(e) => set('resume_url', e.target.value || null)} /></label>
      <label>Years of experience<input type="number" min={0} max={60} value={d.years_experience ?? ''} onChange={(e) => set('years_experience', e.target.value === '' ? null : Number(e.target.value))} /></label>
      <label className="check"><input type="checkbox" checked={d.available} onChange={(e) => set('available', e.target.checked)} />Available for work</label>
      {status && <p role="status" className={status.ok ? 'ok' : 'err'}>{status.text}</p>}
      <button className="btn primary" disabled={busy}>{busy ? 'Saving…' : 'Save profile'}</button>
    </form>
  )
}
