import React from 'react'
import { motion } from 'framer-motion'
import { useLocation, Link } from 'react-router-dom'
import '../styles/Footer.css'

const Footer = () => {
  const year = new Date().getFullYear()
  const location = useLocation()
  const isHome = location.pathname === '/'

  const handleScrollTo = (e, sectionId) => {
    e.preventDefault()
    if (isHome) {
      const el = document.getElementById(sectionId)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    } else {
      localStorage.setItem('scroll_to_section', sectionId)
      window.location.href = '#/'
    }
  }

  return (
    <footer className="footer" id="footer">
      <div className="footer-inner">
        {/* Top Row */}
        <div className="footer-top">
          {/* Brand */}
          <div className="footer-brand-col">
            <div className="footer-logo-row">
              <img src="./images/logo.jpeg" alt="Mateshwari Industries" className="footer-logo" />
              <div>
                <h3 className="footer-brand-name">Gold Mairani</h3>
                <p className="footer-brand-sub">By Mateshwari Industries</p>
              </div>
            </div>
            <p className="footer-brand-desc">
              Premium cooking oils trusted by families across India. 
              Pure quality in every drop.
            </p>
          </div>

          {/* Products */}
          <div className="footer-col">
            <h4 className="footer-col-title">Products</h4>
            <ul className="footer-links">
              <li><Link to="/product/mustard">Pure Mustard Oil</Link></li>
              <li><Link to="/product/soyabean">Refined Soya Oil</Link></li>
              <li><Link to="/product/cottonseed">Refined Cottonseed Oil</Link></li>
              <li><a href="#/" onClick={(e) => handleScrollTo(e, 'products')}>All Products</a></li>
            </ul>
          </div>

          {/* Company */}
          <div className="footer-col">
            <h4 className="footer-col-title">Company</h4>
            <ul className="footer-links">
              <li><Link to="/company">Company Profile</Link></li>
              <li><a href="#/" onClick={(e) => handleScrollTo(e, 'about')}>About Us</a></li>
              <li><a href="#/" onClick={(e) => handleScrollTo(e, 'features')}>Quality Standards</a></li>
              <li><span style={{ color: 'var(--text-light)', cursor: 'default' }}>FSSAI Certified</span></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>

          {/* Contact & Map */}
          <div className="footer-col" style={{ flex: '1.5' }}>
            <h4 className="footer-col-title">Get in Touch</h4>
            <div className="footer-contact-info">
              <p><a href="mailto:mateshwariindustries5758@gmail.com" style={{color: 'inherit', textDecoration: 'none', transition: 'color 0.2s'}} onMouseOver={(e)=>e.target.style.color='var(--gold-primary)'} onMouseOut={(e)=>e.target.style.color='inherit'}>mateshwariindustries5758@gmail.com</a></p>
              <p><a href="tel:+919001909266" style={{color: 'inherit', textDecoration: 'none', transition: 'color 0.2s'}} onMouseOver={(e)=>e.target.style.color='var(--gold-primary)'} onMouseOut={(e)=>e.target.style.color='inherit'}>+91 90019 09266</a></p>
              <p>Sheoganj, Rajasthan 307027</p>
              <p style={{marginTop: '10px'}}><a href="https://www.instagram.com/gold_mairani" target="_blank" rel="noreferrer" style={{color: 'var(--gold-primary)', textDecoration: 'none'}}>Follow us on Instagram</a></p>
              {/* Map removed per user request */}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="footer-divider" />

        {/* Bottom */}
        <div className="footer-bottom">
          <p className="footer-copyright">
            © {year} Mateshwari Industries. All rights reserved.
          </p>
          <p className="footer-tagline">
            Mateshwari Mustard Oil – Har Boond Mein Bharosa.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
