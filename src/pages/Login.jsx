import { useState } from 'react'
import { supabase } from '../supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isRegister, setIsRegister] = useState(false)
  const [message, setMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

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
      background: '#0B0B14',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    }}>
      <div style={{
        width: '100%',
        maxWidth: 400,
        background: '#111120',
        border: '1px solid #1E1E2E',
        borderRadius: 20,
        padding: '40px 36px',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            fontSize: 26, fontWeight: 800, letterSpacing: '-0.5px',
            color: '#C9A84C', marginBottom: 6,
          }}>
            RefSwap
          </div>
          <div style={{ fontSize: 13, color: '#3A3A4C', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Premium watch exchange
          </div>
        </div>

        {/* Tab switcher */}
        <div style={{
          display: 'flex',
          background: '#0B0B14',
          border: '1px solid #1A1A28',
          borderRadius: 10,
          padding: 3,
          marginBottom: 28,
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
                  background: active ? '#1E1E30' : 'transparent',
                  color: active ? '#F0EDE8' : '#3A3A50',
                  fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {label}
              </button>
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
              background: loading ? '#1E1E2E' : '#C9A84C',
              color: loading ? '#3A3A50' : '#0B0A07',
              border: 'none', borderRadius: 10,
              padding: '13px 0',
              fontSize: 14, fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.15s',
              letterSpacing: '0.02em',
            }}
          >
            {loading ? 'Please wait…' : isRegister ? 'Create account' : 'Sign in'}
          </button>
        </form>

        {message && (
          <div style={{
            marginTop: 16, padding: '10px 14px', borderRadius: 8,
            background: isSuccess ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
            border: `1px solid ${isSuccess ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
            color: isSuccess ? '#4ade80' : '#f87171',
            fontSize: 13, lineHeight: 1.5,
          }}>
            {message}
          </div>
        )}
      </div>
    </div>
  )
}

const inputStyle = {
  background: '#0B0B14',
  border: '1px solid #1E1E2E',
  borderRadius: 10,
  padding: '12px 14px',
  fontSize: 14,
  color: '#F0EDE8',
  outline: 'none',
  width: '100%',
}
