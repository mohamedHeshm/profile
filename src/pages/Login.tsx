import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../features/auth/AuthContext'

export default function Login() {
  const { session, recovery, done } = useAuth()
  const nav = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  if (recovery) return <NewPassword onDone={done} />
  if (session) return <Navigate to="/dashboard" replace />

  async function submit(e: FormEvent) {
    e.preventDefault(); setBusy(true); setMsg(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setBusy(false)
    if (error) setMsg({ ok: false, text: 'The email or password is incorrect.' })
    else nav('/dashboard')
  }
  async function reset() {
    if (!email) return setMsg({ ok: false, text: 'Enter your email first, then choose reset.' })
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + '/login' })
    setMsg(error ? { ok: false, text: 'Unable to send the reset email. Try again shortly.' } : { ok: true, text: 'Check your inbox for a reset link.' })
  }
  return (
    <main className="auth">
      <form onSubmit={submit} className="stack" aria-busy={busy}>
        <h1>Sign in</h1>
        <label>Email<input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" /></label>
        <label>Password<input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" /></label>
        {msg && <p role="status" className={msg.ok ? 'ok' : 'err'}>{msg.text}</p>}
        <button className="btn primary" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
        <div className="row"><button type="button" className="link" onClick={reset}>Reset password</button><Link to="/">Back to site</Link></div>
      </form>
    </main>
  )
}

function NewPassword({ onDone }: { onDone: () => void }) {
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  async function submit(e: FormEvent) {
    e.preventDefault(); setBusy(true); setErr(null)
    const { error } = await supabase.auth.updateUser({ password })
    setBusy(false)
    if (error) setErr('Unable to update your password. Use at least 8 characters, or request a new link.')
    else onDone()
  }
  return (
    <main className="auth">
      <form onSubmit={submit} className="stack" aria-busy={busy}>
        <h1>New password</h1>
        <label>Password<input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" /></label>
        {err && <p role="alert" className="err">{err}</p>}
        <button className="btn primary" disabled={busy}>{busy ? 'Saving…' : 'Set password'}</button>
      </form>
    </main>
  )
}
