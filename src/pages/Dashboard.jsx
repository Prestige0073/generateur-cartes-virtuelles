import { useEffect, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { TEMPLATES, TIERS } from '../data/templates'
import Card3D from '../components/Card3D'
import Loading from '../components/Loading'
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardCopy,
  Clock,
  CreditCard,
  Eye,
  EyeOff,
  KeyRound,
  Link2,
  Plus,
  RefreshCw,
  ShieldCheck,
  Wallet,
} from 'lucide-react'

const _rawBase = import.meta.env.VITE_SHARE_DOMAIN
  ? `https://${import.meta.env.VITE_SHARE_DOMAIN}`
  : (import.meta.env.VITE_APP_URL || window.location.origin)
const SHARE_BASE = _rawBase.replace(/\/+$/, '')

function getSavedPw(linkId) {
  try {
    const raw = localStorage.getItem(`cardgen_pw_${linkId}`)
    return raw ? JSON.parse(raw).password : null
  } catch { return null }
}

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [cards, setCards]       = useState([])
  const [payments, setPayments] = useState([])
  const [loading, setLoading]   = useState(true)
  const [tab, setTab]           = useState('cards')
  const [copiedId, setCopiedId] = useState(null)
  const [visiblePw, setVisiblePw] = useState({})
  const [showWelcome, setShowWelcome] = useState(false)

  // Toast de bienvenue après connexion
  useEffect(() => {
    if (location.state?.welcome) {
      setShowWelcome(true)
      // Effacer le state pour éviter de revoir le toast au rechargement
      navigate(location.pathname, { replace: true, state: {} })
      const t = setTimeout(() => setShowWelcome(false), 4500)
      return () => clearTimeout(t)
    }
  }, []) // eslint-disable-line

  useEffect(() => { fetchData() }, [user.id])

  async function fetchData() {
    setLoading(true)
    try {
      const [{ data: cardsData }, { data: paymentsData }] = await Promise.all([
        supabase.from('cards').select('*, share_links(id, slug, expires_at)')
          .eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('payments').select('*')
          .eq('user_id', user.id).order('created_at', { ascending: false }),
      ])
      setCards(cardsData || [])
      setPayments(paymentsData || [])
    } catch {
      setCards([])
      setPayments([])
    } finally {
      setLoading(false)
    }
  }

  function getActiveLink(card) {
    const now = new Date()
    return (card.share_links || [])
      .filter(l => new Date(l.expires_at) > now)
      .sort((a, b) => new Date(b.expires_at) - new Date(a.expires_at))[0] || null
  }

  function copyText(text, id) {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2200)
  }

  function copyLinkAndPassword(slug, linkId, copyId) {
    const url = `${SHARE_BASE}/share/${slug}`
    const pw  = getSavedPw(linkId)
    copyText(pw ? `Lien : ${url}\nMot de passe : ${pw}` : url, copyId)
  }

  function togglePwVisible(linkId) {
    setVisiblePw(prev => ({ ...prev, [linkId]: !prev[linkId] }))
  }

  if (loading) return <Loading message="Chargement de votre tableau de bord..." />

  const paidPayments = payments.filter(p => p.status === 'success')
  const totalSpent   = paidPayments.reduce((s, p) => s + p.amount, 0)

  const statusInfo = {
    success: { label: 'Succès',     Icon: CheckCircle2,  badge: 'bg-green-900/50 text-green-400'  },
    pending: { label: 'En attente', Icon: Clock,         badge: 'bg-yellow-900/50 text-yellow-400' },
    failed:  { label: 'Échoué',     Icon: AlertTriangle, badge: 'bg-red-900/50 text-red-400'       },
  }

  const stats = [
    { label: 'Cartes créées',     value: cards.length,                             Icon: CreditCard  },
    { label: 'Paiements validés', value: paidPayments.length,                       Icon: ShieldCheck },
    { label: 'Total dépensé',     value: `${totalSpent.toLocaleString('fr-FR')} F`, Icon: Wallet      },
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 md:py-12 animate-fadeInUp">

      {/* ── Toast de bienvenue ── */}
      {showWelcome && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[200] animate-fadeInUp">
          <div className="flex items-center gap-3 bg-emerald-950 border border-emerald-700/60 text-emerald-300 px-5 py-3.5 rounded-2xl shadow-2xl shadow-black/40 backdrop-blur-sm">
            <span className="w-7 h-7 rounded-full bg-emerald-700/40 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </span>
            <div>
              <p className="font-semibold text-sm text-emerald-200">Connexion réussie !</p>
              <p className="text-xs text-emerald-400/80 leading-tight">Bienvenue, {user.email?.split('@')[0]}</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div className="min-w-0">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Mon espace</h1>
          <p className="text-slate-400 text-sm mt-0.5 truncate">{user.email}</p>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={fetchData}
            className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 hover:text-slate-900 text-sm px-3.5 py-2.5 rounded-xl transition active:scale-95"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden xs:inline sm:hidden md:inline">Actualiser</span>
          </button>
          <Link
            to="/templates"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition shadow-lg shadow-sky-900/30 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Nouvelle carte
          </Link>
        </div>
      </div>

      {/* ── Stats mobile (liste horizontale) ── */}
      <div className="sm:hidden space-y-2.5 mb-8">
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className={`flex items-center gap-4 bg-white border border-slate-200 rounded-2xl px-4 py-3.5 animate-fadeInUp delay-${i + 1}`}
          >
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
              <stat.Icon className="w-5 h-5 text-sky-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-slate-400 text-xs leading-tight">{stat.label}</p>
              <p className="text-slate-900 font-bold text-xl leading-tight mt-0.5">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Stats desktop (grille 3 cols) ── */}
      <div className="hidden sm:grid grid-cols-3 gap-3 mb-8">
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className={`bg-white border border-slate-200 rounded-2xl p-5 animate-fadeInUp delay-${i + 1}`}
          >
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-slate-400 text-xs uppercase tracking-wider font-medium leading-tight">{stat.label}</span>
              <stat.Icon className="w-5 h-5 text-sky-400 shrink-0" />
            </div>
            <p className="text-2xl font-bold text-sky-400 truncate">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-2 mb-6 animate-fadeInUp delay-3">
        {[{ key: 'cards', label: 'Mes cartes' }, { key: 'payments', label: 'Paiements' }].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              tab === t.key
                ? 'bg-sky-600 text-white shadow-md shadow-sky-900/30'
                : 'bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ══════════════ ONGLET CARTES ══════════════ */}
      {tab === 'cards' && (
        cards.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50 animate-fadeIn">
            <div className="mx-auto mb-5 w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-sky-400">
              <CreditCard className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-lg text-slate-900 mb-2">Aucune carte créée</h3>
            <p className="text-slate-400 text-sm mb-6 max-w-xs mx-auto leading-relaxed">
              Choisis un template et génère ta première carte bancaire en quelques clics.
            </p>
            <Link
              to="/templates"
              className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-500 text-white text-sm font-semibold px-6 py-3 rounded-xl transition shadow-lg shadow-sky-900/30"
            >
              <Plus className="w-4 h-4" /> Voir le catalogue
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-5 md:grid-cols-2 xl:grid-cols-3">
            {cards.map((card, idx) => {
              const template   = TEMPLATES.find(t => t.id === card.template_id) || TEMPLATES[0]
              const tier       = TIERS[card.tier]
              const activeLink = getActiveLink(card)
              const daysLeft   = activeLink
                ? Math.max(0, Math.ceil((new Date(activeLink.expires_at) - Date.now()) / 86_400_000))
                : 0
              const savedPw    = activeLink ? getSavedPw(activeLink.id) : null
              const pwVisible  = activeLink && visiblePw[activeLink.id]

              return (
                <div
                  key={card.id}
                  className="bg-white border border-slate-200 rounded-3xl overflow-hidden hover:border-sky-600/40 shadow-sm transition-all animate-scaleIn"
                  style={{ animationDelay: `${idx * 0.06}s` }}
                >
                  {/* Aperçu carte */}
                  <div
                    className="flex justify-center pt-5 pb-3 px-5 cursor-pointer"
                    onClick={() => navigate(`/card/${card.id}`)}
                  >
                    <Card3D card={card} size="sm" interactive={false} />
                  </div>

                  <div className="px-4 pb-5 space-y-3">
                    {/* Nom + badge */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 text-sm truncate">{template.name}</p>
                        <p className="text-slate-500 text-xs mt-0.5 font-mono truncate">{card.cardholder_name}</p>
                      </div>
                      <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shrink-0 ${tier.badge} ${tier.color}`}>
                        {tier.label}
                      </span>
                    </div>

                    {/* Numéro + expiration */}
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-500 tracking-widest">•••• •••• •••�� {card.card_number.slice(-4)}</span>
                      <span className="text-slate-500">exp. {card.expiry_date}</span>
                    </div>

                    {/* Solde décoratif */}
                    {card.display_amount && (
                      <div className="flex justify-between items-center text-xs border-t border-slate-200 pt-3">
                        <span className="text-slate-500">Solde affiché</span>
                        <span className="font-semibold text-slate-700">{Number(card.display_amount).toLocaleString('fr-FR')} FCFA</span>
                      </div>
                    )}

                    {/* Lien de partage */}
                    <div className="border-t border-slate-200 pt-3 space-y-2.5">
                      {activeLink ? (
                        <>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 text-xs text-sky-300 font-medium">
                              <Link2 className="w-3.5 h-3.5" />
                              Lien actif — {daysLeft}j restants
                            </div>
                            <button
                              onClick={() => navigate(`/card/${card.id}`)}
                              className="text-xs text-slate-500 hover:text-slate-700 transition"
                            >
                              Voir →
                            </button>
                          </div>

                          {/* URL */}
                          <div className="flex gap-2">
                            <input
                              readOnly
                              value={`${SHARE_BASE}/share/${activeLink.slug}`}
                              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-600 truncate min-w-0"
                            />
                            <button
                              onClick={() => copyText(`${SHARE_BASE}/share/${activeLink.slug}`, `link-${card.id}`)}
                              className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 px-3 py-2.5 rounded-xl text-xs text-slate-700 transition shrink-0"
                            >
                              <ClipboardCopy className="w-3.5 h-3.5" />
                              {copiedId === `link-${card.id}` ? 'Copié !' : 'Copier'}
                            </button>
                          </div>

                          {/* Mot de passe */}
                          {savedPw ? (
                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2.5">
                              <div className="flex items-center gap-1.5 text-xs text-amber-500 font-medium">
                                <KeyRound className="w-3.5 h-3.5" />
                                Mot de passe sauvegardé
                              </div>
                              <div className="flex gap-2">
                                <div className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-amber-600 truncate min-w-0">
                                  {pwVisible ? savedPw : '•'.repeat(savedPw.length)}
                                </div>
                                <button
                                  onClick={() => togglePwVisible(activeLink.id)}
                                  className="w-9 h-9 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center justify-center text-slate-500 transition shrink-0"
                                >
                                  {pwVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                </button>
                                <button
                                  onClick={() => copyText(savedPw, `pw-${card.id}`)}
                                  className="w-9 h-9 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center justify-center text-slate-700 transition shrink-0"
                                >
                                  {copiedId === `pw-${card.id}` ? <span className="text-[10px]">✓</span> : <ClipboardCopy className="w-3.5 h-3.5" />}
                                </button>
                              </div>
                              <button
                                onClick={() => copyLinkAndPassword(activeLink.slug, activeLink.id, `both-${card.id}`)}
                                className="w-full text-xs text-sky-300 hover:text-sky-200 transition py-1.5 flex items-center justify-center gap-1.5"
                              >
                                <ClipboardCopy className="w-3 h-3" />
                                {copiedId === `both-${card.id}` ? 'Lien + mot de passe copiés !' : 'Copier lien + mot de passe'}
                              </button>
                            </div>
                          ) : (
                            <p className="text-xs text-slate-500 flex items-center gap-1.5 flex-wrap">
                              <KeyRound className="w-3.5 h-3.5 shrink-0 text-slate-500" />
                              Mot de passe non sauvegardé sur cet appareil.
                              <button onClick={() => navigate(`/card/${card.id}`)} className="text-sky-400 hover:text-sky-300 transition">Voir la carte →</button>
                            </p>
                          )}
                        </>
                      ) : (
                        <button
                          onClick={() => navigate(`/card/${card.id}`)}
                          className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-sky-500 hover:text-sky-700 hover:bg-sky-50 hover:border-sky-200 transition py-3"
                        >
                          <Link2 className="w-3.5 h-3.5" /> Générer un lien de partage
                        </button>
                      )}
                    </div>

                    <p className="text-slate-500 text-xs text-right">
                      Créée le {new Date(card.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )
      )}

      {/* ══════════════ ONGLET PAIEMENTS ══════════════ */}
      {tab === 'payments' && (
        payments.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50 animate-fadeIn">
            <p className="text-slate-500 font-medium">Aucun paiement enregistré</p>
          </div>
        ) : (
          <>
            {/* Mobile */}
            <div className="sm:hidden space-y-3">
              {payments.map((p, i) => {
                const status = statusInfo[p.status] || statusInfo.failed
                return (
                  <div
                    key={p.id}
                    className="bg-white border border-slate-200 rounded-2xl p-4 animate-fadeInUp"
                    style={{ animationDelay: `${i * 0.05}s` }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${TIERS[p.tier]?.badge || 'bg-slate-700'} ${TIERS[p.tier]?.color || 'text-slate-300'}`}>
                            {TIERS[p.tier]?.label || p.tier}
                          </span>
                          <span className="text-slate-400 text-xs capitalize">{p.payment_provider}</span>
                        </div>
                        <p className="text-slate-400 text-xs">{new Date(p.created_at).toLocaleDateString('fr-FR')}</p>
                      </div>
                      <div className="text-right shrink-0 space-y-1.5">
                        <p className="font-mono font-bold text-slate-900">{p.amount.toLocaleString('fr-FR')} F</p>
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${status.badge}`}>
                          <status.Icon className="w-3 h-3" />
                          {status.label}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Desktop */}
            <div className="hidden sm:block bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm animate-fadeIn">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-left text-xs uppercase tracking-wider">
                    <th className="px-5 py-3.5 font-semibold">Date</th>
                    <th className="px-5 py-3.5 font-semibold">Niveau</th>
                    <th className="px-5 py-3.5 font-semibold">Opérateur</th>
                    <th className="px-5 py-3.5 font-semibold text-right">Montant</th>
                    <th className="px-5 py-3.5 font-semibold text-center">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map(p => {
                    const status   = statusInfo[p.status] || statusInfo.failed
                    const tierInfo = TIERS[p.tier]
                    return (
                      <tr key={p.id} className="border-t border-slate-100 hover:bg-slate-50 transition">
                        <td className="px-5 py-4 text-slate-600">{new Date(p.created_at).toLocaleDateString('fr-FR')}</td>
                        <td className="px-5 py-4">
                          <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${tierInfo?.badge || 'bg-slate-700'} ${tierInfo?.color || 'text-slate-300'}`}>
                            {tierInfo?.label || p.tier}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-slate-400 capitalize">{p.payment_provider}</td>
                        <td className="px-5 py-4 text-right font-bold font-mono text-slate-900">{p.amount.toLocaleString('fr-FR')} F</td>
                        <td className="px-5 py-4 text-center">
                          <span className={`inline-flex items-center justify-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${status.badge}`}>
                            <status.Icon className="w-3.5 h-3.5" />
                            {status.label}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </>
        )
      )}
    </div>
  )
}
