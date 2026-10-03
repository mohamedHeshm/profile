export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-/i
export const projectPath = (p: { id: string; slug: string | null }) => `/projects/${p.slug || p.id}`
