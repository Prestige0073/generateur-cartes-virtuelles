import { Lock } from 'lucide-react'

export default function ShareHome() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 py-20">
      <div className="w-full max-w-md rounded-3xl border border-slate-700/80 bg-slate-900/95 p-8 text-center shadow-2xl shadow-slate-950/40">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-sky-500/15 text-sky-300">
          <Lock className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-bold text-slate-100 mb-3">Accès sécurisé</h1>
        <p className="text-slate-400 text-sm leading-relaxed mb-6">
          Ce domaine est réservé au partage de cartes.
          Utilise un lien de partage complet <span className="font-mono text-slate-200">/share/...</span> et entre le mot de passe pour afficher la carte.
        </p>
        <div className="rounded-3xl border border-slate-700/80 bg-slate-950/80 p-5 text-left text-slate-400">
          <p className="text-sm font-semibold text-slate-200 mb-2">Aucune autre page n’est disponible ici.</p>
          <p className="text-xs leading-relaxed">
            Si tu es arrivé ici par erreur, demande au propriétaire de la carte le lien de partage exact.
          </p>
        </div>
      </div>
    </div>
  )
}
