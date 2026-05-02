import { LogOut, X } from 'lucide-react'

export default function LogoutConfirmModal({ isOpen, onConfirm, onCancel, isLoading }) {
  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] w-full max-w-sm">
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">

          {/* En-tête */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200">
            <h2 className="text-lg font-bold text-slate-900">Confirmer la déconnexion</h2>
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Corps */}
          <div className="px-6 py-6">
            <p className="text-slate-600 text-center">
              Es-tu sûr de vouloir te déconnecter ? Tu devras te reconnecter pour accéder à ton compte.
            </p>
          </div>

          {/* Boutons */}
          <div className="flex gap-3 px-6 py-5 bg-slate-50 border-t border-slate-200">
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Annuler
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold transition inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <LogOut className="w-4 h-4" />
              )}
              {isLoading ? 'Déconnexion...' : 'Déconnecter'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
