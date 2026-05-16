import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import '../styles/Navbar.css'

const Navbar = ({ onRewardsClick }) => {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { label: 'Home', href: '#products' },
    { label: 'Health', href: '#nutrition' },
    { label: 'Recipes', href: '#recipes' },
    { label: 'Why Us', href: '#features' },
    { label: 'About', href: '#about' }
  ]

  return (
    <motion.nav
      className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="navbar-inner">
        {/* Logo */}
        <a href="#products" className="navbar-logo">
          <img src="./images/logo.jpeg" alt="Mateshwari Industries" className="logo-img" />
          <div className="logo-text">
            <span className="logo-brand">Gold Mairani</span>
            <span className="logo-sub">Mateshwari Industries</span>
          </div>
        </a>

        {/* Desktop Nav Links */}
        <ul className="navbar-links">
          {navLinks.map((link, i) => (
            <li key={i}>
              <motion.a
                href={link.href}
                className="nav-link"
                whileHover={{ y: -2 }}
                transition={{ duration: 0.2 }}
              >
                {link.label}
                <span className="nav-link-underline" />
              </motion.a>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <div className="navbar-actions">
          <motion.button
            className="navbar-scan-btn"
            onClick={onRewardsClick}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="View Rewards"
            style={{
              background: 'linear-gradient(135deg, #f5576c, #f093fb)',
              border: 'none',
              padding: '10px 24px',
              borderRadius: '50px',
              color: '#fff',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer'
            }}
          >
            <span className="navbar-scan-icon" style={{ fontSize: '1.2rem' }}></span>
            <span className="navbar-scan-text">View Rewards</span>
          </motion.button>

          <motion.a
            href="#products"
            className="navbar-cta"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Our Products
          </motion.a>
        </div>

        {/* Mobile Hamburger */}
        <button
          className={`hamburger ${mobileOpen ? 'open' : ''}`}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <span /><span /><span />
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            {navLinks.map((link, i) => (
              <motion.a
                key={i}
                href={link.href}
                className="mobile-link"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </motion.a>
            ))}
            {/* View Rewards in mobile menu */}
            <motion.button
              className="mobile-scan-btn"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: navLinks.length * 0.05 }}
              onClick={() => { setMobileOpen(false); onRewardsClick && onRewardsClick() }}
            >
              View Rewards & Offers
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}

export default Navbar
