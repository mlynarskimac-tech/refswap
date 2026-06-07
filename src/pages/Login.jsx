import { useState } from 'react'
import { supabase } from '../supabase'

const GOLD   = '#C9A96E'
const DARK   = '#1C1208'
const RED    = '#D24B4B'
const GREEN  = '#3F9D6E'

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
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;1,400&display=swap');
        .rs-input:focus { border-color: ${GOLD} !important; outline: none; }
      `}</style>

      {/* Page background */}
      <div style={{
        minHeight: '100vh',
        background: '#F8F6F1',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        fontFamily: "'Inter', system-ui, sans-serif",
      }}>
        {/* Card */}
        <div style={{
          width: '100%',
          maxWidth: 420,
          background: '#FFFFFF',
          border: '0.5px solid #E8E2D9',
          borderRadius: 20,
          overflow: 'hidden',
        }}>

          {/* ── TOP SECTION (dark header) ── */}
          <div style={{
            position: 'relative',
            background: DARK,
            padding: '2.5rem 2.5rem 2rem',
            overflow: 'hidden',
          }}>
            {/* Decorative circles */}
            <div style={{
              position: 'absolute', top: -70, right: -70,
              width: 220, height: 220, borderRadius: '50%',
              border: '1px solid rgba(201,169,110,0.2)',
              pointerEvents: 'none',
            }} />
            <div style={{
              position: 'absolute', top: -20, right: -20,
              width: 140, height: 140, borderRadius: '50%',
              border: '1px solid rgba(201,169,110,0.12)',
              pointerEvents: 'none',
            }} />

            {/* Logo */}
            <div style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 34,
              lineHeight: 1,
              position: 'relative',
            }}>
              <span style={{ fontWeight: 600, color: '#F5F0E8' }}>Ref</span>
              <span style={{ fontWeight: 400, fontStyle: 'italic', color: GOLD }}>Swap</span>
            </div>

            {/* Eyebrow */}
            <div style={{
              marginTop: 10,
              fontSize: 10,
              letterSpacing: 4,
              color: 'rgba(201,169,110,0.55)',
              textTransform: 'uppercase',
              fontFamily: "'Inter', system-ui, sans-serif",
            }}>
              Luxury Watch Exchange
            </div>

            {/* Decorative line */}
            <div style={{
              width: 32, height: 1,
              background: GOLD,
              marginTop: 16,
            }} />

            {/* Tagline */}
            <div style={{
              marginTop: 10,
              fontFamily: "'Cormorant Garamond', serif",
              fontStyle: 'italic',
              fontSize: 14,
              color: 'rgba(245,240,232,0.45)',
            }}>
              Trade watches. Not messages.
            </div>
          </div>

          {/* ── BOTTOM SECTION (card body) ── */}
          <div style={{ padding: '2rem 2.5rem 2.5rem' }}>

            {/* Tab switcher */}
            <div style={{
              display: 'flex',
              background: '#F4F1EB',
              borderRadius: 10,
              padding: 3,
              marginBottom: 24,
              gap: 3,
            }}>
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
                      flex: 1,
                      padding: '8px 0',
                      borderRadius: 8,
                      border: active ? '0.5px solid #E8E2D9' : 'none',
                      background: active ? '#FFFFFF' : 'transparent',
                      color: active ? DARK : '#999999',
                      fontSize: 12,
                      fontWeight: 500,
                      cursor: 'pointer',
                      transition: 'all .15s',
                      fontFamily: "'Inter', system-ui, sans-serif",
                    }}
                  >{label}</button>
                )
              })}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Email field */}
              <div>
                <label style={labelStyle}>Email address</label>
                <input
                  type="email"
                  className="rs-input"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  style={inputStyle}
                />
              </div>

              {/* Password field */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                  <span style={labelStyle}>Password</span>
                  {!isRegister && (
                    <span style={{
                      fontSize: 12,
                      color: GOLD,
                      cursor: 'pointer',
                    }}>Forgot password?</span>
                  )}
                </div>
                <input
                  type="password"
                  className="rs-input"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  style={inputStyle}
                />
              </div>

              {/* Feedback message */}
              {message && (
                <div style={{
                  padding: '10px 14px', borderRadius: 8,
                  background: isSuccess ? 'rgba(63,157,110,0.08)' : 'rgba(210,75,75,0.08)',
                  border: `1px solid ${isSuccess ? 'rgba(63,157,110,0.3)' : 'rgba(210,75,75,0.3)'}`,
                  color: isSuccess ? GREEN : RED,
                  fontSize: 13, lineHeight: 1.5,
                }}>
                  {message}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  background: loading ? '#E8E2D9' : DARK,
                  color: loading ? '#999' : GOLD,
                  border: 'none',
                  borderRadius: 10,
                  padding: '13px 0',
                  fontSize: 13,
                  fontWeight: 500,
                  letterSpacing: 1,
                  textTransform: 'uppercase',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'background .15s',
                  fontFamily: "'Inter', system-ui, sans-serif",
                }}
              >
                {loading ? 'Please wait…' : isRegister ? 'Create account' : 'Sign in'}
              </button>

              {/* OR separator */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12, margin: '4px 0',
              }}>
                <div style={{ flex: 1, height: 1, background: '#E8E2D9' }} />
                <span style={{ fontSize: 11, color: '#A09880', letterSpacing: 1 }}>OR</span>
                <div style={{ flex: 1, height: 1, background: '#E8E2D9' }} />
              </div>

            </form>

            {/* Trust row */}
            <div style={{
              borderTop: '0.5px solid #F0EDE7',
              paddingTop: 16,
              marginTop: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              flexWrap: 'wrap',
            }}>
              {['UK · DE · US', '€3k – €50k', 'P2P exchange'].map((item, i, arr) => (
                <span key={item} style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 11, color: '#A09880' }}>{item}</span>
                  {i < arr.length - 1 && (
                    <span style={{
                      width: 4, height: 4, borderRadius: '50%',
                      background: GOLD, display: 'inline-block', flexShrink: 0,
                    }} />
                  )}
                </span>
              ))}
            </div>

          </div>
        </div>
      </div>
    </>
  )
}

const labelStyle = {
  display: 'block',
  marginBottom: 6,
  fontSize: 10,
  letterSpacing: 2,
  textTransform: 'uppercase',
  color: '#A09880',
  fontFamily: "'Inter', system-ui, sans-serif",
}

const inputStyle = {
  width: '100%',
  border: '1px solid #E8E2D9',
  borderRadius: 10,
  padding: '11px 14px',
  background: '#FDFCFB',
  fontSize: 14,
  color: '#1C1208',
  fontFamily: "'Inter', system-ui, sans-serif",
  boxSizing: 'border-box',
  transition: 'border-color .15s',
}
