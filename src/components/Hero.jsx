import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import '../styles/Hero.css'

const Hero = ({ scrollY }) => {
  const oilProducts = [
    {
      id: 'mustard',
      name: 'MUSTARD',
      fullName: 'Pure Mustard Oil',
      tagline: 'Swad Ka Powerful Blast!',
      description: 'Gold Mairani Kachi Ghani Pure Mustard Oil — traditional cold-pressed purity for every Indian kitchen.',
      image: '/images/mustard_oil_bottle.png',
      labelImage: '/images/Slogan.jpeg',
      bgGradient: 'radial-gradient(ellipse at 30% 50%, rgba(212, 47, 47, 0.15) 0%, transparent 60%), radial-gradient(ellipse at 70% 30%, rgba(244, 208, 63, 0.12) 0%, transparent 50%)',
      accentColor: '#D32F2F',
      glowColor: 'rgba(244, 208, 63, 0.4)',
      textBgColor: 'rgba(211, 47, 47, 0.08)',
    },
    {
      id: 'soyabean',
      name: 'SOYABEAN',
      fullName: 'Refined Soya Oil',
      tagline: 'Rich in Taste & Purity',
      description: 'Gold Mairani Refined Soya Bean Oil — light, healthy & rich in essential nutrients for wholesome cooking.',
      image: '/images/soyabean_oil_bottle.png',
      labelImage: '/images/RefinedSoyaOil.jpeg',
      bgGradient: 'radial-gradient(ellipse at 30% 50%, rgba(27, 94, 32, 0.15) 0%, transparent 60%), radial-gradient(ellipse at 70% 30%, rgba(76, 175, 80, 0.12) 0%, transparent 50%)',
      accentColor: '#1B5E20',
      glowColor: 'rgba(76, 175, 80, 0.4)',
      textBgColor: 'rgba(27, 94, 32, 0.08)',
    },
    {
      id: 'cottonseed',
      name: 'COTTONSEED',
      fullName: 'Refined Cottonseed Oil',
      tagline: 'Pure & Light Cooking',
      description: 'Gold Mairani Refined Cottonseed Oil — naturally light, pure and perfect for crispy, healthy frying.',
      image: '/images/cottonseed_oil_bottle.png',
      labelImage: '/images/KitchenBg.jpeg',
      bgGradient: 'radial-gradient(ellipse at 30% 50%, rgba(230, 81, 0, 0.15) 0%, transparent 60%), radial-gradient(ellipse at 70% 30%, rgba(255, 152, 0, 0.12) 0%, transparent 50%)',
      accentColor: '#E65100',
      glowColor: 'rgba(255, 152, 0, 0.4)',
      textBgColor: 'rgba(230, 81, 0, 0.08)',
    }
  ]

  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(1)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  // Auto-slide every 4 seconds
  useEffect(() => {
    if (!isAutoPlaying) return
    const timer = setInterval(() => {
      setDirection(1)
      setCurrentIndex(prev => (prev + 1) % oilProducts.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [isAutoPlaying, oilProducts.length])

  const handleNext = useCallback(() => {
    setIsAutoPlaying(false)
    setDirection(1)
    setCurrentIndex(prev => (prev + 1) % oilProducts.length)
    setTimeout(() => setIsAutoPlaying(true), 8000)
  }, [oilProducts.length])

  const handlePrev = useCallback(() => {
    setIsAutoPlaying(false)
    setDirection(-1)
    setCurrentIndex(prev => (prev - 1 + oilProducts.length) % oilProducts.length)
    setTimeout(() => setIsAutoPlaying(true), 8000)
  }, [oilProducts.length])

  const handleSelect = useCallback((index) => {
    setIsAutoPlaying(false)
    setDirection(index > currentIndex ? 1 : -1)
    setCurrentIndex(index)
    setTimeout(() => setIsAutoPlaying(true), 8000)
  }, [currentIndex])

  const current = oilProducts[currentIndex]

  // Animation variants for the bottle — slides from left/right
  const bottleVariants = {
    enter: (dir) => ({
      x: dir > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.7,
      rotateY: dir > 0 ? 25 : -25,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      rotateY: 0,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1],
      }
    },
    exit: (dir) => ({
      x: dir > 0 ? -300 : 300,
      opacity: 0,
      scale: 0.7,
      rotateY: dir > 0 ? -25 : 25,
      transition: {
        duration: 0.5,
        ease: 'easeIn'
      }
    })
  }

  // Background text animation
  const bgTextVariants = {
    enter: (dir) => ({
      x: dir > 0 ? 200 : -200,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }
    },
    exit: (dir) => ({
      x: dir > 0 ? -200 : 200,
      opacity: 0,
      transition: { duration: 0.4 }
    })
  }

  // Info text animation
  const infoVariants = {
    enter: { opacity: 0, y: 30 },
    center: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: { duration: 0.3 }
    }
  }

  return (
    <section className="hero" id="hero">
      {/* Animated Background */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`bg-${currentIndex}`}
          className="hero-bg-gradient"
          style={{ background: current.bgGradient }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
        />
      </AnimatePresence>

      {/* Ambient Glow */}
      <div className="hero-ambient-glow" style={{ background: current.glowColor }} />

      {/* Floating Particles */}
      <div className="hero-particles">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="hero-particle"
            animate={{
              y: [0, -60 - Math.random() * 40, 0],
              x: [0, Math.random() * 40 - 20, 0],
              opacity: [0.1, 0.5, 0.1],
            }}
            transition={{
              duration: 5 + Math.random() * 4,
              repeat: Infinity,
              delay: i * 0.5,
              ease: 'easeInOut'
            }}
            style={{
              left: `${10 + Math.random() * 80}%`,
              top: `${10 + Math.random() * 80}%`,
              width: `${30 + Math.random() * 50}px`,
              height: `${30 + Math.random() * 50}px`,
              background: current.glowColor,
            }}
          />
        ))}
      </div>

      <div className="hero-layout">
        {/* Left Side — Product Info */}
        <div className="hero-info-side">
          <AnimatePresence mode="wait">
            <motion.div
              key={`info-${currentIndex}`}
              className="hero-info-content"
              variants={infoVariants}
              initial="enter"
              animate="center"
              exit="exit"
            >
              <motion.span 
                className="hero-badge"
                style={{ borderColor: current.accentColor, color: current.accentColor }}
              >
                ● Gold Mairani
              </motion.span>

              <h1 className="hero-main-title">
                <span className="hero-title-line1">{current.fullName}</span>
              </h1>

              <p className="hero-tagline" style={{ color: current.accentColor }}>
                {current.tagline}
              </p>

              <p className="hero-desc">{current.description}</p>

              <div className="hero-cta-group">
                <motion.a
                  href="#products"
                  className="btn-gold"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
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

        {/* Center — 3D Bottle with background name */}
        <div className="hero-bottle-stage">
          {/* Background Name Text */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`bgtext-${currentIndex}`}
              className="hero-bg-name"
              custom={direction}
              variants={bgTextVariants}
              initial="enter"
              animate="center"
              exit="exit"
              style={{ color: current.textBgColor }}
            >
              {current.name}
            </motion.div>
          </AnimatePresence>

          {/* 3D Bottle */}
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
                <motion.img
                  src={current.image}
                  alt={current.fullName}
                  className="bottle-hero-image"
                  animate={{
                    y: [0, -12, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                  draggable={false}
                />

                {/* Bottle glow effect */}
                <div
                  className="bottle-glow"
                  style={{
                    background: `radial-gradient(ellipse, ${current.glowColor} 0%, transparent 70%)`
                  }}
                />

                {/* Bottle reflection */}
                <div className="bottle-reflection" />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="hero-controls">
        <motion.button
          className="hero-nav-btn"
          onClick={handlePrev}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label="Previous product"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </motion.button>

        {/* Indicator Dots */}
        <div className="hero-indicators">
          {oilProducts.map((product, i) => (
            <motion.button
              key={i}
              className={`hero-dot ${i === currentIndex ? 'active' : ''}`}
              onClick={() => handleSelect(i)}
              animate={{
                width: i === currentIndex ? 32 : 10,
                background: i === currentIndex
                  ? `linear-gradient(90deg, ${product.accentColor}, ${product.glowColor})`
                  : 'rgba(255,255,255,0.25)'
              }}
              whileHover={{ scale: 1.2 }}
              transition={{ duration: 0.3 }}
              aria-label={`Select ${product.fullName}`}
            />
          ))}
        </div>

        <motion.button
          className="hero-nav-btn"
          onClick={handleNext}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label="Next product"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </motion.button>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="hero-scroll-hint"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
      >
        <span>Scroll Down</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </motion.div>
    </section>
  )
}

export default Hero
