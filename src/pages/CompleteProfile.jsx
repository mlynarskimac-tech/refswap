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
    <div style={{ maxWidth: 400, margin: '100px auto', padding: 24 }}>
      <h1>RefSwap</h1>
      <h2>Complete your profile</h2>
      <p>Just a few details before you start.</p>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={e => setName(e.target.value)}
          required
          style={{ display: 'block', width: '100%', marginBottom: 12, padding: 8 }}
        />
        <select
          value={country}
          onChange={e => setCountry(e.target.value)}
          required
          style={{ display: 'block', width: '100%', marginBottom: 12, padding: 8 }}
        >
          <option value="">Select country</option>
          {COUNTRIES.map(c => (
            <option key={c.code} value={c.code}>{c.name}</option>
          ))}
        </select>
        <button type="submit" disabled={loading} style={{ width: '100%', padding: 10 }}>
          {loading ? 'Saving...' : 'Continue'}
        </button>
      </form>
      {error && <p style={{ color: 'red', marginTop: 16 }}>{error}</p>}
    </div>
  )
}