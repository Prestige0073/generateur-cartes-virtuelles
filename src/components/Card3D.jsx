import { useState, useEffect, useRef, useId } from 'react'
import { TEMPLATES } from '../data/templates'

// ── Chip EMV standard (toujours doré — norme industrielle) ────────
function Chip({ uid }) {
  return (
    <svg width="50" height="38" viewBox="0 0 50 38" fill="none">
      <defs>
        <linearGradient id={`${uid}-cb`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#9a6e00"/>
          <stop offset="20%"  stopColor="#d4a020"/>
          <stop offset="40%"  stopColor="#f0cc50"/>
          <stop offset="55%"  stopColor="#c49018"/>
          <stop offset="75%"  stopColor="#e8c040"/>
          <stop offset="90%"  stopColor="#b88010"/>
          <stop offset="100%" stopColor="#d4a020"/>
        </linearGradient>
        <linearGradient id={`${uid}-ch`} x1="0%" y1="0%" x2="45%" y2="100%">
          <stop offset="0%"   stopColor="rgba(255,255,255,0.38)"/>
          <stop offset="50%"  stopColor="rgba(255,255,255,0.06)"/>
          <stop offset="100%" stopColor="rgba(0,0,0,0)"/>
        </linearGradient>
      </defs>
      {/* Corps principal */}
      <rect x="0.5" y="0.5" width="49" height="37" rx="5"
        fill={`url(#${uid}-cb)`} stroke="#7a5200" strokeWidth="0.8"/>
      {/* Lignes de contact horizontales */}
      <line x1="4" y1="12.5" x2="46" y2="12.5" stroke="rgba(80,50,0,0.45)" strokeWidth="0.7"/>
      <line x1="4" y1="19"   x2="46" y2="19"   stroke="rgba(80,50,0,0.45)" strokeWidth="0.7"/>
      <line x1="4" y1="25.5" x2="46" y2="25.5" stroke="rgba(80,50,0,0.45)" strokeWidth="0.7"/>
      {/* Lignes de contact verticales */}
      <line x1="16" y1="3.5" x2="16" y2="34.5" stroke="rgba(80,50,0,0.45)" strokeWidth="0.7"/>
      <line x1="34" y1="3.5" x2="34" y2="34.5" stroke="rgba(80,50,0,0.45)" strokeWidth="0.7"/>
      {/* Zone centrale gravée */}
      <rect x="8" y="9.5" width="34" height="19" rx="2"
        fill="rgba(100,65,0,0.22)" stroke="rgba(60,40,0,0.20)" strokeWidth="0.5"/>
      <rect x="18" y="14.5" width="14" height="9" rx="1.5"
        fill="rgba(80,52,0,0.18)"/>
      {/* Reflet */}
      <rect x="0.5" y="0.5" width="49" height="37" rx="5"
        fill={`url(#${uid}-ch)`}/>
    </svg>
  )
}

// ── NFC ───────────────────────────────────────────────────────────
function NFC({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="7" cy="12" r="1.8" fill="rgba(255,255,255,0.90)"/>
      <path d="M10 8.0 a5.5 5.5 0 0 1 0 8.0"  stroke="rgba(255,255,255,0.80)" strokeWidth="1.7" strokeLinecap="round"/>
      <path d="M13 5.5 a8.5 8.5 0 0 1 0 13.0" stroke="rgba(255,255,255,0.55)" strokeWidth="1.7" strokeLinecap="round"/>
      <path d="M16 3.2 a11.2 11.2 0 0 1 0 17.6" stroke="rgba(255,255,255,0.28)" strokeWidth="1.7" strokeLinecap="round"/>
    </svg>
  )
}

// ── Logos réseau ──────────────────────────────────────────────────
function VisaLogo({ gold = false }) {
  const c = gold ? '#f8e060' : 'rgba(255,255,255,0.92)'
  return (
    <svg width="62" height="21" viewBox="0 0 62 21">
      <text x="0" y="18"
        fontFamily="'Times New Roman', serif"
        fontWeight="bold" fontStyle="italic"
        fontSize="21" fill={c} letterSpacing="-1">VISA</text>
    </svg>
  )
}

function MastercardLogo() {
  return (
    <svg width="48" height="30" viewBox="0 0 48 30">
      <circle cx="16" cy="15" r="14" fill="#eb001b" opacity="0.96"/>
      <circle cx="32" cy="15" r="14" fill="#f79e1b" opacity="0.96"/>
      <ellipse cx="24" cy="15" rx="6.2" ry="14" fill="#ff5f00"/>
    </svg>
  )
}

// ── Patterns décoratifs SVG ───────────────────────────────────────
function Pattern({ uid, type, color, width, height }) {
  const pid = `${uid}-p`

  if (type === 'circuit') return (
    <svg style={{ position:'absolute', inset:0, width:'100%', height:'100%', pointerEvents:'none' }}>
      <defs>
        <pattern id={pid} x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
          <circle cx="0"  cy="0"  r="1.2" fill={color}/>
          <circle cx="40" cy="0"  r="1.2" fill={color}/>
          <circle cx="0"  cy="40" r="1.2" fill={color}/>
          <circle cx="40" cy="40" r="1.2" fill={color}/>
          <circle cx="20" cy="20" r="1.2" fill={color}/>
          <line x1="0"  y1="0"  x2="20" y2="0"  stroke={color} strokeWidth="0.5"/>
          <line x1="20" y1="0"  x2="20" y2="20" stroke={color} strokeWidth="0.5"/>
          <line x1="40" y1="40" x2="20" y2="40" stroke={color} strokeWidth="0.5"/>
          <line x1="20" y1="40" x2="20" y2="20" stroke={color} strokeWidth="0.5"/>
          <line x1="0"  y1="40" x2="0"  y2="20" stroke={color} strokeWidth="0.5"/>
          <circle cx="0" cy="20" r="0.8" fill={color}/>
        </pattern>
      </defs>
      <rect width={width} height={height} fill={`url(#${pid})`}/>
    </svg>
  )

  if (type === 'hexagons') return (
    <svg style={{ position:'absolute', inset:0, width:'100%', height:'100%', pointerEvents:'none' }}>
      <defs>
        <pattern id={pid} x="0" y="0" width="28" height="24.2" patternUnits="userSpaceOnUse">
          <polygon points="14,1 26,7.5 26,16.7 14,23.2 2,16.7 2,7.5" fill="none" stroke={color} strokeWidth="0.7"/>
        </pattern>
      </defs>
      <rect width={width} height={height} fill={`url(#${pid})`}/>
    </svg>
  )

  if (type === 'dots') return (
    <svg style={{ position:'absolute', inset:0, width:'100%', height:'100%', pointerEvents:'none' }}>
      <defs>
        <pattern id={pid} x="0" y="0" width="18" height="18" patternUnits="userSpaceOnUse">
          <circle cx="9" cy="9" r="1.3" fill={color}/>
        </pattern>
      </defs>
      <rect width={width} height={height} fill={`url(#${pid})`}/>
    </svg>
  )

  if (type === 'lines') return (
    <svg style={{ position:'absolute', inset:0, width:'100%', height:'100%', pointerEvents:'none' }}>
      <defs>
        <pattern id={pid} x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
          <line x1="0" y1="0" x2="0" y2="16" stroke={color} strokeWidth="0.7"/>
        </pattern>
      </defs>
      <rect width={width} height={height} fill={`url(#${pid})`}/>
    </svg>
  )

  if (type === 'diamonds') return (
    <svg style={{ position:'absolute', inset:0, width:'100%', height:'100%', pointerEvents:'none' }}>
      <defs>
        <pattern id={pid} x="0" y="0" width="22" height="22" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect x="3" y="3" width="16" height="16" fill="none" stroke={color} strokeWidth="0.7"/>
        </pattern>
      </defs>
      <rect width={width} height={height} fill={`url(#${pid})`}/>
    </svg>
  )

  if (type === 'waves') return (
    <svg style={{ position:'absolute', inset:0, width:'100%', height:'100%', pointerEvents:'none' }}>
      <defs>
        <pattern id={pid} x="0" y="0" width="80" height="20" patternUnits="userSpaceOnUse">
          <path d="M0 10 Q20 2 40 10 Q60 18 80 10" fill="none" stroke={color} strokeWidth="0.7"/>
        </pattern>
      </defs>
      <rect width={width} height={height} fill={`url(#${pid})`}/>
    </svg>
  )

  if (type === 'mesh') return (
    <svg style={{ position:'absolute', inset:0, width:'100%', height:'100%', pointerEvents:'none' }}>
      <defs>
        <pattern id={pid} x="0" y="0" width="14" height="14" patternUnits="userSpaceOnUse">
          <path d="M 14 0 L 0 0 0 14" fill="none" stroke={color} strokeWidth="0.4"/>
        </pattern>
      </defs>
      <rect width={width} height={height} fill={`url(#${pid})`}/>
    </svg>
  )

  return null
}

const LABELS = {
  fr: { holder: 'TITULAIRE', validThru: "VALIDE JUSQU'AU" },
  en: { holder: 'CARD HOLDER', validThru: 'VALID THRU' },
}

// Effet gravure métal pour les textes clairs
const ENGRAVE_WHITE = '0 1px 0 rgba(0,0,0,0.95), 0 2px 8px rgba(0,0,0,0.75), 0 -1px 0 rgba(255,255,255,0.10)'
// Effet gravure or
const ENGRAVE_GOLD  = '0 1px 0 rgba(0,0,0,0.95), 0 2px 8px rgba(0,0,0,0.80), 0 -1px 0 rgba(255,240,80,0.18), 0 0 10px rgba(180,130,0,0.20)'
// Label subtil
const LABEL_SHADOW  = '0 1px 3px rgba(0,0,0,0.85)'

export default function Card3D({ card, interactive = true, size = 'md' }) {
  const [flipped, setFlipped]   = useState(false)
  const [hovering, setHovering] = useState(false)
  const [scale, setScale]       = useState(1)
  const wrapperRef              = useRef(null)
  const uid                     = useId().replace(/:/g, 'u')

  const template  = TEMPLATES.find(t => t.id === card?.template_id) || TEMPLATES[0]
  const labels    = LABELS[card?.language || 'fr']
  const isFlipped = flipped || hovering
  const isVip     = card?.tier === 'vip'
  const isPremium = card?.tier === 'premium'
  const isGold    = template.goldTheme === true

  const dims = size === 'sm'
    ? { w: 300, h: 190, num: 17, name: 10.5, label: 7,   numTrack: '4px' }
    : { w: 400, h: 252, num: 23, name: 13.5, label: 8.5, numTrack: '6px' }

  useEffect(() => {
    function measure() {
      if (!wrapperRef.current) return
      const parent = wrapperRef.current.parentElement
      const avail  = parent ? parent.getBoundingClientRect().width : window.innerWidth - 32
      setScale(avail > 0 && avail < dims.w ? avail / dims.w : 1)
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [dims.w])

  const rawNum = (card?.card_number || '').replace(/\s/g, '')
  const fmtNum = rawNum.length === 16
    ? rawNum.replace(/(\d{4})(?=\d)/g, '$1 ')
    : '•••• •••• •••• ••••'

  const fontVariant = card?.font_variant || 'classic'
  const nameFont =
    fontVariant === 'modern'  ? '"Helvetica Neue", Arial, sans-serif' :
    fontVariant === 'rounded' ? '"Arial Rounded MT Bold", "Helvetica Neue", Arial, sans-serif' :
                                '"Helvetica Neue", Arial, sans-serif'

  const styleVariant = card?.style_variant || 'standard'
  const isMetal = styleVariant === 'metal'
  const isLuxe  = styleVariant === 'luxe'

  const p  = dims.w * 0.062
  const pt = dims.h * 0.115

  const textC   = template.textColor
  const numberC = template.numberColor
  const labelC  = template.labelColor
  const engraveEffect = isGold ? ENGRAVE_GOLD : ENGRAVE_WHITE

  const cardBorder = isVip
    ? '1.5px solid rgba(212,175,55,0.32)'
    : isPremium
    ? '1.5px solid rgba(120,190,255,0.18)'
    : '1px solid rgba(255,255,255,0.09)'

  const faceBoxShadow = isVip
    ? undefined
    : '0 28px 65px rgba(0,0,0,0.80), 0 8px 22px rgba(0,0,0,0.50)'

  const faceClass     = isVip ? 'card-face card-face-vip'             : 'card-face'
  const faceBackClass = isVip ? 'card-face card-face-back card-face-vip' : 'card-face card-face-back'

  const sharedFaceProps = {
    background: template.gradient,
    boxShadow: faceBoxShadow,
  }

  const overlayLight = isMetal
    ? 'radial-gradient(circle at 18% 18%, rgba(255,255,255,0.22), transparent 22%), linear-gradient(135deg, rgba(255,255,255,0.11), transparent 55%)'
    : isLuxe
    ? 'radial-gradient(circle at 28% 18%, rgba(255,255,255,0.18), transparent 24%), radial-gradient(circle at 72% 36%, rgba(255,255,255,0.10), transparent 26%)'
    : 'linear-gradient(135deg, rgba(255,255,255,0.13) 0%, rgba(255,255,255,0.03) 42%, transparent 65%)'

  return (
    <div ref={wrapperRef} style={{ width: dims.w * scale, height: dims.h * scale, flexShrink: 0 }}>
      <div style={{ width: dims.w, height: dims.h, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
        <div
          className="card-scene select-none"
          style={{ width: dims.w, height: dims.h }}
          onMouseEnter={() => interactive && setHovering(true)}
          onMouseLeave={() => interactive && setHovering(false)}
          onClick={() => setFlipped(f => !f)}
        >
          <div className={`card-inner${isFlipped ? ' flipped' : ''}`}>

            {/* ════════════════ RECTO ════════════════ */}
            <div className={faceClass} style={sharedFaceProps}>

              <Pattern uid={uid} type={template.patternType} color={template.patternColor} width={dims.w} height={dims.h}/>

              {/* Vignette */}
              <div style={{ position:'absolute', inset:0, borderRadius:16, pointerEvents:'none',
                background:'radial-gradient(ellipse at 50% 50%, transparent 42%, rgba(0,0,0,0.58) 100%)' }}/>

              {/* Reflet */}
              <div style={{ position:'absolute', inset:0, borderRadius:16, pointerEvents:'none', background: overlayLight }}/>

              {/* Shimmer */}
              <div style={{ position:'absolute', inset:0, borderRadius:16, overflow:'hidden', pointerEvents:'none' }}>
                <div className="card-shimmer-beam"/>
              </div>

              {isLuxe && (
                <div style={{
                  position:'absolute', top: dims.h * 0.18, left: dims.w * 0.08,
                  width: dims.w * 0.32, height: dims.h * 0.012,
                  background:'rgba(255,255,255,0.22)', transform:'rotate(-12deg)', borderRadius:999,
                }}/>
              )}

              {/* Bordure */}
              <div style={{ position:'absolute', inset:0, borderRadius:16, pointerEvents:'none', border: cardBorder }}/>

              {/* ── Contenu recto ── */}
              <div style={{ position:'relative', padding:`${pt}px ${p}px`, height:'100%', display:'flex', flexDirection:'column', justifyContent:'space-between' }}>

                {/* Ligne 1 : Chip + NFC + Logo réseau */}
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <div style={{ display:'flex', alignItems:'center', gap: dims.w * 0.038 }}>
                    <Chip uid={uid}/>
                    <NFC size={dims.h * 0.115}/>
                  </div>
                  {card?.network_type === 'mastercard'
                    ? <MastercardLogo/>
                    : <VisaLogo gold={isGold}/>
                  }
                </div>

                {/* Nom de banque (VIP uniquement) */}
                {card?.bank_name && isVip && (
                  <div style={{
                    fontSize: dims.label,
                    color: labelC,
                    letterSpacing: '2px',
                    textTransform: 'uppercase',
                    fontWeight: 500,
                    fontFamily: '"Helvetica Neue", Arial, sans-serif',
                    textShadow: LABEL_SHADOW,
                    marginTop: dims.h * 0.015,
                  }}>
                    {card.bank_name}
                  </div>
                )}

                {/* Badge VIP */}
                {isVip && (
                  <div style={{
                    position:'absolute', top: dims.h * 0.05, right: p,
                    fontSize: Math.max(6, dims.label - 1),
                    letterSpacing: '2.5px',
                    color: isGold ? '#f8e060' : 'rgba(255,255,255,0.70)',
                    fontWeight: 700,
                    fontFamily: '"Helvetica Neue", Arial, sans-serif',
                    textShadow: LABEL_SHADOW,
                  }}>◈ VIP</div>
                )}

                {/* Numéro de carte — effet embossé */}
                <div style={{
                  fontFamily: '"Share Tech Mono", "Courier Prime", "Courier New", monospace',
                  fontSize: dims.num,
                  fontWeight: 700,
                  letterSpacing: dims.numTrack,
                  color: numberC,
                  textShadow: engraveEffect,
                  marginLeft: 1,
                }}>
                  {fmtNum}
                </div>

                {/* Titulaire + Expiration */}
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', paddingBottom: dims.h * 0.038 }}>
                  <div>
                    <div style={{
                      fontSize: dims.label, color: labelC,
                      letterSpacing: '1.8px', marginBottom: 3,
                      textTransform: 'uppercase', fontWeight: 500,
                      fontFamily: '"Helvetica Neue", Arial, sans-serif',
                      textShadow: LABEL_SHADOW,
                    }}>
                      {labels.holder}
                    </div>
                    <div style={{
                      fontSize: dims.name, color: textC,
                      letterSpacing: '2.2px', textTransform: 'uppercase',
                      fontWeight: 600,
                      fontFamily: nameFont,
                      textShadow: engraveEffect,
                    }}>
                      {card?.cardholder_name || 'VOTRE NOM'}
                    </div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div style={{
                      fontSize: dims.label, color: labelC,
                      letterSpacing: '1.8px', marginBottom: 3,
                      textTransform: 'uppercase', fontWeight: 500,
                      fontFamily: '"Helvetica Neue", Arial, sans-serif',
                      textShadow: LABEL_SHADOW,
                    }}>
                      {labels.validThru}
                    </div>
                    <div style={{
                      fontSize: dims.name, color: textC,
                      letterSpacing: '2.2px', fontWeight: 600,
                      fontFamily: '"Share Tech Mono", "Courier Prime", "Courier New", monospace',
                      textShadow: engraveEffect,
                    }}>
                      {card?.expiry_date || 'MM/AA'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ════════════════ VERSO ════════════════ */}
            <div className={faceBackClass} style={sharedFaceProps}>

              <Pattern uid={`${uid}b`} type={template.patternType} color={template.patternColor} width={dims.w} height={dims.h}/>

              <div style={{ position:'absolute', inset:0, borderRadius:16, pointerEvents:'none',
                background:'radial-gradient(ellipse at 50% 50%, transparent 42%, rgba(0,0,0,0.58) 100%)' }}/>

              {/* Shimmer verso */}
              <div style={{ position:'absolute', inset:0, borderRadius:16, overflow:'hidden', pointerEvents:'none' }}>
                <div className="card-shimmer-beam" style={{ animationDelay:'3.5s' }}/>
              </div>

              <div style={{ position:'absolute', inset:0, borderRadius:16, pointerEvents:'none', border: cardBorder }}/>

              {/* Bande magnétique */}
              <div style={{
                position:'absolute', top: dims.h * 0.14, left:0, right:0,
                height: dims.h * 0.195,
                background:'linear-gradient(90deg, #050505 0%, #181818 20%, #222222 50%, #181818 80%, #050505 100%)',
                boxShadow:'inset 0 2px 5px rgba(255,255,255,0.04), inset 0 -2px 5px rgba(0,0,0,0.65)',
              }}/>

              {/* Bande signature */}
              <div style={{
                position:'absolute', top: dims.h * 0.42, left: p, right: p,
                height: dims.h * 0.175,
                display:'flex', borderRadius:3, overflow:'hidden',
                boxShadow:'0 2px 8px rgba(0,0,0,0.55)',
              }}>
                <div style={{
                  flex:1, height:'100%',
                  background:'repeating-linear-gradient(90deg, #f0eeea 0px, #e8e5dd 9px, #f4f2ea 9px, #f0eeea 18px)',
                  display:'flex', alignItems:'center', paddingLeft: 10,
                }}>
                  <span style={{
                    fontFamily: 'Georgia, serif',
                    fontStyle: 'italic',
                    fontSize: dims.name,
                    color: '#444',
                    opacity: 0.45,
                  }}>
                    {card?.cardholder_name || ''}
                  </span>
                </div>
                <div style={{
                  width: dims.w * 0.16, height:'100%',
                  background:'linear-gradient(160deg, #f8f6f0 0%, #ebe9e0 100%)',
                  borderLeft:'2px solid #d0cec8',
                  display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
                  gap: 1,
                }}>
                  <div style={{ fontSize: dims.label - 0.5, color:'#888', letterSpacing:'1px', fontWeight:700,
                    fontFamily:'"Helvetica Neue", Arial, sans-serif' }}>CVV</div>
                  <div style={{ fontFamily:'"Share Tech Mono", "Courier Prime", "Courier New", monospace',
                    fontSize: dims.name + 1.5, color:'#111', fontWeight:800, letterSpacing:'3px' }}>
                    {card?.cvv || '•••'}
                  </div>
                </div>
              </div>

              {/* Hologramme */}
              <div style={{
                position:'absolute',
                top: dims.h * 0.415,
                right: p + dims.w * 0.16 + p * 0.55,
                width: dims.h * 0.155, height: dims.h * 0.155,
                borderRadius:'50%',
                background:'conic-gradient(from 0deg, #ff0066cc, #ff6600cc, #ffe800cc, #00ff88cc, #0099ffcc, #8800ffcc, #ff0066cc)',
                filter:'blur(0.4px)',
                boxShadow:'0 0 8px rgba(255,255,255,0.18)',
              }}>
                <div style={{ position:'absolute', inset:'20%', borderRadius:'50%', border:'1px solid rgba(255,255,255,0.50)' }}/>
                <div style={{ position:'absolute', inset:'43%', borderRadius:'50%', background:'rgba(255,255,255,0.52)' }}/>
              </div>

              {/* Solde */}
              {card?.display_amount && (
                <div style={{
                  position:'absolute', top: dims.h * 0.67, left: p, right: p,
                  display:'flex', alignItems:'baseline', gap: 6,
                }}>
                  <span style={{
                    fontSize: dims.label, color: labelC,
                    textTransform:'uppercase', letterSpacing:'2px',
                    fontFamily:'"Helvetica Neue", Arial, sans-serif',
                    textShadow: LABEL_SHADOW,
                  }}>Solde</span>
                  <span style={{
                    fontSize: dims.name + 1, color: textC,
                    fontWeight: 700, letterSpacing:'1px',
                    fontFamily:'"Share Tech Mono", "Courier Prime", "Courier New", monospace',
                    textShadow: engraveEffect,
                  }}>
                    {Number(card.display_amount).toLocaleString('fr-FR')} FCFA
                  </span>
                </div>
              )}

              {/* Bas verso */}
              <div style={{
                position:'absolute', bottom: dims.h * 0.065,
                left: p, right: p,
                display:'flex', justifyContent:'space-between', alignItems:'center',
              }}>
                <span style={{
                  fontSize: dims.label - 0.5, color: labelC,
                  opacity: 0.60, maxWidth:'58%', lineHeight:1.4,
                  letterSpacing:'0.5px',
                  fontFamily:'"Helvetica Neue", Arial, sans-serif',
                }}>
                  Carte bancaire professionnelle
                </span>
                {card?.network_type === 'mastercard'
                  ? <MastercardLogo/>
                  : <VisaLogo gold={isGold}/>
                }
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
