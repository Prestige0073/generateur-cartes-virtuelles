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
  const [error, setError] = useState('')

  const template = TEMPLATES.find(t => t.id === templateId)
  const tierInfo = TIERS[tier]

  useEffect(() => {
    if (!template || !tierInfo) navigate('/templates')
  }, [template, tierInfo, navigate])

  useEffect(() => {
    // Load FedaPay script
    const script = document.createElement('script')
    script.src = 'https://cdn.fedapay.com/checkout.js?v=1.1.7'
    script.async = true
    document.head.appendChild(script)
    return () => { document.head.removeChild(script) }
  }, [])

  async function savePaymentRecord(transactionId, status) {
    const { data, error: err } = await supabase.from('payments').insert({
      user_id: user.id,
      amount: tierInfo.price,
      tier,
      payment_provider: 'fedapay',
      transaction_id: transactionId,
      status,
    }).select().single()
    return { data, error: err }
  }

  function launchFedaPay() {
    if (!window.FedaPay) {
      setError('Le module de paiement n\'est pas encore chargé. Réessaie dans un instant.')
      return
    }
    if (!phone.trim()) {
      setError('Saisis ton numéro de téléphone.')
      return
    }
    setError('')

    window.FedaPay.init({
      public_key: import.meta.env.VITE_FEDAPAY_PUBLIC_KEY,
      transaction: {
        amount: tierInfo.price,
        description: `CardGen — Carte Virtuelle ${tierInfo.label}`,
      },
      customer: {
        email: user.email,
        phone_number: {
          number: phone,
          country: 'bj',
        },
      },
      onComplete: async function(transaction) {
        if (transaction.reason === window.FedaPay.TRANSACTION_APPROVED) {
          const { data, error: err } = await savePaymentRecord(transaction.id, 'success')
          if (!err && data) {
            navigate(`/create-card?templateId=${templateId}&paymentId=${data.id}`)
          }
        } else {
          await savePaymentRecord(transaction.id, 'failed')
          setError('Le paiement a échoué. Réessaie.')
        }
      },
      onCancel: function() {
        setError('Paiement annulé.')
      },
    }).open()
  }

  if (!template || !tierInfo) return null

  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-2">Paiement</h1>
        <p className="text-slate-400 text-sm">Finalise ton achat par Mobile Money</p>
      </div>

      {/* Order summary */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 mb-6">
        <h2 className="font-semibold mb-4 text-slate-300">Récapitulatif</h2>
        <div className="flex justify-between items-center mb-3">
          <span className="text-slate-400 text-sm">Template</span>
          <span className="font-medium text-sm">{template.name}</span>
        </div>
        <div className="flex justify-between items-center mb-3">
          <span className="text-slate-400 text-sm">Niveau</span>
          <span className={`text-sm font-semibold ${TIERS[tier].color}`}>{tierInfo.label}</span>
        </div>
        <div className="border-t border-slate-700 pt-3 flex justify-between items-center">
          <span className="font-semibold">Total</span>
          <span className="text-xl font-bold text-violet-400">
            {tierInfo.price.toLocaleString('fr-FR')} FCFA
          </span>
        </div>
      </div>

      {/* Payment form */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
        <h2 className="font-semibold mb-5 text-slate-300">Informations de paiement</h2>

        {error && (
          <div className="bg-red-900/30 border border-red-700/50 text-red-300 text-sm rounded-xl px-4 py-3 mb-4">
            {error}
          </div>
        )}

        {/* Provider selection */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-slate-300 mb-2">Opérateur Mobile Money</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'mtn', label: 'MTN MoMo', color: 'text-yellow-400' },
              { id: 'moov', label: 'Moov Money', color: 'text-blue-400' },
              { id: 'orange', label: 'Orange Money', color: 'text-orange-400' },
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
          onClick={launchFedaPay}
          disabled={loading}
          className="btn-primary"
        >
          {loading ? 'Traitement...' : `Payer ${tierInfo.price.toLocaleString('fr-FR')} FCFA`}
        </button>

        <p className="text-center text-slate-600 text-xs mt-4">
          🔒 Paiement sécurisé via FedaPay
        </p>
      </div>

      <p className="text-center text-slate-700 text-xs mt-6">
        ⚠️ Carte à but décoratif uniquement — aucune transaction bancaire réelle
      </p>
    </div>
  )
}
