import { useEffect, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/auth-context'
import { supabase } from '../supabase'

export default function Header() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const [unreadMessages, setUnreadMessages] = useState(0)
  const [matchCount, setMatchCount] = useState(0)

  useEffect(() => {
    if (!user) return
    fetchBadges()
    const interval = setInterval(fetchBadges, 30000)
    return () => clearInterval(interval)
  }, [user, location])

  async function fetchBadges() {
    const { data: matches } = await supabase
      .from('matches')
      .select('id')
      .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
      .eq('status', 'active')

    if (!matches || matches.length === 0) {
      setUnreadMessages(0)
      setMatchCount(0)
      return
    }

    setMatchCount(matches.length)

    const matchIds = matches.map(m => m.id)
    const { data: messages } = await supabase
      .from('messages')
      .select('match_id, created_at, sender_id')
      .in('match_id', matchIds)
      .neq('sender_id', user.id)

    const unread = (messages || []).filter(m => m.sender_id !== user.id).length
    setUnreadMessages(unread)
    console.log('[header] matchCount:', matches.length, 'unreadMessages:', unread)
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 32px',
      height: 60,
      background: '#0A0A12',
      borderBottom: '1px solid #1A1A28',
      flexShrink: 0,
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
        <span style={{
          fontSize: 19, fontWeight: 800, letterSpacing: '-0.5px', color: '#C9A84C',
        }}>
          RefSwap
        </span>
      </Link>

      <nav style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
        <NavLink to="/browse">Browse</NavLink>
        <NavLink to="/my-watch">My Watch</NavLink>
        {matchCount > 0 && <NavLink to="/matches">Matches</NavLink>}
        {unreadMessages > 0 && <NavLink to="/matches">Messages</NavLink>}
        <button
          onClick={handleSignOut}
          style={{
            background: 'transparent',
            border: '1px solid #232333',
            color: '#525265',
            padding: '6px 16px',
            borderRadius: 8,
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 500,
            marginLeft: 12,
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = '#C9A84C'
            e.currentTarget.style.color = '#C9A84C'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = '#232333'
            e.currentTarget.style.color = '#525265'
          }}
        >
          Sign out
        </button>
      </nav>
    </header>
  )
}

function NavLink({ to, children }) {
  return (
    <Link
      to={to}
      style={{
        color: '#646478',
        fontSize: 14,
        fontWeight: 500,
        padding: '6px 14px',
        borderRadius: 8,
        textDecoration: 'none',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.color = '#F0EDE8'
        e.currentTarget.style.background = '#141424'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.color = '#646478'
        e.currentTarget.style.background = 'transparent'
      }}
    >
      {children}
    </Link>
  )
}
