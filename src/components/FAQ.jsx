import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './FAQ.css';

const faqs = [
  {
    question: "What makes Gold Mairani Kachi Ghani Mustard Oil different?",
    answer: "Our Kachi Ghani Mustard Oil is extracted using the traditional cold-pressed method, which retains its natural pungency, rich aroma, and essential nutrients like Omega-3 and Omega-6 fatty acids. It has no added chemicals or preservatives, ensuring 100% purity."
  },
  {
    question: "Can I use Refined Soya Bean Oil for deep frying?",
    answer: "Yes, absolutely! Gold Mairani Refined Soya Bean Oil has a high smoke point and a light, neutral flavor, making it perfect for deep frying, sautéing, and everyday cooking without altering the taste of your food."
  },
  {
    question: "What is the shelf life of Gold Mairani oils?",
    answer: "Our edible oils generally have a shelf life of 9 to 12 months when stored properly. For the best quality, we recommend keeping them in a cool, dry place away from direct sunlight."
  },
  {
    question: "Are Gold Mairani products FSSAI certified?",
    answer: "Yes, all our products undergo rigorous quality checks and are strictly FSSAI certified. We adhere to the highest food safety and hygiene standards during manufacturing and packaging."
  },
  {
    question: "Is Cottonseed Oil good for baking?",
    answer: "Yes, Gold Mairani Refined Cottonseed Oil is excellent for baking as well as frying. It is naturally light, enhances the crispiness of fried foods, and has a very clean taste, making it highly versatile for various culinary needs."
  }
];

const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section className="faq-section" id="faq">
      <div className="faq-header">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Frequently Asked Questions
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          Everything you need to know about our premium edible oils and their uses.
        </motion.p>
      </div>

      <div className="faq-container">
        {faqs.map((faq, index) => (
          <motion.div 
            key={index} 
            className="faq-item"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <button 
              className="faq-question" 
              onClick={() => toggleFAQ(index)}
            >
              {faq.question}
              <motion.span 
                className="faq-icon"
                animate={{ rotate: activeIndex === index ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </motion.span>
            </button>
            <AnimatePresence>
              {activeIndex === index && (
                <motion.div 
                  className="faq-answer-wrapper"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="faq-answer">
                    {faq.answer}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default FAQ;
