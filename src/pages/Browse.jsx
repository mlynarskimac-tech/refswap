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
    setLikedIds(new Set((myLikes || []).map(l => l.to_listing)))

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

    if (likedIds.has(listingId)) return

    const { error: likeError } = await supabase.from('likes').insert({
      from_user: user.id,
      to_listing: listingId,
    })

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
    <div style={{ textAlign: 'center', padding: 80, color: '#666' }}>
      Loading watches…
    </div>
  )

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 20px' }}>

      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>Browse watches</h1>
        <p style={{ color: '#666', margin: '4px 0 0' }}>{listings.length} watches available</p>
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
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: 20,
        }}>
          {listings.map(l => (
            <WatchCard
              key={l.id}
              listing={l}
              liked={likedIds.has(l.id)}
              onLike={handleLike}
              onReport={openReport}
              onOpen={() => navigate(`/listing/${l.id}`)}
            />
          ))}
        </div>
      )}

      <ReportModal
        isOpen={reportTarget !== null}
        onClose={() => setReportTarget(null)}
        onSubmit={handleSubmitReport}
      />
    </div>
  )
}

function WatchCard({ listing, liked, onLike, onReport, onOpen }) {
  const photo = listing.photos?.[0]
  const country = listing.profiles?.country || '?'

  return (
    <div style={{
      background: '#fff', borderRadius: 16, overflow: 'hidden',
      border: '1px solid #e5e7eb', transition: 'box-shadow 0.2s',
    }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
    >
      {/* Photo — click to open details */}
      <div
        onClick={onOpen}
        style={{ position: 'relative', aspectRatio: '1', background: '#f9fafb', cursor: 'pointer' }}
      >
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

      {/* Info — click text area to open details */}
      <div style={{ padding: '14px 16px' }}>
        <div onClick={onOpen} style={{ cursor: 'pointer' }}>
          <div style={{ fontWeight: 700, fontSize: 15 }}>{listing.brand}</div>
          <div style={{ color: '#444', fontSize: 14, marginBottom: 8 }}>{listing.model}</div>
          <div style={{ fontSize: 12, color: '#666', marginBottom: 10 }}>
            {GEO_ICONS[listing.geo_scope]} {country} · {TIER_LABELS[listing.price_tier] || listing.price_tier}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            onClick={() => onReport(listing.id, listing.user_id)}
            style={{
              background: 'none', border: 'none', padding: 0,
              cursor: 'pointer', fontSize: 11, color: '#ccc',
              textDecoration: 'underline',
            }}
          >
            Report
          </button>
          <button
            onClick={() => onLike(listing.id)}
            style={{
              background: liked ? '#fef2f2' : '#f9fafb',
              border: liked ? '1px solid #fca5a5' : '1px solid #e5e7eb',
              borderRadius: 8, padding: '6px 12px', cursor: liked ? 'default' : 'pointer',
              fontSize: 16, transition: 'all 0.15s',
            }}
          >
            {liked ? '❤️' : '🤍'}
          </button>
        </div>
      </div>
    </div>
  )
}
