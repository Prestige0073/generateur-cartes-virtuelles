import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { TEMPLATES } from '../data/templates'
import Card3D from '../components/Card3D'
import NotFound from './NotFound'
import { AlertTriangle, Loader2, Lock, ShieldCheck, Wallet, Calendar, Globe, User, CreditCard } from 'lucide-react'

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50 flex flex-col items-center px-4 py-10 md:py-16">

      {/* Badge vérifié */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 bg-sky-50 border border-sky-200 rounded-full px-4 py-1.5 mb-5 shadow-sm">
          <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
          <span className="text-sky-700 text-xs font-semibold tracking-wide">Carte vérifiée & sécurisée</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Carte Bancaire</h1>
        <p className="text-slate-500 text-sm mt-1.5">Partagée en toute sécurité</p>
      </div>

      {/* Carte 3D */}
      <div className="w-full max-w-md flex justify-center mb-10 drop-shadow-xl">
        <Card3D card={card} size="md" />
      </div>

      {/* Solde si présent */}
      {card.display_amount && (
        <div className="mb-8 inline-flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-2xl px-6 py-3.5 shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
            <Wallet className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-emerald-600 text-[10px] font-bold uppercase tracking-widest">Solde affiché</p>
            <p className="text-slate-900 font-bold text-xl leading-tight">
              {Number(card.display_amount).toLocaleString('fr-FR')}
              <span className="text-emerald-600 text-sm font-semibold ml-1.5">FCFA</span>
            </p>
          </div>
        </div>
      )}

      {/* Panneau informations */}
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-lg shadow-slate-100">

          {/* En-tête panneau */}
          <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-slate-50">
            <div className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-sky-600" />
            </div>
            <span className="text-slate-800 font-semibold text-sm tracking-wide">Informations de la carte</span>
          </div>

          {/* Lignes */}
          <div className="divide-y divide-slate-100">
            {[
              { label: 'Titulaire',  value: card.cardholder_name,                                  Icon: User,       mono: false },
              { label: 'Numéro',     value: card.card_number.replace(/(\d{4})(?=\d)/g, '$1 '),     Icon: CreditCard, mono: true  },
              { label: 'Expiration', value: card.expiry_date,                                       Icon: Calendar,   mono: true  },
              { label: 'Réseau',     value: card.network_type === 'visa' ? 'Visa' : 'Mastercard',   Icon: CreditCard, mono: false },
              { label: 'Langue',     value: card.language === 'fr' ? 'Français' : 'Anglais',        Icon: Globe,      mono: false },
            ].map(({ label, value, Icon, mono }) => (
              <div key={label} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3 shrink-0">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-slate-500" />
                  </div>
                  <span className="text-slate-500 text-sm font-medium">{label}</span>
                </div>
                <span className={`text-slate-900 font-bold text-sm ml-4 whitespace-nowrap ${mono ? 'font-mono tracking-widest' : ''}`}>
                  {value}
                </span>
              </div>
            ))}
          </div>

          {/* Pied panneau */}
          <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400 text-xs">Consultation sécurisée — lecture seule</span>
          </div>
        </div>
      </div>

    </div>
  )
}
