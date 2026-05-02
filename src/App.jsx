import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'

const Home          = lazy(() => import('./pages/Home'))
const Login         = lazy(() => import('./pages/Login'))
const Signup        = lazy(() => import('./pages/Signup'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const ResetPassword = lazy(() => import('./pages/ResetPassword'))
const Dashboard     = lazy(() => import('./pages/Dashboard'))
const Templates     = lazy(() => import('./pages/Templates'))
const Payment       = lazy(() => import('./pages/Payment'))
const CreateCard    = lazy(() => import('./pages/CreateCard'))
const CardView      = lazy(() => import('./pages/CardView'))
const ShareView     = lazy(() => import('./pages/ShareView'))
const NotFound      = lazy(() => import('./pages/NotFound'))

function GuestRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (user) return <Navigate to="/dashboard" replace />
  return children
}

function PageLoader() {
  return <div className="min-h-screen bg-slate-900" />
}

export default function App() {
  const shareDomain = import.meta.env.VITE_SHARE_DOMAIN
  const isShareHost = shareDomain ? window.location.hostname === shareDomain : false

  useEffect(() => {
    document.title = isShareHost ? 'ShareCards' : 'CardGen — Générateur de Cartes Bancaires'
  }, [isShareHost])

  if (isShareHost) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/share/:slug" element={<ShareView />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Navbar />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login"           element={<GuestRoute><Login /></GuestRoute>} />
          <Route path="/signup"          element={<GuestRoute><Signup /></GuestRoute>} />
          <Route path="/forgot-password" element={<GuestRoute><ForgotPassword /></GuestRoute>} />
          <Route path="/reset-password"  element={<ResetPassword />} />
          <Route path="/dashboard"   element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/templates"   element={<ProtectedRoute><Templates /></ProtectedRoute>} />
          <Route path="/payment/:tier"   element={<ProtectedRoute><Payment /></ProtectedRoute>} />
          <Route path="/create-card"     element={<ProtectedRoute><CreateCard /></ProtectedRoute>} />
          <Route path="/card/:id"        element={<ProtectedRoute><CardView /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </div>
  )
}
