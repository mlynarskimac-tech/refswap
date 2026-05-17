import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import { useAuth } from '../context/auth-context'
import ReportModal from '../components/ReportModal'

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

export default function Browse() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [listings, setListings] = useState([])
  const [myListing, setMyListing] = useState(null)
  const [likedIds, setLikedIds] = useState(new Set())
  const [view, setView] = useState('grid') // 'grid' | 'swipe'
  const [swipeIndex, setSwipeIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [reportTarget, setReportTarget] = useState(null) // { listingId, userId }

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)

    // Mój aktywny listing
    const { data: mine } = await supabase
      .from('listings')
      .select('id')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()
    setMyListing(mine)

    // Moje like'i
    const { data: myLikes } = await supabase
      .from('likes')
      .select('to_listing')
      .eq('from_user', user.id)
    setLikedIds(new Set((myLikes || []).map(l => l.to_listing)))

    // Wszystkie aktywne listingi innych użytkowników
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
    if (!myListing) {
      alert('Add your watch first to like others.')
      navigate('/create-listing')
      return
    }

    if (likedIds.has(listingId)) return // już polubione

    // Dodaj like
    const { error: likeError } = await supabase.from('likes').insert({
      from_user: user.id,
      to_listing: listingId,
    })

    if (likeError) {
      console.error('Like insert failed:', likeError)
      return
    }

    // Sprawdź czy tamta osoba też nas like'uje (match)
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

  function handleSwipeNext() {
    setSwipeIndex(i => Math.min(i + 1, listings.length - 1))
  }

  function handleSwipeLike() {
    if (listings[swipeIndex]) {
      handleLike(listings[swipeIndex].id)
    }
    handleSwipeNext()
  }

  if (loading) return (
    <div style={{ textAlign: 'center', padding: 80, color: '#666' }}>
      Loading watches…
    </div>
  )

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 20px' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>Browse watches</h1>
          <p style={{ color: '#666', margin: '4px 0 0' }}>{listings.length} watches available</p>
        </div>

        {/* View toggle */}
        <div style={{ display: 'flex', background: '#f3f4f6', borderRadius: 10, padding: 4 }}>
          {['grid', 'swipe'].map(v => (
            <button key={v} onClick={() => setView(v)} style={{
              padding: '8px 20px', border: 'none', borderRadius: 8,
              background: view === v ? '#111' : 'transparent',
              color: view === v ? '#fff' : '#666',
              fontWeight: 600, cursor: 'pointer', fontSize: 14,
              transition: 'all 0.15s',
            }}>
              {v === 'grid' ? '⊞ Grid' : '↔ Swipe'}
            </button>
          ))}
        </div>
      </div>

      {!myListing && (
        <div style={{
          background: '#fffbeb', border: '1px solid #fcd34d',
          borderRadius: 12, padding: '16px 20px', marginBottom: 24,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{ fontSize: 14, color: '#92400e' }}>
            You need to list your watch before you can like others.
          </span>
          <button onClick={() => navigate('/create-listing')} style={{
            background: '#111', color: '#fff', border: 'none',
            borderRadius: 8, padding: '8px 16px', fontSize: 13,
            fontWeight: 600, cursor: 'pointer',
          }}>
            Add my watch
          </button>
        </div>
      )}

      {listings.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 80, color: '#999' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⌚</div>
          <p>No watches yet. Be the first to list yours!</p>
        </div>
      ) : view === 'grid' ? (
        <GridView listings={listings} likedIds={likedIds} onLike={handleLike} onReport={openReport} />
      ) : (
        <SwipeView
          listing={listings[swipeIndex]}
          index={swipeIndex}
          total={listings.length}
          liked={likedIds.has(listings[swipeIndex]?.id)}
          onLike={handleSwipeLike}
          onSkip={handleSwipeNext}
          onReport={openReport}
        />
      )}

      <ReportModal
        isOpen={reportTarget !== null}
        onClose={() => setReportTarget(null)}
        onSubmit={handleSubmitReport}
      />
    </div>
  )
}

