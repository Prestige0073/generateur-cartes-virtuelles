import { Link } from 'react-router-dom'
import Card3D from '../components/Card3D'
import { AlertTriangle, Check, CreditCard, Link2, ShieldCheck, X } from 'lucide-react'
import { TIERS } from '../data/templates'

const DEMO_CARD = {
  tier: 'vip',
  template_id: 'obsidien-or',
  cardholder_name: 'JEAN DUPONT',
  card_number: '4532756279624305',
  expiry_date: '12/28',
  cvv: '742',
  network_type: 'mastercard',
  language: 'fr',
  display_amount: 250000,
}

const FEATURES = [
  {
    Icon: ShieldCheck,
    title: 'Paiement sécurisé',
    desc: 'Paiement Mobile Money (MTN MoMo, Orange Money, Moov) via LeekPay.',
  },
  {
    Icon: CreditCard,
    title: 'Design réaliste',
    desc: '16 templates exclusifs style Visa & Mastercard avec animation 3D fluide.',
  },
  {
    Icon: Link2,
    title: 'Partage protégé',
    desc: 'Génère un lien unique protégé par mot de passe — sauvegardé dans ton dashboard.',
  },
]

export default function Home() {
  return (
    <div className="overflow-x-hidden">

      {/* Hero */}
      <section className="relative min-h-[88vh] flex items-center">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 md:w-96 md:h-96 bg-sky-500/15 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 md:w-80 md:h-80 bg-sky-600/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-6xl mx-auto px-4 py-14 md:py-20 w-full relative z-10">
          <div className="flex flex-col items-center text-center md:grid md:grid-cols-2 md:gap-12 md:items-center md:text-left">
            <div>
              <div className="inline-flex items-center gap-2 bg-slate-800/50 border border-slate-700/50 rounded-full px-4 py-1.5 mb-5">
                <span className="w-2 h-2 bg-sky-400 rounded-full animate-pulse" />
                <span className="text-slate-300 text-xs md:text-sm font-medium">Carte bancaire professionnelle</span>
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-5">
                Génère ta carte bancaire<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-400">
                  réelle
                </span>{' '}
                en 3D
              </h1>
              <p className="text-slate-400 text-base md:text-lg mb-7 leading-relaxed max-w-md mx-auto md:mx-0">
                Crée une carte bancaire au design réaliste, animée en 3D recto/verso.
                Partageable via lien sécurisé avec mot de passe.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                <Link to="/signup" className="bg-sky-500 hover:bg-sky-400 active:bg-sky-600 text-white font-semibold px-8 py-3.5 rounded-xl transition text-sm text-center">
                  Créer mon compte
                </Link>
                <Link to="/templates" className="bg-slate-800 hover:bg-slate-700 text-white font-semibold px-8 py-3.5 rounded-xl transition text-sm border border-slate-700 text-center">
                  Voir le catalogue
                </Link>
              </div>
            </div>

            <div className="flex flex-col items-center gap-3 mt-10 md:mt-0 w-full">
              <Card3D card={DEMO_CARD} size="md" />
              <p className="text-slate-600 text-xs">Cliquer pour retourner</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 md:py-20 border-t border-slate-800">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-3">Tout ce qu'il te faut</h2>
          <p className="text-slate-500 text-sm md:text-base text-center mb-10">
            Une plateforme complète pour créer et partager tes cartes bancaires
          </p>
          <div className="grid sm:grid-cols-3 gap-4 md:gap-6">
            {FEATURES.map(item => (
              <div key={item.title} className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5 md:p-6 hover:border-sky-600/40 transition">
                <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-900/35 text-sky-300">
                  <item.Icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-base md:text-lg mb-2">{item.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing / Tier comparison */}
      <section className="py-16 md:py-20 border-t border-slate-800">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-3">Choisis ton niveau</h2>
          <p className="text-slate-500 text-center text-sm mb-12">Un paiement unique par carte — aucun abonnement</p>

          <div className="grid sm:grid-cols-3 gap-4 md:gap-5">
            {Object.entries(TIERS).map(([key, tier], i) => {
              const highlight = key === 'premium'
              const isVip = key === 'vip'
              return (
                <div key={key} className={`relative bg-slate-800/50 rounded-2xl p-6 border-2 transition ${
                  isVip    ? 'border-amber-700/50 shadow-lg shadow-amber-900/10' :
                  highlight? 'border-sky-700/60 shadow-lg shadow-sky-900/10' :
                             'border-slate-700'
                }`}>
                  {highlight && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-sky-500 text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                      Populaire
                    </div>
                  )}
                  {isVip && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                      Elite
                    </div>
                  )}

                  <div className={`text-xs font-bold uppercase tracking-[0.2em] mb-3 ${tier.color}`}>
                    {tier.label}
                  </div>
                  <div className="text-3xl font-bold mb-0.5">
                    {tier.price.toLocaleString('fr-FR')}
                    <span className="text-base font-normal text-slate-400 ml-1">FCFA</span>
                  </div>
                  <p className="text-slate-600 text-xs mb-5">Paiement unique par carte</p>

                  <ul className="space-y-2 mb-6">
                    {tier.features.map(f => (
                      <li key={f} className="flex items-start gap-2 text-sm text-slate-300">
                        <Check className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                    {tier.locked.map(f => (
                      <li key={f} className="flex items-start gap-2 text-sm text-slate-600">
                        <X className="w-4 h-4 mt-0.5 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    to="/templates"
                    className={`block text-center text-sm font-semibold py-2.5 rounded-xl transition ${
                      isVip    ? 'bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300' :
                      highlight ? 'bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/40 text-sky-300' :
                                 'bg-slate-700/60 hover:bg-slate-700 border border-slate-600 text-slate-300'
                    }`}
                  >
                    Choisir {tier.label}
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-20 border-t border-slate-800">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Prêt à créer ta carte ?</h2>
          <p className="text-slate-400 text-sm md:text-base mb-8">
            Inscris-toi gratuitement et choisis ton design en quelques clics.
          </p>
          <Link to="/signup" className="inline-block bg-sky-500 hover:bg-sky-400 active:bg-sky-600 text-white font-semibold px-8 md:px-10 py-4 rounded-xl transition">
            Commencer maintenant
          </Link>
        </div>
      </section>

      <footer className="border-t border-slate-800 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-slate-600 text-xs leading-relaxed">
            <AlertTriangle className="inline h-4 w-4 align-text-bottom mr-1" />
            Cartes bancaires professionnelles au design réaliste.
          </p>
          <p className="text-slate-700 text-xs mt-2">© 2026 CardGen</p>
        </div>
      </footer>
    </div>
  )
}
