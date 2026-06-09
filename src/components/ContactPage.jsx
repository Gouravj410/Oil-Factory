import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './ContactPage.css';

const ContactPage = () => {
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

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
    <section className="contact-page">
      <div className="contact-page-header">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="contact-logo-container"
          style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center' }}
        >
          <motion.img 
            src="./images/logo.jpeg" 
            alt="Mateshwari Logo" 
            style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Get In Touch With Us
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          Have questions about our products or distribution? We'd love to hear from you.
        </motion.p>
      </div>

      <motion.div 
        className="contact-page-content"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="contact-map-section">
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14008.114827184312!2d77.2090212!3d28.6139391!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390cfd5b347eb62d%3A0x52c2b7494e204dce!2sNew%20Delhi%2C%20Delhi!5e0!3m2!1sen!2sin!4v1709230000000!5m2!1sen!2sin" 
            allowFullScreen="" 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
            title="Google Maps Location"
          ></iframe>
        </div>
        
        <div className="contact-form-section">
          <h2>Send us a Message</h2>
          
          {isSuccess ? (
            <motion.div 
              className="contact-page-success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <h3>Thank You!</h3>
              <p>Your message has been successfully sent. Our team will get back to you shortly.</p>
              <button 
                className="contact-page-submit" 
                style={{ marginTop: '20px' }}
                onClick={() => setIsSuccess(false)}
              >
                Send Another Message
              </button>
            </motion.div>
          ) : (
            <form className="contact-page-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <input type="text" name="name" placeholder="Full Name *" required value={formData.name} onChange={handleChange} />
                <input type="email" name="email" placeholder="Email Address *" required value={formData.email} onChange={handleChange} />
              </div>
              <div className="form-row">
                <input type="tel" name="phone" placeholder="Phone Number *" required value={formData.phone} onChange={handleChange} />
              </div>
              <div className="form-row">
                <input type="text" name="state" placeholder="State" value={formData.state} onChange={handleChange} />
                <input type="text" name="city" placeholder="City" value={formData.city} onChange={handleChange} />
              </div>
              <textarea name="message" placeholder="Your Message *" required value={formData.message} onChange={handleChange}></textarea>
              
              {errorMsg && <p style={{ color: 'red', fontSize: '0.9rem', margin: 0 }}>{errorMsg}</p>}
              
              <button type="submit" className="contact-page-submit" disabled={isSubmitting}>
                {isSubmitting ? 'Sending Message...' : 'Send Message'}
              </button>
            </form>
          )}
        </div>
      </motion.div>

      <motion.div 
        className="contact-info-cards"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <div className="info-card">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
          </svg>
          <h3>Phone</h3>
          <p>+91 98765 43210</p>
          <p>Mon-Fri, 9am - 6pm</p>
        </div>
        
        <div className="info-card">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
            <polyline points="22,6 12,13 2,6"></polyline>
          </svg>
          <h3>Email</h3>
          <p>info@goldmairani.com</p>
          <p>support@goldmairani.com</p>
        </div>
        
        <div className="info-card">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          <h3>Head Office</h3>
          <p>Industrial Area Phase 1</p>
          <p>New Delhi, 110020, India</p>
        </div>
      </motion.div>
    </section>
  );
};

export default ContactPage;
