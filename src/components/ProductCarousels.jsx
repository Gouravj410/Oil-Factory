import React, { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, FreeMode } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import '../styles/ProductCarousels.css'

const ProductCarousels = () => {
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true })
  const swiperRef = useRef(null)

  useEffect(() => {
    if (swiperRef.current && swiperRef.current.swiper) {
      const swiper = swiperRef.current.swiper
      let timeoutId = null
      let isPaused = false
      
      const autoSlide = () => {
        if (swiper && !swiper.destroyed && !isPaused) {
          swiper.slideNext()
          // Random delay between 3-4 seconds (3000-4000ms)
          const delay = Math.random() * 1000 + 3000
          timeoutId = setTimeout(autoSlide, delay)
        }
      }
      
      const startAutoSlide = () => {
        if (!isPaused) {
          const delay = Math.random() * 1000 + 3000
          timeoutId = setTimeout(autoSlide, delay)
        }
      }
      
      const pauseAutoSlide = () => {
        isPaused = true
        if (timeoutId) {
          clearTimeout(timeoutId)
          timeoutId = null
        }
      }
      
      const resumeAutoSlide = () => {
        isPaused = false
        startAutoSlide()
      }
      
      // Add mouse event listeners to the swiper container
      const swiperEl = swiperRef.current.el
      if (swiperEl) {
        swiperEl.addEventListener('mouseenter', pauseAutoSlide)
        swiperEl.addEventListener('mouseleave', resumeAutoSlide)
      }
      
      // Start auto sliding
      startAutoSlide()
      
      return () => {
        if (timeoutId) clearTimeout(timeoutId)
        if (swiperEl) {
          swiperEl.removeEventListener('mouseenter', pauseAutoSlide)
          swiperEl.removeEventListener('mouseleave', resumeAutoSlide)
        }
      }
    }
  }, [inView])

  const productData = [
    {
      id: 'mustard',
      name: 'Pure Mustard Oil',
      fullName: 'Gold Mairani Kachi Ghani Pure Mustard Oil',
      subtitle: 'Swad Ka Powerful Blast!',
      description: 'Traditional cold-pressed purity for every Indian kitchen.',
      benefits: ['Cold-Pressed Purity', 'Rich in Omega-3', 'Traditional Method', 'No Additives'],
      accentColor: '#D32F2F',
      gradientBg: 'linear-gradient(180deg, rgba(211,47,47,0.13) 0%, rgba(211,47,47,0.03) 100%)',
      borderColor: 'rgba(211,47,47,0.30)',
      image: '/images/mustard850.png',
      poster: '/images/mustard_poster_1.png',
    },
    {
      id: 'soyabean',
      name: 'Refined Soya Oil',
      fullName: 'Gold Mairani Refined Soya Bean Oil',
      subtitle: 'Rich in Taste & Purity',
      description: 'Light, healthy & rich in essential nutrients for wholesome cooking.',
      benefits: ['Light & Healthy', 'Rich in Omega', 'Neutral Taste', 'High Smoke Point'],
      accentColor: '#4CAF50',
      gradientBg: 'linear-gradient(180deg, rgba(76,175,80,0.13) 0%, rgba(76,175,80,0.03) 100%)',
      borderColor: 'rgba(76,175,80,0.30)',
      image: '/images/soyabean850.png',
      poster: '/images/RefinedSoyaOil.jpeg',
    },
    {
      id: 'cottonseed',
      name: 'Refined Cottonseed Oil',
      fullName: 'Gold Mairani Refined Cottonseed Oil',
      subtitle: 'Pure & Light Cooking',
      description: 'Naturally light, pure and perfect for crispy, healthy frying.',
      benefits: ['Naturally Light', 'Perfect for Frying', 'Pure & Clean', 'Consistent Quality'],
      accentColor: '#FF9800',
      gradientBg: 'linear-gradient(180deg, rgba(255,152,0,0.13) 0%, rgba(255,152,0,0.03) 100%)',
      borderColor: 'rgba(255,152,0,0.30)',
      image: '/images/cottonseed850.png',
      poster: '/images/KitchenBg.jpeg',
    },
  ]

  return (
    <section className="product-carousels" id="products" ref={ref}>
      <motion.div
        className="section-container"
        initial={{ opacity: 0, y: 40 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Header */}
        <h2 className="section-title">
          Our <span className="gold-text">Premium Products</span>
        </h2>
        <p className="section-subtitle">
          Discover the Gold Mairani range — trusted quality for every Indian kitchen
        </p>

        {/* Horizontal Card Slider */}
        <div className="pc-slider-wrapper">
          <Swiper
            ref={swiperRef}
            modules={[Navigation, Pagination, FreeMode]}
            spaceBetween={28}
            slidesPerView={1.15}
            centeredSlides={false}
            loop={false}
            freeMode={{ enabled: true, sticky: false }}
            navigation={{
              nextEl: '.pc-next',
              prevEl: '.pc-prev',
            }}
            pagination={{ clickable: true, dynamicBullets: true, el: '.pc-pagination' }}
            breakpoints={{
              640:  { slidesPerView: 1.6, spaceBetween: 24 },
              900:  { slidesPerView: 2.2, spaceBetween: 28 },
              1200: { slidesPerView: 3,   spaceBetween: 32 },
            }}
            className="pc-swiper"
          >
            {productData.map((product, index) => (
              <SwiperSlide key={product.id}>
                <motion.div
                  className="pc-card"
                  initial={{ opacity: 0, y: 50 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.15 + index * 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  whileHover={{ y: -8, transition: { duration: 0.3 } }}
                  style={{
                    background: product.gradientBg,
                    borderColor: product.borderColor,
                  }}
                >
                  {/* Card Image */}
                  <div className="pc-card-image-wrap">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="pc-card-bottle"
                      loading="lazy"
                    />
                    {/* Glow under bottle */}
                    <div
                      className="pc-card-glow"
                      style={{ background: `radial-gradient(ellipse, ${product.borderColor} 0%, transparent 70%)` }}
                    />
                    {/* Top badge */}
                    <span
                      className="pc-card-badge"
                      style={{ color: product.accentColor, borderColor: product.borderColor, background: 'rgba(0,0,0,0.55)' }}
                    >
                      Gold Mairani
                    </span>
                  </div>

                  {/* Card Body */}
                  <div className="pc-card-body">
                    <h3 className="pc-card-name" style={{ color: product.accentColor }}>
                      {product.name}
                    </h3>
                    <p className="pc-card-tagline" style={{ color: product.accentColor }}>
                      {product.subtitle}
                    </p>
                    <p className="pc-card-desc">{product.description}</p>

                    {/* Benefits */}
                    <ul className="pc-card-benefits">
                      {product.benefits.map((b, i) => (
                        <li key={i} className="pc-benefit-item">
                          <span className="pc-benefit-dot" style={{ background: product.accentColor }} />
                          {b}
                        </li>
                      ))}
                    </ul>

                    <Link
                      to={`/product/${product.id}`}
                      className="pc-card-btn"
                      style={{ background: product.accentColor }}
                    >
                      View Details →
                    </Link>
                  </div>
                </motion.div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Custom Nav Buttons */}
          <button className="pc-nav-btn pc-prev" aria-label="Previous">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button className="pc-nav-btn pc-next" aria-label="Next">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>

        {/* Pagination dots */}
        <div className="pc-pagination" />

      </motion.div>
    </section>
  )
}

export default ProductCarousels
