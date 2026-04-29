import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { TEMPLATES, TIERS } from '../data/templates'
import Card3D from '../components/Card3D'

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
        <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-2xl font-bold">Mon espace</h1>
          <p className="text-slate-400 text-sm mt-1">{user.email}</p>
        </div>
        <Link
          to="/templates"
          className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition self-start"
        >
          + Nouvelle carte
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Cartes créées', value: cards.length },
          { label: 'Paiements', value: payments.filter(p => p.status === 'success').length },
          { label: 'Total dépensé', value: `${payments.filter(p => p.status === 'success').reduce((s, p) => s + p.amount, 0).toLocaleString('fr-FR')} FCFA` },
        ].map(s => (
          <div key={s.label} className="bg-slate-800/50 border border-slate-700 rounded-2xl p-4 text-center">
            <div className="text-2xl font-bold text-violet-400">{s.value}</div>
            <div className="text-slate-500 text-xs mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[{ key: 'cards', label: 'Mes cartes' }, { key: 'payments', label: 'Historique paiements' }].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              tab === t.key ? 'bg-violet-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Cards tab */}
      {tab === 'cards' && (
        cards.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-slate-800 rounded-2xl">
            <div className="text-5xl mb-4">💳</div>
            <h3 className="font-semibold text-lg mb-2">Aucune carte créée</h3>
            <p className="text-slate-500 text-sm mb-6">Choisis un template et crée ta première carte virtuelle.</p>
            <Link to="/templates" className="bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition">
              Voir le catalogue
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {cards.map(card => {
              const template = TEMPLATES.find(t => t.id === card.template_id) || TEMPLATES[0]
              const tier = TIERS[card.tier]
              const activeLink = getActiveLink(card)
              const daysLeft = activeLink
                ? Math.max(0, Math.ceil((new Date(activeLink.expires_at) - Date.now()) / (1000 * 60 * 60 * 24)))
                : 0

              return (
                <div key={card.id} className="bg-slate-800/50 border border-slate-700 hover:border-slate-600 rounded-2xl overflow-hidden transition-all">
                  {/* Carte 3D cliquable */}
                  <div
                    className="flex justify-center pt-5 pb-3 px-5 cursor-pointer"
                    onClick={() => navigate(`/card/${card.id}`)}
                  >
                    <Card3D card={card} size="sm" interactive={false} />
                  </div>

                  <div className="px-5 pb-5 space-y-3">
                    {/* Infos */}
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-sm">{template.name}</div>
                        <div className="text-slate-500 text-xs mt-0.5">
                          {card.cardholder_name}
                        </div>
                      </div>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${tier.badge} ${tier.color}`}>
                        {tier.label}
                      </span>
                    </div>

                    {/* Numéro masqué */}
                    <div className="text-slate-500 text-xs font-mono tracking-wider">
                      •••• •••• •••• {card.card_number.slice(-4)}
                      <span className="ml-2 text-slate-600">exp. {card.expiry_date}</span>
                    </div>

                    {/* Solde esthétique */}
                    {card.display_amount && (
                      <div className="flex justify-between items-center text-xs border-t border-slate-700/50 pt-2">
                        <span className="text-slate-500">Solde esthétique</span>
                        <span className="font-semibold text-slate-300">{Number(card.display_amount).toLocaleString('fr-FR')} FCFA</span>
                      </div>
                    )}

                    {/* Lien de partage */}
                    <div className="border-t border-slate-700/50 pt-3">
                      {activeLink ? (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-green-400 text-xs font-medium">🔗 Lien actif — {daysLeft}j restants</span>
                          </div>
                          <div className="flex gap-2">
                            <input
                              readOnly
                              value={`${import.meta.env.VITE_APP_URL || window.location.origin}/share/${activeLink.slug}`}
                              className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-400 truncate min-w-0"
                            />
                            <button
                              onClick={() => copyLink(activeLink.slug, card.id)}
                              className="bg-slate-700 hover:bg-slate-600 px-2.5 py-1.5 rounded-lg text-xs transition shrink-0"
                            >
                              {copiedId === card.id ? '✓' : 'Copier'}
                            </button>
                          </div>
                          <p className="text-slate-600 text-xs mt-1.5">
                            Mot de passe : visible uniquement à la génération.{' '}
                            <span
                              className="text-violet-500 cursor-pointer hover:text-violet-400"
                              onClick={() => navigate(`/card/${card.id}`)}
                            >
                              Regénérer →
                            </span>
                          </p>
                        </div>
                      ) : (
                        <button
                          onClick={() => navigate(`/card/${card.id}`)}
                          className="w-full text-center text-xs text-violet-400 hover:text-violet-300 transition py-1"
                        >
                          🔗 Générer un lien de partage
                        </button>
                      )}
                    </div>

                    {/* Date création */}
                    <div className="text-slate-700 text-xs text-right">
                      Créée le {new Date(card.created_at).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )
      )}

      {/* Payments tab */}
      {tab === 'payments' && (
        payments.length === 0 ? (
          <div className="text-center py-16 text-slate-500">Aucun paiement enregistré.</div>
        ) : (
          <>
            {/* Mobile : liste de cartes */}
            <div className="sm:hidden space-y-3">
              {payments.map(p => (
                <div key={p.id} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-semibold text-sm capitalize">{p.tier}</span>
                      <span className="text-slate-600 text-xs">·</span>
                      <span className="text-slate-400 text-xs capitalize">{p.payment_provider}</span>
                    </div>
                    <div className="text-slate-500 text-xs">{new Date(p.created_at).toLocaleDateString('fr-FR')}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-mono font-semibold text-sm">{p.amount.toLocaleString('fr-FR')} F</div>
                    <span className={`mt-1 inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                      p.status === 'success' ? 'bg-green-900/40 text-green-400' :
                      p.status === 'pending' ? 'bg-yellow-900/40 text-yellow-400' :
                      'bg-red-900/40 text-red-400'
                    }`}>
                      {p.status === 'success' ? '✓' : p.status === 'pending' ? '⏳' : '✗'} {p.status === 'success' ? 'Succès' : p.status === 'pending' ? 'En attente' : 'Échoué'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop : tableau */}
            <div className="hidden sm:block bg-slate-800/50 border border-slate-700 rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700 text-slate-400">
                    <th className="text-left p-4 font-medium">Date</th>
                    <th className="text-left p-4 font-medium">Niveau</th>
                    <th className="text-left p-4 font-medium">Opérateur</th>
                    <th className="text-right p-4 font-medium">Montant</th>
                    <th className="text-center p-4 font-medium">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p, i) => (
                    <tr key={p.id} className={`border-b border-slate-800 ${i % 2 === 0 ? '' : 'bg-slate-800/30'}`}>
                      <td className="p-4 text-slate-400">{new Date(p.created_at).toLocaleDateString('fr-FR')}</td>
                      <td className="p-4 capitalize">{p.tier}</td>
                      <td className="p-4 capitalize text-slate-400">{p.payment_provider}</td>
                      <td className="p-4 text-right font-mono font-medium">{p.amount.toLocaleString('fr-FR')} FCFA</td>
                      <td className="p-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          p.status === 'success' ? 'bg-green-900/40 text-green-400' :
                          p.status === 'pending' ? 'bg-yellow-900/40 text-yellow-400' :
                          'bg-red-900/40 text-red-400'
                        }`}>
                          {p.status === 'success' ? '✓ Succès' : p.status === 'pending' ? '⏳ En attente' : '✗ Échoué'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )
      )}
    </div>
  )
}
