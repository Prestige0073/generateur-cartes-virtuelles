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

  const rows = [
    { label: 'Titulaire',  value: card.cardholder_name,                                Icon: User,       mono: false, color: 'bg-violet-100 text-violet-600'  },
    { label: 'Numéro',     value: card.card_number.replace(/(\d{4})(?=\d)/g, '$1 '),   Icon: CreditCard, mono: true,  color: 'bg-sky-100 text-sky-600'        },
    { label: 'Expiration', value: card.expiry_date,                                     Icon: Calendar,   mono: true,  color: 'bg-amber-100 text-amber-600'    },
    { label: 'Réseau',     value: card.network_type === 'visa' ? 'Visa' : 'Mastercard', Icon: CreditCard, mono: false, color: 'bg-emerald-100 text-emerald-600' },
    { label: 'Langue',     value: card.language === 'fr' ? 'Français' : 'Anglais',     Icon: Globe,      mono: false, color: 'bg-indigo-100 text-indigo-600'  },
  ]

  return (
    <div className="min-h-screen flex flex-col items-center px-4 pb-16 relative overflow-hidden" style={{ background: 'linear-gradient(160deg,#060d1f 0%,#0d1a3a 45%,#091428 100%)' }}>

      {/* Lueurs d'ambiance */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-64 bg-sky-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-32 left-1/4 w-56 h-56 bg-blue-700/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-32 right-1/4 w-56 h-56 bg-sky-500/8 rounded-full blur-3xl pointer-events-none" />

      {/* ── SECTION HERO ─────────────────────────────── */}
      <div className="relative z-10 w-full max-w-lg text-center pt-12 md:pt-16 pb-8">

        {/* Badge vérifié */}
        <div className="inline-flex items-center gap-2 bg-sky-500/10 border border-sky-400/25 rounded-full px-5 py-2 mb-6">
          <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse shrink-0" />
          <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
          <span className="text-sky-300 text-xs font-semibold tracking-widest uppercase">Carte vérifiée & sécurisée</span>
        </div>

        <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-2">
          Carte Bancaire
        </h1>
        <p className="text-slate-400 text-sm">Partagée en toute confidentialité</p>
      </div>

      {/* ── CARTE 3D ──────────────────────────────────── */}
      <div className="relative z-10 w-full max-w-md flex justify-center mb-4">
        {/* Halo derrière la carte */}
        <div className="absolute inset-x-8 bottom-0 h-16 bg-sky-500/20 blur-2xl rounded-full pointer-events-none" />
        <div className="relative">
          <Card3D card={card} size="md" />
        </div>
      </div>

      <p className="relative z-10 text-slate-600 text-xs mb-10">Cliquer pour retourner</p>

      {/* ── SOLDE (optionnel) ─────────────────────────── */}
      {card.display_amount && (
        <div className="relative z-10 mb-8 inline-flex items-center gap-4 bg-white/5 border border-emerald-400/20 rounded-2xl px-7 py-4 backdrop-blur-sm">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 border border-emerald-400/20 flex items-center justify-center shrink-0">
            <Wallet className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <p className="text-emerald-400/70 text-[10px] font-bold uppercase tracking-widest">Solde affiché</p>
            <p className="text-white font-extrabold text-2xl leading-tight">
              {Number(card.display_amount).toLocaleString('fr-FR')}
              <span className="text-emerald-400 text-base font-semibold ml-2">FCFA</span>
            </p>
          </div>
        </div>
      )}

      {/* ── PANNEAU INFORMATIONS ─────────────────────── */}
      <div className="relative z-10 w-full max-w-md">
        <div className="rounded-3xl overflow-hidden border border-white/10 shadow-2xl" style={{ background: 'rgba(15,23,48,0.85)', backdropFilter: 'blur(24px)' }}>

          {/* En-tête */}
          <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-white/[0.07]">
            <div>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.18em] mb-1">Détails</p>
              <h2 className="text-white font-bold text-base">Informations de la carte</h2>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-sky-500/15 border border-sky-400/20 flex items-center justify-center">
              <BadgeCheck className="w-5 h-5 text-sky-400" />
            </div>
          </div>

          {/* Lignes */}
          <div className="px-4 py-3 space-y-1">
            {rows.map(({ label, value, Icon, mono, color }) => (
              <div key={label} className="flex items-center justify-between px-3 py-3.5 rounded-2xl hover:bg-white/[0.04] transition-colors">
                <div className="flex items-center gap-3.5 shrink-0">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-slate-400 text-sm font-medium">{label}</span>
                </div>
                <span className={`text-white font-bold text-sm ml-3 whitespace-nowrap ${mono ? 'font-mono tracking-wider' : ''}`}>
                  {value}
                </span>
              </div>
            ))}
          </div>

          {/* Pied */}
          <div className="mx-4 mb-4 mt-1 flex items-center gap-2 bg-white/[0.03] border border-white/[0.06] rounded-2xl px-4 py-3">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="text-slate-500 text-xs">Consultation sécurisée · Lecture seule</span>
          </div>

        </div>
      </div>

    </div>
  )
}
