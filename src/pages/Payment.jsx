import { useState, useEffect, useRef } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { TEMPLATES, TIERS } from '../data/templates'
import Loading from '../components/Loading'
import { ShieldCheck, CheckCircle2, AlertTriangle, CreditCard, Loader2, RefreshCw } from 'lucide-react'

const LEEKPAY_SCRIPT = 'https://leekpay.fr/js/leekpay.js'
const LEEKPAY_PUBLIC_KEY = import.meta.env.VITE_LEEKPAY_PUBLIC_KEY

export default function Payment() {
  const { tier } = useParams()
  const [searchParams] = useSearchParams()
  const templateId = searchParams.get('templateId')
  const { user } = useAuth()
  const navigate = useNavigate()

  const [step, setStep] = useState('loading') // loading | ready | processing | success | error
  const [error, setError] = useState('')
  const [scriptError, setScriptError] = useState(false)
  const opened = useRef(false)

  const template = TEMPLATES.find(t => t.id === templateId)
  const tierInfo = TIERS[tier]

  useEffect(() => {
    if (!template || !tierInfo) navigate('/templates')
  }, [template, tierInfo, navigate])

  // Load LeekPay script then auto-open widget
  useEffect(() => {
    if (!template || !tierInfo) return

    function openWidget() {
      if (opened.current) return
      opened.current = true
      triggerLeekPay()
    }

    // LeekPay.close() appelle config.onCancel (pas params.onCancel) — on enregistre globalement
    if (window.LeekPay) {
      window.LeekPay.configure({
        onCancel: () => { opened.current = false; setStep('ready') },
      })
    }

    if (window.LeekPay) {
      setStep('ready')
      setTimeout(openWidget, 600)
      return
    }

    const script = document.createElement('script')
    script.src = LEEKPAY_SCRIPT
    script.async = true
    script.onload = () => {
      window.LeekPay.configure({
        onCancel: () => { opened.current = false; setStep('ready') },
      })
      setStep('ready')
      setTimeout(openWidget, 600)
    }
    script.onerror = () => {
      setScriptError(true)
      setStep('error')
      setError('Impossible de charger LeekPay. Vérifie ta connexion et recharge la page.')
    }
    document.body.appendChild(script)
    return () => {
      if (document.body.contains(script)) document.body.removeChild(script)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function triggerLeekPay() {
    if (!LEEKPAY_PUBLIC_KEY) {
      setError('Clé publique LeekPay manquante. Contacte le support.')
      setStep('error')
      return
    }
    if (!window.LeekPay) {
      setError('Le widget de paiement n\'est pas disponible. Recharge la page.')
      setStep('error')
      return
    }

    setError('')
    setStep('ready')

    try {
      window.LeekPay.checkout({
        amount: tierInfo.price,
        currency: 'XOF',
        apiKey: LEEKPAY_PUBLIC_KEY,
        onSuccess: async (transaction) => {
          setStep('processing')

          const { data: paymentId, error: payErr } = await supabase.rpc('record_payment', {
            p_tier:           tier,
            p_amount:         tierInfo.price,
            p_provider:       'leekpay',
            p_transaction_id: transaction?.payment_id || transaction?.id || null,
          })

          if (payErr || !paymentId) {
            setError('Paiement reçu mais erreur d\'enregistrement. Contacte le support.')
            setStep('ready')
            return
          }

          setStep('success')
          setTimeout(() => {
            navigate(`/create-card?templateId=${templateId}&paymentId=${paymentId}`)
          }, 1500)
        },
        onError: (err) => {
          opened.current = false
          setError(err?.message || 'Le paiement a échoué. Réessaie.')
          setStep('ready')
        },
        onCancel: () => {
          opened.current = false
          setStep('ready')
        },
      })
    } catch {
      opened.current = false
      setError('Erreur lors de l\'ouverture de LeekPay. Réessaie.')
      setStep('ready')
    }
  }

  function handleRetry() {
    opened.current = false
    setError('')
    triggerLeekPay()
  }

  if (!template || !tierInfo) return null

  if (step === 'processing') {
    return <Loading message="Vérification du paiement…" />
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <CheckCircle2 className="mx-auto h-14 w-14 text-sky-400 mb-6" />
          <h2 className="text-xl font-bold mb-2">Paiement confirmé !</h2>
          <p className="text-slate-500 text-sm">Redirection vers la création de ta carte…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <CreditCard className="mx-auto h-10 w-10 text-sky-400 mb-3" />
          <h1 className="text-2xl font-bold">Finaliser l'achat</h1>
          <p className="text-slate-500 text-sm mt-1">Le widget de paiement s'ouvre automatiquement</p>
        </div>

        {/* Summary */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-4 shadow-sm">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">Récapitulatif</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-500 text-sm">Design</span>
              <span className="font-medium text-sm text-slate-800">{template.name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 text-sm">Niveau</span>
              <span className={`text-sm font-semibold ${tierInfo.color}`}>{tierInfo.label}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 text-sm">Lien de partage</span>
              <span className="text-sm text-slate-600">{tierInfo.shareExpiry} jours</span>
            </div>
            <div className="border-t border-slate-200 pt-3 flex justify-between items-center">
              <span className="font-semibold">Total</span>
              <span className="text-2xl font-bold text-sky-400">
                {tierInfo.price.toLocaleString('fr-FR')} <span className="text-base font-medium">FCFA</span>
              </span>
            </div>
          </div>
        </div>

        {/* Security badge */}
        <div className="flex items-center gap-2 bg-sky-50 border border-sky-200 rounded-xl px-4 py-2.5 mb-6">
          <ShieldCheck className="w-4 h-4 text-sky-500 shrink-0" />
          <p className="text-sky-600 text-xs">Paiement Mobile Money sécurisé via LeekPay</p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-900/30 border border-red-700/50 text-red-300 text-sm rounded-xl px-4 py-3 mb-4">
            {error}
          </div>
        )}

        {/* CTA — shown when widget is closed or errored */}
        {step === 'loading' && (
          <div className="flex flex-col items-center gap-3 py-4">
            <Loader2 className="w-7 h-7 text-sky-400 animate-spin" />
            <p className="text-slate-500 text-sm">Chargement du paiement…</p>
          </div>
        )}

        {step === 'ready' && (
          <button onClick={handleRetry} className="btn-primary flex items-center justify-center gap-2">
            {error ? (
              <><RefreshCw className="w-4 h-4" /> Réessayer le paiement</>
            ) : (
              <><CreditCard className="w-4 h-4" /> Payer {tierInfo.price.toLocaleString('fr-FR')} FCFA</>
            )}
          </button>
        )}

        {step === 'error' && scriptError && (
          <button
            onClick={() => window.location.reload()}
            className="btn-primary flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" /> Recharger la page
          </button>
        )}

        <p className="text-center text-slate-700 text-xs mt-6 flex items-center justify-center gap-1">
          <AlertTriangle className="h-3.5 w-3.5" />
          Carte à but décoratif uniquement — aucune transaction bancaire réelle
        </p>
      </div>
    </div>
  )
}
