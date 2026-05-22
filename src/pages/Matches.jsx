import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import { useAuth } from '../context/auth-context'

const TIER_CONFIG = {
  entry: { label: '3k–6k EUR', color: '#7A7A9A', bg: 'rgba(122,122,154,0.12)' },
  mid:   { label: '6k–12k EUR', color: '#5A8FAA', bg: 'rgba(90,143,170,0.12)' },
  high:  { label: '12k–25k EUR', color: '#9A7ABB', bg: 'rgba(154,122,187,0.12)' },
  ultra: { label: '25k–50k EUR', color: '#C9A84C', bg: 'rgba(201,168,76,0.12)' },
}

const GEO_ICONS = {
  local: '📍',
  europe: '🇪🇺',
  global: '🌍',
}

export default function Matches() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMatches()
  }, [user.id])

  async function fetchMatches() {
    const { data: rawMatches } = await supabase
      .from('matches')
      .select('*')
      .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
      .eq('status', 'active')

    if (!rawMatches || rawMatches.length === 0) {
      setMatches([])
      localStorage.setItem('lastSeenMatchesCount', '0')
      setLoading(false)
      return
    }

    const otherUserIds = rawMatches.map(m =>
      m.user_a === user.id ? m.user_b : m.user_a
    )
    const otherListingIds = rawMatches.map(m =>
      m.user_a === user.id ? m.listing_b : m.listing_a
    )

    const [{ data: profiles }, { data: listings }] = await Promise.all([
      supabase.from('profiles').select('id, name, country').in('id', otherUserIds),
      supabase.from('listings').select('id, brand, model, reference, price_tier, geo_scope, open_to_topup, photos').in('id', otherListingIds),
    ])

    const profileMap = Object.fromEntries((profiles || []).map(p => [p.id, p]))
    const listingMap = Object.fromEntries((listings || []).map(l => [l.id, l]))

    setMatches(rawMatches.map(m => {
      const otherId = m.user_a === user.id ? m.user_b : m.user_a
      const otherListingId = m.user_a === user.id ? m.listing_b : m.listing_a
      return {
        matchId: m.id,
        profile: profileMap[otherId] || null,
        listing: listingMap[otherListingId] || null,
      }
    }))
    localStorage.setItem('lastSeenMatchesCount', String(rawMatches.length))
    setLoading(false)
  }

  if (loading) return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: 'calc(100vh - 60px)', color: '#353545', fontSize: 14,
    }}>
      Loading matches…
    </div>
  )

  if (matches.length === 0) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        height: 'calc(100vh - 60px)', gap: 12,
      }}>
        <div style={{ fontSize: 40, opacity: 0.2 }}>⌚</div>
        <p style={{ color: '#353548', fontSize: 14 }}>No matches yet. Keep browsing.</p>
        <button
          onClick={() => navigate('/browse')}
          style={{
            marginTop: 8, background: 'transparent',
            border: '1px solid #252535', borderRadius: 8,
            padding: '8px 20px', fontSize: 13, fontWeight: 500,
            color: '#525265', cursor: 'pointer',
          }}
        >
          Browse watches
        </button>
      </div>
    )
  }

  return (
    <div style={{ background: '#0B0B14', minHeight: 'calc(100vh - 60px)' }}>
      <div style={{ maxWidth: 820, margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#F0EDE8' }}>Matches</h1>
          <p style={{ color: '#353548', fontSize: 13, marginTop: 4 }}>
            {matches.length} active {matches.length === 1 ? 'match' : 'matches'}
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {matches.map(m => (
            <MatchCard
              key={m.matchId}
              matchId={m.matchId}
              profile={m.profile}
              listing={m.listing}
              onChat={() => navigate(`/chat/${m.matchId}`)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function MatchCard({ profile, listing, onChat }) {
  const photo = listing?.photos?.[0]
  const tier = TIER_CONFIG[listing?.price_tier]

  return (
    <div style={{
      display: 'flex',
      background: '#111120',
      border: '1px solid #1A1A28',
      borderRadius: 16,
      overflow: 'hidden',
      transition: 'border-color 0.2s',
    }}
      onMouseEnter={e => e.currentTarget.style.borderColor = '#2A2A3C'}
      onMouseLeave={e => e.currentTarget.style.borderColor = '#1A1A28'}
    >
      {/* Photo */}
      <div style={{ width: 140, flexShrink: 0, background: '#0D0D1A', position: 'relative' }}>
        {photo ? (
          <img src={photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        ) : (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            height: '100%', minHeight: 140, fontSize: 36, opacity: 0.15,
          }}>
            ⌚
          </div>
        )}
        {listing?.open_to_topup && (
          <div style={{
            position: 'absolute', bottom: 8, left: 8,
            background: 'rgba(201,168,76,0.9)', color: '#0B0A07',
            borderRadius: 5, padding: '2px 8px',
            fontSize: 9, fontWeight: 700, letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}>
            + Top-up
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{
        flex: 1, padding: '20px 22px',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{
            display: 'flex', alignItems: 'flex-start',
            justifyContent: 'space-between', gap: 8, marginBottom: 4,
          }}>
            <div style={{ fontWeight: 700, fontSize: 16, color: '#F0EDE8' }}>
              {listing?.brand} {listing?.model}
            </div>
            {tier && (
              <span style={{
                fontSize: 9, fontWeight: 700, color: tier.color,
                background: tier.bg, borderRadius: 5,
                padding: '3px 7px', letterSpacing: '0.04em',
                textTransform: 'uppercase', whiteSpace: 'nowrap', flexShrink: 0,
              }}>
                {tier.label}
              </span>
            )}
          </div>
          {listing?.reference && (
            <div style={{ color: '#353548', fontSize: 12, marginBottom: 14 }}>
              Ref. {listing.reference}
            </div>
          )}

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            <Tag label="User" value={profile?.name || 'Unknown'} />
            <Tag label="Country" value={profile?.country || '—'} />
            {listing?.geo_scope && (
              <Tag label="Geo" value={`${GEO_ICONS[listing.geo_scope] ?? ''} ${listing.geo_scope}`} />
            )}
          </div>
        </div>

        <button
          onClick={onChat}
          style={{
            marginTop: 16, alignSelf: 'flex-start',
            background: '#C9A84C', color: '#0B0A07',
            border: 'none', borderRadius: 8,
            padding: '8px 20px', fontSize: 13, fontWeight: 700,
            cursor: 'pointer', letterSpacing: '0.02em',
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#E8C96A'}
          onMouseLeave={e => e.currentTarget.style.background = '#C9A84C'}
        >
          Open Chat
        </button>
      </div>
    </div>
  )
}

function Tag({ label, value }) {
  return (
    <span style={{
      background: '#161624',
      border: '1px solid #1E1E2C',
      borderRadius: 6,
      padding: '3px 10px', fontSize: 12, color: '#525265',
    }}>
      <span style={{ color: '#2A2A3A' }}>{label}: </span>{value}
    </span>
  )
}
