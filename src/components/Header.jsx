import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/auth-context'
import { supabase } from '../supabase'

export default function Header() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [unreadMessages, setUnreadMessages] = useState(0)
  const [newMatches, setNewMatches] = useState(0)

  useEffect(() => {
    if (!user) return
    fetchBadges()
    const interval = setInterval(fetchBadges, 30000)
    return () => clearInterval(interval)
  }, [user])

  async function fetchBadges() {
    const { data: matches } = await supabase
      .from('matches')
      .select('id, created_at')
      .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
      .eq('status', 'active')

    if (!matches || matches.length === 0) {
      setUnreadMessages(0)
      setNewMatches(0)
      return
    }

    const lastSeenMatches = localStorage.getItem('last_seen_matches') || new Date(0).toISOString()
    setNewMatches(matches.filter(m => m.created_at > lastSeenMatches).length)

    const matchIds = matches.map(m => m.id)
    const { data: messages } = await supabase
      .from('messages')
      .select('match_id, created_at, sender_id')
      .in('match_id', matchIds)
      .neq('sender_id', user.id)

    let unread = 0
    for (const msg of messages || []) {
      const lastSeen = localStorage.getItem(`seen_chat_${msg.match_id}`) || new Date(0).toISOString()
      if (msg.created_at > lastSeen) unread++
    }
    setUnreadMessages(unread)
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
        <Link to="/matches" style={{ color: '#fff', textDecoration: 'none', position: 'relative' }}>
          Matches
          {unreadMessages > 0 && (
            <Badge count={unreadMessages} color="#ef4444" offsetRight={-20} />
          )}
          {newMatches > 0 && (
            <Badge count={newMatches} color="#22c55e" offsetRight={unreadMessages > 0 ? -38 : -20} />
          )}
        </Link>
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

function Badge({ count, color, offsetRight }) {
  return (
    <span style={{
      position: 'absolute',
      top: -8,
      right: offsetRight,
      background: color,
      color: '#fff',
      borderRadius: '999px',
      fontSize: 10,
      fontWeight: 700,
      minWidth: 16,
      height: 16,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0 4px',
      lineHeight: 1,
    }}>
      {count > 99 ? '99+' : count}
    </span>
  )
}
