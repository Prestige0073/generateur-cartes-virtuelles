import { Link } from 'react-router-dom'
import Card3D from '../components/Card3D'

const DEMO_CARD = {
  template_id: 'mc-black',
  cardholder_name: 'JEAN DUPONT',
  card_number: '4532756279624305',
  expiry_date: '12/28',
  cvv: '742',
  network_type: 'mastercard',
  language: 'fr',
  display_amount: 250000,
}

export default function Home() {
  return (
    <div className="overflow-x-hidden">
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative min-h-[88vh] flex items-center">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 md:w-96 md:h-96 bg-violet-600/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 md:w-80 md:h-80 bg-purple-600/15 rounded-full blur-3xl" />
        </div>

        <div className="max-w-6xl mx-auto px-4 py-14 md:py-20 w-full relative z-10">
          {/* Mobile : texte + carte empilés / Desktop : côte à côte */}
          <div className="flex flex-col items-center text-center md:grid md:grid-cols-2 md:gap-12 md:items-center md:text-left">
            <div>
              <div className="inline-flex items-center gap-2 bg-violet-900/40 border border-violet-700/50 rounded-full px-4 py-1.5 mb-5">
                <span className="w-2 h-2 bg-violet-400 rounded-full animate-pulse" />
                <span className="text-violet-300 text-xs md:text-sm font-medium">Projet scolaire pédagogique</span>
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-5">
                Génère ta carte<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-purple-400">
                  virtuelle
                </span>{' '}
                en 3D
              </h1>
              <p className="text-slate-400 text-base md:text-lg mb-7 leading-relaxed max-w-md mx-auto md:mx-0">
                Crée une carte bancaire virtuelle au design réaliste, animée en 3D recto/verso.
                Partageable via lien protégé par mot de passe.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                <Link to="/signup" className="bg-violet-600 hover:bg-violet-500 active:bg-violet-700 text-white font-semibold px-8 py-3.5 rounded-xl transition text-sm text-center">
                  Créer mon compte
                </Link>
                <Link to="/templates" className="bg-slate-800 hover:bg-slate-700 text-white font-semibold px-8 py-3.5 rounded-xl transition text-sm border border-slate-700 text-center">
                  Voir le catalogue
                </Link>
              </div>
            </div>

            {/* Card preview */}
            <div className="flex flex-col items-center gap-3 mt-10 md:mt-0 w-full">
              <Card3D card={DEMO_CARD} size="md" />
              <p className="text-slate-600 text-xs">Cliquer pour retourner</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────── */}
      <section className="py-16 md:py-20 border-t border-slate-800">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-3">Tout ce qu'il te faut</h2>
          <p className="text-slate-500 text-sm md:text-base text-center mb-10">Une plateforme complète pour générer et partager tes cartes virtuelles</p>

          <div className="grid sm:grid-cols-3 gap-4 md:gap-6">
            {[
              { icon: '🔒', title: 'Paiement sécurisé', desc: 'Paiement par Mobile Money (MTN MoMo, Orange Money, Moov) via FedaPay.' },
              { icon: '💳', title: 'Design réaliste', desc: '8 templates exclusifs style Visa & Mastercard avec animation 3D fluide.' },
              { icon: '🔗', title: 'Partage protégé', desc: 'Génère un lien unique valide 30 jours avec mot de passe pour partager ta carte.' },
            ].map(f => (
              <div key={f.title} className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5 md:p-6 hover:border-violet-700/50 transition">
                <div className="text-3xl md:text-4xl mb-3">{f.icon}</div>
                <h3 className="font-semibold text-base md:text-lg mb-2">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────────── */}
      <section className="py-16 md:py-20 border-t border-slate-800">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-3">Tarifs</h2>
          <p className="text-slate-500 text-center text-sm mb-10">Un paiement unique par carte générée</p>

          <div className="grid sm:grid-cols-3 gap-4 md:gap-6 max-w-3xl mx-auto">
            {[
              { name: 'Basique', price: '5 200', desc: '3 templates disponibles', color: 'border-slate-700', badge: '' },
              { name: 'Premium', price: '6 200', desc: '3 templates exclusifs', color: 'border-yellow-700/60', badge: 'Populaire' },
              { name: 'VIP', price: '7 200', desc: '2 templates ultra-premium', color: 'border-purple-700/60', badge: 'Elite' },
            ].map(p => (
              <div key={p.name} className={`bg-slate-800/50 border-2 ${p.color} rounded-2xl p-5 md:p-6 text-center relative`}>
                {p.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-violet-600 text-white text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap">
                    {p.badge}
                  </div>
                )}
                <h3 className="font-bold text-lg md:text-xl mb-2">{p.name}</h3>
                <div className="text-2xl md:text-3xl font-bold mb-1">{p.price} <span className="text-base md:text-lg font-normal text-slate-400">FCFA</span></div>
                <p className="text-slate-500 text-sm mb-4">{p.desc}</p>
                <Link to="/templates" className="block bg-violet-600/20 hover:bg-violet-600/30 border border-violet-600/40 text-violet-300 text-sm font-medium py-2 rounded-lg transition">
                  Choisir
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="py-16 md:py-20 border-t border-slate-800">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Prêt à créer ta carte ?</h2>
          <p className="text-slate-400 text-sm md:text-base mb-8">Inscris-toi gratuitement et choisis ton design en quelques clics.</p>
          <Link to="/signup" className="inline-block bg-violet-600 hover:bg-violet-500 active:bg-violet-700 text-white font-semibold px-8 md:px-10 py-4 rounded-xl transition">
            Commencer maintenant
          </Link>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="border-t border-slate-800 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-slate-600 text-xs leading-relaxed">
            ⚠️ Cartes virtuelles à but décoratif et démonstratif uniquement.<br className="sm:hidden" /> Aucune transaction bancaire réelle n'est associée.
          </p>
          <p className="text-slate-700 text-xs mt-2">© 2026 CardGen — Projet scolaire</p>
        </div>
      </footer>
    </div>
  )
}
