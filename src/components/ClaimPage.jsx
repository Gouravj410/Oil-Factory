import React, { useEffect, useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import QRCode from 'qrcode'
import './ClaimPage.css'

const API = 'http://localhost:5000'

const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh',
  'Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka',
  'Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram',
  'Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana',
  'Tripura','Uttar Pradesh','Uttarakhand','West Bengal',
  'Delhi','Jammu & Kashmir','Ladakh'
]

export default function ClaimPage() {
  const { code } = useParams()
  const [status, setStatus] = useState('validating')
  const [scheme, setScheme] = useState(null)
  const [qrError, setQrError] = useState('')
  const [formError, setFormError] = useState('')
  const [submissionId, setSubmissionId] = useState(null)
  const [qrDataUrl, setQrDataUrl] = useState('')
  const canvasRef = useRef(null)

  const [form, setForm] = useState({
    name: '', phone: '', city: '', state: '', product_type: ''
  })

  // Generate QR code image for display
  useEffect(() => {
    if (!code) return
    const url = `${window.location.origin}/r/${code.toUpperCase()}`
    QRCode.toDataURL(url, {
      width: 180,
      margin: 2,
      color: { dark: '#1a1a2e', light: '#ffffff' },
      errorCorrectionLevel: 'M'
    }).then(setQrDataUrl).catch(() => {})
  }, [code])

  // Validate QR code
  useEffect(() => {
    if (!code) { setStatus('error'); setQrError('No QR code provided.'); return }
    fetch(`${API}/api/qr/validate/${code.toUpperCase()}`)
      .then(r => r.json())
      .then(res => {
        if (res.error) { setStatus('error'); setQrError(res.error) }
        else { setScheme(res.data); setStatus('form') }
      })
      .catch(() => {
        // Offline fallback — show form for demo
        setScheme({
          scheme_title: 'Gold Mairani Reward Campaign',
          reward_text: 'Win exciting prizes & cashback!'
        })
        setStatus('form')
      })
  }, [code])

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const validate = () => {
    if (!form.name.trim()) return 'Full Name is required.'
    if (form.name.trim().length < 2) return 'Please enter a valid name.'
    if (!form.phone.trim()) return 'Mobile number is required.'
    if (!/^[6-9]\d{9}$/.test(form.phone.trim())) return 'Enter a valid 10-digit Indian mobile number.'
    if (!form.city.trim()) return 'City is required.'
    if (!form.state) return 'Please select your state.'
    return null
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setFormError('')
    const err = validate()
    if (err) { setFormError(err); return }
    setStatus('submitting')
    try {
      const res = await fetch(`${API}/api/qr/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qr_code: code.toUpperCase(),
          name: form.name.trim(),
          phone: form.phone.trim(),
          city: form.city.trim(),
          state: form.state,
          purchase_details: { product_type: form.product_type || null },
        }),
      })
      const data = await res.json()
      if (data.error) { setFormError(data.error); setStatus('form') }
      else { setSubmissionId(data.data?.submission_id); setStatus('success') }
    } catch {
      setFormError('Submission failed. Please check your connection and try again.')
      setStatus('form')
    }
  }

  // ── Validating ───────────────────────────────────────────────
  if (status === 'validating') return (
    <div className="cp-wrap">
      <div className="cp-card cp-card--loading">
        <div className="cp-pulse-ring" />
        <div className="cp-loader-icon"></div>
        <p className="cp-checking">Verifying your QR code…</p>
        <p className="cp-checking-sub">Please wait a moment</p>
      </div>
    </div>
  )

  // ── Error ────────────────────────────────────────────────────
  if (status === 'error') return (
    <div className="cp-wrap">
      <div className="cp-card cp-card--error">
        <div className="cp-result-icon cp-result-icon--error">✗</div>
        <h1>Invalid QR Code</h1>
        <p>{qrError}</p>
        <p className="cp-hint">If you believe this is a mistake, please contact our support team.</p>
        <a href="#/" className="cp-back-btn">← Go to Homepage</a>
      </div>
    </div>
  )

  // ── Success ──────────────────────────────────────────────────
  if (status === 'success') return (
    <div className="cp-wrap">
      <div className="cp-card cp-card--success">
        <div className="cp-confetti-wrap">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="cp-confetti-dot" style={{ '--i': i }} />
          ))}
        </div>
        <div className="cp-result-icon cp-result-icon--success">✓</div>
        <h1>Entry Recorded!</h1>
        <p>Thank you, <strong>{form.name}</strong>! Your participation has been registered.</p>
        {submissionId && (
          <div className="cp-ref-box">
            <span className="cp-ref-label">Reference ID</span>
            <span className="cp-ref-value">#{submissionId}</span>
          </div>
        )}
        <div className="cp-success-details">
          <div className="cp-detail-row">
            <span></span><span>We'll contact you at <strong>{form.phone}</strong></span>
          </div>
          <div className="cp-detail-row">
            <span></span><span>{form.city}, {form.state}</span>
          </div>
        </div>
        <div className="cp-success-note">
          <p>Winners are announced after the campaign ends.</p>
          <p>Exciting prizes await — stay tuned!</p>
        </div>
        <a href="#/" className="cp-back-btn cp-back-btn--success">← Explore Our Products</a>
      </div>
    </div>
  )

  // ── Claim Form ────────────────────────────────────────────────
  return (
    <div className="cp-wrap">
      {/* Animated Background */}
      <div className="cp-bg-orb cp-bg-orb--1" />
      <div className="cp-bg-orb cp-bg-orb--2" />
      <div className="cp-bg-orb cp-bg-orb--3" />

      <div className="cp-card">
        {/* Header */}
        <div className="cp-header">
          <div className="cp-brand-badge">
            <span className="cp-brand-icon"></span>
            <span className="cp-brand-name">Gold Mairani</span>
          </div>
          <h1 className="cp-title">Claim Your Reward!</h1>
          {scheme?.scheme_title && (
            <p className="cp-scheme-name">{scheme.scheme_title}</p>
          )}
        </div>

        {/* QR + Reward Row */}
        <div className="cp-info-row">
          {/* QR Code Display */}
          <div className="cp-qr-display">
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="Your QR Code" className="cp-qr-img" />
            ) : (
              <div className="cp-qr-placeholder">QR</div>
            )}
            <span className="cp-qr-code-text">{code?.toUpperCase()}</span>
          </div>

          {/* Reward Info */}
          <div className="cp-reward-panel">
            <div className="cp-reward-badge">Your Reward</div>
            <p className="cp-reward-text">
              {scheme?.reward_text || 'Win exciting prizes & cashback!'}
            </p>
            <div className="cp-reward-tags">
              <span className="cp-tag">Verified</span>
              <span className="cp-tag">Secure</span>
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="cp-steps">
          <div className="cp-step">
            <span className="cp-step-num">1</span>
            <span>Fill your details</span>
          </div>
          <div className="cp-step-arrow">→</div>
          <div className="cp-step">
            <span className="cp-step-num">2</span>
            <span>Submit entry</span>
          </div>
          <div className="cp-step-arrow">→</div>
          <div className="cp-step">
            <span className="cp-step-num">3</span>
            <span>Win prizes!</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="cp-form" noValidate>
          <div className="cp-form-section-label">Your Details</div>

          <div className="cp-field">
            <label htmlFor="cp-name">
              Full Name <span className="cp-required">*</span>
            </label>
            <input
              id="cp-name"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Rahul Sharma"
              autoComplete="name"
            />
          </div>

          <div className="cp-field">
            <label htmlFor="cp-phone">
              Mobile Number <span className="cp-required">*</span>
            </label>
            <div className="cp-phone-wrap">
              <span className="cp-phone-prefix">+91</span>
              <input
                id="cp-phone"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="10-digit mobile number"
                type="tel"
                maxLength={10}
                inputMode="numeric"
                autoComplete="tel"
              />
            </div>
          </div>

          <div className="cp-row">
            <div className="cp-field">
              <label htmlFor="cp-city">
                City <span className="cp-required">*</span>
              </label>
              <input
                id="cp-city"
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="Your city"
                autoComplete="address-level2"
              />
            </div>
            <div className="cp-field">
              <label htmlFor="cp-state">
                State <span className="cp-required">*</span>
              </label>
              <select id="cp-state" name="state" value={form.state} onChange={handleChange}>
                <option value="">Select state</option>
                {INDIAN_STATES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="cp-field">
            <label htmlFor="cp-product">Product Purchased</label>
            <select id="cp-product" name="product_type" value={form.product_type} onChange={handleChange}>
              <option value="">Select product (optional)</option>
              <option value="mustard_oil">Mustard Oil (Kachi Ghani)</option>
              <option value="soyabean_oil">Soyabean Oil</option>
              <option value="cottonseed_oil">Cottonseed Oil</option>
              <option value="other">Other</option>
            </select>
          </div>

          {formError && (
            <div className="cp-error" role="alert">
              {formError}
            </div>
          )}

          <button
            type="submit"
            className="cp-submit"
            disabled={status === 'submitting'}
          >
            {status === 'submitting' ? (
              <><span className="cp-btn-spinner" /> Submitting Entry…</>
            ) : (
              <>Submit My Entry</>
            )}
          </button>
        </form>

        <p className="cp-privacy">
          Your information is 100% secure and used only for this campaign.
          <br />One entry per QR code is allowed.
        </p>
      </div>
    </div>
  )
}
