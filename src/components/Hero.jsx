import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import '../styles/Hero.css'

const Hero = ({ onRewardsClick }) => {
  const oilProducts = useMemo(() => [
    {
      id: 'mustard',
      name: 'MUSTARD',
      fullName: 'Pure Mustard Oil',
      tagline: 'Swad Ka Powerful Blast!',
      description: 'Gold Mairani Kachi Ghani Pure Mustard Oil — traditional cold-pressed purity for every Indian kitchen.',
      image: './images/mustard850.png',
      video: './images/mustardvideo.mp4',
      videoScale: 1.15,
      videoBrightness: 1,
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
      image: './images/soyabean850.png',
      video: './images/soyabeanvideo.mp4',
      videoScale: 1.15,
      videoBrightness: 1,
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
      image: './images/cottonseed850.png',
      video: './images/cottonseedvideo.mp4',
      videoScale: 1,
      videoBrightness: 0.55,
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

  useEffect(() => {
    const vid = videoRefs.current[currentIndex]
    if (!vid) return

    const previousIndex = prevIndexRef.current
    const previousVideo = videoRefs.current[previousIndex]

    const activate = () => {
      vid.currentTime = VIDEO_START
      vid.loop = true
      vid.play().catch(() => {})
    }

    clearTimeout(fadePauseTimeout.current)
    if (previousVideo && previousIndex !== currentIndex) {
      fadePauseTimeout.current = setTimeout(() => {
        previousVideo.pause()
        previousVideo.currentTime = VIDEO_START
      }, 1400)
    }

    if (vid.readyState >= 2) {
      activate()
    } else {
      vid.addEventListener('loadeddata', activate, { once: true })
    }

    prevIndexRef.current = currentIndex

    return () => {
      clearTimeout(fadePauseTimeout.current)
    }
  }, [currentIndex, productCount])

  useEffect(() => {
    const intervalId = setInterval(() => {
      setDirection(1)
      setCurrentIndex(prev => (prev + 1) % productCount)
    }, 5000)

    return () => clearInterval(intervalId)
  }, [productCount])

  const current = oilProducts[currentIndex]
  const motionTransition = { duration: 1.2, ease: [0.16, 1, 0.3, 1] }

  // Bottle fade animation
  const bottleVariants = {
    enter: (dir) => ({
      opacity: 0,
      scale: 0.96,
    }),
    center: {
      opacity: 1,
      scale: 1,
      transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] }
    },
    exit: (dir) => ({
      opacity: 0,
      scale: 0.96,
      transition: { duration: 1.0, ease: 'easeOut' }
    })
  }

  // Background text animation — subtle watermark
  const bgTextVariants = {
    enter: (dir) => ({
      opacity: 0,
      scale: 0.98,
    }),
    center: {
      opacity: 0.06,
      scale: 1,
      transition: { duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.05 }
    },
    exit: (dir) => ({
      opacity: 0,
      scale: 0.98,
      transition: { duration: 0.9, ease: 'easeOut' }
    })
  }

  const stageVariants = {
    enter: (dir) => ({ opacity: 0, scale: 0.98 }),
    center: { opacity: 1, scale: 1, transition: motionTransition },
    exit: (dir) => ({ opacity: 0, scale: 0.98, transition: { duration: 0.9, ease: 'easeOut' } })
  }

  const infoVariants = {
    enter: { opacity: 0, y: 20 },
    center: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: { duration: 0.35 }
    }
  }

  return (
    <section className="hero" id="hero">
      {/* Video Background — all 3 always mounted, crossfade via opacity */}
      <div className="hero-video-wrapper">
        {oilProducts.map((product, i) => (
          <motion.video
            key={product.id}
            ref={el => { videoRefs.current[i] = el }}
            className={`hero-video ${i === currentIndex ? 'hero-video--active' : ''}`}
            muted
            playsInline
            loop
            preload="auto"
            style={{
              transform: `translateX(-50%) scale(${product.videoScale ?? 1})`,
              filter: `brightness(${product.videoBrightness ?? 1})`
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: i === currentIndex ? 1 : 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <source src={product.video} type="video/mp4" />
          </motion.video>
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
      <AnimatePresence mode="wait">
        <motion.div
          key={`stage-${currentIndex}`}
          className="hero-center-stage"
          custom={direction}
          variants={stageVariants}
          initial="enter"
          animate="center"
          exit="exit"
        >
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
        </motion.div>
      </AnimatePresence>

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

              {onRewardsClick && (
                <motion.button
                  className="btn-scan-hero"
                  onClick={onRewardsClick}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  View Rewards
                </motion.button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  )
}

export default Hero
