import React, { useRef } from 'react'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination, EffectFade } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/effect-fade'
import '../styles/ProductCarousels.css'

const ProductCarousels = () => {
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true })

  const carouselData = [
    {
      id: 'mustard',
      title: 'Pure Mustard Oil',
      subtitle: 'Gold Mairani Kachi Ghani',
      accentColor: '#D32F2F',
      gradientBg: 'linear-gradient(135deg, #1a0505 0%, #2d0a0a 100%)',
      borderColor: 'rgba(211, 47, 47, 0.3)',
      posters: [
        { src: '/images/Slogan.jpeg', alt: 'Gold Mairani Mustard Oil - Swad Ka Powerful Blast' },
        { src: '/images/mustard_poster_1.png', alt: 'Gold Mairani Pure Mustard Oil' },
        { src: '/images/mustard_poster_2.png', alt: 'Gold Mairani Mustard Oil - Kitchen' },
        { src: '/images/mustard_poster_3.png', alt: 'Gold Mairani Mustard Oil - Gold Standard' },
      ]
    },
    {
      id: 'soyabean',
      title: 'Refined Soya Oil',
      subtitle: 'Rich in Taste & Purity',
      accentColor: '#4CAF50',
      gradientBg: 'linear-gradient(135deg, #051a05 0%, #0a2d0a 100%)',
      borderColor: 'rgba(76, 175, 80, 0.3)',
      posters: [
        { src: '/images/RefinedSoyaOil.jpeg', alt: 'Gold Mairani Refined Soya Oil' },
        { src: '/images/SoyaBeanOil.jpeg', alt: 'Gold Mairani Soya Bean Oil' },
        { src: '/images/soya_poster_1.png', alt: 'Gold Mairani Soya Oil - Rich in Taste' },
        { src: '/images/soya_poster_2.png', alt: 'Gold Mairani Soya Oil - Family' },
        { src: '/images/soya_poster_3.png', alt: 'Gold Mairani Soya Oil - Farm' },
      ]
    },
    {
      id: 'cottonseed',
      title: 'Refined Cottonseed Oil',
      subtitle: 'Pure & Light Cooking',
      accentColor: '#FF9800',
      gradientBg: 'linear-gradient(135deg, #1a0e00 0%, #2d1a05 100%)',
      borderColor: 'rgba(255, 152, 0, 0.3)',
      posters: [
        { src: '/images/KitchenBg.jpeg', alt: 'Gold Mairani Cottonseed Oil Kitchen' },
        { src: '/images/cotton_poster_1.png', alt: 'Gold Mairani Cottonseed Oil' },
        { src: '/images/cotton_poster_2.png', alt: 'Gold Mairani Cottonseed Oil - Lifestyle' },
        { src: '/images/cotton_poster_3.png', alt: 'Gold Mairani Cottonseed Oil - Nature' },
      ]
    }
  ]

  return (
    <section className="product-carousels" id="products" ref={ref}>
      <motion.div
        className="section-container"
        initial={{ opacity: 0, y: 40 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <h2 className="section-title">
          Our <span className="gold-text">Premium Products</span>
        </h2>
        <p className="section-subtitle">
          Discover the Gold Mairani range — trusted quality for every Indian kitchen
        </p>

        <div className="carousels-grid">
          {carouselData.map((carousel, i) => (
            <motion.div
              key={carousel.id}
              className="carousel-card"
              initial={{ opacity: 0, y: 50 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2 + i * 0.15, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              style={{
                background: carousel.gradientBg,
                borderColor: carousel.borderColor
              }}
            >
              {/* Carousel Header */}
              <div className="carousel-header">
                <div className="carousel-dot" style={{ background: carousel.accentColor }} />
                <div>
                  <h3 className="carousel-title" style={{ color: carousel.accentColor }}>
                    {carousel.title}
                  </h3>
                  <p className="carousel-subtitle">{carousel.subtitle}</p>
                </div>
              </div>

              {/* Swiper Carousel */}
              <div className="carousel-swiper-wrapper">
                <Swiper
                  modules={[Autoplay, Pagination]}
                  spaceBetween={0}
                  slidesPerView={1}
                  loop={true}
                  autoplay={{
                    delay: 3000 + i * 500,
                    disableOnInteraction: false,
                  }}
                  pagination={{
                    clickable: true,
                    dynamicBullets: true,
                  }}
                  className={`product-swiper product-swiper-${carousel.id}`}
                >
                  {carousel.posters.map((poster, j) => (
                    <SwiperSlide key={j}>
                      <div className="carousel-slide">
                        <img
                          src={poster.src}
                          alt={poster.alt}
                          className="carousel-poster"
                          loading="lazy"
                        />
                        <div 
                          className="carousel-poster-overlay"
                          style={{
                            background: `linear-gradient(to top, ${carousel.accentColor}33 0%, transparent 60%)`
                          }}
                        />
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  )
}

export default ProductCarousels
