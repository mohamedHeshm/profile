const fmt = (d: string | null) => (d ? new Date(d).toLocaleDateString('en', { month: 'short', year: 'numeric' }) : '')
export const range = (s: string | null, e: string | null, current = false) => [fmt(s), current ? 'Present' : fmt(e)].filter(Boolean).join(' – ')
export const lines = (s: string) => s.split('\n').map((l) => l.trim()).filter(Boolean)
export const shortDate = (d: string) => new Date(d).toLocaleDateString('en', { day: 'numeric', month: 'short', year: 'numeric' })
