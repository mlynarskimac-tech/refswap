import { useEffect } from 'react'

// ── The Vault × Manufacture — soft ──────────────────────────────────────────
const card    = '#FFFFFF'
const accent  = '#274C6B'
const ink     = '#16181B'
const inkSoft = 'rgba(22,24,27,0.55)'
const sans    = "'Inter', system-ui, sans-serif"
const serif   = "'Fraunces', serif"

export default function LikeLimitNotice({ open, onClose }) {
  useEffect(() => {
    if (!open) return
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 90,
      background: 'rgba(22,24,27,0.35)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      animation: 'fadeIn .2s ease',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: card, borderRadius: 22, padding: '26px 24px',
        width: '100%', maxWidth: 300, margin: '0 16px', boxSizing: 'border-box',
        textAlign: 'center',
        boxShadow: '0 24px 60px -16px rgba(22,24,27,0.24)',
      }}>
        <div style={{ fontFamily: serif, fontSize: 20, fontWeight: 600, color: ink }}>
          Easy there
        </div>
        <div style={{ marginTop: 8, fontFamily: sans, fontSize: 13.5, color: inkSoft, lineHeight: 1.5 }}>
          You've reached your like limit for now. Take a short break and come back in a bit.
        </div>

        <button onClick={onClose} style={{
          all: 'unset', cursor: 'pointer', boxSizing: 'border-box',
          display: 'block', width: '100%', textAlign: 'center', marginTop: 20,
          fontFamily: sans, fontSize: 14, fontWeight: 500,
          padding: '11px 22px', borderRadius: 99,
          color: '#fff', background: accent,
        }}>Got it</button>
      </div>
    </div>
  )
}
