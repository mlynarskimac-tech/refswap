import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import { useAuth } from '../context/auth-context'
import { useBadges } from '../context/badge-context'
import { useToast } from '../context/toast-context'
import { unwrap } from '../lib/db'
import { TIERS, GEO_LABELS, PhotoGallery } from '../components/primitives'
import ReportModal from '../components/ReportModal'

// ── The Vault × Manufacture — soft ──────────────────────────────────────────
const bg      = '#F6F6F3'
const card    = '#FFFFFF'
const accent  = '#274C6B'
const ink     = '#16181B'
const inkSoft = 'rgba(22,24,27,0.55)'
const sans    = "'Inter', system-ui, sans-serif"
const serif   = "'Fraunces', serif"

const cardShadow      = '0 8px 30px rgba(22,24,27,0.08)'
const cardShadowHover = '0 20px 46px rgba(22,24,27,0.16)'
const pillShadow      = '0 4px 16px rgba(22,24,27,0.08)'

// ── Dropdown filter pill ───────────────────────────────────────────────────
function Dropdown({ label, value, setValue, options }) {
  const [open, setOpen] = useState(false)
  const isDefault = value === options[0]
  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => setOpen(o => !o)} style={{
        all: 'unset', cursor: 'pointer',
        fontFamily: sans, fontSize: 14, borderRadius: 99, padding: '10px 18px',
        color: isDefault ? ink : '#fff',
        background: isDefault ? card : accent,
        boxShadow: isDefault ? pillShadow : `0 8px 22px ${accent}40`,
        display: 'inline-flex', alignItems: 'center', gap: 8,
        transition: 'all 300ms ease',
      }}>
        {isDefault ? label : value} <span style={{ opacity: .6, fontSize: 11 }}>▾</span>
      </button>
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 18 }} />
          <div style={{
            position: 'absolute', top: 'calc(100% + 8px)', left: 0, zIndex: 19,
            background: card, borderRadius: 16, padding: 6, minWidth: 150,
            boxShadow: '0 24px 60px -16px rgba(22,24,27,0.24)',
          }}>
            {options.map(o => (
              <button key={o} onClick={() => { setValue(o); setOpen(false) }} style={{
                all: 'unset', cursor: 'pointer', display: 'block', width: '100%',
                boxSizing: 'border-box', fontFamily: sans, fontSize: 13.5,
                padding: '9px 12px', borderRadius: 10,
                color: value === o ? accent : ink,
                background: value === o ? `${accent}12` : 'transparent',
                transition: 'background 200ms ease',
              }}>{o}</button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ── WatchDrawer ────────────────────────────────────────────────────────────
function WatchDrawer({ listing, liked, onLike, onClose, onReport }) {
  if (!listing) return null
  const geoLabel = GEO_LABELS[listing.geo_scope] || listing.geo_scope || '—'
  const country = listing.profiles?.country || '—'
  const photos = listing.photos || []

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 70, display: 'flex', justifyContent: 'flex-end' }}>
      <div onClick={onClose} style={{
        position: 'absolute', inset: 0,
        background: 'rgba(22,24,27,0.35)', backdropFilter: 'blur(6px)',
        animation: 'fadeIn .3s ease',
      }} />
      <div style={{
        position: 'relative', width: 'min(440px, 92vw)', height: '100%',
        background: card, borderRadius: '28px 0 0 28px',
        boxShadow: '0 24px 80px rgba(22,24,27,0.18)',
        overflowY: 'auto', animation: 'slideIn .35s ease',
      }}>
        {/* sticky sub-bar */}
        <div style={{
          position: 'sticky', top: 0, display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', padding: '18px 22px', zIndex: 1,
          background: 'rgba(255,255,255,.85)', backdropFilter: 'blur(10px)',
        }}>
          <span style={{ fontFamily: sans, fontSize: 11, letterSpacing: '.1em', color: inkSoft, textTransform: 'uppercase' }}>
            Listing detail
          </span>
          <button onClick={onClose} style={{ all: 'unset', cursor: 'pointer', fontSize: 18, color: ink, lineHeight: 1 }}>✕</button>
        </div>

        <div style={{ padding: '4px 22px 26px' }}>
          {/* photo gallery */}
          <PhotoGallery photos={photos} mainHeight={280} />

          {/* title block */}
          <div style={{ marginTop: 22 }}>
            <div style={{ fontFamily: sans, fontSize: 11, letterSpacing: '.12em', color: accent, textTransform: 'uppercase' }}>
              {listing.brand}
            </div>
            <div style={{ fontFamily: serif, fontSize: 28, fontWeight: 600, color: ink, marginTop: 4 }}>
              {listing.model} {listing.reference}
            </div>
          </div>

          {/* meta line */}
          <div style={{ marginTop: 10 }}>
            <TierMeta priceTier={listing.price_tier} />
          </div>
          <div style={{ marginTop: 6, fontFamily: sans, fontSize: 13, color: inkSoft }}>
            {country} · {geoLabel}
          </div>

          {/* top-up */}
          {listing.open_to_topup && (
            <span style={{
              display: 'inline-block', marginTop: 12,
              fontFamily: sans, fontSize: 12, color: ink,
              border: '1px solid rgba(22,24,27,.15)', borderRadius: 99, padding: '5px 14px',
            }}>Open to top-up</span>
          )}

          <div style={{ height: 1, background: 'rgba(22,24,27,.08)', margin: '24px 0' }} />

          {/* wanted references */}
          <div style={{ fontFamily: serif, fontSize: 18, fontWeight: 600, color: ink }}>
            Looking for
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
            {(listing.wanted_references || []).map(t => (
              <div key={t} style={{
                fontFamily: sans, fontSize: 14, color: ink,
                background: bg, borderRadius: 16, padding: '12px 16px',
              }}>{t}</div>
            ))}
            {(!listing.wanted_references?.length) && (
              <div style={{ fontFamily: sans, fontSize: 13, color: inkSoft }}>Not specified</div>
            )}
          </div>

          {/* actions */}
          <div style={{ marginTop: 26, textAlign: 'center' }}>
            <button onClick={() => onLike(listing.id)} className="drawer-like-btn" style={{
              all: 'unset', cursor: 'pointer', boxSizing: 'border-box',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: sans, fontSize: 15, fontWeight: 500,
              padding: '14px 28px', borderRadius: 99,
              color: liked ? accent : '#fff',
              background: liked ? 'rgba(39,76,107,0.12)' : accent,
              transition: 'all 300ms ease',
            }}>
              {liked ? '♥  Liked — waiting for a match' : '♡  Like this watch'}
            </button>
            <button
              onClick={onReport}
              onMouseEnter={e => { e.currentTarget.style.textDecoration = 'underline' }}
              onMouseLeave={e => { e.currentTarget.style.textDecoration = 'none' }}
              style={{
                all: 'unset', cursor: 'pointer', display: 'block',
                margin: '14px auto 0', fontFamily: sans, fontSize: 13, color: inkSoft,
              }}
            >Report this listing</button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── LikeButton ─────────────────────────────────────────────────────────────
// Plain in-flow circle — never overlaid by a photo/gradient, so it can never
// lose clicks to a stacking/pointer-events issue.
function LikeButton({ liked, onLike, listingId, size = 40, fontSize = 17 }) {
  return (
    <button
      onClick={e => { e.stopPropagation(); onLike(listingId) }}
      aria-label="Like"
      style={{
        all: 'unset', cursor: 'pointer', position: 'relative', zIndex: 1,
        width: size, height: size, borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize,
        background: liked ? accent : card,
        color: liked ? '#fff' : ink,
        boxShadow: liked ? `0 0 0 5px ${accent}22` : pillShadow,
        transition: 'all 300ms ease',
        flexShrink: 0,
      }}
    >{liked ? '♥' : '♡'}</button>
  )
}

// ── Tier meta line ─────────────────────────────────────────────────────────
function TierMeta({ priceTier }) {
  const tier = TIERS[priceTier] || { fullLabel: priceTier, range: '' }
  return (
    <div style={{
      fontFamily: sans, fontSize: 11, letterSpacing: '.12em', textTransform: 'uppercase',
      color: accent,
    }}>
      {tier.fullLabel}{tier.range ? ` · ${tier.range}` : ''}
    </div>
  )
}

// ── WatchCard ──────────────────────────────────────────────────────────────
function WatchCard({ listing, liked, onLike, onOpen }) {
  const country = listing.profiles?.country || null
  const mainPhoto = listing.photos?.[0]

  function handleEnter(e) {
    e.currentTarget.style.transform = 'translateY(-4px)'
    e.currentTarget.style.boxShadow = cardShadowHover
  }
  function handleLeave(e) {
    e.currentTarget.style.transform = 'translateY(0)'
    e.currentTarget.style.boxShadow = cardShadow
  }

  return (
    <div onClick={onOpen} onMouseEnter={handleEnter} onMouseLeave={handleLeave} style={{
      cursor: 'pointer', borderRadius: 22, overflow: 'hidden', background: card,
      boxShadow: cardShadow,
      transition: 'transform 400ms ease, box-shadow 400ms ease',
    }}>
      <div style={{ aspectRatio: '4 / 3', background: mainPhoto ? card : accent }}>
        {mainPhoto && (
          <img src={mainPhoto} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        )}
      </div>

      <div style={{ padding: 18 }}>
        <div style={{ fontFamily: serif, fontSize: 22, fontWeight: 500, color: ink }}>
          {listing.brand} {listing.model}
        </div>
        <div style={{ marginTop: 6 }}>
          <TierMeta priceTier={listing.price_tier} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {country && (
              <span style={{ fontFamily: sans, fontSize: 13, color: 'rgba(22,24,27,.7)' }}>{country.toUpperCase()}</span>
            )}
            {listing.open_to_topup && (
              <span style={{
                fontFamily: sans, fontSize: 11, color: ink,
                border: '1px solid rgba(22,24,27,.15)', borderRadius: 99, padding: '3px 10px',
              }}>top-up</span>
            )}
          </div>

          <LikeButton liked={liked} onLike={onLike} listingId={listing.id} />
        </div>
      </div>
    </div>
  )
}

// ── FeaturedCard ───────────────────────────────────────────────────────────
function FeaturedCard({ listing, liked, onLike }) {
  const mainPhoto = listing.photos?.[0]

  function handleEnter(e) { e.currentTarget.style.boxShadow = cardShadowHover }
  function handleLeave(e) { e.currentTarget.style.boxShadow = cardShadow }

  return (
    <div onMouseEnter={handleEnter} onMouseLeave={handleLeave} style={{
      borderRadius: 28, overflow: 'hidden', background: card,
      boxShadow: cardShadow, transition: 'box-shadow 400ms ease',
    }}>
      <div className="browse-hero" style={{ height: 340, background: mainPhoto ? card : accent }}>
        {mainPhoto && (
          <img src={mainPhoto} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        )}
      </div>

      <div style={{
        display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap',
        padding: '24px 28px 28px',
      }}>
        <div>
          <div className="browse-hero-title" style={{ fontFamily: serif, fontSize: 34, fontWeight: 500, color: ink }}>
            {listing.brand} {listing.model}
          </div>
          <div style={{ marginTop: 8 }}>
            <TierMeta priceTier={listing.price_tier} />
          </div>
        </div>

        <LikeButton liked={liked} onLike={onLike} listingId={listing.id} size={44} fontSize={19} />
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
  const [reportOpen, setReportOpen] = useState(false)

  const [tier,     setTier]     = useState('Any tier')
  const [geo,      setGeo]      = useState('Anywhere')
  const [topupOnly,setTopupOnly]= useState(false)

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    setLoading(true)
    if (user) {
      const mine = unwrap(
        await supabase.from('listings').select('id').eq('user_id', user.id).eq('is_active', true).single(),
        'Browse: fetch my listing'
      )
      setMyListing(mine)

      const myLikes = unwrap(
        await supabase.from('likes').select('to_listing').eq('from_user', user.id),
        'Browse: fetch my likes'
      )
      const likedSet = new Set((myLikes || []).map(l => l.to_listing))

      const myMatches = unwrap(
        await supabase.from('matches').select('user_a, listing_a, listing_b, status')
          .or(`user_a.eq.${user.id},user_b.eq.${user.id}`),
        'Browse: fetch my matches'
      )
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
      .from('public_listings')
      .select('id, brand, model, reference, price_tier, geo_scope, open_to_topup, photos, wanted_references, country')
      .eq('is_mine', false)
      .order('created_at', { ascending: false })

    const all = unwrap(await query, 'Browse: fetch listings') || []

    setListings(all.map(l => ({ ...l, profiles: { country: l.country || null } })))
    setLoading(false)
  }

  async function handleLike(listingId) {
    if (!user) { navigate('/login'); return }
    if (!myListing) {
      flash('Add your watch first to like others.')
      navigate('/create-listing')
      return
    }
    if (matchedIds.has(listingId)) {
      flash("You're already matched on this one — check your matches.")
      return
    }

    if (likedIds.has(listingId)) {
      const { error } = await supabase.from('likes').delete().eq('from_user', user.id).eq('to_listing', listingId)
      if (error) {
        console.error('[Browse: remove like]', error)
        flash("Couldn't remove like — try again.")
        return
      }
      setLikedIds(prev => { const n = new Set(prev); n.delete(listingId); return n })
      if (drawer?.id === listingId) setDrawer(prev => ({ ...prev }))
      return
    }

    const theirListing = listings.find(l => l.id === listingId)

    const { error: likeErr } = await supabase.from('likes').upsert(
      { from_user: user.id, to_listing: listingId },
      { onConflict: 'from_user,to_listing', ignoreDuplicates: true }
    )
    if (likeErr) {
      console.error('[Browse: add like]', likeErr)
      flash("Couldn't like this watch — try again.")
      return
    }

    setLikedIds(prev => new Set([...prev, listingId]))

    if (theirListing) {
      // give the DB trigger a moment to create the match row
      await new Promise(resolve => setTimeout(resolve, 700))

      const match = unwrap(
        await supabase.from('matches').select('id')
          .eq('status', 'active')
          .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
          .or(`listing_a.eq.${listingId},listing_b.eq.${listingId}`)
          .maybeSingle(),
        'Browse: check for match'
      )

      if (match) {
        setMatchedIds(prev => new Set([...prev, listingId]))
        flash("It's a match! Go to your matches to start chatting.")
        refreshBadges()
      } else {
        flash("Liked — we'll let you know if it's mutual.")
      }
    }
  }

  async function handleSubmitReport(reason) {
    if (!drawer) return false
    const { error } = await supabase.from('reports').insert({
      reporter_id: user.id,
      reported_listing_id: drawer.id,
      reason,
    })
    if (error) {
      console.error('[Browse: submit report]', error)
      flash("Couldn't submit report — try again.")
      return false
    }
    flash("Thanks, we'll review within 48h.")
    return true
  }

  const list = listings.filter(l =>
    (tier === 'Any tier' || (TIERS[l.price_tier]?.label === tier)) &&
    (geo === 'Anywhere'  || (l.profiles?.country?.toUpperCase() === geo)) &&
    (!topupOnly || l.open_to_topup)
  )

  const filtersActive = tier !== 'Any tier' || geo !== 'Anywhere' || topupOnly
  function clearFilters() { setTier('Any tier'); setGeo('Anywhere'); setTopupOnly(false) }

  const featured = listings[0] || null

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: inkSoft, fontFamily: sans, fontSize: 14 }}>
      Loading watches…
    </div>
  )

  return (
    <div style={{ maxWidth: 1180, margin: '0 auto', padding: '26px 26px 40px' }}>
      {/* page head */}
      <div>
        <h1 style={{ margin: 0, fontFamily: serif, fontWeight: 600, fontSize: 34, color: ink }}>
          Browse the floor
        </h1>
        <div style={{ marginTop: 8, fontFamily: sans, fontSize: 13, color: inkSoft }}>
          {list.length} watches open to swap · identities hidden until you match
        </div>
      </div>

      {/* featured card */}
      {featured && (
        <div style={{ marginTop: 22 }}>
          <FeaturedCard listing={featured} liked={likedIds.has(featured.id)} onLike={handleLike} />
        </div>
      )}

      {/* filter bar */}
      <div style={{
        display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap',
        margin: '24px 0 0',
      }}>
        <Dropdown label="Price tier" value={tier} setValue={setTier} options={TIER_OPTS} />
        <Dropdown label="Geography"  value={geo}  setValue={setGeo}  options={GEO_OPTS} />
        <button onClick={() => setTopupOnly(v => !v)} style={{
          all: 'unset', cursor: 'pointer',
          fontFamily: sans, fontSize: 14, borderRadius: 99, padding: '10px 18px',
          color: topupOnly ? '#fff' : ink,
          background: topupOnly ? accent : card,
          boxShadow: topupOnly ? `0 8px 22px ${accent}40` : pillShadow,
          display: 'inline-flex', alignItems: 'center', gap: 6,
          transition: 'all 300ms ease',
        }}>⇅ Open to top-up</button>
        <span style={{ flex: 1 }} />
        {filtersActive && (
          <button onClick={clearFilters} style={{
            all: 'unset', cursor: 'pointer', fontFamily: sans, fontSize: 12.5, color: inkSoft,
          }}>Clear ✕</button>
        )}
      </div>

      {/* grid */}
      {list.length > 0 ? (
        <div className="browse-grid" style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginTop: 26,
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
        <div style={{ textAlign: 'center', padding: '60px 0', color: inkSoft, fontFamily: sans, fontSize: 14 }}>
          {filtersActive ? 'No watches match these filters.' : 'No watches listed yet.'}
        </div>
      )}

      <WatchDrawer
        key={drawer?.id}
        listing={drawer}
        liked={drawer ? likedIds.has(drawer.id) : false}
        onLike={handleLike}
        onClose={() => setDrawer(null)}
        onReport={() => setReportOpen(true)}
      />

      <ReportModal
        isOpen={reportOpen}
        onClose={() => setReportOpen(false)}
        onSubmit={handleSubmitReport}
      />
    </div>
  )
}
