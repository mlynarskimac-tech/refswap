import { useState } from 'react'
import { supabase } from '../supabase'
import { useAuth } from '../context/auth-context'

// ── The Vault × Manufacture — soft ──────────────────────────────────────────
const bg      = '#F6F6F3'
const card    = '#FFFFFF'
const accent  = '#274C6B'
const accentHover = '#1E3C56'
const ink     = '#16181B'
const inkSoft = 'rgba(22,24,27,0.55)'
const sans    = "'Inter', system-ui, sans-serif"
const serif   = "'Fraunces', serif"
const red     = '#C0392B'

function focusOn(e)  { e.target.style.outline = `2px solid ${accent}`; e.target.style.outlineOffset = '0' }
function focusOff(e) { e.target.style.outline = 'none' }

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

const labelStyle = {
  display: 'block', marginBottom: 6,
  fontFamily: sans, fontSize: 13, color: inkSoft,
}

const inputStyle = {
  width: '100%', boxSizing: 'border-box',
  background: bg, border: 'none', borderRadius: 16,
  padding: '12px 16px', fontFamily: sans, fontSize: 14, color: ink,
  outline: 'none',
}

export default function CompleteProfile({ onComplete }) {
  const { user } = useAuth()
  const [name, setName] = useState('')
  const [country, setCountry] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()

    const trimmedName = name.trim()
    const trimmedCountry = country.trim()

    if (!trimmedName || !trimmedCountry) {
      setError('Please enter your name and select a country.')
      return
    }

    setLoading(true)
    setError('')

    const { error } = await supabase
      .from('profiles')
      .update({
        name: trimmedName,
        country: trimmedCountry,
      })
      .eq('id', user.id)

    if (error) {
      setError(error.message)
    } else {
      onComplete()
    }

    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh', background: bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
    }}>
      <div style={{
        width: '100%', maxWidth: 480,
        background: card, borderRadius: 22, padding: 32,
        boxShadow: '0 8px 30px rgba(22,24,27,0.08)',
        boxSizing: 'border-box',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontFamily: serif, fontSize: 28, color: ink, marginBottom: 8 }}>
            Complete your profile
          </div>
          <div style={{ fontFamily: sans, fontSize: 14, color: inkSoft }}>
            A few details before you start browsing.
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={labelStyle}>Your name</label>
            <input
              type="text"
              placeholder="e.g. James"
              value={name}
              onChange={e => setName(e.target.value)}
              onFocus={focusOn}
              onBlur={focusOff}
              required
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Country</label>
            <select
              value={country}
              onChange={e => setCountry(e.target.value)}
              onFocus={focusOn}
              onBlur={focusOff}
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
            onMouseEnter={e => { if (!loading) e.currentTarget.style.background = accentHover }}
            onMouseLeave={e => { if (!loading) e.currentTarget.style.background = accent }}
            style={{
              all: 'unset', cursor: loading ? 'default' : 'pointer', boxSizing: 'border-box',
              textAlign: 'center', width: '100%', marginTop: 6,
              background: accent, color: '#fff',
              borderRadius: 99, padding: '14px 28px',
              fontFamily: sans, fontSize: 15, fontWeight: 500,
              opacity: loading ? 0.4 : 1,
              transition: 'background 300ms ease, opacity 300ms ease',
            }}
          >
            {loading ? 'Saving…' : 'Continue'}
          </button>
        </form>

        {error && (
          <div style={{
            marginTop: 14, padding: '10px 14px', borderRadius: 12,
            background: `${red}14`, color: red,
            fontFamily: sans, fontSize: 13,
          }}>
            {error}
          </div>
        )}
      </div>
    </div>
  )
}
