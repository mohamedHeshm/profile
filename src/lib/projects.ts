import type { Project } from '../types'

export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-/i
export const projectPath = (p: { id: string; slug: string | null }) => `/projects/${p.slug || p.id}`

/** The fields every project card needs; also the only columns the list queries select. */
export type ProjectCard = Pick<Project, 'id' | 'slug' | 'title' | 'summary' | 'image_url' | 'technologies' | 'github_url' | 'live_url' | 'featured' | 'category' | 'role' | 'year'>
export const CARD_COLS = 'id,slug,title,summary,image_url,technologies,github_url,live_url,featured,category,role,year'
export const featuredFirst = (list: ProjectCard[]) => [...list].sort((a, b) => Number(b.featured) - Number(a.featured))