import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../supabase'
import { useBadges } from '../context/badge-context'

// ── The Vault × Manufacture — soft ──────────────────────────────────────────
const card    = '#FFFFFF'
const accent  = '#274C6B'
const accentHover = '#1E3C56'
const ink     = '#16181B'
const inkSoft = 'rgba(22,24,27,0.55)'
const sans    = "'Inter', system-ui, sans-serif"
const serif   = "'Fraunces', serif"
const dotGreen= '#274C6B'
const dotRed  = '#C0392B'

const NAV = [
  { path: '/browse',  label: 'Browse' },
  { path: '/my-watch',label: 'My Watch' },
  { path: '/matches', label: 'Matches',  badge: 'green' },
  { path: '/chat',    label: 'Messages', badge: 'red' },
]

function Logo() {
  return (
    <span style={{
      fontFamily: serif, fontWeight: 500, fontSize: 22, letterSpacing: '.01em',
      color: ink, userSelect: 'none',
    }}>
      RefSwap
    </span>
  )
}

function NavLink({ n, active, dot, onClick }) {
  return (
    <button
      onClick={onClick}
      onMouseEnter={e => { if (!active) e.currentTarget.style.color = ink }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.color = inkSoft }}
      style={{
        all: 'unset', cursor: 'pointer', position: 'relative',
        display: 'inline-flex', alignItems: 'center',
        fontFamily: sans, fontSize: 14, paddingBottom: 8,
        color: active ? ink : inkSoft,
        borderBottom: `2px solid ${active ? accent : 'transparent'}`,
        transition: 'color 300ms ease, border-color 300ms ease',
      }}
    >
      <span style={{ position: 'relative' }}>
        {n.label}
        {dot && (
          <span style={{
            position: 'absolute', top: -2, right: -10,
            width: 7, height: 7, borderRadius: '50%', background: dot,
          }} />
        )}
      </span>
    </button>
  )
}

export default function Header() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { newMatches, unread, firstUnreadMatchId } = useBadges()

  async function handleSignOut() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  function dotFor(badge) {
    if (badge === 'green' && newMatches > 0) return dotGreen
    if (badge === 'red'   && unread > 0)     return dotRed
    return null
  }

  function destFor(nav) {
    if (nav.badge === 'red' && firstUnreadMatchId) return `/chat/${firstUnreadMatchId}`
    return nav.path
  }

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 30,
      background: card,
      boxShadow: '0 2px 16px rgba(22,24,27,0.06)',
    }}>
      <div style={{
        maxWidth: 1180, margin: '0 auto',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 26px', height: 64,
      }}>
        <button onClick={() => navigate('/browse')} style={{ all: 'unset', cursor: 'pointer' }}>
          <Logo />
        </button>

        <nav className="desk-nav" style={{ display: 'flex', gap: 30, alignItems: 'center' }}>
          {NAV.map((n) => (
            <NavLink
              key={n.path}
              n={n}
              active={pathname.startsWith(n.path)}
              dot={dotFor(n.badge)}
              onClick={() => navigate(destFor(n))}
            />
          ))}
        </nav>

        <div className="desk-nav" style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <button
            onClick={() => navigate('/create-listing')}
            onMouseEnter={e => { e.currentTarget.style.background = accentHover }}
            onMouseLeave={e => { e.currentTarget.style.background = accent }}
            style={{
              all: 'unset', cursor: 'pointer',
              fontFamily: sans, fontSize: 14, color: '#fff',
              background: accent, borderRadius: 99, padding: '10px 18px',
              transition: 'background 300ms ease',
            }}
          >+ List a watch</button>
          <span
            onClick={handleSignOut}
            onMouseEnter={e => { e.currentTarget.style.color = ink }}
            onMouseLeave={e => { e.currentTarget.style.color = inkSoft }}
            style={{
              fontFamily: sans, fontSize: 14, color: inkSoft, cursor: 'pointer',
              transition: 'color 300ms ease',
            }}
          >Sign out</span>
        </div>
      </div>
    </header>
  )
}
