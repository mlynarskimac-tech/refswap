import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import { useAuth } from '../context/auth-context'

const BRANDS = [
  'Rolex', 'Patek Philippe', 'Audemars Piguet', 'Vacheron Constantin',
  'A. Lange & Söhne', 'IWC', 'Jaeger-LeCoultre', 'Omega', 'Breguet',
  'Cartier', 'Richard Mille', 'Hublot', 'Panerai', 'Tudor', 'Breitling',
  'TAG Heuer', 'Zenith', 'Grand Seiko', 'Nomos', 'F.P. Journe',
]

const PRICE_TIERS = [
  { value: 'entry', label: 'Entry Luxury — 3 000–6 000 EUR' },
  { value: 'mid',   label: 'Mid Luxury — 6 000–12 000 EUR' },
  { value: 'high',  label: 'High Luxury — 12 000–25 000 EUR' },
  { value: 'ultra', label: 'Ultra Luxury — 25 000–50 000 EUR' },
]

const GEO_SCOPE = [
  { value: 'local',  label: 'Local (same country)' },
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
    wanted_references: '',
  })
  const [photos, setPhotos] = useState([])
  const [previews, setPreviews] = useState([])
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

      const wantedList = form.wanted_references
        .split(',')
        .map(s => s.trim())
        .filter(Boolean)

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
    <div style={{ background: '#0B0B14', minHeight: 'calc(100vh - 60px)' }}>
      <div style={{ maxWidth: 580, margin: '0 auto', padding: '40px 24px 60px' }}>

        <div style={{ marginBottom: 36 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#F0EDE8' }}>
            List your watch
          </h1>
          <p style={{ color: '#353548', fontSize: 13, marginTop: 4 }}>
            Add your watch to find a swap partner.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

          <Field label="Brand *">
            <select name="brand" value={form.brand} onChange={handleChange} style={selectStyle}>
              <option value="">Select brand</option>
              {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </Field>

          <Field label="Model *">
            <input
              name="model" value={form.model} onChange={handleChange}
              placeholder="e.g. Submariner, Speedmaster"
              style={inputStyle}
            />
          </Field>

          <Field label="Reference number *">
            <input
              name="reference" value={form.reference} onChange={handleChange}
              placeholder="e.g. 126610LN"
              style={inputStyle}
            />
          </Field>

          <Field label="Value range *">
            <select name="price_tier" value={form.price_tier} onChange={handleChange} style={selectStyle}>
              <option value="">Select value range</option>
              {PRICE_TIERS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </Field>

          <Field label="Geographic scope">
            <select name="geo_scope" value={form.geo_scope} onChange={handleChange} style={selectStyle}>
              {GEO_SCOPE.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
            </select>
          </Field>

          <label style={{
            display: 'flex', alignItems: 'center', gap: 12,
            cursor: 'pointer', padding: '14px 16px',
            background: '#0D0D1A', border: '1px solid #1A1A28', borderRadius: 10,
          }}>
            <div style={{
              width: 20, height: 20, borderRadius: 5, flexShrink: 0,
              border: `2px solid ${form.open_to_topup ? '#C9A84C' : '#252535'}`,
              background: form.open_to_topup ? '#C9A84C' : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.15s',
            }}>
              {form.open_to_topup && (
                <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="#0B0A07" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
            <input
              type="checkbox" name="open_to_topup" checked={form.open_to_topup}
              onChange={handleChange} style={{ display: 'none' }}
            />
            <div>
              <div style={{ fontSize: 14, fontWeight: 500, color: '#D0CCC6' }}>Open to top-up payment</div>
              <div style={{ fontSize: 12, color: '#353548', marginTop: 2 }}>
                Accept or pay a difference to balance the trade
              </div>
            </div>
          </label>

          <Field label="Watches you want" hint="References, comma-separated">
            <textarea
              name="wanted_references"
              value={form.wanted_references}
              onChange={handleChange}
              placeholder="e.g. 126610LV, 5711/1A-010, 15202ST"
              style={{ ...inputStyle, height: 80, resize: 'vertical' }}
            />
          </Field>

          <Field label="Photos *" hint="Up to 5 images">
            <label style={{
              display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
              padding: '12px 14px', background: '#0D0D1A',
              border: '1px dashed #252535', borderRadius: 10,
              color: '#353548', fontSize: 13,
              transition: 'border-color 0.15s',
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#353548'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#252535'}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              {previews.length > 0 ? `${previews.length} photo${previews.length > 1 ? 's' : ''} selected` : 'Choose photos'}
              <input type="file" accept="image/*" multiple onChange={handlePhotos} style={{ display: 'none' }} />
            </label>
          </Field>

          {previews.length > 0 && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {previews.map((url, i) => (
                <img key={i} src={url} alt="" style={{
                  width: 76, height: 76, objectFit: 'cover',
                  borderRadius: 8, border: '1px solid #1E1E2C',
                }} />
              ))}
            </div>
          )}

          {error && (
            <div style={{
              padding: '10px 14px', borderRadius: 8,
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.2)',
              color: '#f87171', fontSize: 13,
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              background: loading ? '#1A1A28' : '#C9A84C',
              color: loading ? '#353548' : '#0B0A07',
              border: 'none', borderRadius: 10,
              padding: '14px 0', fontSize: 14, fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.15s',
              letterSpacing: '0.02em',
            }}
          >
            {loading ? 'Uploading…' : 'List my watch'}
          </button>
        </form>
      </div>
    </div>
  )
}

function Field({ label, hint, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: '#353548', letterSpacing: '0.07em', textTransform: 'uppercase' }}>
          {label}
        </span>
        {hint && <span style={{ fontSize: 11, color: '#252535' }}>{hint}</span>}
      </div>
      {children}
    </div>
  )
}

const inputStyle = {
  background: '#0D0D1A',
  border: '1px solid #1A1A28',
  borderRadius: 10,
  padding: '11px 14px',
  fontSize: 14,
  color: '#F0EDE8',
  outline: 'none',
  width: '100%',
}

const selectStyle = {
  ...inputStyle,
  cursor: 'pointer',
  appearance: 'none',
  WebkitAppearance: 'none',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23353548' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 12px center',
  paddingRight: 38,
}
