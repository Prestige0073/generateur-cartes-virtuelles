import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

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
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-bold text-xl text-white">
          <span className="text-2xl">💳</span>
          <span className="text-violet-400">Card</span>
          <span>Gen</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/" className={`text-sm font-medium transition ${isActive('/') ? 'text-violet-400' : 'text-slate-400 hover:text-white'}`}>
            Accueil
          </Link>
          <Link to="/templates" className={`text-sm font-medium transition ${isActive('/templates') ? 'text-violet-400' : 'text-slate-400 hover:text-white'}`}>
            Catalogue
          </Link>
          {user && (
            <Link to="/dashboard" className={`text-sm font-medium transition ${isActive('/dashboard') ? 'text-violet-400' : 'text-slate-400 hover:text-white'}`}>
              Dashboard
            </Link>
          )}
        </div>

        {/* Auth buttons */}
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
              <Link to="/signup" className="bg-violet-600 hover:bg-violet-500 text-sm font-semibold px-4 py-2 rounded-lg transition text-white">
                S'inscrire
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-slate-400 hover:text-white p-2"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            }
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
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
              <Link to="/signup" onClick={() => setMenuOpen(false)} className="text-violet-400 hover:text-violet-300 py-2 font-semibold">S'inscrire</Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
