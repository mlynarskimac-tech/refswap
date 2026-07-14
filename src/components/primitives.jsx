// Shared visual primitives — PhotoBox, TierBadge, Flag, AnonToken, PhotoGallery
import { useState } from 'react'

const P = {
  bg:       '#FBFAF8',
  surface:  '#FFFFFF',
  surface2: '#F0EEE9',
  stroke:   '#E2DED6',
  strokeMd: '#D4CFC5',
  ink:      '#1C1B19',
  ink2:     '#6E6A62',
  ink3:     '#A6A199',
  gold:     '#A9823F',
  green:    '#3F9D6E',
  mono:     "'Spline Sans Mono', ui-monospace, monospace",
}

export const TIERS = {
  entry: { label: 'Entry', fullLabel: 'Entry Luxury', range: '€3–6k' },
  mid:   { label: 'Mid',   fullLabel: 'Mid Luxury',   range: '€6–12k' },
  high:  { label: 'High',  fullLabel: 'High Luxury',  range: '€12–25k' },
  ultra: { label: 'Ultra', fullLabel: 'Ultra Luxury', range: '€25–50k' },
}

export const GEO_LABELS = {
  local:   'Local',
  europe:  'EU',
  global:  'Worldwide',
}

export function PhotoBox({ label = '', h = 160, w = '100%', r = 8, big, src, style }) {
  if (src) {
    return (
      <div style={{
        height: h, width: w, borderRadius: r, position: 'relative', overflow: 'hidden',
        border: `1px solid ${P.stroke}`, ...style,
      }}>
        <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        {label && (
          <span style={{
            position: 'absolute', bottom: 8, left: 0, right: 0, textAlign: 'center',
            fontFamily: P.mono, fontSize: 8.5, letterSpacing: '.14em',
            textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)',
          }}>{label}</span>
        )}
      </div>
    )
  }

  return (
    <div style={{
      height: h, width: w, borderRadius: r, position: 'relative', overflow: 'hidden',
      background: 'radial-gradient(120% 90% at 50% 18%, #FFFFFF 0%, #F4F1EC 55%, #ECE8E1 100%)',
      border: `1px solid ${P.stroke}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      ...style,
    }}>
      <div style={{
        width: big ? 118 : 84, height: big ? 118 : 84, borderRadius: '50%',
        border: `2px solid ${P.strokeMd}`,
        background: 'linear-gradient(150deg,#fff,#EDE9E2)',
        boxShadow: 'inset 0 2px 10px rgba(0,0,0,.05), 0 6px 16px -10px rgba(0,0,0,.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          width: big ? 70 : 50, height: big ? 70 : 50, borderRadius: '50%',
          border: `1px solid ${P.stroke}`, background: '#FCFBF9',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: P.mono, fontSize: 8, color: P.ink3, letterSpacing: '.1em',
        }}>1:00</div>
      </div>
      {label && (
        <span style={{
          position: 'absolute', bottom: 8, left: 0, right: 0, textAlign: 'center',
          fontFamily: P.mono, fontSize: 8.5, letterSpacing: '.14em',
          textTransform: 'uppercase', color: P.ink3,
        }}>{label}</span>
      )}
    </div>
  )
}

export function TierBadge({ tier, solid }) {
  const t = TIERS[tier] || { label: tier }
  return (
    <span style={{
      fontFamily: P.mono, fontSize: 9.5, letterSpacing: '.1em', textTransform: 'uppercase',
      color: solid ? '#fff' : P.gold,
      border: `1px solid ${P.gold}${solid ? '' : '55'}`,
      borderRadius: 4, padding: '4px 8px',
      background: solid ? P.gold : `${P.gold}14`,
      whiteSpace: 'nowrap',
    }}>{t.label}</span>
  )
}

export function Flag({ code }) {
  if (!code) return null
  return (
    <span style={{
      fontFamily: P.mono, fontSize: 13, letterSpacing: '.06em', color: P.ink2,
    }}>{code.toUpperCase()}</span>
  )
}

export function AnonToken({ size = 26 }) {
  return (
    <span title="Anonymous until you match" style={{
      width: size, height: size, borderRadius: '50%',
      border: `1px solid ${P.strokeMd}`, background: P.surface2,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      color: P.ink3, fontSize: size * 0.5, flexShrink: 0,
    }}>◍</span>
  )
}

// ── PhotoGallery — Vault soft ────────────────────────────────────────────────
// Main photo + thumbnail row with click-to-select. Used by Browse's listing
// drawer and MyWatch so both share the same gallery behavior.
// Pass `key={listing.id}` (or similar) at the call site to reset the selected
// thumbnail when the underlying listing changes — same convention Browse's
// drawer already used before this was extracted.
const VAULT = { accent: '#274C6B', card: '#FFFFFF', bg: '#F6F6F3' }

export function PhotoGallery({ photos = [], mainHeight = 280, mainHeightMobile, thumbSize = 64, radius = 16 }) {
  const [selectedIndex, setSelectedIndex] = useState(0)

  const mainPhoto = photos[selectedIndex]

  return (
    <div>
      <div
        className="photo-gallery-main"
        style={{
          '--gallery-h': `${mainHeight}px`,
          ...(mainHeightMobile ? { '--gallery-h-mobile': `${mainHeightMobile}px` } : {}),
          borderRadius: radius, overflow: 'hidden',
          background: mainPhoto ? VAULT.card : VAULT.accent,
        }}
      >
        {mainPhoto && <img src={mainPhoto} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
      </div>
      {photos.length > 1 && (
        <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
          {photos.map((src, i) => {
            const active = i === selectedIndex
            return (
              <button
                key={i}
                onClick={() => setSelectedIndex(i)}
                onMouseEnter={e => { if (!active) e.currentTarget.style.opacity = '1' }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.opacity = '0.7' }}
                style={{
                  all: 'unset', cursor: 'pointer', boxSizing: 'border-box',
                  width: thumbSize, height: thumbSize, borderRadius: radius, overflow: 'hidden', background: VAULT.bg,
                  outline: active ? `2px solid ${VAULT.accent}` : 'none', outlineOffset: -2,
                  opacity: active ? 1 : 0.7,
                  transition: 'opacity 200ms ease',
                }}
              >
                <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
