import React from 'react'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import '../styles/AvailableOn.css'

const AvailableOn = () => {
  const { ref, inView } = useInView({ threshold: 0.2, triggerOnce: true })

  const partners = [
    {
      name: 'Blinkit',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Blinkit-yellow-app-icon.svg',
      height: '45px'
    },
    {
      name: 'IndiaMART',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/1/18/IndiaMART_Logo.png',
      height: '40px'
    },
    {
      name: 'Amazon',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg',
      height: '40px'
    }
  ]

  return (
    <section className="available-on-section" ref={ref}>
      <div className="available-on-container">
        <motion.div 
          className="available-on-content"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="available-text-container">
            <span className="available-badge">Everywhere you need us</span>
            <h3 className="available-title">Find Gold Mairani Products Online</h3>
            <p className="available-subtitle">Now delivering purity straight to your doorstep through our trusted partners.</p>
          </div>
          
          <div className="available-logos">
            {partners.map((partner, index) => (
              <motion.div 
                key={partner.name}
                className="partner-card"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={inView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.5, delay: 0.2 + (index * 0.1) }}
                whileHover={{ y: -5, boxShadow: '0 10px 25px rgba(212, 175, 55, 0.15)' }}
              >
                <img 
                  src={partner.logo} 
                  alt={partner.name} 
                  style={{ height: partner.height, objectFit: 'contain' }} 
                />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default AvailableOn
