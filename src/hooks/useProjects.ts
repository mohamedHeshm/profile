import { CARD_COLS, type ProjectCard } from '../lib/projects'
import { useRows } from './useRows'

/** The single source of project data for the Home showcase and the /projects gallery (published projects only). */
export function useProjects(ownerId?: string) {
  const { rows, loading, error, reload } = useRows<ProjectCard>('projects', ownerId, true, CARD_COLS)
  return { projects: rows, loading, error, reload }
}