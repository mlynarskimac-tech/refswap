import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import { useAuth } from '../context/auth-context'
import ReportModal from '../components/ReportModal'

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

export default function Browse() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [listings, setListings] = useState([])
  const [myListing, setMyListing] = useState(null)
  const [likedIds, setLikedIds] = useState(new Set())
  const [matchedIds, setMatchedIds] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [reportTarget, setReportTarget] = useState(null)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)

    const { data: mine } = await supabase
      .from('listings')
      .select('id')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()
    setMyListing(mine)

    const { data: myLikes } = await supabase
      .from('likes')
      .select('to_listing')
      .eq('from_user', user.id)
    const likedSet = new Set((myLikes || []).map(l => l.to_listing))

    const { data: myMatches } = await supabase
      .from('matches')
      .select('user_a, listing_a, listing_b, status')
      .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)

    const matchedSet = new Set()
    for (const m of myMatches || []) {
      const theirListing = m.user_a === user.id ? m.listing_b : m.listing_a
      if (m.status === 'active') matchedSet.add(theirListing)
      else if (m.status === 'closed') likedSet.delete(theirListing)
    }
    setLikedIds(likedSet)
    setMatchedIds(matchedSet)

    const { data: all } = await supabase
      .from('listings')
      .select(`
        id, brand, model, reference, price_tier, geo_scope,
        open_to_topup, photos, user_id,
        profiles!listings_user_id_fkey(country)
      `)
      .eq('is_active', true)
      .neq('user_id', user.id)
      .order('created_at', { ascending: false })

    setListings(all || [])
    setLoading(false)
  }

  async function handleLike(listingId) {
    console.log('[handleLike] called', { listingId, myListing, liked: likedIds.has(listingId), matched: matchedIds.has(listingId) })
    if (!myListing) {
      alert('Add your watch first to like others.')
      navigate('/create-listing')
      return
    }

    if (likedIds.has(listingId)) {
      if (matchedIds.has(listingId)) return
      await supabase.from('likes').delete()
        .eq('from_user', user.id)
        .eq('to_listing', listingId)
      setLikedIds(prev => { const n = new Set(prev); n.delete(listingId); return n })
      return
    }

    const { error: likeError } = await supabase.from('likes').upsert({
      from_user: user.id,
      to_listing: listingId,
    }, { onConflict: 'from_user,to_listing', ignoreDuplicates: true })

    if (likeError) {
      console.error('Like insert failed:', likeError)
      return
    }

    const theirListing = listings.find(l => l.id === listingId)
    if (theirListing) {
      const { data: theirLike } = await supabase
        .from('likes')
        .select('from_user')
        .eq('from_user', theirListing.user_id)
        .eq('to_listing', myListing.id)
        .maybeSingle()

      if (theirLike) {
        const { error: matchError } = await supabase.from('matches').insert({
          listing_a: myListing.id,
          listing_b: listingId,
          user_a: user.id,
          user_b: theirListing.user_id,
        })
        if (!matchError) {
          alert('🎉 It\'s a match! Go to your matches to start chatting.')
        } else {
          console.error('Match insert failed:', matchError)
        }
      }
    }

    setLikedIds(prev => new Set([...prev, listingId]))
  }

  function openReport(listingId, userId) {
    setReportTarget({ listingId, userId })
  }

  async function handleSubmitReport(reason) {
    if (!reportTarget) return
    await supabase.from('reports').insert({
      reporter_id: user.id,
      reported_listing_id: reportTarget.listingId,
      reported_user_id: reportTarget.userId,
      reason,
    })
  }

  if (loading) return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: 'calc(100vh - 60px)', color: '#353545', fontSize: 14,
    }}>
      Loading watches…
    </div>
  )

  return (
    <div style={{ background: '#0B0B14', minHeight: 'calc(100vh - 60px)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>

        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#F0EDE8' }}>
            Browse watches
          </h1>
          <p style={{ color: '#353548', fontSize: 13, marginTop: 4 }}>
            {listings.length} {listings.length === 1 ? 'watch' : 'watches'} available
          </p>
        </div>

        {!myListing && (
          <div style={{
            background: 'rgba(201,168,76,0.05)',
            border: '1px solid rgba(201,168,76,0.18)',
            borderRadius: 14, padding: '14px 20px', marginBottom: 32,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16,
          }}>
            <span style={{ fontSize: 13, color: '#7A6A38' }}>
              List your watch to start liking others and get matched.
            </span>
            <button
              onClick={() => navigate('/create-listing')}
              style={{
                background: '#C9A84C', color: '#0B0A07', border: 'none',
                borderRadius: 8, padding: '8px 18px', fontSize: 12,
                fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
                letterSpacing: '0.02em',
              }}
            >
              List my watch
            </button>
          </div>
        )}

        {listings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#2A2A3A' }}>
            <div style={{ fontSize: 44, marginBottom: 14, opacity: 0.3 }}>⌚</div>
            <p style={{ fontSize: 14 }}>No watches yet. Be the first to list yours.</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: 18,
          }}>
            {listings.map(l => (
              <WatchCard
                key={l.id}
                listing={l}
                liked={likedIds.has(l.id)}
                matched={matchedIds.has(l.id)}
                onLike={handleLike}
                onReport={openReport}
                onOpen={() => navigate(`/listing/${l.id}`)}
              />
            ))}
          </div>
        )}
      </div>

      <ReportModal
        isOpen={reportTarget !== null}
        onClose={() => setReportTarget(null)}
        onSubmit={handleSubmitReport}
      />
    </div>
  )
}

