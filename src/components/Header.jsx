import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../supabase'
import { useBadges } from '../context/badge-context'

const gold   = '#A9823F'
const ink    = '#1C1B19'
const ink2   = '#6E6A62'
const ink3   = '#A6A199'
const stroke = '#E2DED6'
const green  = '#3F9D6E'
const red    = '#D24B4B'
const serif  = "'Cormorant Garamond', serif"
const sans   = "'Inter', system-ui, sans-serif"

const NAV = [
  { path: '/browse',  label: 'Browse' },
  { path: '/my-watch',label: 'My Watch' },
  { path: '/matches', label: 'Matches',  badge: 'green' },
  { path: '/chat',    label: 'Messages', badge: 'red' },
]

function Logo() {
  return (
    <span style={{
      fontFamily: serif, fontWeight: 600, fontSize: 22, letterSpacing: '.01em',
      color: ink, display: 'inline-flex', alignItems: 'baseline', userSelect: 'none',
    }}>
      Ref<span style={{ color: gold }}>Swap</span>
    </span>
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
    if (badge === 'green' && newMatches > 0) return green
    if (badge === 'red'   && unread > 0)     return red
    return null
  }

  function destFor(nav) {
    if (nav.badge === 'red' && firstUnreadMatchId) return `/chat/${firstUnreadMatchId}`
    return nav.path
  }

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 30,
      background: 'rgba(251,250,248,.86)',
      backdropFilter: 'blur(10px)',
      borderBottom: `1px solid ${stroke}`,
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
          {NAV.map((n) => {
            const active = pathname.startsWith(n.path)
            const dot = dotFor(n.badge)
            return (
              <button key={n.path} onClick={() => navigate(destFor(n))} style={{
                all: 'unset', cursor: 'pointer', position: 'relative',
                display: 'inline-flex', alignItems: 'center', gap: 6,
                fontFamily: sans, fontSize: 13.5, paddingBottom: 4,
                color: active ? ink : ink2,
                borderBottom: `1.5px solid ${active ? gold : 'transparent'}`,
                transition: 'color .15s',
              }}>
                {n.label}
                {dot && <span style={{ width: 7, height: 7, borderRadius: '50%', background: dot }} />}
              </button>
            )
          })}
        </nav>

        <div className="desk-nav" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button onClick={() => navigate('/create-listing')} style={{
            all: 'unset', cursor: 'pointer',
            fontFamily: sans, fontSize: 12.5, color: gold,
            border: `1px solid ${gold}66`, borderRadius: 6, padding: '7px 13px',
          }}>+ List a watch</button>
          <span onClick={handleSignOut} style={{
            fontFamily: sans, fontSize: 12.5, color: ink3, cursor: 'pointer',
          }}>Sign out</span>
        </div>
      </div>
    </header>
  )
}
