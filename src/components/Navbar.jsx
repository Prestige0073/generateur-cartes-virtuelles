import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Menu, X, LogOut } from 'lucide-react'

function LogoIcon() {
  return (
    <svg width="36" height="28" viewBox="0 0 36 28" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="nav-lg" x1="0" y1="0" x2="36" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7dd3fc" />
          <stop offset="1" stopColor="#0369a1" />
        </linearGradient>
      </defs>
      {/* Carte arrière — décalée */}
      <rect x="8" y="7" width="26" height="18" rx="3.5" fill="rgba(56,189,248,0.20)" stroke="rgba(56,189,248,0.30)" strokeWidth="0.8" />
      {/* Carte avant — gradient */}
      <rect x="2" y="2" width="26" height="18" rx="3.5" fill="url(#nav-lg)" />
      {/* Bande magnétique */}
      <rect x="2" y="6.5" width="26" height="3.5" fill="rgba(0,0,0,0.22)" />
      {/* Puce EMV */}
      <rect x="5" y="13.5" width="7" height="5" rx="1.3" fill="#f0c040" />
      <line x1="7.3" y1="13.5" x2="7.3" y2="18.5" stroke="rgba(110,75,0,0.35)" strokeWidth="0.85" />
      <line x1="9.7" y1="13.5" x2="9.7" y2="18.5" stroke="rgba(110,75,0,0.35)" strokeWidth="0.85" />
      <line x1="5" y1="16" x2="12" y2="16" stroke="rgba(110,75,0,0.25)" strokeWidth="0.85" />
    </svg>
  )
}

function NavItem({ to, label }) {
  const { pathname } = useLocation()
  const active = pathname === to
  return (
    <Link
      to={to}
      className={`text-sm font-medium transition-colors duration-150 ${
        active ? 'text-white' : 'text-slate-400 hover:text-slate-100'
      }`}
    >
      {label}
    </Link>
  )
}

function MobileNavItem({ to, label, onClick }) {
  const { pathname } = useLocation()
  const active = pathname === to
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition ${
        active
          ? 'bg-slate-800 text-white'
          : 'text-slate-400 hover:text-white hover:bg-slate-900/80'
      }`}
    >
      {label}
    </Link>
  )
}

export default function Navbar() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  async function handleSignOut() {
    setMenuOpen(false)
    await signOut()
    navigate('/')
  }

  const initials = user?.email?.charAt(0).toUpperCase() || '?'

  return (
    <nav className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-xl border-b border-white/[0.06]">
      <div className="max-w-6xl mx-auto px-5 h-[62px] flex items-center justify-between gap-6">

        {/* ── Logo ── */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
          <LogoIcon />
          <span className="font-bold text-[17px] tracking-tight leading-none select-none">
            <span className="text-white">Card</span>
            <span className="text-sky-400">Gen</span>
          </span>
        </Link>

        {/* ── Nav links desktop ── */}
        <div className="hidden md:flex items-center gap-7 flex-1">
          <NavItem to="/" label="Accueil" />
          <NavItem to="/templates" label="Catalogue" />
          {user && <NavItem to="/dashboard" label="Dashboard" />}
        </div>

        {/* ── Auth desktop ── */}
        <div className="hidden md:flex items-center gap-2.5 shrink-0">
          {user ? (
            <div className="flex items-center gap-2">
              {/* Badge utilisateur */}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/60 border border-slate-700/50 rounded-full">
                <span className="w-5 h-5 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                  {initials}
                </span>
                <span className="text-slate-300 text-xs max-w-[130px] truncate">
                  {user.email?.split('@')[0]}
                </span>
              </div>
              {/* Bouton déconnexion */}
              <button
                onClick={handleSignOut}
                title="Déconnexion"
                className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-red-400 hover:bg-red-950/60 border border-transparent hover:border-red-900/40 rounded-lg transition"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm text-slate-400 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-slate-800/50"
              >
                Connexion
              </Link>
              <Link
                to="/signup"
                className="text-sm font-semibold px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white transition shadow-lg shadow-sky-900/40 active:scale-[0.97]"
              >
                S'inscrire
              </Link>
            </>
          )}
        </div>

        {/* ── Hamburger mobile ── */}
        <button
          onClick={() => setMenuOpen(v => !v)}
          aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          className="md:hidden w-9 h-9 flex items-center justify-center text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60 transition"
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* ── Menu mobile ── */}
      {menuOpen && (
        <div className="md:hidden border-t border-white/[0.06] bg-slate-950 px-4 pt-4 pb-5 flex flex-col gap-1">
          <MobileNavItem to="/" label="Accueil" onClick={() => setMenuOpen(false)} />
          <MobileNavItem to="/templates" label="Catalogue" onClick={() => setMenuOpen(false)} />
          {user && <MobileNavItem to="/dashboard" label="Dashboard" onClick={() => setMenuOpen(false)} />}

          <div className="my-3 border-t border-slate-800/80" />

          {user ? (
            <div className="space-y-2">
              {/* Info utilisateur */}
              <div className="flex items-center gap-3 px-3 py-2.5 bg-slate-900/80 rounded-xl border border-slate-800/80">
                <span className="w-7 h-7 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                  {initials}
                </span>
                <span className="text-slate-300 text-sm truncate">{user.email}</span>
              </div>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-red-400 hover:text-red-300 hover:bg-red-950/40 rounded-xl transition text-sm font-medium"
              >
                <LogOut className="w-4 h-4" />
                Déconnexion
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2 pt-1">
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="text-center text-sm font-medium text-slate-300 hover:text-white py-2.5 px-4 rounded-xl border border-slate-700/60 hover:border-slate-600 transition"
              >
                Connexion
              </Link>
              <Link
                to="/signup"
                onClick={() => setMenuOpen(false)}
                className="text-center text-sm font-semibold py-2.5 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-900/30"
              >
                S'inscrire
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  )
}
