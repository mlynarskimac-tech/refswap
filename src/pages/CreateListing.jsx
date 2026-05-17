import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import { useAuth } from '../context/auth-context'


const BRANDS = [
  'Rolex', 'Patek Philippe', 'Audemars Piguet', 'Vacheron Constantin',
  'A. Lange & Söhne', 'IWC', 'Jaeger-LeCoultre', 'Omega', 'Breguet',
  'Cartier', 'Richard Mille', 'Hublot', 'Panerai', 'Tudor', 'Breitling',
  'TAG Heuer', 'Zenith', 'Grand Seiko', 'Nomos', 'F.P. Journe'
]

const PRICE_TIERS = [
  { value: 'entry', label: 'Entry Luxury — 3 000–6 000 EUR' },
  { value: 'mid', label: 'Mid Luxury — 6 000–12 000 EUR' },
  { value: 'high', label: 'High Luxury — 12 000–25 000 EUR' },
  { value: 'ultra', label: 'Ultra Luxury — 25 000–50 000 EUR' },
]

const GEO_SCOPE = [
  { value: 'local', label: 'Local (same country)' },
  { value: 'europe', label: 'Europe' },
  { value: 'global', label: 'Global' },
]

export default function CreateListing() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    brand: '',
    model: '',
    reference: '',
    price_tier: '',
    geo_scope: 'global',
    open_to_topup: false,
    wanted_references: '',   // przecinkami, parse przy save
  })
  const [photos, setPhotos] = useState([])       // File objects
  const [previews, setPreviews] = useState([])   // base64 URLs
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  function handlePhotos(e) {
    const files = Array.from(e.target.files).slice(0, 5)
    setPhotos(files)
    const urls = files.map(f => URL.createObjectURL(f))
    setPreviews(urls)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!form.brand || !form.model || !form.reference || !form.price_tier) {
      setError('Please fill in all required fields.')
      return
    }
    if (photos.length === 0) {
      setError('Add at least one photo.')
      return
    }

    setLoading(true)
    try {
      // Upload zdjęć do Supabase Storage
      const photoUrls = []
      for (const file of photos) {
        const ext = file.name.split('.').pop()
        const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('watch-images')
          .upload(path, file)
        if (uploadError) throw uploadError

        const { data: urlData } = supabase.storage
          .from('watch-images')
          .getPublicUrl(path)
        photoUrls.push(urlData.publicUrl)
      }

      // Parsowanie listy pożądanych referencji
      const wantedList = form.wanted_references
        .split(',')
        .map(s => s.trim())
        .filter(Boolean)

      // Zapis do tabeli listings
      const { error: dbError } = await supabase.from('listings').insert({
        user_id: user.id,
        brand: form.brand,
        model: form.model,
        reference: form.reference,
        price_tier: form.price_tier,
        geo_scope: form.geo_scope,
        open_to_topup: form.open_to_topup,
        wanted_references: wantedList,
        photos: photoUrls,
        is_active: true,
      })
      if (dbError) throw dbError

      navigate('/browse')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 560, margin: '40px auto', padding: '0 20px' }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
        List your watch
      </h1>
      <p style={{ color: '#666', marginBottom: 32 }}>
        Add your watch to find a swap partner.
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Brand */}
        <label style={labelStyle}>
          Brand *
          <select name="brand" value={form.brand} onChange={handleChange} style={inputStyle}>
            <option value="">Select brand</option>
            {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </label>

        {/* Model */}
        <label style={labelStyle}>
          Model *
          <input name="model" value={form.model} onChange={handleChange}
            placeholder="e.g. Submariner, Speedmaster" style={inputStyle} />
        </label>

        {/* Reference */}
        <label style={labelStyle}>
          Reference number *
          <input name="reference" value={form.reference} onChange={handleChange}
            placeholder="e.g. 126610LN" style={inputStyle} />
        </label>

        {/* Price tier */}
        <label style={labelStyle}>
          Value range *
          <select name="price_tier" value={form.price_tier} onChange={handleChange} style={inputStyle}>
            <option value="">Select value range</option>
            {PRICE_TIERS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </label>

        {/* Geo scope */}
        <label style={labelStyle}>
          Geographic scope
          <select name="geo_scope" value={form.geo_scope} onChange={handleChange} style={inputStyle}>
            {GEO_SCOPE.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
          </select>
        </label>

        {/* Open to top-up */}
        <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
          <input type="checkbox" name="open_to_topup" checked={form.open_to_topup}
            onChange={handleChange} style={{ width: 18, height: 18 }} />
          <span>Open to top-up payment</span>
        </label>

        {/* Wanted references */}
        <label style={labelStyle}>
          Watches you want <span style={{ color: '#999', fontWeight: 400 }}>(references, comma-separated)</span>
          <textarea
            name="wanted_references"
            value={form.wanted_references}
            onChange={handleChange}
            placeholder="e.g. 126610LV, 5711/1A-010, 15202ST"
            style={{ ...inputStyle, height: 80, resize: 'vertical' }}
          />
        </label>

        {/* Photos */}
        <label style={labelStyle}>
          Photos * <span style={{ color: '#999', fontWeight: 400 }}>(up to 5)</span>
          <input type="file" accept="image/*" multiple onChange={handlePhotos}
            style={{ marginTop: 6 }} />
        </label>

        {/* Previews */}
        {previews.length > 0 && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {previews.map((url, i) => (
              <img key={i} src={url} alt="" style={{
                width: 80, height: 80, objectFit: 'cover',
                borderRadius: 8, border: '1px solid #e5e7eb'
              }} />
            ))}
          </div>
        )}

        {error && (
          <p style={{ color: '#dc2626', fontSize: 14 }}>{error}</p>
        )}

        <button type="submit" disabled={loading} style={{
          background: '#111', color: '#fff', padding: '14px 24px',
          border: 'none', borderRadius: 8, fontSize: 16, fontWeight: 600,
          cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1,
        }}>
          {loading ? 'Listing…' : 'List my watch'}
        </button>
      </form>
    </div>
  )
}

const labelStyle = {
  display: 'flex', flexDirection: 'column', gap: 6,
  fontSize: 14, fontWeight: 600, color: '#111',
}
const inputStyle = {
  padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 8,
  fontSize: 15, outline: 'none', background: '#fff',
  fontFamily: 'inherit',
}