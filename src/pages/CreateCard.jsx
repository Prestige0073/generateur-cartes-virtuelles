import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { TEMPLATES, TIERS } from '../data/templates'
import Card3D from '../components/Card3D'
import Loading from '../components/Loading'
import { RefreshCcw, Sparkles, AlertTriangle } from 'lucide-react'

const STYLE_OPTIONS = [
  { id: 'standard', label: 'Standard' },
  { id: 'metal', label: 'Métal' },
  { id: 'luxe', label: 'Luxe' },
]

const FONT_OPTIONS = [
  { id: 'classic', label: 'Classique' },
  { id: 'modern', label: 'Moderne' },
  { id: 'rounded', label: 'Arrondi' },
]

const CURRENCY_OPTIONS = [
  { id: 'EUR', label: 'EUR - Euro', symbol: '€' },
  { id: 'USD', label: 'USD - Dollar Américain', symbol: '$' },
  { id: 'GBP', label: 'GBP - Livre Sterling', symbol: '£' },
  { id: 'CHF', label: 'CHF - Franc Suisse', symbol: 'CHF' },
  { id: 'CAD', label: 'CAD - Dollar Canadien', symbol: 'C$' },
  { id: 'AUD', label: 'AUD - Dollar Australien', symbol: 'A$' },
  { id: 'NZD', label: 'NZD - Dollar Néo-Zélandais', symbol: 'NZ$' },
  { id: 'NOK', label: 'NOK - Couronne Norvégienne', symbol: 'kr' },
  { id: 'SEK', label: 'SEK - Couronne Suédoise', symbol: 'kr' },
  { id: 'DKK', label: 'DKK - Couronne Danoise', symbol: 'kr' },
  { id: 'MXN', label: 'MXN - Peso Mexicain', symbol: '$' },
  { id: 'BRL', label: 'BRL - Real Brésilien', symbol: 'R$' },
  { id: 'JPY', label: 'JPY - Yen Japonais', symbol: '¥' },
  { id: 'CNY', label: 'CNY - Yuan Chinois', symbol: '¥' },
]

