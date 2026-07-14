import { useEffect, useRef, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import { useAuth } from '../context/auth-context'
import { useToast } from '../context/toast-context'
import { useBadges } from '../context/badge-context'
import { unwrap } from '../lib/db'
import ReportModal from '../components/ReportModal'

// ── The Vault × Manufacture — soft ──────────────────────────────────────────
const bg      = '#F6F6F3'
const card    = '#FFFFFF'
const accent  = '#274C6B'
const ink     = '#16181B'
const inkSoft = 'rgba(22,24,27,0.55)'
const sans    = "'Inter', system-ui, sans-serif"
const serif   = "'Fraunces', serif"

const cardShadow     = '0 8px 30px rgba(22,24,27,0.08)'
const bubbleShadow   = '0 4px 14px rgba(22,24,27,0.08)'
const headerShadow   = '0 8px 24px rgba(22,24,27,0.06)'
const composerShadow = '0 -8px 24px rgba(22,24,27,0.06)'

function MatchesEmpty() {
  return (
    <div style={{
      marginTop: 32, background: card, borderRadius: 22, boxShadow: cardShadow,
      padding: '64px 24px', textAlign: 'center',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
    }}>
      <span style={{ fontFamily: serif, fontSize: 22, color: ink }}>No messages yet</span>
      <span style={{ fontFamily: sans, fontSize: 13.5, color: inkSoft, maxWidth: 320, lineHeight: 1.5 }}>
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
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: inkSoft, fontFamily: sans, fontSize: 14 }}>
      Loading…
    </div>
  )

  if (matches.length === 0) {
    return (
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '26px 26px 40px' }}>
        <h1 style={{ fontFamily: serif, fontWeight: 600, fontSize: 34, color: ink, margin: 0 }}>Messages</h1>
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
        background: card, borderRadius: 22, boxShadow: cardShadow, overflow: 'hidden',
      }}>
        <div style={{ padding: '16px 18px', fontFamily: serif, fontSize: 18, color: ink }}>
          Messages
        </div>
        {matches.map(c => {
          const active = m && c.matchId === m.matchId
          const photo = c.listing?.photos?.[0]
          return (
            <button key={c.matchId} onClick={() => selectMatch(c)} style={{
              all: 'unset', cursor: 'pointer', boxSizing: 'border-box',
              display: 'flex', gap: 10, alignItems: 'center', width: '100%',
              padding: '10px 18px',
              background: active ? `${accent}12` : 'transparent',
              transition: 'background 200ms ease',
            }}>
              <div style={{ width: 38, height: 38, borderRadius: 12, overflow: 'hidden', flexShrink: 0, background: photo ? card : accent }}>
                {photo && <img src={photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: sans, fontSize: 13.5, fontWeight: 500, color: ink }}>
                  {c.profile?.name || 'Unknown'}
                </div>
                <div style={{ fontFamily: sans, fontSize: 11.5, color: inkSoft, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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
          background: card, borderRadius: 22, boxShadow: cardShadow,
          display: 'flex', flexDirection: 'column', height: 'min(72vh, 640px)', overflow: 'hidden',
        }}>
          {/* thread header */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px',
            background: card, boxShadow: headerShadow, position: 'relative', zIndex: 1,
          }}>
            <button
              onClick={() => navigate('/matches')}
              aria-label="Back to matches"
              style={{ all: 'unset', cursor: 'pointer', fontSize: 18, color: ink, lineHeight: 1, padding: 4 }}
            >←</button>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: serif, fontSize: 20, color: ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {m.profile?.name || 'Unknown'}
              </div>
              <div style={{ fontFamily: sans, fontSize: 13, color: inkSoft, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {m.listing?.model || 'Their watch'}
              </div>
            </div>
            <button
              onClick={() => setReportOpen(true)}
              onMouseEnter={e => { e.currentTarget.style.textDecoration = 'underline' }}
              onMouseLeave={e => { e.currentTarget.style.textDecoration = 'none' }}
              style={{ all: 'unset', cursor: 'pointer', fontFamily: sans, fontSize: 13, color: inkSoft, flexShrink: 0 }}
            >Report</button>
          </div>

          {/* messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px 18px', background: bg, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ textAlign: 'center', fontFamily: sans, fontSize: 12, color: inkSoft }}>
              Matched · {timeAgo(m.createdAt)}
            </div>
            {messages.map(msg => {
              if (msg.is_system) return (
                <div key={msg.id} style={{ textAlign: 'center', padding: '2px 0' }}>
                  <span style={{ fontFamily: sans, fontSize: 12, color: inkSoft }}>{msg.content}</span>
                </div>
              )
              const isMine = msg.sender_id === user.id
              return (
                <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isMine ? 'flex-end' : 'flex-start' }}>
                  <div style={{
                    maxWidth: '72%', padding: '10px 16px', borderRadius: 16,
                    borderBottomRightRadius: isMine ? 4 : 16,
                    borderBottomLeftRadius:  isMine ? 16 : 4,
                    background: isMine ? accent : card,
                    boxShadow: bubbleShadow,
                  }}>
                    <div style={{ fontFamily: sans, fontSize: 14, lineHeight: 1.5, color: isMine ? '#fff' : ink }}>
                      {msg.content}
                    </div>
                  </div>
                  <div style={{ fontFamily: sans, fontSize: 11, color: inkSoft, marginTop: 4, padding: '0 4px' }}>
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              )
            })}
            {messages.length === 0 && (
              <div style={{ textAlign: 'center', color: inkSoft, fontFamily: sans, fontSize: 13, marginTop: 20 }}>
                No messages yet — break the ice.
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* composer */}
          <div style={{
            display: 'flex', gap: 10, padding: '14px 18px', alignItems: 'center',
            background: card, boxShadow: composerShadow, position: 'relative', zIndex: 1,
          }}>
            <input
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
              placeholder="Message…"
              style={{
                flex: 1, height: 44, border: 'none', borderRadius: 99,
                padding: '12px 18px', fontFamily: sans, fontSize: 14, color: ink,
                background: bg, outline: 'none',
              }}
            />
            <button
              onClick={handleSend}
              disabled={!text.trim()}
              aria-label="Send message"
              style={{
                all: 'unset', cursor: text.trim() ? 'pointer' : 'default', boxSizing: 'border-box',
                width: 44, height: 44, borderRadius: '50%',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', background: accent, fontSize: 17,
                opacity: text.trim() ? 1 : 0.4, flexShrink: 0,
                transition: 'opacity 300ms ease',
              }}
            >↑</button>
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
