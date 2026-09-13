import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

// ── The Vault × Manufacture — soft ──────────────────────────────────────────
const card    = '#FFFFFF'
const accent  = '#274C6B'
const ink     = '#16181B'
const inkSoft = 'rgba(22,24,27,0.55)'
const sans    = "'Inter', system-ui, sans-serif"
const serif   = "'Fraunces', serif"

export default function MatchCelebration({ open, onClose }) {
  const navigate = useNavigate()

  useEffect(() => {
    if (!open) return
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  if (!open) return null

  function handleGoToMatches() {
    onClose()
    navigate('/matches')
  }

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 90,
      background: 'rgba(22,24,27,0.35)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      animation: 'fadeIn .2s ease',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: card, borderRadius: 22, padding: '36px 32px',
        width: '100%', maxWidth: 380, margin: '0 16px', boxSizing: 'border-box',
        textAlign: 'center',
        boxShadow: '0 24px 60px -16px rgba(22,24,27,0.24)',
      }}>
        <div style={{ fontFamily: serif, fontSize: 30, fontWeight: 600, color: ink }}>
          It's a match!
        </div>
        <div style={{ marginTop: 12, fontFamily: sans, fontSize: 14.5, color: inkSoft, lineHeight: 1.5 }}>
          You both want each other's watch. Start the conversation.
        </div>

        <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button onClick={handleGoToMatches} style={{
            all: 'unset', cursor: 'pointer', boxSizing: 'border-box',
            display: 'block', width: '100%', textAlign: 'center',
            fontFamily: sans, fontSize: 15, fontWeight: 500,
            padding: '14px 28px', borderRadius: 99,
            color: '#fff', background: accent,
          }}>Go to matches</button>
          <button onClick={onClose} style={{
            all: 'unset', cursor: 'pointer', boxSizing: 'border-box',
            display: 'block', width: '100%', textAlign: 'center',
            fontFamily: sans, fontSize: 13.5, color: inkSoft,
            padding: '10px 18px',
          }}>Keep browsing</button>
        </div>
      </div>
    </div>
  )
}
