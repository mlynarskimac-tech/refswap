import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import { useAuth } from '../context/auth-context'
import { useToast } from '../context/toast-context'
import { unwrap } from '../lib/db'
import { GEO_LABELS, TIERS, PhotoGallery } from '../components/primitives'

// ── The Vault × Manufacture — soft ──────────────────────────────────────────
const bg      = '#F6F6F3'
const card    = '#FFFFFF'
const accent  = '#274C6B'
const accentHover = '#1E3C56'
const ink     = '#16181B'
const inkSoft = 'rgba(22,24,27,0.55)'
const sans    = "'Inter', system-ui, sans-serif"
const serif   = "'Fraunces', serif"
const red     = '#C0392B'

const cardShadow = '0 8px 30px rgba(22,24,27,0.08)'

export default function MyWatch() {
  const { user }  = useAuth()
  const navigate  = useNavigate()
  const { flash } = useToast()
  const [listing, setListing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [deleting,setDeleting]= useState(false)

  useEffect(() => {
    supabase.from('listings').select('*')
      .eq('user_id', user.id).eq('is_active', true).maybeSingle()
      .then(result => { setListing(unwrap(result, 'MyWatch: fetch my listing')); setLoading(false) })
  }, [user.id])

  async function handleDelete() {
    if (!window.confirm('Remove this listing? You can always add a new one.')) return
    setDeleting(true)
    const { error } = await supabase.from('listings').update({ is_active: false }).eq('id', listing.id)
    if (error) {
      console.error('[MyWatch: delete listing]', error)
      flash("Couldn't remove listing — try again.")
      setDeleting(false)
      return
    }
    setListing(null); setDeleting(false)
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: inkSoft, fontFamily: sans, fontSize: 14 }}>
      Loading…
    </div>
  )

  if (!listing) return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '26px 26px 40px' }}>
      <h1 style={{ margin: '0 0 20px', fontFamily: serif, fontWeight: 500, fontSize: 28, color: ink }}>My listing</h1>
      <div style={{
        background: card, borderRadius: 22, boxShadow: cardShadow,
        padding: '64px 24px', textAlign: 'center',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
      }}>
        <span style={{ fontFamily: serif, fontSize: 22, color: ink }}>No active listing</span>
        <span style={{ fontFamily: sans, fontSize: 13.5, color: inkSoft, lineHeight: 1.5 }}>
          List your watch to start swapping.
        </span>
        <button
          onClick={() => navigate('/create-listing')}
          onMouseEnter={e => { e.currentTarget.style.background = accentHover }}
          onMouseLeave={e => { e.currentTarget.style.background = accent }}
          style={{
            all: 'unset', cursor: 'pointer', fontFamily: sans, fontSize: 15,
            color: '#fff', background: accent, borderRadius: 99, padding: '14px 28px', marginTop: 8,
            transition: 'background 300ms ease',
          }}
        >List my watch</button>
      </div>
    </div>
  )

  const photos = listing.photos || []
  const tier   = TIERS[listing.price_tier] || {}
  const geo    = GEO_LABELS[listing.geo_scope] || listing.geo_scope || '—'

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '26px 26px 40px' }}>
      {/* page head */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontFamily: serif, fontWeight: 500, fontSize: 28, color: ink }}>
          My listing
        </h1>
        {listing.is_active && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: sans, fontSize: 13,
            color: accent, background: `${accent}12`, borderRadius: 999, padding: '7px 14px',
          }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: accent }} />Active
          </span>
        )}
      </div>

      <div style={{ background: card, borderRadius: 22, boxShadow: cardShadow, padding: 32, boxSizing: 'border-box' }}>
        {/* photo gallery */}
        <PhotoGallery key={listing.id} photos={photos} mainHeight={380} mainHeightMobile={280} />

        {/* title block */}
        <div style={{ marginTop: 22 }}>
          <div style={{ fontFamily: sans, fontSize: 11, letterSpacing: '.1em', color: accent, textTransform: 'uppercase' }}>
            {listing.brand} · {tier.fullLabel || tier.label || ''}
          </div>
          <div style={{ fontFamily: serif, fontSize: 26, color: ink, marginTop: 4 }}>
            {listing.model}
          </div>
        </div>

        {/* details */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 24px', marginTop: 22 }}>
          {[
            ['Reference',       listing.reference || '—'],
            ['Price tier',      tier.range || '—'],
            ['Geographic scope',geo],
            ['Open to top-up',  listing.open_to_topup ? 'Yes' : 'Straight swap'],
          ].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <span style={{ fontFamily: sans, fontSize: 12, color: inkSoft }}>{k}</span>
              <span style={{ fontFamily: sans, fontSize: 15, color: ink, fontWeight: 500 }}>{v}</span>
            </div>
          ))}
        </div>

        <div style={{ height: 1, background: 'rgba(22,24,27,0.08)', margin: '24px 0' }} />

        <div style={{ fontFamily: serif, fontSize: 18, color: ink }}>Wanted in return</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
          {(listing.wanted_references || []).map(t => (
            <span key={t} style={{
              fontFamily: sans, fontSize: 13, color: ink,
              background: bg, borderRadius: 999, padding: '7px 14px',
            }}>{t}</span>
          ))}
          {(!listing.wanted_references?.length) && (
            <span style={{ fontFamily: sans, fontSize: 13, color: inkSoft }}>None specified</span>
          )}
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
          <button
            onClick={() => navigate('/create-listing')}
            onMouseEnter={e => { e.currentTarget.style.background = accentHover }}
            onMouseLeave={e => { e.currentTarget.style.background = accent }}
            style={{
              all: 'unset', cursor: 'pointer', fontFamily: sans, fontSize: 14,
              color: '#fff', background: accent, borderRadius: 99, padding: '12px 22px',
              transition: 'background 300ms ease',
            }}
          >Edit listing</button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            onMouseEnter={e => { if (!deleting) { e.currentTarget.style.background = red; e.currentTarget.style.color = '#fff' } }}
            onMouseLeave={e => { if (!deleting) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = red } }}
            style={{
              all: 'unset', cursor: deleting ? 'default' : 'pointer', fontFamily: sans, fontSize: 14,
              color: red, border: `1px solid ${red}`, borderRadius: 99, padding: '12px 22px',
              opacity: deleting ? 0.4 : 1,
              transition: 'background 300ms ease, color 300ms ease',
            }}
          >{deleting ? 'Removing…' : 'Delete'}</button>
        </div>
      </div>
    </div>
  )
}
