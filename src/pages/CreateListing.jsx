import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import { useAuth } from '../context/auth-context'
import { useToast } from '../context/toast-context'
import { unwrap } from '../lib/db'
import { TIERS } from '../components/primitives'

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

const cardShadow  = '0 8px 30px rgba(22,24,27,0.08)'
const pillShadow  = '0 4px 16px rgba(22,24,27,0.08)'

function focusOn(e)  { e.target.style.outline = `2px solid ${accent}`; e.target.style.outlineOffset = '0' }
function focusOff(e) { e.target.style.outline = 'none' }

const STEPS = ['Your watch', 'Photos', 'Price tier', 'Scope', 'Top-up', 'Wishlist']

const GEO_OPTIONS = [
  { label: 'Local',      value: 'local' },
  { label: 'EU',         value: 'europe' },
  { label: 'Worldwide',  value: 'global' },
]

// ── Image sanitization (unchanged) ───────────────────────────────────────────
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span style={{ fontFamily: sans, fontSize: 13, color: inkSoft }}>{label}</span>
      {children}
    </div>
  )
}

function TextInput({ value, onChange, placeholder }) {
  return (
    <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      onFocus={focusOn} onBlur={focusOff}
      style={{
        boxSizing: 'border-box', width: '100%', maxWidth: 420,
        background: bg, border: 'none', borderRadius: 16,
        padding: '12px 16px', fontFamily: sans, fontSize: 14, color: ink,
        outline: 'none',
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
          height: 180, gap: 8, cursor: 'pointer', boxSizing: 'border-box',
          border: '1px dashed rgba(22,24,27,0.2)', borderRadius: 16, background: bg,
        }}
      >
        <span style={{ fontSize: 26, color: inkSoft }}>⤓</span>
        <span style={{ fontFamily: sans, fontSize: 14, color: inkSoft }}>Drag &amp; drop photos</span>
        <span style={{ fontFamily: sans, fontSize: 12, color: inkSoft }}>or click to add · up to 8</span>
        <input type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handlePick} />
      </label>
      {files.length > 0 && (
        <div style={{ display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
          {files.map((f, i) => {
            const url = typeof f === 'string' ? f : URL.createObjectURL(f)
            return (
              <div key={i} style={{ position: 'relative' }}>
                <img src={url} alt="" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 16, display: 'block' }} />
                <button onClick={() => setFiles(prev => prev.filter((_, j) => j !== i))} style={{
                  all: 'unset', cursor: 'pointer', position: 'absolute', top: -6, right: -6,
                  width: 20, height: 20, borderRadius: '50%', background: ink, color: '#fff',
                  fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: pillShadow,
                }}>✕</button>
              </div>
            )
          })}
          {files.length < 8 && (
            <label style={{
              width: 80, height: 80, border: '1px dashed rgba(22,24,27,0.2)', borderRadius: 16,
              display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box',
              color: inkSoft, fontSize: 20, cursor: 'pointer',
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

// Same searchable catalog picker used by both the "Your watch" step and the
// wishlist step: matches brand, model, reference and variant, case-insensitive.
function ReferenceSearch({ catalog, query, onQueryChange, onSelect, excludeIds, noMatchesLabel }) {
  const q = query.trim().toLowerCase()
  const results = q
    ? catalog
        .filter(r => !excludeIds || !excludeIds.includes(r.id))
        .filter(r => `${r.brand} ${r.model} ${r.reference} ${r.variant || ''}`.toLowerCase().includes(q))
        .slice(0, 6)
    : []
  const noMatches = q.length > 0 && results.length === 0

  return (
    <div>
      <TextInput value={query} onChange={onQueryChange} placeholder="Search: brand, model or reference…" />
      {q && (
        results.length > 0 ? (
          <div style={{
            display: 'flex', flexDirection: 'column', marginTop: 10, maxWidth: 420,
            background: card, borderRadius: 16, boxShadow: cardShadow, overflow: 'hidden', padding: 4,
          }}>
            {results.map(r => (
              <button
                key={r.id}
                onClick={() => onSelect(r)}
                onMouseEnter={e => { e.currentTarget.style.background = bg }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                style={{
                  all: 'unset', cursor: 'pointer', boxSizing: 'border-box', width: '100%',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  borderRadius: 12, padding: '12px 16px', transition: 'background 200ms ease',
                }}
              >
                <div>
                  <div style={{ fontFamily: sans, fontSize: 14, fontWeight: 500, color: ink }}>
                    {r.brand} {r.model}
                  </div>
                  {r.variant && (
                    <div style={{ fontFamily: sans, fontSize: 12, color: inkSoft, marginTop: 2 }}>{r.variant}</div>
                  )}
                </div>
                <span style={{ fontFamily: sans, fontSize: 12.5, color: inkSoft, marginLeft: 12 }}>{r.reference}</span>
              </button>
            ))}
          </div>
        ) : noMatches && (
          <div style={{ fontFamily: sans, fontSize: 13, color: inkSoft, marginTop: 10 }}>
            {noMatchesLabel}
          </div>
        )
      )}
    </div>
  )
}

function WatchStep({ catalog, query, onQueryChange, selectedRef, onSelect, onClear, manualMode, onToggleManual, data, set }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {!manualMode && (
        selectedRef ? (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10,
            borderRadius: 16, padding: '14px 18px', background: bg, maxWidth: 420, boxSizing: 'border-box',
          }}>
            <div>
              <div style={{ fontFamily: sans, fontSize: 15, fontWeight: 500, color: ink }}>
                {selectedRef.brand} {selectedRef.model}
              </div>
              {selectedRef.variant && (
                <div style={{ fontFamily: sans, fontSize: 12.5, color: inkSoft, marginTop: 2 }}>{selectedRef.variant}</div>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <span style={{ fontFamily: sans, fontSize: 13, color: inkSoft }}>{selectedRef.reference}</span>
              <button
                onClick={onClear}
                onMouseEnter={e => { e.currentTarget.style.textDecoration = 'underline' }}
                onMouseLeave={e => { e.currentTarget.style.textDecoration = 'none' }}
                style={{
                  all: 'unset', cursor: 'pointer', fontFamily: sans, fontSize: 13, color: inkSoft,
                }}
              >Change</button>
            </div>
          </div>
        ) : (
          <ReferenceSearch
            catalog={catalog}
            query={query}
            onQueryChange={onQueryChange}
            onSelect={onSelect}
            noMatchesLabel="Not in our catalog — enter it manually below"
          />
        )
      )}

      {!manualMode && (
        <button
          onClick={onToggleManual}
          onMouseEnter={e => { e.currentTarget.style.textDecoration = 'underline' }}
          onMouseLeave={e => { e.currentTarget.style.textDecoration = 'none' }}
          style={{ all: 'unset', cursor: 'pointer', fontFamily: sans, fontSize: 13, color: accent, width: 'fit-content' }}
        >Can't find your watch? Enter manually</button>
      )}

      {manualMode && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Field label="Brand"><TextInput value={data.brand} onChange={v => set('brand', v)} placeholder="e.g. Rolex" /></Field>
          <Field label="Model"><TextInput value={data.model} onChange={v => set('model', v)} placeholder="e.g. Submariner Date" /></Field>
          <Field label="Reference number"><TextInput value={data.ref} onChange={v => set('ref', v)} placeholder="e.g. 126610LN" /></Field>
          <span style={{ fontFamily: sans, fontSize: 12, color: inkSoft }}>
            Manual entries are not included in automatic matching.
          </span>
          <button
            onClick={onToggleManual}
            onMouseEnter={e => { e.currentTarget.style.textDecoration = 'underline' }}
            onMouseLeave={e => { e.currentTarget.style.textDecoration = 'none' }}
            style={{ all: 'unset', cursor: 'pointer', fontFamily: sans, fontSize: 13, color: accent, width: 'fit-content' }}
          >Search catalog instead</button>
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
            borderRadius: 16, padding: '18px 16px',
            background: sel ? `${accent}14` : bg,
            display: 'flex', flexDirection: 'column', gap: 6,
            transition: 'background 300ms ease',
          }}>
            <span style={{ fontFamily: serif, fontSize: 19, color: sel ? accent : ink }}>
              {t.fullLabel}
            </span>
            <span style={{ fontFamily: sans, fontSize: 12.5, color: inkSoft }}>{t.range}</span>
          </button>
        )
      })}
    </div>
  )
}

function ChoiceRow({ value, onChange, options, hint }) {
  return (
    <div>
      {hint && <div style={{ fontFamily: sans, fontSize: 13.5, color: inkSoft, marginBottom: 14 }}>{hint}</div>}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {options.map(o => {
          const sel = value === (o.value ?? o)
          const label = o.label ?? o
          const val   = o.value ?? o
          return (
            <button key={val} onClick={() => onChange(val)} style={{
              all: 'unset', cursor: 'pointer',
              fontFamily: sans, fontSize: 14, padding: '12px 22px', borderRadius: 99,
              color: sel ? '#fff' : ink,
              background: sel ? accent : card,
              boxShadow: sel ? `0 8px 22px ${accent}40` : pillShadow,
              transition: 'all 300ms ease',
            }}>{label}</button>
          )
        })}
      </div>
    </div>
  )
}

function WishlistStep({ catalog, wants, setWants }) {
  const [query, setQuery] = useState('')

  function addRef(r) {
    if (!wants.some(w => w.id === r.id)) setWants([...wants, r])
    setQuery('')
  }
  function removeRef(id) { setWants(wants.filter(w => w.id !== id)) }

  return (
    <div>
      <div style={{ fontFamily: sans, fontSize: 13.5, color: inkSoft, marginBottom: 14 }}>
        Which references would you swap this for?
      </div>
      <ReferenceSearch
        catalog={catalog}
        query={query}
        onQueryChange={setQuery}
        onSelect={addRef}
        excludeIds={wants.map(w => w.id)}
        noMatchesLabel="No matches in catalog"
      />
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 16 }}>
        {wants.map(w => (
          <span key={w.id} style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            fontFamily: sans, fontSize: 13, color: ink,
            background: bg, borderRadius: 999, padding: '7px 8px 7px 14px',
          }}>
            {w.brand} {w.model}
            <span style={{ fontFamily: sans, fontSize: 11.5, color: inkSoft }}>{w.reference}</span>
            <button onClick={() => removeRef(w.id)} style={{
              all: 'unset', cursor: 'pointer', color: inkSoft, fontSize: 14,
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

  const [catalog, setCatalog] = useState([])
  const [query, setQuery] = useState('')
  const [selectedRef, setSelectedRef] = useState(null)
  const [manualMode, setManualMode] = useState(false)

  const set = (k, v) => setData(d => ({ ...d, [k]: v }))

  useEffect(() => {
    let cancelled = false
    async function loadCatalog() {
      const result = await supabase
        .from('watch_references')
        .select('id, reference, variant, price_tier, watch_models(name, watch_brands(name))')
      const rows = unwrap(result, 'CreateListing: load watch catalog')
      if (!rows || cancelled) return
      setCatalog(rows.map(r => ({
        id: r.id,
        reference: r.reference,
        variant: r.variant,
        price_tier: r.price_tier,
        model: r.watch_models?.name ?? '',
        brand: r.watch_models?.watch_brands?.name ?? '',
      })))
    }
    loadCatalog()
    return () => { cancelled = true }
  }, [])

  function selectRef(r) {
    setSelectedRef(r)
    setQuery('')
    setData(d => ({ ...d, brand: '', model: '', ref: '' }))
  }
  function clearRef() { setSelectedRef(null) }
  function toggleManual() {
    if (!manualMode) setSelectedRef(null)
    setManualMode(m => !m)
  }

  async function handlePublish() {
    const manualValid = data.brand.trim() && data.model.trim() && data.ref.trim()
    if (!selectedRef && !manualValid) {
      setError('Select a watch from the catalog, or fill in brand, model and reference.')
      return
    }
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

      const watchFields = selectedRef
        ? {
            reference_id: selectedRef.id,
            brand: selectedRef.brand, model: selectedRef.model, reference: selectedRef.reference,
            price_tier: selectedRef.price_tier,
          }
        : {
            reference_id: null,
            brand: data.brand, model: data.model, reference: data.ref,
            price_tier: data.tier,
          }

      const insertResult = await supabase.from('listings').insert({
        user_id: user.id,
        ...watchFields,
        geo_scope: data.scope,
        open_to_topup: data.topup,
        wanted_references: data.wants.map(w => w.reference),
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
    <div style={{ minHeight: '100%', background: bg, padding: '26px 26px 40px' }}>
      <div style={{
        maxWidth: 640, margin: '0 auto',
        background: card, borderRadius: 22, padding: 32, boxSizing: 'border-box',
        boxShadow: cardShadow,
      }}>
        {/* page head */}
        <div>
          <h1 style={{ margin: 0, fontFamily: serif, fontWeight: 500, fontSize: 28, color: ink }}>
            Create a listing
          </h1>
          <span style={{ fontFamily: sans, fontSize: 14, color: inkSoft }}>
            List one watch, plus the references you'd swap it for.
          </span>
        </div>

        {/* stepper */}
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px 0', margin: '24px 0 4px' }}>
          {STEPS.map((s, i) => (
            <span key={s} style={{ display: 'inline-flex', alignItems: 'center' }}>
              <button onClick={() => setStep(i)} style={{
                all: 'unset', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 7,
              }}>
                <span style={{
                  width: 24, height: 24, borderRadius: '50%',
                  fontFamily: sans, fontSize: 11.5,
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  background: i === step ? accent : i < step ? `${accent}18` : bg,
                  color: i === step ? '#fff' : i < step ? accent : inkSoft,
                  transition: 'all 300ms ease',
                }}>{i < step ? '✓' : i + 1}</span>
                <span style={{ fontFamily: sans, fontSize: 11.5, color: i <= step ? ink : inkSoft }}>{s}</span>
              </button>
              {i < STEPS.length - 1 && (
                <span style={{ width: 16, height: 1, background: 'rgba(22,24,27,0.12)', margin: '0 7px' }} />
              )}
            </span>
          ))}
        </div>

        {/* step content */}
        <div style={{ marginTop: 22 }}>
          <div style={{ fontFamily: serif, fontSize: 18, color: ink, marginBottom: 16 }}>
            {STEPS[step]}
          </div>

          {step === 0 && (
            <WatchStep
              catalog={catalog}
              query={query} onQueryChange={setQuery}
              selectedRef={selectedRef} onSelect={selectRef} onClear={clearRef}
              manualMode={manualMode} onToggleManual={toggleManual}
              data={data} set={set}
            />
          )}
          {step === 1 && <PhotoStep files={photos} setFiles={setPhotos} />}
          {step === 2 && (
            selectedRef ? (
              <div style={{ fontFamily: sans, fontSize: 14, color: inkSoft }}>
                Price tier is set automatically from the catalog:
                <div style={{ marginTop: 10 }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    fontFamily: serif, fontSize: 18, color: accent,
                    borderRadius: 16, padding: '10px 18px', background: `${accent}14`,
                  }}>
                    {TIERS[selectedRef.price_tier]?.fullLabel ?? selectedRef.price_tier}
                  </span>
                </div>
              </div>
            ) : (
              <TierStep value={data.tier} onChange={v => set('tier', v)} />
            )
          )}
          {step === 3 && <ChoiceRow value={data.scope} onChange={v => set('scope', v)} options={GEO_OPTIONS} />}
          {step === 4 && (
            <ChoiceRow
              value={data.topup ? 'yes' : 'no'}
              onChange={v => set('topup', v === 'yes')}
              options={[{ label: 'Yes', value: 'yes' }, { label: 'No', value: 'no' }]}
              hint="Are you open to a cash top-up to balance the swap?"
            />
          )}
          {step === 5 && <WishlistStep catalog={catalog} wants={data.wants} setWants={v => set('wants', v)} />}

          {error && (
            <div style={{
              marginTop: 16, padding: '10px 14px', borderRadius: 12,
              background: `${red}14`, color: red, fontFamily: sans, fontSize: 13,
            }}>{error}</div>
          )}
        </div>

        {/* footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 28 }}>
          <button
            onClick={back}
            onMouseEnter={e => { e.currentTarget.style.color = ink }}
            onMouseLeave={e => { e.currentTarget.style.color = inkSoft }}
            style={{
              all: 'unset', cursor: 'pointer', fontFamily: sans, fontSize: 14, color: inkSoft,
              transition: 'color 300ms ease',
            }}
          >← Back</button>
          <button
            onClick={next}
            disabled={publishing}
            onMouseEnter={e => { if (!publishing) e.currentTarget.style.background = accentHover }}
            onMouseLeave={e => { if (!publishing) e.currentTarget.style.background = accent }}
            style={{
              all: 'unset', cursor: publishing ? 'default' : 'pointer',
              fontFamily: sans, fontSize: 15, fontWeight: 500,
              color: '#fff', background: accent,
              borderRadius: 99, padding: '14px 28px',
              opacity: publishing ? 0.4 : 1,
              transition: 'background 300ms ease, opacity 300ms ease',
            }}
          >
            {publishing ? 'Publishing…' : step < STEPS.length - 1 ? 'Continue →' : 'Publish listing'}
          </button>
        </div>
      </div>
    </div>
  )
}
