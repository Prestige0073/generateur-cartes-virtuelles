import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { CreditCard, Menu, X } from 'lucide-react'

export default function Navbar() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  const isActive = (path) => location.pathname === path

  return (
    <nav className="bg-slate-900/80 backdrop-blur border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl text-white">
          <CreditCard className="w-6 h-6 text-sky-400" />
          <span className="text-sky-400">Card</span>
          <span>Gen</span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <Link to="/" className={`text-sm font-medium transition ${isActive('/') ? 'text-sky-400' : 'text-slate-400 hover:text-white'}`}>
            Accueil
          </Link>
          <Link to="/templates" className={`text-sm font-medium transition ${isActive('/templates') ? 'text-sky-400' : 'text-slate-400 hover:text-white'}`}>
            Catalogue
          </Link>
          {user && (
            <Link to="/dashboard" className={`text-sm font-medium transition ${isActive('/dashboard') ? 'text-sky-400' : 'text-slate-400 hover:text-white'}`}>
              Dashboard
            </Link>
          )}
        </div>

        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <span className="text-slate-500 text-sm truncate max-w-[180px]">{user.email}</span>
              <button onClick={handleSignOut} className="bg-slate-800 hover:bg-slate-700 text-sm px-4 py-2 rounded-lg transition text-white">
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm text-slate-300 hover:text-white transition px-3 py-2">
                Connexion
              </Link>
              <Link to="/signup" className="bg-sky-500 hover:bg-sky-400 text-sm font-semibold px-4 py-2 rounded-lg transition text-white">
                S'inscrire
              </Link>
            </>
          )}
        </div>

        <button
          className="md:hidden text-slate-400 hover:text-white p-2"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-900 px-4 py-4 flex flex-col gap-3">
          <Link to="/" onClick={() => setMenuOpen(false)} className="text-slate-300 hover:text-white py-2">Accueil</Link>
          <Link to="/templates" onClick={() => setMenuOpen(false)} className="text-slate-300 hover:text-white py-2">Catalogue</Link>
          {user && <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="text-slate-300 hover:text-white py-2">Dashboard</Link>}
          <hr className="border-slate-800" />
          {user ? (
            <button onClick={handleSignOut} className="text-left text-red-400 hover:text-red-300 py-2">Déconnexion</button>
          ) : (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)} className="text-slate-300 hover:text-white py-2">Connexion</Link>
              <Link to="/signup" onClick={() => setMenuOpen(false)} className="text-sky-400 hover:text-sky-300 py-2 font-semibold">S'inscrire</Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
