import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import '../styles/Navbar.css'

const Navbar = ({ onRewardsClick }) => {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const isHome = location.pathname === '/'

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { label: 'Home', href: isHome ? '#hero' : '/#hero' },
    { 
      label: 'Products', 
      href: isHome ? '#products' : '/#products',
      dropdown: [
        { label: 'All Products', href: isHome ? '#products' : '/#products' },
        { label: 'Mustard Oil', href: '/product/mustard', isRoute: true },
        { label: 'Soyabean Oil', href: '/product/soyabean', isRoute: true },
        { label: 'Cottonseed Oil', href: '/product/cottonseed', isRoute: true }
      ]
    },
    { label: 'Health', href: isHome ? '#nutrition' : '/#nutrition' },
    { label: 'Why Us', href: isHome ? '#features' : '/#features' },
    { label: 'About', href: isHome ? '#about' : '/#about' }
  ]

  return (
    <motion.nav
      className={`navbar ${scrolled ? 'navbar-scrolled' : ''} ${!isHome && !scrolled ? 'navbar-light-bg' : ''}`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="navbar-inner">
        {/* Logo */}
        <a 
          href={isHome ? '#hero' : '#/'} 
          className="navbar-logo"
          onClick={(e) => {
            if (isHome) {
              e.preventDefault();
              const el = document.getElementById('hero');
              if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }
          }}
        >
          <img src="./images/logo.jpeg" alt="Mateshwari Industries" className="logo-img" />
          <div className="logo-text">
            <span className="logo-brand">Gold Mairani</span>
            <span className="logo-sub">Mateshwari Industries</span>
          </div>
        </a>

        {/* Desktop Nav Links */}
        <ul className="navbar-links">
          {navLinks.map((link, i) => (
            <li key={i} className={link.dropdown ? 'nav-item-has-dropdown' : ''}>
              <motion.a
                href={link.href}
                onClick={(e) => {
                  if (link.dropdown) return; // Hover handles dropdown, clicking it scrolls to #products if we want
                  e.preventDefault();
                  const targetId = link.href.split('#').pop();
                  if (isHome) {
                    const el = document.getElementById(targetId);
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  } else {
                    localStorage.setItem('scroll_to_section', targetId);
                    navigate('/');
                  }
                }}
                className="nav-link"
                whileHover={{ y: -2 }}
                transition={{ duration: 0.2 }}
              >
                {link.label}
                {link.dropdown && (
                  <svg className="dropdown-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginLeft: '4px', verticalAlign: 'middle' }}><path d="M6 9l6 6 6-6"/></svg>
                )}
                <span className="nav-link-underline" />
              </motion.a>
              
              {link.dropdown && (
                <div className="nav-dropdown">
                  {link.dropdown.map((dropItem, j) => (
                    <a
                      key={j}
                      href={dropItem.href}
                      className="nav-dropdown-link"
                      onClick={(e) => {
                        e.preventDefault();
                        if (dropItem.isRoute) {
                          navigate(dropItem.href);
                          window.scrollTo(0, 0);
                        } else {
                          const targetId = dropItem.href.split('#').pop();
                          if (isHome) {
                            const el = document.getElementById(targetId);
                            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          } else {
                            localStorage.setItem('scroll_to_section', targetId);
                            navigate('/');
                          }
                        }
                      }}
                    >
                      {dropItem.label}
                    </a>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>

        {/* CTA */}
        <div className="navbar-actions">
          <motion.button
            className="navbar-scan-btn"
            onClick={onRewardsClick}
            whileHover={{ scale: 1.05, boxShadow: '0 8px 25px rgba(212, 175, 55, 0.5)' }}
            whileTap={{ scale: 0.95 }}
            aria-label="Scan QR Code"
            style={{
              background: 'linear-gradient(135deg, #D4AF37 0%, #F5D061 50%, #B8860B 100%)',
              border: 'none',
              padding: '10px 24px',
              borderRadius: '50px',
              color: '#2C2212',
              fontWeight: '800',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(212, 175, 55, 0.35)',
              textShadow: '0 1px 0 rgba(255,255,255,0.3)'
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '18px', height: '18px' }}>
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
            <span className="navbar-scan-text">Scan QR & Win!</span>
          </motion.button>

          <motion.a
            href={isHome ? '#products' : '#/'}
            onClick={(e) => {
              e.preventDefault();
              if (isHome) {
                const el = document.getElementById('products');
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              } else {
                localStorage.setItem('scroll_to_section', 'products');
                window.location.href = '#/';
              }
            }}
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
              <React.Fragment key={i}>
                <motion.a
                  href={link.href}
                  className="mobile-link"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={(e) => {
                    e.preventDefault();
                    if (!link.dropdown) {
                      setMobileOpen(false);
                      const targetId = link.href.split('#').pop();
                      if (isHome) {
                        const el = document.getElementById(targetId);
                        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      } else {
                        localStorage.setItem('scroll_to_section', targetId);
                        navigate('/');
                      }
                    }
                  }}
                >
                  {link.label}
                </motion.a>
                {link.dropdown && link.dropdown.map((dropItem, j) => (
                  <motion.a
                    key={`drop-${j}`}
                    href={dropItem.href}
                    className="mobile-link mobile-dropdown-link"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 + 0.05 }}
                    style={{ paddingLeft: '2rem', fontSize: '1.2rem', color: '#ccc' }}
                    onClick={(e) => {
                      e.preventDefault();
                      setMobileOpen(false);
                      if (dropItem.isRoute) {
                        navigate(dropItem.href);
                        window.scrollTo(0, 0);
                      } else {
                        const targetId = dropItem.href.split('#').pop();
                        if (isHome) {
                          const el = document.getElementById(targetId);
                          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        } else {
                          localStorage.setItem('scroll_to_section', targetId);
                          navigate('/');
                        }
                      }
                    }}
                  >
                    - {dropItem.label}
                  </motion.a>
                ))}
              </React.Fragment>
            ))}
            {/* View Rewards in mobile menu */}
            <motion.button
              className="mobile-scan-btn"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: navLinks.length * 0.05 }}
              onClick={() => { setMobileOpen(false); onRewardsClick && onRewardsClick() }}
            >
              Scan QR & Win Reward!
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}

export default Navbar
