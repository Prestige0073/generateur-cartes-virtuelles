import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Lock, Loader2, Eye, EyeOff } from 'lucide-react'

function parseResetError(err) {
  if (!err) return null
  const msg = err.message?.toLowerCase() || ''

  if (msg.includes('same password') || msg.includes('different from')) {
    return 'Le nouveau mot de passe doit être différent de l\'ancien.'
  }
  if (msg.includes('expired') || msg.includes('invalid') || msg.includes('token')) {
    return 'Le lien de réinitialisation est expiré ou invalide. Refais une demande.'
  }
  if (msg.includes('network') || msg.includes('fetch') || !navigator.onLine) {
    return 'Erreur de connexion. Vérifie ton réseau et réessaie.'
  }
  return 'Erreur lors de la mise à jour. Le lien est peut-être expiré, refais une demande.'
}

export default function ResetPassword() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true)
    })
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (password.length < 8) { setError('Le mot de passe doit contenir au moins 8 caractères.'); return }
    if (password !== confirm) { setError('Les mots de passe ne correspondent pas.'); return }

    setLoading(true)
    const { error: err } = await supabase.auth.updateUser({ password })
    setLoading(false)

    if (err) {
      setError(parseResetError(err))
    } else {
      await supabase.auth.signOut()
      navigate('/login', { state: { message: 'Mot de passe mis à jour avec succès. Connecte-toi.' } })
    }
  }

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <Loader2 className="mx-auto h-8 w-8 text-sky-500 animate-spin mb-4" />
          <p className="text-slate-600">Vérification du lien de réinitialisation...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Lock className="mx-auto h-10 w-10 text-sky-500" />
          <h1 className="text-2xl font-bold mt-3">Nouveau mot de passe</h1>
          <p className="text-slate-500 text-sm mt-1">Choisis un nouveau mot de passe sécurisé</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Nouveau mot de passe</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input-field pr-10"
                  placeholder="Au moins 8 caractères"
                  autoFocus
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
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirmer</label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  required
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  className="input-field pr-10"
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
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Mise à jour...' : 'Changer le mot de passe'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
