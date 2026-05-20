import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import { useAuth } from '../context/auth-context'
import ReportModal from '../components/ReportModal'

export default function Chat() {
  const { matchId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [other, setOther] = useState(null)
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const [reportOpen, setReportOpen] = useState(false)
  const [matchStatus, setMatchStatus] = useState('active')
  const [closing, setClosing] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    loadChat()
    const interval = setInterval(fetchMessages, 3000)
    return () => clearInterval(interval)
  }, [matchId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function loadChat() {
    const { data: match, error } = await supabase
      .from('matches')
      .select('user_a, user_b, listing_a, listing_b, status')
      .eq('id', matchId)
      .single()

    if (error || !match) {
      navigate('/matches')
      return
    }

    setMatchStatus(match.status)
    const otherId = match.user_a === user.id ? match.user_b : match.user_a
    const otherListingId = match.user_a === user.id ? match.listing_b : match.listing_a

    const [{ data: profile }, { data: listing }] = await Promise.all([
      supabase.from('profiles').select('name').eq('id', otherId).single(),
      supabase.from('listings').select('brand, model, photos').eq('id', otherListingId).single(),
    ])

    setOther({
      name: profile?.name ?? 'Unknown',
      brand: listing?.brand ?? '',
      model: listing?.model ?? '',
      photo: listing?.photos?.[0] ?? null,
      userId: otherId,
      listingId: otherListingId,
    })
    await fetchMessages()
    setLoading(false)
  }

  async function fetchMessages() {
    const [{ data: msgs, error }, { data: matchData }] = await Promise.all([
      supabase.from('messages').select('*').eq('match_id', matchId).order('created_at', { ascending: true }),
      supabase.from('matches').select('status').eq('id', matchId).single(),
    ])
    if (!error) {
      setMessages(msgs || [])
      localStorage.setItem(`seen_chat_${matchId}`, new Date().toISOString())
    }
    if (matchData) setMatchStatus(matchData.status)
  }

  async function handleSubmitReport(reason) {
    await supabase.from('reports').insert({
      reporter_id: user.id,
      reported_user_id: other.userId,
      reported_listing_id: other.listingId,
      reason,
    })
  }

  async function handleCloseMatch() {
    if (closing) return
    if (!window.confirm('Are you sure? This will close the match and delete the conversation for both parties.')) return
    setClosing(true)

    const { data: existing } = await supabase
      .from('messages')
      .select('id')
      .eq('match_id', matchId)
      .eq('is_system', true)
      .maybeSingle()

    if (!existing) {
      await supabase.from('messages').insert({
        match_id: matchId,
        sender_id: null,
        content: 'This match has been closed.',
        is_system: true,
      })
    }

    const { error } = await supabase
      .from('matches')
      .update({ status: 'closed' })
      .eq('id', matchId)

    if (error) {
      console.error('Failed to close match:', error)
      setClosing(false)
      return
    }

    navigate('/matches')
  }

  async function handleSend(e) {
    e.preventDefault()
    const content = text.trim()
    if (!content) return
    setText('')

    const { error } = await supabase
      .from('messages')
      .insert({ match_id: matchId, sender_id: user.id, content })

    if (!error) {
      await fetchMessages()
    } else {
      setText(content)
    }
  }

  const isClosed = matchStatus === 'closed'

  if (loading) return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: 'calc(100vh - 60px)', color: '#353545', fontSize: 14,
    }}>
      Loading chat…
    </div>
  )

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      height: 'calc(100vh - 60px)',
      background: '#0B0B14',
    }}>

      {/* Chat header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 14, padding: '12px 20px',
        background: '#0E0E1C', borderBottom: '1px solid #1A1A28', flexShrink: 0,
      }}>
        {other.photo ? (
          <img src={other.photo} alt="" style={{
            width: 40, height: 40, borderRadius: 8, objectFit: 'cover',
            border: '1px solid #1E1E2C',
          }} />
        ) : (
          <div style={{
            width: 40, height: 40, borderRadius: 8,
            background: '#161624', border: '1px solid #1E1E2C',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, opacity: 0.4,
          }}>⌚</div>
        )}
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: 14, color: '#F0EDE8' }}>{other.name}</div>
          <div style={{ fontSize: 12, color: '#353548' }}>{other.brand} {other.model}</div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {!isClosed && (
            <button
              onClick={handleCloseMatch}
              disabled={closing}
              style={{
                background: 'none', border: 'none',
                color: '#2A2A3A', fontSize: 12,
                cursor: closing ? 'default' : 'pointer',
                padding: '4px 8px', borderRadius: 6,
                transition: 'color 0.15s',
              }}
              onMouseEnter={e => !closing && (e.currentTarget.style.color = '#ef4444')}
              onMouseLeave={e => (e.currentTarget.style.color = '#2A2A3A')}
            >
              {closing ? 'Closing…' : 'Close match'}
            </button>
          )}
          <button
            onClick={() => setReportOpen(true)}
            style={{
              background: 'none', border: '1px solid #1E1E2C', borderRadius: 8,
              padding: '6px 14px', cursor: 'pointer', fontSize: 12, color: '#353548',
              transition: 'border-color 0.15s, color 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#353548'; e.currentTarget.style.color = '#7A7A8C' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#1E1E2C'; e.currentTarget.style.color = '#353548' }}
          >
            Report
          </button>
        </div>
      </div>

      {/* Closed banner */}
      {isClosed && (
        <div style={{
          background: 'rgba(239,68,68,0.06)',
          borderBottom: '1px solid rgba(239,68,68,0.12)',
          padding: '10px 20px', textAlign: 'center',
          fontSize: 13, color: '#7A3030', flexShrink: 0,
        }}>
          This match has been closed. You can no longer send messages.
        </div>
      )}

      {/* Messages */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '24px 20px 12px',
        display: 'flex', flexDirection: 'column', gap: 6,
      }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', color: '#252535', fontSize: 13, marginTop: 48 }}>
            No messages yet. Say hello.
          </div>
        )}
        {messages.map(msg => (
          <Bubble key={msg.id} msg={msg} isMine={msg.sender_id === user.id} />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSend}
        style={{
          display: 'flex', gap: 10, padding: '12px 16px',
          background: '#0E0E1C', borderTop: '1px solid #1A1A28', flexShrink: 0,
        }}
      >
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder={isClosed ? 'This match is closed.' : 'Type a message…'}
          disabled={isClosed}
          style={{
            flex: 1, padding: '10px 14px', borderRadius: 10,
            border: '1px solid #1E1E2C', fontSize: 14, outline: 'none',
            background: isClosed ? '#0D0D1A' : '#111120',
            color: isClosed ? '#2A2A3A' : '#F0EDE8',
          }}
        />
        <button
          type="submit"
          disabled={!text.trim() || isClosed}
          style={{
            padding: '10px 20px', borderRadius: 10, border: 'none',
            background: text.trim() && !isClosed ? '#C9A84C' : '#141424',
            color: text.trim() && !isClosed ? '#0B0A07' : '#252535',
            fontWeight: 700, fontSize: 13,
            cursor: text.trim() && !isClosed ? 'pointer' : 'default',
            transition: 'background 0.15s',
            letterSpacing: '0.02em',
          }}
        >
          Send
        </button>
      </form>

      <ReportModal
        isOpen={reportOpen}
        onClose={() => setReportOpen(false)}
        onSubmit={handleSubmitReport}
      />
    </div>
  )
}

function Bubble({ msg, isMine }) {
  if (msg.is_system) {
    return (
      <div style={{ textAlign: 'center', padding: '8px 0' }}>
        <span style={{
          background: '#161624', borderRadius: 20,
          padding: '4px 16px', fontSize: 12, color: '#353548',
          border: '1px solid #1E1E2C', display: 'inline-block',
        }}>
          {msg.content}
        </span>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
      <div style={{
        maxWidth: '68%', padding: '9px 14px', borderRadius: 14,
        borderBottomRightRadius: isMine ? 4 : 14,
        borderBottomLeftRadius: isMine ? 14 : 4,
        background: isMine ? '#C9A84C' : '#161628',
        color: isMine ? '#0B0A07' : '#D0CCC6',
        border: isMine ? 'none' : '1px solid #1E1E2C',
        fontSize: 14, lineHeight: 1.45,
      }}>
        {msg.content}
        <div style={{
          fontSize: 10, marginTop: 4,
          opacity: isMine ? 0.5 : 0.4,
          textAlign: 'right',
          color: isMine ? '#0B0A07' : '#D0CCC6',
        }}>
          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  )
}
