import { Suspense, lazy } from 'react'
import { Outlet, ScrollRestoration, type RouteObject } from 'react-router-dom'
import { ErrorScreen } from './components/ErrorBoundary'

const Home = lazy(() => import('./pages/Home'))
const Login = lazy(() => import('./pages/Login'))
const Projects = lazy(() => import('./pages/Projects'))
const ProjectPage = lazy(() => import('./pages/ProjectPage'))
const Dashboard = lazy(() => import('./pages/Dashboard'))

function Layout() {
  return (
    <>
      <ScrollRestoration />
      <Suspense fallback={<div className="skeleton" />}><Outlet /></Suspense>
    </>
  )
}

// A data router (createBrowserRouter) is required for View Transitions (shared project-image morph).
export const routes: RouteObject[] = [{
  element: <Layout />,
  errorElement: <ErrorScreen />,
  children: [
    { path: '/', element: <Home /> },
    { path: '/login', element: <Login /> },
    { path: '/projects', element: <Projects /> },
    { path: '/projects/:slug', element: <ProjectPage /> },
    { path: '/dashboard', element: <Dashboard /> },
    { path: '*', element: <main className="auth"><h1>Page not found</h1><a href="/">Back to site</a></main> },
  ],
}]