function sanitizeName(str) {
  return str
    .replace(/<[^>]*>/g, '')
    .replace(/[^A-Za-zÀ-ÖØ-öø-ÿ\s'\-\.]/g, '')
    .slice(0, 26)
}

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
    bank_name: '',
    style_variant: 'standard',
    font_variant: 'classic',
    currency: 'EUR',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [verifyError, setVerifyError] = useState('')

  useEffect(() => {
    if (!template) { navigate('/templates'); return }

    async function verifyPayment() {
      // Mode test : pas de paymentId → accès direct sans paiement
      if (!paymentId) { setChecking(false); return }

      const { data, error: err } = await supabase
        .from('payments')
        .select('id, status, card_id, tier, user_id')
        .eq('id', paymentId)
        .eq('user_id', user.id)
        .single()

      if (err) {
        setVerifyError('Impossible de vérifier ton paiement. Vérifie ta connexion ou contacte le support.')
        setChecking(false)
        return
      }
      if (!data || data.status !== 'success') { navigate('/templates'); return }
      if (data.card_id) { navigate(`/card/${data.card_id}`); return }
      if (data.tier !== template.tier) { navigate('/templates'); return }

      setChecking(false)
    }

    verifyPayment()
  }, [template, paymentId, user.id, navigate])

  const tierInfo = TIERS[template?.tier]
  const canDisplayAmount = tierInfo?.displayAmount ?? false
  const canCustomBankName = tierInfo?.customBankName ?? false
  const canPickStyle = tierInfo?.customStyle ?? false
  const canPickFont = tierInfo?.customFont ?? false

  const preview = {
    ...form,
    tier: template?.tier,
    card_number: form.card_number.replace(/\s/g, ''),
    template_id: templateId,
    network_type: template?.network || 'visa',
    display_amount: canDisplayAmount && form.display_amount ? form.display_amount : null,
    bank_name: canCustomBankName && form.bank_name ? form.bank_name : null,
    style_variant: canPickStyle ? form.style_variant : 'standard',
    font_variant: canPickFont ? form.font_variant : 'classic',
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
    const name = form.cardholder_name.trim()
    if (!name) return 'Le nom du titulaire est requis.'
    if (!/^[A-Za-zÀ-ÖØ-öø-ÿ\s'\-\.]{2,26}$/.test(name)) return 'Le nom ne doit contenir que des lettres et espaces.'
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
      currency: form.currency,
      display_amount: canDisplayAmount && form.display_amount ? parseFloat(form.display_amount) : null,
      bank_name: canCustomBankName && form.bank_name ? form.bank_name.toUpperCase() : null,
      style_variant: canPickStyle ? form.style_variant : null,
      font_variant: canPickFont ? form.font_variant : null,
    }

    if (paymentId) {
      cardData.payment_id = paymentId
    }

    const { data, error: err2 } = await supabase.from('cards').insert(cardData).select().single()

    if (err2 || !data) {
      setLoading(false)
      setError(err2?.message || 'Erreur lors de la création. Réessaie.')
      return
    }

    // Lier la carte au paiement (best-effort — la carte est déjà créée)
    if (paymentId) {
      await supabase.from('payments').update({ card_id: data.id }).eq('id', paymentId)
    }

    navigate(`/card/${data.id}`)
  }

  if (!template || checking) {
    return <Loading message="Vérification de votre paiement..." />
  }

  if (verifyError) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <AlertTriangle className="mx-auto h-10 w-10 text-red-400 mb-4" />
          <h2 className="text-xl font-bold mb-3">Erreur de vérification</h2>
          <p className="text-slate-600 text-sm mb-6">{verifyError}</p>
          <button onClick={() => navigate('/dashboard')} className="btn-primary">
            Retour au dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 md:py-12">
      <div className="text-center mb-8 md:mb-10">
        <h1 className="text-xl md:text-2xl font-bold mb-2">Personnalise ta carte</h1>
        <p className="text-slate-500 text-sm">Ces informations sont définitives — elles ne pourront plus être modifiées.</p>
      </div>

      <div className="flex flex-col lg:grid lg:grid-cols-2 gap-6 lg:gap-10 items-start">
        {/* Live preview */}
        <div className="w-full flex flex-col items-center gap-3 order-2 lg:order-1 lg:sticky lg:top-24">
          <Card3D card={preview} size="md" />
          <p className="text-slate-600 text-xs">Aperçu en temps réel — cliquer pour retourner</p>
        </div>

        <div className="w-full bg-white border border-slate-200 rounded-2xl p-5 md:p-6 shadow-sm order-1 lg:order-2">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">Nom du titulaire</label>
              <input
                type="text"
                required
                value={form.cardholder_name}
                onChange={e => set('cardholder_name', sanitizeName(e.target.value).toUpperCase())}
                className="input-field uppercase"
                placeholder="PRÉNOM NOM"
                maxLength={26}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-sm font-medium text-slate-600">Numéro de carte (16 chiffres)</label>
                <button
                  type="button"
                  onClick={() => set('card_number', generateRandomCardNumber())}
                  className="text-xs text-sky-600 hover:text-sky-700 transition"
                >
                  <RefreshCcw className="w-3.5 h-3.5 inline mr-1" /> Regénérer
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
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Date d'expiration</label>
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
                <label className="block text-sm font-medium text-slate-600 mb-1.5">CVV</label>
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

            {canDisplayAmount ? (
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Solde esthétique (optionnel)</label>
                <div className="relative">
                  <input
                    type="number"
                    value={form.display_amount}
                    onChange={e => set('display_amount', e.target.value)}
                    className="input-field pr-16"
                    placeholder="250 000"
                    min={0}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm">{CURRENCY_OPTIONS.find(opt => opt.id === form.currency)?.id || 'EUR'}</span>
                </div>
                <p className="text-slate-600 text-xs mt-1">Affiché au verso de la carte, purement décoratif.</p>
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 flex items-center gap-3">
                <div className="flex-1">
                  <p className="text-slate-500 text-sm font-medium">Solde esthétique</p>
                  <p className="text-slate-500 text-xs mt-0.5">Disponible à partir du niveau <span className="text-sky-500 font-medium">Premium</span></p>
                </div>
                <span className="text-xs font-bold px-2 py-1 rounded-full bg-slate-200 text-slate-500">Basique</span>
              </div>
            )}

            {canCustomBankName ? (
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Nom de la banque (optionnel)</label>
                <input
                  type="text"
                  value={form.bank_name}
                  onChange={e => set('bank_name', sanitizeName(e.target.value).toUpperCase())}
                  className="input-field uppercase"
                  placeholder="BANQUE NATIONALE"
                  maxLength={30}
                />
                <p className="text-slate-600 text-xs mt-1">Affiché en haut de la carte pour un look plus officiel.</p>
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 flex items-center gap-3">
                <div className="flex-1">
                  <p className="text-slate-500 text-sm font-medium">Nom de banque personnalisé</p>
                  <p className="text-slate-500 text-xs mt-0.5">Disponible uniquement avec le niveau <span className="text-amber-500 font-medium">VIP</span></p>
                </div>
                <span className="text-xs font-bold px-2 py-1 rounded-full bg-amber-100 text-amber-600">VIP</span>
              </div>
            )}

            <div>
              <label htmlFor="language" className="block text-sm font-medium text-slate-600 mb-1.5">Langue de la carte</label>
              <select
                id="language"
                value={form.language}
                onChange={e => set('language', e.target.value)}
                className="input-field"
              >
                <optgroup label="Principales">
                  <option value="fr">FR — Français</option>
                  <option value="en">EN — English</option>
                  <option value="es">ES — Español</option>
                  <option value="de">DE — Deutsch</option>
                </optgroup>
                <optgroup label="Européennes">
                  <option value="it">IT — Italiano</option>
                  <option value="pt">PT — Português</option>
                  <option value="nl">NL — Nederlands</option>
                  <option value="no">NO — Norsk</option>
                  <option value="sv">SV — Svenska</option>
                  <option value="pl">PL — Polski</option>
                </optgroup>
              </select>
            </div>

            <div>
              <label htmlFor="currency" className="block text-sm font-medium text-slate-600 mb-1.5">Devise pour le solde</label>
              <select
                id="currency"
                value={form.currency}
                onChange={e => set('currency', e.target.value)}
                className="input-field"
              >
                {CURRENCY_OPTIONS.map(opt => (
                  <option key={opt.id} value={opt.id}>{opt.label}</option>
                ))}
              </select>
              <p className="text-slate-600 text-xs mt-1">Affichée avec le solde esthétique au verso.</p>
            </div>

            {canPickStyle && (
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">Style de carte</label>
                <div className="grid grid-cols-3 gap-3">
                  {STYLE_OPTIONS.map(option => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => set('style_variant', option.id)}
                      className={`py-2.5 rounded-xl border text-sm font-medium transition ${
                        form.style_variant === option.id
                          ? 'border-sky-400 bg-sky-50 text-sky-700'
                          : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                <p className="text-slate-600 text-xs mt-1">Choisis une apparence élégante pour ta carte Premium/VIP.</p>
              </div>
            )}

            {canPickFont && (
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">Police du nom</label>
                <div className="grid grid-cols-3 gap-3">
                  {FONT_OPTIONS.map(option => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => set('font_variant', option.id)}
                      className={`py-2.5 rounded-xl border text-sm font-medium transition ${
                        form.font_variant === option.id
                          ? 'border-sky-400 bg-sky-50 text-sky-700'
                          : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                <p className="text-slate-600 text-xs mt-1">Donne un style unique au nom du titulaire.</p>
              </div>
            )}

            <div className="pt-2">
              <button type="submit" className="btn-primary inline-flex items-center justify-center gap-2" disabled={loading}>
                {loading ? <>Génération en cours…</> : <><Sparkles className="w-4 h-4" /> Générer ma carte</>}
              </button>
              <p className="text-slate-600 text-xs text-center mt-3">
                <AlertTriangle className="inline h-4 w-4 align-text-bottom mr-1" />
                Une fois créée, la carte ne peut plus être modifiée.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
