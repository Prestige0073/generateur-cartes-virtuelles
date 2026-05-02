import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { CheckCircle, AlertCircle } from 'lucide-react'

export default function AuthConfirm() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (loading) return

    if (user && user.email_confirmed_at) {
      // Email bien confirmé, rediriger au dashboard après 2 secondes
      const timer = setTimeout(() => {
        navigate('/dashboard', { state: { welcome: true } })
      }, 2000)
      return () => clearTimeout(timer)
    } else if (user && !user.email_confirmed_at) {
      // Utilisateur authentifié mais email pas encore confirmé
      const timer = setTimeout(() => {
        navigate('/login', { state: { message: 'Vérifie ton email pour confirmer ton adresse.' } })
      }, 3000)
      return () => clearTimeout(timer)
    } else {
      // Pas d'utilisateur, rediriger vers login
      navigate('/login', { replace: true })
    }
  }, [user, loading, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md text-center">
        {user && user.email_confirmed_at ? (
          <>
            <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
            <h1 className="text-2xl font-bold mb-2">Email confirmé !</h1>
            <p className="text-slate-600 mb-4">Ton adresse email est maintenant vérifiée.</p>
            <p className="text-slate-500 text-sm">Redirection en cours...</p>
          </>
        ) : (
          <>
            <AlertCircle className="mx-auto h-16 w-16 text-amber-500 mb-4" />
            <h1 className="text-2xl font-bold mb-2">Vérification en cours...</h1>
            <p className="text-slate-600">Nous vérifions ton email.</p>
          </>
        )}
      </div>
    </div>
  )
}
