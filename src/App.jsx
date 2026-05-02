import { Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
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

export default function App() {
  const shareDomain = import.meta.env.VITE_SHARE_DOMAIN
  const isShareHost = shareDomain ? window.location.hostname === shareDomain : false

  useEffect(() => {
    document.title = isShareHost ? 'ShareCards' : 'CardGen — Générateur de Cartes Bancaires'
  }, [isShareHost])

  // Domaine de partage : seul /share/:slug est accessible, tout le reste → 404
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

  // Site principal
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/templates" element={<ProtectedRoute><Templates /></ProtectedRoute>} />
        <Route path="/payment/:tier" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
        <Route path="/create-card" element={<ProtectedRoute><CreateCard /></ProtectedRoute>} />
        <Route path="/card/:id" element={<ProtectedRoute><CardView /></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  )
}
