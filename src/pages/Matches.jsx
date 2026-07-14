import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import { useAuth } from '../context/auth-context'
import { useBadges } from '../context/badge-context'
import { unwrap } from '../lib/db'
import { Flag } from '../components/primitives'

// ── The Vault × Manufacture — soft ──────────────────────────────────────────
const card    = '#FFFFFF'
const accent  = '#274C6B'
const ink     = '#16181B'
const inkSoft = 'rgba(22,24,27,0.55)'
const sans    = "'Inter', system-ui, sans-serif"
const serif   = "'Fraunces', serif"

const cardShadow      = '0 8px 30px rgba(22,24,27,0.08)'
const cardShadowHover = '0 14px 36px rgba(22,24,27,0.14)'

function MatchesEmpty() {
  return (
    <div style={{
      marginTop: 32, background: card, borderRadius: 22, boxShadow: cardShadow,
      padding: '64px 24px', textAlign: 'center',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
    }}>
      <span style={{ fontFamily: serif, fontSize: 22, color: ink }}>No matches yet</span>
      <span style={{ fontFamily: sans, fontSize: 13.5, color: inkSoft, maxWidth: 320, lineHeight: 1.5 }}>
        When someone likes your watch back, they'll appear here — and you'll be able to chat and arrange the swap.
      </span>
    </div>
  )
}

