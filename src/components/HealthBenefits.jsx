import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import '../styles/HealthBenefits.css'

const HealthBenefits = () => {
  const { ref, inView } = useInView({ threshold: 0.2, triggerOnce: true })

  const benefits = [
    {
      title: "Fortified with Vitamins",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: '32px', height: '32px' }}>
          <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" strokeDasharray="3 3"/>
          <circle cx="12" cy="12" r="5" />
          <circle cx="6" cy="7" r="2.5" />
          <circle cx="18" cy="17" r="2.5" />
          <line x1="8.5" y1="8.5" x2="10" y2="10" />
          <line x1="14" y1="14" x2="15.5" y2="15.5" />
        </svg>
      ),
      desc: "Enriched with Vitamin A and D to support your immunity, vision, and bone health every single day."
    },
    {
      title: "Heart-Healthy Omega 3 & 6",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: '32px', height: '32px' }}>
          <path d="M12 2C12 2 3 9 3 14a9 9 0 0 0 18 0c0-5-9-12-9-12z" />
          <path d="M12 8.5c-1.2-1.2-3 0-3 1.5 0 2 3 3.5 3 3.5s3-1.5 3-3.5c0-1.5-1.8-2.7-3-1.5z" fill="currentColor" />
        </svg>
      ),
      desc: "Our oils maintain the perfect balance of MUFA and PUFA, helping maintain healthy cholesterol levels."
    },
    {
      title: "Zero Trans-Fat",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: '32px', height: '32px' }}>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <circle cx="12" cy="11" r="3.5" />
          <line x1="9.5" y1="13.5" x2="14.5" y2="8.5" />
        </svg>
      ),
      desc: "Processed with state-of-the-art European technology to ensure 100% trans-fat-free purity."
    },
    {
      title: "Antioxidant Rich",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: '32px', height: '32px' }}>
          <path d="M2 22c0-5.5 4.5-10 10-10s10 4.5 10 10" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10H8a15.3 15.3 0 0 1 4-10z" fill="rgba(46, 111, 64, 0.15)"/>
          <path d="M12 2v20" />
        </svg>
      ),
      desc: "Retains natural tocopherols (Vitamin E) which act as powerful antioxidants for healthy skin."
    }
  ]

  const productImages = [
    "./images/bottle-models/Mustard Tin.png",
    "./images/bottle-models/Soyabean Tin.png",
    "./images/bottle-models/Cottonseed Tin.png"
  ];

  const outerImages = [
    "./images/bottle-models/Mustard Can.png",
    "./images/bottle-models/Soyabean Can.png",
    "./images/bottle-models/Mustard Tin.png",
    "./images/bottle-models/Soyabean Tin.png",
    "./images/bottle-models/Cottonseed Tin.png"
  ];
  
  const [activeIndex, setActiveIndex] = useState(0);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex(current => (current + 1) % productImages.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const isMobile = windowWidth <= 768;
  const isSmallMobile = windowWidth <= 480;

  const getRadius = () => {
    if (isSmallMobile) return 140;
    if (isMobile) return 180;
    return 260;
  };

  const getCenterScale = () => {
    if (isSmallMobile) return 0.8;
    if (isMobile) return 1.0;
    return 1.4;
  };

  const getOuterScale = () => {
    if (isSmallMobile) return 0.35;
    if (isMobile) return 0.45;
    return 0.65;
  };

  return (
    <section className="health-section" id="nutrition" ref={ref}>
      <div className="section-container">
        <div className="health-layout">
          <motion.div 
            className="health-content"
            initial={{ opacity: 0, x: -40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <h2 className="section-title" style={{ textAlign: 'left' }}>
              Nutrition <span className="gold-text">& Health</span>
            </h2>
            <p className="health-subtitle">
              At Gold Mairani, we believe that food should not only taste great but also nourish your body. Our oils are meticulously processed to retain essential nutrients, making every meal a step toward a healthier lifestyle.
            </p>
            
            <div className="health-grid">
              {benefits.map((benefit, i) => (
                <motion.div 
                  key={i} 
                  className="health-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
                >
                  <div className="health-icon">{benefit.icon}</div>
                  <div className="health-text">
                    <h4>{benefit.title}</h4>
                    <p>{benefit.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div 
            className="health-visual"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="health-circle">
              <AnimatePresence mode="wait">
                <motion.img
                  key={`center-${activeIndex}`}
                  src={productImages[activeIndex]}
                  alt="Center Product"
                  className="health-product-img center"
                  initial={{ opacity: 0, scale: getCenterScale() * 0.7 }}
                  animate={{ opacity: 1, scale: getCenterScale(), x: 0, y: 0 }}
                  exit={{ opacity: 0, scale: getCenterScale() * 0.7 }}
                  transition={{ duration: 0.6 }}
                  style={{ zIndex: 10 }}
                />
              </AnimatePresence>

              {outerImages.map((src, i) => {
                const slotsCount = outerImages.length;
                const angleDeg = slotsCount > 1 ? 180 - (180 / (slotsCount - 1)) * i : 90;
                const radius = getRadius();
                const angleRad = angleDeg * (Math.PI / 180);
                const x = Math.cos(angleRad) * radius;
                
                // Adjust y-offset dynamically too, keeping the arch looking good
                const yOffset = isSmallMobile ? 30 : (isMobile ? 40 : 60);
                const y = -Math.sin(angleRad) * radius + yOffset;
                
                const outerScale = getOuterScale();
                
                // Tilt outwards like rising sun rays
                const rotate = 90 - angleDeg;

                return (
                  <motion.img 
                    key={`static-surrounding-${i}`}
                    src={src}
                    alt="Product"
                    className="health-product-img surrounding"
                    initial={{ opacity: 0, x, y, scale: outerScale, rotate }}
                    animate={{ opacity: 0.85, x, y, scale: outerScale, rotate, zIndex: 1 }}
                    transition={{ duration: 1.2 }}
                  />
                );
              })}

              <div className="health-badge badge-1">100% Pure</div>
              <div className="health-badge badge-2">Heart Friendly</div>
              <div className="health-badge badge-3">Vitamin A&D</div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default HealthBenefits
