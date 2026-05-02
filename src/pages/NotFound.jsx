import { Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-20">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 text-slate-400">
          <Search className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-3">Page introuvable</h1>
        <p className="text-slate-500 text-sm leading-relaxed">
          Le lien demandé n'existe pas ou n'est plus valide.
          Aucune information supplémentaire ne sera affichée.
        </p>
      </div>
    </div>
  )
}
