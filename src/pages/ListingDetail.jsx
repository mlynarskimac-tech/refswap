import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import { useAuth } from '../context/auth-context'
import ReportModal from '../components/ReportModal'

const TIER_LABELS = {
  entry: '3k–6k EUR',
  mid: '6k–12k EUR',
  high: '12k–25k EUR',
  ultra: '25k–50k EUR',
}

const GEO_LABELS = {
  local: 'Local only',
  europe: 'Europe',
  global: 'Worldwide',
}

const GEO_ICONS = {
  local: '📍',
  europe: '🇪🇺',
  global: '🌍',
}

export default function ListingDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [listing, setListing] = useState(null)
  const [myListing, setMyListing] = useState(null)
  const [liked, setLiked] = useState(false)
  const [loading, setLoading] = useState(true)
  const [liking, setLiking] = useState(false)
  const [activePhoto, setActivePhoto] = useState(0)
  const [reportOpen, setReportOpen] = useState(false)
  const [isOwn, setIsOwn] = useState(false)

  useEffect(() => {
    fetchData()
  }, [id])

  async function fetchData() {
    setLoading(true)

    const [{ data: listingData }, { data: mine }, { data: myLikes }] = await Promise.all([
      supabase
        .from('listings')
        .select(`
          id, brand, model, reference, price_tier, geo_scope,
          open_to_topup, photos, user_id,
          profiles!listings_user_id_fkey(country, name)
        `)
        .eq('id', id)
        .single(),
      supabase
        .from('listings')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle(),
      supabase
        .from('likes')
        .select('to_listing')
        .eq('from_user', user.id)
        .eq('to_listing', id)
        .maybeSingle(),
    ])

    if (!listingData) {
      navigate('/browse')
      return
    }

    setListing(listingData)
    setMyListing(mine)
    setLiked(!!myLikes)
    setIsOwn(listingData.user_id === user.id)
    setLoading(false)
  }

  async function handleLike() {
    if (!myListing) {
      alert('Add your watch first to like others.')
      navigate('/create-listing')
      return
    }
    if (liked || liking) return

    setLiking(true)

    const { error: likeError } = await supabase.from('likes').insert({
      from_user: user.id,
      to_listing: listing.id,
    })

    if (likeError) {
      console.error('Like insert failed:', likeError)
      setLiking(false)
      return
    }

    const { data: theirLike } = await supabase
      .from('likes')
      .select('from_user')
      .eq('from_user', listing.user_id)
      .eq('to_listing', myListing.id)
      .maybeSingle()

    if (theirLike) {
      const { error: matchError } = await supabase.from('matches').insert({
        listing_a: myListing.id,
        listing_b: listing.id,
        user_a: user.id,
        user_b: listing.user_id,
      })
      if (!matchError) {
        alert("🎉 It's a match! Go to your matches to start chatting.")
      } else {
        console.error('Match insert failed:', matchError)
      }
    }

    setLiked(true)
    setLiking(false)
  }

  async function handleSubmitReport(reason) {
    await supabase.from('reports').insert({
      reporter_id: user.id,
      reported_listing_id: listing.id,
      reported_user_id: listing.user_id,
      reason,
    })
  }

  if (loading) return (
    <div style={{ textAlign: 'center', padding: 80, color: '#666' }}>
      Loading…
    </div>
  )

  if (!listing) return null

  const photos = listing.photos?.length ? listing.photos : []
  const country = listing.profiles?.country || '?'
  const ownerName = listing.profiles?.name

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '32px 20px' }}>

      {/* Back */}
      <button
        onClick={() => navigate('/browse')}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: 14, color: '#666', padding: '0 0 24px',
          display: 'flex', alignItems: 'center', gap: 6,
        }}
      >
        ← Back to browse
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40 }}>

        {/* Photos */}
        <div>
          <div style={{
            aspectRatio: '1', background: '#f9fafb', borderRadius: 16,
            overflow: 'hidden', border: '1px solid #e5e7eb',
          }}>
            {photos.length > 0 ? (
              <img
                src={photos[activePhoto]}
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: 72, color: '#ccc' }}>
                ⌚
              </div>
            )}
          </div>

          {photos.length > 1 && (
            <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
              {photos.map((p, i) => (
                <button
                  key={i}
                  onClick={() => setActivePhoto(i)}
                  style={{
                    width: 56, height: 56, padding: 0, border: 'none',
                    borderRadius: 8, overflow: 'hidden', cursor: 'pointer',
                    outline: activePhoto === i ? '2px solid #111' : '2px solid transparent',
                    outlineOffset: 2,
                  }}
                >
                  <img src={p} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          <div>
            <h1 style={{ fontSize: 26, fontWeight: 700, margin: '0 0 4px' }}>
              {listing.brand}
            </h1>
            <div style={{ fontSize: 18, color: '#444', marginBottom: 4 }}>{listing.model}</div>
            {listing.reference && (
              <div style={{ fontSize: 13, color: '#888' }}>Ref. {listing.reference}</div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <DetailRow label="Price tier" value={TIER_LABELS[listing.price_tier] || listing.price_tier} />
            <DetailRow
              label="Location"
              value={`${GEO_ICONS[listing.geo_scope]} ${country} · ${GEO_LABELS[listing.geo_scope] || listing.geo_scope}`}
            />
            <DetailRow label="Open to top-up" value={listing.open_to_topup ? 'Yes' : 'No'} />
            {ownerName && <DetailRow label="Listed by" value={ownerName} />}
          </div>

          {isOwn ? (
            <div style={{
              background: '#f3f4f6', borderRadius: 12, padding: '16px',
              fontSize: 14, color: '#666', textAlign: 'center',
            }}>
              This is your listing
            </div>
          ) : (
            <button
              onClick={handleLike}
              disabled={liked || liking}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: 10, padding: '14px 24px', borderRadius: 12,
                border: liked ? '2px solid #fca5a5' : '2px solid #111',
                background: liked ? '#fef2f2' : '#111',
                color: liked ? '#dc2626' : '#fff',
                fontSize: 16, fontWeight: 600,
                cursor: liked || liking ? 'default' : 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <span style={{ fontSize: 20 }}>{liked ? '❤️' : '🤍'}</span>
              {liked ? "You're interested" : liking ? 'Saving…' : "I'm interested"}
            </button>
          )}

          {!isOwn && (
            <button
              onClick={() => setReportOpen(true)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 12, color: '#bbb', textDecoration: 'underline',
                alignSelf: 'flex-start',
              }}
            >
              Report this listing
            </button>
          )}
        </div>
      </div>

      <ReportModal
        isOpen={reportOpen}
        onClose={() => setReportOpen(false)}
        onSubmit={handleSubmitReport}
      />
    </div>
  )
}

function DetailRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 16 }}>
      <span style={{ fontSize: 13, color: '#888', flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 14, color: '#111', fontWeight: 500, textAlign: 'right' }}>{value}</span>
    </div>
  )
}
