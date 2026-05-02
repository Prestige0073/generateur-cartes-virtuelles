import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TEMPLATES, TIERS } from '../data/templates'
import Card3D from '../components/Card3D'
import { Check, ChevronRight } from 'lucide-react'

const PREVIEW_CARD = (template) => ({
  tier: template.tier,
  template_id: template.id,
  cardholder_name: 'VOTRE NOM',
  card_number: '4532756279624305',
  expiry_date: '12/28',
  cvv: '742',
  network_type: template.network,
  language: 'fr',
  display_amount: null,
})

const FILTERS = [
  { key: 'all',     label: 'Tous les designs' },
  { key: 'basique', label: 'Basique • 5 200 F' },
  { key: 'premium', label: 'Premium • 6 200 F' },
  { key: 'vip',     label: 'VIP • 7 200 F' },
]

export default function Templates() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState(null)

  const filtered = filter === 'all' ? TEMPLATES : TEMPLATES.filter(t => t.tier === filter)

  function handleChoose(template) {
    // PAIEMENT DÉSACTIVÉ TEMPORAIREMENT — retirer le commentaire ci-dessous pour réactiver
    // navigate(`/payment/${template.tier}?templateId=${template.id}`)
    navigate(`/create-card?templateId=${template.id}`)
  }

  const activeTier = filter !== 'all' ? TIERS[filter] : null

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 md:py-12">
      <div className="text-center mb-8 md:mb-10">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Catalogue de templates</h1>
        <p className="text-slate-400 text-sm">16 designs exclusifs — un paiement unique par carte</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-none md:justify-center">
        {FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap shrink-0 ${
              filter === f.key
                ? f.key === 'vip'    ? 'bg-amber-600 text-white' :
                  f.key === 'premium' ? 'bg-sky-600 text-white' :
                                        'bg-sky-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Tier advantages banner */}
      {activeTier && (
        <div className={`mb-8 rounded-2xl p-4 border flex flex-wrap gap-3 items-center ${
          filter === 'vip'    ? 'bg-amber-50 border-amber-200' :
          filter === 'premium' ? 'bg-sky-50 border-sky-200' :
                                 'bg-slate-50 border-slate-200'
        }`}>
          <span className={`text-xs font-bold uppercase tracking-[0.18em] px-2.5 py-1 rounded-full ${activeTier.badge} ${activeTier.color}`}>
            {activeTier.label}
          </span>
          {activeTier.features.map(f => (
            <span key={f} className="inline-flex items-center gap-1.5 text-xs text-slate-600">
              <Check className="w-3.5 h-3.5 text-green-400 shrink-0" />
              {f}
            </span>
          ))}
        </div>
      )}

      {/* Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {filtered.map(template => {
          const tier = TIERS[template.tier]
          const perks = [
            tier.displayAmount && 'Solde décoratif',
            tier.customStyle && 'Style personnalisable',
            tier.customFont && 'Police personnalisable',
            tier.customBankName && 'Nom de banque VIP',
          ].filter(Boolean)

          return (
            <div
              key={template.id}
              className={`bg-white border rounded-2xl p-4 flex flex-col items-center gap-4 transition-all duration-200 cursor-pointer shadow-sm ${
                selected === template.id
                  ? 'border-sky-400 shadow-lg shadow-sky-900/20'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
              onClick={() => setSelected(template.id)}
            >
              <div className="relative w-full flex justify-center">
                <Card3D card={PREVIEW_CARD(template)} size="sm" interactive={false} />
                {selected === template.id && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-sky-400 rounded-full flex items-center justify-center text-white">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>

              <div className="w-full text-center">
                <div className="font-semibold text-sm mb-1.5">{template.name}</div>
                <div className="flex items-center justify-center gap-2">
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${tier.badge} ${tier.color}`}>
                    {tier.label}
                  </span>
                  <span className="text-slate-500 text-xs font-mono">{tier.price.toLocaleString('fr-FR')} F</span>
                </div>
                <div className="text-slate-600 text-xs mt-1 uppercase tracking-widest">
                  {template.network}
                </div>
              </div>

              {perks.length > 0 && (
                <div className="w-full grid grid-cols-2 gap-2 text-[11px]">
                  {perks.map(perk => (
                    <span key={perk} className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600 text-center">
                      {perk}
                    </span>
                  ))}
                </div>
              )}

              <button
                onClick={(e) => { e.stopPropagation(); handleChoose(template) }}
                className={`w-full inline-flex items-center justify-center gap-1.5 text-white text-sm font-semibold py-2.5 rounded-xl transition ${
                  template.tier === 'vip'    ? 'bg-amber-600 hover:bg-amber-500' :
                  template.tier === 'premium' ? 'bg-sky-600 hover:bg-sky-500' :
                                               'bg-sky-600 hover:bg-sky-500'
                }`}
              >
                Acheter cette carte <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )
        })}
      </div>

      {/* Tier comparison footer */}
      <div className="mt-12 border-t border-slate-200 pt-10">
        <h2 className="text-center font-bold text-lg mb-6 text-slate-600">Comparatif des niveaux</h2>
        <div className="grid sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {Object.entries(TIERS).map(([key, tier]) => (
            <div key={key} className={`rounded-2xl p-5 border ${
              key === 'vip'     ? 'border-amber-200 bg-amber-50' :
              key === 'premium' ? 'border-sky-200 bg-sky-50' :
                                  'border-slate-200 bg-white'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <span className={`text-xs font-bold uppercase tracking-[0.18em] ${tier.color}`}>{tier.label}</span>
                <span className="text-sm font-bold text-slate-600">{tier.price.toLocaleString('fr-FR')} F</span>
              </div>
              <ul className="space-y-1.5">
                {tier.features.map(f => (
                  <li key={f} className="flex items-start gap-1.5 text-xs text-slate-500">
                    <Check className="w-3.5 h-3.5 text-green-500 mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
