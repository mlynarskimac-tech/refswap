import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import { useAuth } from '../context/auth-context'
import { unwrap } from '../lib/db'
import { PhotoBox, Flag } from '../components/primitives'

const gold    = '#A9823F'
const ink     = '#1C1B19'
const ink2    = '#6E6A62'
const ink3    = '#A6A199'
const stroke  = '#E2DED6'
const strokeMd= '#D4CFC5'
const surface = '#FFFFFF'
const bg      = '#FBFAF8'
const green   = '#3F9D6E'
const sans    = "'Inter', system-ui, sans-serif"
const serif   = "'Cormorant Garamond', serif"
const mono    = "'Spline Sans Mono', ui-monospace, monospace"

function MatchesEmpty() {
  return (
    <div style={{
      marginTop: 40, border: `1px dashed ${strokeMd}`, borderRadius: 16,
      padding: '60px 24px', textAlign: 'center',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
    }}>
      <span style={{ fontSize: 40, color: ink3 }}>⌚</span>
      <span style={{ fontFamily: serif, fontSize: 24, color: ink }}>No matches yet</span>
      <span style={{ fontFamily: sans, fontSize: 13.5, color: ink3, maxWidth: 320, lineHeight: 1.5 }}>
        When someone likes your watch back, they'll appear here — and you'll be able to chat and arrange the swap.
      </span>
    </div>
  )
}

export default function Matches() {
  const { user }  = useAuth()
  const navigate  = useNavigate()
  const [matches, setMatches] = useState([])
  const [myListing, setMyListing] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchMatches() }, [user.id])

  async function fetchMatches() {
    const [matchesResult, myListingResult] = await Promise.all([
      supabase.from('matches').select('*')
        .or(`user_a.eq.${user.id},user_b.eq.${user.id}`).eq('status', 'active'),
      supabase.from('listings').select('id, brand, model, photos')
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
      supabase.from('listings').select('id, brand, model, photos').in('id', otherListingIds),
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
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: ink3, fontFamily: sans, fontSize: 14 }}>
      Loading matches…
    </div>
  )

  const newCount = matches.filter(m => m.unseen).length

  return (
    <div style={{ maxWidth: 1180, margin: '0 auto', padding: '26px 26px 40px' }}>
      {/* page head */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <h1 style={{ margin: 0, fontFamily: serif, fontWeight: 600, fontSize: 32, color: ink, lineHeight: 1 }}>
            Matches
          </h1>
          <span style={{ fontFamily: sans, fontSize: 13, color: ink3 }}>
            Mutual likes. Identity revealed — now you can talk.
          </span>
        </div>
        {newCount > 0 && (
          <span style={{
            fontFamily: sans, fontSize: 12, color: '#fff',
            background: green, borderRadius: 999, padding: '5px 12px', fontWeight: 600,
          }}>{newCount} new</span>
        )}
      </div>

      {matches.length === 0 ? <MatchesEmpty /> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 24 }}>
          {matches.map(m => {
            const theirPhoto = m.listing?.photos?.[0]
            const myPhoto    = myListing?.photos?.[0]
            return (
              <button key={m.matchId} onClick={() => openChat(m.matchId)} style={{
                all: 'unset', cursor: 'pointer', boxSizing: 'border-box',
                display: 'flex', alignItems: 'center', gap: 18, width: '100%',
                background: surface,
                border: `1px solid ${m.unseen ? green + '66' : stroke}`,
                borderRadius: 12, padding: 14,
                boxShadow: '0 8px 22px -18px rgba(0,0,0,.4)',
                transition: 'border-color .15s, box-shadow .15s',
              }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 28px -14px rgba(0,0,0,.2)' }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 8px 22px -18px rgba(0,0,0,.4)' }}
              >
                {/* both watches */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                  <PhotoBox h={58} w={74} r={8} src={myPhoto} />
                  <span style={{ color: gold, fontSize: 18 }}>⇄</span>
                  <PhotoBox h={58} w={74} r={8} src={theirPhoto} />
                </div>

                {/* info */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                    <span style={{ fontFamily: sans, fontSize: 15.5, fontWeight: 600, color: ink }}>
                      {m.profile?.name || 'Unknown'}
                    </span>
                    <Flag code={m.profile?.country} />
                    {m.unseen && <span style={{ width: 8, height: 8, borderRadius: '50%', background: green, flexShrink: 0 }} />}
                  </div>
                  <span style={{ fontFamily: sans, fontSize: 12, color: ink3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {m.listing?.model || 'Their watch'} ⇄ your {myListing?.model || 'watch'} · {timeAgo(m.createdAt)}
                  </span>
                </div>

                <span className="match-cta" style={{
                  fontFamily: sans, fontSize: 13, color: gold,
                  border: `1px solid ${gold}66`, borderRadius: 8, padding: '9px 15px', whiteSpace: 'nowrap',
                }}>Open chat →</span>
              </button>
            )
          })}
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
