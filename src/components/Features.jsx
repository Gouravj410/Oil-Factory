import React from 'react'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import '../styles/Features.css'

import { Leaf, ChefHat, HeartPulse, ShieldCheck, Award, Factory } from 'lucide-react'

const Features = () => {
  const { ref, inView } = useInView({ threshold: 0.15, triggerOnce: true })

  const features = [
    {
      icon: <Leaf size={28} strokeWidth={2} color="#fff" />,
      title: '100% Pure & Natural',
      description: 'Made from carefully selected mustard seeds to ensure authentic quality and purity.',
      gradient: 'linear-gradient(135deg, #1B5E20, #4CAF50)',
    },
    {
      icon: <ChefHat size={28} strokeWidth={2} color="#fff" />,
      title: 'Rich Aroma & Authentic Taste',
      description: 'Enhances the flavor of traditional and everyday cooking.',
      gradient: 'linear-gradient(135deg, #B8860B, #F4D03F)',
    },
    {
      icon: <HeartPulse size={28} strokeWidth={2} color="#fff" />,
      title: 'Health-Focused Quality',
      description: 'Retains the natural goodness and nutritional benefits of mustard oil.',
      gradient: 'linear-gradient(135deg, #D32F2F, #EF5350)',
    },
    {
      icon: <ShieldCheck size={28} strokeWidth={2} color="#fff" />,
      title: 'Strict Quality Control',
      description: 'Produced under high manufacturing standards to deliver consistent quality in every bottle.',
      gradient: 'linear-gradient(135deg, #0D3B0F, #1B5E20)',
    },
    {
      icon: <Factory size={28} strokeWidth={2} color="#fff" />,
      title: 'Hygienic Processing',
      description: 'Ensures safety, freshness, and longer shelf life.',
      gradient: 'linear-gradient(135deg, #E65100, #FF9800)',
    },
    {
      icon: <Award size={28} strokeWidth={2} color="#fff" />,
      title: 'Trusted Heritage',
      description: 'Customers rely on Mateshwari Industries for purity, freshness, and absolute reliability.',
      gradient: 'linear-gradient(135deg, #4A148C, #7C4DFF)',
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
                <div className="feature-icon-svg">{feature.icon}</div>
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
