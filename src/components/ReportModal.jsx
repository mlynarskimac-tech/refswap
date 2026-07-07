import { useState } from 'react'

const REASONS = [
  'Fake watch photos',
  'Suspected counterfeit',
  'Inappropriate chat behavior',
  'Fake account / spam',
]

const gold   = '#A9823F'
const ink    = '#1C1B19'
const ink2   = '#6E6A62'
const ink3   = '#A6A199'
const stroke = '#E2DED6'
const red    = '#D24B4B'
const sans   = "'Inter', system-ui, sans-serif"

export default function ReportModal({ isOpen, onClose, onSubmit }) {
  const [reason, setReason] = useState(REASONS[0])
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  async function handleSubmit() {
    setLoading(true)
    const ok = await onSubmit(reason)
    setLoading(false)
    if (ok) setSubmitted(true)
  }

  function handleClose() {
    setReason(REASONS[0])
    setSubmitted(false)
    onClose()
  }

  return (
    <div onClick={handleClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(28,27,25,.34)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 80, animation: 'fadeIn .2s ease',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: '#fff', borderRadius: 14, padding: '28px 26px',
        width: '100%', maxWidth: 400, margin: '0 16px',
        boxShadow: '0 16px 40px -16px rgba(0,0,0,.35)',
      }}>
        {submitted ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 36, marginBottom: 12, color: gold }}>✓</div>
            <p style={{ fontFamily: sans, fontSize: 14, color: ink2, margin: '0 0 24px', lineHeight: 1.5 }}>
              Thank you — we'll review this within 48 hours.
            </p>
            <button onClick={handleClose} style={{
              all: 'unset', cursor: 'pointer', fontFamily: sans, fontSize: 13.5, fontWeight: 600,
              color: '#fff', background: ink, borderRadius: 8, padding: '10px 24px',
            }}>Close</button>
          </div>
        ) : (
          <>
            <h3 style={{ fontFamily: sans, margin: '0 0 20px', fontSize: 16, fontWeight: 600, color: ink }}>
              Report listing
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
              {REASONS.map(r => (
                <label key={r} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  cursor: 'pointer', fontFamily: sans, fontSize: 14, color: ink2,
                }}>
                  <input
                    type="radio" name="report-reason" value={r}
                    checked={reason === r} onChange={() => setReason(r)}
                    style={{ accentColor: gold, width: 16, height: 16 }}
                  />
                  {r}
                </label>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={handleClose} style={{
                all: 'unset', cursor: 'pointer', fontFamily: sans, fontSize: 13.5,
                color: ink2, border: `1px solid ${stroke}`, borderRadius: 8, padding: '9px 20px',
              }}>Cancel</button>
              <button onClick={handleSubmit} disabled={loading} style={{
                all: 'unset', cursor: loading ? 'default' : 'pointer',
                fontFamily: sans, fontSize: 13.5, fontWeight: 600,
                color: '#fff', background: loading ? ink3 : red,
                borderRadius: 8, padding: '9px 20px',
                transition: 'background .15s',
              }}>{loading ? 'Submitting…' : 'Submit Report'}</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
