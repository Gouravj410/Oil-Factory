import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'
import '../styles/ProductDetail.css'

const ProductDetail = () => {
  const { id } = useParams()

  const products = {
    mustard: {
      name: 'Pure Mustard Oil',
      fullName: 'Gold Mairani Kachi Ghani Pure Mustard Oil',
      tagline: 'Swad Ka Powerful Blast!',
      accentColor: '#D32F2F',
      description: 'Gold Mairani Kachi Ghani Pure Mustard Oil is crafted using traditional cold-pressed methods to deliver authentic, unadulterated quality. Extracted from premium mustard seeds, this oil retains all natural nutrients and the distinctive pungent flavor that enhances every Indian dish.',
      features: [
        'Cold-Pressed (Kachi Ghani) Method',
        'Rich in Omega-3 Fatty Acids',
        'Traditional Extraction Process',
        'No Chemicals or Additives',
        'FSSAI Certified',
        'Perfect for Tempering & Cooking'
      ],
      benefits: [
        'Supports Heart Health',
        'Anti-inflammatory Properties',
        'Rich in Natural Antioxidants',
        'Enhances Digestion',
        'Traditional Cooking Essential'
      ],
      packagingTypes: [
        { type: 'Plastic Bottle', size: '500 ML', image: '/images/mustard_oil_bottle.png', description: 'Convenient for daily use' },
        { type: 'Plastic Bottle', size: '1 Liter', image: '/images/mustard_oil_bottle.png', description: 'Perfect for families' },
        { type: 'Can', size: '5 Liter', image: '/images/MustardOilCan.jpg', description: 'Bulk storage solution' }
      ],
      images: [
        '/images/mustard_oil_bottle.png',
        '/images/mustard_poster_1.png',
        '/images/mustard_poster_2.png'
      ]
    },
    soyabean: {
      name: 'Refined Soya Oil',
      fullName: 'Gold Mairani Refined Soya Bean Oil',
      tagline: 'Rich in Taste & Purity',
      accentColor: '#4CAF50',
      description: 'Gold Mairani Refined Soya Bean Oil is a light, healthy cooking oil extracted from premium soya beans and refined using modern techniques. With a neutral taste and high smoke point, it\'s perfect for everyday cooking, frying, and sautéing across all Indian cuisines.',
      features: [
        'Light & Neutral Taste',
        'Rich in Omega Fatty Acids',
        'High Smoke Point',
        'Modern Refinery Process',
        'FSSAI Certified',
        'Suitable for All Cooking Methods'
      ],
      benefits: [
        'Heart-Healthy Oil',
        'Rich in Essential Nutrients',
        'Supports Brain Health',
        'Promotes Healthy Skin',
        'Versatile for All Dishes'
      ],
      packagingTypes: [
        { type: 'Plastic Bottle', size: '500 ML', image: '/images/soyabean_oil_bottle.png', description: 'Convenient for daily use' },
        { type: 'Plastic Bottle', size: '1 Liter', image: '/images/soyabean_oil_bottle.png', description: 'Perfect for families' },
        { type: 'Can', size: '5 Liter', image: '/images/MustardOilCan.jpg', description: 'Bulk storage solution' }
      ],
      images: [
        '/images/soyabean_oil_bottle.png',
        '/images/soya_poster_1.png',
        '/images/soya_poster_2.png'
      ]
    },
    cottonseed: {
      name: 'Refined Cottonseed Oil',
      fullName: 'Gold Mairani Refined Cottonseed Oil',
      tagline: 'Pure & Light Cooking',
      accentColor: '#FF9800',
      description: 'Gold Mairani Refined Cottonseed Oil is naturally light and pure, extracted from premium cotton seeds. It\'s ideal for crispy frying, baking, and everyday cooking. The refined process ensures consistent quality, purity, and a clean taste in every bottle.',
      features: [
        'Naturally Light Oil',
        'Perfect for Deep Frying',
        'Pure & Clean Extraction',
        'Consistent Quality',
        'FSSAI Certified',
        'Ideal for Bakery Products'
      ],
      benefits: [
        'Natural Light Texture',
        'Creates Crispy Results',
        'Excellent for Frying',
        'Pure & Additive-Free',
        'Long Shelf Life'
      ],
      packagingTypes: [
        { type: 'Plastic Bottle', size: '500 ML', image: '/images/cottonseed_oil_bottle.png', description: 'Convenient for daily use' },
        { type: 'Plastic Bottle', size: '1 Liter', image: '/images/cottonseed_oil_bottle.png', description: 'Perfect for families' },
        { type: 'Can', size: '5 Liter', image: '/images/MustardOilCan.jpg', description: 'Bulk storage solution' }
      ],
      images: [
        '/images/cottonseed_oil_bottle.png',
        '/images/cotton_poster_1.png',
        '/images/cotton_poster_2.png'
      ]
    }
  }

  const product = products[id]

  if (!product) {
    return (
      <div className="product-not-found">
        <h1>Product Not Found</h1>
        <Link to="/">Back to Home</Link>
      </div>
    )
  }

  return (
    <section className="product-detail-page">
      {/* Hero Section */}
      <motion.div
        className="product-hero"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        style={{ background: `linear-gradient(135deg, ${product.accentColor}15 0%, ${product.accentColor}05 100%)` }}
      >
        <div className="product-hero-content">
          <Link to="/#products" className="back-link">
            ← Back to Home
          </Link>
          
          <motion.h1
            className="product-hero-title"
            style={{ color: product.accentColor }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            {product.name}
          </motion.h1>

          <motion.p
            className="product-hero-tagline"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            {product.tagline}
          </motion.p>

          <motion.p
            className="product-hero-subtitle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            {product.fullName}
          </motion.p>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="product-container">
        {/* Image Gallery */}
        <motion.div
          className="product-image-section"
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <Swiper
            modules={[Autoplay, Pagination]}
            spaceBetween={0}
            slidesPerView={1}
            loop={true}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
            }}
            pagination={{
              clickable: true,
            }}
            className="product-detail-swiper"
          >
            {product.images.map((image, i) => (
              <SwiperSlide key={i}>
                <div className="product-image-slide">
                  <img src={image} alt={`${product.name} - ${i + 1}`} />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </motion.div>

        {/* Description Section */}
        <motion.div
          className="product-info-section"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <h2 className="product-info-title">About This Product</h2>
          <p className="product-description">{product.description}</p>

          {/* Features */}
          <div className="product-features">
            <h3 className="features-title" style={{ color: product.accentColor }}>Key Features</h3>
            <ul className="features-list">
              {product.features.map((feature, i) => (
                <li key={i}>
                  <span className="feature-dot" style={{ background: product.accentColor }} />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* Benefits */}
          <div className="product-benefits">
            <h3 className="benefits-title" style={{ color: product.accentColor }}>Health Benefits</h3>
            <ul className="benefits-list">
              {product.benefits.map((benefit, i) => (
                <li key={i}>
                  <span className="benefit-dot" style={{ background: product.accentColor }} />
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </div>

      {/* Packaging Types Section */}
      <motion.div
        className="product-packing-section"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        <h2 className="packing-title">Available Packaging</h2>
        <p className="packing-subtitle">Choose the perfect packaging for your needs</p>

        <div className="packing-grid">
          {product.packagingTypes.map((pack, i) => (
            <motion.div
              key={i}
              className="packing-card"
              whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}
              transition={{ duration: 0.3 }}
              style={{ borderTopColor: product.accentColor }}
            >
              <div className="packing-image">
                <img src={pack.image} alt={`${pack.type} ${pack.size}`} />
              </div>
              <div className="packing-type">{pack.type}</div>
              <div className="packing-size">{pack.size}</div>
              <div className="packing-description">{pack.description}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* CTA Section */}
      <motion.div
        className="product-cta-section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        style={{ background: `linear-gradient(135deg, ${product.accentColor}20 0%, ${product.accentColor}05 100%)` }}
      >
        <h2>Ready to Experience Gold Mairani Quality?</h2>
        <p>Find our products at your nearest retailers or order online</p>
        <div className="cta-buttons">
          <button className="cta-btn-primary" style={{ background: product.accentColor }}>
            Order Now
          </button>
          <Link to="/#products" className="cta-btn-secondary">
            Back to Home
          </Link>
        </div>
      </motion.div>
    </section>
  )
}

export default ProductDetail
