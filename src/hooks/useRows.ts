import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { PortfolioSettings, Profile } from '../types'

export type TableName = 'skills' | 'projects' | 'experiences' | 'education' | 'services' | 'social_links'

export function useRows<T>(table: TableName, ownerId?: string, publicOnly = false) {
  const [rows, setRows] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const load = useCallback(async () => {
    setLoading(true)
    let q = supabase.from(table).select('*').order('sort_order').order('created_at')
    if (ownerId) q = q.eq('owner_id', ownerId)
    if (publicOnly && table !== 'social_links') q = q.eq(table === 'projects' ? 'published' : 'visible', true)
    const { data, error: e } = await q
    if (e) setError('We could not load this data. Check your connection and try again.')
    else { setRows(data as T[]); setError(null) }
    setLoading(false)
  }, [table, ownerId, publicOnly])
  useEffect(() => { void load() }, [load])
  return { rows, loading, error, reload: load }
}

export function useProfile(id?: string) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const load = useCallback(async () => {
    setLoading(true)
    const q = supabase.from('profiles').select('*')
    const { data } = id ? await q.eq('id', id).maybeSingle() : await q.order('created_at').limit(1).maybeSingle()
    setProfile((data as Profile | null) ?? null)
    setLoading(false)
  }, [id])
  useEffect(() => { void load() }, [load])
  return { profile, loading, reload: load }
}

export function useSettings(ownerId?: string) {
  const [settings, setSettings] = useState<PortfolioSettings | null>(null)
  const [loading, setLoading] = useState(Boolean(ownerId))
  const reload = useCallback(async () => {
    if (!ownerId) return
    const { data } = await supabase.from('portfolio_settings').select('*').eq('owner_id', ownerId).maybeSingle()
    setSettings((data as PortfolioSettings | null) ?? null)
    setLoading(false)
  }, [ownerId])
  useEffect(() => { void reload() }, [reload])
  return { settings, loading, reload }
}
