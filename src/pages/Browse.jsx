import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import { useAuth } from '../context/auth-context'
import { useBadges } from '../context/badge-context'
import { useToast } from '../context/toast-context'
import { PhotoBox, TierBadge, Flag, AnonToken, TIERS, GEO_LABELS } from '../components/primitives'

const gold    = '#A9823F'
const ink     = '#1C1B19'
const ink2    = '#6E6A62'
const ink3    = '#A6A199'
const stroke  = '#E2DED6'
const surface = '#FFFFFF'
const surface2= '#F0EEE9'
const bg      = '#FBFAF8'
const strokeMd= '#D4CFC5'
const sans    = "'Inter', system-ui, sans-serif"
const mono    = "'Spline Sans Mono', ui-monospace, monospace"
const serif   = "'Cormorant Garamond', serif"

// ── Dropdown filter pill ───────────────────────────────────────────────────
function Dropdown({ label, value, setValue, options }) {
  const [open, setOpen] = useState(false)
  const isDefault = value === options[0]
  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => setOpen(o => !o)} style={{
        all: 'unset', cursor: 'pointer',
        fontFamily: sans, fontSize: 12.5, borderRadius: 999, padding: '8px 14px',
        border: `1px solid ${isDefault ? stroke : gold}`,
        color: isDefault ? ink2 : gold,
        background: isDefault ? 'transparent' : `${gold}12`,
        display: 'inline-flex', gap: 8,
      }}>
        {isDefault ? label : value} <span style={{ opacity: .6 }}>▾</span>
      </button>
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 18 }} />
          <div style={{
            position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 19,
            background: surface, border: `1px solid ${stroke}`,
            borderRadius: 10, padding: 6, minWidth: 150,
            boxShadow: '0 16px 40px -16px rgba(0,0,0,.35)',
          }}>
            {options.map(o => (
              <button key={o} onClick={() => { setValue(o); setOpen(false) }} style={{
                all: 'unset', cursor: 'pointer', display: 'block', width: '100%',
                boxSizing: 'border-box', fontFamily: sans, fontSize: 13,
                padding: '8px 10px', borderRadius: 7,
                color: value === o ? gold : ink,
                background: value === o ? `${gold}10` : 'transparent',
              }}>{o}</button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ── WatchDrawer ────────────────────────────────────────────────────────────
function WatchDrawer({ listing, liked, onLike, onClose }) {
  if (!listing) return null
  const tier = TIERS[listing.price_tier] || {}
  const geoLabel = GEO_LABELS[listing.geo_scope] || listing.geo_scope || '—'
  const country = listing.profiles?.country || '—'
  const mainPhoto = listing.photos?.[0]

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 70, display: 'flex', justifyContent: 'flex-end' }}>
      <div onClick={onClose} style={{
        position: 'absolute', inset: 0,
        background: 'rgba(28,27,25,.34)', animation: 'fadeIn .2s ease',
      }} />
      <div style={{
        position: 'relative', width: 'min(440px, 92vw)', height: '100%',
        background: bg, borderLeft: `1px solid ${stroke}`,
        boxShadow: '-20px 0 50px -20px rgba(0,0,0,.4)',
        overflowY: 'auto', animation: 'slideIn .28s cubic-bezier(.2,.8,.2,1)',
      }}>
        {/* sticky sub-bar */}
        <div style={{
          position: 'sticky', top: 0, display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', padding: '14px 18px',
          background: 'rgba(251,250,248,.9)', backdropFilter: 'blur(8px)',
          borderBottom: `1px solid ${stroke}`,
        }}>
          <span style={{ fontFamily: mono, fontSize: 10.5, letterSpacing: '.12em', color: ink3, textTransform: 'uppercase' }}>
            Listing detail
          </span>
          <button onClick={onClose} style={{ all: 'unset', cursor: 'pointer', fontSize: 18, color: ink2, lineHeight: 1 }}>✕</button>
        </div>

        <div style={{ padding: 18 }}>
          <PhotoBox h={260} big src={mainPhoto} label="watch photo · 1 / 4" />
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            {[0,1,2,3].map(i => (
              <PhotoBox key={i} h={56} w={56} r={6} src={listing.photos?.[i+1]} />
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 18, gap: 12 }}>
            <div>
              <div style={{ fontFamily: mono, fontSize: 10.5, letterSpacing: '.08em', color: ink3, textTransform: 'uppercase' }}>
                {listing.brand}
              </div>
              <div style={{ fontFamily: serif, fontSize: 27, fontWeight: 600, color: ink, marginTop: 3 }}>
                {listing.model}
              </div>
            </div>
            <TierBadge tier={listing.price_tier} />
          </div>

          {/* 2-col detail grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 20px', marginTop: 20 }}>
            {[
              ['Reference',       listing.reference || '—'],
              ['Price tier',      tier.range || '—'],
              ['Location',        country],
              ['Geographic scope',geoLabel],
              ['Open to top-up',  listing.open_to_topup ? 'Yes ⇅' : 'Straight swap'],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <span style={{ fontFamily: mono, fontSize: 9.5, letterSpacing: '.07em', color: ink3, textTransform: 'uppercase' }}>{k}</span>
                <span style={{ fontFamily: sans, fontSize: 14.5, color: ink, fontWeight: 500 }}>{v}</span>
              </div>
            ))}
          </div>

          <div style={{ height: 1, background: stroke, margin: '20px 0' }} />

          <span style={{ fontFamily: mono, fontSize: 9.5, letterSpacing: '.07em', color: ink3, textTransform: 'uppercase' }}>
            Wants in return
          </span>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
            {(listing.wanted_references || []).map(t => (
              <span key={t} style={{
                fontFamily: sans, fontSize: 12, color: ink2,
                border: `1px solid ${stroke}`, borderRadius: 999, padding: '6px 12px',
              }}>{t}</span>
            ))}
            {(!listing.wanted_references?.length) && (
              <span style={{ fontFamily: sans, fontSize: 12, color: ink3 }}>Not specified</span>
            )}
          </div>

          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: surface2, borderRadius: 10, padding: '12px 14px', marginTop: 22,
          }}>
            <AnonToken size={30} />
            <span style={{ fontFamily: sans, fontSize: 12.5, color: ink2, lineHeight: 1.4 }}>
              Owner stays anonymous until you both like each other's watch.
            </span>
          </div>

          <button onClick={() => onLike(listing.id)} style={{
            all: 'unset', cursor: 'pointer', boxSizing: 'border-box',
            marginTop: 18, width: '100%', textAlign: 'center',
            fontFamily: sans, fontSize: 15, fontWeight: 600,
            padding: '14px 0', borderRadius: 10,
            color: liked ? gold : '#fff',
            background: liked ? `${gold}16` : gold,
            border: `1px solid ${gold}`,
            transition: 'all .16s ease',
          }}>
            {liked ? '♥  Liked — waiting for them' : '♡  Like this watch'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── WatchCard ──────────────────────────────────────────────────────────────
function WatchCard({ listing, liked, onLike, onOpen }) {
  const geoLabel = GEO_LABELS[listing.geo_scope] || listing.geo_scope || ''
  const country = listing.profiles?.country || '—'
  const mainPhoto = listing.photos?.[0]

  return (
    <div onClick={onOpen} style={{
      cursor: 'pointer', background: surface,
      border: `1px solid ${liked ? gold + '88' : stroke}`,
      borderRadius: 12, overflow: 'hidden',
      boxShadow: liked
        ? `0 10px 30px -14px ${gold}77`
        : '0 10px 26px -18px rgba(0,0,0,.4)',
      transition: 'transform .18s ease, box-shadow .18s ease, border-color .18s ease',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)' }}
    >
      <div style={{ position: 'relative' }}>
        <PhotoBox h={188} r={0} src={mainPhoto} label="" />
        <span style={{ position: 'absolute', top: 12, left: 12 }}>
          <TierBadge tier={listing.price_tier} />
        </span>
        <button
          onClick={e => { e.stopPropagation(); onLike(listing.id) }}
          aria-label="Like"
          style={{
            all: 'unset', cursor: 'pointer',
            position: 'absolute', top: 10, right: 10,
            width: 38, height: 38, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18,
            background: liked ? gold : 'rgba(255,255,255,.9)',
            color: liked ? '#fff' : ink2,
            border: `1px solid ${liked ? gold : stroke}`,
            boxShadow: liked ? `0 0 0 5px ${gold}22` : '0 2px 8px -2px rgba(0,0,0,.2)',
            transition: 'all .16s ease',
          }}
        >{liked ? '♥' : '♡'}</button>
      </div>

      <div style={{ padding: '14px 15px 15px' }}>
        <div style={{ fontFamily: mono, fontSize: 10, letterSpacing: '.08em', color: ink3, textTransform: 'uppercase' }}>
          {listing.brand}
        </div>
        <div style={{ fontFamily: serif, fontSize: 21, fontWeight: 600, color: ink, marginTop: 3 }}>
          {listing.model}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 13 }}>
          <Flag code={country} />
          <span style={{ width: 1, height: 12, background: stroke }} />
          {listing.open_to_topup && <span title="Open to top-up" style={{ color: gold, fontSize: 13 }}>⇅</span>}
          <span style={{ fontFamily: sans, fontSize: 11.5, color: ink2 }}>{geoLabel}</span>
          <span style={{ flex: 1 }} />
          <AnonToken size={22} />
        </div>
      </div>
    </div>
  )
}

// ── Browse page ────────────────────────────────────────────────────────────
const TIER_OPTS = ['Any tier', 'Entry', 'Mid', 'High', 'Ultra']
const GEO_OPTS  = ['Anywhere', 'DE', 'GB', 'US']

export default function Browse() {
  const { user } = useAuth()
  const navigate  = useNavigate()
  const { refresh: refreshBadges } = useBadges()
  const { flash } = useToast()

  const [listings,   setListings]   = useState([])
  const [myListing,  setMyListing]  = useState(null)
  const [likedIds,   setLikedIds]   = useState(new Set())
  const [matchedIds, setMatchedIds] = useState(new Set())
  const [loading,    setLoading]    = useState(true)
  const [drawer,     setDrawer]     = useState(null)

  const [tier,     setTier]     = useState('Any tier')
  const [geo,      setGeo]      = useState('Anywhere')
  const [topupOnly,setTopupOnly]= useState(false)

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    setLoading(true)
    if (user) {
      const { data: mine } = await supabase
        .from('listings').select('id').eq('user_id', user.id).eq('is_active', true).single()
      setMyListing(mine)

      const { data: myLikes } = await supabase
        .from('likes').select('to_listing').eq('from_user', user.id)
      const likedSet = new Set((myLikes || []).map(l => l.to_listing))

      const { data: myMatches } = await supabase
        .from('matches').select('user_a, listing_a, listing_b, status')
        .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
      const matchedSet = new Set()
      for (const m of myMatches || []) {
        const theirListing = m.user_a === user.id ? m.listing_b : m.listing_a
        if (m.status === 'active') matchedSet.add(theirListing)
        else likedSet.delete(theirListing)
      }
      setLikedIds(likedSet)
      setMatchedIds(matchedSet)
    }

    let query = supabase
      .from('listings')
      .select('id, brand, model, reference, price_tier, geo_scope, open_to_topup, photos, wanted_references, user_id, profiles!listings_user_id_fkey(country)')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (user) query = query.neq('user_id', user.id)
    const { data: all } = await query
    setListings(all || [])
    setLoading(false)
  }

  async function handleLike(listingId) {
    if (!user) { navigate('/login'); return }
    if (!myListing) {
      flash('Add your watch first to like others.')
      navigate('/create-listing')
      return
    }
    if (matchedIds.has(listingId)) return

    if (likedIds.has(listingId)) {
      await supabase.from('likes').delete().eq('from_user', user.id).eq('to_listing', listingId)
      setLikedIds(prev => { const n = new Set(prev); n.delete(listingId); return n })
      if (drawer?.id === listingId) setDrawer(prev => ({ ...prev }))
      return
    }

    await supabase.from('likes').upsert(
      { from_user: user.id, to_listing: listingId },
      { onConflict: 'from_user,to_listing', ignoreDuplicates: true }
    )

    const theirListing = listings.find(l => l.id === listingId)
    if (theirListing) {
      const { data: theirLike } = await supabase
        .from('likes').select('from_user')
        .eq('from_user', theirListing.user_id).eq('to_listing', myListing.id).maybeSingle()

      if (theirLike) {
        const { error: matchErr } = await supabase.from('matches').insert({
          listing_a: myListing.id, listing_b: listingId,
          user_a: user.id,         user_b: theirListing.user_id,
        })
        if (!matchErr) {
          setMatchedIds(prev => new Set([...prev, listingId]))
          flash("It's a match! Go to your matches to start chatting.")
          refreshBadges()
        }
      } else {
        flash("Liked — we'll tell you if it's mutual.")
      }
    }

    setLikedIds(prev => new Set([...prev, listingId]))
  }

  const list = listings.filter(l =>
    (tier === 'Any tier' || (TIERS[l.price_tier]?.label === tier)) &&
    (geo === 'Anywhere'  || (l.profiles?.country?.toUpperCase() === geo)) &&
    (!topupOnly || l.open_to_topup)
  )

  const filtersActive = tier !== 'Any tier' || geo !== 'Anywhere' || topupOnly
  function clearFilters() { setTier('Any tier'); setGeo('Anywhere'); setTopupOnly(false) }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: ink3, fontFamily: sans, fontSize: 14 }}>
      Loading watches…
    </div>
  )

  return (
    <div style={{ maxWidth: 1180, margin: '0 auto', padding: '26px 26px 40px' }}>
      {/* page head */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ margin: 0, fontFamily: serif, fontWeight: 600, fontSize: 32, color: ink, lineHeight: 1, whiteSpace: 'nowrap' }}>
            Browse the floor
          </h1>
          <span style={{ fontFamily: sans, fontSize: 13, color: ink3 }}>
            {list.length} watches open to swap · identities hidden until you match
          </span>
        </div>
      </div>

      {/* filter bar */}
      <div style={{
        display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap',
        margin: '20px 0 0', paddingBottom: 18, borderBottom: `1px solid ${stroke}`,
      }}>
        <Dropdown label="Price tier" value={tier} setValue={setTier} options={TIER_OPTS} />
        <Dropdown label="Geography"  value={geo}  setValue={setGeo}  options={GEO_OPTS} />
        <button onClick={() => setTopupOnly(v => !v)} style={{
          all: 'unset', cursor: 'pointer',
          fontFamily: sans, fontSize: 12.5, borderRadius: 999, padding: '8px 14px',
          border: `1px solid ${topupOnly ? gold : stroke}`,
          color: topupOnly ? gold : ink2,
          background: topupOnly ? `${gold}12` : 'transparent',
          display: 'inline-flex', gap: 6,
        }}>⇅ Open to top-up</button>
        <span style={{ flex: 1 }} />
        {filtersActive && (
          <button onClick={clearFilters} style={{
            all: 'unset', cursor: 'pointer', fontFamily: sans, fontSize: 12.5, color: ink3,
          }}>Clear ✕</button>
        )}
      </div>

      {/* grid */}
      {list.length > 0 ? (
        <div className="browse-grid" style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginTop: 22,
        }}>
          {list.map(l => (
            <WatchCard
              key={l.id}
              listing={l}
              liked={likedIds.has(l.id)}
              onLike={handleLike}
              onOpen={() => setDrawer(l)}
            />
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '60px 0', color: ink3, fontFamily: sans, fontSize: 14 }}>
          {filtersActive ? 'No watches match these filters.' : 'No watches listed yet.'}
        </div>
      )}

      <WatchDrawer
        listing={drawer}
        liked={drawer ? likedIds.has(drawer.id) : false}
        onLike={handleLike}
        onClose={() => setDrawer(null)}
      />
    </div>
  )
}
