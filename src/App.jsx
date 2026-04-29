import { Routes, Route } from 'react-router-dom'
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

export default function App() {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/share/:slug" element={<ShareView />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/templates" element={<ProtectedRoute><Templates /></ProtectedRoute>} />
        <Route path="/payment/:tier" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
        <Route path="/create-card" element={<ProtectedRoute><CreateCard /></ProtectedRoute>} />
        <Route path="/card/:id" element={<ProtectedRoute><CardView /></ProtectedRoute>} />
      </Routes>
    </div>
  )
}
