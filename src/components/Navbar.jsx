import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Menu, X, LogOut, Home, LayoutGrid, LayoutDashboard } from 'lucide-react'

function LogoIcon() {
  return (
    <svg width="36" height="28" viewBox="0 0 36 28" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="nav-lg" x1="0" y1="0" x2="36" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7dd3fc" />
          <stop offset="1" stopColor="#0369a1" />
        </linearGradient>
      </defs>
      <rect x="8" y="7" width="26" height="18" rx="3.5" fill="rgba(56,189,248,0.20)" stroke="rgba(56,189,248,0.30)" strokeWidth="0.8" />
      <rect x="2" y="2" width="26" height="18" rx="3.5" fill="url(#nav-lg)" />
      <rect x="2" y="6.5" width="26" height="3.5" fill="rgba(0,0,0,0.22)" />
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

const NAV_LINKS = [
  { to: '/',          label: 'Accueil',   Icon: Home },
  { to: '/templates', label: 'Catalogue', Icon: LayoutGrid },
]

export default function Navbar() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  // Bloquer le scroll du body quand le menu est ouvert
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  // Fermer le menu sur changement de route
  useEffect(() => { setMenuOpen(false) }, [pathname])

  async function handleSignOut() {
    setMenuOpen(false)
    await signOut()
    navigate('/')
  }

  const initials = user?.email?.charAt(0).toUpperCase() || '?'
  const username = user?.email?.split('@')[0] || ''

  const links = user
    ? [...NAV_LINKS, { to: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard }]
    : NAV_LINKS

  return (
    <>
      {/* ════════════════ BARRE PRINCIPALE ════════════════ */}
      <nav className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-5 h-[62px] flex items-center justify-between gap-6">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <LogoIcon />
            <span className="font-bold text-[17px] tracking-tight leading-none select-none">
              <span className="text-white">Card</span>
              <span className="text-sky-400">Gen</span>
            </span>
          </Link>

          {/* Nav desktop */}
          <div className="hidden md:flex items-center gap-7 flex-1">
            <NavItem to="/" label="Accueil" />
            <NavItem to="/templates" label="Catalogue" />
            {user && <NavItem to="/dashboard" label="Dashboard" />}
          </div>

          {/* Auth desktop */}
          <div className="hidden md:flex items-center gap-2.5 shrink-0">
            {user ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/60 border border-slate-700/50 rounded-full">
                  <span className="w-5 h-5 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                    {initials}
                  </span>
                  <span className="text-slate-300 text-xs max-w-[130px] truncate">{username}</span>
                </div>
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
                <Link to="/login" className="text-sm text-slate-400 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-slate-800/50">
                  Connexion
                </Link>
                <Link to="/signup" className="text-sm font-semibold px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white transition shadow-lg shadow-sky-900/40 active:scale-[0.97]">
                  S'inscrire
                </Link>
              </>
            )}
          </div>

          {/* Hamburger mobile */}
          <button
            onClick={() => setMenuOpen(v => !v)}
            aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            className="md:hidden relative z-[70] w-9 h-9 flex items-center justify-center text-slate-300 hover:text-white rounded-xl hover:bg-slate-800/60 transition"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* ════════════════ OVERLAY MOBILE PLEIN ÉCRAN ════════════════ */}
      <div
        className={`md:hidden fixed inset-0 z-[60] flex flex-col bg-slate-950 transition-all duration-300 ease-out ${
          menuOpen
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 -translate-y-3 pointer-events-none'
        }`}
      >
        {/* En-tête overlay — réplique la barre */}
        <div className="flex items-center justify-between px-5 h-[62px] border-b border-white/[0.06] shrink-0">
          <Link to="/" onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5">
            <LogoIcon />
            <span className="font-bold text-[17px] tracking-tight leading-none select-none">
              <span className="text-white">Card</span>
              <span className="text-sky-400">Gen</span>
            </span>
          </Link>
          <button
            onClick={() => setMenuOpen(false)}
            className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-white bg-slate-800/60 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corps — liens de navigation */}
        <div className="flex-1 overflow-y-auto px-5 pt-8 pb-4">
          <p className="text-slate-600 text-[11px] font-semibold uppercase tracking-widest mb-4 px-1">
            Navigation
          </p>
          <div className="space-y-1.5">
            {links.map(({ to, label, Icon }) => {
              const active = pathname === to
              return (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-4 px-4 py-4 rounded-2xl transition-all ${
                    active
                      ? 'bg-sky-500/10 border border-sky-500/20 text-sky-400'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60 border border-transparent'
                  }`}
                >
                  <span className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    active ? 'bg-sky-500/20 text-sky-400' : 'bg-slate-800 text-slate-400'
                  }`}>
                    <Icon className="w-4.5 h-4.5" style={{ width: 18, height: 18 }} />
                  </span>
                  <span className="text-base font-semibold">{label}</span>
                  {active && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-sky-400" />
                  )}
                </Link>
              )
            })}
          </div>
        </div>

        {/* Pied — section utilisateur ou auth */}
        <div className="px-5 pb-10 pt-4 border-t border-white/[0.06] shrink-0">
          {user ? (
            <div className="space-y-3">
              {/* Carte utilisateur */}
              <div className="flex items-center gap-3 px-4 py-3.5 bg-slate-900 border border-slate-800 rounded-2xl">
                <span className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 text-white text-sm font-bold flex items-center justify-center shrink-0">
                  {initials}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-semibold truncate">{username}</p>
                  <p className="text-slate-500 text-xs truncate">{user.email}</p>
                </div>
              </div>
              {/* Déconnexion */}
              <button
                onClick={handleSignOut}
                className="w-full flex items-center justify-center gap-2.5 py-3 rounded-2xl border border-red-900/50 bg-red-950/30 text-red-400 hover:bg-red-950/50 text-sm font-semibold transition active:scale-[0.98]"
              >
                <LogOut className="w-4 h-4" />
                Déconnexion
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <Link
                to="/signup"
                onClick={() => setMenuOpen(false)}
                className="w-full text-center text-sm font-semibold py-3.5 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-xl shadow-sky-900/30 active:scale-[0.98] transition"
              >
                Créer un compte
              </Link>
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="w-full text-center text-sm font-medium py-3.5 rounded-2xl border border-slate-700/60 text-slate-300 hover:text-white hover:border-slate-600 transition active:scale-[0.98]"
              >
                Se connecter
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
