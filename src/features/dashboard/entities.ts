import type { TableName } from '../../hooks/useRows'

export type Row = { id: string } & Record<string, unknown>
export interface Field { key: string; label: string; type: 'text' | 'textarea' | 'date' | 'url' | 'checkbox'; required?: boolean }
export interface EntityConfig { table: TableName; singular: string; fields: Field[]; title: (r: Row) => string; subtitle?: (r: Row) => string; hasVisible: boolean }

const str = (v: unknown) => (typeof v === 'string' ? v : '')

export const ENTITIES: Record<string, EntityConfig> = {
  Skills: { table: 'skills', singular: 'skill', hasVisible: true, title: (r) => str(r.name), subtitle: (r) => str(r.category) + (r.featured ? ' · Featured' : ''),
    fields: [{ key: 'name', label: 'Name', type: 'text', required: true }, { key: 'category', label: 'Category', type: 'text', required: true }, { key: 'featured', label: 'Featured', type: 'checkbox' }] },
  Experience: { table: 'experiences', singular: 'experience', hasVisible: true, title: (r) => `${str(r.position)} at ${str(r.company)}`, subtitle: (r) => str(r.location),
    fields: [{ key: 'company', label: 'Company', type: 'text', required: true }, { key: 'position', label: 'Position', type: 'text', required: true }, { key: 'location', label: 'Location', type: 'text' },
      { key: 'start_date', label: 'Start date', type: 'date' }, { key: 'end_date', label: 'End date', type: 'date' }, { key: 'current', label: 'I work here now', type: 'checkbox' }, { key: 'description', label: 'Description', type: 'textarea' }] },
  Education: { table: 'education', singular: 'education entry', hasVisible: true, title: (r) => str(r.institution), subtitle: (r) => [str(r.degree), str(r.field)].filter(Boolean).join(', '),
    fields: [{ key: 'institution', label: 'University', type: 'text', required: true }, { key: 'degree', label: 'Degree', type: 'text' }, { key: 'field', label: 'Field of study', type: 'text' },
      { key: 'start_date', label: 'Start date', type: 'date' }, { key: 'end_date', label: 'End date', type: 'date' }, { key: 'description', label: 'Description', type: 'textarea' }] },
  Services: { table: 'services', singular: 'service', hasVisible: true, title: (r) => str(r.title),
    fields: [{ key: 'title', label: 'Service name', type: 'text', required: true }, { key: 'description', label: 'Description', type: 'textarea' }] },
  Links: { table: 'social_links', singular: 'link', hasVisible: false, title: (r) => str(r.platform), subtitle: (r) => str(r.url),
    fields: [{ key: 'platform', label: 'Platform (e.g. GitHub)', type: 'text', required: true }, { key: 'url', label: 'URL (https:// or mailto:)', type: 'url', required: true }] },
}
