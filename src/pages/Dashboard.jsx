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

  useEffect(() => {
    async function fetchData() {
      const [{ data: cardsData }, { data: paymentsData }] = await Promise.all([
        supabase.from('cards').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('payments').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      ])
      setCards(cardsData || [])
      setPayments(paymentsData || [])
      setLoading(false)
    }
    fetchData()
  }, [user.id])

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
              return (
                <div
                  key={card.id}
                  className="bg-slate-800/50 border border-slate-700 hover:border-slate-600 rounded-2xl p-5 cursor-pointer transition-all group"
                  onClick={() => navigate(`/card/${card.id}`)}
                >
                  <div className="flex justify-center mb-4 group-hover:scale-[1.02] transition-transform">
                    <Card3D card={card} size="sm" interactive={false} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-sm">{template.name}</div>
                      <div className="text-slate-500 text-xs mt-0.5">
                        Créée le {new Date(card.created_at).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${tier.badge} ${tier.color}`}>
                      {tier.label}
                    </span>
                  </div>
                  {card.display_amount && (
                    <div className="mt-3 pt-3 border-t border-slate-700 flex justify-between items-center">
                      <span className="text-slate-500 text-xs">Solde esthétique</span>
                      <span className="font-semibold text-sm">{Number(card.display_amount).toLocaleString('fr-FR')} FCFA</span>
                    </div>
                  )}
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
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl overflow-hidden">
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
        )
      )}
    </div>
  )
}
