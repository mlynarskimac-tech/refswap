import { useState } from 'react'
import { supabase } from '../supabase'

// ── The Vault × Manufacture — soft ──────────────────────────────────────────
const bg      = '#F6F6F3'
const card    = '#FFFFFF'
const accent  = '#274C6B'
const accentHover = '#1E3C56'
const ink     = '#16181B'
const inkSoft = 'rgba(22,24,27,0.55)'
const sans    = "'Inter', system-ui, sans-serif"
const serif   = "'Fraunces', serif"
const green   = '#3F9D6E'
const red     = '#C0392B'

// ── Brand panel palette ──────────────────────────────────────────────────────
const brandBg     = accent
const circleBorder = '#3E617D'
const stepBorder   = '#5A7893'
const stepText     = '#EAF0F5'
const tagline      = '#C3D0DC'
const inputBorder  = '#E4E4DD'

const steps = [
  { n: 1, text: "List the watch you have — and the ones you'd swap it for." },
  { n: 2, text: "When you both want each other's watch, it's a match." },
  { n: 3, text: 'A private chat opens — you take it from there.' },
]

function focusOn(e)  { e.target.style.outline = `2px solid ${accent}`; e.target.style.outlineOffset = '0' }
function focusOff(e) { e.target.style.outline = 'none' }

const labelStyle = {
  display: 'block', marginBottom: 6,
  fontFamily: sans, fontSize: 13, color: inkSoft,
}

const inputStyle = {
  width: '100%', boxSizing: 'border-box',
  height: 44,
  background: card, border: `0.5px solid ${inputBorder}`, borderRadius: 12,
  padding: '0 16px', fontFamily: sans, fontSize: 14, color: ink,
  outline: 'none',
}

export default function Login() {
  const [email,      setEmail]      = useState('')
  const [password,   setPassword]   = useState('')
  const [isRegister, setIsRegister] = useState(false)
  const [message,    setMessage]    = useState('')
  const [isSuccess,  setIsSuccess]  = useState(false)
  const [loading,    setLoading]    = useState(false)

  // ── Auth logic (unchanged) ───────────────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setIsSuccess(false)

    if (isRegister) {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) {
        setMessage(error.message)
      } else {
        setMessage('Check your email — we sent you a confirmation link.')
        setIsSuccess(true)
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setMessage(error.message)
    }

    setLoading(false)
  }

  return (
    <div className="login-split" style={{ minHeight: '100vh', width: '100%', display: 'flex' }}>
      {/* ── Left — brand panel ─────────────────────────────────────────────── */}
      <div className="login-brand" style={{
        width: '46%', boxSizing: 'border-box',
        background: brandBg, padding: '40px 36px',
        position: 'relative', overflow: 'hidden',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      }}>
        {/* decorative circles */}
        <div style={{
          position: 'absolute', width: 340, height: 340, borderRadius: '50%',
          border: `1px solid ${circleBorder}`, right: -110, bottom: -140,
        }} />
        <div style={{
          position: 'absolute', width: 240, height: 240, borderRadius: '50%',
          border: `1px solid ${circleBorder}`, right: -50, bottom: -80,
        }} />

        {/* top */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontFamily: serif, fontSize: 26, fontWeight: 500, color: '#FFFFFF' }}>
            RefSwap
          </div>
          <div style={{ fontFamily: sans, fontSize: 15, color: tagline, marginTop: 8 }}>
            Swap your watch for one you'd rather wear.
          </div>
        </div>

        {/* steps */}
        <div className="login-brand-steps" style={{
          position: 'relative', zIndex: 1,
          display: 'flex', flexDirection: 'column', gap: 20,
        }}>
          {steps.map(({ n, text }) => (
            <div key={n} style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
              <div style={{
                flexShrink: 0, width: 26, height: 26, borderRadius: '50%',
                border: `1px solid ${stepBorder}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: sans, fontSize: 12, fontWeight: 600, color: '#FFFFFF',
              }}>
                {n}
              </div>
              <div style={{ fontFamily: sans, fontSize: 14, lineHeight: 1.5, color: stepText, paddingTop: 3 }}>
                {text}
              </div>
            </div>
          ))}
        </div>

        {/* bottom */}
        <div className="login-brand-footer" style={{
          position: 'relative', zIndex: 1,
          borderTop: `1px solid ${circleBorder}`, paddingTop: 16,
        }}>
          <div style={{ fontFamily: sans, fontSize: 13, color: tagline }}>
            No dealers. No fees. Just collectors.
          </div>
        </div>
      </div>

      {/* ── Right — form ────────────────────────────────────────────────────── */}
      <div className="login-form-col" style={{
        flex: 1, background: bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24, boxSizing: 'border-box',
      }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          {/* toggle */}
          <div style={{ display: 'flex', gap: 20, marginBottom: 24 }}>
            {[
              { label: 'Sign in',        val: false },
              { label: 'Create account', val: true  },
            ].map(({ label, val }) => {
              const active = isRegister === val
              return (
                <button
                  key={label}
                  onClick={() => { setIsRegister(val); setMessage('') }}
                  style={{
                    all: 'unset', cursor: 'pointer',
                    fontFamily: sans, fontSize: 14,
                    color: active ? accent : inkSoft,
                    fontWeight: active ? 600 : 400,
                    transition: 'color 300ms ease',
                  }}
                >{label}</button>
              )
            })}
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <label style={labelStyle}>Email address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onFocus={focusOn}
                onBlur={focusOff}
                required
                style={inputStyle}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                <span style={labelStyle}>Password</span>
                {!isRegister && (
                  <span style={{ fontFamily: sans, fontSize: 12.5, color: inkSoft, cursor: 'pointer' }}>
                    Forgot password?
                  </span>
                )}
              </div>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onFocus={focusOn}
                onBlur={focusOff}
                required
                style={inputStyle}
              />
            </div>

            {message && (
              <div style={{
                padding: '10px 14px', borderRadius: 12,
                background: isSuccess ? `${green}14` : `${red}14`,
                color: isSuccess ? green : red,
                fontFamily: sans, fontSize: 13, lineHeight: 1.5,
              }}>
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = accentHover }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.background = accent }}
              style={{
                all: 'unset', cursor: loading ? 'default' : 'pointer', boxSizing: 'border-box',
                textAlign: 'center', width: '100%',
                background: accent, color: '#fff',
                borderRadius: 99, padding: '14px 28px',
                fontFamily: sans, fontSize: 15, fontWeight: 500,
                opacity: loading ? 0.4 : 1,
                transition: 'background 300ms ease, opacity 300ms ease',
              }}
            >
              {loading ? 'Please wait…' : isRegister ? 'Create account' : 'Sign in'}
            </button>
          </form>

          <div style={{
            borderTop: '1px solid rgba(22,24,27,0.08)', paddingTop: 16, marginTop: 22,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, flexWrap: 'wrap',
          }}>
            {['UK · DE · US', '€3k – €50k', 'P2P exchange'].map((item, i, arr) => (
              <span key={item} style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontFamily: sans, fontSize: 11.5, color: inkSoft }}>{item}</span>
                {i < arr.length - 1 && (
                  <span style={{ width: 4, height: 4, borderRadius: '50%', background: accent, flexShrink: 0 }} />
                )}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