function MatchRow({ m, onOpen }) {
  const theirPhoto = m.listing?.photos?.[0]
  const metaParts = [m.listing?.brand, m.listing?.reference].filter(Boolean)
  const meta = [metaParts.join(' · '), timeAgo(m.createdAt)].filter(Boolean).join(' · ')

  return (
    <button
      className="match-row"
      onClick={() => onOpen(m.matchId)}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = cardShadowHover
        e.currentTarget.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = cardShadow
        e.currentTarget.style.transform = 'translateY(0)'
      }}
      style={{
        all: 'unset', cursor: 'pointer', boxSizing: 'border-box',
        display: 'flex', alignItems: 'center', gap: 18, width: '100%',
        background: card, borderRadius: 22, padding: '16px 20px',
        boxShadow: cardShadow, transition: 'box-shadow 300ms ease, transform 300ms ease',
      }}
    >
      <div style={{ width: 64, height: 64, borderRadius: 16, overflow: 'hidden', flexShrink: 0, background: theirPhoto ? card : accent }}>
        {theirPhoto && <img src={theirPhoto} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
      </div>

      <div style={{ flex: 1, minWidth: 0, textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontFamily: sans, fontSize: 15, fontWeight: 500, color: ink }}>
            {m.profile?.name || 'Unknown'}
          </span>
          <Flag code={m.profile?.country} />
          {m.unseen && <span style={{ width: 8, height: 8, borderRadius: '50%', background: accent, flexShrink: 0 }} />}
        </div>
        <span style={{
          fontFamily: serif, fontSize: 18, color: ink,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {m.listing?.model || 'Their watch'}
        </span>
        <span style={{ fontFamily: sans, fontSize: 13, color: inkSoft, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {meta}
        </span>
      </div>

      <span className="match-cta" style={{
        flexShrink: 0, fontFamily: sans, fontSize: 13, color: ink,
        border: '1px solid rgba(22,24,27,0.15)', borderRadius: 99, padding: '9px 16px',
        whiteSpace: 'nowrap', transition: 'all 300ms ease',
      }}>Open chat →</span>
    </button>
  )
}

export default function Matches() {
  const { user }  = useAuth()
  const navigate  = useNavigate()
  const { refresh: refreshBadges } = useBadges()
  const [matches, setMatches] = useState([])
  const [myListing, setMyListing] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchMatches() }, [user.id])

  useEffect(() => {
    async function markMatchesSeen() {
      const { error } = await supabase.rpc('touch_matches_seen')
      if (error) {
        console.error('[Matches: mark seen]', error)
        return
      }
      refreshBadges()
    }
    markMatchesSeen()
  }, [user.id])

  async function fetchMatches() {
    const [matchesResult, myListingResult] = await Promise.all([
      supabase.from('matches').select('*')
        .or(`user_a.eq.${user.id},user_b.eq.${user.id}`).eq('status', 'active'),
      supabase.from('listings').select('id, brand, model, reference, photos')
        .eq('user_id', user.id).eq('is_active', true).single(),
    ])
    const rawMatches = unwrap(matchesResult, 'Matches: fetch matches')
    const mine       = unwrap(myListingResult, 'Matches: fetch my listing')
    setMyListing(mine)

    if (!rawMatches || rawMatches.length === 0) { setMatches([]); setLoading(false); return }

    const otherUserIds    = rawMatches.map(m => m.user_a === user.id ? m.user_b    : m.user_a)
    const otherListingIds = rawMatches.map(m => m.user_a === user.id ? m.listing_b : m.listing_a)

    const [profilesResult, listingsResult] = await Promise.all([
      supabase.from('profiles').select('id, name, country').in('id', otherUserIds),
      supabase.from('listings').select('id, brand, model, reference, photos').in('id', otherListingIds),
    ])
    const profiles = unwrap(profilesResult, 'Matches: fetch matched profiles')
    const listings = unwrap(listingsResult, 'Matches: fetch matched listings')

    const profileMap = Object.fromEntries((profiles || []).map(p => [p.id, p]))
    const listingMap = Object.fromEntries((listings || []).map(l => [l.id, l]))

    // Fetch last message per match to detect unseen
    const matchIds = rawMatches.map(m => m.id)
    const lastMsgs = unwrap(
      await supabase.from('messages').select('match_id, sender_id, created_at')
        .in('match_id', matchIds).order('created_at', { ascending: false }),
      'Matches: fetch last messages'
    )

    const lastMsgMap = {}
    for (const msg of lastMsgs || []) {
      if (!lastMsgMap[msg.match_id]) lastMsgMap[msg.match_id] = msg
    }

    const lastSeenTs = localStorage.getItem('lastSeenMatches') || '0'

    setMatches(rawMatches.map(m => {
      const otherId      = m.user_a === user.id ? m.user_b    : m.user_a
      const otherListId  = m.user_a === user.id ? m.listing_b : m.listing_a
      const lastMsg      = lastMsgMap[m.id]
      const unseen       = lastMsg
        ? lastMsg.sender_id !== user.id && lastMsg.created_at > lastSeenTs
        : new Date(m.created_at) > new Date(lastSeenTs)
      return {
        matchId:   m.id,
        createdAt: m.created_at,
        profile:   profileMap[otherId]    || null,
        listing:   listingMap[otherListId]|| null,
        lastMsg,
        unseen,
      }
    }))
    setLoading(false)
  }

  function openChat(matchId) {
    localStorage.setItem('lastSeenMatches', new Date().toISOString())
    navigate(`/chat/${matchId}`)
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: inkSoft, fontFamily: sans, fontSize: 14 }}>
      Loading matches…
    </div>
  )

  const newCount = matches.filter(m => m.unseen).length

  return (
    <div style={{ maxWidth: 1180, margin: '0 auto', padding: '26px 26px 40px' }}>
      {/* page head */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <h1 style={{ margin: 0, fontFamily: serif, fontWeight: 600, fontSize: 34, color: ink }}>
            Matches
          </h1>
          <span style={{ fontFamily: sans, fontSize: 13, color: inkSoft }}>
            Mutual likes. Identity revealed — now you can talk.
          </span>
        </div>
        {newCount > 0 && (
          <span style={{
            fontFamily: sans, fontSize: 12, fontWeight: 600, color: '#fff',
            background: accent, borderRadius: 999, padding: '5px 12px',
          }}>{newCount} new</span>
        )}
      </div>

      {matches.length === 0 ? <MatchesEmpty /> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 24 }}>
          {matches.map(m => <MatchRow key={m.matchId} m={m} onOpen={openChat} />)}
        </div>
      )}
    </div>
  )
}

function timeAgo(ts) {
  if (!ts) return ''
  const diff = Date.now() - new Date(ts).getTime()
  const h = Math.floor(diff / 3600000)
  if (h < 1)  return 'just now'
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  if (d === 1) return 'Yesterday'
  return `${d} days ago`
}
