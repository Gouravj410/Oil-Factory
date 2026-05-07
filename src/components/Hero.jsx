import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import '../styles/Hero.css'

const Hero = () => {
  const oilProducts = useMemo(() => [
    {
      id: 'mustard',
      name: 'MUSTARD',
      fullName: 'Pure Mustard Oil',
      tagline: 'Swad Ka Powerful Blast!',
      description: 'Gold Mairani Kachi Ghani Pure Mustard Oil — traditional cold-pressed purity for every Indian kitchen.',
      image: '/images/mustard850.png',
      video: '/images/mustardvideo.mp4',
      bgGradient: 'radial-gradient(ellipse at 50% 30%, rgba(211, 47, 47, 0.25) 0%, rgba(211, 47, 47, 0.08) 50%, transparent 75%)',
      accentColor: '#D32F2F',
      glowColor: 'rgba(211, 47, 47, 0.45)',
      nameBgColor: '#D32F2F',
    },
    {
      id: 'soyabean',
      name: 'SOYABEAN',
      fullName: 'Refined Soya Oil',
      tagline: 'Rich in Taste & Purity',
      description: 'Gold Mairani Refined Soya Bean Oil — light, healthy & rich in essential nutrients for wholesome cooking.',
      image: '/images/soyabean850.png',
      video: '/images/soyabeanvideo.mp4',
      bgGradient: 'radial-gradient(ellipse at 50% 30%, rgba(76, 175, 80, 0.22) 0%, rgba(27, 94, 32, 0.08) 50%, transparent 75%)',
      accentColor: '#1B5E20',
      glowColor: 'rgba(76, 175, 80, 0.45)',
      nameBgColor: '#4CAF50',
    },
    {
      id: 'cottonseed',
      name: 'COTTONSEED',
      fullName: 'Refined Cottonseed Oil',
      tagline: 'Pure & Light Cooking',
      description: 'Gold Mairani Refined Cottonseed Oil — naturally light, pure and perfect for crispy, healthy frying.',
      image: '/images/cottonseed850.png',
      video: '/images/cottonseedvideo.mp4',
      bgGradient: 'radial-gradient(ellipse at 50% 30%, rgba(255, 152, 0, 0.22) 0%, rgba(230, 81, 0, 0.08) 50%, transparent 75%)',
      accentColor: '#E65100',
      glowColor: 'rgba(255, 152, 0, 0.45)',
      nameBgColor: '#FF9800',
    },
  ], [])

  const productCount = oilProducts.length

  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(1)
  const videoRefs = useRef([])
  const fadePauseTimeout = useRef(null)
  const prevIndexRef = useRef(0)
  const VIDEO_START = 3
  const VIDEO_END = 10

  // When slide changes: seek newly-active video to 3s, play it, and advance smoothly at 10s
  useEffect(() => {
    const vid = videoRefs.current[currentIndex]
    if (!vid) return

    const previousIndex = prevIndexRef.current
    const previousVideo = videoRefs.current[previousIndex]

    const advanceSlide = () => {
      setDirection(1)
      setCurrentIndex(prev => (prev + 1) % productCount)
    }

    const handleTimeUpdate = () => {
      if (vid.currentTime >= VIDEO_END) {
        vid.removeEventListener('timeupdate', handleTimeUpdate)
        advanceSlide()
      }
    }

    const activate = () => {
      vid.currentTime = VIDEO_START
      vid.play().catch(() => {})
      vid.addEventListener('timeupdate', handleTimeUpdate)
    }

    clearTimeout(fadePauseTimeout.current)
    if (previousVideo && previousIndex !== currentIndex) {
      fadePauseTimeout.current = setTimeout(() => {
        previousVideo.pause()
      }, 1400)
    }

    if (vid.readyState >= 2) {
      activate()
    } else {
      vid.addEventListener('loadeddata', activate, { once: true })
    }

    prevIndexRef.current = currentIndex

    return () => {
      vid.removeEventListener('timeupdate', handleTimeUpdate)
      clearTimeout(fadePauseTimeout.current)
    }
  }, [currentIndex, productCount])

  const handleSelect = useCallback((index) => {
    setDirection(index > currentIndex ? 1 : -1)
    setCurrentIndex(index)
  }, [currentIndex])

  const current = oilProducts[currentIndex]

  // Bottle slide animation
  const bottleVariants = {
    enter: (dir) => ({
      x: dir > 0 ? 200 : -200,
      opacity: 0,
      scale: 0.85,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1],
      }
    },
    exit: (dir) => ({
      x: dir > 0 ? -200 : 200,
      opacity: 0,
      scale: 0.85,
      transition: {
        duration: 0.4,
        ease: 'easeIn'
      }
    })
  }

  // Background text animation — subtle watermark
  const bgTextVariants = {
    enter: (dir) => ({
      x: dir > 0 ? 100 : -100,
      y: "-50%",
      opacity: 0,
    }),
    center: {
      x: 0,
      y: "-50%",
      opacity: 0.06,
      transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.05 }
    },
    exit: (dir) => ({
      x: dir > 0 ? -100 : 100,
      y: "-50%",
      opacity: 0,
      transition: { duration: 0.35 }
    })
  }

  // Info text animation
  const infoVariants = {
    enter: { opacity: 0, y: 20 },
    center: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }
    },
    exit: {
      opacity: 0,
      y: -15,
      transition: { duration: 0.25 }
    }
  }

  return (
    <section className="hero" id="hero">
      {/* Video Background — all 3 always mounted, crossfade via opacity */}
      <div className="hero-video-wrapper">
        {oilProducts.map((product, i) => (
          <video
            key={product.id}
            ref={el => { videoRefs.current[i] = el }}
            className={`hero-video ${i === currentIndex ? 'hero-video--active' : ''}`}
            muted
            playsInline
            preload="auto"
          >
            <source src={product.video} type="video/mp4" />
          </video>
        ))}
        <div className="hero-video-overlay" />
      </div>

      {/* Color Tint on top of video */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`bg-${currentIndex}`}
          className="hero-bg-gradient"
          style={{ background: current.bgGradient }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
        />
      </AnimatePresence>

      {/* Subtle ground reflection */}
      <div className="hero-ambient-glow" style={{ background: current.glowColor }} />

      {/* ===== CENTERED STAGE: Name behind → Bottle in front ===== */}
      <div className="hero-center-stage">

        {/* BIG NAME TEXT - watermark behind bottle */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`bgtext-${currentIndex}`}
            className="hero-bg-name"
            custom={direction}
            variants={bgTextVariants}
            initial="enter"
            animate="center"
            exit="exit"
            style={{ color: current.nameBgColor }}
          >
            {current.name}
          </motion.div>
        </AnimatePresence>

        {/* BOTTLE - centered, in front of name */}
        <div className="bottle-perspective-wrapper">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={`bottle-${currentIndex}`}
              className="bottle-3d-container"
              custom={direction}
              variants={bottleVariants}
              initial="enter"
              animate="center"
              exit="exit"
            >
              <img
                src={current.image}
                alt={current.fullName}
                className="bottle-hero-image"
                draggable={false}
              />

              {/* Bottle ground shadow */}
              <div
                className="bottle-glow"
                style={{
                  background: `radial-gradient(ellipse, ${current.glowColor} 0%, transparent 70%)`
                }}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="hero-controls">
        <div className="hero-indicators">
          {oilProducts.map((product, i) => (
            <motion.button
              key={i}
              className={`hero-dot ${i === currentIndex ? 'active' : ''}`}
              onClick={() => handleSelect(i)}
              animate={{
                width: i === currentIndex ? 32 : 10,
                background: i === currentIndex
                  ? product.accentColor
                  : 'rgba(255,255,255,0.25)'
              }}
              whileHover={{ scale: 1.15 }}
              transition={{ duration: 0.3 }}
              aria-label={`Select ${product.fullName}`}
            />
          ))}
        </div>
      </div>

      {/* ===== PRODUCT INFO ===== */}
      <div className="hero-info-bar">
        <AnimatePresence mode="wait">
          <motion.div
            key={`info-${currentIndex}`}
            className="hero-info-content"
            variants={infoVariants}
            initial="enter"
            animate="center"
            exit="exit"
          >
            <div className="hero-cta-group">
              <motion.a
                href="#products"
                className="btn-gold"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                Explore Products
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </motion.a>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  )
}

export default Hero
