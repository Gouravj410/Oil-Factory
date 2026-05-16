import React from 'react'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import '../styles/About.css'

const About = () => {
  const { ref, inView } = useInView({ threshold: 0.15, triggerOnce: true })

  return (
    <section className="about-section" id="about" ref={ref}>
      <div className="section-container">
        <div className="about-layout">
          {/* Left — Logo & Branding */}
          <motion.div
            className="about-visual"
            initial={{ opacity: 0, x: -40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="about-logo-frame">
              <img src="./images/logo.jpeg" alt="Mateshwari Industries Logo" className="about-logo" />
              <div className="about-logo-glow" />
            </div>

            {/* Stats */}
            <div className="about-stats">
              {[
                { number: '3+', label: 'Product Range' },
                { number: '1000+', label: 'Happy Families' },
                { number: '100%', label: 'Pure Quality' },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  className="about-stat"
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.4 + i * 0.1, duration: 0.5 }}
                >
                  <span className="stat-number">{stat.number}</span>
                  <span className="stat-label">{stat.label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right — Content */}
          <motion.div
            className="about-content"
            initial={{ opacity: 0, x: 40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="about-eyebrow">About Us</span>
            <h2 className="about-title">
              <span className="gold-text">Mateshwari Industries</span>
              <br />
              <span className="about-title-sub">A Legacy of Pure Cooking Oils</span>
            </h2>

            <p className="about-text">
              At <strong>Mateshwari Industries</strong>, we take pride in delivering premium cooking oils 
              under our trusted brand — <strong>Gold Mairani</strong>. Our commitment to purity, quality, 
              and tradition drives every bottle we produce.
            </p>

            <p className="about-text">
              From the bold flavour of <strong>Kachi Ghani Mustard Oil</strong> to the light refinement 
              of <strong>Soya Bean Oil</strong> and the versatile <strong>Cottonseed Oil</strong>, 
              our range is crafted to meet the diverse needs of Indian kitchens.
            </p>

            <div className="about-highlights">
              {[
                'FSSAI Certified & Quality Tested',
                'Traditional Kachi Ghani Process',
                'Available in Multiple Pack Sizes',
                'Trusted by Families Across India',
              ].map((item, i) => (
                <motion.div
                  key={i}
                  className="about-highlight"
                  initial={{ opacity: 0, x: 20 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.5 + i * 0.1 }}
                >
                  <span className="highlight-check">✓</span>
                  <span>{item}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default About
