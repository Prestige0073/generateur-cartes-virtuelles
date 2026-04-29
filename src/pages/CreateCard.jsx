import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { TEMPLATES } from '../data/templates'
import Card3D from '../components/Card3D'

function formatCardNumber(raw) {
  return raw.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ')
}

function generateRandomCardNumber() {
  return Array.from({ length: 4 }, () =>
    Math.floor(1000 + Math.random() * 9000)
  ).join('')
}

export default function CreateCard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const templateId = searchParams.get('templateId')
  const paymentId = searchParams.get('paymentId')

  const template = TEMPLATES.find(t => t.id === templateId)

  const [form, setForm] = useState({
    cardholder_name: '',
    card_number: generateRandomCardNumber(),
    expiry_date: '',
    cvv: '',
    language: 'fr',
    display_amount: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    if (!template) { navigate('/templates'); return }

    async function verifyPayment() {
      if (!paymentId) { navigate('/templates'); return }

      const { data, error: err } = await supabase
        .from('payments')
        .select('id, status, card_id, tier, user_id')
        .eq('id', paymentId)
        .eq('user_id', user.id)
        .single()

      if (err || !data) { navigate('/templates'); return }
      if (data.status !== 'success') { navigate('/templates'); return }
      // Paiement déjà utilisé pour une autre carte
      if (data.card_id) { navigate(`/card/${data.card_id}`); return }
      // Le tier du paiement doit correspondre au template choisi
      if (data.tier !== template.tier) { navigate('/templates'); return }

      setChecking(false)
    }

    verifyPayment()
  }, [template, paymentId, user.id, navigate])

  const preview = {
    ...form,
    card_number: form.card_number.replace(/\s/g, ''),
    template_id: templateId,
    network_type: template?.network || 'visa',
    display_amount: form.display_amount || null,
  }

  function set(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function handleCardNumber(e) {
    const raw = e.target.value.replace(/\s/g, '').replace(/\D/g, '')
    set('card_number', raw.slice(0, 16))
  }

  function handleExpiry(e) {
    let v = e.target.value.replace(/\D/g, '').slice(0, 4)
    if (v.length >= 3) v = v.slice(0, 2) + '/' + v.slice(2)
    set('expiry_date', v)
  }

  function validate() {
    if (!form.cardholder_name.trim()) return 'Le nom du titulaire est requis.'
    if (form.card_number.replace(/\s/g, '').length !== 16) return 'Le numéro de carte doit contenir 16 chiffres.'
    if (!/^\d{2}\/\d{2}$/.test(form.expiry_date)) return 'Date d\'expiration invalide (MM/AA).'
    if (!/^\d{3}$/.test(form.cvv)) return 'Le CVV doit contenir 3 chiffres.'
    return null
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const err = validate()
    if (err) { setError(err); return }
    setError('')
    setLoading(true)

    const cardData = {
      user_id: user.id,
      template_id: templateId,
      tier: template.tier,
      cardholder_name: form.cardholder_name.toUpperCase(),
      card_number: form.card_number.replace(/\s/g, ''),
      expiry_date: form.expiry_date,
      cvv: form.cvv,
      network_type: template.network,
      language: form.language,
      display_amount: form.display_amount ? parseFloat(form.display_amount) : null,
    }

    if (paymentId) {
      cardData.payment_id = paymentId
      await supabase.from('payments').update({ card_id: null }).eq('id', paymentId)
    }

    const { data, error: err2 } = await supabase.from('cards').insert(cardData).select().single()
    setLoading(false)

    if (err2) {
      setError(err2.message || 'Erreur lors de la création. Réessaie.')
    } else {
      if (paymentId) {
        await supabase.from('payments').update({ card_id: data.id }).eq('id', paymentId)
      }
      navigate(`/card/${data.id}`)
    }
  }

  if (!template || checking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-2xl font-bold mb-2">Personnalise ta carte</h1>
        <p className="text-slate-400 text-sm">Ces informations sont définitives — elles ne pourront plus être modifiées.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-10 items-start">
        {/* Live preview */}
        <div className="flex flex-col items-center gap-4 lg:sticky lg:top-24">
          <Card3D card={preview} size="md" />
          <p className="text-slate-600 text-xs">Aperçu en temps réel — cliquer pour retourner</p>
        </div>

        {/* Form */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-900/30 border border-red-700/50 text-red-300 text-sm rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Nom du titulaire</label>
              <input
                type="text"
                required
                value={form.cardholder_name}
                onChange={e => set('cardholder_name', e.target.value.toUpperCase())}
                className="input-field uppercase"
                placeholder="PRÉNOM NOM"
                maxLength={26}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-sm font-medium text-slate-300">Numéro de carte (16 chiffres)</label>
                <button
                  type="button"
                  onClick={() => set('card_number', generateRandomCardNumber())}
                  className="text-xs text-violet-400 hover:text-violet-300 transition"
                >
                  ↺ Regénérer
                </button>
              </div>
              <input
                type="text"
                value={formatCardNumber(form.card_number)}
                onChange={handleCardNumber}
                className="input-field font-mono tracking-widest"
                placeholder="0000 0000 0000 0000"
                maxLength={19}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Date d'expiration</label>
                <input
                  type="text"
                  value={form.expiry_date}
                  onChange={handleExpiry}
                  className="input-field"
                  placeholder="MM/AA"
                  maxLength={5}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">CVV</label>
                <input
                  type="text"
                  value={form.cvv}
                  onChange={e => set('cvv', e.target.value.replace(/\D/g, '').slice(0, 3))}
                  className="input-field"
                  placeholder="000"
                  maxLength={3}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Solde esthétique (optionnel)</label>
              <div className="relative">
                <input
                  type="number"
                  value={form.display_amount}
                  onChange={e => set('display_amount', e.target.value)}
                  className="input-field pr-16"
                  placeholder="250 000"
                  min={0}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm">FCFA</span>
              </div>
              <p className="text-slate-600 text-xs mt-1">Affiché au verso de la carte, purement décoratif.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Langue de la carte</label>
              <div className="flex gap-3">
                {[{ id: 'fr', label: '🇫🇷 Français' }, { id: 'en', label: '🇬🇧 English' }].map(l => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => set('language', l.id)}
                    className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition ${
                      form.language === l.id
                        ? 'border-violet-500 bg-violet-900/30 text-white'
                        : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Génération en cours...' : '✨ Générer ma carte'}
              </button>
              <p className="text-slate-600 text-xs text-center mt-3">
                ⚠️ Une fois créée, la carte ne peut plus être modifiée.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
