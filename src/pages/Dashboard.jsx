import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
  RefreshCcw,
  ShieldCheck,
  Wallet,
} from 'lucide-react'

const APP_URL = import.meta.env.VITE_APP_URL || window.location.origin

function getSavedPw(linkId) {
  try {
    const raw = localStorage.getItem(`cardgen_pw_${linkId}`)
    return raw ? JSON.parse(raw).password : null
  } catch { return null }
}

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [cards, setCards] = useState([])
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('cards')
  const [copiedId, setCopiedId] = useState(null)
  const [visiblePw, setVisiblePw] = useState({})

  useEffect(() => {
    fetchData()
  }, [user.id])

  async function fetchData() {
    setLoading(true)
    const [{ data: cardsData }, { data: paymentsData }] = await Promise.all([
      supabase
        .from('cards')
        .select('*, share_links(id, slug, expires_at)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('payments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }),
    ])
    setCards(cardsData || [])
    setPayments(paymentsData || [])
    setLoading(false)
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

  function copyLinkAndPassword(slug, linkId, cardId) {
    const url = `${APP_URL}/share/${slug}`
    const pw = getSavedPw(linkId)
    const text = pw ? `Lien : ${url}\nMot de passe : ${pw}` : url
    copyText(text, cardId)
  }

  function togglePwVisible(linkId) {
    setVisiblePw(prev => ({ ...prev, [linkId]: !prev[linkId] }))
  }

  if (loading) {
    return <Loading message="Chargement de votre tableau de bord..." />
  }

  const paidPayments = payments.filter(p => p.status === 'success')
  const totalSpent = paidPayments.reduce((s, p) => s + p.amount, 0)

  const statusInfo = {
    success: { label: 'Succès',     Icon: CheckCircle2, badge: 'bg-green-900/40 text-green-400' },
    pending: { label: 'En attente', Icon: Clock,        badge: 'bg-yellow-900/40 text-yellow-400' },
    failed:  { label: 'Échoué',     Icon: AlertTriangle,badge: 'bg-red-900/40 text-red-400' },
  }

  const stats = [
    { label: 'Cartes créées',     value: cards.length,                                     Icon: CreditCard  },
    { label: 'Paiements validés', value: paidPayments.length,                               Icon: ShieldCheck },
    { label: 'Total dépensé',     value: `${totalSpent.toLocaleString('fr-FR')} F`,         Icon: Wallet      },
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 md:py-12">

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Mon espace</h1>
          <p className="text-slate-500 text-sm mt-0.5 truncate">{user.email}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-sm px-3 py-2.5 rounded-xl transition"
          >
            <RefreshCcw className="w-4 h-4" />
            <span className="hidden sm:inline">Actualiser</span>
          </button>
          <Link
            to="/templates"
            className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Nouvelle carte
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-3 grid-cols-3 mb-8">
        {stats.map(stat => (
          <div key={stat.label} className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4 md:p-5 shadow-sm">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="text-slate-500 text-xs uppercase tracking-[0.18em] leading-tight">{stat.label}</div>
              <stat.Icon className="w-4 h-4 md:w-5 md:h-5 text-sky-400 shrink-0" />
            </div>
            <div className="text-xl md:text-2xl font-bold text-sky-400 truncate">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[{ key: 'cards', label: 'Mes cartes' }, { key: 'payments', label: 'Paiements' }].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
              tab === t.key ? 'bg-sky-600 text-white shadow-sm' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── CARDS TAB ── */}
      {tab === 'cards' && (
        cards.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-slate-700 rounded-3xl bg-slate-900/40">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-slate-800 text-sky-400">
              <CreditCard className="w-7 h-7" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Aucune carte créée</h3>
            <p className="text-slate-500 text-sm mb-6 max-w-xs mx-auto">Choisis un template et génère ta première carte bancaire en quelques clics.</p>
            <Link to="/templates" className="inline-flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-500 text-white text-sm font-semibold px-6 py-3 rounded-xl transition">
              <Plus className="w-4 h-4" /> Voir le catalogue
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {cards.map(card => {
              const template  = TEMPLATES.find(t => t.id === card.template_id) || TEMPLATES[0]
              const tier      = TIERS[card.tier]
              const activeLink= getActiveLink(card)
              const daysLeft  = activeLink
                ? Math.max(0, Math.ceil((new Date(activeLink.expires_at) - Date.now()) / 86_400_000))
                : 0
              const savedPw   = activeLink ? getSavedPw(activeLink.id) : null
              const pwVisible = activeLink && visiblePw[activeLink.id]

              return (
                <div key={card.id} className="bg-slate-800/60 border border-slate-700 rounded-3xl overflow-hidden shadow-sm hover:border-sky-600/40 transition-colors">

                  {/* Card preview */}
                  <div
                    className="flex justify-center pt-5 pb-3 px-5 cursor-pointer"
                    onClick={() => navigate(`/card/${card.id}`)}
                  >
                    <Card3D card={card} size="sm" interactive={false} />
                  </div>

                  <div className="px-5 pb-5 space-y-3">
                    {/* Meta */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-semibold text-sm">{template.name}</div>
                        <div className="text-slate-500 text-xs mt-0.5 font-mono">{card.cardholder_name}</div>
                      </div>
                      <span className={`text-xs font-bold uppercase tracking-[0.18em] px-2.5 py-1 rounded-full shrink-0 ${tier.badge} ${tier.color}`}>
                        {tier.label}
                      </span>
                    </div>

                    {/* Card number + expiry */}
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-500 tracking-widest">•••• •••• •••• {card.card_number.slice(-4)}</span>
                      <span className="text-slate-600">exp. {card.expiry_date}</span>
                    </div>

                    {/* Display amount */}
                    {card.display_amount && (
                      <div className="flex justify-between items-center text-xs border-t border-slate-700/50 pt-3">
                        <span className="text-slate-500">Solde affiché</span>
                        <span className="font-semibold text-slate-300">{Number(card.display_amount).toLocaleString('fr-FR')} FCFA</span>
                      </div>
                    )}

                    {/* Share link section */}
                    <div className="border-t border-slate-700/50 pt-3 space-y-2.5">
                      {activeLink ? (
                        <>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 text-xs text-sky-300 font-medium">
                              <Link2 className="w-3.5 h-3.5" />
                              Lien actif — {daysLeft}j restants
                            </div>
                            <button
                              onClick={() => navigate(`/card/${card.id}`)}
                              className="text-xs text-slate-500 hover:text-slate-300 transition"
                            >
                              Regénérer →
                            </button>
                          </div>

                          {/* Link row */}
                          <div className="flex gap-2">
                            <input
                              readOnly
                              value={`${APP_URL}/share/${activeLink.slug}`}
                              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-300 truncate min-w-0"
                            />
                            <button
                              onClick={() => copyText(`${APP_URL}/share/${activeLink.slug}`, `link-${card.id}`)}
                              className="inline-flex items-center gap-1.5 bg-slate-700 hover:bg-slate-600 px-3 py-2 rounded-xl text-xs text-white transition"
                            >
                              <ClipboardCopy className="w-3.5 h-3.5" />
                              {copiedId === `link-${card.id}` ? 'Copié' : 'Copier'}
                            </button>
                          </div>

                          {/* Password row */}
                          {savedPw ? (
                            <div className="bg-slate-900/70 border border-slate-700/60 rounded-xl p-3 space-y-2">
                              <div className="flex items-center gap-1.5 text-xs text-amber-400/80 font-medium">
                                <KeyRound className="w-3.5 h-3.5" />
                                Mot de passe sauvegardé
                              </div>
                              <div className="flex gap-2">
                                <div className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-mono text-yellow-300 truncate min-w-0">
                                  {pwVisible ? savedPw : '•'.repeat(savedPw.length)}
                                </div>
                                <button
                                  onClick={() => togglePwVisible(activeLink.id)}
                                  className="bg-slate-700 hover:bg-slate-600 px-2.5 py-1.5 rounded-lg text-xs transition text-slate-300"
                                >
                                  {pwVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                </button>
                                <button
                                  onClick={() => copyText(savedPw, `pw-${card.id}`)}
                                  className="bg-slate-700 hover:bg-slate-600 px-2.5 py-1.5 rounded-lg text-xs text-white transition"
                                >
                                  {copiedId === `pw-${card.id}` ? '✓' : <ClipboardCopy className="w-3.5 h-3.5" />}
                                </button>
                              </div>
                              <button
                                onClick={() => copyLinkAndPassword(activeLink.slug, activeLink.id, `both-${card.id}`)}
                                className="w-full text-xs text-sky-300 hover:text-sky-200 transition py-1 flex items-center justify-center gap-1.5"
                              >
                                <ClipboardCopy className="w-3 h-3" />
                                {copiedId === `both-${card.id}` ? 'Lien + mot de passe copiés !' : 'Copier lien + mot de passe'}
                              </button>
                            </div>
                          ) : (
                            <p className="text-xs text-slate-600 flex items-center gap-1.5">
                              <KeyRound className="w-3.5 h-3.5 shrink-0" />
                              Mot de passe affiché une seule fois à la génération.
                              <button onClick={() => navigate(`/card/${card.id}`)} className="text-sky-400 hover:text-sky-300">Voir →</button>
                            </p>
                          )}
                        </>
                      ) : (
                        <button
                          onClick={() => navigate(`/card/${card.id}`)}
                          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900/60 border border-slate-700/50 text-xs text-sky-300 hover:text-white hover:border-sky-600/40 transition py-2.5"
                        >
                          <Link2 className="w-3.5 h-3.5" /> Générer un lien de partage
                        </button>
                      )}
                    </div>

                    <div className="text-slate-600 text-xs text-right">
                      Créée le {new Date(card.created_at).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )
      )}

      {/* ── PAYMENTS TAB ── */}
      {tab === 'payments' && (
        payments.length === 0 ? (
          <div className="text-center py-16 text-slate-500">Aucun paiement enregistré.</div>
        ) : (
          <>
            {/* Mobile */}
            <div className="sm:hidden space-y-3">
              {payments.map(p => {
                const status = statusInfo[p.status] || statusInfo.failed
                return (
                  <div key={p.id} className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <span className={`text-xs font-bold uppercase tracking-[0.15em] px-2 py-0.5 rounded-full ${TIERS[p.tier]?.badge || 'bg-slate-700'} ${TIERS[p.tier]?.color || 'text-slate-300'}`}>
                            {TIERS[p.tier]?.label || p.tier}
                          </span>
                          <span className="text-slate-500 text-xs capitalize">{p.payment_provider}</span>
                        </div>
                        <div className="text-slate-500 text-xs">{new Date(p.created_at).toLocaleDateString('fr-FR')}</div>
                      </div>
                      <div className="text-right shrink-0 space-y-1">
                        <div className="font-mono font-semibold text-sm">{p.amount.toLocaleString('fr-FR')} F</div>
                        <div className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${status.badge}`}>
                          <status.Icon className="w-3 h-3" />
                          {status.label}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Desktop */}
            <div className="hidden sm:block bg-slate-800/60 border border-slate-700 rounded-3xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-900/80 text-slate-400 text-left">
                    <th className="p-4 font-medium">Date</th>
                    <th className="p-4 font-medium">Niveau</th>
                    <th className="p-4 font-medium">Opérateur</th>
                    <th className="p-4 font-medium text-right">Montant</th>
                    <th className="p-4 font-medium text-center">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map(p => {
                    const status = statusInfo[p.status] || statusInfo.failed
                    const tierInfo = TIERS[p.tier]
                    return (
                      <tr key={p.id} className="border-t border-slate-700/60">
                        <td className="p-4 text-slate-300">{new Date(p.created_at).toLocaleDateString('fr-FR')}</td>
                        <td className="p-4">
                          <span className={`text-xs font-bold uppercase tracking-[0.15em] px-2.5 py-1 rounded-full ${tierInfo?.badge || 'bg-slate-700'} ${tierInfo?.color || 'text-slate-300'}`}>
                            {tierInfo?.label || p.tier}
                          </span>
                        </td>
                        <td className="p-4 text-slate-400 capitalize">{p.payment_provider}</td>
                        <td className="p-4 text-right font-semibold font-mono">{p.amount.toLocaleString('fr-FR')} F</td>
                        <td className="p-4 text-center">
                          <span className={`inline-flex items-center justify-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${status.badge}`}>
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
