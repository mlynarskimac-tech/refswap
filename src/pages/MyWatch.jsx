import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import { useAuth } from '../context/auth-context'
import { PhotoBox, TierBadge, GEO_LABELS, TIERS } from '../components/primitives'

const gold    = '#A9823F'
const ink     = '#1C1B19'
const ink2    = '#6E6A62'
const ink3    = '#A6A199'
const stroke  = '#E2DED6'
const green   = '#3F9D6E'
const red     = '#D24B4B'
const sans    = "'Inter', system-ui, sans-serif"
const serif   = "'Cormorant Garamond', serif"
const mono    = "'Spline Sans Mono', ui-monospace, monospace"

export default function MyWatch() {
  const { user }  = useAuth()
  const navigate  = useNavigate()
  const [listing, setListing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [deleting,setDeleting]= useState(false)

  useEffect(() => {
    supabase.from('listings').select('*')
      .eq('user_id', user.id).eq('is_active', true).maybeSingle()
      .then(({ data }) => { setListing(data); setLoading(false) })
  }, [user.id])

  async function handleDelete() {
    if (!window.confirm('Remove this listing? You can always add a new one.')) return
    setDeleting(true)
    await supabase.from('listings').update({ is_active: false }).eq('id', listing.id)
    setListing(null); setDeleting(false)
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: ink3, fontFamily: sans, fontSize: 14 }}>
      Loading…
    </div>
  )

  if (!listing) return (
    <div style={{ maxWidth: 1180, margin: '0 auto', padding: '26px 26px 40px' }}>
      <h1 style={{ fontFamily: serif, fontWeight: 600, fontSize: 32, color: ink, margin: '0 0 8px' }}>My listing</h1>
      <div style={{
        marginTop: 40, border: `1px dashed #D4CFC5`, borderRadius: 16,
        padding: '60px 24px', textAlign: 'center',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
      }}>
        <span style={{ fontSize: 40, color: ink3 }}>⌚</span>
        <span style={{ fontFamily: serif, fontSize: 24, color: ink }}>No active listing</span>
        <span style={{ fontFamily: sans, fontSize: 13.5, color: ink3, lineHeight: 1.5 }}>
          List your watch to start swapping.
        </span>
        <button onClick={() => navigate('/create-listing')} style={{
          all: 'unset', cursor: 'pointer', fontFamily: sans, fontSize: 14, fontWeight: 600,
          color: '#fff', background: gold, borderRadius: 8, padding: '12px 28px', marginTop: 8,
        }}>List my watch</button>
      </div>
    </div>
  )

  const photos = listing.photos || []
  const tier   = TIERS[listing.price_tier] || {}
  const geo    = GEO_LABELS[listing.geo_scope] || listing.geo_scope || '—'

  return (
    <div style={{ maxWidth: 1180, margin: '0 auto', padding: '26px 26px 40px' }}>
      {/* page head */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap' }}>
        <h1 style={{ margin: 0, fontFamily: serif, fontWeight: 600, fontSize: 32, color: ink, lineHeight: 1 }}>
          My listing
        </h1>
        {listing.is_active && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: sans, fontSize: 13,
            color: green, border: `1px solid ${green}44`, background: `${green}10`,
            borderRadius: 999, padding: '7px 14px',
          }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: green }} />Active
          </span>
        )}
      </div>

      <div className="mywatch-grid" style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 30, marginTop: 24 }}>
        {/* Left: photos */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <PhotoBox h={320} big src={photos[0]} label="watch photo · main" />
          <div style={{ display: 'flex', gap: 10 }}>
            {[1, 2, 3].map(i => (
              <PhotoBox key={i} h={74} r={8} src={photos[i]} style={{ flex: 1 }} />
            ))}
          </div>
        </div>

        {/* Right: details */}
        <div>
          <div style={{ fontFamily: mono, fontSize: 11, letterSpacing: '.1em', color: ink3, textTransform: 'uppercase' }}>
            {listing.brand} · {tier.fullLabel || tier.label || ''}
          </div>
          <div style={{ fontFamily: serif, fontSize: 30, fontWeight: 600, color: ink, margin: '6px 0 18px' }}>
            {listing.model}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px 26px', maxWidth: 460 }}>
            {[
              ['Reference',       listing.reference || '—'],
              ['Price tier',      tier.range || '—'],
              ['Geographic scope',geo],
              ['Open to top-up',  listing.open_to_topup ? 'Yes ⇅' : 'Straight swap'],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span style={{ fontFamily: mono, fontSize: 9.5, letterSpacing: '.07em', color: ink3, textTransform: 'uppercase' }}>{k}</span>
                <span style={{ fontFamily: sans, fontSize: 15, color: ink, fontWeight: 500 }}>{v}</span>
              </div>
            ))}
          </div>

          <div style={{ height: 1, background: stroke, margin: '22px 0' }} />

          <span style={{ fontFamily: mono, fontSize: 9.5, letterSpacing: '.07em', color: ink3, textTransform: 'uppercase' }}>
            Wanted in return
          </span>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
            {(listing.wanted_references || []).map(t => (
              <span key={t} style={{
                fontFamily: sans, fontSize: 12.5, color: ink2,
                border: `1px solid ${stroke}`, borderRadius: 999, padding: '6px 12px',
              }}>{t}</span>
            ))}
            {(!listing.wanted_references?.length) && (
              <span style={{ fontFamily: sans, fontSize: 12.5, color: ink3 }}>None specified</span>
            )}
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
            <button onClick={() => navigate('/create-listing')} style={{
              all: 'unset', cursor: 'pointer', fontFamily: sans, fontSize: 13.5,
              color: gold, border: `1px solid ${gold}`, borderRadius: 8, padding: '11px 20px',
            }}>Edit listing</button>
            <button onClick={handleDelete} disabled={deleting} style={{
              all: 'unset', cursor: deleting ? 'default' : 'pointer', fontFamily: sans, fontSize: 13.5,
              color: red, border: `1px solid ${red}55`, borderRadius: 8, padding: '11px 20px',
              opacity: deleting ? 0.5 : 1,
            }}>{deleting ? 'Removing…' : 'Delete'}</button>
          </div>
        </div>
      </div>
    </div>
  )
}
