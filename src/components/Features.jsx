import React from 'react'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import '../styles/Features.css'

const Features = () => {
  const { ref, inView } = useInView({ threshold: 0.15, triggerOnce: true })

  const FeatureIcon = ({ type }) => {
    const icons = {
      natural: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2L6 6v12c0 3.3 2.7 6 6 6s6-2.7 6-6V6l-6-4z" />
          <path d="M12 8v8M9 11h6" />
        </svg>
      ),
      processing: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 9l2-4h14l2 4M5 9v10c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V9" />
          <line x1="9" y1="13" x2="9" y2="17" />
          <line x1="15" y1="13" x2="15" y2="17" />
          <line x1="12" y1="5" x2="12" y2="2" />
        </svg>
      ),
      healthy: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      ),
      cooking: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 9l1.5-2h15l1.5 2M4 9v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V9" />
          <circle cx="9" cy="14" r="1.5" />
          <circle cx="15" cy="14" r="1.5" />
          <path d="M12 3v4" />
        </svg>
      ),
      certified: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2L2 7v7c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
          <path d="M10 14l2 2 4-4" />
        </svg>
      ),
      packing: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 9l6-6 6 6M3 9h18v12c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2V9z" />
          <line x1="9" y1="13" x2="9" y2="17" />
          <line x1="15" y1="13" x2="15" y2="17" />
        </svg>
      )
    }
    return <div className="feature-icon-svg">{icons[type]}</div>
  }

  const features = [
    {
      iconType: 'natural',
      title: '100% Pure & Natural',
      description: 'Made from carefully selected mustard seeds to ensure authentic quality and purity.',
      gradient: 'linear-gradient(135deg, #1B5E20, #4CAF50)',
    },
    {
      iconType: 'cooking',
      title: 'Rich Aroma & Authentic Taste',
      description: 'Enhances the flavor of traditional and everyday cooking.',
      gradient: 'linear-gradient(135deg, #B8860B, #F4D03F)',
    },
    {
      iconType: 'healthy',
      title: 'Health-Focused Quality',
      description: 'Retains the natural goodness and nutritional benefits of mustard oil.',
      gradient: 'linear-gradient(135deg, #D32F2F, #EF5350)',
    },
    {
      iconType: 'certified',
      title: 'Strict Quality Control',
      description: 'Produced under high manufacturing standards to deliver consistent quality in every bottle.',
      gradient: 'linear-gradient(135deg, #0D3B0F, #1B5E20)',
    },
    {
      iconType: 'certified',
      title: 'Trusted Brand',
      description: 'Customers rely on Mateshwari Industries for purity, freshness, and reliability.',
      gradient: 'linear-gradient(135deg, #4A148C, #7C4DFF)',
    },
    {
      iconType: 'packing',
      title: 'Value for Money',
      description: 'Premium quality mustard oil at a competitive price.',
      gradient: 'linear-gradient(135deg, #1B5E20, #4CAF50)',
    },
    {
      iconType: 'processing',
      title: 'Hygienic Processing & Packaging',
      description: 'Ensures safety, freshness, and longer shelf life.',
      gradient: 'linear-gradient(135deg, #E65100, #FF9800)',
    },
    {
      iconType: 'healthy',
      title: 'Customer Satisfaction',
      description: 'Dedicated to providing products that meet the needs and expectations of families and businesses alike.',
      gradient: 'linear-gradient(135deg, #D32F2F, #EF5350)',
    }
  ]

  return (
    <section className="features-section" id="features" ref={ref}>
      <motion.div
        className="section-container"
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.6 }}
      >
        <h2 className="section-title">
          Why Choose <span className="gold-text">Gold Mairani?</span>
        </h2>
        <p className="section-subtitle">
          Trusted by thousands of families across India
        </p>

        <div className="features-grid">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              className="feature-card"
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.15 + i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{
                y: -8,
                transition: { duration: 0.3 }
              }}
            >
              <div className="feature-icon-wrapper">
                <div className="feature-icon-bg" style={{ background: feature.gradient }} />
                <FeatureIcon type={feature.iconType} />
              </div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-desc">{feature.description}</p>
              <div className="feature-shine" />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  )
}

export default Features
