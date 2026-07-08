import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import { useAuth } from '../context/auth-context'
import { useToast } from '../context/toast-context'
import { unwrap } from '../lib/db'
import { PhotoBox, TIERS } from '../components/primitives'

const gold    = '#A9823F'
const ink     = '#1C1B19'
const ink2    = '#6E6A62'
const ink3    = '#A6A199'
const stroke  = '#E2DED6'
const strokeMd= '#D4CFC5'
const surface = '#FFFFFF'
const bg      = '#FBFAF8'
const sans    = "'Inter', system-ui, sans-serif"
const serif   = "'Cormorant Garamond', serif"
const mono    = "'Spline Sans Mono', ui-monospace, monospace"

const STEPS = ['Brand', 'Model', 'Reference', 'Photos', 'Price tier', 'Scope', 'Top-up', 'Wishlist']

const GEO_OPTIONS = [
  { label: 'Local',      value: 'local' },
  { label: 'EU',         value: 'europe' },
  { label: 'Worldwide',  value: 'global' },
]

// ── Image sanitization ───────────────────────────────────────────────────────
const MAX_IMAGE_DIMENSION = 1600

function loadImageElement(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => { URL.revokeObjectURL(url); resolve(img) }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Could not read image file.')) }
    img.src = url
  })
}

// Re-encodes the image through <canvas>, which drops all EXIF/GPS metadata
// and downscales oversized photos so uploads can't leak the owner's location.
async function sanitizeImage(file) {
  const img = await loadImageElement(file)
  let { naturalWidth: width, naturalHeight: height } = img

  if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
    if (width >= height) {
      height = Math.round(height * (MAX_IMAGE_DIMENSION / width))
      width = MAX_IMAGE_DIMENSION
    } else {
      width = Math.round(width * (MAX_IMAGE_DIMENSION / height))
      height = MAX_IMAGE_DIMENSION
    }
  }

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  canvas.getContext('2d').drawImage(img, 0, 0, width, height)

  const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.85))
  if (!blob) throw new Error('Could not process image.')
  return blob
}

