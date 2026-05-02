import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { TEMPLATES } from '../data/templates'
import Card3D from '../components/Card3D'
import NotFound from './NotFound'
import { AlertTriangle, Loader2, Lock, ShieldCheck, Wallet, Calendar, Globe, User, CreditCard, BadgeCheck } from 'lucide-react'

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
      <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm px-8 py-10 text-center max-w-sm w-full">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mb-4">
            <Lock className="w-7 h-7 text-red-400" />
          </div>
          <h2 className="text-slate-900 text-xl font-extrabold mb-2">Accès bloqué</h2>
          <p className="text-slate-500 text-sm">Trop de tentatives incorrectes. Ce lien est désormais verrouillé.</p>
        </div>
      </div>
    )
  }

  if (status === 'form') {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center px-4 py-12">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-full px-4 py-1.5 mb-6">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span className="text-emerald-700 text-xs font-semibold tracking-wide">Lien sécurisé & vérifié</span>
        </div>

        {/* Card */}
        <div className="w-full max-w-sm bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

          {/* Header */}
          <div className="px-6 pt-7 pb-5 border-b border-slate-100 text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center mb-4">
              <Lock className="w-7 h-7 text-sky-500" />
            </div>
            <h1 className="text-slate-900 text-xl font-extrabold mb-1">Carte partagée</h1>
            <p className="text-slate-500 text-sm">Entre le mot de passe pour accéder à la carte bancaire.</p>
          </div>

          {/* Form */}
          <div className="px-6 py-5">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Mot de passe</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition"
                  placeholder="••••••••••"
                  autoFocus
                />
              </div>
              <button
                type="submit"
                className="w-full bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white font-semibold text-sm py-2.5 rounded-xl transition flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                Voir la carte
              </button>
            </form>
          </div>

          {/* Footer */}
          <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-slate-400 text-xs">Consultation sécurisée · Lecture seule</span>
          </div>
        </div>
      </div>
    )
  }

  const rows = [
    { label: 'Titulaire',  value: card.cardholder_name,                                Icon: User,       mono: false, color: 'bg-violet-100 text-violet-600'  },
    { label: 'Numéro',     value: card.card_number.replace(/(\d{4})(?=\d)/g, '$1 '),   Icon: CreditCard, mono: true,  color: 'bg-sky-100 text-sky-600'        },
    { label: 'Expiration', value: card.expiry_date,                                     Icon: Calendar,   mono: true,  color: 'bg-amber-100 text-amber-600'    },
    { label: 'Réseau',     value: card.network_type === 'visa' ? 'Visa' : 'Mastercard', Icon: CreditCard, mono: false, color: 'bg-emerald-100 text-emerald-600' },
    { label: 'Langue',     value: card.language === 'fr' ? 'Français' : 'Anglais',     Icon: Globe,      mono: false, color: 'bg-indigo-100 text-indigo-600'  },
  ]

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center px-4 pb-16">

      {/* ── HERO ─────────────────────────────────────── */}
      <div className="w-full bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-lg mx-auto text-center px-4 pt-10 pb-8">
          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-full px-4 py-1.5 mb-5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-emerald-700 text-xs font-semibold tracking-wide">Carte vérifiée & sécurisée</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight mb-1.5">
            Carte Bancaire
          </h1>
          <p className="text-slate-500 text-sm">Partagée en toute confidentialité</p>
        </div>
      </div>

      {/* ── CARTE 3D ─────────────────────────────────── */}
      <div className="w-full bg-gradient-to-b from-white to-slate-100 border-b border-slate-200 shadow-sm">
        <div className="max-w-lg mx-auto flex flex-col items-center px-4 pt-8 pb-8">
          <Card3D card={card} size="md" />
          <p className="text-slate-400 text-xs mt-3">Cliquer pour retourner</p>
        </div>
      </div>

      {/* ── CONTENU ──────────────────────────────────── */}
      <div className="w-full max-w-md mt-6 space-y-4 px-0">

        {/* Solde si présent */}
        {card.display_amount && (
          <div className="bg-white border border-slate-200 rounded-2xl px-5 py-4 flex items-center gap-4 shadow-sm">
            <div className="w-11 h-11 rounded-2xl bg-emerald-100 flex items-center justify-center shrink-0">
              <Wallet className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Solde affiché</p>
              <p className="text-slate-900 font-extrabold text-xl leading-tight">
                {Number(card.display_amount).toLocaleString('fr-FR')}
                <span className="text-emerald-600 text-sm font-semibold ml-1.5">FCFA</span>
              </p>
            </div>
          </div>
        )}

        {/* Panneau informations */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">

          {/* En-tête */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
            <div>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-0.5">Récapitulatif</p>
              <h2 className="text-slate-900 font-bold text-sm">Informations de la carte</h2>
            </div>
            <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center">
              <BadgeCheck className="w-4.5 h-4.5 text-slate-500" style={{ width: 18, height: 18 }} />
            </div>
          </div>

          {/* Lignes */}
          <div className="divide-y divide-slate-100">
            {rows.map(({ label, value, Icon, mono, color }) => (
              <div key={label} className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3 shrink-0">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-slate-500 text-sm">{label}</span>
                </div>
                <span className={`text-slate-900 font-bold text-sm ml-3 whitespace-nowrap ${mono ? 'font-mono tracking-wider' : ''}`}>
                  {value}
                </span>
              </div>
            ))}
          </div>

          {/* Pied */}
          <div className="flex items-center gap-2 px-5 py-3 bg-slate-50 border-t border-slate-100">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-slate-400 text-xs">Consultation sécurisée · Lecture seule</span>
          </div>
        </div>

      </div>
    </div>
  )
}
