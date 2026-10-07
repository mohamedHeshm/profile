import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { toggleTheme } from '../lib/theme'

interface Props { name: string; logo?: string | null; items: { id: string; label: string; to?: string }[]; showDashboard: boolean }

export default function Nav({ name, logo, items, showDashboard }: Props) {
  const [active, setActive] = useState('home')
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const key = items.map((i) => i.id).join()

  useEffect(() => {
    const els = items.map((i) => document.getElementById(i.id)).filter((e): e is HTMLElement => e !== null)
    if (!els.length) return
    const io = new IntersectionObserver((es) => { const hit = es.find((e) => e.isIntersecting); if (hit) setActive(hit.target.id) }, { rootMargin: '-40% 0px -55% 0px' })
    els.forEach((e) => io.observe(e))
    return () => io.disconnect()
  }, [key]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    let raf = 0
    const on = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => setScrolled(window.scrollY > 8)) }
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => { window.removeEventListener('scroll', on); cancelAnimationFrame(raf) }
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [open])

  return (
    <header className={`nav${scrolled ? ' scrolled' : ''}`}>
      <div className="nav-in">
        <a href="#home" className="brand-link" aria-label={`${name}, home`}>{logo ? <img className="logo" src={logo} alt="" /> : name}</a>
        <nav aria-label="Main" className="nav-links">
          {items.map((i) => i.to
            ? <Link key={i.id} to={i.to} viewTransition>{i.label}</Link>
            : <a key={i.id} href={`#${i.id}`} className={active === i.id ? 'active' : ''} aria-current={active === i.id ? 'true' : undefined}>{i.label}</a>)}
        </nav>
        <span className="grow" />
        <button className="link" onClick={toggleTheme}>Theme</button>
        {showDashboard && <Link className="btn small" to="/dashboard">Dashboard</Link>}
        <button className="link menu-toggle" aria-expanded={open} aria-controls="mobile-menu" onClick={() => setOpen(!open)}>{open ? 'Close' : 'Menu'}</button>
      </div>
      {open && (
        <div id="mobile-menu" className="menu" role="dialog" aria-modal="true" aria-label="Menu">
          {items.map((i, n) => i.to
            ? <Link key={i.id} to={i.to} viewTransition onClick={() => setOpen(false)}><small>{String(n + 1).padStart(2, '0')}</small>{i.label}</Link>
            : <a key={i.id} href={`#${i.id}`} onClick={() => setOpen(false)}><small>{String(n + 1).padStart(2, '0')}</small>{i.label}</a>)}
        </div>
      )}
    </header>
  )
}