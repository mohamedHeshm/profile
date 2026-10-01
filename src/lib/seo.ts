function tag(sel: string, make: () => HTMLElement): HTMLElement {
  let el = document.head.querySelector<HTMLElement>(sel)
  if (!el) { el = make(); document.head.appendChild(el) }
  return el
}
function meta(attr: 'name' | 'property', key: string, content: string) {
  tag(`meta[${attr}="${key}"]`, () => { const m = document.createElement('meta'); m.setAttribute(attr, key); return m }).setAttribute('content', content)
}
function link(rel: string, href: string) {
  tag(`link[rel="${rel}"]`, () => { const l = document.createElement('link'); l.rel = rel; return l }).setAttribute('href', href)
}

export function setMeta({ title, description, image }: { title: string; description?: string | null; image?: string | null }) {
  document.title = title
  const d = description ?? ''
  meta('name', 'description', d); meta('property', 'og:title', title); meta('property', 'og:description', d); meta('property', 'og:type', 'website')
  meta('name', 'twitter:card', image ? 'summary_large_image' : 'summary'); meta('name', 'twitter:title', title); meta('name', 'twitter:description', d)
  if (image) { meta('property', 'og:image', image); meta('name', 'twitter:image', image) }
  link('canonical', window.location.origin + window.location.pathname)
}
export const setFavicon = (href: string) => link('icon', href)