function randomFileName(ext) {
  const rand = typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`
  return `${rand}.${ext}`
}

// ── Sub-controls ────────────────────────────────────────────────────────────
function Field({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
      <span style={{ fontFamily: sans, fontSize: 13, color: ink2, fontWeight: 500 }}>{label}</span>
      {children}
    </div>
  )
}

function TextInput({ value, onChange, placeholder }) {
  return (
    <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      style={{
        height: 46, border: `1px solid ${stroke}`, borderRadius: 10,
        padding: '0 16px', fontFamily: sans, fontSize: 15, color: ink,
        background: bg, outline: 'none', maxWidth: 420,
      }}
    />
  )
}

function PhotoStep({ files, setFiles }) {
  function handleDrop(e) {
    e.preventDefault()
    const dropped = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'))
    setFiles(prev => [...prev, ...dropped].slice(0, 8))
  }

  function handlePick(e) {
    const picked = Array.from(e.target.files)
    setFiles(prev => [...prev, ...picked].slice(0, 8))
    e.target.value = ''
  }

  return (
    <div>
      <label
        onDragOver={e => e.preventDefault()}
        onDrop={handleDrop}
        style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          height: 180, gap: 8, cursor: 'pointer',
          border: `1.5px dashed ${strokeMd}`, borderRadius: 12, background: bg,
        }}
      >
        <span style={{ fontSize: 30, color: ink3 }}>⤓</span>
        <span style={{ fontFamily: sans, fontSize: 14, color: ink2 }}>Drag &amp; drop photos</span>
        <span style={{ fontFamily: sans, fontSize: 11.5, color: ink3 }}>or click to add · up to 8</span>
        <input type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handlePick} />
      </label>
      {files.length > 0 && (
        <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
          {files.map((f, i) => {
            const url = typeof f === 'string' ? f : URL.createObjectURL(f)
            return (
              <div key={i} style={{ position: 'relative' }}>
                <img src={url} alt="" style={{ width: 62, height: 62, objectFit: 'cover', borderRadius: 8, border: `1px solid ${stroke}` }} />
                <button onClick={() => setFiles(prev => prev.filter((_, j) => j !== i))} style={{
                  all: 'unset', cursor: 'pointer', position: 'absolute', top: -6, right: -6,
                  width: 18, height: 18, borderRadius: '50%', background: ink3, color: '#fff',
                  fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>✕</button>
              </div>
            )
          })}
          {files.length < 8 && (
            <label style={{
              width: 62, height: 62, border: `1px dashed ${strokeMd}`, borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: ink3, fontSize: 20, cursor: 'pointer',
            }}>
              +
              <input type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handlePick} />
            </label>
          )}
        </div>
      )}
    </div>
  )
}

function TierStep({ value, onChange }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
      {Object.entries(TIERS).map(([k, t]) => {
        const sel = value === k
        return (
          <button key={k} onClick={() => onChange(k)} style={{
            all: 'unset', cursor: 'pointer', boxSizing: 'border-box',
            border: `1px solid ${sel ? gold : stroke}`, borderRadius: 12,
            padding: '18px 16px', background: sel ? `${gold}10` : bg,
            display: 'flex', flexDirection: 'column', gap: 6,
          }}>
            <span style={{ fontFamily: serif, fontSize: 20, fontWeight: 600, color: sel ? gold : ink }}>
              {t.fullLabel}
            </span>
            <span style={{ fontFamily: mono, fontSize: 12.5, color: ink2 }}>{t.range}</span>
          </button>
        )
      })}
    </div>
  )
}

function ChoiceRow({ value, onChange, options, hint }) {
  return (
    <div>
      {hint && <div style={{ fontFamily: sans, fontSize: 13.5, color: ink2, marginBottom: 14 }}>{hint}</div>}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {options.map(o => {
          const sel = value === (o.value ?? o)
          const label = o.label ?? o
          const val   = o.value ?? o
          return (
            <button key={val} onClick={() => onChange(val)} style={{
              all: 'unset', cursor: 'pointer',
              fontFamily: sans, fontSize: 14, padding: '12px 22px', borderRadius: 10,
              border: `1px solid ${sel ? gold : stroke}`,
              color: sel ? gold : ink,
              background: sel ? `${gold}10` : bg,
            }}>{label}</button>
          )
        })}
      </div>
    </div>
  )
}

function WishlistStep({ wants, setWants }) {
  const [draft, setDraft] = useState('')
  function add() { if (draft.trim()) { setWants([...wants, draft.trim()]); setDraft('') } }
  return (
    <div>
      <div style={{ fontFamily: sans, fontSize: 13.5, color: ink2, marginBottom: 14 }}>
        Which references would you swap this for?
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <TextInput value={draft} onChange={setDraft} placeholder="e.g. Patek Aquanaut" />
        <button onClick={add} style={{
          all: 'unset', cursor: 'pointer', fontFamily: sans, fontSize: 13.5, fontWeight: 600,
          color: gold, border: `1px solid ${gold}`, borderRadius: 10,
          padding: '0 18px', display: 'inline-flex', alignItems: 'center',
        }}>Add</button>
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 16 }}>
        {wants.map((t, i) => (
          <span key={i} style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            fontFamily: sans, fontSize: 13, color: ink2,
            border: `1px solid ${stroke}`, borderRadius: 999, padding: '7px 8px 7px 14px',
          }}>
            {t}
            <button onClick={() => setWants(wants.filter((_, j) => j !== i))} style={{
              all: 'unset', cursor: 'pointer', color: ink3, fontSize: 14,
            }}>✕</button>
          </span>
        ))}
      </div>
    </div>
  )
}

// ── Main component ───────────────────────────────────────────────────────────
export default function CreateListing() {
  const { user }  = useAuth()
  const navigate  = useNavigate()
  const { flash } = useToast()

  const [step, setStep] = useState(0)
  const [data, setData] = useState({
    brand: '', model: '', ref: '',
    tier: 'mid', scope: 'global', topup: false, wants: [],
  })
  const [photos, setPhotos] = useState([])
  const [publishing, setPublishing] = useState(false)
  const [error, setError] = useState('')

  const set = (k, v) => setData(d => ({ ...d, [k]: v }))

  async function handlePublish() {
    if (!data.brand || !data.model) { setError('Brand and model are required.'); return }
    setPublishing(true); setError('')
    try {
      const photoUrls = []
      for (const file of photos) {
        if (typeof file === 'string') { photoUrls.push(file); continue }
        const blob = await sanitizeImage(file)
        const path = randomFileName('jpg')
        const { error: upErr } = await supabase.storage.from('watch-images').upload(path, blob, {
          contentType: 'image/jpeg',
        })
        if (upErr) throw upErr
        const { data: urlData } = supabase.storage.from('watch-images').getPublicUrl(path)
        photoUrls.push(urlData.publicUrl)
      }

      const insertResult = await supabase.from('listings').insert({
        user_id: user.id,
        brand: data.brand, model: data.model, reference: data.ref,
        price_tier: data.tier, geo_scope: data.scope,
        open_to_topup: data.topup,
        wanted_references: data.wants,
        photos: photoUrls, is_active: true,
      })
      unwrap(insertResult, 'CreateListing: publish listing')
      if (insertResult.error) throw insertResult.error

      flash('Listing published ✓')
      navigate('/my-watch')
    } catch (err) {
      console.error('[CreateListing: publish]', err)
      setError(err.message)
      flash("Couldn't publish listing — try again.")
    } finally {
      setPublishing(false)
    }
  }

  function next() { step < STEPS.length - 1 ? setStep(step + 1) : handlePublish() }
  function back() { step > 0 ? setStep(step - 1) : navigate('/my-watch') }

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '26px 26px 40px' }}>
      {/* page head */}
      <div style={{ marginBottom: 4 }}>
        <h1 style={{ margin: 0, fontFamily: serif, fontWeight: 600, fontSize: 32, color: ink, lineHeight: 1 }}>
          Create a listing
        </h1>
        <span style={{ fontFamily: sans, fontSize: 13, color: ink3 }}>
          List one watch, plus the references you'd swap it for.
        </span>
      </div>

      {/* stepper */}
      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px 0', margin: '22px 0 28px' }}>
        {STEPS.map((s, i) => (
          <span key={s} style={{ display: 'inline-flex', alignItems: 'center' }}>
            <button onClick={() => setStep(i)} style={{
              all: 'unset', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 7,
            }}>
              <span style={{
                width: 24, height: 24, borderRadius: '50%',
                fontFamily: sans, fontSize: 11.5,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                border: `1px solid ${i <= step ? gold : strokeMd}`,
                background: i === step ? gold : i < step ? `${gold}18` : 'transparent',
                color: i === step ? '#fff' : i < step ? gold : ink3,
              }}>{i < step ? '✓' : i + 1}</span>
              <span style={{ fontFamily: sans, fontSize: 11.5, color: i <= step ? ink2 : ink3 }}>{s}</span>
            </button>
            {i < STEPS.length - 1 && (
              <span style={{ width: 16, height: 1, background: stroke, margin: '0 7px' }} />
            )}
          </span>
        ))}
      </div>

      {/* card */}
      <div style={{ background: surface, border: `1px solid ${stroke}`, borderRadius: 14, padding: 26, minHeight: 280 }}>
        <div style={{ fontFamily: mono, fontSize: 10.5, letterSpacing: '.1em', color: ink3, textTransform: 'uppercase', marginBottom: 16 }}>
          Step {step + 1} · {STEPS[step]}
        </div>

        {step === 0 && <Field label="Brand"><TextInput value={data.brand} onChange={v => set('brand', v)} placeholder="e.g. Rolex" /></Field>}
        {step === 1 && <Field label="Model"><TextInput value={data.model} onChange={v => set('model', v)} placeholder="e.g. Submariner Date" /></Field>}
        {step === 2 && <Field label="Reference number"><TextInput value={data.ref} onChange={v => set('ref', v)} placeholder="e.g. 126610LN" /></Field>}
        {step === 3 && <PhotoStep files={photos} setFiles={setPhotos} />}
        {step === 4 && <TierStep value={data.tier} onChange={v => set('tier', v)} />}
        {step === 5 && <ChoiceRow value={data.scope} onChange={v => set('scope', v)} options={GEO_OPTIONS} />}
        {step === 6 && (
          <ChoiceRow
            value={data.topup ? 'yes' : 'no'}
            onChange={v => set('topup', v === 'yes')}
            options={[{ label: 'Yes', value: 'yes' }, { label: 'No', value: 'no' }]}
            hint="Are you open to a cash top-up to balance the swap?"
          />
        )}
        {step === 7 && <WishlistStep wants={data.wants} setWants={v => set('wants', v)} />}

        {error && (
          <div style={{
            marginTop: 16, padding: '10px 14px', borderRadius: 8,
            background: 'rgba(210,75,75,.06)', border: '1px solid rgba(210,75,75,.2)',
            color: '#D24B4B', fontFamily: sans, fontSize: 13,
          }}>{error}</div>
        )}
      </div>

      {/* footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 22 }}>
        <button onClick={back} style={{
          all: 'unset', cursor: 'pointer', fontFamily: sans, fontSize: 13.5,
          color: ink2, border: `1px solid ${stroke}`, borderRadius: 8, padding: '11px 20px',
        }}>← Back</button>
        <button onClick={next} disabled={publishing} style={{
          all: 'unset', cursor: publishing ? 'default' : 'pointer',
          fontFamily: sans, fontSize: 13.5, fontWeight: 600,
          color: '#fff', background: publishing ? ink3 : gold,
          borderRadius: 8, padding: '11px 24px',
          transition: 'background .15s',
        }}>
          {publishing ? 'Publishing…' : step < STEPS.length - 1 ? 'Continue →' : 'Publish listing'}
        </button>
      </div>
    </div>
  )
}
