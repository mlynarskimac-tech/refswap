import { useState } from 'react'
import { supabase } from '../supabase'

const gold    = '#A9823F'
const ink     = '#1C1B19'
const ink2    = '#6E6A62'
const ink3    = '#A6A199'
const stroke  = '#E2DED6'
const surface = '#FFFFFF'
const surface2= '#F0EEE9'
const bg      = '#FBFAF8'
const green   = '#3F9D6E'
const red     = '#D24B4B'
const serif   = "'Cormorant Garamond', serif"
const sans    = "'Inter', system-ui, sans-serif"
const mono    = "'Spline Sans Mono', ui-monospace, monospace"

export default function Login() {
  const [email,      setEmail]      = useState('')
  const [password,   setPassword]   = useState('')
  const [isRegister, setIsRegister] = useState(false)
  const [message,    setMessage]    = useState('')
  const [isSuccess,  setIsSuccess]  = useState(false)
  const [loading,    setLoading]    = useState(false)

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
    <div style={{
      minHeight: '100vh',
      background: bg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    }}>
      <div style={{
        width: '100%',
        maxWidth: 400,
        background: surface,
        border: `1px solid ${stroke}`,
        borderRadius: 14,
        padding: '40px 36px',
        boxShadow: '0 10px 40px -20px rgba(0,0,0,.15)',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            fontFamily: serif, fontWeight: 600, fontSize: 28,
            letterSpacing: '.01em', color: ink, marginBottom: 6,
          }}>
            Ref<span style={{ color: gold }}>Swap</span>
          </div>
          <div style={{
            fontFamily: mono, fontSize: 10.5, letterSpacing: '.12em',
            textTransform: 'uppercase', color: ink3,
          }}>
            Luxury watch exchange
          </div>
        </div>

        {/* Tab switcher */}
        <div style={{
          display: 'flex',
          background: surface2,
          border: `1px solid ${stroke}`,
          borderRadius: 10,
          padding: 3,
          marginBottom: 24,
          gap: 3,
        }}>
          {[{ label: 'Sign in', val: false }, { label: 'Sign up', val: true }].map(({ label, val }) => {
            const active = isRegister === val
            return (
              <button
                key={label}
                onClick={() => { setIsRegister(val); setMessage('') }}
                style={{
                  flex: 1, padding: '8px 0', borderRadius: 8, border: 'none',
                  background: active ? surface : 'transparent',
                  color: active ? ink : ink3,
                  fontFamily: sans, fontSize: 13, fontWeight: 600,
                  cursor: 'pointer', transition: 'all .15s',
                  boxShadow: active ? `0 1px 4px rgba(0,0,0,.08)` : 'none',
                }}
              >{label}</button>
            )
          })}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={inputStyle}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={inputStyle}
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 6,
              background: loading ? stroke : gold,
              color: loading ? ink3 : '#fff',
              border: 'none', borderRadius: 10,
              padding: '13px 0',
              fontFamily: sans, fontSize: 14, fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background .15s',
              letterSpacing: '.01em',
            }}
          >
            {loading ? 'Please wait…' : isRegister ? 'Create account' : 'Sign in'}
          </button>
        </form>

        {message && (
          <div style={{
            marginTop: 16, padding: '10px 14px', borderRadius: 8,
            background: isSuccess ? `${green}10` : `${red}10`,
            border: `1px solid ${isSuccess ? green + '44' : red + '44'}`,
            color: isSuccess ? green : red,
            fontFamily: sans, fontSize: 13, lineHeight: 1.5,
          }}>
            {message}
          </div>
        )}
      </div>
    </div>
  )
}

const inputStyle = {
  background: '#FBFAF8',
  border: '1px solid #E2DED6',
  borderRadius: 10,
  padding: '12px 14px',
  fontFamily: "'Inter', system-ui, sans-serif",
  fontSize: 14,
  color: '#1C1B19',
  outline: 'none',
  width: '100%',
}
