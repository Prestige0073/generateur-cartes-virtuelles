import { useState, useEffect } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { TEMPLATES, TIERS } from '../data/templates'

export default function Payment() {
  const { tier } = useParams()
  const [searchParams] = useSearchParams()
  const templateId = searchParams.get('templateId')
  const { user } = useAuth()
  const navigate = useNavigate()

  const [phone, setPhone] = useState('')
  const [provider, setProvider] = useState('mtn')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState('form') // form | processing | success

  const template = TEMPLATES.find(t => t.id === templateId)
  const tierInfo = TIERS[tier]

  useEffect(() => {
    if (!template || !tierInfo) navigate('/templates')
  }, [template, tierInfo, navigate])

  async function handleSimulatedPayment() {
    if (!phone.trim()) return

    setLoading(true)
    setStep('processing')

    // Simulation d'un délai de traitement Mobile Money
    await new Promise(res => setTimeout(res, 2500))

    const { data, error } = await supabase.from('payments').insert({
      user_id: user.id,
      amount: tierInfo.price,
      tier,
      payment_provider: provider,
      transaction_id: `SIM-${Date.now()}`,
      status: 'success',
    }).select().single()

    setLoading(false)

    if (error || !data) {
      setStep('form')
      return
    }

    setStep('success')
    setTimeout(() => {
      navigate(`/create-card?templateId=${templateId}&paymentId=${data.id}`)
    }, 1500)
  }

  if (!template || !tierInfo) return null

  // ── Écran de traitement ───────────────────────────────────
  if (step === 'processing') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-14 h-14 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
          <h2 className="text-xl font-bold mb-2">Traitement en cours…</h2>
          <p className="text-slate-400 text-sm">Vérification du paiement Mobile Money</p>
        </div>
      </div>
    )
  }

  // ── Écran de succès ───────────────────────────────────────
  if (step === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-xl font-bold mb-2">Paiement confirmé !</h2>
          <p className="text-slate-400 text-sm">Redirection vers la création de ta carte…</p>
        </div>
      </div>
    )
  }

  // ── Formulaire ────────────────────────────────────────────
  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-2">Paiement</h1>
        <p className="text-slate-400 text-sm">Finalise ton achat par Mobile Money</p>
      </div>

      {/* Bannière mode simulation */}
      <div className="bg-yellow-900/20 border border-yellow-700/40 rounded-xl px-4 py-3 mb-6 flex items-start gap-3">
        <span className="text-yellow-400 text-lg mt-0.5">⚙️</span>
        <div>
          <p className="text-yellow-300 text-sm font-medium">Mode simulation activé</p>
          <p className="text-yellow-600 text-xs mt-0.5">L'intégration FedaPay sera branchée ultérieurement. Tout paiement est automatiquement validé.</p>
        </div>
      </div>

      {/* Récapitulatif */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 mb-6">
        <h2 className="font-semibold mb-4 text-slate-300">Récapitulatif</h2>
        <div className="flex justify-between items-center mb-3">
          <span className="text-slate-400 text-sm">Template</span>
          <span className="font-medium text-sm">{template.name}</span>
        </div>
        <div className="flex justify-between items-center mb-3">
          <span className="text-slate-400 text-sm">Niveau</span>
          <span className={`text-sm font-semibold ${tierInfo.color}`}>{tierInfo.label}</span>
        </div>
        <div className="border-t border-slate-700 pt-3 flex justify-between items-center">
          <span className="font-semibold">Total</span>
          <span className="text-xl font-bold text-violet-400">
            {tierInfo.price.toLocaleString('fr-FR')} FCFA
          </span>
        </div>
      </div>

      {/* Formulaire de paiement */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
        <h2 className="font-semibold mb-5 text-slate-300">Informations de paiement</h2>

        {/* Opérateur */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-slate-300 mb-2">Opérateur Mobile Money</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'mtn',    label: 'MTN MoMo' },
              { id: 'moov',   label: 'Moov Money' },
              { id: 'orange', label: 'Orange Money' },
            ].map(p => (
              <button
                key={p.id}
                type="button"
                onClick={() => setProvider(p.id)}
                className={`py-2.5 px-3 rounded-xl border text-sm font-medium transition ${
                  provider === p.id
                    ? 'border-violet-500 bg-violet-900/30 text-white'
                    : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Numéro de téléphone */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Numéro de téléphone</label>
          <input
            type="tel"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            className="input-field"
            placeholder="229 97 00 00 00"
          />
          <p className="text-slate-600 text-xs mt-1.5">Format international recommandé</p>
        </div>

        <button
          onClick={handleSimulatedPayment}
          disabled={loading || !phone.trim()}
          className="btn-primary"
        >
          Simuler le paiement de {tierInfo.price.toLocaleString('fr-FR')} FCFA
        </button>

        <p className="text-center text-slate-600 text-xs mt-4">
          🔒 Paiement sécurisé — FedaPay (bientôt actif)
        </p>
      </div>

      <p className="text-center text-slate-700 text-xs mt-6">
        ⚠️ Carte à but décoratif uniquement — aucune transaction bancaire réelle
      </p>
    </div>
  )
}
