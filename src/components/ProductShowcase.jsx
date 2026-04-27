import React, { useRef } from 'react'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import '../styles/ProductShowcase.css'

const ProductShowcase = () => {
  const { ref, inView } = useInView({
    threshold: 0.2,
    triggerOnce: true
  })

  const scrollContainerRef = useRef(null)

  // Product data with real bottle images
  const products = [
    {
      id: 1,
      name: 'Refined Soya Oil',
      image: '/images/RefinedSoyaOil.jpeg',
      description: 'Premium refined soya oil',
      bgColor: '#FFF8DC'
    },
    {
      id: 2,
      name: 'Soya Bean Oil',
      image: '/images/SoyaBeanOil.jpeg',
      description: 'High quality soya bean oil',
      bgColor: '#F0FFF0'
    },
    {
      id: 3,
      name: 'Kitchen Background',
      image: '/images/KitchenBg.jpeg',
      description: 'Perfect for every kitchen',
      bgColor: '#FFFACD'
    },
    {
      id: 4,
      name: 'Company Slogan',
      image: '/images/Slogan.jpeg',
      description: 'Our promise to you',
      bgColor: '#E8F5E9'
    },
    {
      id: 5,
      name: 'Company Logo',
      image: '/images/logo.jpeg',
      description: 'Our brand identity',
      bgColor: '#FFF3E0'
    }
  ]

  // Container animation
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }

  // Product card animation
  const productVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.6,
        ease: 'easeOut'
      }
    })
  }

  // Use the first product as the featured product
  const featuredProduct = products[0]

  return (
    <section className="product-showcase" ref={ref}>
      <motion.div 
        className="showcase-container showcase-container-centered"
        variants={containerVariants}
        initial="hidden"
        animate={inView ? 'visible' : 'hidden'}
      >
        {/* Featured bottle display with name behind */}
        <div 
          className="featured-bottle-wrapper"
          style={{ backgroundColor: featuredProduct.bgColor }}
        >
          {/* Background text name */}
          <motion.div 
            className="bottle-name-background"
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {featuredProduct.name}
          </motion.div>

          {/* Featured bottle image */}
          <motion.div 
            className="featured-bottle"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            whileHover={{ scale: 1.05 }}
          >
            <img 
              src={featuredProduct.image}
              alt={featuredProduct.name}
              className="bottle-image"
            />
          </motion.div>
        </div>

        {/* Product info below bottle */}
        <motion.div 
          className="featured-product-info"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <h3 className="featured-product-name">{featuredProduct.name}</h3>
          <p className="featured-product-desc">{featuredProduct.description}</p>
        </motion.div>

        {/* Product Gallery Grid */}
        <motion.div 
          className="products-gallery"
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
        >
          <h2 className="gallery-title">Our Collection</h2>
          <div className="products-grid">
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                className="product-card"
                style={{ backgroundColor: product.bgColor }}
                variants={productVariants}
                custom={index}
                whileHover={{ y: -10 }}
              >
                <div className="product-image-container">
                  <img 
                    src={product.image}
                    alt={product.name}
                    className="product-card-image"
                  />
                </div>
                <h4 className="product-card-name">{product.name}</h4>
                <p className="product-card-desc">{product.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}

export default ProductShowcase