function WatchCard({ listing, liked, onLike, onReport }) {
  const photo = listing.photos?.[0]
  const country = listing.profiles?.country || '?'

  return (
    <div style={{
      background: '#fff', borderRadius: 16, overflow: 'hidden',
      border: '1px solid #e5e7eb', transition: 'box-shadow 0.2s',
      cursor: 'default',
    }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
    >
      {/* Photo */}
      <div style={{ position: 'relative', aspectRatio: '1', background: '#f9fafb' }}>
        {photo ? (
          <img src={photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: 48 }}>⌚</div>
        )}
        {listing.open_to_topup && (
          <div style={{
            position: 'absolute', top: 10, right: 10,
            background: '#111', color: '#fff', borderRadius: 6,
            padding: '3px 8px', fontSize: 11, fontWeight: 600,
          }}>
            + top-up
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: '14px 16px' }}>
        <div style={{ fontWeight: 700, fontSize: 15 }}>{listing.brand}</div>
        <div style={{ color: '#444', fontSize: 14, marginBottom: 8 }}>{listing.model}</div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 12, color: '#666' }}>
            {GEO_ICONS[listing.geo_scope]} {country} · {TIER_LABELS[listing.price_tier] || listing.price_tier}
          </div>
          <button
            onClick={() => onLike(listing.id)}
            style={{
              background: liked ? '#fef2f2' : '#f9fafb',
              border: liked ? '1px solid #fca5a5' : '1px solid #e5e7eb',
              borderRadius: 8, padding: '6px 12px', cursor: 'pointer',
              fontSize: 16, transition: 'all 0.15s',
            }}
          >
            {liked ? '❤️' : '🤍'}
          </button>
        </div>

        <button
          onClick={() => onReport(listing.id, listing.user_id)}
          style={{
            background: 'none', border: 'none', padding: '4px 0 0',
            cursor: 'pointer', fontSize: 11, color: '#ccc',
            textDecoration: 'underline',
          }}
        >
          Report
        </button>
      </div>
    </div>
  )
}

function GridView({ listings, likedIds, onLike, onReport }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
      gap: 20,
    }}>
      {listings.map(l => (
        <WatchCard key={l.id} listing={l} liked={likedIds.has(l.id)} onLike={onLike} onReport={onReport} />
      ))}
    </div>
  )
}

function SwipeView({ listing, index, total, liked, onLike, onSkip, onReport }) {
  if (!listing) return (
    <div style={{ textAlign: 'center', padding: 80, color: '#999' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>✓</div>
      <p>You've seen all watches!</p>
    </div>
  )

  const photo = listing.photos?.[0]
  const country = listing.profiles?.country || '?'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
      <p style={{ color: '#999', fontSize: 14 }}>{index + 1} / {total}</p>

      <div style={{
        background: '#fff', borderRadius: 24, overflow: 'hidden',
        border: '1px solid #e5e7eb', width: '100%', maxWidth: 400,
        boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
      }}>
        <div style={{ aspectRatio: '1', background: '#f9fafb' }}>
          {photo ? (
            <img src={photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: 80 }}>⌚</div>
          )}
        </div>

        <div style={{ padding: '20px 24px' }}>
          <div style={{ fontWeight: 700, fontSize: 20 }}>{listing.brand}</div>
          <div style={{ color: '#444', fontSize: 16, marginBottom: 4 }}>{listing.model}</div>
          <div style={{ fontSize: 13, color: '#888' }}>
            {GEO_ICONS[listing.geo_scope]} {country} · {TIER_LABELS[listing.price_tier] || listing.price_tier}
            {listing.open_to_topup && ' · open to top-up'}
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: 24 }}>
        <button onClick={onSkip} style={{
          width: 64, height: 64, borderRadius: '50%', border: '2px solid #e5e7eb',
          background: '#fff', fontSize: 24, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        }}>✕</button>

        <button onClick={onLike} disabled={liked} style={{
          width: 64, height: 64, borderRadius: '50%',
          border: liked ? '2px solid #fca5a5' : '2px solid #111',
          background: liked ? '#fef2f2' : '#111', fontSize: 24, cursor: liked ? 'default' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        }}>
          {liked ? '❤️' : '🤍'}
        </button>
      </div>

      <button
        onClick={() => onReport(listing.id, listing.user_id)}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: 12, color: '#bbb', textDecoration: 'underline',
        }}
      >
        Report this listing
      </button>
    </div>
  )
}