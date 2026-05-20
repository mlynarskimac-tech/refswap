import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import { useAuth } from '../context/auth-context'
import ReportModal from '../components/ReportModal'

export default function Chat() {
  const { matchId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [other, setOther] = useState(null) // { name, brand, model, photo, userId, listingId }
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

  if (loading) return <div style={{ padding: 24, color: '#666' }}>Loading chat…</div>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 56px)' }}>

      {/* Chat header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 14, padding: '12px 20px',
        background: '#fff', borderBottom: '1px solid #e5e7eb', flexShrink: 0,
      }}>
        {other.photo ? (
          <img src={other.photo} alt="" style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover' }} />
        ) : (
          <div style={{ width: 44, height: 44, borderRadius: 8, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>⌚</div>
        )}
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 15 }}>{other.name}</div>
          <div style={{ fontSize: 13, color: '#888' }}>{other.brand} {other.model}</div>
        </div>
        {matchStatus !== 'closed' && (
          <button
            onClick={handleCloseMatch}
            disabled={closing}
            style={{
              background: 'none', border: '1px solid #fca5a5', borderRadius: 8,
              padding: '6px 14px', cursor: closing ? 'default' : 'pointer',
              fontSize: 13, color: '#dc2626', opacity: closing ? 0.5 : 1,
            }}
          >
            {closing ? 'Closing…' : 'Close match'}
          </button>
        )}
        <button
          onClick={() => setReportOpen(true)}
          style={{
            background: 'none', border: '1px solid #e5e7eb', borderRadius: 8,
            padding: '6px 14px', cursor: 'pointer', fontSize: 13, color: '#888',
          }}
        >
          Report
        </button>
      </div>

      {/* Closed banner */}
      {matchStatus === 'closed' && (
        <div style={{
          background: '#fef2f2', borderBottom: '1px solid #fca5a5',
          padding: '10px 20px', textAlign: 'center',
          fontSize: 14, color: '#991b1b', flexShrink: 0,
        }}>
          This match has been closed. You can no longer send messages.
        </div>
      )}

      {/* Messages */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '20px 20px 8px',
        display: 'flex', flexDirection: 'column', gap: 8,
        background: '#f9fafb',
      }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', color: '#aaa', fontSize: 14, marginTop: 40 }}>
            No messages yet. Say hello!
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
          background: '#fff', borderTop: '1px solid #e5e7eb', flexShrink: 0,
        }}
      >
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder={matchStatus === 'closed' ? 'This match is closed.' : 'Type a message…'}
          disabled={matchStatus === 'closed'}
          style={{
            flex: 1, padding: '10px 14px', borderRadius: 10,
            border: '1px solid #e5e7eb', fontSize: 14, outline: 'none',
            background: matchStatus === 'closed' ? '#f9fafb' : '#fff',
          }}
        />
        <button
          type="submit"
          disabled={!text.trim() || matchStatus === 'closed'}
          style={{
            padding: '10px 20px', borderRadius: 10, border: 'none',
            background: text.trim() ? '#111' : '#e5e7eb',
            color: text.trim() ? '#fff' : '#aaa',
            fontWeight: 600, fontSize: 14, cursor: text.trim() ? 'pointer' : 'default',
            transition: 'background 0.15s',
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
      <div style={{ textAlign: 'center', padding: '6px 0' }}>
        <span style={{
          background: '#f3f4f6', borderRadius: 20,
          padding: '4px 14px', fontSize: 13, color: '#888',
          border: '1px solid #e5e7eb',
        }}>
          {msg.content}
        </span>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
      <div style={{
        maxWidth: '70%', padding: '9px 14px', borderRadius: 14,
        borderBottomRightRadius: isMine ? 4 : 14,
        borderBottomLeftRadius: isMine ? 14 : 4,
        background: isMine ? '#111' : '#fff',
        color: isMine ? '#fff' : '#111',
        border: isMine ? 'none' : '1px solid #e5e7eb',
        fontSize: 14, lineHeight: 1.45,
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      }}>
        {msg.content}
        <div style={{ fontSize: 11, marginTop: 4, opacity: 0.55, textAlign: 'right' }}>
          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  )
}
