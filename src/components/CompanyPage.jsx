import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { useInView } from 'react-intersection-observer'
import '../styles/CompanyPage.css'

const FadeInSection = ({ children, delay = 0, direction = 'up' }) => {
  const { ref, inView } = useInView({ threshold: 0.15, triggerOnce: true })
  
  const variants = {
    hidden: { 
      opacity: 0, 
      y: direction === 'up' ? 40 : direction === 'down' ? -40 : 0,
      x: direction === 'left' ? 40 : direction === 'right' ? -40 : 0
    },
    visible: { 
      opacity: 1, 
      y: 0, 
      x: 0,
      transition: { duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }
    }
  }

  return (
    <motion.div ref={ref} initial="hidden" animate={inView ? "visible" : "hidden"} variants={variants}>
      {children}
    </motion.div>
  )
}

const CompanyPage = () => {
  const navigate = useNavigate()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="company-page">
      {/* Hero Section */}
      <section className="company-hero">
        <div className="company-hero-bg" style={{ backgroundImage: 'url(./images/KitchenBg.jpeg)' }}>
          <div className="company-hero-overlay"></div>
        </div>
        <div className="company-hero-content">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <span className="company-eyebrow">Corporate Profile</span>
            <h1 className="company-title">
              Mateshwari <span className="gold-text">Industries</span>
            </h1>
            <p className="company-subtitle">
              Pioneering purity in cooking oils. A trusted partner for domestic distribution and global import/export.
            </p>
            <Link to="/" className="back-to-home-btn">
              ← Back to Main Page
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="company-section gallery-section bg-darker">
        <div className="section-container">
          <FadeInSection direction="up">
            <div className="section-header-centered">
              <span className="section-label">Our Legacy</span>
              <h2>A Glimpse of Excellence</h2>
              <p>Explore our state-of-the-art facilities and premium product lineup.</p>
            </div>
          </FadeInSection>

          <div className="gallery-grid">
            {[
              "./images/gallery_1.png",
              "./images/gallery_2.png",
              "./images/gallery_3.png",
              "./images/gallery_4.png"
            ].map((imgSrc, index) => (
              <FadeInSection key={index} delay={index * 0.15} direction="up">
                <div className="gallery-item">
                  <img src={imgSrc} alt={`Gallery ${index + 1}`} className="gallery-img" />
                  <div className="gallery-overlay"></div>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* Partnership & CTA */}
      <section className="company-section partnership-section">
        <div className="section-container">
          <FadeInSection direction="up">
            <div className="partnership-box">
              <div className="partnership-content">
                <h2>Partner With Us</h2>
                <p>
                  Whether you are looking for a reliable OEM manufacturer, bulk raw material supplier, or a robust retail brand to distribute in your region, Mateshwari Industries is your ideal partner.
                </p>
                <div className="contact-details">
                  <div className="contact-item">
                    <strong>Email:</strong> exports@mateshwari.com
                  </div>
                  <div className="contact-item">
                    <strong>Phone:</strong> +91 98765 43210
                  </div>
                  <div className="contact-item">
                    <strong>Headquarters:</strong> Rajasthan, India
                  </div>
                </div>
                <div className="partnership-actions">
                  <a href="mailto:exports@mateshwari.com" className="primary-btn">Contact Export Team</a>
                  <a href="#/" className="secondary-btn" onClick={(e) => {
                    e.preventDefault();
                    localStorage.setItem('scroll_to_section', 'products');
                    navigate('/');
                  }}>Explore Products</a>
                </div>
              </div>
            </div>
          </FadeInSection>
        </div>
      </section>
    </div>
  )
}

export default CompanyPage
