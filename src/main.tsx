import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import ErrorBoundary from './components/ErrorBoundary'
import { AuthProvider } from './features/auth/AuthContext'
import { initMagnetic } from './lib/magnetic'
import { configured } from './lib/supabase'
import { routes } from './routes'
import './styles.css'

try {
  const saved = localStorage.getItem('theme')
  document.documentElement.dataset.theme = saved ?? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
} catch { /* storage unavailable: keep the default theme */ }

initMagnetic()
const router = configured ? createBrowserRouter(routes) : null

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <ErrorBoundary>
      {router ? (
        <AuthProvider><RouterProvider router={router} /></AuthProvider>
      ) : (
        <main className="auth"><h1>Supabase is not configured</h1><p>Copy <code>.env.example</code> to <code>.env</code> and add your project URL and anon key.</p></main>
      )}
    </ErrorBoundary>
  </StrictMode>,
)
