import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabase'
import { useAuth } from '../context/auth-context'

export default function MyWatch() {
  const { user } = useAuth()
  const [listing, setListing] = useState(null)
  const [loading, setLoading] = useState(true)

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
    await supabase
      .from('listings')
      .update({ is_active: false })
      .eq('id', listing.id)
    setListing(null)
  }

  if (loading) return <div style={{ padding: 24 }}>Loading...</div>

  if (!listing) {
    return (
      <div style={{ padding: 24 }}>
        <p>You don't have an active listing.</p>
        <Link to="/create-listing">
          <button>Add Watch</button>
        </Link>
      </div>
    )
  }

  return (
    <div style={{ padding: 24, maxWidth: 480 }}>
      <h2>My Watch</h2>
      {listing.photos?.[0] && (
        <img
          src={listing.photos[0]}
          alt="Watch"
          style={{ width: '100%', maxHeight: 300, objectFit: 'cover', borderRadius: 8, marginBottom: 16 }}
        />
      )}
      <p><strong>Brand:</strong> {listing.brand}</p>
      <p><strong>Model:</strong> {listing.model}</p>
      <p><strong>Reference:</strong> {listing.reference}</p>
      <p><strong>Price range:</strong> {listing.price_min} – {listing.price_max}</p>
      <p><strong>Geo range:</strong> {listing.geo_range}</p>
      <p><strong>Top-up:</strong> {listing.topup ? 'Yes' : 'No'}</p>
      <button
        onClick={handleDelete}
        style={{ marginTop: 16, background: '#c00', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 4, cursor: 'pointer' }}
      >
        Delete listing
      </button>
    </div>
  )
}
