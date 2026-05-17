import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/auth-context'
import { supabase } from '../supabase'

export default function Header() {
  const navigate = useNavigate()

  async function handleSignOut() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      height: '56px',
      background: '#111',
      color: '#fff',
    }}>
      <Link to="/" style={{ color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: '1.2rem' }}>
        RefSwap
      </Link>
      <nav style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
        <Link to="/browse" style={{ color: '#fff', textDecoration: 'none' }}>Browse</Link>
        <Link to="/my-watch" style={{ color: '#fff', textDecoration: 'none' }}>My Watch</Link>
        <Link to="/matches" style={{ color: '#fff', textDecoration: 'none' }}>Matches</Link>
        <button
          onClick={handleSignOut}
          style={{
            background: 'transparent',
            border: '1px solid #fff',
            color: '#fff',
            padding: '6px 14px',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Sign Out
        </button>
      </nav>
    </header>
  )
}
