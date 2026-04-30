import { useState, useEffect, useRef, useId } from 'react'
import { TEMPLATES } from '../data/templates'

// ── Chip EMV réaliste ─────────────────────────────────────────────────
function Chip({ uid }) {
  return (
    <svg width="52" height="40" viewBox="0 0 52 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`${uid}-cg`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#8a6200"/>
          <stop offset="18%"  stopColor="#e8b830"/>
          <stop offset="35%"  stopColor="#ffd966"/>
          <stop offset="50%"  stopColor="#c89010"/>
          <stop offset="68%"  stopColor="#f0c840"/>
          <stop offset="85%"  stopColor="#d4a020"/>
          <stop offset="100%" stopColor="#e8b830"/>
        </linearGradient>
        <linearGradient id={`${uid}-cs`} x1="0%" y1="0%" x2="55%" y2="100%">
          <stop offset="0%"   stopColor="rgba(255,255,255,0.45)"/>
          <stop offset="60%"  stopColor="rgba(255,255,255,0.05)"/>
          <stop offset="100%" stopColor="rgba(0,0,0,0)"/>
        </linearGradient>
        <linearGradient id={`${uid}-ci`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#c09010"/>
          <stop offset="30%"  stopColor="#f0d050"/>
          <stop offset="60%"  stopColor="#d0a820"/>
          <stop offset="100%" stopColor="#f8e060"/>
        </linearGradient>
      </defs>
      {/* Corps principal */}
      <rect x="0.5" y="0.5" width="51" height="39" rx="5.5" fill={`url(#${uid}-cg)`} stroke="rgba(0,0,0,0.25)" strokeWidth="1"/>
      {/* Contacts horizontaux */}
      <line x1="4" y1="13" x2="48" y2="13" stroke="rgba(120,80,0,0.45)" strokeWidth="0.8"/>
      <line x1="4" y1="20" x2="48" y2="20" stroke="rgba(120,80,0,0.45)" strokeWidth="0.8"/>
      <line x1="4" y1="27" x2="48" y2="27" stroke="rgba(120,80,0,0.45)" strokeWidth="0.8"/>
      {/* Contacts verticaux */}
      <line x1="17" y1="4" x2="17" y2="36" stroke="rgba(120,80,0,0.45)" strokeWidth="0.8"/>
      <line x1="35" y1="4" x2="35" y2="36" stroke="rgba(120,80,0,0.45)" strokeWidth="0.8"/>
      {/* Zone centrale gravée */}
      <rect x="9" y="10" width="34" height="20" rx="2.5" fill={`url(#${uid}-ci)`} stroke="rgba(100,65,0,0.30)" strokeWidth="0.6"/>
      {/* Micro-détail central */}
      <rect x="20" y="15" width="12" height="10" rx="1.5" fill="rgba(180,120,5,0.4)" stroke="rgba(100,65,0,0.2)" strokeWidth="0.5"/>
      {/* Reflet */}
      <rect x="0.5" y="0.5" width="51" height="39" rx="5.5" fill={`url(#${uid}-cs)`}/>
    </svg>
  )
}

// ── Icône contactless NFC ─────────────────────────────────────────────
function NFC({ color, size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="7.5" cy="12" r="1.8" fill={color} opacity="0.9"/>
      <path d="M10.5 8.2 a5.3 5.3 0 0 1 0 7.6"  stroke={color} strokeWidth="1.6" strokeLinecap="round" opacity="0.75"/>
      <path d="M13.3 5.8 a8.2 8.2 0 0 1 0 12.4" stroke={color} strokeWidth="1.6" strokeLinecap="round" opacity="0.50"/>
      <path d="M16.1 3.4 a11 11 0 0 1 0 17.2"   stroke={color} strokeWidth="1.6" strokeLinecap="round" opacity="0.28"/>
    </svg>
  )
}

// ── Logos réseau ──────────────────────────────────────────────────────
function VisaLogo({ color }) {
  return (
    <svg width="64" height="22" viewBox="0 0 64 22">
      <text x="0" y="19" fontFamily="'Times New Roman', serif" fontWeight="bold" fontStyle="italic"
        fontSize="22" fill={color} letterSpacing="-1.5">VISA</text>
    </svg>
  )
}

function MastercardLogo() {
  return (
    <svg width="50" height="32" viewBox="0 0 50 32">
      <circle cx="17" cy="16" r="15" fill="#eb001b" opacity="0.95"/>
      <circle cx="33" cy="16" r="15" fill="#f79e1b" opacity="0.95"/>
      <ellipse cx="25" cy="16" rx="6.5" ry="15" fill="#ff5f00"/>
    </svg>
  )
}

// ── Patterns décoratifs SVG ───────────────────────────────────────────
function Pattern({ uid, type, color, width, height }) {
  const pid = `${uid}-pat`

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

export default function Card3D({ card, interactive = true, size = 'md' }) {
  const [flipped, setFlipped]   = useState(false)
  const [hovering, setHovering] = useState(false)
  const [scale, setScale]       = useState(1)
  const wrapperRef              = useRef(null)
  const uid                     = useId().replace(/:/g, 'u')

  const template = TEMPLATES.find(t => t.id === card?.template_id) || TEMPLATES[0]
  const labels   = LABELS[card?.language || 'fr']
  const isFlipped = flipped || hovering

  const dims = size === 'sm'
    ? { w: 300, h: 190, num: 18, name: 11, label: 7.5, numTrack: '5px' }
    : { w: 400, h: 252, num: 24, name: 14, label: 9,   numTrack: '7px' }

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

  const styleVariant = card?.style_variant || 'standard'
  const fontVariant = card?.font_variant || 'classic'
  const nameFont = fontVariant === 'modern'
    ? 'Inter, "Segoe UI", sans-serif'
    : fontVariant === 'rounded'
    ? 'Segoe UI, "Helvetica Neue", Arial, sans-serif'
    : 'Times New Roman, serif'
  const isMetal = styleVariant === 'metal'
  const isLuxe = styleVariant === 'luxe'
  const p = dims.w * 0.062  // padding latéral
  const pt = dims.h * 0.12  // padding top

  return (
    <div ref={wrapperRef}
      style={{ width: dims.w * scale, height: dims.h * scale, flexShrink: 0 }}
    >
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
            <div className="card-face" style={{ background: template.gradient, boxShadow: '0 30px 70px rgba(0,0,0,0.7), 0 8px 20px rgba(0,0,0,0.4)' }}>

              {/* Pattern décoratif */}
              <Pattern uid={uid} type={template.patternType} color={template.patternColor} width={dims.w} height={dims.h}/>

              {/* Vignette bords */}
              <div style={{
                position:'absolute', inset:0, borderRadius:16, pointerEvents:'none',
                background:'radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(0,0,0,0.45) 100%)',
              }}/>
              {/* Reflet haut-gauche */}
              <div style={{
                position:'absolute', inset:0, borderRadius:16, pointerEvents:'none',
                background:isMetal
                  ? 'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.18), transparent 20%), linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0) 55%)'
                  : isLuxe
                  ? 'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.14), transparent 20%), radial-gradient(circle at 70% 35%, rgba(255,255,255,0.08), transparent 22%)'
                  : 'linear-gradient(135deg, rgba(255,255,255,0.13) 0%, rgba(255,255,255,0.03) 40%, transparent 65%)',
              }}/>

              {isLuxe && (
                <div style={{
                  position:'absolute', top: dims.h * 0.18, left: dims.w * 0.08,
                  width: dims.w * 0.34, height: dims.h * 0.014,
                  background:'rgba(255,255,255,0.18)',
                  transform:'rotate(-12deg)',
                  borderRadius:999,
                }}/>
              )}

              {/* Ligne de bord subtile */}
              <div style={{
                position:'absolute', inset:0, borderRadius:16, pointerEvents:'none',
                border:isMetal ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(255,255,255,0.08)',
              }}/>
              {/* Bordure dorée VIP */}
              {card?.tier === 'vip' && (
                <div style={{
                  position:'absolute', inset:0, borderRadius:16, pointerEvents:'none',
                  border:'1px solid rgba(212,175,55,0.22)',
                }}/>
              )}

              {/* ── Contenu recto ── */}
              <div style={{ position:'relative', padding:`${pt}px ${p}px`, height:'100%', display:'flex', flexDirection:'column', justifyContent:'space-between' }}>

                {/* Ligne 1 : Chip + NFC + Logo */}
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <div style={{ display:'flex', alignItems:'center', gap: dims.w * 0.04 }}>
                    <Chip uid={uid}/>
                    <NFC color={template.textColor} size={dims.h * 0.12}/>
                  </div>
                  {card?.network_type === 'mastercard'
                    ? <MastercardLogo/>
                    : <VisaLogo color={template.textColor}/>
                  }
                </div>

                {/* Nom de banque (VIP seulement) */}
                {card?.bank_name && card?.tier === 'vip' && (
                  <div style={{
                    fontSize: dims.label - 1,
                    color: template.labelColor,
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                    fontWeight: 500,
                    opacity: 0.8,
                    marginTop: dims.h * 0.02,
                    fontFamily: nameFont,
                  }}>
                    {card.bank_name}
                  </div>
                )}

                {/* Ligne 2 : Numéro */}
                <div style={{
                  fontFamily: '"Courier Prime", "Courier New", monospace',
                  fontSize: dims.num,
                  letterSpacing: dims.numTrack,
                  color: template.numberColor,
                  textShadow: `0 1px 6px rgba(0,0,0,0.6), 0 0 20px rgba(0,0,0,0.3)`,
                  fontWeight: 600,
                  marginLeft: 2,
                }}>
                  {fmtNum}
                </div>

                {/* Badge VIP */}
                {card?.tier === 'vip' && (
                  <div style={{
                    position:'absolute',
                    top: dims.h * 0.055,
                    right: p,
                    fontSize: Math.max(5.5, dims.label - 1.5),
                    letterSpacing: '2.5px',
                    color: template.labelColor,
                    fontWeight: 700,
                    opacity: 0.65,
                    fontFamily: 'monospace',
                  }}>◈ VIP</div>
                )}

                {/* Ligne 3 : Titulaire + Expiration */}
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', paddingBottom: dims.h * 0.04 }}>
                  <div>
                    <div style={{ fontSize: dims.label, color: template.labelColor, letterSpacing:'1.5px', marginBottom: 4, textTransform:'uppercase', fontWeight:500 }}>
                      {labels.holder}
                    </div>
                    <div style={{ fontSize: dims.name, color: template.textColor, letterSpacing:'2px', textTransform:'uppercase', fontWeight:600, textShadow:'0 1px 3px rgba(0,0,0,0.5)', fontFamily: nameFont }}>
                      {card?.cardholder_name || 'VOTRE NOM'}
                    </div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontSize: dims.label, color: template.labelColor, letterSpacing:'1.5px', marginBottom: 4, textTransform:'uppercase', fontWeight:500 }}>
                      {labels.validThru}
                    </div>
                    <div style={{ fontSize: dims.name, color: template.textColor, letterSpacing:'2px', fontWeight:600, textShadow:'0 1px 3px rgba(0,0,0,0.5)' }}>
                      {card?.expiry_date || 'MM/AA'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ════════════════ VERSO ════════════════ */}
            <div className="card-face card-face-back" style={{ background: template.gradient, boxShadow: '0 30px 70px rgba(0,0,0,0.7), 0 8px 20px rgba(0,0,0,0.4)' }}>

              <Pattern uid={`${uid}b`} type={template.patternType} color={template.patternColor} width={dims.w} height={dims.h}/>

              <div style={{
                position:'absolute', inset:0, borderRadius:16, pointerEvents:'none',
                background:'radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(0,0,0,0.45) 100%)',
              }}/>
              <div style={{ position:'absolute', inset:0, borderRadius:16, pointerEvents:'none', border:'1px solid rgba(255,255,255,0.08)' }}/>

              {/* Bande magnétique */}
              <div style={{
                position:'absolute', top: dims.h * 0.14, left:0, right:0,
                height: dims.h * 0.20,
                background:'linear-gradient(90deg, #0a0a0a 0%, #1e1e1e 30%, #282828 50%, #1e1e1e 70%, #0a0a0a 100%)',
                boxShadow:'inset 0 2px 4px rgba(255,255,255,0.04), inset 0 -2px 4px rgba(0,0,0,0.5)',
              }}/>

              {/* Bande de signature */}
              <div style={{
                position:'absolute',
                top: dims.h * 0.42,
                left: p, right: p,
                height: dims.h * 0.18,
                display:'flex', borderRadius:3, overflow:'hidden',
                boxShadow:'0 1px 4px rgba(0,0,0,0.4)',
              }}>
                {/* Zone signature */}
                <div style={{
                  flex:1, height:'100%',
                  background:'repeating-linear-gradient(90deg, #f0efea 0px, #e8e6de 10px, #f4f2ea 10px, #f0efea 20px)',
                  display:'flex', alignItems:'center', paddingLeft:10,
                }}>
                  <span style={{ fontFamily:'cursive', fontSize: dims.name + 1, color:'#666', opacity:0.55 }}>
                    {card?.cardholder_name || ''}
                  </span>
                </div>
                {/* Box CVV */}
                <div style={{
                  width: dims.w * 0.17, height:'100%',
                  background:'linear-gradient(135deg, #f8f6f0 0%, #ece9e0 100%)',
                  borderLeft:'2px solid #d0cfc8',
                  display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
                  gap: 2,
                }}>
                  <div style={{ fontSize: dims.label, color:'#888', letterSpacing:'1px', fontWeight:600 }}>CVV</div>
                  <div style={{ fontFamily:'monospace', fontSize: dims.name + 2, color:'#111', fontWeight:800, letterSpacing:'2px' }}>
                    {card?.cvv || '•••'}
                  </div>
                </div>
              </div>

              {/* Hologramme (décoratif) */}
              <div style={{
                position:'absolute',
                top: dims.h * 0.43,
                right: p + dims.w * 0.17 + p * 0.5,
                width: dims.h * 0.14,
                height: dims.h * 0.14,
                borderRadius:'50%',
                background:'conic-gradient(from 0deg, #ff006680, #ff980080, #ffff0080, #00ff8880, #0088ff80, #8800ff80, #ff006680)',
                opacity:0.6,
                filter:'blur(1px)',
              }}/>

              {/* Solde esthétique */}
              {card?.display_amount && (
                <div style={{
                  position:'absolute',
                  top: dims.h * 0.67,
                  left: p, right: p,
                  display:'flex', alignItems:'center', gap: 8,
                }}>
                  <span style={{ fontSize: dims.label, color: template.labelColor, textTransform:'uppercase', letterSpacing:'1.5px' }}>Solde</span>
                  <span style={{ fontSize: dims.name + 1, color: template.textColor, fontWeight:700, letterSpacing:'1px', textShadow:'0 1px 3px rgba(0,0,0,0.5)' }}>
                    {Number(card.display_amount).toLocaleString('fr-FR')} FCFA
                  </span>
                </div>
              )}

              {/* Bas verso */}
              <div style={{
                position:'absolute', bottom: dims.h * 0.07,
                left: p, right: p,
                display:'flex', justifyContent:'space-between', alignItems:'center',
              }}>
                <span style={{ fontSize: dims.label - 0.5, color: template.labelColor, opacity:0.7, maxWidth:'58%', lineHeight:1.4 }}>
                  Carte bancaire professionnelle
                </span>
                {card?.network_type === 'mastercard'
                  ? <MastercardLogo/>
                  : <VisaLogo color={template.textColor}/>
                }
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
