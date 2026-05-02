import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LogIn, Eye, EyeOff, Mail, ArrowRight } from 'lucide-react'

function parseLoginError(err) {
  if (!err) return null
  const msg = err.message?.toLowerCase() || ''
  const status = err.status

  if (status === 429 || msg.includes('too many') || msg.includes('rate limit')) {
    return 'Trop de tentatives. Attends quelques minutes avant de réessayer.'
  }
  if (msg.includes('email not confirmed') || msg.includes('email_not_confirmed')) {
    return 'Ton compte n\'est pas encore confirmé. Vérifie ta boîte mail et clique sur le lien de confirmation.'
  }
  if (msg.includes('invalid login credentials') || msg.includes('invalid credentials') || status === 400) {
    return 'Email ou mot de passe incorrect.'
  }
  if (msg.includes('network') || msg.includes('fetch') || !navigator.onLine) {
    return 'Erreur de connexion. Vérifie ton réseau et réessaie.'
  }
  return 'Une erreur est survenue. Réessaie.'
}

export default function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const successMessage = location.state?.message
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [emailFocused, setEmailFocused] = useState(false)
  const [passwordFocused, setPasswordFocused] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!email.trim()) { setError('Saisis ton adresse email.'); return }
    if (!password) { setError('Saisis ton mot de passe.'); return }

    setLoading(true)
    const { error: err } = await signIn(email.trim(), password)
    setLoading(false)

    if (err) {
      setError(parseLoginError(err))
    } else {
      navigate('/dashboard', { state: { welcome: true } })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <LogIn className="mx-auto h-10 w-10 text-sky-600" />
          <h1 className="text-2xl font-bold mt-3">Connexion</h1>
          <p className="text-slate-500 text-sm mt-1">Accède à tes cartes bancaires</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            {successMessage && (
              <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3">
                {successMessage}
              </div>
            )}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">Email</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  className="input-field"
                  placeholder={emailFocused || email ? '' : 'toi@exemple.com'}
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">Mot de passe</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  className="input-field pr-14"
                  placeholder={passwordFocused || password ? '' : '••••••••'}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="text-right">
              <Link to="/forgot-password" className="text-sm text-sky-600 hover:text-sky-700 transition">
                Mot de passe oublié ?
              </Link>
            </div>

            <button type="submit" className="btn-primary inline-flex items-center justify-center gap-2" disabled={loading}>
              {loading ? 'Connexion...' : <><LogIn className="w-4 h-4" /> Se connecter</>}
            </button>
          </form>
        </div>

        <p className="text-center text-slate-500 text-sm mt-6">
          Pas encore de compte ?{' '}
          <Link to="/signup" className="text-sky-600 hover:text-sky-700 font-medium transition">
            S'inscrire
          </Link>
        </p>
      </div>
    </div>
  )
}
