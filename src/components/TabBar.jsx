import { useNavigate, useLocation } from 'react-router-dom'
import { useBadges } from '../context/badge-context'

const gold  = '#A9823F'
const ink2  = '#6E6A62'
const ink3  = '#A6A199'
const green = '#3F9D6E'
const red   = '#D24B4B'
const stroke = '#E2DED6'

const TABS = [
  { path: '/browse',  label: 'Browse',   glyph: '◳' },
  { path: '/my-watch',label: 'My Watch', glyph: '⌚' },
  { path: '/matches', label: 'Matches',  glyph: '⇄', badge: 'green' },
  { path: '/chat',    label: 'Messages', glyph: '✉', badge: 'red' },
]

export default function TabBar() {
  const navigate  = useNavigate()
  const { pathname } = useLocation()
  const { newMatches, unread, firstUnreadMatchId } = useBadges()

  return (
    <nav className="tab-bar" style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 40,
      display: 'none',
      background: 'rgba(251,250,248,.94)', backdropFilter: 'blur(10px)',
      borderTop: `1px solid ${stroke}`,
      padding: '8px 0 calc(8px + env(safe-area-inset-bottom))',
      flexDirection: 'row',
    }}>
      {TABS.map((t) => {
        const active = pathname.startsWith(t.path)
        const dot = t.badge === 'green' && newMatches > 0 ? green
                  : t.badge === 'red'   && unread > 0     ? red
                  : null
        const dest = t.badge === 'red' && firstUnreadMatchId
          ? `/chat/${firstUnreadMatchId}`
          : t.path

        return (
          <button key={t.path} onClick={() => navigate(dest)} style={{
            all: 'unset', cursor: 'pointer', flex: 1,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
          }}>
            <span style={{ fontSize: 18, color: active ? gold : ink2, position: 'relative', lineHeight: 1 }}>
              {t.glyph}
              {dot && (
                <span style={{
                  position: 'absolute', top: -2, right: -7,
                  width: 6, height: 6, borderRadius: '50%', background: dot,
                }} />
              )}
            </span>
            <span style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: 10, color: active ? gold : ink3 }}>
              {t.label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
