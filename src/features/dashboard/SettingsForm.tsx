import { useEffect, useState, type FormEvent } from 'react'
import { supabase } from '../../lib/supabase'
import { useSettings } from '../../hooks/useRows'
import ImageField from './ImageField'
import { lines } from '../../lib/format'
import { DEFAULT_ACCENT, SECTIONS, fullOrder } from '../../lib/sections'

const IDS: string[] = SECTIONS.map((s) => s.id)
const label = (id: string) => SECTIONS.find((s) => s.id === id)?.label ?? id

export default function SettingsForm({ uid }: { uid: string }) {
  const { settings, loading, reload } = useSettings(uid)
  const [title, setTitle] = useState('')
  const [accent, setAccent] = useState(DEFAULT_ACCENT)
  const [order, setOrder] = useState<string[]>(IDS)
  const [hidden, setHidden] = useState<string[]>([])
  const [heroText, setHeroText] = useState('')
  const [exploring, setExploring] = useState('')
  const [logo, setLogo] = useState<string | null>(null)
  const [favicon, setFavicon] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)

  useEffect(() => {
    if (loading) return
    setTitle(settings?.site_title ?? ''); setAccent(settings?.accent ?? DEFAULT_ACCENT)
    setOrder(fullOrder(settings?.section_order)); setExploring((settings?.exploring ?? []).join('\n')); setHidden(settings?.hidden_sections ?? [])
    setHeroText(settings?.hero_text ?? ''); setLogo(settings?.logo_url ?? null); setFavicon(settings?.favicon_url ?? null)
  }, [settings, loading])

  const move = (i: number, dir: -1 | 1) => setOrder((o) => { const n = [...o]; [n[i], n[i + dir]] = [n[i + dir], n[i]]; return n })
  const toggle = (id: string) => setHidden((h) => (h.includes(id) ? h.filter((x) => x !== id) : [...h, id]))

  async function save(e: FormEvent) {
    e.preventDefault(); setBusy(true); setMsg(null)
    const { error } = await supabase.from('portfolio_settings').upsert({ owner_id: uid, site_title: title.trim(), hero_text: heroText.trim(), exploring: lines(exploring).slice(0, 6).map((l) => l.slice(0, 100)), logo_url: logo, favicon_url: favicon, accent, section_order: order, hidden_sections: hidden })
    setBusy(false)
    if (error) setMsg({ ok: false, text: 'Unable to save settings. Save your profile first, then try again.' })
    else { setMsg({ ok: true, text: 'Settings saved.' }); void reload() }
  }
  if (loading) return <div className="skeleton" />
  return (
    <form onSubmit={save} className="stack" aria-busy={busy}>
      <label>Website title<input maxLength={80} value={title} onChange={(e) => setTitle(e.target.value)} /></label>
      <label>Hero text (replaces your short bio under your name)<textarea rows={2} maxLength={160} value={heroText} onChange={(e) => setHeroText(e.target.value)} /></label>
      <label>Currently exploring (one per line, up to 6)<textarea rows={3} value={exploring} onChange={(e) => setExploring(e.target.value)} /></label>
      <ImageField uid={uid} label="logo" value={logo} onChange={setLogo} />
      <ImageField uid={uid} label="favicon" value={favicon} onChange={setFavicon} />
      <label>Accent color (light theme)<input type="color" value={accent} onChange={(e) => setAccent(e.target.value)} /></label>
      <fieldset className="sections-edit"><legend>Sections</legend>
        <ul className="list">{order.map((id, i) => (
          <li key={id}>
            <label className="check"><input type="checkbox" checked={!hidden.includes(id)} onChange={() => toggle(id)} />{label(id)}</label>
            <span className="row">
              <button type="button" className="link" disabled={i === 0} onClick={() => move(i, -1)} aria-label={`Move ${label(id)} up`}>Up</button>
              <button type="button" className="link" disabled={i === order.length - 1} onClick={() => move(i, 1)} aria-label={`Move ${label(id)} down`}>Down</button>
            </span>
          </li>))}</ul>
      </fieldset>
      {msg && <p role="status" className={msg.ok ? 'ok' : 'err'}>{msg.text}</p>}
      <button className="btn primary" disabled={busy}>{busy ? 'Saving…' : 'Save settings'}</button>
    </form>
  )
}
