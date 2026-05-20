import { useState } from 'react'
import { supabase } from '../supabase'
import { useAuth } from '../context/auth-context'

const COUNTRIES = [
  { code: 'GB', name: 'United Kingdom' },
  { code: 'DE', name: 'Germany' },
  { code: 'US', name: 'United States' },
  { code: 'PL', name: 'Poland' },
  { code: 'FR', name: 'France' },
  { code: 'IT', name: 'Italy' },
  { code: 'ES', name: 'Spain' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'AT', name: 'Austria' },
]

export default function CompleteProfile({ onComplete }) {
  const { user } = useAuth()
  const [name, setName] = useState('')
  const [country, setCountry] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        email: user.email,
        name,
        country,
      })

    if (error) {
      setError(error.message)
    } else {
      onComplete()
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
          <div style={{ fontSize: 26, fontWeight: 800, color: '#C9A84C', marginBottom: 6, letterSpacing: '-0.5px' }}>
            RefSwap
          </div>
          <div style={{ fontSize: 16, fontWeight: 600, color: '#F0EDE8', marginBottom: 6 }}>
            Complete your profile
          </div>
          <div style={{ fontSize: 13, color: '#3A3A50' }}>
            A few details before you start browsing.
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={fieldWrap}>
            <label style={labelStyle}>Your name</label>
            <input
              type="text"
              placeholder="e.g. James"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              style={inputStyle}
            />
          </div>

          <div style={fieldWrap}>
            <label style={labelStyle}>Country</label>
            <select
              value={country}
              onChange={e => setCountry(e.target.value)}
              required
              style={{ ...inputStyle, cursor: 'pointer' }}
            >
              <option value="">Select your country</option>
              {COUNTRIES.map(c => (
                <option key={c.code} value={c.code}>{c.name}</option>
              ))}
            </select>
          </div>

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
            }}
          >
            {loading ? 'Saving…' : 'Continue'}
          </button>
        </form>

        {error && (
          <div style={{
            marginTop: 14, padding: '10px 14px', borderRadius: 8,
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.2)',
            color: '#f87171', fontSize: 13,
          }}>
            {error}
          </div>
        )}
      </div>
    </div>
  )
}

const fieldWrap = {
  display: 'flex', flexDirection: 'column', gap: 6,
}

const labelStyle = {
  fontSize: 11, fontWeight: 600, color: '#3A3A50',
  letterSpacing: '0.08em', textTransform: 'uppercase',
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
