import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { TEMPLATES } from '../data/templates'
import Card3D from '../components/Card3D'
import NotFound from './NotFound'
import { AlertTriangle, Clock, Loader2, Lock, Search, ShieldCheck, Wallet, Calendar, Globe, User, CreditCard, Zap } from 'lucide-react'

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

  useEffect(() => { document.title = 'ShareCards' }, [])

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
      setAttempts(prev => {
        const next = prev + 1
        if (next >= 5) setStatus('locked')
        else setError(`Mot de passe incorrect. ${5 - next} tentative${5 - next > 1 ? 's' : ''} restante${5 - next > 1 ? 's' : ''}.`)
        return next
      })
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

  if (status === 'invalid' || status === 'expired') {
    return <NotFound />
  }

  if (status === 'locked') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <Lock className="mx-auto h-14 w-14 text-slate-400 mb-4" />
          <h2 className="text-2xl font-bold mb-3">Accès bloqué</h2>
          <p className="text-slate-300">Trop de tentatives incorrectes.</p>
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
            <p className="text-slate-300 text-sm">Entre le mot de passe pour visualiser la carte bancaire.</p>
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

          <p className="text-center text-slate-400 text-xs mt-6">
            <AlertTriangle className="inline h-4 w-4 align-text-bottom mr-1" />
            Carte bancaire sécurisée
          </p>
        </div>
      </div>
    )
  }

  const template = TEMPLATES.find(t => t.id === card.template_id) || TEMPLATES[0]
  const daysLeft = Math.max(0, Math.ceil((new Date(shareLink.expires_at) - Date.now()) / (1000 * 60 * 60 * 24)))

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center px-4 py-8 md:py-14">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-sky-500 to-sky-600 rounded-full mb-4">
          <CreditCard className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold mb-1">Carte bancaire</h1>
        <p className="text-slate-300 text-sm">Partagée et sécurisée</p>
      </div>

      {/* Card Container */}
      <div className="w-full max-w-md md:max-w-lg flex justify-center mb-10 md:mb-12">
        <Card3D card={card} size="md" />
      </div>

      {/* Top Stats */}
      <div className="w-full max-w-2xl grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
        {/* Design */}
        <div className="bg-gradient-to-br from-slate-800/60 to-slate-800/30 border border-slate-700/40 rounded-xl p-4 text-center hover:border-slate-600/60 transition">
          <Zap className="w-5 h-5 mx-auto mb-2 text-sky-400" />
          <span className="text-slate-300 text-xs uppercase tracking-wider block">Design</span>
          <p className="text-slate-100 font-medium text-sm mt-2">{template.name}</p>
        </div>

        {/* Solde */}
        {card.display_amount && (
          <div className="bg-gradient-to-br from-emerald-900/40 to-emerald-900/20 border border-emerald-700/40 rounded-xl p-4 text-center hover:border-emerald-600/60 transition">
            <Wallet className="w-5 h-5 mx-auto mb-2 text-emerald-400" />
            <span className="text-slate-300 text-xs uppercase tracking-wider block">Solde</span>
            <p className="text-emerald-400 font-bold text-lg mt-2">
              {Number(card.display_amount).toLocaleString('fr-FR')}
            </p>
            <span className="text-slate-300 text-xs">FCFA</span>
          </div>
        )}

        {/* Validité */}
        <div className={`bg-gradient-to-br from-blue-900/40 to-blue-900/20 border border-blue-700/40 rounded-xl p-4 text-center hover:border-blue-600/60 transition ${!card.display_amount ? 'md:col-span-2' : ''}`}>
          <Clock className="w-5 h-5 mx-auto mb-2 text-blue-400" />
          <span className="text-slate-300 text-xs uppercase tracking-wider block">Validité du lien</span>
          <p className="text-blue-400 font-bold text-lg mt-2">{daysLeft}</p>
          <span className="text-slate-300 text-xs">jour{daysLeft > 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Détails de la carte */}
      <div className="w-full max-w-2xl">
        <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-6 md:p-8">
          <h2 className="text-lg font-semibold text-slate-100 mb-6 flex items-center gap-2.5">
            <div className="w-1 h-6 bg-gradient-to-b from-sky-500 to-sky-600 rounded-full"></div>
            Informations de la carte
          </h2>

          <div className="space-y-4">
            {/* Titulaire */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-700/50 hover:bg-slate-800/30 px-2 py-2 rounded transition">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-700/50 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-slate-300" />
                </div>
                <span className="text-slate-300 text-sm">Titulaire</span>
              </div>
              <span className="text-slate-100 font-medium text-sm md:text-base">{card.cardholder_name || 'N/A'}</span>
            </div>

            {/* Numéro */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-700/50 hover:bg-slate-800/30 px-2 py-2 rounded transition">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-700/50 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-slate-300" />
                </div>
                <span className="text-slate-300 text-sm">Numéro</span>
              </div>
              <span className="text-slate-100 font-mono text-sm md:text-base">{card.card_number.replace(/(\d{4})(?=\d)/g, '$1 ') || 'N/A'}</span>
            </div>

            {/* Expiration */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-700/50 hover:bg-slate-800/30 px-2 py-2 rounded transition">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-700/50 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-slate-300" />
                </div>
                <span className="text-slate-300 text-sm">Expiration</span>
              </div>
              <span className="text-slate-100 font-mono text-sm md:text-base">{card.expiry_date || 'N/A'}</span>
            </div>

            {/* Réseau */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-700/50 hover:bg-slate-800/30 px-2 py-2 rounded transition">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-700/50 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-slate-300" />
                </div>
                <span className="text-slate-300 text-sm">Réseau</span>
              </div>
              <span className="text-slate-100 font-medium text-sm md:text-base uppercase">{card.network_type === 'visa' ? 'Visa' : 'Mastercard'}</span>
            </div>

            {/* Langue */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-700/50 hover:bg-slate-800/30 px-2 py-2 rounded transition">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-700/50 rounded-lg flex items-center justify-center">
                  <Globe className="w-5 h-5 text-slate-300" />
                </div>
                <span className="text-slate-300 text-sm">Langue</span>
              </div>
              <span className="text-slate-100 font-medium text-sm md:text-base">{card.language === 'fr' ? 'Français' : 'Anglais'}</span>
            </div>

            {/* Créée le */}
            <div className="flex items-center justify-between hover:bg-slate-800/30 px-2 py-2 rounded transition">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-700/50 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-slate-300" />
                </div>
                <span className="text-slate-300 text-sm">Créée le</span>
              </div>
              <span className="text-slate-100 font-medium text-sm md:text-base">{new Date(card.created_at).toLocaleDateString('fr-FR')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Security footer */}
      <div className="mt-10 md:mt-12 text-center text-slate-500 text-xs">
        <AlertTriangle className="inline h-4 w-4 align-text-bottom mr-1.5" />
        Carte bancaire sécurisée — Lecture seule
      </div>
    </div>
  )
}
