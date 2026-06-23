import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
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

      {/* Global Trade & Export Section */}
      <section className="company-section export-section">
        <div className="section-container">
          <div className="company-split-layout">
            <FadeInSection direction="right">
              <div className="company-text-content">
                <span className="section-label">Global Trade</span>
                <h2>Export & Import Excellence</h2>
                <p>
                  Mateshwari Industries has established a robust supply chain network designed to cater to both national and international markets. Our specialized export division ensures that the authentic taste and nutritional value of Indian cooking oils reach global kitchens seamlessly.
                </p>
                <ul className="company-features-list">
                  <li>
                    <span className="list-icon">🌍</span>
                    <div>
                      <strong>Global Footprint</strong>
                      <p>Strategic export partnerships across the Middle East, Southeast Asia, and Europe.</p>
                    </div>
                  </li>
                  <li>
                    <span className="list-icon">📦</span>
                    <div>
                      <strong>Bulk & Retail Packaging</strong>
                      <p>Flexible packaging solutions tailored for large-scale importers and wholesale distributors.</p>
                    </div>
                  </li>
                  <li>
                    <span className="list-icon">⚖️</span>
                    <div>
                      <strong>International Compliance</strong>
                      <p>Strict adherence to global food safety standards and custom regulatory requirements.</p>
                    </div>
                  </li>
                </ul>
              </div>
            </FadeInSection>
            
            <FadeInSection direction="left" delay={0.2}>
              <div className="company-image-card">
                <img src="./images/Slogan.jpeg" alt="Global Trade Excellence" className="company-img" />
                <div className="image-card-accent"></div>
              </div>
            </FadeInSection>
          </div>
        </div>
      </section>

      {/* Infrastructure Section */}
      <section className="company-section infra-section bg-darker">
        <div className="section-container">
          <FadeInSection direction="up">
            <div className="section-header-centered">
              <span className="section-label">Our Infrastructure</span>
              <h2>State-of-the-Art Manufacturing</h2>
              <p>Combining traditional expeller techniques with modern, automated European hygienic lines.</p>
            </div>
          </FadeInSection>

          <div className="infra-grid">
            {[
              {
                title: "Advanced Refinery",
                desc: "High-capacity multi-oil refining units ensuring 100% purity without compromising natural nutrients.",
                img: "./images/SoyaBeanOil.jpeg"
              },
              {
                title: "Automated Packaging",
                desc: "Zero-touch, hygienic bottling and tin sealing lines to guarantee extended shelf life.",
                img: "./images/RefinedSoyaOil.jpeg"
              },
              {
                title: "Quality Control Lab",
                desc: "In-house testing laboratories running rigorous checks on every batch before dispatch.",
                img: "./images/MustardOilCan.png"
              }
            ].map((item, index) => (
              <FadeInSection key={index} delay={index * 0.2} direction="up">
                <div className="infra-card">
                  <div className="infra-img-wrapper">
                    <img src={item.img} alt={item.title} />
                  </div>
                  <div className="infra-card-body">
                    <h3>{item.title}</h3>
                    <p>{item.desc}</p>
                  </div>
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
                  <Link to="/" className="secondary-btn">Explore Products</Link>
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
