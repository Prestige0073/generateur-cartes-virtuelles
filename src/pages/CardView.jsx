import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { TEMPLATES, TIERS } from '../data/templates'
import Card3D from '../components/Card3D'
import {
  AlertTriangle,
  ArrowLeft,
  ClipboardCopy,
  Eye,
  EyeOff,
  KeyRound,
  Link2,
  Loader2,
} from 'lucide-react'

async function sha256(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str))
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

function generatePassword(len = 12) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  return Array.from(crypto.getRandomValues(new Uint8Array(len)))
    .map(b => chars[b % chars.length]).join('')
}

function generateSlug(len = 8) {
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789'
  return Array.from(crypto.getRandomValues(new Uint8Array(len)))
    .map(b => chars[b % chars.length]).join('')
}

const _rawBase = import.meta.env.VITE_SHARE_DOMAIN
  ? `https://${import.meta.env.VITE_SHARE_DOMAIN}`
  : (import.meta.env.VITE_APP_URL || window.location.origin)
const SHARE_BASE = _rawBase.replace(/\/+$/, '')

function getSavedPw(linkId) {
  try {
    const raw = localStorage.getItem(`cardgen_pw_${linkId}`)
    return raw ? JSON.parse(raw).password : null
  } catch { return null }
}

export default function CardView() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [card, setCard] = useState(null)
  const [shareLink, setShareLink] = useState(null)
  const [generatedPassword, setGeneratedPassword] = useState('')
  const [loadingCard, setLoadingCard] = useState(true)
  const [loadingShare, setLoadingShare] = useState(false)
  const [copiedId, setCopiedId] = useState(null)
  const [pwVisible, setPwVisible] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchCard() {
      const { data, error: err } = await supabase
        .from('cards')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

      if (err || !data) { navigate('/dashboard'); return }
      setCard(data)
      setLoadingCard(false)

      const { data: link } = await supabase
        .from('share_links')
        .select('*')
        .eq('card_id', id)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (link) {
        setShareLink(link)
        const saved = getSavedPw(link.id)
        if (saved) setGeneratedPassword(saved)
      }
    }
    fetchCard()
  }, [id, user.id, navigate])

  async function generateShareLink() {
    setLoadingShare(true)
    setError('')
    const rawPassword = generatePassword()
    const hash = await sha256(rawPassword)
    const slug = generateSlug()
    const expiryDays = TIERS[card.tier]?.shareExpiry || 30
    const expiresAt = new Date(Date.now() + expiryDays * 86_400_000).toISOString()

    const { data, error: err } = await supabase.from('share_links').insert({
      card_id: id,
      slug,
      password_hash: hash,
      expires_at: expiresAt,
    }).select().single()

    setLoadingShare(false)
    if (err) { setError('Erreur lors de la génération du lien.'); return }

    localStorage.setItem(`cardgen_pw_${data.id}`, JSON.stringify({
      password: rawPassword,
      savedAt: new Date().toISOString(),
    }))

    setShareLink(data)
    setGeneratedPassword(rawPassword)
    setPwVisible(false)
  }

  function copyText(text, copyId) {
    navigator.clipboard.writeText(text)
    setCopiedId(copyId)
    setTimeout(() => setCopiedId(null), 2200)
  }

  if (loadingCard) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-10 h-10 text-sky-400 animate-spin" />
      </div>
    )
  }

  const template   = TEMPLATES.find(t => t.id === card.template_id) || TEMPLATES[0]
  const tier       = TIERS[card.tier]
  const shareUrl   = shareLink ? `${SHARE_BASE}/share/${shareLink.slug}` : ''
  const daysLeft   = shareLink
    ? Math.max(0, Math.ceil((new Date(shareLink.expires_at) - Date.now()) / 86_400_000))
    : 0
  const expiryDays = tier?.shareExpiry || 30

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 md:py-12">

      {/* Header */}
      <div className="flex items-center gap-3 mb-8 flex-wrap">
        <button onClick={() => navigate('/dashboard')} className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white transition text-sm">
          <ArrowLeft className="w-4 h-4" /> Dashboard
        </button>
        <span className="text-slate-700">/</span>
        <h1 className="font-semibold">{template.name}</h1>
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${tier.badge} ${tier.color}`}>
          {tier.label}
        </span>
      </div>

      <div className="flex flex-col lg:grid lg:grid-cols-2 gap-6 lg:gap-10 items-start">

        {/* Card 3D + Détails */}
        <div className="flex flex-col items-center gap-4 w-full">
          <div className="w-full flex justify-center">
            <Card3D card={card} size="md" />
          </div>
          <p className="text-slate-600 text-xs text-center">Cliquer pour voir le verso</p>

          <div className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl p-4 md:p-5 space-y-2.5">
            <h3 className="font-semibold text-sm text-slate-300 mb-3">Détails de la carte</h3>
            {[
              { label: 'Titulaire',  value: card.cardholder_name },
              { label: 'Numéro',     value: card.card_number.replace(/(\d{4})(?=\d)/g, '$1 ') },
              { label: 'Expiration', value: card.expiry_date },
              { label: 'Réseau',     value: card.network_type === 'visa' ? 'Visa' : 'Mastercard' },
              { label: 'Langue',     value: card.language === 'fr' ? 'Français' : 'Anglais' },
              ...(card.bank_name ? [{ label: 'Banque', value: card.bank_name }] : []),
              ...(card.style_variant ? [{ label: 'Style', value: card.style_variant === 'metal' ? 'Métal' : card.style_variant === 'luxe' ? 'Luxe' : 'Standard' }] : []),
              ...(card.font_variant ? [{ label: 'Police', value: card.font_variant === 'modern' ? 'Moderne' : card.font_variant === 'rounded' ? 'Arrondi' : 'Classique' }] : []),
              ...(card.display_amount ? [{ label: 'Solde', value: `${Number(card.display_amount).toLocaleString('fr-FR')} FCFA` }] : []),
              { label: 'Créée le',   value: new Date(card.created_at).toLocaleDateString('fr-FR') },
            ].map(row => (
              <div key={row.label} className="flex justify-between items-center text-sm gap-3">
                <span className="text-slate-500 shrink-0">{row.label}</span>
                <span className="font-medium font-mono text-right truncate">{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Share panel */}
        <div className="w-full">
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-5 md:p-6">
            <h2 className="font-bold text-base md:text-lg mb-1">Partager ma carte</h2>
            <p className="text-slate-400 text-sm mb-1">Génère un lien protégé par mot de passe.</p>
            <p className="text-slate-600 text-xs mb-5 flex items-center gap-1.5">
              <Link2 className="w-3.5 h-3.5" />
              Durée : <span className={`font-medium ml-1 ${tier.color}`}>{expiryDays} jours</span>
              <span className="text-slate-700">(niveau {tier.label})</span>
            </p>

            {error && (
              <div className="bg-red-900/30 border border-red-700/50 text-red-300 text-sm rounded-xl px-4 py-3 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
              </div>
            )}

            {/* Active link (not just generated) */}
            {shareLink && !generatedPassword && (
              <div className="space-y-4">
                <div className="bg-green-900/20 border border-green-700/30 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-green-400 text-sm font-medium mb-3">
                    <Link2 className="w-4 h-4" /> Lien actif — {daysLeft} jour{daysLeft > 1 ? 's' : ''} restants
                  </div>
                  <div className="flex gap-2">
                    <input readOnly value={shareUrl}
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 truncate"
                    />
                    <button onClick={() => copyText(shareUrl, 'link')}
                      className="inline-flex items-center gap-1.5 bg-slate-700 hover:bg-slate-600 px-3 py-2 rounded-lg text-sm transition whitespace-nowrap"
                    >
                      <ClipboardCopy className="w-4 h-4" />
                      {copiedId === 'link' ? 'Copié' : 'Copier'}
                    </button>
                  </div>
                </div>
                <p className="text-slate-600 text-xs">
                  Le mot de passe a été sauvegardé dans ton dashboard lors de la génération.
                </p>
              </div>
            )}

            {/* Just generated */}
            {shareLink && generatedPassword && (
              <div className="bg-sky-900/20 border border-sky-600/40 rounded-xl p-5 space-y-4">
                <div className="text-sky-300 text-sm font-semibold flex items-center gap-2">
                  <Link2 className="w-4 h-4" /> Lien généré avec succès !
                </div>

                <div>
                  <p className="text-slate-400 text-xs mb-1.5">Lien de partage</p>
                  <div className="flex gap-2">
                    <input readOnly value={shareUrl}
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 truncate"
                    />
                    <button onClick={() => copyText(shareUrl, 'link')}
                      className="bg-slate-700 hover:bg-slate-600 px-3 py-2 rounded-lg text-sm transition whitespace-nowrap"
                    >
                      {copiedId === 'link' ? '✓' : <ClipboardCopy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <p className="text-slate-400 text-xs mb-1.5 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5" />
                    Mot de passe — sauvegardé automatiquement dans ton dashboard
                  </p>
                  <div className="flex gap-2">
                    <input
                      readOnly
                      value={pwVisible ? generatedPassword : '•'.repeat(generatedPassword.length)}
                      className="flex-1 bg-slate-900 border border-yellow-700/50 rounded-lg px-3 py-2 text-sm text-yellow-300 font-mono tracking-widest"
                    />
                    <button onClick={() => setPwVisible(v => !v)}
                      className="bg-slate-700 hover:bg-slate-600 px-3 py-2 rounded-lg text-sm transition"
                    >
                      {pwVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button onClick={() => copyText(generatedPassword, 'pw')}
                      className="bg-slate-700 hover:bg-slate-600 px-3 py-2 rounded-lg text-sm transition"
                    >
                      {copiedId === 'pw' ? '✓' : <ClipboardCopy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => copyText(`Lien : ${shareUrl}\nMot de passe : ${generatedPassword}`, 'both')}
                  className="w-full inline-flex items-center justify-center gap-2 bg-sky-600/20 hover:bg-sky-600/30 border border-sky-600/40 text-sky-300 text-sm font-medium py-2.5 rounded-xl transition"
                >
                  <ClipboardCopy className="w-4 h-4" />
                  {copiedId === 'both' ? 'Copié !' : 'Copier lien + mot de passe'}
                </button>

                <p className="text-slate-600 text-xs text-center">
                  Valable {expiryDays} jours — consultations illimitées
                </p>
              </div>
            )}

            {/* No link yet */}
            {!shareLink && (
              <button onClick={generateShareLink} disabled={loadingShare} className="btn-primary inline-flex items-center justify-center gap-2">
                {loadingShare
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Génération…</>
                  : <><Link2 className="w-4 h-4" /> Générer le lien de partage</>
                }
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
