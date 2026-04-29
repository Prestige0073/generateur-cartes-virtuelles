import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TEMPLATES, TIERS } from '../data/templates'
import Card3D from '../components/Card3D'
import { Check } from 'lucide-react'

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
    <div className="max-w-6xl mx-auto px-4 py-10 md:py-12">
      <div className="text-center mb-8 md:mb-10">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Catalogue de templates</h1>
        <p className="text-slate-400 text-sm">Choisis le design de ta carte virtuelle</p>
      </div>

      {/* Filter tabs — scrollable sur mobile */}
      <div className="flex gap-2 mb-8 md:mb-10 overflow-x-auto pb-2 scrollbar-none md:justify-center">
        {[
          { key: 'all', label: 'Tous' },
          { key: 'basique', label: 'Basique • 5 200 F' },
          { key: 'premium', label: 'Premium • 6 200 F' },
          { key: 'vip', label: 'VIP • 7 200 F' },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap shrink-0 ${
              filter === f.key
                ? 'bg-sky-500 text-white'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-8">
        {filtered.map(template => {
          const tier = TIERS[template.tier]
          return (
            <div
              key={template.id}
              className={`bg-slate-800/50 border rounded-2xl p-5 flex flex-col items-center gap-4 transition-all duration-200 cursor-pointer ${
                selected === template.id
                  ? 'border-sky-400 shadow-lg shadow-sky-900/30'
                  : 'border-slate-700 hover:border-slate-600'
              }`}
              onClick={() => setSelected(template.id)}
            >
              <div className="relative w-full flex justify-center">
                <Card3D card={PREVIEW_CARD(template)} size="sm" interactive={false} />
                {selected === template.id && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-sky-400 rounded-full flex items-center justify-center text-white"><Check className="w-3.5 h-3.5" /></div>
                )}
              </div>

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
                className="w-full bg-sky-500 hover:bg-sky-400 active:bg-sky-600 text-white text-sm font-semibold py-3 rounded-xl transition"
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
