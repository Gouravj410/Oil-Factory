import React, { useState } from 'react'
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import InteractiveShowcase from './components/InteractiveShowcase'
import HealthBenefits from './components/HealthBenefits'
import Features from './components/Features'
import About from './components/About'
import Footer from './components/Footer'
import ProductDetail from './components/ProductDetail'
import ClaimPage from './components/ClaimPage'
import ScannerPage from './components/ScannerPage'
import './App.css'

function AppInner() {
  const location = useLocation()
  const isClaim = location.pathname.startsWith('/r/')
  const [rewardsOpen, setRewardsOpen] = useState(false)
  const hideChrome = isClaim

  React.useEffect(() => {
    if (location.pathname === '/') {
      const targetId = localStorage.getItem('scroll_to_section')
      if (targetId) {
        localStorage.removeItem('scroll_to_section')
        // Wait a brief moment for DOM to load/render
        setTimeout(() => {
          const el = document.getElementById(targetId)
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }
        }, 150)
      }
    } else {
      // If we navigate to a details page, scroll to top automatically
      window.scrollTo(0, 0)
    }
  }, [location])

  return (
    <>
      {!hideChrome && <Navbar onRewardsClick={() => setRewardsOpen(true)} />}

      <Routes>
        <Route path="/" element={
          <>
            <Hero onRewardsClick={() => setRewardsOpen(true)} />
            <InteractiveShowcase />
            <HealthBenefits />
            <Features />
            <About />
          </>
        } />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/r/:code" element={<ClaimPage />} />
      </Routes>

      {!hideChrome && <Footer />}

      {/* Rewards Modal Overlay */}
      <AnimatePresence>
        {rewardsOpen && (
          <div className="scanner-modal-backdrop" onClick={(e) => {
            if (e.target === e.currentTarget) setRewardsOpen(false)
          }}>
            <motion.div 
               className="scanner-modal-inner"
               initial={{ opacity: 0, y: 50, scale: 0.95 }}
               animate={{ opacity: 1, y: 0, scale: 1 }}
               exit={{ opacity: 0, y: 20, scale: 0.95 }}
               transition={{ duration: 0.3 }}
            >
              <ScannerPage onClose={() => setRewardsOpen(false)} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}

function App() {
  return (
    <Router>
      <AppInner />
    </Router>
  )
}

export default App
