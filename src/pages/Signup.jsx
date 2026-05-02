import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Mail, CheckCircle2, Eye, EyeOff, UserPlus, KeyRound, ArrowRight } from 'lucide-react'

function parseSignupError(err) {
  if (!err) return null
  const msg = err.message?.toLowerCase() || ''
  const status = err.status

  if (status === 429 || msg.includes('too many') || msg.includes('rate limit')) {
    return 'Trop de tentatives. Attends quelques minutes avant de réessayer.'
  }
  if (
    msg.includes('user already registered') ||
    msg.includes('already registered') ||
    msg.includes('already been registered') ||
    status === 422
  ) {
    return 'Cet email est déjà associé à un compte. Connecte-toi ou réinitialise ton mot de passe.'
  }
  if (msg.includes('password') && (msg.includes('weak') || msg.includes('short') || msg.includes('length'))) {
    return 'Mot de passe trop faible. Utilise au moins 8 caractères.'
  }
  if (msg.includes('invalid email') || msg.includes('email') && msg.includes('invalid')) {
    return 'Adresse email invalide.'
  }
  if (msg.includes('network') || msg.includes('fetch') || !navigator.onLine) {
    return 'Erreur de connexion. Vérifie ton réseau et réessaie.'
  }
  return err.message || 'Une erreur est survenue. Réessaie.'
}

export default function Signup() {
  const { signUp } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!email.trim()) { setError('Saisis ton adresse email.'); return }
    if (password.length < 8) { setError('Le mot de passe doit contenir au moins 8 caractères.'); return }
    if (password !== confirm) { setError('Les mots de passe ne correspondent pas.'); return }

    setLoading(true)
    const { error: err } = await signUp(email.trim(), password)
    setLoading(false)

    if (err) {
      setError(parseSignupError(err))
    } else {
      setSuccess(true)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <CheckCircle2 className="mx-auto h-14 w-14 text-sky-400 mb-4" />
          <h2 className="text-2xl font-bold mb-3">Vérifie ton email !</h2>
          <p className="text-slate-500 mb-2">
            Un lien de confirmation a été envoyé à{' '}
            <strong className="text-slate-900">{email}</strong>.
          </p>
          <p className="text-slate-500 text-sm mb-8">
            Clique sur le lien dans l'email pour activer ton compte, puis connecte-toi.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-400 text-white font-semibold px-6 py-3 rounded-xl transition text-sm"
          >
            Aller à la connexion <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <UserPlus className="mx-auto h-10 w-10 text-sky-600" />
          <h1 className="text-2xl font-bold mt-3">Créer un compte</h1>
          <p className="text-slate-500 text-sm mt-1">Rejoins CardGen gratuitement</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="input-field pl-10"
                  placeholder="toi@exemple.com"
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">Mot de passe</label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input-field pl-10 pr-10"
                  placeholder="Au moins 8 caractères"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {password.length > 0 && password.length < 8 && (
                <p className="text-amber-600 text-xs mt-1">
                  {8 - password.length} caractère{8 - password.length > 1 ? 's' : ''} manquant{8 - password.length > 1 ? 's' : ''}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">Confirmer le mot de passe</label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  required
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  className="input-field pl-10 pr-10"
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                  tabIndex={-1}
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {confirm.length > 0 && confirm !== password && (
                <p className="text-red-600 text-xs mt-1">Les mots de passe ne correspondent pas</p>
              )}
            </div>

            <button type="submit" className="btn-primary inline-flex items-center justify-center gap-2" disabled={loading}>
              {loading ? "Création du compte..." : <><UserPlus className="w-4 h-4" /> S'inscrire</>}
            </button>
          </form>
        </div>

        <p className="text-center text-slate-500 text-sm mt-6">
          Déjà un compte ?{' '}
          <Link to="/login" className="text-sky-600 hover:text-sky-700 font-medium transition">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  )
}
