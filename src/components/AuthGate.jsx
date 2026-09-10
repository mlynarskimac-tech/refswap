import { useNavigate } from 'react-router-dom'
import { useAuthGate } from '../context/auth-gate-context'

// ── The Vault × Manufacture — soft ──────────────────────────────────────────
const card    = '#FFFFFF'
const accent  = '#274C6B'
const accentHover = '#1E3C56'
const ink     = '#16181B'
const inkSoft = 'rgba(22,24,27,0.55)'
const sans    = "'Inter', system-ui, sans-serif"
const serif   = "'Fraunces', serif"

export default function AuthGate() {
  const { isOpen, close } = useAuthGate()
  const navigate = useNavigate()

  if (!isOpen) return null

  function goToLogin() {
    close()
    navigate('/login')
  }

  return (
    <div onClick={close} style={{
      position: 'fixed', inset: 0, zIndex: 90,
      background: 'rgba(22,24,27,0.35)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      animation: 'fadeIn .2s ease',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: card, borderRadius: 22, padding: '30px 28px',
        width: '100%', maxWidth: 360, margin: '0 16px', boxSizing: 'border-box',
        boxShadow: '0 24px 60px -16px rgba(22,24,27,0.24)',
        textAlign: 'center',
      }}>
        <div style={{ fontFamily: serif, fontSize: 20, fontWeight: 600, color: ink }}>
          Join RefSwap
        </div>
        <div style={{ marginTop: 10, fontFamily: sans, fontSize: 14, color: inkSoft, lineHeight: 1.5 }}>
          Create a free account to like watches and start swapping.
        </div>

        <button
          onClick={goToLogin}
          onMouseEnter={e => { e.currentTarget.style.background = accentHover }}
          onMouseLeave={e => { e.currentTarget.style.background = accent }}
          style={{
            all: 'unset', cursor: 'pointer', boxSizing: 'border-box',
            display: 'block', width: '100%', marginTop: 22, textAlign: 'center',
            fontFamily: sans, fontSize: 15, fontWeight: 500, color: '#fff',
            background: accent, borderRadius: 99, padding: '13px 24px',
            transition: 'background 300ms ease',
          }}
        >Sign in / Join</button>

        <button onClick={close} style={{
          all: 'unset', cursor: 'pointer', display: 'block',
          margin: '14px auto 0', fontFamily: sans, fontSize: 13, color: inkSoft,
        }}>Maybe later</button>
      </div>
    </div>
  )
}
