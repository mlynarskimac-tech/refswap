import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { useAuth } from '../context/auth-context'
import { useBadges } from '../context/badge-context'
import { useToast } from '../context/toast-context'
import { unwrap } from '../lib/db'
import { TIERS, GEO_LABELS, PhotoGallery } from '../components/primitives'

// ── The Vault × Manufacture — soft ──────────────────────────────────────────
const bg      = '#F6F6F3'
const card    = '#FFFFFF'
const accent  = '#274C6B'
const ink     = '#16181B'
const inkSoft = 'rgba(22,24,27,0.55)'
const sans    = "'Inter', system-ui, sans-serif"
const serif   = "'Fraunces', serif"

const cardShadow = '0 8px 30px rgba(22,24,27,0.08)'

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

// ── IncomingLikeCard ───────────────────────────────────────────────────────
function IncomingLikeCard({ like, onLikeBack }) {
  const [loading, setLoading] = useState(false)
  const geoLabel = GEO_LABELS[like.geo_scope] || like.geo_scope || '—'
  const photos = like.photos || []

  async function handleClick() {
    setLoading(true)
    await onLikeBack(like)
    setLoading(false)
  }

  return (
    <div style={{ background: card, borderRadius: 22, boxShadow: cardShadow, padding: 20 }}>
      <PhotoGallery photos={photos} mainHeight={200} thumbSize={52} />

      <div style={{ marginTop: 18 }}>
        <div style={{ fontFamily: sans, fontSize: 11, letterSpacing: '.12em', color: accent, textTransform: 'uppercase' }}>
          {like.brand}
        </div>
        <div style={{ fontFamily: serif, fontSize: 24, fontWeight: 600, color: ink, marginTop: 4 }}>
          {like.model} {like.reference}
        </div>
      </div>

      <div style={{ marginTop: 8 }}>
        <TierMeta priceTier={like.price_tier} />
      </div>
      <div style={{ marginTop: 6, fontFamily: sans, fontSize: 13, color: inkSoft }}>
        {like.country || '—'} · {geoLabel}
      </div>

      {like.open_to_topup && (
        <span style={{
          display: 'inline-block', marginTop: 12,
          fontFamily: sans, fontSize: 12, color: ink,
          border: '1px solid rgba(22,24,27,.15)', borderRadius: 99, padding: '5px 14px',
        }}>Open to top-up</span>
      )}

      {like.note && (
        <div style={{
          marginTop: 16, fontFamily: sans, fontSize: 13.5, color: ink,
          background: bg, borderRadius: 16, padding: '12px 16px', lineHeight: 1.5,
        }}>
          <span style={{ color: inkSoft }}>They said: </span>“{like.note}”
        </div>
      )}

      <button onClick={handleClick} disabled={loading} style={{
        all: 'unset', cursor: loading ? 'default' : 'pointer', boxSizing: 'border-box',
        display: 'block', width: '100%', textAlign: 'center', marginTop: 18,
        fontFamily: sans, fontSize: 15, fontWeight: 500,
        padding: '14px 28px', borderRadius: 99,
        color: '#fff', background: accent, opacity: loading ? 0.6 : 1,
        transition: 'opacity 300ms ease',
      }}>
        {loading ? 'Sending…' : '♥  Like back'}
      </button>
    </div>
  )
}

// ── Empty state ────────────────────────────────────────────────────────────
function IncomingLikesEmpty() {
  return (
    <div style={{
      marginTop: 32, background: card, borderRadius: 22, boxShadow: cardShadow,
      padding: '64px 24px', textAlign: 'center',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
    }}>
      <span style={{ fontFamily: serif, fontSize: 22, color: ink }}>No incoming likes yet</span>
      <span style={{ fontFamily: sans, fontSize: 13.5, color: inkSoft, maxWidth: 320, lineHeight: 1.5 }}>
        When someone likes your watch, they'll appear here — anonymously, until you like them back.
      </span>
    </div>
  )
}

// ── IncomingLikes page ─────────────────────────────────────────────────────
export default function IncomingLikes() {
  const { user } = useAuth()
  const { refresh: refreshBadges } = useBadges()
  const { flash } = useToast()

  const [likes,   setLikes]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchIncoming() }, [])

  async function fetchIncoming() {
    setLoading(true)
    const rows = unwrap(await supabase.rpc('get_incoming_likes'), 'IncomingLikes: fetch incoming likes')
    setLikes(rows || [])
    setLoading(false)
  }

  async function handleLikeBack(like) {
    const { error } = await supabase.from('likes').upsert(
      { from_user: user.id, to_listing: like.liker_listing_id },
      { onConflict: 'from_user,to_listing', ignoreDuplicates: true }
    )
    if (error) {
      console.error('[IncomingLikes: like back]', error)
      flash("Couldn't like back — try again.")
      return
    }

    setLikes(prev => prev.filter(l => l.like_id !== like.like_id))
    flash("It's a match! Check your matches.")
    refreshBadges()
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: inkSoft, fontFamily: sans, fontSize: 14 }}>
      Loading incoming likes…
    </div>
  )

  return (
    <div style={{ maxWidth: 1180, margin: '0 auto', padding: '26px 26px 40px' }}>
      {/* page head */}
      <div>
        <h1 style={{ margin: 0, fontFamily: serif, fontWeight: 600, fontSize: 34, color: ink }}>
          Incoming likes
        </h1>
        <div style={{ marginTop: 8, fontFamily: sans, fontSize: 13, color: inkSoft }}>
          {likes.length} {likes.length === 1 ? 'watch owner likes' : 'watch owners like'} your listing · identities hidden until you match
        </div>
      </div>

      {likes.length === 0 ? <IncomingLikesEmpty /> : (
        <div className="browse-grid" style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginTop: 26,
        }}>
          {likes.map(l => (
            <IncomingLikeCard key={l.like_id} like={l} onLikeBack={handleLikeBack} />
          ))}
        </div>
      )}
    </div>
  )
}
