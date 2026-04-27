import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import '../styles/Hero.css'
import '../styles/Bottle3D.css'

// Hero component with animated rotating oil bottle and parallax effect
const Hero = ({ scrollY }) => {
  // Oil types with real bottle images
  const oilTypes = [
    {
      name: 'Refined Soya Oil',
      image: '/images/RefinedSoyaOil.jpeg',
      description: 'Premium refined soya oil',
      bgGradient: 'linear-gradient(135deg, #FFF8DC 0%, #FFE4B5 100%)',
      company: 'Your Company',
      tagline: 'Pure & Trusted Quality'
    },
    {
      name: 'Soya Bean Oil',
      image: '/images/SoyaBeanOil.jpeg',
      description: 'High quality soya bean oil',
      bgGradient: 'linear-gradient(135deg, #F0FFF0 0%, #E8F5E9 100%)',
      company: 'Your Company',
      tagline: 'Natural Goodness'
    },
    {
      name: 'Kitchen Background',
      image: '/images/KitchenBg.jpeg',
      description: 'Perfect for every kitchen',
      bgGradient: 'linear-gradient(135deg, #FFFACD 0%, #FFD700 100%)',
      company: 'Your Company',
      tagline: 'Healthy Cooking Starts Here'
    },
    {
      name: 'Company Slogan',
      image: '/images/Slogan.jpeg',
      description: 'Our promise to you',
      bgGradient: 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)',
      company: 'Your Company',
      tagline: 'Quality & Trust'
    },
    {
      name: 'Company Logo',
      image: '/images/logo.jpeg',
      description: 'Our brand identity',
      bgGradient: 'linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%)',
      company: 'Your Company',
      tagline: 'Excellence in Every Drop'
    }
  ]

  const [currentOilIndex, setCurrentOilIndex] = useState(0)
  const [direction, setDirection] = useState(1)

  // No auto-rotation - only manual control via buttons
  useEffect(() => {
    // Component cleanup
    return () => {}
  }, [])

  // Handle next oil
  const handleNextOil = () => {
    setCurrentOilIndex((prev) => (prev + 1) % oilTypes.length)
    setDirection(1)
  }

  // Handle previous oil
  const handlePrevOil = () => {
    setCurrentOilIndex((prev) => (prev - 1 + oilTypes.length) % oilTypes.length)
    setDirection(-1)
  }

  // Handle direct oil selection via indicator dots
  const handleOilSelect = (index) => {
    setDirection(index > currentOilIndex ? 1 : -1)
    setCurrentOilIndex(index)
  }

  const currentOil = oilTypes[currentOilIndex]

  // Animation variants for the bottle
  const bottleVariants = {
    initial: { 
      y: 0, 
      opacity: 0, 
      scale: 0.8,
      rotateZ: -15
    },
    animate: { 
      y: 0, 
      opacity: 1, 
      scale: 1,
      rotateZ: 0,
      transition: { 
        duration: 1.2, 
        ease: [0.34, 1.56, 0.64, 1],
        delay: 0.2
      }
    }
  }

  // Oil rotation animation - directional slide in/out based on button click
  const oilRotateVariants = {
    enter: (direction) => ({
      opacity: 0,
      scale: 0.8,
      x: direction > 0 ? -200 : 200  // Slide in from opposite direction
    }),
    center: {
      opacity: 1,
      scale: 1,
      x: 0,
      transition: {
        duration: 0.9,
        ease: 'easeOut',
        type: 'spring',
        stiffness: 70,
        damping: 20
      }
    },
    exit: (direction) => ({
      opacity: 0,
      scale: 0.8,
      x: direction > 0 ? 200 : -200,  // Slide out in button direction
      transition: {
        duration: 0.7,
        ease: 'easeIn'
      }
    })
  }

  // Floating animation loop
  const floatingVariants = {
    float: {
      y: [0, -20, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    }
  }

  // Text animation variants
  const textVariants = {
    initial: { opacity: 0, y: 20 },
    animate: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.4 + i * 0.15,
        duration: 0.8
      }
    })
  }

  const buttonVariants = {
    initial: { opacity: 0, scale: 0.9 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: { delay: 0.8, duration: 0.6 }
    },
    hover: { scale: 1.08 }
  }

  // Oil info animation
  const oilInfoVariants = {
    enter: { opacity: 0, y: 20 },
    center: { opacity: 1, y: 0, transition: { duration: 0.6 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
  }

  // Render - no decorative elements needed with real images
  const renderDecorativeElements = () => {
    return null
  }

  return (
    <section className="hero">
      {/* Animated background gradient - changes with oil type */}
      <motion.div 
        className="hero-bg"
        animate={{ 
          background: oilTypes[currentOilIndex].bgGradient
        }}
        transition={{ 
          duration: 0
        }}
        style={{
          background: oilTypes[currentOilIndex].bgGradient
        }}
      />

      {/* Floating Particles Background */}
      <div className="floating-particles">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={`particle-${i}`}
            className="particle"
            animate={{
              y: [0, -50, 0],
              x: [0, Math.random() * 50 - 25, 0],
              opacity: [0.3, 0.8, 0.3]
            }}
            transition={{
              duration: 4 + i,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.3
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${40 + Math.random() * 60}px`,
              height: `${40 + Math.random() * 60}px`,
              background: '#FFD700',
              borderRadius: '50%',
              filter: 'blur(40px)',
              opacity: 0.15
            }}
          />
        ))}
      </div>

      <div className="hero-content">
        {/* Main headline with animated oil product name */}
        <motion.h1 
          key={`title-${currentOilIndex}`}
          className="hero-title"
          variants={textVariants}
          initial="initial"
          animate="animate"
          custom={0}
        >
          {currentOil.name}
        </motion.h1>

        {/* Subheading - Tagline */}
        <motion.p 
          key={`subtitle-${currentOilIndex}`}
          className="hero-subtitle"
          variants={textVariants}
          initial="initial"
          animate="animate"
          custom={1}
        >
          {currentOil.tagline}
        </motion.p>

        {/* Description */}
        <motion.p 
          key={`description-${currentOilIndex}`}
          className="hero-description"
          variants={textVariants}
          initial="initial"
          animate="animate"
          custom={2}
        >
          {currentOil.description} • Natural & Trusted
        </motion.p>

        {/* CTA Button with hover effect */}
        <motion.button 
          className="btn-primary hero-cta"
          variants={buttonVariants}
          initial="initial"
          animate="animate"
          whileHover="hover"
        >
          Buy Now
        </motion.button>
      </div>

      {/* Floating bottle animation with parallax and rotating oil carousel */}
      <motion.div 
        className="hero-bottle-container"
        style={{ 
          y: scrollY * 0.5, // Parallax effect - moves 50% of scroll distance
          zIndex: 10
        }}
      >
        <motion.div
          className="bottle-wrapper"
          variants={bottleVariants}
          initial="initial"
          animate="animate"
          whileHover="animate"
        >
          <motion.div
            animate="float"
            variants={floatingVariants}
          >
            {/* Rotating Oil Bottle with AnimatePresence */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentOilIndex}
                custom={direction}
                variants={oilRotateVariants}
                initial="enter"
                animate="center"
                exit="exit"
                style={{ perspective: 1200 }}
              >
                {/* Real Bottle Image */}
                <div className="bottle-3d-scene">
                  <img 
                    src={currentOil.image} 
                    alt={currentOil.name}
                    className="bottle-image"
                    style={{
                      maxWidth: '100%',
                      height: 'auto',
                      filter: 'drop-shadow(0 30px 60px rgba(0, 0, 0, 0.2))'
                    }}
                  />
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Large Decorative Elements - 45% bottle size */}
            <AnimatePresence mode="wait">
              {renderDecorativeElements()}
            </AnimatePresence>
          </motion.div>

          {/* Oil Type Information */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`info-${currentOilIndex}`}
              className="oil-info"
              variants={oilInfoVariants}
              initial="enter"
              animate="center"
              exit="exit"
            >
              <h3 className="oil-name">{currentOil.name}</h3>
              <p className="oil-description">{currentOil.description}</p>
              <div className="oil-indicator">
                {oilTypes.map((_, index) => (
                  <motion.button
                    key={index}
                    className={`indicator-dot ${index === currentOilIndex ? 'active' : ''}`}
                    onClick={() => handleOilSelect(index)}
                    animate={{ 
                      scale: index === currentOilIndex ? 1 : 0.6,
                      opacity: index === currentOilIndex ? 1 : 0.4
                    }}
                    whileHover={{ scale: index === currentOilIndex ? 1.2 : 0.8 }}
                    whileTap={{ scale: 0.9 }}
                    aria-label={`Select ${oilTypes[index].name}`}
                    type="button"
                  />
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </motion.div>

      {/* Navigation Arrows */}
      <div className="oil-navigation">
        <motion.button
          className="nav-arrow nav-arrow-left"
          onClick={handlePrevOil}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Previous oil"
        >
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="17 6 7 16 17 26"></polyline>
          </svg>
        </motion.button>

        <motion.button
          className="nav-arrow nav-arrow-right"
          onClick={handleNextOil}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Next oil"
        >
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="11 6 21 16 11 26"></polyline>
          </svg>
        </motion.button>
      </div>

      {/* Scroll indicator animation */}
      <motion.div 
        className="scroll-indicator"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </motion.div>
    </section>
  )
}

export default Hero
