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
    <div className="overflow-hidden">
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative min-h-[90vh] flex items-center">
        {/* Background glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl" />
        </div>

        <div className="max-w-6xl mx-auto px-4 py-20 grid md:grid-cols-2 gap-12 items-center relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 bg-violet-900/40 border border-violet-700/50 rounded-full px-4 py-1.5 mb-6">
              <span className="w-2 h-2 bg-violet-400 rounded-full animate-pulse" />
              <span className="text-violet-300 text-sm font-medium">Projet scolaire pédagogique</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
              Génère ta carte<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-purple-400">
                virtuelle
              </span>{' '}
              en 3D
            </h1>
            <p className="text-slate-400 text-lg mb-8 leading-relaxed">
              Crée une carte bancaire virtuelle au design réaliste, animée en 3D recto/verso.
              Partageable via lien protégé par mot de passe.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/signup" className="bg-violet-600 hover:bg-violet-500 text-white font-semibold px-8 py-3.5 rounded-xl transition-all duration-200 text-sm">
                Créer mon compte
              </Link>
              <Link to="/templates" className="bg-slate-800 hover:bg-slate-700 text-white font-semibold px-8 py-3.5 rounded-xl transition-all duration-200 text-sm border border-slate-700">
                Voir le catalogue
              </Link>
            </div>
          </div>

          {/* Card preview */}
          <div className="flex justify-center items-center">
            <div className="flex flex-col items-center gap-3">
              <Card3D card={DEMO_CARD} size="md" />
              <p className="text-slate-600 text-xs">Survoler ou cliquer pour retourner</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────── */}
      <section className="py-20 border-t border-slate-800">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">Tout ce qu'il te faut</h2>
          <p className="text-slate-500 text-center mb-12">Une plateforme complète pour générer et partager tes cartes virtuelles</p>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: '🔒',
                title: 'Paiement sécurisé',
                desc: 'Paiement par Mobile Money (MTN MoMo, Orange Money, Moov) via FedaPay.',
              },
              {
                icon: '💳',
                title: 'Design réaliste',
                desc: '8 templates exclusifs style Visa & Mastercard avec animation 3D fluide.',
              },
              {
                icon: '🔗',
                title: 'Partage protégé',
                desc: 'Génère un lien unique valide 30 jours avec mot de passe pour partager ta carte.',
              },
            ].map(f => (
              <div key={f.title} className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 hover:border-violet-700/50 transition">
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────────── */}
      <section className="py-20 border-t border-slate-800">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">Tarifs</h2>
          <p className="text-slate-500 text-center mb-12">Un paiement unique par carte générée</p>

          <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {[
              { name: 'Basique', price: '5 200', desc: '3 templates disponibles', color: 'border-slate-700', badge: '' },
              { name: 'Premium', price: '6 200', desc: '3 templates exclusifs', color: 'border-yellow-700/60', badge: 'Populaire' },
              { name: 'VIP', price: '7 200', desc: '2 templates ultra-premium', color: 'border-purple-700/60', badge: 'Elite' },
            ].map(p => (
              <div key={p.name} className={`bg-slate-800/50 border-2 ${p.color} rounded-2xl p-6 text-center relative`}>
                {p.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-violet-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    {p.badge}
                  </div>
                )}
                <h3 className="font-bold text-xl mb-2">{p.name}</h3>
                <div className="text-3xl font-bold mb-1">{p.price} <span className="text-lg font-normal text-slate-400">FCFA</span></div>
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
      <section className="py-20 border-t border-slate-800">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Prêt à créer ta carte ?</h2>
          <p className="text-slate-400 mb-8">Inscris-toi gratuitement et choisis ton design en quelques clics.</p>
          <Link to="/signup" className="inline-block bg-violet-600 hover:bg-violet-500 text-white font-semibold px-10 py-4 rounded-xl transition-all duration-200">
            Commencer maintenant
          </Link>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="border-t border-slate-800 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-slate-600 text-xs">
            ⚠️ Cartes virtuelles à but décoratif et démonstratif uniquement. Aucune transaction bancaire réelle n'est associée.
          </p>
          <p className="text-slate-700 text-xs mt-2">© 2026 CardGen — Projet scolaire</p>
        </div>
      </footer>
    </div>
  )
}
