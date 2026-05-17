import { useState } from 'react'

const REASONS = [
  'Fake watch photos',
  'Suspected counterfeit',
  'Inappropriate chat behavior',
  'Fake account / spam',
]

export default function ReportModal({ isOpen, onClose, onSubmit }) {
  const [reason, setReason] = useState(REASONS[0])
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  async function handleSubmit() {
    setLoading(true)
    await onSubmit(reason)
    setLoading(false)
    setSubmitted(true)
  }

  function handleClose() {
    setReason(REASONS[0])
    setSubmitted(false)
    onClose()
  }

  return (
    <div
      onClick={handleClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: 16, padding: '28px',
          width: '100%', maxWidth: 400, boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          margin: '0 16px',
        }}
      >
        {submitted ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>✓</div>
            <p style={{ fontSize: 15, color: '#333', margin: '0 0 24px' }}>
              Thank you, we'll review this within 48 hours.
            </p>
            <button
              onClick={handleClose}
              style={{
                background: '#111', color: '#fff', border: 'none',
                borderRadius: 8, padding: '10px 24px', fontSize: 14,
                fontWeight: 600, cursor: 'pointer',
              }}
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <h3 style={{ margin: '0 0 20px', fontSize: 17, fontWeight: 700 }}>Report listing</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
              {REASONS.map(r => (
                <label
                  key={r}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 14, color: '#333' }}
                >
                  <input
                    type="radio"
                    name="report-reason"
                    value={r}
                    checked={reason === r}
                    onChange={() => setReason(r)}
                    style={{ accentColor: '#111', width: 16, height: 16 }}
                  />
                  {r}
                </label>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                onClick={handleClose}
                style={{
                  background: '#fff', color: '#444', border: '1px solid #e5e7eb',
                  borderRadius: 8, padding: '9px 20px', fontSize: 14,
                  fontWeight: 600, cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                style={{
                  background: loading ? '#e5e7eb' : '#dc2626', color: loading ? '#aaa' : '#fff',
                  border: 'none', borderRadius: 8, padding: '9px 20px', fontSize: 14,
                  fontWeight: 600, cursor: loading ? 'default' : 'pointer',
                }}
              >
                {loading ? 'Submitting…' : 'Submit Report'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