function HeartIcon({ filled, matched }) {
  const color = matched ? '#C9A84C' : filled ? '#E8C96A' : '#353548'
  return (
    <svg width="16" height="16" viewBox="0 0 24 24"
      fill={filled || matched ? color : 'none'}
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ pointerEvents: 'none' }}
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  )
}

function WatchCard({ listing, liked, matched, onLike, onReport, onOpen }) {
  const photo = listing.photos?.[0]
  const country = listing.profiles?.country || '—'
  const tier = TIER_CONFIG[listing.price_tier]

  return (
    <div
      style={{
        background: '#111120',
        borderRadius: 16,
        overflow: 'hidden',
        border: '1px solid #1A1A28',
        transition: 'border-color 0.2s, transform 0.18s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = '#2A2A3C'
        e.currentTarget.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = '#1A1A28'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      {/* Photo */}
      <div
        onClick={onOpen}
        style={{
          position: 'relative',
          aspectRatio: '4/3',
          background: '#0D0D1A',
          cursor: 'pointer',
          overflow: 'hidden',
        }}
      >
        {photo ? (
          <img
            src={photo}
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            height: '100%', fontSize: 40, opacity: 0.15,
          }}>
            ⌚
          </div>
        )}
        {listing.open_to_topup && (
          <div style={{
            position: 'absolute', top: 10, left: 10,
            background: 'rgba(201,168,76,0.9)',
            color: '#0B0A07',
            borderRadius: 6, padding: '3px 9px',
            fontSize: 9, fontWeight: 700, letterSpacing: '0.06em',
            textTransform: 'uppercase',
          }}>
            + Top-up
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: '14px 16px 12px' }}>
        <div onClick={onOpen} style={{ cursor: 'pointer', marginBottom: 12 }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'flex-start', gap: 8, marginBottom: 4,
          }}>
            <span style={{ fontWeight: 700, fontSize: 15, color: '#F0EDE8', lineHeight: 1.2 }}>
              {listing.brand}
            </span>
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
          <div style={{ fontSize: 13, color: '#525265', marginBottom: 5 }}>
            {listing.model}
          </div>
          <div style={{ fontSize: 11, color: '#353548' }}>
            {GEO_ICONS[listing.geo_scope]} {country}
          </div>
        </div>

        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          borderTop: '1px solid #161624', paddingTop: 10,
        }}>
          <button
            onClick={() => onReport(listing.id, listing.user_id)}
            style={{
              background: 'none', border: 'none', padding: '2px 0',
              cursor: 'pointer', fontSize: 11, color: '#252535',
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#525265'}
            onMouseLeave={e => e.currentTarget.style.color = '#252535'}
          >
            Report
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onLike(listing.id); }}
            disabled={matched}
            title={matched ? 'Manage this match in chat' : liked ? 'Remove like' : 'Like this watch'}
            style={{
              background: liked ? 'rgba(232,201,106,0.08)' : 'transparent',
              border: liked ? '1px solid rgba(232,201,106,0.2)' : '1px solid #1E1E2C',
              borderRadius: 8, padding: '6px 10px',
              cursor: matched ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.15s',
              opacity: matched ? 0.35 : 1,
            }}
          >
            <HeartIcon filled={liked} matched={matched} />
          </button>
        </div>
      </div>
    </div>
  )
}
