export const SECTIONS = [
  { id: 'work', label: 'Work' }, { id: 'stack', label: 'Stack' }, { id: 'about', label: 'About' },
  { id: 'experience', label: 'Experience' }, { id: 'education', label: 'Education' }, { id: 'services', label: 'Services' }, { id: 'contact', label: 'Contact' },
] as const
export const DEFAULT_ACCENT = '#2b5c8a'
// Ids come from a fixed list enforced by CHECK constraints, so interpolating them into CSS is safe.
export const sectionCss = (order: string[], hidden: string[]) =>
  [...hidden.map((s) => `#${s}{display:none}`), ...order.map((s, i) => `#${s}{order:${i}}`)].join('')
