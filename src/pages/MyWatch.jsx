import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import { useAuth } from '../context/auth-context'

const TIER_LABELS = {
  entry: '3k–6k EUR',
  mid: '6k–12k EUR',
  high: '12k–25k EUR',
  ultra: '25k–50k EUR',
}

const GEO_LABELS = {
  local: 'Local (same country)',
  europe: 'Europe',
  global: 'Global',
}

export default function MyWatch() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [listing, setListing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    supabase
      .from('listings')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .maybeSingle()
      .then(({ data }) => {
        setListing(data)
        setLoading(false)
      })
  }, [user.id])

  async function handleDelete() {
    if (!window.confirm('Remove this listing? You can always add a new one.')) return
    setDeleting(true)
    await supabase
      .from('listings')
      .update({ is_active: false })
      .eq('id', listing.id)
    setListing(null)
    setDeleting(false)
  }

  if (loading) return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: 'calc(100vh - 60px)', color: '#353545', fontSize: 14,
    }}>
      Loading…
    </div>
  )

  if (!listing) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        height: 'calc(100vh - 60px)', gap: 14,
      }}>
        <div style={{ fontSize: 40, opacity: 0.2 }}>⌚</div>
        <p style={{ color: '#353548', fontSize: 14 }}>You don't have an active listing.</p>
        <button
          onClick={() => navigate('/create-listing')}
          style={{
            background: '#C9A84C', color: '#0B0A07',
            border: 'none', borderRadius: 8,
            padding: '10px 24px', fontSize: 13, fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          List my watch
        </button>
      </div>
    )
  }

  const photos = listing.photos || []

  return (
    <div style={{ background: '#0B0B14', minHeight: 'calc(100vh - 60px)' }}>
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '40px 24px' }}>

        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#F0EDE8' }}>My Watch</h1>
          <p style={{ color: '#353548', fontSize: 13, marginTop: 4 }}>Your active listing</p>
        </div>

        <div style={{
          background: '#111120',
          border: '1px solid #1A1A28',
          borderRadius: 20,
          overflow: 'hidden',
        }}>
          {/* Photos */}
          {photos.length > 0 && (
            <div style={{
              aspectRatio: '16/9',
              background: '#0D0D1A',
              overflow: 'hidden',
              position: 'relative',
            }}>
              <img
                src={photos[0]}
                alt="Watch"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
              {photos.length > 1 && (
                <div style={{
                  position: 'absolute', bottom: 12, right: 12,
                  background: 'rgba(11,11,20,0.75)',
                  borderRadius: 6, padding: '3px 10px',
                  fontSize: 11, color: '#7A7A8C',
                  backdropFilter: 'blur(4px)',
                }}>
                  +{photos.length - 1} more
                </div>
              )}
            </div>
          )}

          {photos.length > 1 && (
            <div style={{ display: 'flex', gap: 6, padding: '12px 16px 0', overflowX: 'auto' }}>
              {photos.slice(1).map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt=""
                  style={{
                    width: 60, height: 60, objectFit: 'cover', borderRadius: 8,
                    border: '1px solid #1E1E2C', flexShrink: 0,
                  }}
                />
              ))}
            </div>
          )}

          {/* Details */}
          <div style={{ padding: '24px 24px 28px' }}>
            <div style={{ marginBottom: 20 }}>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: '#F0EDE8', marginBottom: 2 }}>
                {listing.brand}
              </h2>
              <div style={{ fontSize: 15, color: '#525265' }}>
                {listing.model}
                {listing.reference && (
                  <span style={{ color: '#2A2A3A' }}> · Ref. {listing.reference}</span>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <DetailRow label="Value range" value={TIER_LABELS[listing.price_tier] || listing.price_tier} />
              <DetailRow label="Geo scope" value={GEO_LABELS[listing.geo_scope] || listing.geo_scope} />
              <DetailRow label="Open to top-up" value={listing.open_to_topup ? 'Yes' : 'No'} />
              {listing.wanted_references?.length > 0 && (
                <DetailRow
                  label="Wanted references"
                  value={listing.wanted_references.join(', ')}
                />
              )}
            </div>

            <div style={{
              marginTop: 28, paddingTop: 20,
              borderTop: '1px solid #161624',
              display: 'flex', gap: 10,
            }}>
              <button
                onClick={() => navigate('/create-listing')}
                style={{
                  flex: 1,
                  background: 'transparent', color: '#525265',
                  border: '1px solid #1E1E2C', borderRadius: 8,
                  padding: '10px 0', fontSize: 13, fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Replace listing
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                style={{
                  flex: 1,
                  background: 'transparent', color: '#5A2525',
                  border: '1px solid #2A1A1A', borderRadius: 8,
                  padding: '10px 0', fontSize: 13, fontWeight: 600,
                  cursor: deleting ? 'not-allowed' : 'pointer',
                  opacity: deleting ? 0.5 : 1,
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.06)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
              >
                {deleting ? 'Removing…' : 'Remove listing'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function DetailRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 16 }}>
      <span style={{ fontSize: 12, color: '#2A2A3A', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, flexShrink: 0 }}>
        {label}
      </span>
      <span style={{ fontSize: 13, color: '#7A7A8C', textAlign: 'right' }}>{value}</span>
    </div>
  )
}
