import React from 'react'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import '../styles/HealthBenefits.css'

const HealthBenefits = () => {
  const { ref, inView } = useInView({ threshold: 0.2, triggerOnce: true })

  const benefits = [
    {
      title: "Fortified with Vitamins",
      icon: "",
      desc: "Enriched with Vitamin A and D to support your immunity, vision, and bone health every single day."
    },
    {
      title: "Heart-Healthy Omega 3 & 6",
      icon: "",
      desc: "Our oils maintain the perfect balance of MUFA and PUFA, helping maintain healthy cholesterol levels."
    },
    {
      title: "Zero Trans-Fat",
      icon: "",
      desc: "Processed with state-of-the-art European technology to ensure 100% trans-fat-free purity."
    },
    {
      title: "Antioxidant Rich",
      icon: "",
      desc: "Retains natural tocopherols (Vitamin E) which act as powerful antioxidants for healthy skin."
    }
  ]

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
              <img src="./images/MustardOilCan.png" alt="Gold Mairani Quality" className="health-can-img" />
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
