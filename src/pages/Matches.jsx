import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import { useAuth } from '../context/auth-context'

const TIER_LABELS = {
  entry: '3k–6k EUR',
  mid: '6k–12k EUR',
  high: '12k–25k EUR',
  ultra: '25k–50k EUR',
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
    localStorage.setItem('last_seen_matches', new Date().toISOString())
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
    setLoading(false)
  }

  if (loading) return <div style={{ padding: 24, color: '#666' }}>Loading matches…</div>

  if (matches.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: 80, color: '#999' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>⌚</div>
        <p>No matches yet. Keep swiping!</p>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 20px' }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 6 }}>Matches</h1>
      <p style={{ color: '#666', marginBottom: 32 }}>
        {matches.length} match{matches.length !== 1 ? 'es' : ''}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {matches.map(m => (
          <MatchCard key={m.matchId} matchId={m.matchId} profile={m.profile} listing={m.listing} onChat={() => navigate(`/chat/${m.matchId}`)} />
        ))}
      </div>
    </div>
  )
}

function MatchCard({ profile, listing, onChat }) {
  const photo = listing?.photos?.[0]

  return (
    <div style={{
      display: 'flex', background: '#fff',
      border: '1px solid #e5e7eb', borderRadius: 16, overflow: 'hidden',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    }}>
      {/* Photo */}
      <div style={{ width: 148, flexShrink: 0, background: '#f9fafb', position: 'relative' }}>
        {photo ? (
          <img src={photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 148, fontSize: 44 }}>
            ⌚
          </div>
        )}
        {listing?.open_to_topup && (
          <div style={{
            position: 'absolute', bottom: 8, left: 8,
            background: '#111', color: '#fff', borderRadius: 6,
            padding: '2px 8px', fontSize: 11, fontWeight: 600,
          }}>
            + top-up
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ flex: 1, padding: '20px 20px 20px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 17 }}>
            {listing?.brand} {listing?.model}
          </div>
          {listing?.reference && (
            <div style={{ color: '#888', fontSize: 13, marginTop: 2 }}>Ref. {listing.reference}</div>
          )}

          <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            <Tag label="User" value={profile?.name || 'Unknown'} />
            <Tag label="Country" value={profile?.country || '—'} />
            <Tag label="Price" value={TIER_LABELS[listing?.price_tier] || listing?.price_tier || '—'} />
            <Tag label="Geo" value={`${GEO_ICONS[listing?.geo_scope] ?? ''} ${listing?.geo_scope || '—'}`} />
            <Tag label="Top-up" value={listing?.open_to_topup ? 'Yes' : 'No'} />
          </div>
        </div>

        <button
          onClick={onChat}
          style={{
            marginTop: 16, alignSelf: 'flex-start',
            background: '#111', color: '#fff',
            border: 'none', borderRadius: 8,
            padding: '8px 20px', fontSize: 14, fontWeight: 600,
            cursor: 'pointer',
          }}
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
      background: '#f3f4f6', borderRadius: 6,
      padding: '3px 10px', fontSize: 12, color: '#444',
    }}>
      <span style={{ color: '#999' }}>{label}: </span>{value}
    </span>
  )
}
