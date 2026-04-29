import { useState } from 'react'
import { TEMPLATES } from '../data/templates'

function Chip({ color }) {
  return (
    <div style={{
      width: '44px', height: '34px', borderRadius: '5px',
      background: `linear-gradient(135deg, ${color}cc 0%, ${color}ff 40%, ${color}99 100%)`,
      border: '1px solid rgba(0,0,0,0.2)',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: 'rgba(0,0,0,0.2)', transform: 'translateY(-50%)' }} />
      <div style={{ position: 'absolute', left: '33%', top: 0, bottom: 0, width: '1px', background: 'rgba(0,0,0,0.15)' }} />
      <div style={{ position: 'absolute', left: '66%', top: 0, bottom: 0, width: '1px', background: 'rgba(0,0,0,0.15)' }} />
    </div>
  )
}

function VisaLogo({ color }) {
  return (
    <svg width="60" height="20" viewBox="0 0 60 20">
      <text x="0" y="17" fontFamily="serif" fontWeight="bold" fontStyle="italic"
        fontSize="20" fill={color} letterSpacing="-1">VISA</text>
    </svg>
  )
}

function MastercardLogo() {
  return (
    <svg width="46" height="30" viewBox="0 0 46 30">
      <circle cx="16" cy="15" r="14" fill="#eb001b" opacity="0.95" />
      <circle cx="30" cy="15" r="14" fill="#f79e1b" opacity="0.95" />
      <path d="M23 4.8a14 14 0 0 1 0 20.4A14 14 0 0 1 23 4.8z" fill="#ff5f00" />
    </svg>
  )
}

const LABELS = {
  fr: { holder: 'TITULAIRE', validThru: "VALIDE JUSQU'AU" },
  en: { holder: 'CARD HOLDER', validThru: 'VALID THRU' },
}

