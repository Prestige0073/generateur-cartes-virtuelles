import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { TEMPLATES } from '../data/templates'
import Card3D from '../components/Card3D'
import NotFound from './NotFound'
import { AlertTriangle, Loader2, Lock, ShieldCheck, Wallet, Calendar, Globe, User, CreditCard, BadgeCheck } from 'lucide-react'

async function sha256(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str))
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

export default function ShareView() {
  const { slug } = useParams()
  const [shareLink, setShareLink] = useState(null)
  const [card, setCard] = useState(null)
  const [status, setStatus] = useState('loading')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [attempts, setAttempts] = useState(0)

  useEffect(() => { document.title = 'ShareCards' }, [])

  useEffect(() => {
    async function fetchLink() {
      const { data, error: err } = await supabase
        .from('share_links')
        .select('*')
        .eq('slug', slug)
        .single()

      if (err || !data) { setStatus('invalid'); return }
      if (new Date(data.expires_at) < new Date()) { setStatus('expired'); return }
      setShareLink(data)
      setStatus('form')
    }
    fetchLink()
  }, [slug])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (attempts >= 5) {
      setStatus('locked')
      return
    }

    const hash = await sha256(password)
    if (hash !== shareLink.password_hash) {
      setAttempts(prev => {
        const next = prev + 1
        if (next >= 5) setStatus('locked')
        else setError(`Mot de passe incorrect. ${5 - next} tentative${5 - next > 1 ? 's' : ''} restante${5 - next > 1 ? 's' : ''}.`)
        return next
      })
      return
    }

    const { data: cardData, error: cardErr } = await supabase
      .from('cards')
      .select('*')
      .eq('id', shareLink.card_id)
      .single()

    if (cardErr || !cardData) { setError('Erreur lors du chargement de la carte.'); return }
    setCard(cardData)
    setStatus('unlocked')
  }

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-10 h-10 text-sky-400 animate-spin" />
      </div>
    )
  }

  if (status === 'invalid' || status === 'expired') {
    return <NotFound />
  }

  if (status === 'locked') {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm px-8 py-10 text-center max-w-sm w-full">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mb-4">
            <Lock className="w-7 h-7 text-red-400" />
          </div>
          <h2 className="text-slate-900 text-xl font-extrabold mb-2">Accès bloqué</h2>
          <p className="text-slate-500 text-sm">Trop de tentatives incorrectes. Ce lien est désormais verrouillé.</p>
        </div>
      </div>
    )
  }

  if (status === 'form') {
    return (
      <div className="min-h-screen bg-slate-100 relative flex flex-col items-center justify-center px-4 py-12 overflow-hidden">

        {/* Decorative background — z-0, behind everything */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none select-none"
          style={{ zIndex: 0 }}
          aria-hidden="true"
          viewBox="0 0 600 900"
          preserveAspectRatio="xMidYMid slice"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* row 1 */}
          <g transform="rotate(-15 45 47)" opacity="0.3"><rect x="-5" y="15" width="100" height="63" rx="9" stroke="#94a3b8" strokeWidth="1.2"/><rect x="12" y="33" width="15" height="11" rx="2" stroke="#94a3b8" strokeWidth="0.9"/><circle cx="84" cy="29" r="7" stroke="#94a3b8" strokeWidth="0.9"/><circle cx="75" cy="29" r="7" stroke="#94a3b8" strokeWidth="0.9"/><line x1="12" y1="58" x2="88" y2="58" stroke="#94a3b8" strokeWidth="0.7" strokeDasharray="5 3"/></g>
          <g transform="rotate(12 505 33)" opacity="0.28"><rect x="460" y="5" width="90" height="56" rx="8" stroke="#94a3b8" strokeWidth="1.2"/><rect x="476" y="22" width="14" height="10" rx="2" stroke="#94a3b8" strokeWidth="0.9"/><circle cx="540" cy="17" r="6" stroke="#94a3b8" strokeWidth="0.9"/><circle cx="532" cy="17" r="6" stroke="#94a3b8" strokeWidth="0.9"/></g>
          <g transform="rotate(20 363 54)" opacity="0.22"><rect x="320" y="30" width="75" height="47" rx="6" stroke="#94a3b8" strokeWidth="1.1"/><rect x="334" y="44" width="12" height="9" rx="1.5" stroke="#94a3b8" strokeWidth="0.8"/><circle cx="385" cy="41" r="5.5" stroke="#94a3b8" strokeWidth="0.8"/><circle cx="378" cy="41" r="5.5" stroke="#94a3b8" strokeWidth="0.8"/></g>
          {/* row 2 */}
          <g transform="rotate(8 25 205)" opacity="0.26"><rect x="-15" y="180" width="80" height="50" rx="7" stroke="#94a3b8" strokeWidth="1.2"/><rect x="2" y="196" width="13" height="9" rx="1.5" stroke="#94a3b8" strokeWidth="0.9"/><circle cx="54" cy="192" r="5.5" stroke="#94a3b8" strokeWidth="0.9"/><circle cx="47" cy="192" r="5.5" stroke="#94a3b8" strokeWidth="0.9"/></g>
          <g transform="rotate(-22 553 194)" opacity="0.24"><rect x="515" y="170" width="75" height="47" rx="6" stroke="#94a3b8" strokeWidth="1.1"/><rect x="530" y="185" width="12" height="9" rx="1.5" stroke="#94a3b8" strokeWidth="0.8"/><circle cx="581" cy="181" r="5.5" stroke="#94a3b8" strokeWidth="0.8"/><circle cx="574" cy="181" r="5.5" stroke="#94a3b8" strokeWidth="0.8"/></g>
          <g transform="rotate(-30 275 102)" opacity="0.2"><rect x="240" y="80" width="70" height="44" rx="6" stroke="#94a3b8" strokeWidth="1.1"/><rect x="254" y="94" width="11" height="8" rx="1.5" stroke="#94a3b8" strokeWidth="0.8"/><circle cx="301" cy="91" r="5" stroke="#94a3b8" strokeWidth="0.8"/><circle cx="294" cy="91" r="5" stroke="#94a3b8" strokeWidth="0.8"/></g>
          {/* row 3 */}
          <g transform="rotate(5 48 364)" opacity="0.26"><rect x="10" y="340" width="75" height="47" rx="6" stroke="#94a3b8" strokeWidth="1.2"/><rect x="24" y="354" width="12" height="9" rx="1.5" stroke="#94a3b8" strokeWidth="0.9"/><circle cx="76" cy="350" r="5.5" stroke="#94a3b8" strokeWidth="0.9"/><circle cx="69" cy="350" r="5.5" stroke="#94a3b8" strokeWidth="0.9"/></g>
          <g transform="rotate(-18 535 332)" opacity="0.22"><rect x="500" y="310" width="70" height="44" rx="6" stroke="#94a3b8" strokeWidth="1.1"/><rect x="514" y="323" width="11" height="8" rx="1.5" stroke="#94a3b8" strokeWidth="0.8"/><circle cx="561" cy="320" r="5" stroke="#94a3b8" strokeWidth="0.8"/><circle cx="554" cy="320" r="5" stroke="#94a3b8" strokeWidth="0.8"/></g>
          <g transform="rotate(12 235 482)" opacity="0.2"><rect x="200" y="460" width="70" height="44" rx="6" stroke="#94a3b8" strokeWidth="1.1"/><rect x="214" y="473" width="11" height="8" rx="1.5" stroke="#94a3b8" strokeWidth="0.8"/><circle cx="261" cy="470" r="5" stroke="#94a3b8" strokeWidth="0.8"/><circle cx="254" cy="470" r="5" stroke="#94a3b8" strokeWidth="0.8"/></g>
          {/* row 4 */}
          <g transform="rotate(22 33 507)" opacity="0.28"><rect x="-10" y="480" width="85" height="53" rx="7" stroke="#94a3b8" strokeWidth="1.2"/><rect x="7" y="497" width="13" height="10" rx="1.5" stroke="#94a3b8" strokeWidth="0.9"/><circle cx="67" cy="493" r="6" stroke="#94a3b8" strokeWidth="0.9"/><circle cx="59" cy="493" r="6" stroke="#94a3b8" strokeWidth="0.9"/></g>
          <g transform="rotate(-12 530 475)" opacity="0.24"><rect x="490" y="450" width="80" height="50" rx="7" stroke="#94a3b8" strokeWidth="1.2"/><rect x="506" y="465" width="13" height="9" rx="1.5" stroke="#94a3b8" strokeWidth="0.9"/><circle cx="561" cy="461" r="6" stroke="#94a3b8" strokeWidth="0.9"/><circle cx="553" cy="461" r="6" stroke="#94a3b8" strokeWidth="0.9"/></g>
          <g transform="rotate(-20 343 601)" opacity="0.2"><rect x="310" y="580" width="65" height="41" rx="5" stroke="#94a3b8" strokeWidth="1.1"/><rect x="322" y="592" width="10" height="7" rx="1.5" stroke="#94a3b8" strokeWidth="0.8"/><circle cx="367" cy="589" r="4.5" stroke="#94a3b8" strokeWidth="0.8"/><circle cx="361" cy="589" r="4.5" stroke="#94a3b8" strokeWidth="0.8"/></g>
          {/* row 5 */}
          <g transform="rotate(15 40 648)" opacity="0.28"><rect x="-5" y="620" width="90" height="56" rx="8" stroke="#94a3b8" strokeWidth="1.2"/><rect x="12" y="636" width="14" height="10" rx="2" stroke="#94a3b8" strokeWidth="0.9"/><circle cx="76" cy="632" r="6" stroke="#94a3b8" strokeWidth="0.9"/><circle cx="68" cy="632" r="6" stroke="#94a3b8" strokeWidth="0.9"/><line x1="12" y1="662" x2="79" y2="662" stroke="#94a3b8" strokeWidth="0.7" strokeDasharray="5 3"/></g>
          <g transform="rotate(-8 520 655)" opacity="0.24"><rect x="480" y="630" width="80" height="50" rx="7" stroke="#94a3b8" strokeWidth="1.2"/><rect x="496" y="645" width="13" height="9" rx="1.5" stroke="#94a3b8" strokeWidth="0.9"/><circle cx="551" cy="641" r="6" stroke="#94a3b8" strokeWidth="0.9"/><circle cx="543" cy="641" r="6" stroke="#94a3b8" strokeWidth="0.9"/></g>
          <g transform="rotate(12 238 744)" opacity="0.22"><rect x="200" y="720" width="75" height="47" rx="6" stroke="#94a3b8" strokeWidth="1.1"/><rect x="214" y="734" width="12" height="9" rx="1.5" stroke="#94a3b8" strokeWidth="0.8"/><circle cx="266" cy="730" r="5.5" stroke="#94a3b8" strokeWidth="0.8"/><circle cx="259" cy="730" r="5.5" stroke="#94a3b8" strokeWidth="0.8"/></g>
          <g transform="rotate(-15 135 752)" opacity="0.2"><rect x="100" y="730" width="70" height="44" rx="6" stroke="#94a3b8" strokeWidth="1.1"/><rect x="114" y="743" width="11" height="8" rx="1.5" stroke="#94a3b8" strokeWidth="0.8"/><circle cx="161" cy="740" r="5" stroke="#94a3b8" strokeWidth="0.8"/><circle cx="154" cy="740" r="5" stroke="#94a3b8" strokeWidth="0.8"/></g>
          {/* dots */}
          <circle cx="185" cy="110" r="2.5" fill="#94a3b8" opacity="0.3"/><circle cx="395" cy="65" r="1.8" fill="#94a3b8" opacity="0.25"/><circle cx="450" cy="250" r="2.2" fill="#94a3b8" opacity="0.28"/><circle cx="140" cy="290" r="1.8" fill="#94a3b8" opacity="0.25"/><circle cx="370" cy="310" r="2" fill="#94a3b8" opacity="0.22"/><circle cx="270" cy="390" r="1.5" fill="#94a3b8" opacity="0.2"/><circle cx="510" cy="390" r="2" fill="#94a3b8" opacity="0.25"/><circle cx="80" cy="420" r="1.8" fill="#94a3b8" opacity="0.22"/><circle cx="430" cy="560" r="2.2" fill="#94a3b8" opacity="0.25"/><circle cx="160" cy="560" r="1.8" fill="#94a3b8" opacity="0.22"/><circle cx="290" cy="530" r="1.5" fill="#94a3b8" opacity="0.2"/><circle cx="350" cy="680" r="2" fill="#94a3b8" opacity="0.25"/><circle cx="120" cy="800" r="2.5" fill="#94a3b8" opacity="0.28"/><circle cx="450" cy="810" r="1.8" fill="#94a3b8" opacity="0.22"/><circle cx="290" cy="850" r="1.5" fill="#94a3b8" opacity="0.2"/><circle cx="560" cy="550" r="2" fill="#94a3b8" opacity="0.22"/><circle cx="50" cy="140" r="1.8" fill="#94a3b8" opacity="0.25"/><circle cx="575" cy="90" r="1.5" fill="#94a3b8" opacity="0.2"/>
        </svg>

        {/* Content — z-10, always above SVG */}
        <div className="relative flex flex-col items-center w-full max-w-sm" style={{ zIndex: 10 }}>

        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-full px-4 py-1.5 mb-6">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span className="text-emerald-700 text-xs font-semibold tracking-wide">Lien sécurisé & vérifié</span>
        </div>

        {/* Card */}
        <div className="w-full max-w-sm bg-white border border-slate-300 rounded-2xl shadow-md overflow-hidden">

          {/* Header */}
          <div className="px-6 pt-7 pb-5 border-b border-slate-200 text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center mb-4">
              <Lock className="w-7 h-7 text-sky-600" />
            </div>
            <h1 className="text-slate-900 text-xl font-extrabold mb-1">Carte partagée</h1>
            <p className="text-slate-600 text-sm">Entre le mot de passe pour accéder à la carte bancaire.</p>
          </div>

          {/* Form */}
          <div className="px-6 py-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-2">Mot de passe</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-white border-2 border-slate-300 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 text-sm font-medium focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition"
                  placeholder="••••••••••"
                  autoFocus
                />
              </div>
              <button
                type="submit"
                className="w-full bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white font-bold text-sm py-3 rounded-xl transition flex items-center justify-center gap-2 shadow-sm"
              >
                <ShieldCheck className="w-4 h-4" />
                Voir la carte
              </button>
            </form>
          </div>

          {/* Footer */}
          <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-slate-500 text-xs font-medium">Consultation sécurisée</span>
          </div>
        </div>
        </div>{/* end z-10 wrapper */}
      </div>
    )
  }

  const rows = [
    { label: 'Titulaire',  value: card.cardholder_name,                                Icon: User,       mono: false, color: 'bg-violet-100 text-violet-600'  },
    { label: 'Numéro',     value: card.card_number.replace(/(\d{4})(?=\d)/g, '$1 '),   Icon: CreditCard, mono: true,  color: 'bg-sky-100 text-sky-600'        },
    { label: 'Expiration', value: card.expiry_date,                                     Icon: Calendar,   mono: true,  color: 'bg-amber-100 text-amber-600'    },
    { label: 'Réseau',     value: card.network_type === 'visa' ? 'Visa' : 'Mastercard', Icon: CreditCard, mono: false, color: 'bg-emerald-100 text-emerald-600' },
    { label: 'Langue',     value: { 'fr': 'Français', 'en': 'English', 'es': 'Español', 'de': 'Deutsch', 'it': 'Italiano', 'pt': 'Português', 'nl': 'Nederlands', 'no': 'Norsk', 'sv': 'Svenska', 'pl': 'Polski' }[card.language] || card.language, Icon: Globe, mono: false, color: 'bg-indigo-100 text-indigo-600'  },
  ]

  return (
    <div className="min-h-screen bg-slate-100 relative flex flex-col items-center px-4 pb-16 overflow-hidden">

      {/* Decorative background */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none select-none"
        style={{ zIndex: 0 }}
        aria-hidden="true"
        viewBox="0 0 600 1200"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g transform="rotate(-15 45 47)" opacity="0.28"><rect x="-5" y="15" width="100" height="63" rx="9" stroke="#94a3b8" strokeWidth="1.2"/><rect x="12" y="33" width="15" height="11" rx="2" stroke="#94a3b8" strokeWidth="0.9"/><circle cx="84" cy="29" r="7" stroke="#94a3b8" strokeWidth="0.9"/><circle cx="75" cy="29" r="7" stroke="#94a3b8" strokeWidth="0.9"/></g>
        <g transform="rotate(12 505 33)" opacity="0.25"><rect x="460" y="5" width="90" height="56" rx="8" stroke="#94a3b8" strokeWidth="1.2"/><rect x="476" y="22" width="14" height="10" rx="2" stroke="#94a3b8" strokeWidth="0.9"/><circle cx="540" cy="17" r="6" stroke="#94a3b8" strokeWidth="0.9"/><circle cx="532" cy="17" r="6" stroke="#94a3b8" strokeWidth="0.9"/></g>
        <g transform="rotate(8 25 205)" opacity="0.22"><rect x="-15" y="180" width="80" height="50" rx="7" stroke="#94a3b8" strokeWidth="1.1"/><rect x="2" y="196" width="13" height="9" rx="1.5" stroke="#94a3b8" strokeWidth="0.9"/><circle cx="54" cy="192" r="5.5" stroke="#94a3b8" strokeWidth="0.9"/><circle cx="47" cy="192" r="5.5" stroke="#94a3b8" strokeWidth="0.9"/></g>
        <g transform="rotate(-22 553 194)" opacity="0.22"><rect x="515" y="170" width="75" height="47" rx="6" stroke="#94a3b8" strokeWidth="1.1"/><rect x="530" y="185" width="12" height="9" rx="1.5" stroke="#94a3b8" strokeWidth="0.8"/><circle cx="581" cy="181" r="5.5" stroke="#94a3b8" strokeWidth="0.8"/><circle cx="574" cy="181" r="5.5" stroke="#94a3b8" strokeWidth="0.8"/></g>
        <g transform="rotate(5 48 450)" opacity="0.22"><rect x="10" y="426" width="75" height="47" rx="6" stroke="#94a3b8" strokeWidth="1.1"/><rect x="24" y="440" width="12" height="9" rx="1.5" stroke="#94a3b8" strokeWidth="0.8"/><circle cx="76" cy="436" r="5.5" stroke="#94a3b8" strokeWidth="0.8"/><circle cx="69" cy="436" r="5.5" stroke="#94a3b8" strokeWidth="0.8"/></g>
        <g transform="rotate(-18 535 440)" opacity="0.2"><rect x="500" y="416" width="70" height="44" rx="6" stroke="#94a3b8" strokeWidth="1.1"/><rect x="514" y="429" width="11" height="8" rx="1.5" stroke="#94a3b8" strokeWidth="0.8"/><circle cx="561" cy="426" r="5" stroke="#94a3b8" strokeWidth="0.8"/><circle cx="554" cy="426" r="5" stroke="#94a3b8" strokeWidth="0.8"/></g>
        <g transform="rotate(22 33 700)" opacity="0.25"><rect x="-10" y="672" width="85" height="53" rx="7" stroke="#94a3b8" strokeWidth="1.2"/><rect x="7" y="688" width="13" height="10" rx="1.5" stroke="#94a3b8" strokeWidth="0.9"/><circle cx="67" cy="684" r="6" stroke="#94a3b8" strokeWidth="0.9"/><circle cx="59" cy="684" r="6" stroke="#94a3b8" strokeWidth="0.9"/></g>
        <g transform="rotate(-12 530 680)" opacity="0.22"><rect x="490" y="654" width="80" height="50" rx="7" stroke="#94a3b8" strokeWidth="1.1"/><rect x="506" y="668" width="13" height="9" rx="1.5" stroke="#94a3b8" strokeWidth="0.8"/><circle cx="561" cy="664" r="6" stroke="#94a3b8" strokeWidth="0.8"/><circle cx="553" cy="664" r="6" stroke="#94a3b8" strokeWidth="0.8"/></g>
        <g transform="rotate(15 40 920)" opacity="0.25"><rect x="-5" y="893" width="90" height="56" rx="8" stroke="#94a3b8" strokeWidth="1.2"/><rect x="12" y="909" width="14" height="10" rx="2" stroke="#94a3b8" strokeWidth="0.9"/><circle cx="76" cy="905" r="6" stroke="#94a3b8" strokeWidth="0.9"/><circle cx="68" cy="905" r="6" stroke="#94a3b8" strokeWidth="0.9"/></g>
        <g transform="rotate(-8 520 920)" opacity="0.22"><rect x="480" y="893" width="80" height="50" rx="7" stroke="#94a3b8" strokeWidth="1.1"/><rect x="496" y="907" width="13" height="9" rx="1.5" stroke="#94a3b8" strokeWidth="0.8"/><circle cx="551" cy="903" r="6" stroke="#94a3b8" strokeWidth="0.8"/><circle cx="543" cy="903" r="6" stroke="#94a3b8" strokeWidth="0.8"/></g>
        <g transform="rotate(12 238 1050)" opacity="0.2"><rect x="200" y="1026" width="75" height="47" rx="6" stroke="#94a3b8" strokeWidth="1.1"/><rect x="214" y="1040" width="12" height="9" rx="1.5" stroke="#94a3b8" strokeWidth="0.8"/><circle cx="266" cy="1036" r="5.5" stroke="#94a3b8" strokeWidth="0.8"/><circle cx="259" cy="1036" r="5.5" stroke="#94a3b8" strokeWidth="0.8"/></g>
        <g transform="rotate(-20 343 1100)" opacity="0.18"><rect x="310" y="1078" width="65" height="41" rx="5" stroke="#94a3b8" strokeWidth="1"/><rect x="322" y="1090" width="10" height="7" rx="1.5" stroke="#94a3b8" strokeWidth="0.8"/><circle cx="367" cy="1087" r="4.5" stroke="#94a3b8" strokeWidth="0.8"/><circle cx="361" cy="1087" r="4.5" stroke="#94a3b8" strokeWidth="0.8"/></g>
        {/* dots */}
        <circle cx="185" cy="110" r="2.2" fill="#94a3b8" opacity="0.28"/><circle cx="395" cy="65" r="1.8" fill="#94a3b8" opacity="0.22"/><circle cx="450" cy="280" r="2" fill="#94a3b8" opacity="0.25"/><circle cx="140" cy="340" r="1.8" fill="#94a3b8" opacity="0.22"/><circle cx="370" cy="360" r="1.8" fill="#94a3b8" opacity="0.2"/><circle cx="270" cy="520" r="1.5" fill="#94a3b8" opacity="0.18"/><circle cx="510" cy="500" r="2" fill="#94a3b8" opacity="0.22"/><circle cx="80" cy="580" r="1.8" fill="#94a3b8" opacity="0.2"/><circle cx="430" cy="760" r="2" fill="#94a3b8" opacity="0.22"/><circle cx="160" cy="780" r="1.8" fill="#94a3b8" opacity="0.2"/><circle cx="290" cy="840" r="1.5" fill="#94a3b8" opacity="0.18"/><circle cx="350" cy="980" r="2" fill="#94a3b8" opacity="0.22"/><circle cx="120" cy="1100" r="2" fill="#94a3b8" opacity="0.2"/><circle cx="450" cy="1140" r="1.8" fill="#94a3b8" opacity="0.18"/><circle cx="50" cy="140" r="1.8" fill="#94a3b8" opacity="0.22"/><circle cx="575" cy="90" r="1.5" fill="#94a3b8" opacity="0.18"/>
      </svg>

      {/* ── HERO ─────────────────────────────────────── */}
      <div className="relative z-10 w-full bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-lg mx-auto text-center px-4 pt-10 pb-8">
          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-full px-4 py-1.5 mb-5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-emerald-700 text-xs font-semibold tracking-wide">Carte vérifiée & sécurisée</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight mb-1.5">
            Carte Bancaire
          </h1>
          <p className="text-slate-500 text-sm">Partagée en toute confidentialité</p>
        </div>
      </div>

      {/* ── CARTE 3D ─────────────────────────────────── */}
      <div className="relative z-10 w-full bg-gradient-to-b from-white to-slate-100 border-b border-slate-200 shadow-sm">
        <div className="max-w-lg mx-auto flex flex-col items-center px-4 pt-8 pb-8">
          <Card3D card={card} size="md" />
          <p className="text-slate-400 text-xs mt-3">Cliquer pour retourner</p>
        </div>
      </div>

      {/* ── CONTENU ──────────────────────────────────── */}
      <div className="relative z-10 w-full max-w-md mt-6 space-y-4 px-0">

        {/* Solde si présent */}
        {card.display_amount && (
          <div className="bg-white border border-slate-200 rounded-2xl px-5 py-4 flex items-center gap-4 shadow-sm">
            <div className="w-11 h-11 rounded-2xl bg-emerald-100 flex items-center justify-center shrink-0">
              <Wallet className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Solde affiché</p>
              <p className="text-slate-900 font-extrabold text-xl leading-tight">
                {Number(card.display_amount).toLocaleString('fr-FR')}
                <span className="text-emerald-600 text-sm font-semibold ml-1.5">{(() => {
                  const currencyMap = { 'EUR': '€', 'USD': '$', 'GBP': '£', 'CHF': 'CHF', 'CAD': 'C$', 'AUD': 'A$', 'NZD': 'NZ$', 'NOK': 'kr', 'SEK': 'kr', 'DKK': 'kr', 'MXN': '$', 'BRL': 'R$', 'JPY': '¥', 'CNY': '¥' }
                  return currencyMap[card.currency] || card.currency || '€'
                })()}</span>
              </p>
            </div>
          </div>
        )}

        {/* Panneau informations */}
        <div className="bg-white border border-slate-300 rounded-2xl overflow-hidden shadow-md">

          {/* En-tête */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
            <div>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-0.5">Récapitulatif</p>
              <h2 className="text-slate-900 font-extrabold text-base">Informations de la carte</h2>
            </div>
            <div className="w-9 h-9 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center">
              <BadgeCheck style={{ width: 18, height: 18 }} className="text-sky-500" />
            </div>
          </div>

          {/* Lignes */}
          <div className="divide-y divide-slate-200">
            {rows.map(({ label, value, Icon, mono, color }) => (
              <div key={label} className="flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3 shrink-0">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                    <Icon className="w-4.5 h-4.5" style={{ width: 18, height: 18 }} />
                  </div>
                  <span className="text-slate-600 text-sm font-semibold">{label}</span>
                </div>
                <span className={`text-slate-900 font-bold text-sm ml-3 whitespace-nowrap ${mono ? 'font-mono tracking-widest' : ''}`}>
                  {value}
                </span>
              </div>
            ))}
          </div>

          {/* Pied */}
          <div className="flex items-center gap-2 px-5 py-3 bg-slate-50 border-t border-slate-200">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-slate-500 text-xs font-medium">Consultation sécurisée</span>
          </div>
        </div>

      </div>
    </div>
  )
}
