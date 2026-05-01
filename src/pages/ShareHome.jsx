import { CreditCard, ExternalLink, Lock, ShieldCheck } from 'lucide-react'
import Card3D from '../components/Card3D'

const DEMO_CARD = {
  tier: 'vip',
  template_id: 'obsidien-or',
  cardholder_name: 'JEAN DUPONT',
  card_number: '4532756279624305',
  expiry_date: '12/28',
  cvv: '742',
  network_type: 'mastercard',
  language: 'fr',
  display_amount: 500000,
}

const STEPS = [
  { n: '01', text: 'Demande le lien de partage au propriétaire de la carte' },
  { n: '02', text: 'Ouvre le lien — il ressemble à share/xxxxxx' },
  { n: '03', text: 'Entre le mot de passe pour visualiser la carte en 3D' },
]

export default function ShareHome() {
  const mainAppUrl = import.meta.env.VITE_APP_URL || 'https://mycardsv.vercel.app'

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-4 py-14 overflow-x-hidden">

      {/* Arrière-plan décoratif */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-sky-600/6 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-amber-600/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-lg flex flex-col items-center gap-10">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-slate-800/60 border border-slate-700/60 rounded-full px-4 py-1.5">
          <ShieldCheck className="w-4 h-4 text-sky-400" />
          <span className="text-slate-300 text-xs font-medium tracking-wide">Portail de partage sécurisé</span>
        </div>

        {/* Carte démo */}
        <div className="flex flex-col items-center gap-2">
          <Card3D card={DEMO_CARD} size="md" interactive={true} />
          <p className="text-slate-600 text-xs">Clique pour retourner la carte</p>
        </div>

        {/* Titre */}
        <div className="text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-100 mb-3">
            CardGen — Partage de cartes
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed max-w-sm mx-auto">
            Ce domaine est dédié à la visualisation de cartes bancaires décoratives partagées.
            Chaque carte est protégée par un mot de passe unique.
          </p>
        </div>

        {/* Étapes */}
        <div className="w-full bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 mb-5">
            <Lock className="w-4 h-4 text-sky-400" />
            <span className="text-slate-200 text-sm font-semibold">Comment accéder à une carte ?</span>
          </div>
          {STEPS.map(s => (
            <div key={s.n} className="flex items-start gap-4">
              <span className="shrink-0 text-xs font-bold text-sky-500 font-mono mt-0.5">{s.n}</span>
              <p className="text-slate-400 text-sm leading-relaxed">{s.text}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
          <a
            href={mainAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-400 active:bg-sky-600 text-white font-semibold px-6 py-3 rounded-xl transition text-sm w-full"
          >
            <CreditCard className="w-4 h-4" />
            Créer ma propre carte
            <ExternalLink className="w-3.5 h-3.5 opacity-70" />
          </a>
        </div>

        <p className="text-slate-700 text-xs text-center">
          © 2026 CardGen — Cartes bancaires décoratives
        </p>
      </div>
    </div>
  )
}