export default function Card3D({ card, interactive = true, size = 'md' }) {
  const [flipped, setFlipped] = useState(false)
  const [hovering, setHovering] = useState(false)

  const template = TEMPLATES.find(t => t.id === card?.template_id) || TEMPLATES[0]
  const labels = LABELS[card?.language || 'fr']
  const isFlipped = flipped || hovering

  const dims = size === 'sm'
    ? { width: 300, height: 190, numSize: 16, nameSize: 12, labelSize: 8 }
    : { width: 400, height: 252, numSize: 20, nameSize: 14, labelSize: 9 }

  const rawNumber = (card?.card_number || '').replace(/\s/g, '')
  const formattedNumber = rawNumber.length === 16
    ? rawNumber.replace(/(\d{4})(?=\d)/g, '$1 ')
    : '•••• •••• •••• ••••'

  return (
    <div
      className="card-scene select-none"
      style={{ width: dims.width, height: dims.height }}
      onMouseEnter={() => interactive && setHovering(true)}
      onMouseLeave={() => interactive && setHovering(false)}
      onClick={() => setFlipped(f => !f)}
      title="Cliquer pour retourner"
    >
      <div className={`card-inner${isFlipped ? ' flipped' : ''}`}>

        {/* ── RECTO ─────────────────────────────────────────────── */}
        <div className="card-face" style={{
          background: template.gradient,
          boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
        }}>
          {/* Shine overlay */}
          <div style={{
            position: 'absolute', inset: 0, borderRadius: 16,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.18) 0%, transparent 55%)',
            pointerEvents: 'none',
          }} />

          <div style={{
            padding: `${dims.width * 0.05}px ${dims.width * 0.062}px`,
            height: '100%', display: 'flex', flexDirection: 'column',
            justifyContent: 'space-between', position: 'relative',
          }}>
            {/* Top row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Chip color={template.chipColor} />
              {card?.network_type === 'mastercard'
                ? <MastercardLogo />
                : <VisaLogo color={template.textColor} />
              }
            </div>

            {/* Card number */}
            <div style={{
              fontFamily: '"Courier Prime", monospace',
              fontSize: dims.numSize, letterSpacing: '3px',
              color: template.numberColor,
              textShadow: '0 1px 4px rgba(0,0,0,0.4)',
            }}>
              {formattedNumber}
            </div>

            {/* Bottom row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div>
                <div style={{ fontSize: dims.labelSize, color: template.labelColor, letterSpacing: '1px', marginBottom: 2, textTransform: 'uppercase' }}>
                  {labels.holder}
                </div>
                <div style={{ fontSize: dims.nameSize, color: template.textColor, letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 500 }}>
                  {card?.cardholder_name || 'VOTRE NOM'}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: dims.labelSize, color: template.labelColor, letterSpacing: '1px', marginBottom: 2, textTransform: 'uppercase' }}>
                  {labels.validThru}
                </div>
                <div style={{ fontSize: dims.nameSize, color: template.textColor, letterSpacing: '1.5px', fontWeight: 500 }}>
                  {card?.expiry_date || 'MM/AA'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── VERSO ─────────────────────────────────────────────── */}
        <div className="card-face card-face-back" style={{
          background: template.gradient,
          boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
        }}>
          <div style={{
            position: 'absolute', inset: 0, borderRadius: 16,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%)',
            pointerEvents: 'none',
          }} />

          {/* Bande magnétique */}
          <div style={{
            position: 'absolute', top: dims.height * 0.15, left: 0, right: 0,
            height: dims.height * 0.19,
            background: 'linear-gradient(90deg, #111 0%, #2a2a2a 50%, #111 100%)',
          }} />

          {/* Bande signature */}
          <div style={{
            position: 'absolute',
            top: dims.height * 0.44,
            left: dims.width * 0.062,
            right: dims.width * 0.062,
            height: dims.height * 0.17,
            display: 'flex', alignItems: 'center', borderRadius: 4, overflow: 'hidden',
          }}>
            <div style={{
              flex: 1, height: '100%',
              background: 'repeating-linear-gradient(90deg, #efefef 0px, #e0e0e0 8px, #f5f5f5 8px, #efefef 16px)',
              display: 'flex', alignItems: 'center', paddingLeft: 8,
            }}>
              <span style={{
                fontFamily: 'cursive', fontSize: dims.nameSize + 2,
                color: '#555', opacity: 0.6,
              }}>
                {card?.cardholder_name || ''}
              </span>
            </div>
            <div style={{
              width: dims.width * 0.15, height: '100%',
              background: '#f0f0f0', borderLeft: '2px solid #ccc',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{ fontSize: 8, color: '#777', marginBottom: 2 }}>CVV</div>
              <div style={{ fontFamily: 'monospace', fontSize: dims.nameSize, color: '#222', fontWeight: 700 }}>
                {card?.cvv || '•••'}
              </div>
            </div>
          </div>

          {/* Solde esthétique */}
          {card?.display_amount && (
            <div style={{
              position: 'absolute',
              top: dims.height * 0.67,
              left: dims.width * 0.062,
              right: dims.width * 0.062,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <span style={{ fontSize: dims.labelSize, color: template.labelColor, textTransform: 'uppercase', letterSpacing: 1 }}>Solde</span>
              <span style={{ fontSize: dims.nameSize, color: template.textColor, fontWeight: 600 }}>
                {Number(card.display_amount).toLocaleString('fr-FR')} FCFA
              </span>
            </div>
          )}

          {/* Bottom */}
          <div style={{
            position: 'absolute', bottom: dims.height * 0.07,
            left: dims.width * 0.062, right: dims.width * 0.062,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span style={{ fontSize: 8, color: template.labelColor, maxWidth: '60%' }}>
              Carte virtuelle à but décoratif uniquement
            </span>
            {card?.network_type === 'mastercard'
              ? <MastercardLogo />
              : <VisaLogo color={template.textColor} />
            }
          </div>
        </div>
      </div>
    </div>
  )
}
