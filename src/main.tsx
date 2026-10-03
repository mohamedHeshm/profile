import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './features/auth/AuthContext'
import ErrorBoundary from './components/ErrorBoundary'
import { configured } from './lib/supabase'
import '@fontsource/instrument-serif/400.css'
import '@fontsource-variable/inter'
import './styles.css'

const Home = lazy(() => import('./pages/Home'))
const Login = lazy(() => import('./pages/Login'))
const ProjectPage = lazy(() => import('./pages/ProjectPage'))
const Dashboard = lazy(() => import('./pages/Dashboard'))

try {
  const saved = localStorage.getItem('theme')
  document.documentElement.dataset.theme = saved ?? 'dark'
} catch { /* storage unavailable: keep the default theme */ }

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <ErrorBoundary>
      {!configured ? (
        <main className="auth"><h1>Supabase is not configured</h1><p>Copy <code>.env.example</code> to <code>.env</code> and add your project URL and anon key.</p></main>
      ) : (
        <BrowserRouter><AuthProvider><Suspense fallback={<div className="skeleton" />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/projects/:id" element={<ProjectPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="*" element={<main className="auth"><h1>Page not found</h1><a href="/">Back to site</a></main>} />
          </Routes>
        </Suspense></AuthProvider></BrowserRouter>
      )}
    </ErrorBoundary>
  </StrictMode>,
)
