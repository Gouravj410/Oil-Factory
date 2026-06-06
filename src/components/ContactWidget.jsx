import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './ContactWidget.css';

const ContactWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    state: '',
    city: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const response = await fetch('http://localhost:5000/api/contact/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (data.success) {
        setIsSuccess(true);
        setFormData({ name: '', email: '', phone: '', state: '', city: '', message: '' });
        setTimeout(() => {
          setIsOpen(false);
          setIsSuccess(false);
        }, 3000);
      } else {
        setErrorMsg(data.message || 'Failed to send message.');
      }
    } catch (err) {
      setErrorMsg('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="contact-widget-container">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="contact-popup"
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ duration: 0.3 }}
          >
            <div className="contact-popup-header">
              <h3>Have any questions?</h3>
              <button className="contact-close-btn" onClick={() => setIsOpen(false)}>&times;</button>
            </div>
            <div className="contact-popup-body">
              {isSuccess ? (
                <div className="contact-success-msg">
                  <p>Thank you! Your message has been sent.</p>
                  <p>We'll get back to you soon.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <input type="text" name="name" placeholder="Name *" required value={formData.name} onChange={handleChange} />
                  <input type="email" name="email" placeholder="Email *" required value={formData.email} onChange={handleChange} />
                  <input type="tel" name="phone" placeholder="Phone *" required value={formData.phone} onChange={handleChange} />
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input type="text" name="state" placeholder="State" value={formData.state} onChange={handleChange} />
                    <input type="text" name="city" placeholder="City" value={formData.city} onChange={handleChange} />
                  </div>
                  <textarea name="message" placeholder="Message *" required value={formData.message} onChange={handleChange}></textarea>
                  {errorMsg && <p style={{ color: 'red', fontSize: '0.85rem', margin: 0 }}>{errorMsg}</p>}
                  <button type="submit" className="contact-submit-btn" disabled={isSubmitting}>
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        className="contact-floating-btn"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={{
          y: [0, -10, 0],
        }}
        transition={{
          y: {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }
        }}
      >
        {isOpen ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        )}
      </motion.button>
    </div>
  );
};

export default ContactWidget;
