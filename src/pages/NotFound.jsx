import { Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 py-20">
      <div className="w-full max-w-md rounded-3xl border border-slate-700/80 bg-slate-900/95 p-8 text-center shadow-2xl shadow-slate-950/40">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-800 text-slate-400">
          <Search className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-bold text-slate-100 mb-3">Page introuvable</h1>
        <p className="text-slate-400 text-sm leading-relaxed">
          Le lien demandé n’existe pas ou n’est plus valide.
          Aucune information supplémentaire ne sera affichée.
        </p>
      </div>
    </div>
  )
}
