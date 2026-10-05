import { useState, type FormEvent } from 'react'
import { supabase } from '../../lib/supabase'
import SocialLink from '../../components/SocialLink'
import type { SocialLink as SocialLinkRow } from '../../types'

interface Props { email: string; phone: string; links: SocialLinkRow[] }
type Status = { kind: 'idle' | 'sending' | 'ok' | 'err'; text: string }
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function Contact({ email, phone, links }: Props) {
  const [st, setSt] = useState<Status>({ kind: 'idle', text: '' })

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const f = new FormData(form)
    if (f.get('website')) return // honeypot
    const v = (k: string) => String(f.get(k) ?? '').trim()
    const [name, mail, subject, message] = [v('name'), v('email'), v('subject'), v('message')]
    if (!name || !subject) return setSt({ kind: 'err', text: 'Please fill in your name and a subject.' })
    if (!EMAIL_RE.test(mail)) return setSt({ kind: 'err', text: 'Please enter a valid email address.' })
    if (message.length < 10) return setSt({ kind: 'err', text: 'Your message is a bit short. Please add a few more words.' })
    setSt({ kind: 'sending', text: 'Sending…' })
    const { error } = await supabase.from('contact_messages').insert({ name, email: mail, subject, message })
    if (error) return setSt({ kind: 'err', text: 'Unable to send your message right now. Please try again or email me directly.' })
    form.reset()
    setSt({ kind: 'ok', text: 'Thanks! Your message was sent.' })
  }

  return (
    <section id="contact" className="sec" aria-labelledby="contact-title">
      <div className="contact">
        <div className="reveal">
          <p className="kicker">Get in touch</p>
          <h2 id="contact-title">Let’s build something<br />worth shipping.</h2>
          <p className="muted">Have a project in mind or just want to say hello?</p>
          <ul className="clinks">
            {email && <li><SocialLink name="Email" href={`mailto:${email}`} /></li>}
            {phone && <li><SocialLink name="Phone" href={`tel:${phone.replace(/[^+\d]/g, '')}`} /></li>}
            {links.map((l) => <li key={l.id}><SocialLink name={l.platform} href={l.url} /></li>)}
          </ul>
        </div>
        <form className="form reveal" onSubmit={(e) => void submit(e)} noValidate aria-busy={st.kind === 'sending'}>
          <label>Full name<input name="name" autoComplete="name" required maxLength={80} /></label>
          <label>Email address<input name="email" type="email" autoComplete="email" required maxLength={120} /></label>
          <label>Subject<input name="subject" required maxLength={120} /></label>
          <label>Message<textarea name="message" rows={5} required minLength={10} maxLength={2000} /></label>
          <input name="website" tabIndex={-1} autoComplete="off" className="hp" aria-hidden="true" />
          <button className="btn primary" disabled={st.kind === 'sending'}>{st.kind === 'sending' ? 'Sending…' : 'Send message'}</button>
          <p role="status" aria-live="polite" className={`form-status ${st.kind}`}>{st.text}</p>
        </form>
      </div>
    </section>
  )
}
