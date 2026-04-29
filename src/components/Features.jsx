import React from 'react'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import '../styles/Features.css'

const Features = () => {
  const { ref, inView } = useInView({ threshold: 0.15, triggerOnce: true })

  const features = [
    {
      icon: '🌿',
      title: '100% Pure & Natural',
      description: 'No chemicals, no additives. Gold Mairani oils are crafted with traditional methods to deliver pure, unadulterated quality.',
      gradient: 'linear-gradient(135deg, #1B5E20, #4CAF50)',
    },
    {
      icon: '🏭',
      title: 'Modern Processing',
      description: 'State-of-the-art refinery by Mateshwari Industries ensures consistent quality and hygiene in every bottle.',
      gradient: 'linear-gradient(135deg, #E65100, #FF9800)',
    },
    {
      icon: '❤️',
      title: 'Heart-Healthy Oils',
      description: 'Our oils are rich in essential fatty acids and antioxidants, supporting cardiovascular health for your family.',
      gradient: 'linear-gradient(135deg, #D32F2F, #EF5350)',
    },
    {
      icon: '👨‍🍳',
      title: 'Perfect for Every Dish',
      description: 'From crispy frying to aromatic tempering, our range of oils caters to every Indian cooking style.',
      gradient: 'linear-gradient(135deg, #B8860B, #F4D03F)',
    },
    {
      icon: '✅',
      title: 'FSSAI Certified',
      description: 'Every batch is tested and certified, meeting the highest Indian food safety standards.',
      gradient: 'linear-gradient(135deg, #0D3B0F, #1B5E20)',
    },
    {
      icon: '📦',
      title: 'Multiple Pack Sizes',
      description: 'Available in convenient sizes from 500ml to 15L, perfect for households and businesses alike.',
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
                <span className="feature-icon">{feature.icon}</span>
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
