import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Dashboard from './pages/Dashboard'
import Templates from './pages/Templates'
import Payment from './pages/Payment'
import CreateCard from './pages/CreateCard'
import CardView from './pages/CardView'
import ShareView from './pages/ShareView'
import NotFound from './pages/NotFound'

// Redirige les utilisateurs déjà connectés vers le dashboard
function GuestRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (user) return <Navigate to="/dashboard" replace />
  return children
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
        <Routes>
          <Route path="/share/:slug" element={<ShareView />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login"          element={<GuestRoute><Login /></GuestRoute>} />
        <Route path="/signup"         element={<GuestRoute><Signup /></GuestRoute>} />
        <Route path="/forgot-password"element={<GuestRoute><ForgotPassword /></GuestRoute>} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/dashboard"   element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/templates"   element={<ProtectedRoute><Templates /></ProtectedRoute>} />
        <Route path="/payment/:tier"  element={<ProtectedRoute><Payment /></ProtectedRoute>} />
        <Route path="/create-card"    element={<ProtectedRoute><CreateCard /></ProtectedRoute>} />
        <Route path="/card/:id"       element={<ProtectedRoute><CardView /></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  )
}
