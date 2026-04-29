import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { TEMPLATES } from '../data/templates'
import Card3D from '../components/Card3D'
import { AlertTriangle, CheckCircle2, Clock, Loader2, Lock, Search, ShieldCheck } from 'lucide-react'

async function sha256(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str))
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

export default function ShareView() {
  const { slug } = useParams()
  const [shareLink, setShareLink] = useState(null)
  const [card, setCard] = useState(null)
  const [status, setStatus] = useState('loading')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [attempts, setAttempts] = useState(0)

  useEffect(() => {
    async function fetchLink() {
      const { data, error: err } = await supabase
        .from('share_links')
        .select('*')
        .eq('slug', slug)
        .single()

      if (err || !data) { setStatus('invalid'); return }
      if (new Date(data.expires_at) < new Date()) { setStatus('expired'); return }
      setShareLink(data)
      setStatus('form')
    }
    fetchLink()
  }, [slug])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (attempts >= 5) {
      setStatus('locked')
      return
    }

    const hash = await sha256(password)
    if (hash !== shareLink.password_hash) {
      const newAttempts = attempts + 1
      setAttempts(newAttempts)
      if (newAttempts >= 5) setStatus('locked')
      else setError(`Mot de passe incorrect. ${5 - newAttempts} tentative${5 - newAttempts > 1 ? 's' : ''} restante${5 - newAttempts > 1 ? 's' : ''}.`)
      return
    }

    const { data: cardData, error: cardErr } = await supabase
      .from('cards')
      .select('*')
      .eq('id', shareLink.card_id)
      .single()

    if (cardErr || !cardData) { setError('Erreur lors du chargement de la carte.'); return }
    setCard(cardData)
    setStatus('unlocked')
  }

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-10 h-10 text-sky-400 animate-spin" />
      </div>
    )
  }

  if (status === 'invalid') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <Search className="mx-auto h-14 w-14 text-slate-400 mb-4" />
          <h2 className="text-2xl font-bold mb-3">Lien introuvable</h2>
          <p className="text-slate-400">Ce lien de partage n'existe pas ou a été supprimé.</p>
        </div>
      </div>
    )
  }

  if (status === 'expired') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <Clock className="mx-auto h-14 w-14 text-slate-400 mb-4" />
          <h2 className="text-2xl font-bold mb-3">Lien expiré</h2>
          <p className="text-slate-400">Ce lien de partage a expiré après 30 jours.</p>
        </div>
      </div>
    )
  }

  if (status === 'locked') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <Lock className="mx-auto h-14 w-14 text-slate-400 mb-4" />
          <h2 className="text-2xl font-bold mb-3">Accès bloqué</h2>
          <p className="text-slate-400">Trop de tentatives incorrectes.</p>
        </div>
      </div>
    )
  }

  if (status === 'form') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <ShieldCheck className="mx-auto h-14 w-14 text-sky-400 mb-4" />
            <h1 className="text-2xl font-bold mb-2">Carte partagée</h1>
            <p className="text-slate-400 text-sm">Entre le mot de passe pour visualiser la carte virtuelle.</p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-900/30 border border-red-700/50 text-red-300 text-sm rounded-xl px-4 py-3">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Mot de passe</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input-field"
                  placeholder="••••••••••"
                  autoFocus
                />
              </div>
              <button type="submit" className="btn-primary w-full">
                Voir la carte
              </button>
            </form>
          </div>

          <p className="text-center text-slate-700 text-xs mt-6">
            <AlertTriangle className="inline h-4 w-4 align-text-bottom mr-1" />
            Carte virtuelle à but décoratif uniquement — CardGen
          </p>
        </div>
      </div>
    )
  }

  const template = TEMPLATES.find(t => t.id === card.template_id) || TEMPLATES[0]
  const daysLeft = Math.max(0, Math.ceil((new Date(shareLink.expires_at) - Date.now()) / (1000 * 60 * 60 * 24)))

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
      <div className="text-center mb-8">
        <h1 className="text-xl font-semibold mb-1">Carte virtuelle</h1>
        <p className="text-slate-500 text-sm">Partagée via CardGen — Lecture seule</p>
      </div>

      <Card3D card={card} size="md" />

      <div className="mt-6 text-center">
        <p className="text-slate-500 text-sm">{template.name}</p>
        {card.display_amount && (
          <p className="text-slate-400 text-sm mt-1">
            Solde esthétique : <span className="font-semibold text-white">{Number(card.display_amount).toLocaleString('fr-FR')} FCFA</span>
          </p>
        )}
        <p className="text-slate-700 text-xs mt-4">Lien valide encore {daysLeft} jour{daysLeft > 1 ? 's' : ''}</p>
      </div>

      <p className="mt-10 text-slate-700 text-xs text-center max-w-sm">
        <AlertTriangle className="inline h-4 w-4 align-text-bottom mr-1" />
        Carte virtuelle à but décoratif et démonstratif uniquement.<br />
        Aucune transaction bancaire réelle n'est associée.
      </p>
    </div>
  )
}
