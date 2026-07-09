import { useEffect, useRef, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import { useAuth } from '../context/auth-context'
import { useToast } from '../context/toast-context'
import { useBadges } from '../context/badge-context'
import { unwrap } from '../lib/db'
import { PhotoBox } from '../components/primitives'
import ReportModal from '../components/ReportModal'

const gold    = '#A9823F'
const goldSoft= '#EFE3CC'
const ink     = '#1C1B19'
const ink2    = '#6E6A62'
const ink3    = '#A6A199'
const stroke  = '#E2DED6'
const surface = '#FFFFFF'
const surface2= '#F0EEE9'
const bg      = '#FBFAF8'
const green   = '#3F9D6E'
const red     = '#D24B4B'
const serif   = "'Cormorant Garamond', serif"
const sans    = "'Inter', system-ui, sans-serif"
const mono    = "'Spline Sans Mono', ui-monospace, monospace"

function MatchesEmpty() {
  return (
    <div style={{
      marginTop: 40, border: `1px dashed #D4CFC5`, borderRadius: 16,
      padding: '60px 24px', textAlign: 'center',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
    }}>
      <span style={{ fontSize: 40, color: ink3 }}>⌚</span>
      <span style={{ fontFamily: serif, fontSize: 24, color: ink }}>No messages yet</span>
      <span style={{ fontFamily: sans, fontSize: 13.5, color: ink3, maxWidth: 320, lineHeight: 1.5 }}>
        When you match with someone, your conversation will appear here.
      </span>
    </div>
  )
}

export default function Chat() {
  const { matchId } = useParams()
  const { user }    = useAuth()
  const navigate    = useNavigate()
  const { flash }   = useToast()
  const { refresh: refreshBadges } = useBadges()

  const [matches,     setMatches]     = useState([])
  const [activeMatch, setActiveMatch] = useState(null)
  const [messages,    setMessages]    = useState([])
  const [myListing,   setMyListing]   = useState(null)
  const [text,        setText]        = useState('')
  const [loading,     setLoading]     = useState(true)
  const [reportOpen,  setReportOpen]  = useState(false)
  const bottomRef = useRef(null)
  const lastMarkedMsgIdRef = useRef(null)

  // Load all matches + my listing once
  useEffect(() => {
    loadAll()
  }, [user.id])

  // When matchId param changes, switch active
  useEffect(() => {
    if (matches.length === 0) return
    const target = matchId
      ? matches.find(m => m.matchId === matchId)
      : matches[0]
    if (target) setActiveMatch(target)
  }, [matchId, matches])

  // Poll messages for active match
  useEffect(() => {
    if (!activeMatch) return
    fetchMessages(activeMatch.matchId)
    markAsRead(activeMatch.matchId)
    const id = setInterval(async () => {
      const msgs = await fetchMessages(activeMatch.matchId)
      const latestOther = msgs.filter(msg => msg.sender_id !== user.id).slice(-1)[0]
      if (latestOther && latestOther.id !== lastMarkedMsgIdRef.current) {
        await markAsRead(activeMatch.matchId)
        lastMarkedMsgIdRef.current = latestOther.id
      }
    }, 3000)
    return () => clearInterval(id)
  }, [activeMatch?.matchId])

  // Re-mark as read when the tab becomes visible again
  useEffect(() => {
    function handleVisibilityChange() {
      if (document.visibilityState === 'visible' && activeMatch) {
        markAsRead(activeMatch.matchId)
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [activeMatch?.matchId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function loadAll() {
    const [matchesResult, myListingResult] = await Promise.all([
      supabase.from('matches').select('*')
        .or(`user_a.eq.${user.id},user_b.eq.${user.id}`).eq('status', 'active')
        .order('created_at', { ascending: false }),
      supabase.from('listings').select('id, brand, model, photos')
        .eq('user_id', user.id).eq('is_active', true).maybeSingle(),
    ])
    const rawMatches = unwrap(matchesResult, 'Chat: fetch matches')
    const mine       = unwrap(myListingResult, 'Chat: fetch my listing')
    setMyListing(mine)

    if (!rawMatches || rawMatches.length === 0) { setLoading(false); return }

    const otherUserIds    = rawMatches.map(m => m.user_a === user.id ? m.user_b    : m.user_a)
    const otherListingIds = rawMatches.map(m => m.user_a === user.id ? m.listing_b : m.listing_a)

    const [profilesResult, listingsResult] = await Promise.all([
      supabase.from('profiles').select('id, name, country').in('id', otherUserIds),
      supabase.from('listings').select('id, brand, model, photos').in('id', otherListingIds),
    ])
    const profiles = unwrap(profilesResult, 'Chat: fetch matched profiles')
    const listings = unwrap(listingsResult, 'Chat: fetch matched listings')

    const profileMap = Object.fromEntries((profiles || []).map(p => [p.id, p]))
    const listingMap = Object.fromEntries((listings || []).map(l => [l.id, l]))

    const enriched = rawMatches.map(m => {
      const otherId     = m.user_a === user.id ? m.user_b    : m.user_a
      const otherListId = m.user_a === user.id ? m.listing_b : m.listing_a
      return {
        matchId:    m.id,
        status:     m.status,
        createdAt:  m.created_at,
        profile:    profileMap[otherId]    || null,
        listing:    listingMap[otherListId]|| null,
        userId:     otherId,
        listingId:  otherListId,
      }
    })
    setMatches(enriched)

    const target = matchId
      ? enriched.find(m => m.matchId === matchId)
      : enriched[0]
    if (target) {
      setActiveMatch(target)
      await fetchMessages(target.matchId)
    }
    setLoading(false)
  }

  async function fetchMessages(mid) {
    const msgs = unwrap(
      await supabase.from('messages').select('*').eq('match_id', mid)
        .order('created_at', { ascending: true }),
      'Chat: fetch messages'
    )
    setMessages(msgs || [])
    return msgs || []
  }

  async function markAsRead(matchId) {
    if (document.visibilityState !== 'visible') return
    const { error } = await supabase.rpc('mark_match_read', { p_match_id: matchId })
    if (error) {
      console.error('[Chat: mark as read]', error)
      return
    }
    refreshBadges()
  }

  function selectMatch(m) {
    setActiveMatch(m)
    setMessages([])
    navigate(`/chat/${m.matchId}`, { replace: true })
  }

  async function handleSend(e) {
    if (e) e.preventDefault()
    const content = text.trim()
    if (!content || !activeMatch) return
    setText('')
    const { error } = await supabase.from('messages').insert({
      match_id: activeMatch.matchId, sender_id: user.id, content,
    })
    if (!error) {
      await fetchMessages(activeMatch.matchId)
    } else {
      console.error('[Chat: send message]', error)
      flash("Message couldn't be sent — try again.")
      setText(content)
    }
  }

  async function handleSubmitReport(reason) {
    if (!activeMatch) return false
    const { error } = await supabase.from('reports').insert({
      reporter_id: user.id,
      reported_user_id: activeMatch.userId,
      reported_listing_id: activeMatch.listingId,
      reason,
    })
    if (error) {
      console.error('[Chat: submit report]', error)
      flash("Couldn't submit report — try again.")
      return false
    }
    flash("Thanks, we'll review within 48h.")
    return true
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: ink3, fontFamily: sans, fontSize: 14 }}>
      Loading…
    </div>
  )

  if (matches.length === 0) {
    return (
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '26px 26px 40px' }}>
        <h1 style={{ fontFamily: serif, fontWeight: 600, fontSize: 32, color: ink, margin: '0 0 24px' }}>Messages</h1>
        <MatchesEmpty />
      </div>
    )
  }

  const m = activeMatch

  return (
    <div className="chat-wrap" style={{
      maxWidth: 1180, margin: '0 auto', padding: '20px 26px 30px',
      display: 'grid', gridTemplateColumns: '260px 1fr', gap: 20, alignItems: 'start',
    }}>
      {/* Conversation list */}
      <div className="chat-list" style={{
        background: surface, border: `1px solid ${stroke}`, borderRadius: 12, overflow: 'hidden',
      }}>
        <div style={{ padding: '13px 16px', borderBottom: `1px solid ${stroke}`, fontFamily: serif, fontSize: 18, color: ink }}>
          Messages
        </div>
        {matches.map(c => {
          const active = m && c.matchId === m.matchId
          return (
            <button key={c.matchId} onClick={() => selectMatch(c)} style={{
              all: 'unset', cursor: 'pointer', boxSizing: 'border-box',
              display: 'flex', gap: 10, alignItems: 'center', width: '100%',
              padding: '12px 16px', borderBottom: `1px solid ${stroke}`,
              background: active ? surface2 : 'transparent',
            }}>
              <PhotoBox h={38} w={38} r={8} src={c.listing?.photos?.[0]} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: sans, fontSize: 13.5, fontWeight: 600, color: ink }}>
                  {c.profile?.name || 'Unknown'}
                </div>
                <div style={{ fontFamily: sans, fontSize: 11, color: ink3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {c.listing ? `${c.listing.brand} ${c.listing.model}` : 'Say hello'}
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Thread */}
      {m && (
        <div style={{
          background: surface, border: `1px solid ${stroke}`, borderRadius: 12,
          display: 'flex', flexDirection: 'column', height: 'min(72vh, 640px)',
        }}>
          {/* thread header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: `1px solid ${stroke}` }}>
            <PhotoBox h={40} w={40} r={8} src={m.listing?.photos?.[0]} />
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: sans, fontSize: 14.5, fontWeight: 600, color: ink }}>
                {m.profile?.name || 'Unknown'}
                <span style={{ color: ink3, fontWeight: 400, fontSize: 12 }}> · {m.profile?.country || '—'}</span>
              </div>
              <div style={{ fontFamily: sans, fontSize: 11.5, color: ink3 }}>
                {m.listing ? `${m.listing.model}` : 'Their watch'} ⇄ your {myListing?.model || 'watch'}
              </div>
            </div>
            <button onClick={() => setReportOpen(true)} style={{
              all: 'unset', cursor: 'pointer', fontFamily: sans, fontSize: 12, color: red,
            }}>⚑ Report</button>
          </div>

          {/* messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ textAlign: 'center', fontFamily: mono, fontSize: 9.5, letterSpacing: '.12em', color: ink3 }}>
              — MATCHED · {timeAgo(m.createdAt).toUpperCase()} —
            </div>
            {messages.map(msg => {
              if (msg.is_system) return (
                <div key={msg.id} style={{ textAlign: 'center', padding: '4px 0' }}>
                  <span style={{ fontFamily: mono, fontSize: 9.5, letterSpacing: '.1em', color: ink3 }}>{msg.content}</span>
                </div>
              )
              const isMine = msg.sender_id === user.id
              return (
                <div key={msg.id} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
                  <div style={{
                    maxWidth: '72%', padding: '10px 14px', borderRadius: 14,
                    borderBottomRightRadius: isMine ? 4 : 14,
                    borderBottomLeftRadius:  isMine ? 14 : 4,
                    background: isMine ? goldSoft : surface2,
                    border: `1px solid ${isMine ? gold + '40' : stroke}`,
                  }}>
                    <div style={{ fontFamily: sans, fontSize: 13.5, color: ink, lineHeight: 1.45 }}>{msg.content}</div>
                    <div style={{ fontFamily: sans, fontSize: 9.5, color: ink3, textAlign: 'right', marginTop: 5 }}>
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              )
            })}
            {messages.length === 0 && (
              <div style={{ textAlign: 'center', color: ink3, fontFamily: sans, fontSize: 13, marginTop: 20 }}>
                No messages yet — break the ice.
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* composer */}
          <div style={{ display: 'flex', gap: 10, padding: '12px 16px', borderTop: `1px solid ${stroke}`, alignItems: 'center' }}>
            <input
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
              placeholder="Message…"
              style={{
                flex: 1, height: 42, border: `1px solid ${stroke}`, borderRadius: 999,
                padding: '0 18px', fontFamily: sans, fontSize: 13.5, color: ink,
                background: bg, outline: 'none',
              }}
            />
            <button onClick={handleSend} style={{
              all: 'unset', cursor: 'pointer', fontFamily: sans, fontSize: 13.5, fontWeight: 600,
              color: '#fff', background: gold, borderRadius: 999,
              padding: '0 22px', height: 42, display: 'inline-flex', alignItems: 'center',
            }}>Send</button>
          </div>
        </div>
      )}

      <ReportModal
        isOpen={reportOpen}
        onClose={() => setReportOpen(false)}
        onSubmit={handleSubmitReport}
      />
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
  if (d === 1) return 'yesterday'
  return `${d} days ago`
}
