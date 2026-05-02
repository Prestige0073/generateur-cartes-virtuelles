import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { TEMPLATES, TIERS } from '../data/templates'
import Card3D from '../components/Card3D'
import { Check, ChevronRight, Layers, Zap, Crown } from 'lucide-react'

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

function SkeletonCard() {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col items-center gap-4 shadow-sm animate-pulse">
      {/* card shape */}
      <div className="w-full rounded-xl bg-slate-200" style={{ aspectRatio: '1.586 / 1' }} />
      {/* name */}
      <div className="w-full space-y-2 text-center">
        <div className="h-3.5 bg-slate-200 rounded-full w-3/4 mx-auto" />
        <div className="h-3 bg-slate-100 rounded-full w-1/2 mx-auto" />
      </div>
      {/* button */}
      <div className="h-10 w-full bg-slate-200 rounded-xl" />
    </div>
  )
}

export default function Templates() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500)
    return () => clearTimeout(t)
  }, [])

  const filtered = filter === 'all' ? TEMPLATES : TEMPLATES.filter(t => t.tier === filter)

  function handleChoose(template) {
    navigate(`/payment/${template.tier}?templateId=${template.id}`)
  }

  const activeTier = filter !== 'all' ? TIERS[filter] : null

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-10 md:py-12">
        {/* Header skeleton */}
        <div className="text-center mb-8 md:mb-10 animate-pulse">
          <div className="h-8 bg-slate-200 rounded-full w-64 mx-auto mb-3" />
          <div className="h-4 bg-slate-100 rounded-full w-48 mx-auto" />
        </div>

        {/* Filters skeleton */}
        <div className="flex gap-2 mb-6 justify-center animate-pulse">
          {[120, 140, 150, 120].map((w, i) => (
            <div key={i} className="h-9 bg-slate-200 rounded-lg shrink-0" style={{ width: w }} />
          ))}
        </div>

        {/* Grid skeleton */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 md:py-12 animate-fadeIn">
      <div className="text-center mb-8 md:mb-10">
        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-slate-900">Catalogue de templates</h1>
        <p className="text-slate-600 text-sm">16 designs exclusifs — un paiement unique par carte</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-none md:justify-center">
        {FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition whitespace-nowrap shrink-0 ${
              filter === f.key
                ? f.key === 'vip'     ? 'bg-amber-600 text-white'
                : f.key === 'premium' ? 'bg-sky-600 text-white'
                :                       'bg-sky-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Tier advantages banner */}
      {activeTier && (
        <div className={`mb-8 rounded-2xl p-4 border flex flex-wrap gap-3 items-center ${
          filter === 'vip'     ? 'bg-amber-50 border-amber-200' :
          filter === 'premium' ? 'bg-sky-50 border-sky-200' :
                                 'bg-slate-50 border-slate-200'
        }`}>
          <span className={`text-xs font-bold uppercase tracking-[0.18em] px-2.5 py-1 rounded-full ${activeTier.badge} ${activeTier.color}`}>
            {activeTier.label}
          </span>
          {activeTier.features.map(f => (
            <span key={f} className="inline-flex items-center gap-1.5 text-xs text-slate-700 font-medium">
              <Check className="w-3.5 h-3.5 text-green-600 shrink-0" />
              {f}
            </span>
          ))}
        </div>
      )}

      {/* Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {filtered.map((template, idx) => {
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
              className={`bg-white border rounded-2xl p-4 flex flex-col items-center gap-4 transition-all duration-200 cursor-pointer shadow-sm animate-fadeInUp ${
                selected === template.id
                  ? 'border-sky-500 shadow-lg shadow-sky-100'
                  : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
              }`}
              style={{ animationDelay: `${idx * 0.04}s` }}
              onClick={() => setSelected(template.id)}
            >
              <div className="relative w-full flex justify-center">
                <Card3D card={PREVIEW_CARD(template)} size="sm" interactive={false} />
                {selected === template.id && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-sky-500 rounded-full flex items-center justify-center text-white shadow-sm">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>

              <div className="w-full text-center">
                <div className="font-bold text-sm text-slate-900 mb-1.5">{template.name}</div>
                <div className="flex items-center justify-center gap-2">
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${tier.badge} ${tier.color}`}>
                    {tier.label}
                  </span>
                  <span className="text-slate-600 text-xs font-semibold">{tier.price.toLocaleString('fr-FR')} F</span>
                </div>
                <div className="text-slate-500 text-xs mt-1 uppercase tracking-widest">
                  {template.network}
                </div>
              </div>

              {perks.length > 0 && (
                <div className="w-full grid grid-cols-2 gap-2 text-[11px]">
                  {perks.map(perk => (
                    <span key={perk} className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-700 text-center font-medium">
                      {perk}
                    </span>
                  ))}
                </div>
              )}

              <button
                onClick={(e) => { e.stopPropagation(); handleChoose(template) }}
                className={`w-full inline-flex items-center justify-center gap-1.5 text-white text-sm font-semibold py-2.5 rounded-xl transition ${
                  template.tier === 'vip'     ? 'bg-amber-600 hover:bg-amber-500 active:bg-amber-700' :
                  template.tier === 'premium' ? 'bg-sky-600 hover:bg-sky-500 active:bg-sky-700' :
                                               'bg-sky-600 hover:bg-sky-500 active:bg-sky-700'
                }`}
              >
                Choisir ce design <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )
        })}
      </div>

      {/* Tier comparison footer */}
      <div className="mt-12 border-t border-slate-200 pt-10">
        <h2 className="text-center font-bold text-lg mb-6 text-slate-900">Comparatif des niveaux</h2>
        <div className="grid sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {Object.entries(TIERS).map(([key, tier]) => (
            <div key={key} className={`rounded-2xl p-5 border ${
              key === 'vip'     ? 'border-amber-200 bg-amber-50' :
              key === 'premium' ? 'border-sky-200 bg-sky-50' :
                                  'border-slate-200 bg-white'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                    key === 'vip' ? 'bg-amber-100' : key === 'premium' ? 'bg-sky-100' : 'bg-slate-100'
                  }`}>
                    {key === 'vip' ? <Crown className="w-3.5 h-3.5 text-amber-600" /> : key === 'premium' ? <Zap className="w-3.5 h-3.5 text-sky-600" /> : <Layers className="w-3.5 h-3.5 text-slate-600" />}
                  </span>
                  <span className={`text-xs font-bold uppercase tracking-[0.18em] ${
                    key === 'vip' ? 'text-amber-600' : key === 'premium' ? 'text-sky-600' : 'text-slate-700'
                  }`}>{tier.label}</span>
                </div>
                <span className="text-sm font-bold text-slate-800">{tier.price.toLocaleString('fr-FR')} F</span>
              </div>
              <ul className="space-y-1.5">
                {tier.features.map(f => (
                  <li key={f} className="flex items-start gap-1.5 text-xs text-slate-700">
                    <Check className="w-3.5 h-3.5 text-green-600 mt-0.5 shrink-0" />
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
