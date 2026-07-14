import { useNavigate, useLocation } from 'react-router-dom'
import { useBadges } from '../context/badge-context'

// ── The Vault × Manufacture — soft ──────────────────────────────────────────
const card    = '#FFFFFF'
const accent  = '#274C6B'
const inkSoft = 'rgba(22,24,27,0.55)'
const sans    = "'Inter', system-ui, sans-serif"
const dotGreen= '#274C6B'
const dotRed  = '#C0392B'

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
      background: card,
      boxShadow: '0 -2px 16px rgba(22,24,27,0.06)',
      padding: '4px 0 calc(4px + env(safe-area-inset-bottom))',
      flexDirection: 'row',
    }}>
      {TABS.map((t) => {
        const active = pathname.startsWith(t.path)
        const dot = t.badge === 'green' && newMatches > 0 ? dotGreen
                  : t.badge === 'red'   && unread > 0     ? dotRed
                  : null
        const dest = t.badge === 'red' && firstUnreadMatchId
          ? `/chat/${firstUnreadMatchId}`
          : t.path
        const color = active ? accent : inkSoft

        return (
          <button key={t.path} onClick={() => navigate(dest)} style={{
            all: 'unset', cursor: 'pointer', flex: 1, boxSizing: 'border-box',
            minHeight: 44, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 3,
          }}>
            <span style={{ fontSize: 18, color, position: 'relative', lineHeight: 1, transition: 'color 300ms ease' }}>
              {t.glyph}
              {dot && (
                <span style={{
                  position: 'absolute', top: -2, right: -7,
                  width: 7, height: 7, borderRadius: '50%', background: dot,
                }} />
              )}
            </span>
            <span style={{ fontFamily: sans, fontSize: 11, color, transition: 'color 300ms ease' }}>
              {t.label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
