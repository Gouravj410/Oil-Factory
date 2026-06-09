import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import './ContactWidget.css';

const ContactWidget = () => {
  const navigate = useNavigate();

  return (
    <div className="contact-widget-container">
      <motion.div 
        className="contact-widget-tagline"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1, duration: 0.5 }}
      >
        <span className="tagline-text">Need Help? Chat with us!</span>
        <span className="tagline-pointer"></span>
      </motion.div>

      <motion.button
        className="contact-floating-btn"
        onClick={() => {
          navigate('/contact');
          window.scrollTo(0, 0);
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={{
          y: [0, -10, 0],
          boxShadow: [
            "0px 4px 15px rgba(211, 84, 0, 0.4)",
            "0px 10px 25px rgba(211, 84, 0, 0.6)",
            "0px 4px 15px rgba(211, 84, 0, 0.4)"
          ]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <motion.div
          animate={{
            rotate: [0, -10, 10, -10, 10, 0]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            repeatDelay: 3
          }}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <img 
            src="./images/logo.jpeg" 
            alt="Mateshwari Logo" 
            style={{ width: '55px', height: '55px', borderRadius: '50%', objectFit: 'cover', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }} 
          />
        </motion.div>
      </motion.button>
    </div>
  );
};

export default ContactWidget;
