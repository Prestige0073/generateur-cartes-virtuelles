import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TEMPLATES, TIERS } from '../data/templates'
import Card3D from '../components/Card3D'

const PREVIEW_CARD = (template) => ({
  template_id: template.id,
  cardholder_name: 'VOTRE NOM',
  card_number: '4532756279624305',
  expiry_date: '12/28',
  cvv: '742',
  network_type: template.network,
  language: 'fr',
  display_amount: null,
})

export default function Templates() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState(null)

  const filtered = filter === 'all' ? TEMPLATES : TEMPLATES.filter(t => t.tier === filter)

  function handleChoose(template) {
    navigate(`/payment/${template.tier}?templateId=${template.id}`)
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-3">Catalogue de templates</h1>
        <p className="text-slate-400">Choisis le design de ta carte virtuelle</p>
      </div>

      {/* Filter tabs */}
      <div className="flex justify-center gap-2 mb-10">
        {[
          { key: 'all', label: 'Tous' },
          { key: 'basique', label: 'Basique — 5 200 FCFA' },
          { key: 'premium', label: 'Premium — 6 200 FCFA' },
          { key: 'vip', label: 'VIP — 7 200 FCFA' },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === f.key
                ? 'bg-violet-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map(template => {
          const tier = TIERS[template.tier]
          return (
            <div
              key={template.id}
              className={`bg-slate-800/50 border rounded-2xl p-6 flex flex-col items-center gap-5 transition-all duration-200 cursor-pointer ${
                selected === template.id
                  ? 'border-violet-500 shadow-lg shadow-violet-900/30'
                  : 'border-slate-700 hover:border-slate-600'
              }`}
              onClick={() => setSelected(template.id)}
            >
              {/* Card preview */}
              <div className="relative">
                <Card3D card={PREVIEW_CARD(template)} size="sm" />
                {selected === template.id && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-violet-500 rounded-full flex items-center justify-center text-white text-xs font-bold">✓</div>
                )}
              </div>

              {/* Info */}
              <div className="w-full text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <h3 className="font-semibold">{template.name}</h3>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${tier.badge} ${tier.color}`}>
                    {tier.label}
                  </span>
                  <span className="text-slate-400 text-sm">{tier.price.toLocaleString('fr-FR')} FCFA</span>
                </div>
              </div>

              <button
                onClick={(e) => { e.stopPropagation(); handleChoose(template) }}
                className="w-full bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold py-2.5 rounded-xl transition"
              >
                Choisir ce design →
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
