import { useState, useEffect } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { TEMPLATES, TIERS } from '../data/templates'
import Loading from '../components/Loading'
import { ShieldCheck, CheckCircle2, AlertTriangle, CreditCard } from 'lucide-react'

const LEEKPAY_SCRIPT = 'https://leekpay.fr/js/leekpay.js'
const LEEKPAY_PUBLIC_KEY = import.meta.env.VITE_LEEKPAY_PUBLIC_KEY

export default function Payment() {
  const { tier } = useParams()
  const [searchParams] = useSearchParams()
  const templateId = searchParams.get('templateId')
  const { user } = useAuth()
  const navigate = useNavigate()

  const [phone, setPhone] = useState('')
  const [provider, setProvider] = useState('mtn')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState('form')
  const [error, setError] = useState('')
  const [leekPayLoaded, setLeekPayLoaded] = useState(false)

  const template = TEMPLATES.find(t => t.id === templateId)
  const tierInfo = TIERS[tier]

  useEffect(() => {
    if (!template || !tierInfo) navigate('/templates')
  }, [template, tierInfo, navigate])

  useEffect(() => {
    if (window.LeekPay) {
      setLeekPayLoaded(true)
      return
    }

    const script = document.createElement('script')
    script.src = LEEKPAY_SCRIPT
    script.async = true
    script.onload = () => setLeekPayLoaded(true)
    script.onerror = () => setError('Impossible de charger LeekPay. Vérifie ta connexion.')
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  async function handleLeekPayPayment() {
    setError('')
    if (!phone.trim()) {
      setError('Merci de renseigner ton numéro de téléphone.')
      return
    }
    if (!LEEKPAY_PUBLIC_KEY) {
      setError('Clé publique LeekPay manquante. Configure VITE_LEEKPAY_PUBLIC_KEY.')
      return
    }
    if (!leekPayLoaded || !window.LeekPay) {
      setError('Le widget de paiement LeekPay n\'est pas disponible pour le moment.')
      return
    }

    setLoading(true)
    setError('')

    try {
      window.LeekPay.checkout({
        amount: tierInfo.price,
        currency: 'XOF',
        apiKey: LEEKPAY_PUBLIC_KEY,
        phone: phone.trim(),
        provider: provider,
        callback: async (response) => {
          const success = response && (
            response.status === 'approved' ||
            response.status === 'success' ||
            response.approved === true
          )

          if (!success) {
            setError('Le paiement a échoué ou a été annulé. Vérifie ton solde et réessaie.')
            setLoading(false)
            return
          }

          setStep('processing')

          const { data: paymentData, error: payErr } = await supabase
            .from('payments')
            .insert({
              user_id: user.id,
              tier,
              amount: tierInfo.price,
              payment_provider: provider,
              status: 'success',
            })
            .select()
            .single()

          if (payErr || !paymentData) {
            setError('Paiement reçu mais erreur d\'enregistrement. Contacte le support.')
            setStep('form')
            setLoading(false)
            return
          }

          setStep('success')
          setTimeout(() => {
            navigate(`/create-card?templateId=${templateId}&paymentId=${paymentData.id}`)
          }, 1500)
        },
        onClose: () => {
          setLoading(false)
        },
      })
    } catch (err) {
      setError('Erreur lors de l\'ouverture du paiement LeekPay.')
      setLoading(false)
    }
  }

  if (!template || !tierInfo) return null

  if (step === 'processing') {
    return <Loading message="Vérification du paiement Mobile Money..." />
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <CheckCircle2 className="mx-auto h-14 w-14 text-sky-400 mb-6" />
          <h2 className="text-xl font-bold mb-2">Paiement confirmé !</h2>
          <p className="text-slate-400 text-sm">Redirection vers la création de ta carte…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-2">Paiement</h1>
        <p className="text-slate-400 text-sm">Finalise ton achat par Mobile Money</p>
      </div>

      <div className="bg-sky-900/20 border border-sky-700/40 rounded-xl px-4 py-3 mb-6 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-sky-300 mt-0.5" />
        <div>
          <p className="text-sky-300 text-sm font-medium">Paiement LeekPay</p>
          <p className="text-slate-400 text-xs mt-0.5">Le widget LeekPay s'ouvre pour finaliser le paiement sécurisé.</p>
        </div>
      </div>

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
          <span className="text-xl font-bold text-sky-400">{tierInfo.price.toLocaleString('fr-FR')} FCFA</span>
        </div>
      </div>

      <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
        <h2 className="font-semibold mb-5 text-slate-300">Informations de paiement</h2>

        <div className="mb-5">
          <label className="block text-sm font-medium text-slate-300 mb-2">Opérateur Mobile Money</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'mtn', label: 'MTN MoMo' },
              { id: 'moov', label: 'Moov Money' },
              { id: 'orange', label: 'Orange Money' },
            ].map(p => (
              <button
                key={p.id}
                type="button"
                onClick={() => setProvider(p.id)}
                className={`py-2.5 px-3 rounded-xl border text-sm font-medium transition ${
                  provider === p.id
                    ? 'border-sky-400 bg-sky-900/30 text-white'
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

        {error && (
          <div className="bg-red-900/30 border border-red-700/50 text-red-300 text-sm rounded-xl px-4 py-3 mb-4">
            {error}
          </div>
        )}

        <button
          onClick={handleLeekPayPayment}
          disabled={loading || !phone.trim()}
          className="btn-primary"
        >
          {loading ? 'Ouverture de LeekPay...' : `Payer ${tierInfo.price.toLocaleString('fr-FR')} FCFA`}
        </button>

        <p className="text-center text-slate-600 text-xs mt-4">
          <ShieldCheck className="inline h-4 w-4 align-text-bottom mr-1" />
          Paiement sécurisé — LeekPay
        </p>
      </div>

      <p className="text-center text-slate-700 text-xs mt-6">
        <AlertTriangle className="inline h-4 w-4 align-text-bottom mr-1" />
        Carte à but décoratif uniquement — aucune transaction bancaire réelle
      </p>
    </div>
  )
}
