import { useCallback, useEffect, useState } from 'react'
import { shortDate } from '../../lib/format'
import { supabase } from '../../lib/supabase'
import type { ContactMessage } from '../../types'

export default function MessagesList() {
  const [rows, setRows] = useState<ContactMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)
  const load = useCallback(async () => {
    const { data, error } = await supabase.from('contact_messages').select('*').order('created_at', { ascending: false }).limit(100)
    if (error) setErr('We could not load your messages. Check your connection and try again.')
    else { setRows(data as ContactMessage[]); setErr(null) }
    setLoading(false)
  }, [])
  useEffect(() => { void load() }, [load])

  async function toggle(m: ContactMessage) {
    const { error } = await supabase.from('contact_messages').update({ is_read: !m.is_read }).eq('id', m.id)
    if (error) setErr('Unable to update this message.'); else void load()
  }
  async function remove(m: ContactMessage) {
    if (!window.confirm('Delete this message? This action cannot be undone.')) return
    const { error } = await supabase.from('contact_messages').delete().eq('id', m.id)
    if (error) setErr('Unable to delete this message.'); else void load()
  }
  if (loading) return <div className="skeleton" />
  return (
    <>
      {err && <p role="alert" className="err">{err}</p>}
      {rows.length === 0 ? <p className="empty">No messages yet. They appear here when someone uses your contact form.</p> : (
        <ul className="list">{rows.map((m) => (
          <li key={m.id}>
            <span>
              <strong>{m.subject}</strong> {!m.is_read && <span className="badge on">New</span>}<br />
              <span className="muted">{m.name} · {m.email} · {shortDate(m.created_at)}</span>
              <span style={{ display: 'block', whiteSpace: 'pre-line', marginTop: 8, maxWidth: '62ch' }}>{m.message}</span>
            </span>
            <span className="row">
              <a className="link" href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.subject}`)}`}>Reply</a>
              <button className="link" onClick={() => void toggle(m)}>{m.is_read ? 'Mark unread' : 'Mark read'}</button>
              <button className="link danger" onClick={() => void remove(m)}>Delete</button>
            </span>
          </li>))}</ul>
      )}
    </>
  )
}
