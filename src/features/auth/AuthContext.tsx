import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../../lib/supabase'

interface Ctx { session: Session | null; ready: boolean; recovery: boolean; done: () => void }
const AuthCtx = createContext<Ctx>({ session: null, ready: false, recovery: false, done: () => undefined })
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthCtx)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [ready, setReady] = useState(false)
  const [recovery, setRecovery] = useState(false)
  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => { setSession(data.session); setReady(true) })
    const { data } = supabase.auth.onAuthStateChange((e, s) => { setSession(s); if (e === 'PASSWORD_RECOVERY') setRecovery(true) })
    return () => data.subscription.unsubscribe()
  }, [])
  return <AuthCtx.Provider value={{ session, ready, recovery, done: () => setRecovery(false) }}>{children}</AuthCtx.Provider>
}
