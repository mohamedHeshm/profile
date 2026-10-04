import type { PointerEvent } from 'react'
import type { Profile } from '../../types'
import type { ProjectCard } from './Work'

interface Props { profile: Profile; projects: ProjectCard[]; stack: string[] }

export default function HeroVisual({ profile, projects, stack }: Props) {
  const move = (e: PointerEvent<HTMLDivElement>) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const r = e.currentTarget.getBoundingClientRect()
    e.currentTarget.style.setProperty('--px', String(((e.clientX - r.left) / r.width - 0.5) * 2))
    e.currentTarget.style.setProperty('--py', String(((e.clientY - r.top) / r.height - 0.5) * 2))
  }
  const reset = (e: PointerEvent<HTMLDivElement>) => { e.currentTarget.style.setProperty('--px', '0'); e.currentTarget.style.setProperty('--py', '0') }
  const [a, b] = projects
  const ident = profile.full_name.split(/\s+/)[0].toLowerCase().replace(/[^a-z0-9]/g, '') || 'engineer'
  const code = [`const ${ident} = {`, `  role: "${profile.job_title}",`, ...(stack.length ? [`  stack: [${stack.slice(0, 4).map((s) => `"${s}"`).join(', ')}],`] : []), ...(profile.location ? [`  location: "${profile.location}",`] : []), `  available: ${profile.available},`, '}'].join('\n')
  const shot = (p: ProjectCard | undefined, fallback: string) => p?.image_url ? <img src={p.image_url} alt="" loading="eager" decoding="async" /> : <span className="win-ph">{p?.title ?? fallback}</span>
  return (
    <div className="viz" onPointerMove={move} onPointerLeave={reset} aria-hidden="true">
      <svg className="flow" viewBox="0 0 100 100" preserveAspectRatio="none"><path d="M30 30 C 55 28, 60 52, 78 56" /><path d="M78 56 C 70 78, 50 80, 34 84" /><circle cx="30" cy="30" r="1.1" /><circle cx="78" cy="56" r="1.1" /><circle cx="34" cy="84" r="1.1" /></svg>
      <div className="win w1"><span className="chrome"><i /><i /><i /></span>{shot(a, 'Selected work')}</div>
      <div className="win w2"><span className="chrome"><i /><i /><i /></span><pre>{code}</pre></div>
      <div className="win w3"><span className="chrome"><i /><i /><i /></span>{shot(b ?? a, 'Next project')}</div>
      {stack.slice(0, 4).map((s, i) => <span key={s} className={`lbl l${i}`}>{s}</span>)}
      <span className="build">BUILD {new Date().getFullYear()}.{String(new Date().getMonth() + 1).padStart(2, '0')}</span>
    </div>
  )
}
