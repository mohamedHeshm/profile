export const SECTIONS = [
  { id: 'work', label: 'Projects' }, { id: 'about', label: 'About' }, { id: 'stack', label: 'Stack' }, { id: 'process', label: 'Process' }, { id: 'experience', label: 'Experience' },
  { id: 'education', label: 'Education' }, { id: 'services', label: 'Services' }, { id: 'exploring', label: 'Exploring' }, { id: 'contact', label: 'Contact' },
] as const
export const DEFAULT_ACCENT = '#4b4fb0'
const IDS: string[] = SECTIONS.map((s) => s.id)
// Ids come from a fixed list enforced by CHECK constraints, so interpolating them into CSS is safe.
export const sectionCss = (order: string[], hidden: string[]) =>
  [...hidden.map((s) => `#${s}{display:none}`), ...order.map((s, i) => `#${s}{order:${i}}`)].join('')
/** Saved order plus any newer sections, placed just before Contact. */
export function fullOrder(saved: string[] = []): string[] {
  const known = saved.filter((s) => IDS.includes(s))
  const missing = IDS.filter((s) => !known.includes(s))
  const at = known.indexOf('contact')
  return at < 0 ? [...known, ...missing] : [...known.slice(0, at), ...missing, ...known.slice(at)]
}
