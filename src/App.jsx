import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
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
import ShareHome from './pages/ShareHome'
import NotFound from './pages/NotFound'

export default function App() {
  const location = useLocation()
  const shareDomain = import.meta.env.VITE_SHARE_DOMAIN
  const isShareHost = shareDomain ? window.location.hostname === shareDomain : false

  const shareRedirect = <Navigate to="/share" replace />

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {!isShareHost && <Navbar />}
      <Routes>
        <Route path="/" element={isShareHost ? <Navigate to="/share" replace /> : <Home />} />
        <Route path="/login" element={isShareHost ? shareRedirect : <Login />} />
        <Route path="/signup" element={isShareHost ? shareRedirect : <Signup />} />
        <Route path="/forgot-password" element={isShareHost ? shareRedirect : <ForgotPassword />} />
        <Route path="/reset-password" element={isShareHost ? shareRedirect : <ResetPassword />} />
        <Route path="/share" element={<ShareHome />} />
        <Route path="/share/:slug" element={<ShareView />} />
        <Route path="/dashboard" element={isShareHost ? shareRedirect : <ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/templates" element={isShareHost ? shareRedirect : <ProtectedRoute><Templates /></ProtectedRoute>} />
        <Route path="/payment/:tier" element={isShareHost ? shareRedirect : <ProtectedRoute><Payment /></ProtectedRoute>} />
        <Route path="/create-card" element={isShareHost ? shareRedirect : <ProtectedRoute><CreateCard /></ProtectedRoute>} />
        <Route path="/card/:id" element={isShareHost ? shareRedirect : <ProtectedRoute><CardView /></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  )
}
