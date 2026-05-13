import { useState } from 'react'
import { supabase } from '../supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isRegister, setIsRegister] = useState(false)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    if (isRegister) {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setMessage(error.message)
      else setMessage('Check your email — we sent you a confirmation link.')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setMessage(error.message)
    }

    setLoading(false)
  }

  return (
    <div style={{ maxWidth: 400, margin: '100px auto', padding: 24 }}>
      <h1>RefSwap</h1>
      <h2>{isRegister ? 'Sign up' : 'Sign in'}</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          style={{ display: 'block', width: '100%', marginBottom: 12, padding: 8 }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          style={{ display: 'block', width: '100%', marginBottom: 12, padding: 8 }}
        />
        <button type="submit" disabled={loading} style={{ width: '100%', padding: 10 }}>
          {loading ? 'Loading...' : isRegister ? 'Sign up' : 'Sign in'}
        </button>
      </form>
      {message && <p style={{ marginTop: 16 }}>{message}</p>}
      <p style={{ marginTop: 24 }}>
        {isRegister ? 'Already have an account? ' : "Don't have an account? "}
        <button onClick={() => setIsRegister(!isRegister)} style={{ background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
          {isRegister ? 'Sign in' : 'Sign up'}
        </button>
      </p>
    </div>
  )
}