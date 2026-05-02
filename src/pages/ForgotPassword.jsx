import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Mail, CheckCircle2, ArrowLeft } from 'lucide-react'

function parseForgotError(err) {
  if (!err) return null
  const msg = err.message?.toLowerCase() || ''
  const status = err.status

  if (status === 429 || msg.includes('too many') || msg.includes('rate limit')) {
    return 'Trop de demandes. Attends quelques minutes avant de réessayer.'
  }
  if (msg.includes('network') || msg.includes('fetch') || !navigator.onLine) {
    return 'Erreur de connexion. Vérifie ton réseau et réessaie.'
  }
  return 'Une erreur est survenue. Vérifie l\'adresse email et réessaie.'
}

export default function ForgotPassword() {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!email.trim()) { setError('Saisis ton adresse email.'); return }

    setLoading(true)
    const { error: err } = await resetPassword(email.trim())
    setLoading(false)

    if (err) {
      setError(parseForgotError(err))
    } else {
      setSent(true)
    }
  }

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <CheckCircle2 className="mx-auto h-14 w-14 text-sky-500 mb-4" />
          <h2 className="text-2xl font-bold mb-3">Email envoyé !</h2>
          <p className="text-slate-600 mb-2">
            Si un compte existe pour <strong className="text-slate-900">{email}</strong>,
            tu recevras un lien de réinitialisation dans les prochaines minutes.
          </p>
          <p className="text-slate-500 text-xs mb-8">
            Vérifie aussi ton dossier spam si tu ne vois rien.
          </p>
          <Link to="/login" className="text-sky-600 hover:text-sky-700 transition font-medium inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Retour à la connexion
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Mail className="mx-auto h-10 w-10 text-sky-500" />
          <h1 className="text-2xl font-bold mt-3">Mot de passe oublié</h1>
          <p className="text-slate-500 text-sm mt-1">Reçois un lien de réinitialisation par email</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="input-field"
                placeholder="toi@exemple.com"
                autoComplete="email"
              />
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Envoi...' : 'Envoyer le lien'}
            </button>
          </form>
        </div>

        <p className="text-center text-slate-500 text-sm mt-6">
          <Link to="/login" className="text-sky-600 hover:text-sky-700 transition inline-flex items-center gap-2 font-medium">
            <ArrowLeft className="w-4 h-4" /> Retour à la connexion
          </Link>
        </p>
      </div>
    </div>
  )
}
