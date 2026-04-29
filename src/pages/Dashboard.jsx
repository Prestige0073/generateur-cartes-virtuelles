import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { TEMPLATES, TIERS } from '../data/templates'
import Card3D from '../components/Card3D'
import {
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  ClipboardCopy,
  Clock,
  CreditCard,
  Link2,
  Loader2,
  Plus,
  RefreshCcw,
  ShieldCheck,
  Wallet,
} from 'lucide-react'

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [cards, setCards] = useState([])
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('cards')
  const [copiedId, setCopiedId] = useState(null)

  useEffect(() => {
    async function fetchData() {
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
    fetchData()
  }, [user.id])

  function getActiveLink(card) {
    const now = new Date()
    return (card.share_links || [])
      .filter(l => new Date(l.expires_at) > now)
      .sort((a, b) => new Date(b.expires_at) - new Date(a.expires_at))[0] || null
  }

  function copyLink(slug, id) {
    const url = `${import.meta.env.VITE_APP_URL || window.location.origin}/share/${slug}`
    navigator.clipboard.writeText(url)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-10 h-10 text-sky-400 animate-spin" />
      </div>
    )
  }

  const paidPayments = payments.filter(p => p.status === 'success')
  const statusInfo = {
    success: { label: 'Succès', Icon: CheckCircle2, badge: 'bg-green-900/40 text-green-400' },
    pending: { label: 'En attente', Icon: Clock, badge: 'bg-yellow-900/40 text-yellow-400' },
    failed: { label: 'Échoué', Icon: AlertTriangle, badge: 'bg-red-900/40 text-red-400' },
  }

  const stats = [
    { label: 'Cartes créées', value: cards.length, Icon: CreditCard },
    { label: 'Paiements validés', value: paidPayments.length, Icon: ShieldCheck },
    { label: 'Total dépensé', value: `${paidPayments.reduce((s, p) => s + p.amount, 0).toLocaleString('fr-FR')} FCFA`, Icon: Wallet },
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between mb-10">
        <div>
          <h1 className="text-3xl font-bold">Mon espace</h1>
          <p className="text-slate-400 text-sm mt-1">{user.email}</p>
        </div>
        <Link
          to="/templates"
          className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-500 text-white text-sm font-semibold px-5 py-3 rounded-xl transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Nouvelle carte
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-3 mb-8">
        {stats.map(stat => (
          <div key={stat.label} className="bg-slate-800/60 border border-slate-700 rounded-3xl p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="text-slate-400 text-xs uppercase tracking-[0.2em]">{stat.label}</div>
              <stat.Icon className="w-5 h-5 text-sky-400" />
            </div>
            <div className="text-3xl font-semibold text-sky-400">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-2 mb-6">
        {[{ key: 'cards', label: 'Mes cartes' }, { key: 'payments', label: 'Historique paiements' }].map(t => (
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

      {tab === 'cards' && (
        cards.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-slate-700 rounded-3xl bg-slate-900/60">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-slate-800 text-sky-400">
              <CreditCard className="w-7 h-7" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Aucune carte créée</h3>
            <p className="text-slate-500 text-sm mb-6">Choisis un template et lance la création de ta première carte virtuelle.</p>
            <Link to="/templates" className="inline-flex items-center justify-center bg-sky-600 hover:bg-sky-500 text-white text-sm font-semibold px-6 py-3 rounded-xl transition">
              Voir le catalogue
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {cards.map(card => {
              const template = TEMPLATES.find(t => t.id === card.template_id) || TEMPLATES[0]
              const tier = TIERS[card.tier]
              const activeLink = getActiveLink(card)
              const daysLeft = activeLink
                ? Math.max(0, Math.ceil((new Date(activeLink.expires_at) - Date.now()) / (1000 * 60 * 60 * 24)))
                : 0

              return (
                <div key={card.id} className="bg-slate-800/60 border border-slate-700 rounded-3xl overflow-hidden shadow-sm transition hover:border-sky-500/50">
                  <div
                    className="flex justify-center pt-5 pb-3 px-5 cursor-pointer"
                    onClick={() => navigate(`/card/${card.id}`)}
                  >
                    <Card3D card={card} size="sm" interactive={false} />
                  </div>

                  <div className="px-5 pb-5 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="font-medium text-sm text-slate-100">{template.name}</div>
                        <div className="text-slate-500 text-xs mt-0.5">{card.cardholder_name}</div>
                      </div>
                      <span className={`text-xs font-semibold uppercase tracking-[0.18em] px-2.5 py-1 rounded-full ${tier.badge} ${tier.color}`}>
                        {tier.label}
                      </span>
                    </div>

                    <div className="text-slate-500 text-xs font-mono tracking-wider">
                      •••• •••• •••• {card.card_number.slice(-4)}
                      <span className="ml-2 text-slate-600">exp. {card.expiry_date}</span>
                    </div>

                    {card.display_amount && (
                      <div className="flex justify-between items-center text-xs border-t border-slate-700/60 pt-3">
                        <span className="text-slate-500">Solde esthétique</span>
                        <span className="font-semibold text-slate-300">{Number(card.display_amount).toLocaleString('fr-FR')} FCFA</span>
                      </div>
                    )}

                    <div className="border-t border-slate-700/60 pt-3">
                      {activeLink ? (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-xs font-medium text-sky-300">
                            <Link2 className="w-4 h-4" />
                            <span>Lien actif — {daysLeft}j restants</span>
                          </div>
                          <div className="flex gap-2">
                            <input
                              readOnly
                              value={`${import.meta.env.VITE_APP_URL || window.location.origin}/share/${activeLink.slug}`}
                              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-300 truncate min-w-0"
                            />
                            <button
                              onClick={() => copyLink(activeLink.slug, card.id)}
                              className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-500 px-3 py-2 rounded-xl text-xs text-white transition"
                            >
                              <ClipboardCopy className="w-4 h-4" />
                              {copiedId === card.id ? 'Copié' : 'Copier'}
                            </button>
                          </div>
                          <p className="text-slate-500 text-xs">
                            Mot de passe visible uniquement à la génération. {' '}
                            <button
                              type="button"
                              onClick={() => navigate(`/card/${card.id}`)}
                              className="inline-flex items-center gap-1 text-sky-300 hover:text-sky-200"
                            >
                              <RefreshCcw className="w-3.5 h-3.5" /> Regénérer
                            </button>
                          </p>
                        </div>
                      ) : (
                        <button
                          onClick={() => navigate(`/card/${card.id}`)}
                          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900/80 text-xs text-sky-300 hover:text-white transition py-2"
                        >
                          <Link2 className="w-4 h-4" /> Générer un lien de partage
                        </button>
                      )}
                    </div>

                    <div className="text-slate-500 text-xs text-right">Créée le {new Date(card.created_at).toLocaleDateString('fr-FR')}</div>
                  </div>
                </div>
              )
            })}
          </div>
        )
      )}

      {tab === 'payments' && (
        payments.length === 0 ? (
          <div className="text-center py-16 text-slate-500">Aucun paiement enregistré.</div>
        ) : (
          <>
            <div className="sm:hidden space-y-3">
              {payments.map(p => {
                const status = statusInfo[p.status] || statusInfo.failed
                return (
                  <div key={p.id} className="bg-slate-800/60 border border-slate-700 rounded-3xl p-4 shadow-sm">
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="text-slate-400 text-xs uppercase tracking-[0.18em]">{p.tier}</span>
                          <span className="text-slate-600 text-xs">·</span>
                          <span className="text-slate-400 text-xs capitalize">{p.payment_provider}</span>
                        </div>
                        <div className="text-slate-500 text-xs">{new Date(p.created_at).toLocaleDateString('fr-FR')}</div>
                      </div>
                      <div className="text-right shrink-0 space-y-1">
                        <div className="font-mono font-semibold text-sm">{p.amount.toLocaleString('fr-FR')} F</div>
                        <div className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${status.badge}`}>
                          <status.Icon className="w-3.5 h-3.5" />
                          {status.label}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="hidden sm:block bg-slate-800/60 border border-slate-700 rounded-3xl overflow-hidden shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-900/80 text-slate-400">
                    <th className="text-left p-4 font-medium">Date</th>
                    <th className="text-left p-4 font-medium">Niveau</th>
                    <th className="text-left p-4 font-medium">Opérateur</th>
                    <th className="text-right p-4 font-medium">Montant</th>
                    <th className="text-center p-4 font-medium">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map(p => {
                    const status = statusInfo[p.status] || statusInfo.failed
                    return (
                      <tr key={p.id} className="border-t border-slate-700">
                        <td className="p-4 text-slate-300">{new Date(p.created_at).toLocaleDateString('fr-FR')}</td>
                        <td className="p-4 text-slate-200 capitalize">{p.tier}</td>
                        <td className="p-4 text-slate-400 capitalize">{p.payment_provider}</td>
                        <td className="p-4 text-right text-slate-200 font-semibold">{p.amount.toLocaleString('fr-FR')} F</td>
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
