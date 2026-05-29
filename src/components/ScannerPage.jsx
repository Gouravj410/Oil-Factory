import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './ScannerPage.css'

export default function ScannerPage({ onClose }) {
  const [activeTab, setActiveTab] = useState('camera') // camera | file
  const [scanStatus, setScanStatus] = useState('idle') // idle | scanning | success | error
  const [errorMsg, setErrorMsg] = useState('')
  const [lastCode, setLastCode] = useState('')
  const scannerRef = useRef(null)
  const html5QrRef = useRef(null)
  const navigate = useNavigate()

  const startScanner = async () => {
    setScanStatus('scanning')
    setErrorMsg('')

    try {
      const { Html5Qrcode } = await import('html5-qrcode')

      if (html5QrRef.current) {
        try { await html5QrRef.current.stop() } catch {}
      }

      const scanner = new Html5Qrcode('sc-reader')
      html5QrRef.current = scanner

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: (w, h) => {
            const size = Math.min(w, h) * 0.7
            return { width: size, height: size }
          },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          // QR decoded!
          setLastCode(decodedText)
          scanner.stop().catch(() => {})

          // Extract code from URL /r/<code> or use raw text (handles trailing slashes and query parameters)
          const match = decodedText.match(/\/r\/([A-Z0-9]+)(?:\/|\?|$)/i)
          if (match) {
            setScanStatus('success')
            setTimeout(() => {
              navigate(`/r/${match[1].toUpperCase()}`)
              if (onClose) onClose()
            }, 800)
          } else if (/^QR\d+[A-Z0-9]+$/i.test(decodedText.trim())) {
            setScanStatus('success')
            setTimeout(() => {
              navigate(`/r/${decodedText.trim().toUpperCase()}`)
              if (onClose) onClose()
            }, 800)
          } else {
            // Try navigating anyway with raw text
            setScanStatus('success')
            setTimeout(() => {
              navigate(`/r/${encodeURIComponent(decodedText.trim())}`)
              if (onClose) onClose()
            }, 800)
          }
        },
        (err) => {
          // Ignore scan errors (just means no QR found yet)
        }
      )
    } catch (err) {
      console.error('Scanner error:', err)
      setScanStatus('error')
      if (err?.message?.includes('permission')) {
        setErrorMsg('Camera permission denied. Please allow camera access and try again.')
      } else {
        setErrorMsg('Could not start camera. Please check your device and try again.')
      }
    }
  }

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setScanStatus('scanning')
    setErrorMsg('')

    try {
      const { Html5Qrcode } = await import('html5-qrcode')

      // Use the sc-reader element in the DOM to initialize
      const html5QrCode = new Html5Qrcode('sc-reader')

      const decodedText = await html5QrCode.scanFile(file, false)

      // Success!
      setLastCode(decodedText)
      setScanStatus('success')

      // Extract code and redirect (handles trailing slashes and query parameters)
      const match = decodedText.match(/\/r\/([A-Z0-9]+)(?:\/|\?|$)/i)
      const finalCode = match ? match[1].toUpperCase() : decodedText.trim().toUpperCase()

      setTimeout(() => {
        navigate(`/r/${finalCode}`)
        if (onClose) onClose()
      }, 1000)

    } catch (err) {
      console.error('File scan error:', err)
      setScanStatus('error')
      setErrorMsg('No valid QR code found in this photo. Please make sure the QR is clear and well-lit.')
    }
  }

  const stopScanner = async () => {
    if (html5QrRef.current) {
      try { await html5QrRef.current.stop() } catch {}
      html5QrRef.current = null
    }
    setScanStatus('idle')
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (html5QrRef.current) {
        html5QrRef.current.stop().catch(() => {})
      }
    }
  }, [])

  return (
    <div className="sc-wrap">
      {/* Animated background */}
      <div className="sc-bg">
        <div className="sc-orb sc-orb--1" />
        <div className="sc-orb sc-orb--2" />
        <div className="sc-orb sc-orb--3" />
      </div>

      {/* Close button */}
      {onClose && (
        <button className="sc-close-btn" onClick={() => { stopScanner(); onClose() }}>✕</button>
      )}

      <div className="sc-container">
        {/* Header */}
        <div className="sc-header">
          <div className="sc-icon-wrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sc-icon-svg-badge">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="4" />
              <line x1="8" y1="2" x2="8" y2="4" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <div className="sc-icon-pulse" />
          </div>
          <h1 className="sc-title">Scan QR & Win Reward!</h1>
          <p className="sc-subtitle">
            Point camera or upload a bottle photo to unlock your exclusive **Gold Mairani** reward
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="sc-tabs">
          <button
            className={`sc-tab-btn ${activeTab === 'camera' ? 'sc-tab-btn--active' : ''}`}
            onClick={() => { stopScanner(); setActiveTab('camera'); setScanStatus('idle'); setErrorMsg('') }}
          >
            📷 Live Camera
          </button>
          <button
            className={`sc-tab-btn ${activeTab === 'file' ? 'sc-tab-btn--active' : ''}`}
            onClick={() => { stopScanner(); setActiveTab('file'); setScanStatus('idle'); setErrorMsg('') }}
          >
            📁 Upload Photo
          </button>
        </div>

        {/* Scanner Area */}
        <div className="sc-reader-wrap" style={{ display: activeTab === 'camera' || scanStatus === 'success' ? 'block' : 'none' }}>
          <div
            id="sc-reader"
            className={`sc-reader ${scanStatus === 'scanning' ? 'sc-reader--active' : ''}`}
            ref={scannerRef}
          />

          {/* Overlay when idle */}
          {scanStatus === 'idle' && (
            <div className="sc-overlay-idle">
              <div className="sc-idle-icon">📷</div>
              <p>Camera preview will appear here</p>
            </div>
          )}

          {/* Success overlay */}
          {scanStatus === 'success' && (
            <div className="sc-overlay-success">
              <div className="sc-success-icon">✓</div>
              <p>QR Code Detected!</p>
              <p className="sc-redirecting">Redirecting…</p>
            </div>
          )}

          {/* Corner frames */}
          <div className="sc-corner sc-corner--tl" />
          <div className="sc-corner sc-corner--tr" />
          <div className="sc-corner sc-corner--bl" />
          <div className="sc-corner sc-corner--br" />

          {/* Scanning line animation */}
          {scanStatus === 'scanning' && (
            <div className="sc-scan-line" />
          )}
        </div>

        {/* File Upload Tab Area */}
        {activeTab === 'file' && scanStatus !== 'success' && (
          <div className="sc-file-wrapper">
            <div className="sc-file-dropzone" onClick={() => document.getElementById('sc-file-input').click()}>
              <div className="sc-file-icon">📤</div>
              <p className="sc-file-text-main">Click or select a photo of the QR code</p>
              <p className="sc-file-text-sub">Supports JPG, PNG or camera photos</p>
              <input
                type="file"
                id="sc-file-input"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
            </div>
            {scanStatus === 'scanning' && (
              <div className="sc-file-loading">
                <span className="sc-spinner-icon" /> Decoding image, please wait...
              </div>
            )}
            
            {/* hidden div for html5-qrcode file initialization requirements */}
            <div id="sc-reader-dummy" style={{ display: 'none' }} />
          </div>
        )}

        {/* Status */}
        {activeTab === 'camera' && scanStatus === 'scanning' && (
          <div className="sc-status sc-status--scanning">
            <span className="sc-status-dot" />
            Scanning… Point camera at QR code on bottle
          </div>
        )}

        {scanStatus === 'error' && (
          <div className="sc-status sc-status--error">
            {errorMsg}
          </div>
        )}

        {/* Camera Control Buttons */}
        {activeTab === 'camera' && (
          <div className="sc-actions">
            {scanStatus === 'idle' || scanStatus === 'error' ? (
              <button className="sc-btn sc-btn--primary" onClick={startScanner}>
                Start Scanning
              </button>
            ) : scanStatus === 'scanning' ? (
              <button className="sc-btn sc-btn--secondary" onClick={stopScanner}>
                ✕ Stop Scanner
              </button>
            ) : null}
          </div>
        )}

        {/* Manual entry */}
        <div className="sc-manual">
          <p>Don't have camera access?</p>
          <ManualEntry onSubmit={(code) => { navigate(`/r/${code}`); if (onClose) onClose() }} />
        </div>

        {/* How it works */}
        <div className="sc-how">
          <h3>How to claim your reward</h3>
          <div className="sc-steps">
            <div className="sc-step">
              <span className="sc-step-num">1</span>
              <p>Find the QR code on your <strong>Gold Mairani</strong> oil tin/bottle</p>
            </div>
            <div className="sc-step">
              <span className="sc-step-num">2</span>
              <p>Click <strong>Start Scanning</strong> or upload a clear photo of it</p>
            </div>
            <div className="sc-step">
              <span className="sc-step-num">3</span>
              <p>Fill in your details in the secure form and submit</p>
            </div>
            <div className="sc-step">
              <span className="sc-step-num">4</span>
              <p>Wait for the announcements — you could win exciting prizes!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ManualEntry({ onSubmit }) {
  const [code, setCode] = useState('')
  const [show, setShow] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    const trimmed = code.trim().toUpperCase()
    if (trimmed.length > 3) {
      onSubmit(trimmed)
    }
  }

  if (!show) {
    return (
      <button className="sc-manual-toggle" onClick={() => setShow(true)}>
        Enter code manually →
      </button>
    )
  }

  return (
    <form className="sc-manual-form" onSubmit={handleSubmit}>
      <input
        value={code}
        onChange={e => setCode(e.target.value)}
        placeholder="Enter QR code (e.g. QR1000001ABCD1234)"
        className="sc-manual-input"
        autoFocus
      />
      <button type="submit" className="sc-btn sc-btn--small">Go →</button>
    </form>
  )
}
