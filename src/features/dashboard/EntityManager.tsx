import { useState, type FormEvent } from 'react'
import { supabase } from '../../lib/supabase'
import { useRows } from '../../hooks/useRows'
import type { EntityConfig, Row } from './entities'

export default function EntityManager({ uid, config }: { uid: string; config: EntityConfig }) {
  const { table, singular, fields, hasVisible } = config
  const { rows, loading, error, reload } = useRows<Row>(table, uid)
  const [editing, setEditing] = useState<string | null>(null)
  const [d, setD] = useState<Record<string, unknown>>({})
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  function open(r?: Row) {
    const init: Record<string, unknown> = {}
    fields.forEach((f) => { init[f.key] = r ? r[f.key] : f.type === 'checkbox' ? false : '' })
    setD(init); setEditing(r ? r.id : 'new'); setErr(null)
  }
  async function save(e: FormEvent) {
    e.preventDefault(); setBusy(true); setErr(null)
    const payload: Record<string, unknown> = {}
    fields.forEach((f) => { const v = d[f.key]; payload[f.key] = (f.type === 'date') && !v ? null : v })
    const { error: er } = editing === 'new'
      ? await supabase.from(table).insert({ ...payload, owner_id: uid, sort_order: rows.length })
      : await supabase.from(table).update(payload).eq('id', editing as string)
    setBusy(false)
    if (er) return setErr(`Unable to save this ${singular}. Check the fields and try again.`)
    setEditing(null); void reload()
  }
  async function run(op: PromiseLike<{ error: unknown }>[], fail: string) {
    const res = await Promise.all(op)
    if (res.some((r) => r.error)) setErr(fail); else { setErr(null); void reload() }
  }
  const move = (i: number, dir: -1 | 1) => {
    const a = rows[i], b = rows[i + dir]
    if (!a || !b) return
    void run([supabase.from(table).update({ sort_order: i + dir }).eq('id', a.id), supabase.from(table).update({ sort_order: i }).eq('id', b.id)], 'Unable to reorder.')
  }
  const remove = (r: Row) => {
    if (window.confirm(`Delete this ${singular}? This action cannot be undone.`)) void run([supabase.from(table).delete().eq('id', r.id)], `Unable to delete this ${singular}.`)
  }

  if (editing) return (
    <form onSubmit={save} className="stack" aria-busy={busy}>
      {fields.map((f) => f.type === 'checkbox'
        ? <label key={f.key} className="check"><input type="checkbox" checked={Boolean(d[f.key])} onChange={(e) => setD({ ...d, [f.key]: e.target.checked })} />{f.label}</label>
        : <label key={f.key}>{f.label}
          {f.type === 'textarea'
            ? <textarea rows={4} value={String(d[f.key] ?? '')} onChange={(e) => setD({ ...d, [f.key]: e.target.value })} />
            : <input type={f.type} required={f.required} value={String(d[f.key] ?? '')} onChange={(e) => setD({ ...d, [f.key]: e.target.value })} />}</label>)}
      {err && <p role="alert" className="err">{err}</p>}
      <div className="row"><button className="btn primary" disabled={busy}>{busy ? 'Saving…' : 'Save'}</button><button type="button" className="btn" onClick={() => setEditing(null)}>Cancel</button></div>
    </form>
  )
  return (
    <>
      <p><button className="btn primary" onClick={() => open()}>Add {singular}</button></p>
      {(err || error) && <p role="alert" className="err">{err ?? error}</p>}
      {loading ? <div className="skeleton" /> : rows.length === 0 ? <p className="empty">Nothing here yet. Add your first {singular}.</p> : (
        <ul className="list">{rows.map((r, i) => (
          <li key={r.id}>
            <span><strong>{config.title(r)}</strong> <span className="muted">{config.subtitle?.(r)}{hasVisible && r.visible === false ? ' Hidden' : ''}</span></span>
            <span className="row">
              <button className="link" disabled={i === 0} onClick={() => move(i, -1)} aria-label="Move up">Up</button>
              <button className="link" disabled={i === rows.length - 1} onClick={() => move(i, 1)} aria-label="Move down">Down</button>
              {hasVisible && <button className="link" onClick={() => void run([supabase.from(table).update({ visible: r.visible === false }).eq('id', r.id)], 'Unable to update.')}>{r.visible === false ? 'Show' : 'Hide'}</button>}
              <button className="link" onClick={() => open(r)}>Edit</button>
              <button className="link danger" onClick={() => remove(r)}>Delete</button>
            </span>
          </li>))}</ul>
      )}
    </>
  )
}
