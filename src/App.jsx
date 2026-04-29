import React, { useState, useEffect } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import ProductCarousels from './components/ProductCarousels'
import Features from './components/Features'
import About from './components/About'
import Footer from './components/Footer'
import './App.css'

function App() {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="App">
      <Navbar />
      <Hero scrollY={scrollY} />
      <ProductCarousels />
      <Features />
      <About />
      <Footer />
    </div>
  )
}

export default App
