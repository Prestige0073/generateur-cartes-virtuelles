import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { TEMPLATES, TIERS } from '../data/templates'
import Card3D from '../components/Card3D'

async function sha256(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str))
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

function generatePassword(len = 10) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  return Array.from(crypto.getRandomValues(new Uint8Array(len)))
    .map(b => chars[b % chars.length]).join('')
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
  const [copied, setCopied] = useState(false)
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

      if (link) setShareLink(link)
    }
    fetchCard()
  }, [id, user.id, navigate])

  async function generateShareLink() {
    setLoadingShare(true)
    setError('')
    const rawPassword = generatePassword()
    const hash = await sha256(rawPassword)
    const slug = crypto.randomUUID()
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

    const { data, error: err } = await supabase.from('share_links').insert({
      card_id: id,
      slug,
      password_hash: hash,
      expires_at: expiresAt,
    }).select().single()

    setLoadingShare(false)
    if (err) { setError('Erreur lors de la génération du lien.'); return }
    setShareLink(data)
    setGeneratedPassword(rawPassword)
  }

  function copyToClipboard(text) {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loadingCard) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const template = TEMPLATES.find(t => t.id === card.template_id) || TEMPLATES[0]
  const tier = TIERS[card.tier]
  const appUrl = import.meta.env.VITE_APP_URL || window.location.origin
  const shareUrl = shareLink ? `${appUrl}/share/${shareLink.slug}` : ''
  const daysLeft = shareLink
    ? Math.max(0, Math.ceil((new Date(shareLink.expires_at) - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 md:py-12">
      {/* Header */}
      <div className="flex items-center gap-2 mb-8 flex-wrap">
        <button onClick={() => navigate('/dashboard')} className="text-slate-400 hover:text-white transition text-sm">
          ← Dashboard
        </button>
        <span className="text-slate-700">/</span>
        <h1 className="font-semibold">{template.name}</h1>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${tier.badge} ${tier.color}`}>
          {tier.label}
        </span>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 lg:gap-10 items-start">
        {/* Card 3D */}
        <div className="flex flex-col items-center gap-4">
          <Card3D card={card} size="md" />
          <p className="text-slate-600 text-xs text-center">
            Survoler ou cliquer pour voir le verso
          </p>

          {/* Card details */}
          <div className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl p-5 space-y-3 mt-2">
            <h3 className="font-semibold text-sm text-slate-300 mb-3">Détails de la carte</h3>
            {[
              { label: 'Titulaire', value: card.cardholder_name },
              { label: 'Numéro', value: card.card_number.replace(/(\d{4})(?=\d)/g, '$1 ') },
              { label: 'Expiration', value: card.expiry_date },
              { label: 'Réseau', value: card.network_type === 'visa' ? 'Visa' : 'Mastercard' },
              { label: 'Langue', value: card.language === 'fr' ? 'Français' : 'Anglais' },
              ...(card.display_amount ? [{ label: 'Solde esthétique', value: `${Number(card.display_amount).toLocaleString('fr-FR')} FCFA` }] : []),
              { label: 'Créée le', value: new Date(card.created_at).toLocaleDateString('fr-FR') },
            ].map(row => (
              <div key={row.label} className="flex justify-between text-sm">
                <span className="text-slate-500">{row.label}</span>
                <span className="font-medium font-mono">{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Share link panel */}
        <div className="space-y-6">
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
            <h2 className="font-bold text-lg mb-1">Partager ma carte</h2>
            <p className="text-slate-400 text-sm mb-6">
              Génère un lien protégé par mot de passe valable 30 jours.
              Les visiteurs pourront uniquement visualiser ta carte.
            </p>

            {error && (
              <div className="bg-red-900/30 border border-red-700/50 text-red-300 text-sm rounded-xl px-4 py-3 mb-4">
                {error}
              </div>
            )}

            {shareLink && !generatedPassword ? (
              /* Already has active link */
              <div className="space-y-4">
                <div className="bg-green-900/20 border border-green-700/30 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-green-400 text-sm font-medium mb-3">
                    <span>✓</span> Lien actif — encore {daysLeft} jour{daysLeft > 1 ? 's' : ''}
                  </div>
                  <div className="flex gap-2">
                    <input
                      readOnly
                      value={shareUrl}
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 truncate"
                    />
                    <button
                      onClick={() => copyToClipboard(shareUrl)}
                      className="bg-slate-700 hover:bg-slate-600 px-3 py-2 rounded-lg text-sm transition whitespace-nowrap"
                    >
                      {copied ? '✓ Copié' : 'Copier'}
                    </button>
                  </div>
                </div>
                <p className="text-slate-600 text-xs">
                  Le mot de passe n'est affiché qu'une seule fois à la génération.
                  Pour regénérer un nouveau lien avec un nouveau mot de passe, clique ci-dessous.
                </p>
                <button
                  onClick={generateShareLink}
                  disabled={loadingShare}
                  className="btn-secondary text-sm py-2.5"
                >
                  {loadingShare ? 'Génération...' : '↺ Regénérer un nouveau lien'}
                </button>
              </div>
            ) : shareLink && generatedPassword ? (
              /* Just generated */
              <div className="space-y-4">
                <div className="bg-violet-900/20 border border-violet-700/40 rounded-xl p-5 space-y-4">
                  <div className="text-violet-300 text-sm font-semibold">🎉 Lien généré avec succès !</div>

                  <div>
                    <p className="text-slate-400 text-xs mb-1">Lien de partage</p>
                    <div className="flex gap-2">
                      <input readOnly value={shareUrl} className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 truncate" />
                      <button onClick={() => copyToClipboard(shareUrl)} className="bg-slate-700 hover:bg-slate-600 px-3 py-2 rounded-lg text-sm transition whitespace-nowrap">
                        {copied ? '✓' : 'Copier'}
                      </button>
                    </div>
                  </div>

                  <div>
                    <p className="text-slate-400 text-xs mb-1">Mot de passe (affiché une seule fois)</p>
                    <div className="flex gap-2">
                      <input
                        readOnly
                        value={generatedPassword}
                        className="flex-1 bg-slate-900 border border-yellow-700/50 rounded-lg px-3 py-2 text-sm text-yellow-300 font-mono tracking-widest"
                      />
                      <button onClick={() => copyToClipboard(generatedPassword)} className="bg-slate-700 hover:bg-slate-600 px-3 py-2 rounded-lg text-sm transition whitespace-nowrap">
                        Copier
                      </button>
                    </div>
                    <p className="text-yellow-600 text-xs mt-1.5">⚠️ Sauvegarde ce mot de passe maintenant, il ne sera plus affiché.</p>
                  </div>

                  <p className="text-slate-500 text-xs">Valable 30 jours — consultations illimitées</p>
                </div>
              </div>
            ) : (
              /* No link yet */
              <button
                onClick={generateShareLink}
                disabled={loadingShare}
                className="btn-primary"
              >
                {loadingShare ? 'Génération...' : '🔗 Générer le lien de partage'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
